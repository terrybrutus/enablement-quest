import {
  assetUrls,
  characters,
  evidenceItems,
  scenes,
  tileSprites,
} from "./levels";
import type {
  AssetKey,
  Direction,
  GameState,
  Scene,
  SheetSprite,
} from "./types";
import { PLAYER_HEIGHT, PLAYER_WIDTH, TILE_SIZE } from "./types";

export type LoadedAssets = Partial<Record<AssetKey, HTMLImageElement>>;

const LABEL_BG = "rgba(7, 10, 20, 0.78)";
const LABEL_BORDER = "rgba(255, 255, 255, 0.18)";
const RUN_FRAMES_PER_DIRECTION = 6;

interface Viewport {
  width: number;
  height: number;
}

export function loadGameAssets(
  onReady: (assets: LoadedAssets) => void,
): () => void {
  let cancelled = false;
  const entries = Object.entries(assetUrls) as Array<[AssetKey, string]>;
  const loaded: LoadedAssets = {};
  let remaining = entries.length;
  window.__EQ_ASSETS_READY = false;

  for (const [key, url] of entries) {
    const image = new Image();
    image.onload = () => {
      loaded[key] = image;
      remaining -= 1;
      if (!cancelled && remaining === 0) {
        window.__EQ_ASSETS_READY = true;
        onReady(loaded);
      }
    };
    image.onerror = () => {
      remaining -= 1;
      if (!cancelled && remaining === 0) {
        window.__EQ_ASSETS_READY = true;
        onReady(loaded);
      }
    };
    image.src = url;
  }

  return () => {
    cancelled = true;
  };
}

declare global {
  interface Window {
    __EQ_ASSETS_READY?: boolean;
  }
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  gameState: GameState,
  assets: LoadedAssets,
) {
  const scene = getScene(gameState.player.sceneId);
  const viewport = getViewport(canvas);
  const camera = getCamera(viewport, scene, gameState);

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, viewport.width, viewport.height);
  ctx.fillStyle = "#07111d";
  ctx.fillRect(0, 0, viewport.width, viewport.height);

  drawSceneBase(ctx, viewport, scene, camera, assets);
  drawProps(ctx, scene, camera, assets);
  drawPortals(ctx, scene, camera);
  drawEvidence(ctx, scene, gameState, camera, assets);
  drawCharacters(ctx, scene, gameState, camera, assets);
  drawPlayer(ctx, gameState, camera, assets);
}

function getScene(sceneId: string): Scene {
  const scene = scenes.find((item) => item.id === sceneId);
  if (!scene) {
    return scenes[0];
  }
  return scene;
}

function getViewport(canvas: HTMLCanvasElement): Viewport {
  return {
    width: canvas.clientWidth || canvas.width,
    height: canvas.clientHeight || canvas.height,
  };
}

function getCamera(viewport: Viewport, scene: Scene, gameState: GameState) {
  const worldWidth = scene.width * TILE_SIZE;
  const worldHeight = scene.height * TILE_SIZE;
  const targetX = gameState.player.position.x * TILE_SIZE - viewport.width / 2;
  const targetY = gameState.player.position.y * TILE_SIZE - viewport.height / 2;
  const centerX = Math.max(0, (viewport.width - worldWidth) / 2);
  const centerY = Math.max(0, (viewport.height - worldHeight) / 2);

  return {
    x:
      worldWidth < viewport.width
        ? -centerX
        : clamp(targetX, 0, Math.max(0, worldWidth - viewport.width)),
    y:
      worldHeight < viewport.height
        ? -centerY
        : clamp(targetY, 0, Math.max(0, worldHeight - viewport.height)),
  };
}

function drawSceneBase(
  ctx: CanvasRenderingContext2D,
  viewport: Viewport,
  scene: Scene,
  camera: { x: number; y: number },
  assets: LoadedAssets,
) {
  const startCol = Math.floor(camera.x / TILE_SIZE);
  const endCol = Math.ceil((camera.x + viewport.width) / TILE_SIZE);
  const startRow = Math.floor(camera.y / TILE_SIZE);
  const endRow = Math.ceil((camera.y + viewport.height) / TILE_SIZE);
  const floorSprite: SheetSprite =
    scene.floorSprite ??
    (scene.theme === "exterior"
      ? tileSprites.grass
      : scene.id === "operations"
        ? tileSprites.warmFloor
        : tileSprites.labFloor);

  for (let row = startRow; row <= endRow; row += 1) {
    for (let col = startCol; col <= endCol; col += 1) {
      if (row < 0 || col < 0 || row >= scene.height || col >= scene.width) {
        continue;
      }

      drawSheetSprite(
        ctx,
        assets,
        floorSprite,
        col * TILE_SIZE - camera.x,
        row * TILE_SIZE - camera.y,
        TILE_SIZE,
        TILE_SIZE,
      );
    }
  }

  drawTilePatches(ctx, scene, camera, assets);
  drawExteriorLandmarks(ctx, scene, camera);
  drawInteriorLandmarks(ctx, scene, camera);
  drawRoomBorders(ctx, scene, camera, assets);
}

function drawTilePatches(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  camera: { x: number; y: number },
  assets: LoadedAssets,
) {
  for (const patch of scene.tilePatches ?? []) {
    const startX = Math.floor(patch.position.x);
    const startY = Math.floor(patch.position.y);
    const endX = Math.ceil(patch.position.x + patch.size.width);
    const endY = Math.ceil(patch.position.y + patch.size.height);
    for (let row = startY; row < endY; row += 1) {
      for (let col = startX; col < endX; col += 1) {
        drawSheetSprite(
          ctx,
          assets,
          patch.sprite,
          col * TILE_SIZE - camera.x,
          row * TILE_SIZE - camera.y,
          TILE_SIZE,
          TILE_SIZE,
        );
      }
    }
  }
}

function drawExteriorLandmarks(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  camera: { x: number; y: number },
) {
  if (scene.id !== "hub") {
    return;
  }

  const buildings = [
    {
      rect: { x: 3, y: 2.7, width: 7.1, height: 4.85 },
      label: "Sales Enablement Studio",
      accent: "#22d3ee",
      fill: "#164e63",
      door: { x: 6.85, y: 7.02, width: 1.05, height: 0.72 },
    },
    {
      rect: { x: 18.9, y: 2.7, width: 8.5, height: 4.85 },
      label: "Operations Suite",
      accent: "#f59e0b",
      fill: "#713f12",
      door: { x: 21.55, y: 7.02, width: 1.05, height: 0.72 },
    },
    {
      rect: { x: 11, y: 11.2, width: 8.2, height: 4 },
      label: "Learning Systems Lab",
      accent: "#a78bfa",
      fill: "#4c1d95",
      door: { x: 14.45, y: 14.72, width: 1.1, height: 0.72 },
    },
  ];

  for (const building of buildings) {
    drawCampusBuilding(
      ctx,
      building.rect.x * TILE_SIZE - camera.x,
      building.rect.y * TILE_SIZE - camera.y,
      building.rect.width * TILE_SIZE,
      building.rect.height * TILE_SIZE,
      building.fill,
      building.accent,
      building.label,
    );

    drawCampusDoor(
      ctx,
      building.door.x * TILE_SIZE - camera.x,
      building.door.y * TILE_SIZE - camera.y,
      building.door.width * TILE_SIZE,
      building.door.height * TILE_SIZE,
      building.accent,
    );
  }

  drawCampusFountain(
    ctx,
    15 * TILE_SIZE - camera.x,
    9.45 * TILE_SIZE - camera.y,
  );
  drawCampusPlanting(ctx, camera);
}

function drawCampusPlanting(
  ctx: CanvasRenderingContext2D,
  camera: { x: number; y: number },
) {
  const shrubs = [
    { x: 4.4, y: 8.15 },
    { x: 9.2, y: 8.15 },
    { x: 20.1, y: 8.15 },
    { x: 25.4, y: 8.15 },
    { x: 12.2, y: 15.7 },
    { x: 18.1, y: 15.7 },
    { x: 13.2, y: 9.95 },
    { x: 16.8, y: 9.95 },
  ];

  ctx.save();
  for (const shrub of shrubs) {
    const x = shrub.x * TILE_SIZE - camera.x;
    const y = shrub.y * TILE_SIZE - camera.y;
    ctx.fillStyle = "rgba(20, 83, 45, 0.86)";
    ctx.beginPath();
    ctx.arc(x - 10, y, 13, 0, Math.PI * 2);
    ctx.arc(x + 2, y - 6, 15, 0, Math.PI * 2);
    ctx.arc(x + 14, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(134, 239, 172, 0.42)";
    ctx.beginPath();
    ctx.arc(x - 4, y - 9, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCampusBuilding(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  accent: string,
  label: string,
) {
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.38)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = "rgba(15, 23, 42, 0.42)";
  roundRect(ctx, x + 8, y + 18, width - 16, height - 4, 14);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.fillStyle = fill;
  roundRect(ctx, x, y + 20, width, height - 20, 14);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.moveTo(x + width * 0.12, y + 34);
  ctx.lineTo(x + width / 2, y);
  ctx.lineTo(x + width * 0.88, y + 34);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = "rgba(15, 23, 42, 0.82)";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.24)";
  for (let index = 0; index < 3; index += 1) {
    const windowX = x + width * (0.2 + index * 0.27);
    ctx.fillRect(windowX, y + height * 0.42, 28, 24);
    ctx.fillRect(windowX, y + height * 0.62, 28, 24);
  }

  drawCampusPlaque(ctx, label, x + width / 2, y + height * 0.22);
  ctx.restore();
}

function drawCampusDoor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  accent: string,
) {
  ctx.save();
  ctx.fillStyle = "rgba(2, 6, 23, 0.8)";
  roundRect(ctx, x, y, width, height, 8);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(x + width - 13, y + height / 2, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCampusFountain(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
) {
  ctx.save();
  ctx.fillStyle = "rgba(14, 165, 233, 0.18)";
  ctx.strokeStyle = "rgba(125, 211, 252, 0.9)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(x, y, 58, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = "rgba(186, 230, 253, 0.9)";
  ctx.lineWidth = 3;
  for (let index = 0; index < 3; index += 1) {
    ctx.beginPath();
    ctx.arc(x, y - 4, 14 + index * 12, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  }
  ctx.fillStyle = "#67e8f9";
  ctx.beginPath();
  ctx.arc(x, y - 5, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawCampusPlaque(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
) {
  ctx.save();
  ctx.font = "900 13px DM Sans, sans-serif";
  ctx.textAlign = "center";
  const width = Math.min(ctx.measureText(text).width + 30, 230);
  ctx.fillStyle = "rgba(2, 6, 23, 0.86)";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.lineWidth = 1;
  roundRect(ctx, x - width / 2, y - 15, width, 30, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(text, x, y + 5);
  ctx.restore();
}

function drawInteriorLandmarks(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  camera: { x: number; y: number },
) {
  if (scene.id !== "operations" && scene.id !== "sales") {
    return;
  }

  const theme =
    scene.id === "operations"
      ? {
          accent: "#f59e0b",
          fill: "rgba(120, 53, 15, 0.07)",
          title: "Onboarding Diagnostic Room",
          zones: [
            {
              rect: { x: 6.9, y: 2.8, width: 4.2, height: 2.5 },
            },
            {
              rect: { x: 2.2, y: 4.1, width: 4.7, height: 2.9 },
            },
            {
              rect: { x: 7.1, y: 7.2, width: 4.4, height: 3.1 },
            },
            {
              rect: { x: 11.8, y: 3.8, width: 4.2, height: 3 },
            },
          ],
        }
      : {
          accent: "#22d3ee",
          fill: "rgba(8, 145, 178, 0.07)",
          title: "Sales Enablement Studio",
          zones: [
            {
              rect: { x: 4.5, y: 3.5, width: 4.2, height: 2.7 },
            },
            {
              rect: { x: 2.5, y: 5.4, width: 4.4, height: 3.1 },
            },
            {
              rect: { x: 6.7, y: 7.6, width: 5.6, height: 2.7 },
            },
            {
              rect: { x: 11.9, y: 4.1, width: 4.5, height: 3.5 },
            },
          ],
        };

  drawInteriorHeader(ctx, scene, camera, theme.title, theme.accent);
  for (const zone of theme.zones) {
    drawLearningZone(ctx, camera, zone.rect, theme.fill, theme.accent);
  }
  drawExitGuide(ctx, scene, camera, theme.accent);
}

function drawInteriorHeader(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  camera: { x: number; y: number },
  title: string,
  accent: string,
) {
  const x = scene.width * TILE_SIZE * 0.5 - camera.x;
  const y = 1.45 * TILE_SIZE - camera.y;
  ctx.save();
  ctx.font = "900 14px DM Sans, sans-serif";
  ctx.textAlign = "center";
  const width = ctx.measureText(title).width + 42;
  ctx.fillStyle = "rgba(2, 6, 23, 0.78)";
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  roundRect(ctx, x - width / 2, y - 18, width, 34, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#f8fafc";
  ctx.fillText(title, x, y + 5);
  ctx.restore();
}

function drawLearningZone(
  ctx: CanvasRenderingContext2D,
  camera: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number },
  fill: string,
  accent: string,
) {
  const x = rect.x * TILE_SIZE - camera.x;
  const y = rect.y * TILE_SIZE - camera.y;
  const width = rect.width * TILE_SIZE;
  const height = rect.height * TILE_SIZE;
  ctx.save();
  ctx.fillStyle = fill;
  ctx.strokeStyle = `${accent}38`;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, width, height, 12);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawExitGuide(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  camera: { x: number; y: number },
  accent: string,
) {
  const x = scene.width * TILE_SIZE * 0.5 - camera.x;
  const y = (scene.height - 1.65) * TILE_SIZE - camera.y;
  ctx.save();
  ctx.strokeStyle = `${accent}55`;
  ctx.fillStyle = `${accent}14`;
  ctx.lineWidth = 2;
  roundRect(ctx, x - 42, y - 8, 84, 18, 8);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawRoomBorders(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  camera: { x: number; y: number },
  assets: LoadedAssets,
) {
  if (scene.theme !== "interior") {
    return;
  }

  for (let col = 0; col < scene.width; col += 1) {
    drawSheetSprite(
      ctx,
      assets,
      tileSprites.wall,
      col * TILE_SIZE - camera.x,
      -camera.y,
      TILE_SIZE,
      TILE_SIZE,
    );
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.38)";
  ctx.fillRect(-camera.x, -camera.y, scene.width * TILE_SIZE, 12);

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 2;
  ctx.strokeRect(
    -camera.x + TILE_SIZE,
    -camera.y + TILE_SIZE,
    (scene.width - 2) * TILE_SIZE,
    (scene.height - 2) * TILE_SIZE,
  );
}

function drawPortals(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  camera: { x: number; y: number },
) {
  for (const portal of scene.portals) {
    const px = portal.rect.x * TILE_SIZE - camera.x;
    const py = portal.rect.y * TILE_SIZE - camera.y;
    const width = portal.rect.width * TILE_SIZE;
    const height = portal.rect.height * TILE_SIZE;

    if (scene.theme === "exterior") {
      drawPortalHotspot(ctx, px, py, width, height, portal.label);
      continue;
    }

    drawInteriorPortalHotspot(ctx, px, py, width, height, portal.label);
  }
}

function drawInteriorPortalHotspot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
) {
  const pulse = Math.sin(Date.now() / 360) * 1.4;
  const centerX = x + width / 2;
  ctx.save();
  ctx.strokeStyle = "rgba(34, 211, 238, 0.72)";
  ctx.fillStyle = "rgba(34, 211, 238, 0.16)";
  ctx.lineWidth = 2;
  roundRect(ctx, x - 5, y - 5, width + 10, height + 10, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgba(2, 6, 23, 0.88)";
  roundRect(ctx, centerX - 48, y - 34 - pulse, 96, 25, 8);
  ctx.fill();
  ctx.strokeStyle = "rgba(34, 211, 238, 0.56)";
  ctx.stroke();
  ctx.fillStyle = "#cffafe";
  ctx.font = "900 10px DM Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`Exit to ${shortPortalLabel(label)}`, centerX, y - 18 - pulse);
  ctx.restore();
}

function drawPortalHotspot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
) {
  const pulse = Math.sin(Date.now() / 360) * 2;
  ctx.save();
  ctx.strokeStyle = "rgba(34, 211, 238, 0.72)";
  ctx.fillStyle = "rgba(34, 211, 238, 0.14)";
  ctx.lineWidth = 2;
  roundRect(ctx, x - 4, y - 4, width + 8, height + 8, 8);
  ctx.fill();
  ctx.setLineDash([6, 5]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(2, 6, 23, 0.82)";
  roundRect(ctx, x + width / 2 - 42, y - 34 - pulse, 84, 24, 8);
  ctx.fill();
  ctx.fillStyle = "#cffafe";
  ctx.font = "900 10px DM Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(
    `Enter ${shortPortalLabel(label)}`,
    x + width / 2,
    y - 18 - pulse,
  );
  ctx.restore();
}

function shortPortalLabel(label: string) {
  if (label.includes("Operations")) {
    return "Operations";
  }
  if (label.includes("Sales")) {
    return "Sales";
  }
  if (label.includes("Lab")) {
    return "Lab";
  }
  if (label.includes("Organization")) {
    return "campus";
  }
  return "door";
}

function drawProps(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  camera: { x: number; y: number },
  assets: LoadedAssets,
) {
  const sortedProps = [...scene.props].sort(
    (a, b) => a.position.y + a.size.height - (b.position.y + b.size.height),
  );
  for (const prop of sortedProps) {
    const px = prop.position.x * TILE_SIZE - camera.x;
    const py = prop.position.y * TILE_SIZE - camera.y;
    const width = prop.size.width * TILE_SIZE;
    const height = prop.size.height * TILE_SIZE;

    // Add glow effect for interactive props
    if (prop.glow) {
      const pulse = Math.sin(Date.now() / 400) * 2 + 4;
      ctx.shadowColor = "#22d3ee";
      ctx.shadowBlur = 8 + pulse;
      ctx.fillStyle = "rgba(34, 211, 238, 0.1)";
      ctx.fillRect(px - 4, py - 4, width + 8, height + 8);
      ctx.shadowBlur = 0;
    }

    if (prop.sprite) {
      drawSheetSprite(ctx, assets, prop.sprite, px, py, width, height);
    }
  }

  for (const prop of sortedProps) {
    if (!prop.label) {
      continue;
    }
    const px = prop.position.x * TILE_SIZE - camera.x;
    const py = prop.position.y * TILE_SIZE - camera.y;
    const width = prop.size.width * TILE_SIZE;
    const height = prop.size.height * TILE_SIZE;

    drawLabel(ctx, prop.label, px + width / 2, py + height + 14, "#dbeafe");
  }
}

function drawEvidence(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  gameState: GameState,
  camera: { x: number; y: number },
  assets: LoadedAssets,
) {
  if (!isCaseBriefingComplete(gameState)) {
    return;
  }

  const visibleEvidence = evidenceItems.filter(
    (item) =>
      item.sceneId === scene.id &&
      item.caseId === gameState.currentCaseId &&
      !gameState.collectedEvidenceIds.includes(item.id),
  );
  const expectedEvidence = evidenceItems.find(
    (item) =>
      item.caseId === gameState.currentCaseId &&
      !gameState.collectedEvidenceIds.includes(item.id),
  );

  for (const evidence of visibleEvidence) {
    const x = evidence.position.x * TILE_SIZE - camera.x;
    const y = evidence.position.y * TILE_SIZE - camera.y;
    const pulse = Math.sin(Date.now() / 260) * 3;
    const playerDistance =
      Math.hypot(
        gameState.player.position.x - evidence.position.x,
        gameState.player.position.y - evidence.position.y,
      ) * TILE_SIZE;
    const evidenceIndex =
      evidenceItems
        .filter((item) => item.caseId === gameState.currentCaseId)
        .findIndex((item) => item.id === evidence.id) + 1;
    const isExpected = evidence.id === expectedEvidence?.id;
    const stationX = x - 13;
    const stationY = y + 17;

    ctx.shadowColor = "#facc15";
    ctx.shadowBlur = isExpected ? 12 + pulse : 0;
    drawSheetSprite(
      ctx,
      assets,
      scene.floorSprite ?? tileSprites.labFloor,
      stationX,
      stationY,
      72,
      48,
    );
    ctx.shadowBlur = 0;
    ctx.fillStyle = "rgba(15, 23, 42, 0.32)";
    ctx.fillRect(stationX + 7, stationY + 8, 58, 32);
    ctx.strokeStyle = isExpected
      ? "rgba(250, 204, 21, 0.72)"
      : "rgba(148, 163, 184, 0.38)";
    ctx.lineWidth = 2;
    ctx.strokeRect(stationX + 7, stationY + 8, 58, 32);
    ctx.shadowColor = "#facc15";
    ctx.shadowBlur = isExpected ? 8 + pulse : 0;
    drawSheetSprite(ctx, assets, evidence.sprite, x + 5, y, 48, 48);
    ctx.shadowBlur = 0;

    if (isExpected) {
      drawQuestMarker(ctx, x + 29, y + 26, `${evidenceIndex}`);
    }

    if (isExpected || playerDistance < 130) {
      drawLabel(ctx, evidence.title, x + 29, y - 24, "#fef3c7");
    }
  }
}

function drawCharacters(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  gameState: GameState,
  camera: { x: number; y: number },
  assets: LoadedAssets,
) {
  const sceneCharacters = characters.filter(
    (character) => character.sceneId === scene.id,
  );
  for (const character of sceneCharacters) {
    const characterState = gameState.characterStates[character.id];
    const position = characterState?.position ?? character.position;
    const direction = characterState?.direction ?? "down";
    const x = position.x * TILE_SIZE - camera.x - 24;
    const y = position.y * TILE_SIZE - camera.y - 48;
    drawSheetSprite(
      ctx,
      assets,
      {
        ...character.sprite,
        sx: getDirectionSpriteOffset(direction) * character.sprite.sw,
      },
      x,
      y,
      48,
      96,
    );
    drawLabel(ctx, character.name, x + 24, y - 10, "#bbf7d0");

    if (character.id === getCurrentCaseOwnerId(gameState)) {
      ctx.strokeStyle = "rgba(250, 204, 21, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x + 24, y + 91, 22, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
      drawQuestMarker(ctx, x + 24, y - 35, "!");
    }
  }
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  gameState: GameState,
  camera: { x: number; y: number },
  assets: LoadedAssets,
) {
  const x =
    gameState.player.position.x * TILE_SIZE - camera.x - PLAYER_WIDTH / 2;
  const y =
    gameState.player.position.y * TILE_SIZE - camera.y - PLAYER_HEIGHT + 18;
  const directionOffset = getDirectionSpriteOffset(gameState.player.direction);
  const runFrame = Math.floor(Date.now() / 140) % RUN_FRAMES_PER_DIRECTION;
  const sprite: SheetSprite = gameState.player.isMoving
    ? {
        image: "adamRun",
        sx: directionOffset * RUN_FRAMES_PER_DIRECTION * 16 + runFrame * 16,
        sy: 0,
        sw: 16,
        sh: 32,
      }
    : {
        image: "adamIdle",
        sx: directionOffset * 16,
        sy: 0,
        sw: 16,
        sh: 32,
      };

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.beginPath();
  ctx.ellipse(
    x + PLAYER_WIDTH / 2,
    y + PLAYER_HEIGHT - 4,
    19,
    7,
    0,
    0,
    Math.PI * 2,
  );
  ctx.fill();
  drawSheetSprite(ctx, assets, sprite, x - 7, y - 20, 48, 96);
}

function getDirectionSpriteOffset(direction: Direction) {
  const offsets: Record<Direction, number> = {
    right: 0,
    up: 1,
    left: 2,
    down: 3,
  };
  return offsets[direction];
}

function getCurrentCaseOwnerId(gameState: GameState) {
  if (isCaseBriefingComplete(gameState)) {
    return null;
  }
  return gameState.currentCaseId === "sales" ? "leo" : "maya";
}

function isCaseBriefingComplete(gameState: GameState) {
  return gameState.caseBriefingCompletedIds.includes(gameState.currentCaseId);
}

function drawQuestMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
) {
  const pulse = Math.sin(Date.now() / 240) * 2;
  ctx.save();
  ctx.shadowColor = "rgba(250, 204, 21, 0.9)";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#facc15";
  ctx.beginPath();
  ctx.arc(x, y - 34, 13 + pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = "rgba(15, 23, 42, 0.9)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#111827";
  ctx.font = "900 13px DM Sans, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, x, y - 34);
  ctx.restore();
}

function drawSheetSprite(
  ctx: CanvasRenderingContext2D,
  assets: LoadedAssets,
  sprite: SheetSprite,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const image = assets[sprite.image];
  if (!image) {
    ctx.fillStyle = "rgba(148, 163, 184, 0.4)";
    ctx.fillRect(x, y, width, height);
    return;
  }

  ctx.drawImage(
    image,
    sprite.sx,
    sprite.sy,
    sprite.sw,
    sprite.sh,
    Math.round(x),
    Math.round(y),
    Math.round(width),
    Math.round(height),
  );
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
) {
  ctx.font = "700 12px DM Sans, sans-serif";
  ctx.textAlign = "center";
  const width = ctx.measureText(text).width + 18;
  ctx.fillStyle = LABEL_BG;
  ctx.strokeStyle = LABEL_BORDER;
  ctx.lineWidth = 1;
  roundRect(ctx, x - width / 2, y - 15, width, 22, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
