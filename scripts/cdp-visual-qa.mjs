import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const chromePort = Number(process.env.CDP_PORT ?? 9237);
const appUrl = process.env.QA_URL ?? "http://127.0.0.1:4187";
const outputDir = resolve(process.env.QA_OUTPUT_DIR ?? "qa-artifacts");

const viewports = [
  { name: "desktop", width: 1366, height: 768, mobile: false, scale: 1 },
  { name: "mobile", width: 390, height: 844, mobile: true, scale: 3 },
];

let nextId = 1;

async function requestJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed ${response.status}: ${url}`);
  }
  return response.json();
}

async function createTab() {
  const tabs = await requestJson(`http://127.0.0.1:${chromePort}/json/list`);
  const existingTab =
    tabs.find((tab) => tab.type === "page" && tab.url?.startsWith(appUrl)) ??
    tabs.find((tab) => tab.type === "page");
  if (existingTab?.webSocketDebuggerUrl) {
    return existingTab.webSocketDebuggerUrl;
  }

  const response = await fetch(
    `http://127.0.0.1:${chromePort}/json/new?${encodeURIComponent(appUrl)}`,
    { method: "PUT" },
  );
  if (!response.ok) {
    throw new Error(`Unable to create Chrome tab: ${response.status}`);
  }
  const tab = await response.json();
  return tab.webSocketDebuggerUrl;
}

function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl);
  const pending = new Map();
  const events = [];

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve: resolvePending, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) {
        reject(new Error(`${message.error.message}: ${message.error.data ?? ""}`));
        return;
      }
      resolvePending(message.result ?? {});
      return;
    }
    events.push(message);
  });

  return new Promise((resolveSocket, rejectSocket) => {
    socket.addEventListener("open", () => {
      const send = (method, params = {}) =>
        new Promise((resolvePending, reject) => {
          const id = nextId++;
          pending.set(id, { resolve: resolvePending, reject });
          socket.send(JSON.stringify({ id, method, params }));
        });

      resolveSocket({ events, send, socket });
    });
    socket.addEventListener("error", rejectSocket);
  });
}

async function waitForPage(send) {
  await send("Runtime.evaluate", {
    expression: `
      new Promise((resolve) => {
        if (document.readyState === "complete") {
          requestAnimationFrame(() => requestAnimationFrame(resolve));
        } else {
          window.addEventListener("load", () => {
            requestAnimationFrame(() => requestAnimationFrame(resolve));
          }, { once: true });
        }
      })
    `,
    awaitPromise: true,
  });
  await send("Runtime.evaluate", {
    expression: `
      new Promise((resolve) => {
        const startedAt = Date.now();
        const check = () => {
          const gameRoot = document.querySelector('[data-ocid="game.root"]');
          if (!gameRoot || window.__EQ_ASSETS_READY || Date.now() - startedAt > 4500) {
            requestAnimationFrame(() => requestAnimationFrame(resolve));
            return;
          }
          setTimeout(check, 80);
        };
        check();
      })
    `,
    awaitPromise: true,
  });
}

async function navigateTo(send, url) {
  await send("Page.navigate", { url });
  await send("Runtime.evaluate", {
    expression: "new Promise((resolve) => setTimeout(resolve, 850))",
    awaitPromise: true,
  });
  await waitForPage(send);
  await send("Page.bringToFront");
  await send("Runtime.evaluate", {
    expression: `
      (() => {
        window.focus();
        document.querySelector('[data-ocid="game.canvas_target"]')?.click();
      })()
    `,
  });
}

async function captureState(send, events, viewportName, stateName) {
  await waitForPage(send);
  await send("Runtime.evaluate", {
    expression:
      "new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
    awaitPromise: true,
  });

  const firstRelevantEvent = events.length;
  const diagnosticsResult = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `
      (() => {
        const canvas = document.querySelector('[data-ocid="game.canvas_target"]');
        const root = document.querySelector('[data-ocid="game.root"]');
        const header = document.querySelector('header');
        const titleOverlay = document.querySelector('.eq-title-screen');
        const dialogue = document.querySelector('.eq-dialogue');
        const panel = document.querySelector('.eq-panel');
        const title = document.body.innerText.slice(0, 1200);
        const visibleButtons = [...document.querySelectorAll('button')]
          .filter((button) => {
            const rect = button.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
          })
          .map((button) => button.innerText.trim() || button.getAttribute('aria-label'));
        const rect = canvas?.getBoundingClientRect();
        const headerRect = header?.getBoundingClientRect();
        const titleRect = titleOverlay?.getBoundingClientRect();
        return {
          url: location.href,
          title: document.title,
          viewport: { width: innerWidth, height: innerHeight },
          bodyScroll: { width: document.body.scrollWidth, height: document.body.scrollHeight },
          root: root ? root.getBoundingClientRect().toJSON() : null,
          canvas: rect ? rect.toJSON() : null,
          header: headerRect ? headerRect.toJSON() : null,
          titleOverlay: titleRect ? titleRect.toJSON() : null,
          qaState: window.__EQ_QA_STATE ?? null,
          hasDialogue: Boolean(dialogue),
          hasPanel: Boolean(panel),
          visibleButtons,
          text: title,
        };
      })()
    `,
  });

  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });

  const screenshotPath = join(outputDir, `${viewportName}-${stateName}.png`);
  await writeFile(screenshotPath, Buffer.from(screenshot.data, "base64"));

  return {
    state: stateName,
    screenshotPath,
    diagnostics: diagnosticsResult.result.value,
    eventOffset: firstRelevantEvent,
  };
}

async function holdKey(send, key, code, milliseconds) {
  const keyCodes = {
    ArrowDown: 40,
    ArrowLeft: 37,
    ArrowRight: 39,
    ArrowUp: 38,
    Enter: 13,
    KeyE: 69,
    Space: 32,
  };
  await send("Input.dispatchKeyEvent", {
    type: "keyDown",
    key,
    code,
    windowsVirtualKeyCode: keyCodes[key] ?? 0,
  });
  await send("Runtime.evaluate", {
    expression: `new Promise((resolve) => setTimeout(resolve, ${milliseconds}))`,
    awaitPromise: true,
  });
  await send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key,
    code,
    windowsVirtualKeyCode: keyCodes[key] ?? 0,
  });
}

async function pressInteract(send) {
  await holdKey(send, "e", "KeyE", 80);
}

async function clickButtonIncluding(send, text, options = {}) {
  const { exact = false } = options;
  const result = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `
      (() => {
        const expected = ${JSON.stringify(text)}.toLowerCase();
        const buttons = [...document.querySelectorAll('button')];
        const button = buttons.find((item) => {
          if (item.disabled) {
            return false;
          }
          const label = (item.innerText || item.getAttribute('aria-label') || '').toLowerCase();
          return ${exact ? "label === expected" : "label.includes(expected)"};
        });
        if (!button) {
          return false;
        }
        button.click();
        return true;
      })()
    `,
  });
  if (!result.result.value) {
    throw new Error(`Unable to click visible button containing: ${text}`);
  }
  await send("Runtime.evaluate", {
    expression: "new Promise((resolve) => setTimeout(resolve, 260))",
    awaitPromise: true,
  });
}

async function waitForOverlay(send, overlay, message) {
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const state = await getQaState(send);
    if (state?.overlay === overlay) {
      return state;
    }
    await send("Runtime.evaluate", {
      expression: "new Promise((resolve) => setTimeout(resolve, 100))",
      awaitPromise: true,
    });
  }
  return assertQaState(send, (state) => state?.overlay === overlay, message);
}

async function holdJoystick(send, xDirection, yDirection, milliseconds) {
  const joystick = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: `
      (() => {
        const element = document.querySelector('.eq-joystick');
        if (!element) {
          return null;
        }
        const rect = element.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      })()
    `,
  });
  const center = joystick.result.value;
  if (!center) {
    throw new Error("Mobile joystick was not found for QA movement");
  }

  const target = {
    x: center.x + xDirection * 36,
    y: center.y + yDirection * 36,
  };
  await send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x: center.x,
    y: center.y,
    button: "left",
    clickCount: 1,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: target.x,
    y: target.y,
    button: "left",
  });
  await send("Runtime.evaluate", {
    expression: `new Promise((resolve) => setTimeout(resolve, ${milliseconds}))`,
    awaitPromise: true,
  });
  await send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x: target.x,
    y: target.y,
    button: "left",
    clickCount: 1,
  });
}

async function moveForViewport(send, viewport, key, code, milliseconds) {
  if (!viewport.mobile) {
    await holdKey(send, key, code, milliseconds);
    return;
  }

  const directions = {
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
  };
  const direction = directions[key];
  if (!direction) {
    throw new Error(`Unsupported mobile QA direction: ${key}`);
  }
  await holdJoystick(send, direction[0], direction[1], milliseconds);
}

async function getQaState(send) {
  const result = await send("Runtime.evaluate", {
    returnByValue: true,
    expression: "window.__EQ_QA_STATE ?? null",
  });
  return result.result.value;
}

async function assertQaState(send, predicate, message) {
  const state = await getQaState(send);
  if (!predicate(state)) {
    throw new Error(`${message}. Current QA state: ${JSON.stringify(state)}`);
  }
  return state;
}

async function moveUntil(send, viewport, key, code, predicate, options = {}) {
  const {
    chunkMs = viewport.mobile ? 260 : 180,
    maxSteps = 36,
    message = `Movement did not reach expected state for ${key}`,
  } = options;

  for (let step = 0; step < maxSteps; step += 1) {
    const state = await getQaState(send);
    if (predicate(state)) {
      return state;
    }
    await moveForViewport(send, viewport, key, code, chunkMs);
  }

  return assertQaState(send, predicate, message);
}

async function moveToCoordinate(send, viewport, target, options = {}) {
  const {
    tolerance = viewport.mobile ? 0.32 : 0.22,
    maxAxisSteps = 46,
    message = `Player did not reach coordinate ${JSON.stringify(target)}`,
  } = options;

  const moveAxis = async (axis) => {
    const state = await getQaState(send);
    const current = state?.position?.[axis];
    if (typeof current !== "number") {
      throw new Error(`${message}. Missing QA position.`);
    }
    const goingPositive = target[axis] > current;
    const key =
      axis === "x"
        ? goingPositive
          ? "ArrowRight"
          : "ArrowLeft"
        : goingPositive
          ? "ArrowDown"
          : "ArrowUp";
    await moveUntil(
      send,
      viewport,
      key,
      key,
      (nextState) => {
        const value = nextState?.position?.[axis];
        if (typeof value !== "number") {
          return false;
        }
        if (goingPositive) {
          return value >= target[axis] - tolerance;
        }
        return value <= target[axis] + tolerance;
      },
      {
        chunkMs: viewport.mobile ? 105 : 70,
        maxSteps: maxAxisSteps,
        message,
      },
    );
  };

  await moveAxis("x");
  await moveAxis("y");
}

async function moveThrough(send, viewport, waypoints) {
  for (const waypoint of waypoints) {
    await moveToCoordinate(send, viewport, waypoint);
  }
}

async function advanceDialogueToEnd(send) {
  await waitForOverlay(send, "dialogue", "Dialogue did not open");
  await assertQaState(
    send,
    (state) => state?.dialogue?.lineIndex === 0,
    "Dialogue did not start on line 1",
  );

  for (let step = 0; step < 6; step += 1) {
    const state = await getQaState(send);
    if (state?.overlay === "none") {
      return;
    }
    await clickButtonIncluding(send, "Continue");
  }

  await assertQaState(
    send,
    (state) => state?.overlay === "none",
    "Dialogue did not close after the final line",
  );
}

async function collectEvidence(send, viewport, waypoints, signalText, count) {
  await moveThrough(send, viewport, waypoints);
  await pressInteract(send);
  await waitForOverlay(send, "evidence", "Evidence panel did not open");
  await clickButtonIncluding(send, signalText);
  await clickButtonIncluding(send, "Continue investigation");
  await assertQaState(
    send,
    (state) => state?.collectedEvidenceIds?.length === count,
    `Evidence count did not update to ${count}`,
  );
}

async function completeOnboardingCase(send, viewport) {
  await moveThrough(send, viewport, [
    { x: 6.7, y: 10.25 },
    { x: 6.7, y: 6.9 },
    { x: 9.35, y: 6.9 },
    { x: 9.35, y: 5.75 },
  ]);
  await pressInteract(send);
  await advanceDialogueToEnd(send);
  await assertQaState(
    send,
    (state) => state?.questStage === "investigate",
    "Talking to Maya did not advance to investigate",
  );

  await collectEvidence(
    send,
    viewport,
    [
      { x: 9.6, y: 7.05 },
      { x: 4.35, y: 7.05 },
    ],
    "workflow and reinforcement signal",
    1,
  );
  await collectEvidence(
    send,
    viewport,
    [
      { x: 6.4, y: 7.05 },
      { x: 6.4, y: 10.1 },
      { x: 8.85, y: 10.1 },
    ],
    "Multiple handoffs create delay",
    2,
  );
  await collectEvidence(
    send,
    viewport,
    [
      { x: 16, y: 10.25 },
      { x: 16, y: 6.7 },
      { x: 13.55, y: 6.7 },
    ],
    "spike happens after formal training",
    3,
  );

  await waitForOverlay(send, "decision", "Decision panel did not open");
  await assertQaState(
    send,
    (state) => state?.questStage === "diagnose",
    "All evidence did not advance the quest to diagnose",
  );
  await clickButtonIncluding(send, "workflow is unclear");
  await assertQaState(
    send,
    (state) => state?.questStage === "design",
    "Correct diagnosis did not advance to design",
  );
  await clickButtonIncluding(send, "manager checklist");
  await waitForOverlay(send, "canvas", "Canvas panel did not open");
  await assertQaState(
    send,
    (state) =>
      state?.questStage === "complete" &&
      state.completedCaseIds?.includes("onboarding"),
    "Correct intervention did not complete onboarding case",
  );
}

async function runViewport(client, viewport) {
  const { send, events } = client;

  events.length = 0;
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.scale,
    mobile: viewport.mobile,
  });
  await navigateTo(send, appUrl);
  const titleState = await captureState(send, events, viewport.name, "title");
  await send("Runtime.evaluate", {
    expression:
      "document.querySelector('[data-ocid=\"title.start_button\"]')?.click()",
  });
  const gameplayState = await captureState(
    send,
    events,
    viewport.name,
    "gameplay",
  );
  await moveUntil(
    send,
    viewport,
    "ArrowDown",
    "ArrowDown",
    (state) => state?.sceneId === "hub",
    {
      maxSteps: 18,
      message: "Player did not exit the lab into the hub",
    },
  );
  const hubState = await captureState(send, events, viewport.name, "hub");

  await moveUntil(
    send,
    viewport,
    "ArrowDown",
    "ArrowDown",
    (state) => state?.sceneId === "hub" && state.position.y >= 12.6,
    {
      maxSteps: 12,
      message: "Player did not reach the south plaza walkway",
    },
  );

  await moveUntil(
    send,
    viewport,
    "ArrowRight",
    "ArrowRight",
    (state) => state?.sceneId === "hub" && state.position.x >= 21.1,
    {
      maxSteps: 22,
      message: "Player did not reach the Operations walkway x-position",
    },
  );
  await moveUntil(
    send,
    viewport,
    "ArrowUp",
    "ArrowUp",
    (state) => state?.sceneId === "operations",
    {
      maxSteps: 36,
      message: "Player did not enter Operations Suite from the hub",
    },
  );
  const walkedOperationsState = await captureState(
    send,
    events,
    viewport.name,
    "operations-walk",
  );
  await navigateTo(send, `${appUrl}?qaScene=operations`);
  const operationsState = await captureState(
    send,
    events,
    viewport.name,
    "operations",
  );
  await assertQaState(
    send,
    (state) =>
      state?.sceneId === "operations" &&
      state.position.y >= 10 &&
      state.position.y <= 10.35,
    "Direct Operations QA scene did not start at the clear doorway spawn",
  );
  await navigateTo(send, `${appUrl}?qaScene=operations&qaStage=diagnose`);
  const onboardingDecisionState = await captureState(
    send,
    events,
    viewport.name,
    "decision-onboarding",
  );
  await navigateTo(send, `${appUrl}?qaScene=operations&qaRun=actual`);
  await assertQaState(
    send,
    (state) => state?.sceneId === "operations",
    "Actual-flow QA did not load Operations Suite",
  );
  await completeOnboardingCase(send, viewport);
  const onboardingCompleteState = await captureState(
    send,
    events,
    viewport.name,
    "onboarding-complete-flow",
  );
  await navigateTo(send, `${appUrl}?qaScene=sales`);
  const salesState = await captureState(
    send,
    events,
    viewport.name,
    "sales",
  );
  await assertQaState(
    send,
    (state) =>
      state?.sceneId === "sales" &&
      state.position.y >= 10 &&
      state.position.y <= 10.35,
    "Direct Sales QA scene did not start at the clear doorway spawn",
  );
  await navigateTo(send, `${appUrl}?qaScene=sales&qaStage=design`);
  const salesDecisionState = await captureState(
    send,
    events,
    viewport.name,
    "decision-sales",
  );

  const relevantEvents = events
    .filter((event) =>
      [
        "Runtime.consoleAPICalled",
        "Runtime.exceptionThrown",
        "Log.entryAdded",
        "Page.javascriptDialogOpening",
      ].includes(event.method),
    )
    .map((event) => ({ method: event.method, params: event.params }));

  return {
    viewport: viewport.name,
    states: [
      titleState,
      gameplayState,
      hubState,
      walkedOperationsState,
      operationsState,
      onboardingDecisionState,
      onboardingCompleteState,
      salesState,
      salesDecisionState,
    ],
    events: relevantEvents,
  };
}

await mkdir(outputDir, { recursive: true });

const tabUrl = await createTab();
const client = await connect(tabUrl);

await client.send("Page.enable");
await client.send("Runtime.enable");
await client.send("Log.enable");
await client.send("Network.enable");

const results = [];
for (const viewport of viewports) {
  results.push(await runViewport(client, viewport));
}

client.socket.close();

const reportPath = join(outputDir, "report.json");
await writeFile(reportPath, `${JSON.stringify({ appUrl, results }, null, 2)}\n`);

console.log(JSON.stringify({ reportPath, results }, null, 2));
