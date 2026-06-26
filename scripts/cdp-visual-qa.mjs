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
  await send("Page.navigate", { url: appUrl });
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
  await moveForViewport(send, viewport, "ArrowDown", "ArrowDown", 850);
  const hubState = await captureState(send, events, viewport.name, "hub");
  await moveForViewport(
    send,
    viewport,
    "ArrowRight",
    "ArrowRight",
    viewport.mobile ? 3000 : 1700,
  );
  await moveForViewport(
    send,
    viewport,
    "ArrowUp",
    "ArrowUp",
    viewport.mobile ? 7600 : 7200,
  );
  const walkedOperationsState = await captureState(
    send,
    events,
    viewport.name,
    "operations-walk",
  );
  await send("Page.navigate", { url: `${appUrl}?qaScene=operations` });
  const operationsState = await captureState(
    send,
    events,
    viewport.name,
    "operations",
  );
  await send("Page.navigate", { url: `${appUrl}?qaScene=sales` });
  const salesState = await captureState(
    send,
    events,
    viewport.name,
    "sales",
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
      salesState,
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
