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
  drawPortals(ctx, scene, camera, assets);
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

      let sprite: SheetSprite = floorSprite;
      if (
        scene.theme === "interior" &&
        scene.id === "operations" &&
        (row + col) % 4 === 0
      ) {
        sprite = tileSprites.labFloor;
      }

      drawSheetSprite(
        ctx,
        assets,
        sprite,
        col * TILE_SIZE - camera.x,
        row * TILE_SIZE - camera.y,
        TILE_SIZE,
        TILE_SIZE,
      );
    }
  }

  drawTilePatches(ctx, scene, camera, assets);
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
  assets: LoadedAssets,
) {
  for (const portal of scene.portals) {
    const px = portal.rect.x * TILE_SIZE - camera.x;
    const py = portal.rect.y * TILE_SIZE - camera.y;
    const width = portal.rect.width * TILE_SIZE;
    const height = portal.rect.height * TILE_SIZE;

    if (scene.theme === "exterior") {
      continue;
    }

    drawSheetSprite(
      ctx,
      assets,
      tileSprites.doorway,
      px,
      py + height - TILE_SIZE,
      width,
      TILE_SIZE,
    );
    ctx.fillStyle = "rgba(34, 211, 238, 0.08)";
    ctx.fillRect(
      px + 8,
      py + height - TILE_SIZE + 8,
      width - 16,
      TILE_SIZE - 16,
    );
  }
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
  const visibleEvidence = evidenceItems.filter(
    (item) =>
      item.sceneId === scene.id &&
      item.caseId === gameState.currentCaseId &&
      !gameState.collectedEvidenceIds.includes(item.id),
  );

  for (const evidence of visibleEvidence) {
    const x = evidence.position.x * TILE_SIZE - camera.x;
    const y = evidence.position.y * TILE_SIZE - camera.y;
    const pulse = Math.sin(Date.now() / 260) * 3;

    ctx.shadowColor = "#facc15";
    ctx.shadowBlur = 12 + pulse;
    drawSheetSprite(ctx, assets, evidence.sprite, x, y, 58, 42);
    ctx.shadowBlur = 0;

    drawLabel(ctx, evidence.title, x + 28, y - 8, "#fef3c7");
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

    if (character.id === "maya" && gameState.questStage !== "complete") {
      ctx.strokeStyle = "rgba(250, 204, 21, 0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(x + 24, y + 91, 22, 8, 0, 0, Math.PI * 2);
      ctx.stroke();
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
    left: 2,
    up: 1,
    right: 0,
    down: 3,
  };
  return offsets[direction];
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
