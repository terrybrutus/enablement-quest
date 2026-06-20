import type { GameState, Npc, Waypoint, Zone } from "./types";
import { PLAYER_SIZE, TILE_SIZE } from "./types";

const COLORS = {
  floor: "#1e1e2e",
  floorAlt: "#252535",
  wall: "#3d3d5c",
  wallTop: "#4a4a6a",
  portal: "oklch(0.75 0.15 190 / 0.3)",
  portalBorder: "oklch(0.75 0.15 190 / 0.6)",
  player: "oklch(0.75 0.15 190)",
  playerGlow: "oklch(0.75 0.15 190 / 0.4)",
  npc: "#f59e0b",
  npcGlow: "rgba(245, 158, 11, 0.3)",
  waypoint: "oklch(0.75 0.15 190)",
  waypointObserved: "#4ade80",
  waypointGlow: "oklch(0.75 0.15 190 / 0.5)",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  desk: "#475569",
  plant: "#22c55e",
  whiteboard: "#f8fafc",
  bookshelf: "#78350f",
  terminal: "oklch(0.75 0.15 190)",
  couch: "#7c3aed",
};

export function renderGame(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  gameState: GameState,
) {
  const { player, zones, npcs, waypoints } = gameState;
  const zone = zones.find((z) => z.id === player.currentZoneId)!;

  const canvasW = canvas.width;
  const canvasH = canvas.height;

  // Camera follows player
  const camX = player.position.x - canvasW / 2;
  const camY = player.position.y - canvasH / 2;

  // Clamp camera to zone bounds
  const maxCamX = zone.width * TILE_SIZE - canvasW;
  const maxCamY = zone.height * TILE_SIZE - canvasH;
  const clampedCamX = Math.max(0, Math.min(camX, maxCamX));
  const clampedCamY = Math.max(0, Math.min(camY, maxCamY));

  ctx.clearRect(0, 0, canvasW, canvasH);

  // Background
  ctx.fillStyle = "#0f0f1a";
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Visible tile range
  const startCol = Math.floor(clampedCamX / TILE_SIZE);
  const endCol = Math.ceil((clampedCamX + canvasW) / TILE_SIZE);
  const startRow = Math.floor(clampedCamY / TILE_SIZE);
  const endRow = Math.ceil((clampedCamY + canvasH) / TILE_SIZE);

  // Draw tiles
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      if (row < 0 || row >= zone.height || col < 0 || col >= zone.width)
        continue;
      const tile = zone.tiles[row][col];
      const x = col * TILE_SIZE - clampedCamX;
      const y = row * TILE_SIZE - clampedCamY;

      if (tile === 1) {
        // Wall
        ctx.fillStyle = COLORS.wall;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        ctx.fillStyle = COLORS.wallTop;
        ctx.fillRect(x, y, TILE_SIZE, 4);
        // Brick pattern
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      } else {
        // Floor
        ctx.fillStyle = (row + col) % 2 === 0 ? COLORS.floor : COLORS.floorAlt;
        ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
        // Grid line
        ctx.strokeStyle = "rgba(255,255,255,0.03)";
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, y, TILE_SIZE, TILE_SIZE);
      }

      if (tile === 2) {
        // Portal
        ctx.fillStyle = COLORS.portal;
        ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        ctx.strokeStyle = COLORS.portalBorder;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
      }
    }
  }

  // Draw decorations
  for (const dec of zone.decorations) {
    const x = dec.x * TILE_SIZE - clampedCamX;
    const y = dec.y * TILE_SIZE - clampedCamY;
    drawDecoration(ctx, dec.type, x, y);
  }

  // Draw waypoints
  const zoneWaypoints = waypoints.filter((w) => w.zoneId === zone.id);
  for (const wp of zoneWaypoints) {
    const x = wp.position.x * TILE_SIZE - clampedCamX + TILE_SIZE / 2;
    const y = wp.position.y * TILE_SIZE - clampedCamY + TILE_SIZE / 2;
    drawWaypoint(ctx, x, y, wp.observed);
  }

  // Draw NPCs
  const zoneNpcs = npcs.filter((n) => n.zoneId === zone.id);
  for (const npc of zoneNpcs) {
    const x = npc.position.x * TILE_SIZE - clampedCamX + TILE_SIZE / 2;
    const y = npc.position.y * TILE_SIZE - clampedCamY + TILE_SIZE / 2;
    drawNpc(ctx, x, y, npc);
  }

  // Draw player
  const px = player.position.x - clampedCamX;
  const py = player.position.y - clampedCamY;
  drawPlayer(ctx, px, py);

  // Draw portal labels
  for (const portal of zone.portals) {
    const x = portal.x * TILE_SIZE - clampedCamX + TILE_SIZE / 2;
    const y = portal.y * TILE_SIZE - clampedCamY - 4;
    ctx.fillStyle = COLORS.textMuted;
    ctx.font = "10px var(--font-body)";
    ctx.textAlign = "center";
    ctx.fillText(portal.label, x, y);
  }
}

function drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // Glow
  ctx.shadowColor = COLORS.player;
  ctx.shadowBlur = 15;

  // Body
  ctx.fillStyle = COLORS.player;
  ctx.beginPath();
  ctx.arc(x, y, PLAYER_SIZE / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Inner highlight
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.arc(x - 3, y - 3, PLAYER_SIZE / 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawNpc(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  npc: Npc,
) {
  // Glow
  ctx.shadowColor = COLORS.npc;
  ctx.shadowBlur = 12;

  // Body
  ctx.fillStyle = COLORS.npc;
  ctx.beginPath();
  ctx.arc(x, y, PLAYER_SIZE / 2 + 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Name tag
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.roundRect(x - 30, y - 32, 60, 16, 4);
  ctx.fill();
  ctx.fillStyle = COLORS.text;
  ctx.font = "10px var(--font-body)";
  ctx.textAlign = "center";
  ctx.fillText(npc.name, x, y - 21);

  // Quest indicator
  const quest = npc.questId !== null;
  if (quest) {
    ctx.fillStyle = "oklch(0.75 0.15 190)";
    ctx.beginPath();
    ctx.arc(x, y - 28, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawWaypoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  observed: boolean,
) {
  const color = observed ? COLORS.waypointObserved : COLORS.waypoint;
  const time = Date.now() / 1000;
  const pulse = Math.sin(time * 2) * 3;

  ctx.shadowColor = color;
  ctx.shadowBlur = 10 + pulse;

  // Outer ring
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 12 + pulse, 0, Math.PI * 2);
  ctx.stroke();

  // Inner dot
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Label
  if (!observed) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.roundRect(x - 40, y - 28, 80, 14, 3);
    ctx.fill();
    ctx.fillStyle = COLORS.text;
    ctx.font = "9px var(--font-body)";
    ctx.textAlign = "center";
    ctx.fillText("Press E", x, y - 18);
  }
}

function drawDecoration(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
) {
  const cx = x + TILE_SIZE / 2;
  const cy = y + TILE_SIZE / 2;

  switch (type) {
    case "desk":
      ctx.fillStyle = COLORS.desk;
      ctx.fillRect(x + 4, y + 8, TILE_SIZE - 8, TILE_SIZE - 16);
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(x + 6, y + 10, TILE_SIZE - 12, 4);
      break;
    case "plant":
      ctx.fillStyle = "#3f2e18";
      ctx.fillRect(cx - 4, cy + 2, 8, 14);
      ctx.fillStyle = COLORS.plant;
      ctx.beginPath();
      ctx.arc(cx, cy - 4, 10, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "whiteboard":
      ctx.fillStyle = COLORS.whiteboard;
      ctx.fillRect(x + 2, y + 4, TILE_SIZE - 4, TILE_SIZE - 8);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, y + 4, TILE_SIZE - 4, TILE_SIZE - 8);
      // Some scribbles
      ctx.strokeStyle = "#cbd5e1";
      ctx.beginPath();
      ctx.moveTo(x + 8, y + 12);
      ctx.lineTo(x + 20, y + 18);
      ctx.moveTo(x + 8, y + 18);
      ctx.lineTo(x + 20, y + 12);
      ctx.stroke();
      break;
    case "bookshelf":
      ctx.fillStyle = COLORS.bookshelf;
      ctx.fillRect(x + 4, y + 2, TILE_SIZE - 8, TILE_SIZE - 4);
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(x + 4, y + TILE_SIZE / 2 - 1, TILE_SIZE - 8, 2);
      // Books
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(x + 6, y + 4, 4, 18);
      ctx.fillStyle = "#3b82f6";
      ctx.fillRect(x + 11, y + 4, 4, 18);
      ctx.fillStyle = "#eab308";
      ctx.fillRect(x + 16, y + 4, 4, 18);
      break;
    case "terminal":
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(x + 6, y + 6, TILE_SIZE - 12, TILE_SIZE - 16);
      ctx.fillStyle = COLORS.terminal;
      ctx.fillRect(x + 8, y + 8, TILE_SIZE - 16, 8);
      ctx.fillStyle = "#334155";
      ctx.fillRect(cx - 6, cy + 10, 12, 4);
      break;
    case "couch":
      ctx.fillStyle = COLORS.couch;
      ctx.fillRect(x + 2, y + 8, TILE_SIZE - 4, TILE_SIZE - 16);
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      ctx.fillRect(x + 2, y + 8, TILE_SIZE - 4, 4);
      break;
  }
}
