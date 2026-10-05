import { assetUrls, characters, scenes } from "@/game/levels";
import type {
  GameCharacter,
  Portal,
  Prop,
  Rect,
  Scene,
  SheetSprite,
  SpriteTransform,
} from "@/game/types";
import { TILE_SIZE } from "@/game/types";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

interface EditorItem {
  collision: boolean;
  description: string;
  groupId?: string;
  groupLabel?: string;
  hideLabel?: boolean;
  id: string;
  label: string;
  position: { x: number; y: number };
  presetId: string;
  size: { width: number; height: number };
  sprite: SheetSprite;
  spriteTransform?: SpriteTransform;
  zIndex?: number;
}

interface EditorPortal extends Portal {}

interface EditorBlock {
  id: string;
  label: string;
  rect: Rect;
}

interface EditorCharacterSettings {
  id: string;
  name: string;
  pauseMaxMs: number;
  pauseMinMs: number;
  patrol: GameCharacter["patrol"];
  sceneId: string;
  speed: number;
}

interface SavedEditorLayout {
  blocks: EditorBlock[];
  characterSettings: EditorCharacterSettings[];
  id: string;
  items: EditorItem[];
  name: string;
  portals: EditorPortal[];
  sceneId: string;
  updatedAt: string;
}

interface EditorClipboard {
  items: EditorItem[];
}

interface EditorHistorySnapshot {
  blocksByScene: Record<string, EditorBlock[]>;
  characterSettingsByScene: Record<string, EditorCharacterSettings[]>;
  itemsByScene: Record<string, EditorItem[]>;
  portalsByScene: Record<string, EditorPortal[]>;
  selectedBlockId: string | null;
  selectedIds: string[];
  selectedPortalId: string | null;
}

interface SpritePreset {
  category: string;
  defaultSize: { width: number; height: number };
  id: string;
  label: string;
  role: string;
  sprite: SheetSprite;
}

interface RawTile {
  id: string;
  label: string;
  sprite: SheetSprite;
}

interface SelectionBox {
  end: { x: number; y: number };
  start: { x: number; y: number };
}

interface EditorBounds {
  position: { x: number; y: number };
  size: { height: number; width: number };
}

type EditingLabel =
  | { id: string; kind: "item" }
  | { groupId: string; kind: "group" }
  | null;

type ResizeHandle =
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right"
  | "top"
  | "top-left"
  | "top-right";

const officeSheet = {
  height: 2544,
  url: "/assets/limezu/office-48.png",
  width: 768,
};

const spriteSources: Record<
  string,
  { height: number; url: string; width: number }
> = {
  office: officeSheet,
  officeRoomBuilder: {
    height: 480,
    url: "/assets/limezu/office-room-builder-48.png",
    width: 768,
  },
  officeShadowless: {
    height: 2544,
    url: "/assets/limezu/office-shadowless-48.png",
    width: 768,
  },
  adamIdle: {
    height: 32,
    url: "/assets/characters/Adam_idle_16x16.png",
    width: 64,
  },
  interiorsTiles: {
    height: 1344,
    url: "/assets/tiles/Interiors_free_48x48.png",
    width: 768,
  },
  roomBuilderTiles: {
    height: 480,
    url: "/assets/tiles/Room_Builder_free_48x48.png",
    width: 768,
  },
};

const starterAssetNumbers = [
  98, 99, 100, 101, 102, 107, 108, 113, 116, 129, 130, 141, 147, 156, 165, 166,
  170, 171, 172, 173, 174, 175, 176, 177, 178, 225, 227, 229, 231, 233, 235,
  275, 276, 277, 278, 320, 321, 323, 324, 325, 329, 331, 333, 335, 337, 338,
  339,
];

const namedOfficeSingles: Record<
  number,
  { category: string; label: string; role: string }
> = {
  98: {
    category: "Plants",
    label: "Tall Office Plant",
    role: "Complete plant; use near corners or office dividers.",
  },
  99: {
    category: "Plants",
    label: "Small Desk Plant",
    role: "Complete small plant for desks, shelves, or side tables.",
  },
  100: {
    category: "Plants",
    label: "Tall Potted Plant",
    role: "Complete plant; use as a room accent, not as a whiteboard.",
  },
  101: {
    category: "Seating",
    label: "Black Rolling Office Chair",
    role: "Complete desk chair.",
  },
  102: {
    category: "Seating",
    label: "Gray Rolling Office Chair",
    role: "Complete desk chair.",
  },
  107: {
    category: "Seating",
    label: "Brown Office Chair",
    role: "Complete chair for warm-toned offices.",
  },
  108: {
    category: "Seating",
    label: "Brown Chair Front View",
    role: "Complete chair variant.",
  },
  113: {
    category: "Wall Items",
    label: "Pinned Notice",
    role: "Small wall notice or printed note.",
  },
  116: {
    category: "Wall Items",
    label: "Horizontal Wall Sign",
    role: "Small wall sign or label strip.",
  },
  129: {
    category: "Technology",
    label: "Blue Desktop Monitor",
    role: "Complete monitor facing left.",
  },
  130: {
    category: "Technology",
    label: "Blue Desktop Monitor Front",
    role: "Complete monitor front view.",
  },
  141: {
    category: "Technology",
    label: "Task Lamp",
    role: "Complete desk lamp.",
  },
  147: {
    category: "Technology",
    label: "Desktop Computer Tower",
    role: "Complete computer tower or small workstation unit.",
  },
  156: {
    category: "Documents",
    label: "Document Tray",
    role: "Paper tray or file stack for desk detail.",
  },
  165: {
    category: "Equipment",
    label: "Wide Office Printer",
    role: "Complete printer/copier.",
  },
  166: {
    category: "Equipment",
    label: "Compact Office Printer",
    role: "Complete printer/copier variant.",
  },
  170: {
    category: "Wall Items",
    label: "Blank Whiteboard",
    role: "Complete whiteboard for planning walls.",
  },
  171: {
    category: "Wall Items",
    label: "Planning Board",
    role: "Complete board with chart content.",
  },
  172: {
    category: "Wall Items",
    label: "Presentation Board",
    role: "Complete board with colorful notes.",
  },
  173: {
    category: "Equipment",
    label: "Water Cooler",
    role: "Complete break-area object.",
  },
  174: {
    category: "Storage",
    label: "Wall Cabinet",
    role: "Complete cabinet or wall-mounted storage.",
  },
  175: {
    category: "Equipment",
    label: "Snack Vending Machine",
    role: "Complete vending machine.",
  },
  176: {
    category: "Storage",
    label: "Tall Storage Cabinet",
    role: "Complete cabinet or server-style storage.",
  },
  177: {
    category: "Workstations",
    label: "Printer Workstation",
    role: "Complete printer/copier station.",
  },
  178: {
    category: "Workstations",
    label: "Printer Station With Supplies",
    role: "Complete office equipment cluster.",
  },
  225: {
    category: "Workstations",
    label: "Analyst Desk With Monitor",
    role: "Complete desk setup with screen and desk items.",
  },
  227: {
    category: "Workstations",
    label: "Dual Monitor Analyst Station",
    role: "Complete evidence or dashboard workstation.",
  },
  229: {
    category: "Workstations",
    label: "Compact Computer Desk",
    role: "Complete desk setup.",
  },
  231: {
    category: "Workstations",
    label: "Dual Screen Workstation",
    role: "Complete workstation with multiple screens.",
  },
  233: {
    category: "Workstations",
    label: "Desk With Monitor And Files",
    role: "Complete desk setup with documents.",
  },
  235: {
    category: "Workstations",
    label: "Desk With Monitor And Notes",
    role: "Complete desk setup with note board.",
  },
  275: {
    category: "Technology",
    label: "Standing Display Monitor",
    role: "Complete display stand.",
  },
  276: {
    category: "Technology",
    label: "White Standing Display",
    role: "Complete display stand variant.",
  },
  277: {
    category: "Technology",
    label: "Angled Blue Monitor",
    role: "Complete standalone monitor.",
  },
  278: {
    category: "Technology",
    label: "Blue Monitor Front",
    role: "Complete standalone monitor front.",
  },
  320: {
    category: "Workstations",
    label: "Busy Desk With Supplies",
    role: "Complete cluttered work desk.",
  },
  321: {
    category: "Workstations",
    label: "Busy Desk Alternate",
    role: "Complete cluttered desk variant.",
  },
  323: {
    category: "Workstations",
    label: "Office Printer Desk",
    role: "Complete printer desk setup.",
  },
  324: {
    category: "Workstations",
    label: "Printer Desk Front View",
    role: "Complete printer desk variant.",
  },
  325: {
    category: "Workstations",
    label: "Printer Desk With Cabinet",
    role: "Complete printer station.",
  },
  329: {
    category: "Bags",
    label: "Blue Backpack",
    role: "Complete bag object.",
  },
  331: {
    category: "Bags",
    label: "Orange Backpack",
    role: "Complete bag object.",
  },
  333: {
    category: "Bags",
    label: "Gray Backpack",
    role: "Complete bag object.",
  },
  335: {
    category: "Bags",
    label: "Yellow Backpack",
    role: "Complete bag object.",
  },
  337: {
    category: "Plants",
    label: "Small Floor Plant",
    role: "Complete plant.",
  },
  338: {
    category: "Plants",
    label: "Clustered Office Plant",
    role: "Complete plant cluster.",
  },
  339: {
    category: "Plants",
    label: "Large Plant Cluster",
    role: "Complete large plant cluster.",
  },
};

const completeOfficeSingles: SpritePreset[] = starterAssetNumbers.map(
  (number) => {
    const metadata = namedOfficeSingles[number];
    return {
      ...metadata,
      defaultSize: { width: 2, height: 3 },
      id: `office-single-${number}`,
      sprite: { image: officeSingleKey(number), sx: 0, sy: 0, sw: 96, sh: 144 },
    };
  },
);

const modularOfficeSingles: SpritePreset[] = Array.from(
  { length: 339 },
  (_, index) => {
    const number = index + 1;
    if (namedOfficeSingles[number]) {
      return null;
    }
    const metadata = getOfficeSingleFallbackMetadata(number);
    return {
      ...metadata,
      defaultSize: { width: 2, height: 3 },
      id: `office-single-${number}`,
      sprite: { image: officeSingleKey(number), sx: 0, sy: 0, sw: 96, sh: 144 },
    };
  },
).filter((item): item is SpritePreset => Boolean(item));

const presets: SpritePreset[] = [
  {
    category: "Sheets",
    id: "raw-office-sheet",
    label: "Raw Office Sheet",
    role: "Advanced sheet crop. Use only when singles do not cover the object.",
    defaultSize: { width: 1, height: 1 },
    sprite: { image: "office", sx: 0, sy: 0, sw: 48, sh: 48 },
  },
  ...completeOfficeSingles,
  ...modularOfficeSingles,
];

const editorScenes = scenes;
const layoutEditorStorageKey = "enablementQuestRoomLayouts.v3";
const layoutEditorPortalStorageKey = "enablementQuestRoomPortals.v1";
const layoutEditorBlockStorageKey = "enablementQuestRoomBlocks.v1";
const layoutEditorCharacterStorageKey = "enablementQuestCharacterSettings.v1";
const savedLayoutLibraryStorageKey = "enablementQuestSavedRoomLayouts.v1";
const legacyLayoutEditorStorageKeys = [
  "enablementQuestRoomLayouts",
  "enablementQuestRoomLayouts.v2",
];
const officeTileSize = 48;
const officeColumns = officeSheet.width / officeTileSize;
const officeRows = officeSheet.height / officeTileSize;
const resizeHandles: ResizeHandle[] = [
  "top-left",
  "top",
  "top-right",
  "right",
  "bottom-right",
  "bottom",
  "bottom-left",
  "left",
];

function isCornerResizeHandle(handle: ResizeHandle) {
  return handle.includes("-left") || handle.includes("-right");
}

function officeSingleKey(number: number) {
  return `officeSingle${number}`;
}

function getOfficeSingleFallbackMetadata(number: number) {
  if (number <= 95) {
    return {
      category: "Modular Desk/Table Pieces",
      label: `Modular Desk Or Counter Piece ${number}`,
      role: "Piece, not a complete object. Combine with matching pieces intentionally.",
    };
  }
  if (number <= 128) {
    return {
      category: "Small Office Objects",
      label: `Small Office Object ${number}`,
      role: "Small item; inspect visually before placing.",
    };
  }
  if (number <= 160) {
    return {
      category: "Technology And Desk Tools",
      label: `Technology Or Desk Tool ${number}`,
      role: "Monitor, lamp, device, or paper detail; inspect before placing.",
    };
  }
  if (number <= 178) {
    return {
      category: "Wall Items And Equipment",
      label: `Wall Item Or Office Equipment ${number}`,
      role: "Board, cabinet, printer, cooler, or wall-mounted item.",
    };
  }
  if (number <= 224) {
    return {
      category: "Modular Desk/Table Pieces",
      label: `Modular Divider Or Desk Piece ${number}`,
      role: "Piece, not a complete room object. Use for custom assemblies.",
    };
  }
  if (number <= 244) {
    return {
      category: "Workstation Pieces",
      label: `Workstation Detail ${number}`,
      role: "Desk cluster, technology, or small workstation detail.",
    };
  }
  if (number <= 305) {
    return {
      category: "Modular Desk/Table Pieces",
      label: `Modular Desk Or Counter Piece ${number}`,
      role: "Piece, not a complete object. Combine with matching pieces intentionally.",
    };
  }
  if (number <= 328) {
    return {
      category: "Workstations",
      label: `Complete Office Station ${number}`,
      role: "Likely complete desk or equipment station; inspect before placing.",
    };
  }
  if (number <= 336) {
    return {
      category: "Bags",
      label: `Backpack Or Bag ${number}`,
      role: "Complete bag object.",
    };
  }
  return {
    category: "Plants",
    label: `Plant Cluster ${number}`,
    role: "Complete plant or foliage cluster.",
  };
}

const roomThemes = {
  hub: {
    accent: "#38bdf8",
    fill: "rgba(14, 165, 233, 0.08)",
    title: "Campus Yard",
  },
  lab: {
    accent: "#8b5cf6",
    fill: "rgba(124, 58, 237, 0.08)",
    title: "Learning Systems Lab",
  },
  operations: {
    accent: "#f59e0b",
    fill: "rgba(120, 53, 15, 0.07)",
    title: "Onboarding Diagnostic Room",
  },
  sales: {
    accent: "#22d3ee",
    fill: "rgba(8, 145, 178, 0.07)",
    title: "Sales Enablement Studio",
  },
} as const;

function propToEditorItem(prop: Prop): EditorItem {
  const matchingPreset = presets.find(
    (preset) =>
      preset.sprite.sx === prop.sprite?.sx &&
      preset.sprite.sy === prop.sprite?.sy &&
      preset.sprite.sw === prop.sprite?.sw &&
      preset.sprite.sh === prop.sprite?.sh,
  );
  return {
    collision: Boolean(prop.collision),
    description: prop.description ?? "",
    id: prop.id,
    label: prop.label ?? "",
    position: prop.position,
    presetId: matchingPreset?.id ?? "custom",
    size: prop.size,
    sprite: prop.sprite ?? presets[0].sprite,
    spriteTransform: prop.spriteTransform,
    zIndex: prop.zIndex,
  };
}

function createItem(preset: SpritePreset, index: number): EditorItem {
  return {
    collision: true,
    description: "",
    id: `${preset.id}-${index + 1}`,
    label: preset.label,
    position: { x: 2 + (index % 4) * 3.5, y: 2 + Math.floor(index / 4) * 2 },
    presetId: preset.id,
    size: preset.defaultSize,
    sprite: preset.sprite,
  };
}

function createTileItem(tile: RawTile, index: number): EditorItem {
  return {
    collision: true,
    description: "",
    id: `${tile.id}-${index + 1}`,
    label: "",
    position: {
      x: 2 + (index % 5) * 1.25,
      y: 2 + Math.floor(index / 5) * 1.25,
    },
    presetId: tile.id,
    size: { width: 1, height: 1 },
    sprite: tile.sprite,
  };
}

function getCurrentGameLayouts() {
  return Object.fromEntries(
    editorScenes.map((item) => [
      item.id,
      item.props
        .filter((prop) => prop.sprite)
        .map((prop) => propToEditorItem(prop)),
    ]),
  );
}

function getCurrentPortalLayouts() {
  return Object.fromEntries(
    editorScenes.map((scene) => [
      scene.id,
      scene.portals.map((portal) => ({ ...portal })),
    ]),
  );
}

function getCurrentBlockLayouts() {
  return Object.fromEntries(
    editorScenes.map((scene) => [
      scene.id,
      scene.blocks.map((block, index) => ({
        id: `${scene.id}-block-${index + 1}`,
        label: `Walk block ${index + 1}`,
        rect: { ...block },
      })),
    ]),
  );
}

function getCurrentCharacterSettings() {
  return Object.fromEntries(
    editorScenes.map((scene) => [
      scene.id,
      characters
        .filter((character) => character.sceneId === scene.id)
        .map((character) => ({
          id: character.id,
          name: character.name,
          pauseMaxMs: character.movement?.pauseMaxMs ?? 2300,
          pauseMinMs: character.movement?.pauseMinMs ?? 900,
          patrol: character.patrol?.map((point) => ({ ...point })),
          sceneId: character.sceneId,
          speed: character.movement?.speed ?? 0.012,
        })),
    ]),
  );
}

function getSceneName(sceneId: string) {
  return editorScenes.find((scene) => scene.id === sceneId)?.name ?? sceneId;
}

function getBlankLayouts() {
  return Object.fromEntries(editorScenes.map((item) => [item.id, []]));
}

function createOfficeSingleItem({
  collision = true,
  description = "",
  groupId,
  groupLabel,
  hideLabel,
  id,
  label,
  number,
  position,
  size = { width: 2, height: 3 },
}: {
  collision?: boolean;
  description?: string;
  groupId?: string;
  groupLabel?: string;
  hideLabel?: boolean;
  id: string;
  label?: string;
  number: number;
  position: { x: number; y: number };
  size?: { width: number; height: number };
}): EditorItem {
  const metadata =
    namedOfficeSingles[number] ?? getOfficeSingleFallbackMetadata(number);
  return {
    collision,
    description,
    groupId,
    groupLabel,
    hideLabel,
    id,
    label: label ?? metadata.label,
    position,
    presetId: `office-single-${number}`,
    size,
    sprite: { image: officeSingleKey(number), sx: 0, sy: 0, sw: 96, sh: 144 },
  };
}

const exampleGroupLabels: Record<string, string> = {
  "lab-inbox-desk": "Leadership Inbox Desk",
  "lab-review-wall": "Case Review Wall",
  "lab-resource-corner": "Resource Corner",
  "lab-reading-corner": "Quiet Planning Corner",
  "lab-canvas-desk": "Diagnostic Canvas Desk",
  "lab-research-wall": "Research Wall",
  "lab-tools-corner": "Tools Corner",
  "sales-call-zone": "Call Review Zone",
  "sales-coaching-zone": "Coaching Zone",
  "sales-dashboard-zone": "Pipeline Dashboard Zone",
  "sales-deck-zone": "Deck Review Zone",
  "sales-leadership-wall": "Leadership Review Wall",
  "sales-practice-pod": "Practice Pod",
  "sales-strategy-desk": "Strategy Desk",
  "sales-war-room": "Deal War Room",
  "ops-break-zone": "Break Area",
  "ops-map-wall": "Process Map Wall",
  "ops-metrics-zone": "Metrics Zone",
  "ops-survey-zone": "Survey Review Zone",
  "ops-ticket-zone": "Ticket Review Zone",
};

function applyExampleGroupLabels(items: EditorItem[]) {
  return items.map((item) =>
    item.groupId && exampleGroupLabels[item.groupId]
      ? {
          ...item,
          groupLabel: exampleGroupLabels[item.groupId],
          hideLabel: true,
        }
      : item,
  );
}

function getExampleLayouts(sceneId: string): Array<{
  description: string;
  id: string;
  items: EditorItem[];
  title: string;
}> {
  if (sceneId === "lab") {
    return [
      {
        id: "lab-consulting-base",
        title: "Consulting Base Lab",
        description:
          "A starter lab with a leadership inbox desk, review board, resource shelf, and quiet planning corner.",
        items: applyExampleGroupLabels([
          createOfficeSingleItem({
            groupId: "lab-inbox-desk",
            id: "lab-inbox-workstation",
            label: "Leadership Email Workstation",
            number: 225,
            position: { x: 3.1, y: 3.1 },
            size: { width: 2.6, height: 2.2 },
          }),
          createOfficeSingleItem({
            groupId: "lab-inbox-desk",
            id: "lab-inbox-chair",
            label: "Desk Chair",
            number: 101,
            position: { x: 3.4, y: 5.1 },
            size: { width: 1.4, height: 1.8 },
          }),
          createOfficeSingleItem({
            groupId: "lab-review-wall",
            id: "lab-review-board",
            label: "Case Review Board",
            number: 171,
            position: { x: 8.3, y: 2.5 },
            size: { width: 2.6, height: 1.8 },
          }),
          createOfficeSingleItem({
            groupId: "lab-review-wall",
            id: "lab-standing-display",
            label: "Impact Display",
            number: 275,
            position: { x: 11.1, y: 2.8 },
            size: { width: 1.6, height: 2.1 },
          }),
          createOfficeSingleItem({
            groupId: "lab-resource-corner",
            id: "lab-resource-cabinet",
            label: "Resource Cabinet",
            number: 176,
            position: { x: 13.6, y: 6.3 },
            size: { width: 1.7, height: 2.4 },
          }),
          createOfficeSingleItem({
            groupId: "lab-resource-corner",
            id: "lab-water-cooler",
            label: "Water Cooler",
            number: 173,
            position: { x: 15.2, y: 6.4 },
            size: { width: 1.2, height: 2 },
          }),
          createOfficeSingleItem({
            groupId: "lab-reading-corner",
            id: "lab-chair-left",
            label: "Reading Chair",
            number: 107,
            position: { x: 2.1, y: 8.6 },
            size: { width: 1.4, height: 1.8 },
          }),
          createOfficeSingleItem({
            groupId: "lab-reading-corner",
            id: "lab-plant",
            label: "Corner Plant",
            number: 338,
            position: { x: 1.1, y: 8 },
            size: { width: 1.6, height: 2.2 },
          }),
        ]),
      },
      {
        id: "lab-diagnostic-review",
        title: "Diagnostic Review Lab",
        description:
          "A more open lab with a central canvas desk, research wall, and tools corner for a cleaner walkthrough.",
        items: applyExampleGroupLabels([
          createOfficeSingleItem({
            groupId: "lab-canvas-desk",
            id: "lab-canvas-workstation",
            label: "Diagnostic Canvas Workstation",
            number: 231,
            position: { x: 6.2, y: 5.2 },
            size: { width: 2.8, height: 2.2 },
          }),
          createOfficeSingleItem({
            groupId: "lab-canvas-desk",
            id: "lab-canvas-chair",
            label: "Canvas Chair",
            number: 101,
            position: { x: 6.7, y: 7.1 },
            size: { width: 1.4, height: 1.8 },
          }),
          createOfficeSingleItem({
            groupId: "lab-research-wall",
            id: "lab-research-board",
            label: "Research Board",
            number: 172,
            position: { x: 3, y: 2.5 },
            size: { width: 2.6, height: 1.8 },
          }),
          createOfficeSingleItem({
            groupId: "lab-research-wall",
            id: "lab-research-display",
            label: "Research Display",
            number: 276,
            position: { x: 5.8, y: 2.7 },
            size: { width: 1.6, height: 2.1 },
          }),
          createOfficeSingleItem({
            groupId: "lab-tools-corner",
            id: "lab-tools-printer",
            label: "Tool Printer",
            number: 177,
            position: { x: 12.3, y: 3.2 },
            size: { width: 2.3, height: 2 },
          }),
          createOfficeSingleItem({
            groupId: "lab-tools-corner",
            id: "lab-tools-cabinet",
            label: "Tool Cabinet",
            number: 176,
            position: { x: 14.7, y: 3.1 },
            size: { width: 1.6, height: 2.3 },
          }),
          createOfficeSingleItem({
            groupId: "lab-reading-corner",
            id: "lab-review-plant",
            label: "Review Plant",
            number: 339,
            position: { x: 2, y: 8.4 },
            size: { width: 1.8, height: 2.2 },
          }),
          createOfficeSingleItem({
            groupId: "lab-reading-corner",
            id: "lab-review-chair",
            label: "Review Chair",
            number: 108,
            position: { x: 3.4, y: 8.5 },
            size: { width: 1.4, height: 1.8 },
          }),
        ]),
      },
    ];
  }
  if (sceneId === "sales") {
    return [
      {
        id: "sales-deal-war-room",
        title: "Deal War Room",
        description:
          "A leadership-review layout with the pipeline wall up front, deal review desk left, and coaching tools along the right side.",
        items: applyExampleGroupLabels([
          createOfficeSingleItem({
            groupId: "sales-leadership-wall",
            id: "sales-war-room-board",
            label: "Leadership Review Board",
            number: 172,
            position: { x: 7.1, y: 2.1 },
            size: { width: 3, height: 1.9 },
          }),
          createOfficeSingleItem({
            groupId: "sales-leadership-wall",
            id: "sales-war-room-display",
            label: "Pipeline Display",
            number: 276,
            position: { x: 10.5, y: 2.35 },
            size: { width: 1.7, height: 2.2 },
          }),
          createOfficeSingleItem({
            groupId: "sales-war-room",
            id: "sales-war-room-table-a",
            label: "Deal Review Table",
            number: 229,
            position: { x: 3, y: 5.1 },
            size: { width: 2.5, height: 2.1 },
          }),
          createOfficeSingleItem({
            groupId: "sales-war-room",
            id: "sales-war-room-chair-a",
            label: "Review Chair",
            number: 101,
            position: { x: 3.3, y: 7.1 },
            size: { width: 1.4, height: 1.7 },
          }),
          createOfficeSingleItem({
            groupId: "sales-coaching-zone",
            id: "sales-war-room-coaching-desk",
            label: "Manager Coaching Desk",
            number: 233,
            position: { x: 12.2, y: 5.5 },
            size: { width: 2.7, height: 2.2 },
          }),
          createOfficeSingleItem({
            groupId: "sales-coaching-zone",
            id: "sales-war-room-files",
            label: "Coaching File Cabinet",
            number: 176,
            position: { x: 14.8, y: 5.4 },
            size: { width: 1.45, height: 2.2 },
          }),
          createOfficeSingleItem({
            groupId: "sales-deck-zone",
            id: "sales-war-room-deck-station",
            label: "Deck Review Monitor",
            number: 225,
            position: { x: 7.2, y: 8.1 },
            size: { width: 2.5, height: 2.1 },
          }),
        ]),
      },
      {
        id: "sales-practice-studio",
        title: "Practice And Coaching Studio",
        description:
          "A room built around behavior practice: call review on the left, practice pod center, and manager rubric station on the right.",
        items: applyExampleGroupLabels([
          createOfficeSingleItem({
            groupId: "sales-call-zone",
            id: "sales-practice-call-review",
            label: "Call Review Screen",
            number: 275,
            position: { x: 2.3, y: 2.6 },
            size: { width: 1.8, height: 2.3 },
          }),
          createOfficeSingleItem({
            groupId: "sales-call-zone",
            id: "sales-practice-call-desk",
            label: "Call Notes Desk",
            number: 227,
            position: { x: 2.7, y: 5.1 },
            size: { width: 2.7, height: 2.2 },
          }),
          createOfficeSingleItem({
            groupId: "sales-practice-pod",
            id: "sales-practice-center-desk",
            label: "Discovery Practice Desk",
            number: 235,
            position: { x: 7.5, y: 5.1 },
            size: { width: 2.7, height: 2.2 },
          }),
          createOfficeSingleItem({
            groupId: "sales-practice-pod",
            id: "sales-practice-chair",
            label: "Practice Chair",
            number: 102,
            position: { x: 8, y: 7.1 },
            size: { width: 1.35, height: 1.7 },
          }),
          createOfficeSingleItem({
            groupId: "sales-coaching-zone",
            id: "sales-practice-rubric-board",
            label: "Coaching Rubric Board",
            number: 171,
            position: { x: 12.1, y: 2.5 },
            size: { width: 2.6, height: 1.8 },
          }),
          createOfficeSingleItem({
            groupId: "sales-coaching-zone",
            id: "sales-practice-manager-desk",
            label: "Manager Coaching Desk",
            number: 231,
            position: { x: 12.1, y: 5.1 },
            size: { width: 2.7, height: 2.2 },
          }),
          createOfficeSingleItem({
            groupId: "sales-strategy-desk",
            id: "sales-practice-resource-shelf",
            label: "Resource Shelf",
            number: 176,
            position: { x: 6.7, y: 2.3 },
            size: { width: 1.5, height: 2.2 },
          }),
        ]),
      },
      {
        id: "sales-enablement-pod",
        title: "Sales Enablement Pod",
        description:
          "A cleaner sales case room with a deck review desk, call review station, dashboard station, and coaching desk.",
        items: applyExampleGroupLabels([
          createOfficeSingleItem({
            groupId: "sales-deck-zone",
            id: "sales-deck-workstation",
            label: "Sales Deck Review Station",
            number: 235,
            position: { x: 3.1, y: 3.2 },
            size: { width: 2.5, height: 2.2 },
          }),
          createOfficeSingleItem({
            groupId: "sales-deck-zone",
            id: "sales-deck-chair",
            label: "Review Chair",
            number: 102,
            position: { x: 3.5, y: 5.1 },
            size: { width: 1.3, height: 1.6 },
          }),
          createOfficeSingleItem({
            groupId: "sales-call-zone",
            id: "sales-call-workstation",
            label: "Call Review Workstation",
            number: 227,
            position: { x: 7.4, y: 5.9 },
            size: { width: 2.8, height: 2.2 },
          }),
          createOfficeSingleItem({
            groupId: "sales-dashboard-zone",
            id: "sales-dashboard-display",
            label: "Pipeline Dashboard",
            number: 172,
            position: { x: 12.1, y: 2.6 },
            size: { width: 2.5, height: 1.8 },
          }),
          createOfficeSingleItem({
            groupId: "sales-dashboard-zone",
            id: "sales-dashboard-desk",
            label: "Operations Monitor Desk",
            number: 231,
            position: { x: 12, y: 4.7 },
            size: { width: 2.7, height: 2.2 },
          }),
          createOfficeSingleItem({
            groupId: "sales-coaching-zone",
            id: "sales-coaching-printer",
            label: "Coaching Print Station",
            number: 178,
            position: { x: 13.9, y: 8.1 },
            size: { width: 2.4, height: 2 },
          }),
          createOfficeSingleItem({
            groupId: "sales-coaching-zone",
            id: "sales-coaching-plant",
            label: "Studio Plant",
            number: 98,
            position: { x: 1.6, y: 7.8 },
            size: { width: 1.3, height: 2.2 },
          }),
        ]),
      },
    ];
  }
  if (sceneId === "operations") {
    return [
      {
        id: "operations-diagnostic-room",
        title: "Operations Diagnostic Room",
        description:
          "A workflow-focused room with an onboarding map, ticket review station, survey table, and metrics board.",
        items: applyExampleGroupLabels([
          createOfficeSingleItem({
            groupId: "ops-map-wall",
            id: "ops-process-board",
            label: "Onboarding Process Map",
            number: 170,
            position: { x: 7.1, y: 2.5 },
            size: { width: 2.8, height: 1.8 },
          }),
          createOfficeSingleItem({
            groupId: "ops-ticket-zone",
            id: "ops-ticket-workstation",
            label: "Support Ticket Review Desk",
            number: 233,
            position: { x: 2.8, y: 4.1 },
            size: { width: 2.7, height: 2.2 },
          }),
          createOfficeSingleItem({
            groupId: "ops-ticket-zone",
            id: "ops-ticket-chair",
            label: "Ticket Review Chair",
            number: 101,
            position: { x: 3.2, y: 6.1 },
            size: { width: 1.4, height: 1.7 },
          }),
          createOfficeSingleItem({
            groupId: "ops-survey-zone",
            id: "ops-survey-desk",
            label: "New Hire Survey Desk",
            number: 229,
            position: { x: 8.1, y: 7.1 },
            size: { width: 2.4, height: 2.1 },
          }),
          createOfficeSingleItem({
            groupId: "ops-metrics-zone",
            id: "ops-metrics-display",
            label: "Ramp Metrics Display",
            number: 276,
            position: { x: 12.6, y: 4.1 },
            size: { width: 1.6, height: 2.2 },
          }),
          createOfficeSingleItem({
            groupId: "ops-metrics-zone",
            id: "ops-printer-station",
            label: "Checklist Print Station",
            number: 177,
            position: { x: 13.8, y: 7.1 },
            size: { width: 2.3, height: 2 },
          }),
          createOfficeSingleItem({
            groupId: "ops-break-zone",
            id: "ops-water-cooler",
            label: "Operations Water Cooler",
            number: 173,
            position: { x: 1.2, y: 8.1 },
            size: { width: 1.2, height: 2 },
          }),
        ]),
      },
    ];
  }
  return [];
}

export function RoomLayoutEditor() {
  const [sceneId, setSceneId] = useState<string>(editorScenes[0]?.id ?? "lab");
  const [tileRow, setTileRow] = useState(0);
  const [assetCategory, setAssetCategory] = useState(
    "Complete Starter Objects",
  );
  const [assetSearch, setAssetSearch] = useState("");
  const [showWalkBlocks, setShowWalkBlocks] = useState(false);
  const [showPlayerScaleReference, setShowPlayerScaleReference] =
    useState(true);
  const [playerScaleReferencePosition, setPlayerScaleReferencePosition] =
    useState({ x: 1.5, y: 9.8 });
  const scene = useMemo(
    () => editorScenes.find((item) => item.id === sceneId) ?? editorScenes[0],
    [sceneId],
  );
  const categorizedPresets = useMemo(() => {
    if (assetCategory === "Complete Starter Objects") {
      return completeOfficeSingles;
    }
    return presets.filter((preset) => preset.category === assetCategory);
  }, [assetCategory]);
  const visiblePresets = useMemo(() => {
    const query = assetSearch.trim().toLowerCase();
    if (!query) {
      return categorizedPresets;
    }
    return categorizedPresets.filter(
      (preset) =>
        preset.label.toLowerCase().includes(query) ||
        preset.role.toLowerCase().includes(query) ||
        preset.category.toLowerCase().includes(query),
    );
  }, [assetSearch, categorizedPresets]);
  const assetCategories = useMemo(
    () => [
      "Complete Starter Objects",
      ...Array.from(new Set(presets.map((preset) => preset.category))).sort(),
    ],
    [],
  );
  const exampleLayouts = useMemo(() => getExampleLayouts(scene.id), [scene.id]);
  const [itemsByScene, setItemsByScene] = useState<
    Record<string, EditorItem[]>
  >(() => {
    for (const key of legacyLayoutEditorStorageKeys) {
      window.localStorage.removeItem(key);
    }
    const blankLayouts = getBlankLayouts();
    const savedLayouts = window.localStorage.getItem(layoutEditorStorageKey);
    if (!savedLayouts) {
      return blankLayouts;
    }
    try {
      return { ...blankLayouts, ...JSON.parse(savedLayouts) };
    } catch {
      return blankLayouts;
    }
  });
  const [portalsByScene, setPortalsByScene] = useState<
    Record<string, EditorPortal[]>
  >(() => {
    const currentPortalLayouts = getCurrentPortalLayouts();
    const savedPortals = window.localStorage.getItem(
      layoutEditorPortalStorageKey,
    );
    if (!savedPortals) {
      return currentPortalLayouts;
    }
    try {
      return { ...currentPortalLayouts, ...JSON.parse(savedPortals) };
    } catch {
      return currentPortalLayouts;
    }
  });
  const [blocksByScene, setBlocksByScene] = useState<
    Record<string, EditorBlock[]>
  >(() => {
    const currentBlockLayouts = getCurrentBlockLayouts();
    const savedBlocks = window.localStorage.getItem(
      layoutEditorBlockStorageKey,
    );
    if (!savedBlocks) {
      return currentBlockLayouts;
    }
    try {
      return { ...currentBlockLayouts, ...JSON.parse(savedBlocks) };
    } catch {
      return currentBlockLayouts;
    }
  });
  const [characterSettingsByScene, setCharacterSettingsByScene] = useState<
    Record<string, EditorCharacterSettings[]>
  >(() => {
    const currentCharacterSettings = getCurrentCharacterSettings();
    const savedCharacterSettings = window.localStorage.getItem(
      layoutEditorCharacterStorageKey,
    );
    if (!savedCharacterSettings) {
      return currentCharacterSettings;
    }
    try {
      return {
        ...currentCharacterSettings,
        ...JSON.parse(savedCharacterSettings),
      };
    } catch {
      return currentCharacterSettings;
    }
  });
  const items = itemsByScene[scene.id] ?? [];
  const portals = portalsByScene[scene.id] ?? [];
  const blocks = blocksByScene[scene.id] ?? [];
  const characterSettings = characterSettingsByScene[scene.id] ?? [];
  const [savedLayoutName, setSavedLayoutName] = useState("");
  const [savedLayouts, setSavedLayouts] = useState<SavedEditorLayout[]>(() => {
    const saved = window.localStorage.getItem(savedLayoutLibraryStorageKey);
    if (!saved) {
      return [];
    }
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedPortalId, setSelectedPortalId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [history, setHistory] = useState<EditorHistorySnapshot[]>([]);
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const [editingLabel, setEditingLabel] = useState<EditingLabel>(null);
  const clipboardRef = useRef<EditorClipboard | null>(null);
  const stageViewportRef = useRef<HTMLDivElement | null>(null);
  const panStateRef = useRef<{
    left: number;
    startClientX: number;
    startClientY: number;
    top: number;
  } | null>(null);
  const [isSpacePanning, setIsSpacePanning] = useState(false);
  const selectedItem =
    items.find((item) => item.id === selectedIds[selectedIds.length - 1]) ??
    null;
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const selectedPortal =
    portals.find((portal) => portal.id === selectedPortalId) ?? null;
  const selectedBlock =
    blocks.find((block) => block.id === selectedBlockId) ?? null;
  const selectedBounds = useMemo(
    () => getItemsBounds(selectedItems),
    [selectedItems],
  );
  const selectionResizeStartRef = useRef<{
    bounds: EditorBounds;
    itemIds: string[];
    items: EditorItem[];
  } | null>(null);
  const groupOverlays = useMemo(() => getGroupOverlays(items), [items]);
  const renderedItems = useMemo(() => getRenderedEditorItems(items), [items]);

  useEffect(() => {
    window.localStorage.setItem(
      layoutEditorStorageKey,
      JSON.stringify(itemsByScene),
    );
  }, [itemsByScene]);

  useEffect(() => {
    window.localStorage.setItem(
      layoutEditorPortalStorageKey,
      JSON.stringify(portalsByScene),
    );
  }, [portalsByScene]);

  useEffect(() => {
    window.localStorage.setItem(
      layoutEditorBlockStorageKey,
      JSON.stringify(blocksByScene),
    );
  }, [blocksByScene]);

  useEffect(() => {
    window.localStorage.setItem(
      layoutEditorCharacterStorageKey,
      JSON.stringify(characterSettingsByScene),
    );
  }, [characterSettingsByScene]);

  useEffect(() => {
    window.localStorage.setItem(
      savedLayoutLibraryStorageKey,
      JSON.stringify(savedLayouts),
    );
  }, [savedLayouts]);

  useEffect(() => {
    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (shouldIgnoreKeyboardTarget(event.target)) {
        return;
      }
      if (event.code === "Space") {
        event.preventDefault();
        setIsSpacePanning(true);
      }
    }

    function handleKeyUp(event: globalThis.KeyboardEvent) {
      if (event.code === "Space") {
        setIsSpacePanning(false);
        panStateRef.current = null;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardEvent);
    return () => window.removeEventListener("keydown", handleKeyboardEvent);
  });

  function saveHistory() {
    setHistory((previous) => [
      ...previous.slice(-29),
      {
        blocksByScene,
        characterSettingsByScene,
        itemsByScene,
        portalsByScene,
        selectedBlockId,
        selectedIds,
        selectedPortalId,
      },
    ]);
  }

  function updateItems(nextItems: EditorItem[], saveSnapshot = true) {
    updateItemsForScene(scene.id, nextItems, saveSnapshot);
  }

  function updateItemsForScene(
    nextSceneId: string,
    nextItems: EditorItem[],
    saveSnapshot = true,
  ) {
    if (saveSnapshot) {
      saveHistory();
    }
    setItemsByScene((previous) => ({ ...previous, [nextSceneId]: nextItems }));
  }

  function updatePortals(nextPortals: EditorPortal[], saveSnapshot = true) {
    updatePortalsForScene(scene.id, nextPortals, saveSnapshot);
  }

  function updatePortalsForScene(
    nextSceneId: string,
    nextPortals: EditorPortal[],
    saveSnapshot = true,
  ) {
    if (saveSnapshot) {
      saveHistory();
    }
    setPortalsByScene((previous) => ({
      ...previous,
      [nextSceneId]: nextPortals,
    }));
  }

  function updateBlocks(nextBlocks: EditorBlock[], saveSnapshot = true) {
    if (saveSnapshot) {
      saveHistory();
    }
    setBlocksByScene((previous) => ({
      ...previous,
      [scene.id]: nextBlocks,
    }));
  }

  function updateBlocksForScene(
    nextSceneId: string,
    nextBlocks: EditorBlock[],
    saveSnapshot = true,
  ) {
    if (saveSnapshot) {
      saveHistory();
    }
    setBlocksByScene((previous) => ({
      ...previous,
      [nextSceneId]: nextBlocks,
    }));
  }

  function updateCharacterSettings(
    nextSettings: EditorCharacterSettings[],
    nextSceneId = scene.id,
    saveSnapshot = true,
  ) {
    if (saveSnapshot) {
      saveHistory();
    }
    setCharacterSettingsByScene((previous) => ({
      ...previous,
      [nextSceneId]: nextSettings,
    }));
  }

  function updateCharacterSetting(
    characterId: string,
    patch: Partial<EditorCharacterSettings>,
  ) {
    updateCharacterSettings(
      characterSettings.map((setting) =>
        setting.id === characterId ? { ...setting, ...patch } : setting,
      ),
    );
  }

  function loadCurrentRoomLayout() {
    const currentLayouts = getCurrentGameLayouts();
    const currentPortalLayouts = getCurrentPortalLayouts();
    const currentBlockLayouts = getCurrentBlockLayouts();
    const currentCharacterSettings = getCurrentCharacterSettings();
    const nextItems = currentLayouts[scene.id] ?? [];
    const nextPortals = currentPortalLayouts[scene.id] ?? [];
    const nextBlocks = currentBlockLayouts[scene.id] ?? [];
    const nextCharacterSettings = currentCharacterSettings[scene.id] ?? [];
    updateItems(nextItems);
    updatePortals(nextPortals, false);
    updateBlocks(nextBlocks, false);
    updateCharacterSettings(nextCharacterSettings, scene.id, false);
    setSelectedIds(nextItems[0] ? [nextItems[0].id] : []);
    setSelectedPortalId(null);
    setSelectedBlockId(null);
  }

  function clearRoomLayout() {
    updateItems([]);
    setSelectedIds([]);
  }

  function loadExampleLayout(nextItems: EditorItem[]) {
    updateItems(nextItems);
    setSelectedIds(nextItems[0] ? [nextItems[0].id] : []);
    setSelectedPortalId(null);
    setSelectedBlockId(null);
  }

  function saveNamedLayout() {
    const layoutName =
      savedLayoutName.trim() ||
      `${scene.name} ${new Date().toLocaleDateString()}`;
    const now = new Date().toISOString();
    const existingLayout = savedLayouts.find(
      (layout) => layout.sceneId === scene.id && layout.name === layoutName,
    );
    const nextLayout: SavedEditorLayout = {
      blocks,
      characterSettings,
      id: existingLayout?.id ?? `layout-${Date.now()}`,
      items,
      name: layoutName,
      portals,
      sceneId: scene.id,
      updatedAt: now,
    };
    setSavedLayouts((layouts) => [
      nextLayout,
      ...layouts.filter((layout) => layout.id !== nextLayout.id),
    ]);
    setSavedLayoutName(layoutName);
  }

  function loadSavedLayout(layout: SavedEditorLayout) {
    setSceneId(layout.sceneId);
    updateItemsForScene(layout.sceneId, layout.items);
    updatePortalsForScene(layout.sceneId, layout.portals, false);
    updateBlocksForScene(layout.sceneId, layout.blocks ?? [], false);
    updateCharacterSettings(
      layout.characterSettings ?? [],
      layout.sceneId,
      false,
    );
    setSelectedIds(layout.items[0] ? [layout.items[0].id] : []);
    setSelectedPortalId(null);
    setSelectedBlockId(null);
    setSavedLayoutName(layout.name);
  }

  function deleteSavedLayout(layoutId: string) {
    setSavedLayouts((layouts) =>
      layouts.filter((layout) => layout.id !== layoutId),
    );
  }

  function downloadLayoutBackup() {
    const backup = {
      currentDrafts: {
        blocksByScene,
        characterSettingsByScene,
        itemsByScene,
        portalsByScene,
      },
      exportedAt: new Date().toISOString(),
      savedLayouts,
      version: 1,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `enablement-quest-layouts-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function updateSelectedPortal(patch: Partial<EditorPortal>) {
    if (!selectedPortal) {
      return;
    }
    updatePortals(
      portals.map((portal) =>
        portal.id === selectedPortal.id ? { ...portal, ...patch } : portal,
      ),
    );
  }

  function updateSelectedBlock(patch: Partial<EditorBlock>) {
    if (!selectedBlock) {
      return;
    }
    updateBlocks(
      blocks.map((block) =>
        block.id === selectedBlock.id ? { ...block, ...patch } : block,
      ),
    );
  }

  function updateSelectedBlockRect(patch: Partial<Rect>) {
    if (!selectedBlock) {
      return;
    }
    updateSelectedBlock({
      rect: {
        ...selectedBlock.rect,
        ...patch,
      },
    });
  }

  function addWalkBlock() {
    const width = Math.min(2, scene.width);
    const height = Math.min(1.5, scene.height);
    const nextBlock: EditorBlock = {
      id: `${scene.id}-walk-block-${Date.now().toString(36)}`,
      label: `Walk block ${blocks.length + 1}`,
      rect: {
        height,
        width,
        x: roundToPrecision(
          clamp(scene.width / 2 - width / 2, 0, scene.width - width),
        ),
        y: roundToPrecision(
          clamp(scene.height / 2 - height / 2, 0, scene.height - height),
        ),
      },
    };
    updateBlocks([...blocks, nextBlock]);
    setSelectedIds([]);
    setSelectedPortalId(null);
    setSelectedBlockId(nextBlock.id);
    setShowWalkBlocks(true);
  }

  function moveBlock(
    blockId: string,
    dx: number,
    dy: number,
    saveSnapshot = true,
  ) {
    updateBlocks(
      blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              rect: {
                ...block.rect,
                x: clamp(block.rect.x + dx, 0, scene.width - block.rect.width),
                y: clamp(
                  block.rect.y + dy,
                  0,
                  scene.height - block.rect.height,
                ),
              },
            }
          : block,
      ),
      saveSnapshot,
    );
  }

  function resizeBlock(
    blockId: string,
    handle: ResizeHandle,
    dx: number,
    dy: number,
    saveSnapshot = true,
  ) {
    updateBlocks(
      blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              rect: resizeRect(block.rect, handle, dx, dy, scene),
            }
          : block,
      ),
      saveSnapshot,
    );
  }

  function movePortal(
    portalId: string,
    dx: number,
    dy: number,
    saveSnapshot = true,
  ) {
    updatePortals(
      portals.map((portal) =>
        portal.id === portalId
          ? {
              ...portal,
              rect: {
                ...portal.rect,
                x: clamp(
                  portal.rect.x + dx,
                  0,
                  scene.width - portal.rect.width,
                ),
                y: clamp(
                  portal.rect.y + dy,
                  0,
                  scene.height - portal.rect.height,
                ),
              },
            }
          : portal,
      ),
      saveSnapshot,
    );
  }

  function resizePortal(
    portalId: string,
    handle: ResizeHandle,
    dx: number,
    dy: number,
    saveSnapshot = true,
  ) {
    updatePortals(
      portals.map((portal) =>
        portal.id === portalId
          ? {
              ...portal,
              rect: resizeRect(portal.rect, handle, dx, dy, scene),
            }
          : portal,
      ),
      saveSnapshot,
    );
  }

  function movePlayerScaleReference(dx: number, dy: number) {
    setPlayerScaleReferencePosition((position) => ({
      x: clamp(position.x + dx, 0, scene.width - 1),
      y: clamp(position.y + dy, 0, scene.height - 2),
    }));
  }

  function updateSelected(patch: Partial<EditorItem>) {
    if (!selectedItem) {
      return;
    }
    updateItems(
      items.map((item) =>
        item.id === selectedItem.id ? { ...item, ...patch } : item,
      ),
    );
  }

  function updateSelectedItems(
    getPatch: (item: EditorItem) => Partial<EditorItem>,
  ) {
    if (selectedIds.length === 0) {
      return;
    }
    updateItems(
      items.map((item) =>
        selectedIds.includes(item.id) ? { ...item, ...getPatch(item) } : item,
      ),
    );
  }

  function updateSelectedGroup(patch: Partial<EditorItem>) {
    if (!selectedItem?.groupId) {
      return;
    }
    updateItems(
      items.map((item) =>
        item.groupId === selectedItem.groupId ? { ...item, ...patch } : item,
      ),
    );
  }

  function updateItemLabel(itemId: string, label: string) {
    updateItems(
      items.map((item) =>
        item.id === itemId ? { ...item, label: label.trim() } : item,
      ),
    );
  }

  function updateGroupLabel(groupId: string, groupLabel: string) {
    updateItems(
      items.map((item) =>
        item.groupId === groupId
          ? { ...item, groupLabel: groupLabel.trim() }
          : item,
      ),
    );
  }

  function updateSelectedSprite(patch: Partial<SheetSprite>) {
    if (!selectedItem) {
      return;
    }
    updateSelected({ sprite: { ...selectedItem.sprite, ...patch } });
  }

  function updateSelectedTransform(
    getPatch: (item: EditorItem) => SpriteTransform,
  ) {
    updateSelectedItems((item) => ({
      spriteTransform: getPatch(item),
    }));
  }

  function rotateSelected() {
    updateSelectedTransform((item) => ({
      ...item.spriteTransform,
      rotate: getNextRotation(item.spriteTransform?.rotate),
    }));
  }

  function flipSelected(axis: "x" | "y") {
    updateSelectedTransform((item) => ({
      ...item.spriteTransform,
      flipX:
        axis === "x"
          ? !item.spriteTransform?.flipX
          : item.spriteTransform?.flipX,
      flipY:
        axis === "y"
          ? !item.spriteTransform?.flipY
          : item.spriteTransform?.flipY,
    }));
  }

  function addPreset(preset: SpritePreset) {
    const nextItem = createItem(preset, items.length);
    updateItems([...items, nextItem]);
    setSelectedIds([nextItem.id]);
  }

  function addRawTile(tile: RawTile) {
    const nextItem = createTileItem(tile, items.length);
    updateItems([...items, nextItem]);
    setSelectedIds([nextItem.id]);
  }

  function duplicateSelected() {
    if (selectedItems.length === 0) {
      return;
    }
    copyItems(selectedItems);
  }

  function copyItems(
    sourceItems: EditorItem[],
    offset = { x: 0.5, y: 0.5 },
    saveSnapshot = true,
  ) {
    if (sourceItems.length === 0) {
      return [];
    }
    const copiedGroupIds = new Map<string, string>();
    const copyStamp = Date.now().toString(36);
    const nextItems = sourceItems.map((item, index) => ({
      ...item,
      groupId: item.groupId
        ? getCopiedGroupId(item.groupId, copiedGroupIds)
        : undefined,
      id: `${item.id}-copy-${copyStamp}-${index + 1}`,
      position: {
        x: clamp(item.position.x + offset.x, 0, scene.width - item.size.width),
        y: clamp(
          item.position.y + offset.y,
          0,
          scene.height - item.size.height,
        ),
      },
    }));
    updateItems([...items, ...nextItems], saveSnapshot);
    setSelectedIds(nextItems.map((item) => item.id));
    return nextItems.map((item) => item.id);
  }

  function copySelectedToEditorClipboard() {
    if (selectedItems.length === 0) {
      return;
    }
    clipboardRef.current = {
      items: selectedItems.map((item) => ({ ...item })),
    };
  }

  function cutSelectedToEditorClipboard() {
    if (selectedItems.length === 0) {
      return;
    }
    copySelectedToEditorClipboard();
    removeSelected();
  }

  function pasteEditorClipboard() {
    const sourceItems = clipboardRef.current?.items ?? [];
    if (sourceItems.length === 0) {
      return;
    }
    copyItems(sourceItems, { x: 0.75, y: 0.75 });
  }

  function copySelectedForDrag(itemId: string) {
    const sourceItems = selectedIds.includes(itemId)
      ? selectedItems
      : items.filter((item) => item.id === itemId);
    return copyItems(sourceItems, { x: 0, y: 0 });
  }

  function resetSelectedSize() {
    if (selectedIds.length === 0) {
      return;
    }
    updateSelectedItems((item) => ({
      size: getDefaultSizeForItem(item),
    }));
  }

  function arrangeSelectedItems(direction: "back" | "front") {
    if (selectedIds.length === 0) {
      return;
    }
    const selectedSet = new Set(selectedIds);
    const layers = items.map((item) => item.zIndex ?? 0);
    const nextLayer =
      direction === "front"
        ? Math.max(0, ...layers) + 1
        : Math.min(0, ...layers) - 1;
    updateItems(
      items.map((item) =>
        selectedSet.has(item.id) ? { ...item, zIndex: nextLayer } : item,
      ),
    );
  }

  function groupSelected() {
    if (selectedIds.length < 2) {
      return;
    }
    const nextGroupId = `group-${Date.now().toString(36)}`;
    updateSelectedItems(() => ({
      groupId: nextGroupId,
      groupLabel: "New Group",
      hideLabel: true,
    }));
  }

  function ungroupSelected() {
    if (selectedIds.length === 0) {
      return;
    }
    const groupIds = new Set(
      selectedItems.map((item) => item.groupId).filter(Boolean),
    );
    updateItems(
      items.map((item) =>
        item.groupId && groupIds.has(item.groupId)
          ? { ...item, groupId: undefined }
          : item,
      ),
    );
  }

  function selectSelectedGroup() {
    if (!selectedItem?.groupId) {
      return;
    }
    setSelectedIds(
      items
        .filter((item) => item.groupId === selectedItem.groupId)
        .map((item) => item.id),
    );
  }

  function removeSelected() {
    if (selectedBlock) {
      saveHistory();
      updateBlocks(
        blocks.filter((block) => block.id !== selectedBlock.id),
        false,
      );
      setSelectedBlockId(null);
      return;
    }
    if (selectedPortal) {
      saveHistory();
      updatePortals(
        portals.filter((portal) => portal.id !== selectedPortal.id),
        false,
      );
      setSelectedPortalId(null);
      return;
    }
    if (selectedIds.length === 0) {
      return;
    }
    const remaining = items.filter((item) => !selectedIds.includes(item.id));
    updateItems(remaining);
    setSelectedIds([]);
  }

  function selectItem(itemId: string, additive: boolean) {
    setSelectedPortalId(null);
    setSelectedBlockId(null);
    const clickedItem = items.find((item) => item.id === itemId);
    const groupItemIds =
      clickedItem?.groupId && !additive
        ? items
            .filter((item) => item.groupId === clickedItem.groupId)
            .map((item) => item.id)
        : [itemId];
    if (!additive) {
      const isClickingIntoSelectedGroup =
        clickedItem?.groupId &&
        selectedIds.length > 1 &&
        groupItemIds.every((id) => selectedIds.includes(id));
      setSelectedIds(isClickingIntoSelectedGroup ? [itemId] : groupItemIds);
      return;
    }
    setSelectedIds((previous) =>
      previous.includes(itemId)
        ? previous.filter((id) => id !== itemId)
        : [...previous, itemId],
    );
  }

  function moveItems(
    itemIds: string[],
    dx: number,
    dy: number,
    saveSnapshot = true,
  ) {
    if (itemIds.length === 0) {
      return { dx: 0, dy: 0 };
    }
    const movingItems = items.filter((item) => itemIds.includes(item.id));
    const movingBounds = getItemsBounds(movingItems);
    if (!movingBounds) {
      return { dx: 0, dy: 0 };
    }
    const actualDx = clamp(
      dx,
      -movingBounds.position.x,
      scene.width - (movingBounds.position.x + movingBounds.size.width),
    );
    const actualDy = clamp(
      dy,
      -movingBounds.position.y,
      scene.height - (movingBounds.position.y + movingBounds.size.height),
    );
    if (actualDx === 0 && actualDy === 0) {
      return { dx: 0, dy: 0 };
    }
    updateItems(
      items.map((item) => {
        if (!itemIds.includes(item.id)) {
          return item;
        }
        return {
          ...item,
          position: {
            x: roundToPrecision(item.position.x + actualDx),
            y: roundToPrecision(item.position.y + actualDy),
          },
        };
      }),
      saveSnapshot,
    );
    return { dx: actualDx, dy: actualDy };
  }

  function resizeItems(
    itemIds: string[],
    handle: ResizeHandle,
    dx: number,
    dy: number,
    keepRatio: boolean,
    saveSnapshot = true,
  ) {
    if (itemIds.length === 0 || (dx === 0 && dy === 0)) {
      return;
    }
    updateItems(
      items.map((item) => {
        if (!itemIds.includes(item.id)) {
          return item;
        }
        return resizeItem(item, handle, dx, dy, keepRatio, scene);
      }),
      saveSnapshot,
    );
  }

  function resizeSelectionBounds(
    itemIds: string[],
    handle: ResizeHandle,
    dx: number,
    dy: number,
    keepRatio: boolean,
    saveSnapshot = true,
  ) {
    const selectedForResize = items.filter((item) => itemIds.includes(item.id));
    const bounds = getItemsBounds(selectedForResize);
    if (!bounds || (dx === 0 && dy === 0)) {
      return;
    }
    const resizeStart = selectionResizeStartRef.current;
    const resizeStartMatches =
      resizeStart &&
      resizeStart.itemIds.length === itemIds.length &&
      resizeStart.itemIds.every((id) => itemIds.includes(id));
    const sourceBounds = resizeStartMatches ? resizeStart.bounds : bounds;
    const sourceItems = resizeStartMatches
      ? resizeStart.items
      : selectedForResize;
    const resizedBounds = resizeItem(
      {
        ...selectedForResize[0],
        position: sourceBounds.position,
        size: sourceBounds.size,
      },
      handle,
      dx,
      dy,
      keepRatio,
      scene,
    );
    updateItems(
      items.map((item) =>
        itemIds.includes(item.id)
          ? scaleItemWithinBounds(
              sourceItems.find((sourceItem) => sourceItem.id === item.id) ??
                item,
              sourceBounds,
              resizedBounds,
            )
          : item,
      ),
      saveSnapshot,
    );
  }

  function resizeSelectedByKeyboard(dx: number, dy: number) {
    if (selectedIds.length === 0) {
      return;
    }
    if (selectedIds.length > 1) {
      if (dx !== 0) {
        resizeSelectionBounds(selectedIds, "right", dx, 0, false);
        return;
      }
      resizeSelectionBounds(selectedIds, "bottom", 0, dy, false);
      return;
    }
    if (dx !== 0) {
      resizeItems(selectedIds, "right", dx, 0, false);
      return;
    }
    resizeItems(selectedIds, "bottom", 0, dy, false);
  }

  function cropSelectedByKeyboard(dx: number, dy: number, resizeCrop: boolean) {
    if (!selectedItem) {
      return;
    }
    const source = getSpriteSource(selectedItem.sprite);
    const nextSprite = resizeCrop
      ? {
          ...selectedItem.sprite,
          sw: clamp(
            selectedItem.sprite.sw + dx,
            1,
            source.width - selectedItem.sprite.sx,
          ),
          sh: clamp(
            selectedItem.sprite.sh + dy,
            1,
            source.height - selectedItem.sprite.sy,
          ),
        }
      : {
          ...selectedItem.sprite,
          sx: clamp(
            selectedItem.sprite.sx + dx,
            0,
            source.width - selectedItem.sprite.sw,
          ),
          sy: clamp(
            selectedItem.sprite.sy + dy,
            0,
            source.height - selectedItem.sprite.sh,
          ),
        };
    updateSelected({ sprite: nextSprite });
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) {
      return;
    }
    setItemsByScene(previous.itemsByScene);
    setPortalsByScene(previous.portalsByScene);
    setBlocksByScene(previous.blocksByScene);
    setCharacterSettingsByScene(previous.characterSettingsByScene);
    setSelectedIds(previous.selectedIds);
    setSelectedPortalId(previous.selectedPortalId);
    setSelectedBlockId(previous.selectedBlockId);
    setHistory((snapshots) => snapshots.slice(0, -1));
  }

  function shouldIgnoreKeyboardTarget(target: EventTarget | null) {
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    );
  }

  function handleKeyboardEvent(
    event: KeyboardEvent<HTMLElement> | globalThis.KeyboardEvent,
  ) {
    const target = event.target;
    if (shouldIgnoreKeyboardTarget(target)) {
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      undo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
      event.preventDefault();
      copySelectedToEditorClipboard();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "x") {
      event.preventDefault();
      cutSelectedToEditorClipboard();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
      event.preventDefault();
      pasteEditorClipboard();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "d") {
      event.preventDefault();
      duplicateSelected();
      return;
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.code === "BracketRight"
    ) {
      event.preventDefault();
      arrangeSelectedItems("front");
      return;
    }
    if (
      (event.ctrlKey || event.metaKey) &&
      event.shiftKey &&
      event.code === "BracketLeft"
    ) {
      event.preventDefault();
      arrangeSelectedItems("back");
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "g") {
      event.preventDefault();
      if (event.shiftKey) {
        ungroupSelected();
        return;
      }
      groupSelected();
      return;
    }
    const movement: Record<string, { dx: number; dy: number } | undefined> = {
      ArrowDown: { dx: 0, dy: event.shiftKey ? 1 : 0.25 },
      ArrowLeft: { dx: event.shiftKey ? -1 : -0.25, dy: 0 },
      ArrowRight: { dx: event.shiftKey ? 1 : 0.25, dy: 0 },
      ArrowUp: { dx: 0, dy: event.shiftKey ? -1 : -0.25 },
    };
    const nextMove = movement[event.key];
    if (nextMove && selectedBlockId) {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        if (nextMove.dx !== 0) {
          resizeBlock(selectedBlockId, "right", nextMove.dx, 0);
          return;
        }
        resizeBlock(selectedBlockId, "bottom", 0, nextMove.dy);
        return;
      }
      moveBlock(selectedBlockId, nextMove.dx, nextMove.dy);
      return;
    }
    if (nextMove && selectedPortalId) {
      event.preventDefault();
      if (event.ctrlKey || event.metaKey) {
        if (nextMove.dx !== 0) {
          resizePortal(selectedPortalId, "right", nextMove.dx, 0);
          return;
        }
        resizePortal(selectedPortalId, "bottom", 0, nextMove.dy);
        return;
      }
      movePortal(selectedPortalId, nextMove.dx, nextMove.dy);
      return;
    }
    if (nextMove && selectedIds.length > 0) {
      event.preventDefault();
      if (event.altKey) {
        const cropStep = event.shiftKey ? 4 : 1;
        cropSelectedByKeyboard(
          Math.sign(nextMove.dx) * cropStep,
          Math.sign(nextMove.dy) * cropStep,
          event.shiftKey,
        );
        return;
      }
      if (event.ctrlKey || event.metaKey) {
        resizeSelectedByKeyboard(nextMove.dx, nextMove.dy);
        return;
      }
      moveItems(selectedIds, nextMove.dx, nextMove.dy);
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      removeSelected();
    }
  }

  function handleKeyboard(event: KeyboardEvent<HTMLElement>) {
    handleKeyboardEvent(event);
  }

  function selectItemsInBox(box: SelectionBox) {
    const minX = Math.min(box.start.x, box.end.x);
    const maxX = Math.max(box.start.x, box.end.x);
    const minY = Math.min(box.start.y, box.end.y);
    const maxY = Math.max(box.start.y, box.end.y);
    const nextIds = items
      .filter((item) => {
        const bounds = getItemVisibleBounds(item);
        const itemMinX = bounds.position.x * TILE_SIZE;
        const itemMaxX = (bounds.position.x + bounds.size.width) * TILE_SIZE;
        const itemMinY = bounds.position.y * TILE_SIZE;
        const itemMaxY = (bounds.position.y + bounds.size.height) * TILE_SIZE;
        return (
          itemMinX <= maxX &&
          itemMaxX >= minX &&
          itemMinY <= maxY &&
          itemMaxY >= minY
        );
      })
      .map((item) => item.id);
    setSelectedIds(nextIds);
  }

  const exportJson = JSON.stringify(
    {
      sceneId: scene.id,
      sceneName: scene.name,
      portals: portals.map((portal) => ({
        ...portal,
        rect: {
          height: Number(portal.rect.height.toFixed(2)),
          width: Number(portal.rect.width.toFixed(2)),
          x: Number(portal.rect.x.toFixed(2)),
          y: Number(portal.rect.y.toFixed(2)),
        },
        targetPosition: {
          x: Number(portal.targetPosition.x.toFixed(2)),
          y: Number(portal.targetPosition.y.toFixed(2)),
        },
      })),
      blocks: blocks.map((block) => ({
        id: block.id,
        label: block.label,
        rect: {
          height: Number(block.rect.height.toFixed(2)),
          width: Number(block.rect.width.toFixed(2)),
          x: Number(block.rect.x.toFixed(2)),
          y: Number(block.rect.y.toFixed(2)),
        },
      })),
      characterSettings: characterSettings.map((setting) => ({
        id: setting.id,
        name: setting.name,
        movement: {
          pauseMaxMs: setting.pauseMaxMs,
          pauseMinMs: setting.pauseMinMs,
          speed: setting.speed,
        },
        patrol: setting.patrol,
      })),
      props: items.map((item) => ({
        id: item.id,
        groupId: item.groupId || undefined,
        groupLabel: item.groupLabel || undefined,
        hideLabel: item.hideLabel || undefined,
        label: item.label || undefined,
        description: item.description || undefined,
        position: roundPosition(item.position),
        size: roundSize(item.size),
        sprite: item.sprite,
        spriteTransform: getExportTransform(item.spriteTransform),
        collision: item.collision || undefined,
        zIndex: item.zIndex || undefined,
      })),
    },
    null,
    2,
  );

  return (
    <main className="eq-layout-editor" onKeyDown={handleKeyboard}>
      <header className="eq-layout-editor-header">
        <div>
          <p className="eq-kicker">Room Layout Editor</p>
          <h1>Design rooms without writing coordinates</h1>
          <span>
            Drag objects, edit labels/interactions, then export JSON for Codex
            to convert into the game.
          </span>
        </div>
        <a href="/" className="eq-layout-editor-link">
          Back to game
        </a>
      </header>

      <section className="eq-layout-editor-shell">
        <aside className="eq-layout-editor-sidebar">
          <div className="eq-layout-editor-help">
            <strong>Recommended workflow</strong>
            <span>
              Start with a blank room, add only assets that are clear, save your
              layout, then copy the JSON back to Codex.
            </span>
            <small>
              Keys: arrows move, Ctrl+arrows resize, Alt+arrows crop position,
              Alt+Shift+arrows crop size, Delete removes, Ctrl+C copies, Ctrl+V
              pastes, Ctrl+X cuts, Ctrl+D duplicates, Ctrl+G groups,
              Ctrl+Shift+G ungroups. Ctrl+click multi-select, Shift+drag selects
              a box, Ctrl+drag copies, Ctrl+Shift+] brings selected objects to
              front, Ctrl+Shift+[ sends them to back, Space+drag pans the
              canvas, and dragging a corner keeps the resize ratio. The canvas
              always previews the same stacking order used in the game.
            </small>
          </div>

          <label className="eq-layout-editor-checkbox">
            <input
              checked={showWalkBlocks}
              type="checkbox"
              onChange={(event) => setShowWalkBlocks(event.target.checked)}
            />
            Show walk-block zones
          </label>

          <label className="eq-layout-editor-checkbox">
            <input
              checked={showPlayerScaleReference}
              type="checkbox"
              onChange={(event) =>
                setShowPlayerScaleReference(event.target.checked)
              }
            />
            Show player scale reference
          </label>

          <label>
            Room
            <select
              value={scene.id}
              onChange={(event) => {
                setSceneId(event.target.value);
                const nextItems = itemsByScene[event.target.value] ?? [];
                setSelectedIds(nextItems[0] ? [nextItems[0].id] : []);
                setSelectedPortalId(null);
                setSelectedBlockId(null);
              }}
            >
              {editorScenes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <div className="eq-layout-editor-actions">
            <button type="button" onClick={clearRoomLayout}>
              Start blank room
            </button>
            <button type="button" onClick={loadCurrentRoomLayout}>
              Load current game layout
            </button>
            <button type="button" onClick={addWalkBlock}>
              Add walk block
            </button>
            <button type="button" onClick={downloadLayoutBackup}>
              Download layout backup
            </button>
          </div>

          <div className="eq-layout-editor-saved-layouts">
            <h2>Saved Layouts</h2>
            <label>
              Layout name
              <input
                placeholder={`${scene.name} draft`}
                value={savedLayoutName}
                onChange={(event) => setSavedLayoutName(event.target.value)}
              />
            </label>
            <button type="button" onClick={saveNamedLayout}>
              Save this room layout
            </button>
            {savedLayouts.length > 0 ? (
              <div className="eq-layout-editor-saved-list">
                {savedLayouts.map((layout) => (
                  <div className="eq-layout-editor-saved-row" key={layout.id}>
                    <button
                      type="button"
                      onClick={() => loadSavedLayout(layout)}
                    >
                      <strong>{layout.name}</strong>
                      <small>
                        {getSceneName(layout.sceneId)} |{" "}
                        {new Date(layout.updatedAt).toLocaleString()}
                      </small>
                    </button>
                    <button
                      aria-label={`Delete saved layout ${layout.name}`}
                      type="button"
                      onClick={() => deleteSavedLayout(layout.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No saved layouts yet.</p>
            )}
          </div>

          {exampleLayouts.length > 0 && (
            <div className="eq-layout-editor-examples">
              <h2>Example Room Layouts</h2>
              <p>
                These are assembled starting points using named assets and
                grouped furniture clusters.
              </p>
              {exampleLayouts.map((layout) => (
                <button
                  key={layout.id}
                  type="button"
                  onClick={() => loadExampleLayout(layout.items)}
                >
                  <strong>{layout.title}</strong>
                  <small>{layout.description}</small>
                </button>
              ))}
            </div>
          )}

          <div className="eq-layout-editor-palette">
            <h2>Add Assets</h2>
            <p>
              Complete objects are safest. Modular pieces are labeled as pieces
              so they do not get mistaken for finished furniture.
            </p>
            <label>
              Asset category
              <select
                value={assetCategory}
                onChange={(event) => setAssetCategory(event.target.value)}
              >
                {assetCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Search assets
              <input
                placeholder="plant, monitor, workstation..."
                value={assetSearch}
                onChange={(event) => setAssetSearch(event.target.value)}
              />
            </label>
            {visiblePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => addPreset(preset)}
              >
                <SpritePreview sprite={preset.sprite} />
                <span>
                  <strong>{preset.label}</strong>
                  <em>{preset.category}</em>
                  <small>{preset.role}</small>
                </span>
              </button>
            ))}
            {visiblePresets.length === 0 && (
              <span className="eq-layout-editor-muted">
                No assets match that search.
              </span>
            )}
          </div>

          <div className="eq-layout-editor-tile-browser">
            <h2>Raw 48px Tile Picker</h2>
            <label>
              Sheet row
              <input
                max={officeRows - 1}
                min={0}
                type="range"
                value={tileRow}
                onChange={(event) => setTileRow(Number(event.target.value))}
              />
            </label>
            <span>
              Row {tileRow + 1} of {officeRows}. Click any tile to add it as a
              one-tile piece.
            </span>
            <div className="eq-layout-editor-tile-grid">
              {getRawTilesForRow(tileRow).map((tile) => (
                <button
                  key={tile.id}
                  title={tile.label}
                  type="button"
                  onClick={() => addRawTile(tile)}
                >
                  <SpritePreview sprite={tile.sprite} />
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="eq-layout-editor-stage-panel">
          <div className="eq-layout-editor-stage-note">
            <strong>{scene.name}</strong>
            <span>
              {items.length === 0
                ? "Blank room. Add objects from the left."
                : `${items.length} objects in this draft. Select one to inspect it.`}
            </span>
          </div>
          <div
            className={`eq-layout-editor-stage-viewport ${
              isSpacePanning ? "is-panning-ready" : ""
            }`}
            ref={stageViewportRef}
            onPointerDown={(event) => {
              if (!isSpacePanning || !stageViewportRef.current) {
                return;
              }
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              panStateRef.current = {
                left: stageViewportRef.current.scrollLeft,
                startClientX: event.clientX,
                startClientY: event.clientY,
                top: stageViewportRef.current.scrollTop,
              };
            }}
            onPointerMove={(event) => {
              if (!panStateRef.current || !stageViewportRef.current) {
                return;
              }
              stageViewportRef.current.scrollLeft =
                panStateRef.current.left -
                (event.clientX - panStateRef.current.startClientX);
              stageViewportRef.current.scrollTop =
                panStateRef.current.top -
                (event.clientY - panStateRef.current.startClientY);
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
              }
              panStateRef.current = null;
            }}
          >
            <div
              className="eq-layout-editor-stage"
              style={{
                height: scene.height * TILE_SIZE,
                width: scene.width * TILE_SIZE,
              }}
              onPointerDown={(event) => {
                if (isSpacePanning) {
                  return;
                }
                if (event.target !== event.currentTarget) {
                  return;
                }
                if (!event.shiftKey) {
                  setSelectedIds([]);
                  setSelectedPortalId(null);
                  setSelectedBlockId(null);
                  return;
                }
                const rect = event.currentTarget.getBoundingClientRect();
                const start = {
                  x: event.clientX - rect.left,
                  y: event.clientY - rect.top,
                };
                event.currentTarget.setPointerCapture(event.pointerId);
                setSelectionBox({ start, end: start });
              }}
              onPointerMove={(event) => {
                if (
                  !selectionBox ||
                  !event.currentTarget.hasPointerCapture(event.pointerId)
                ) {
                  return;
                }
                const rect = event.currentTarget.getBoundingClientRect();
                setSelectionBox({
                  ...selectionBox,
                  end: {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                  },
                });
              }}
              onPointerUp={(event) => {
                if (!selectionBox) {
                  return;
                }
                event.currentTarget.releasePointerCapture(event.pointerId);
                selectItemsInBox(selectionBox);
                setSelectionBox(null);
              }}
            >
              <RoomBackdrop scene={scene} />
              <RoomGrid scene={scene} />
              {showWalkBlocks &&
                blocks.map((block) => (
                  <DraggableBlock
                    block={block}
                    isSelected={block.id === selectedBlockId}
                    key={block.id}
                    onDragStart={saveHistory}
                    onMove={(dx, dy) => moveBlock(block.id, dx, dy, false)}
                    onResizeStart={saveHistory}
                    onResize={(handle, dx, dy) =>
                      resizeBlock(block.id, handle, dx, dy, false)
                    }
                    onSelect={() => {
                      setSelectedIds([]);
                      setSelectedPortalId(null);
                      setSelectedBlockId(block.id);
                    }}
                  />
                ))}
              {portals.map((portal) => (
                <DraggablePortal
                  isSelected={portal.id === selectedPortalId}
                  key={portal.id}
                  portal={portal}
                  onDragStart={saveHistory}
                  onMove={(dx, dy) => movePortal(portal.id, dx, dy, false)}
                  onSelect={() => {
                    setSelectedIds([]);
                    setSelectedPortalId(portal.id);
                    setSelectedBlockId(null);
                  }}
                />
              ))}
              {showPlayerScaleReference && (
                <PlayerScaleReference
                  position={playerScaleReferencePosition}
                  onMove={movePlayerScaleReference}
                />
              )}
              {groupOverlays.map((group) => (
                <GroupLabelOverlay
                  group={group}
                  isEditing={
                    editingLabel?.kind === "group" &&
                    editingLabel.groupId === group.groupId
                  }
                  key={group.groupId}
                  onCancelEdit={() => setEditingLabel(null)}
                  onRename={(label) => {
                    updateGroupLabel(group.groupId, label);
                    setEditingLabel(null);
                  }}
                  onStartEdit={() =>
                    setEditingLabel({ groupId: group.groupId, kind: "group" })
                  }
                />
              ))}
              {renderedItems.map((item) => (
                <DraggableItem
                  isEditingLabel={
                    editingLabel?.kind === "item" && editingLabel.id === item.id
                  }
                  isSelected={selectedIds.includes(item.id)}
                  item={item}
                  key={item.id}
                  onCancelLabelEdit={() => setEditingLabel(null)}
                  showResizeHandles={
                    selectedIds.length === 1 && selectedIds.includes(item.id)
                  }
                  dragItemIds={
                    selectedIds.includes(item.id) ? selectedIds : [item.id]
                  }
                  onDragStart={saveHistory}
                  onCopyDragStart={() => copySelectedForDrag(item.id)}
                  onMoveItems={(itemIds, dx, dy) =>
                    moveItems(itemIds, dx, dy, false)
                  }
                  onRenameLabel={(label) => {
                    updateItemLabel(item.id, label);
                    setEditingLabel(null);
                  }}
                  onResizeStart={saveHistory}
                  onResizeSelected={(handle, dx, dy, keepRatio) =>
                    resizeItems(
                      selectedIds.includes(item.id) ? selectedIds : [item.id],
                      handle,
                      dx,
                      dy,
                      keepRatio,
                      false,
                    )
                  }
                  onSelect={(additive) => selectItem(item.id, additive)}
                  onStartLabelEdit={() => {
                    setSelectedIds([item.id]);
                    setSelectedPortalId(null);
                    setEditingLabel({ id: item.id, kind: "item" });
                  }}
                />
              ))}
              {selectedBounds && selectedIds.length > 1 && (
                <SelectedBoundsOverlay
                  bounds={selectedBounds}
                  onResizeEnd={() => {
                    selectionResizeStartRef.current = null;
                  }}
                  onResizeSelected={(handle, dx, dy, keepRatio) =>
                    resizeSelectionBounds(
                      selectedIds,
                      handle,
                      dx,
                      dy,
                      keepRatio,
                      false,
                    )
                  }
                  onResizeStart={() => {
                    saveHistory();
                    selectionResizeStartRef.current = {
                      bounds: selectedBounds,
                      itemIds: selectedIds,
                      items: selectedItems,
                    };
                  }}
                />
              )}
              {selectionBox && (
                <SelectionBoxOverlay selectionBox={selectionBox} />
              )}
            </div>
          </div>
        </section>

        <aside className="eq-layout-editor-inspector">
          <h2>Objects In This Room</h2>
          {items.length > 0 ? (
            <div className="eq-layout-editor-object-list">
              {items.map((item) => (
                <button
                  className={selectedIds.includes(item.id) ? "is-active" : ""}
                  key={item.id}
                  type="button"
                  onClick={(event) =>
                    selectItem(item.id, event.ctrlKey || event.metaKey)
                  }
                >
                  <SpritePreview sprite={item.sprite} />
                  <span>
                    <strong>{item.label || item.id}</strong>
                    <small>
                      x {roundPosition(item.position).x}, y{" "}
                      {roundPosition(item.position).y}
                    </small>
                    {item.groupId && <em>{item.groupId}</em>}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="eq-layout-editor-empty">
              No objects yet. Add a clear workstation, monitor, board, or plant
              from the left.
            </p>
          )}

          <h2>Selected Object</h2>
          {selectedPortal && (
            <div className="eq-layout-editor-group-tools">
              <h2>Selected Door / Hotspot</h2>
              <label>
                Portal label
                <input
                  value={selectedPortal.label}
                  onChange={(event) =>
                    updateSelectedPortal({ label: event.target.value })
                  }
                />
              </label>
              <div className="eq-layout-editor-fields">
                <NumberField
                  label="Door X"
                  value={selectedPortal.rect.x}
                  onChange={(value) =>
                    updateSelectedPortal({
                      rect: { ...selectedPortal.rect, x: value },
                    })
                  }
                />
                <NumberField
                  label="Door Y"
                  value={selectedPortal.rect.y}
                  onChange={(value) =>
                    updateSelectedPortal({
                      rect: { ...selectedPortal.rect, y: value },
                    })
                  }
                />
                <NumberField
                  label="Door W"
                  value={selectedPortal.rect.width}
                  onChange={(value) =>
                    updateSelectedPortal({
                      rect: { ...selectedPortal.rect, width: value },
                    })
                  }
                />
                <NumberField
                  label="Door H"
                  value={selectedPortal.rect.height}
                  onChange={(value) =>
                    updateSelectedPortal({
                      rect: { ...selectedPortal.rect, height: value },
                    })
                  }
                />
                <NumberField
                  label="Spawn X"
                  value={selectedPortal.targetPosition.x}
                  onChange={(value) =>
                    updateSelectedPortal({
                      targetPosition: {
                        ...selectedPortal.targetPosition,
                        x: value,
                      },
                    })
                  }
                />
                <NumberField
                  label="Spawn Y"
                  value={selectedPortal.targetPosition.y}
                  onChange={(value) =>
                    updateSelectedPortal({
                      targetPosition: {
                        ...selectedPortal.targetPosition,
                        y: value,
                      },
                    })
                  }
                />
              </div>
            </div>
          )}
          {selectedBlock && (
            <div className="eq-layout-editor-group-tools">
              <h2>Selected Walk Block</h2>
              <label>
                Block label
                <input
                  value={selectedBlock.label}
                  onChange={(event) =>
                    updateSelectedBlock({ label: event.target.value })
                  }
                />
              </label>
              <div className="eq-layout-editor-fields">
                <NumberField
                  label="Block X"
                  value={selectedBlock.rect.x}
                  onChange={(value) => updateSelectedBlockRect({ x: value })}
                />
                <NumberField
                  label="Block Y"
                  value={selectedBlock.rect.y}
                  onChange={(value) => updateSelectedBlockRect({ y: value })}
                />
                <NumberField
                  label="Block W"
                  value={selectedBlock.rect.width}
                  onChange={(value) =>
                    updateSelectedBlockRect({ width: value })
                  }
                />
                <NumberField
                  label="Block H"
                  value={selectedBlock.rect.height}
                  onChange={(value) =>
                    updateSelectedBlockRect({ height: value })
                  }
                />
              </div>
              <p className="eq-layout-editor-muted">
                These zones are exported as scene blocks. Use them for walls,
                building footprints, and areas players or NPCs should not cross.
              </p>
              <button
                className="eq-layout-editor-danger"
                type="button"
                onClick={removeSelected}
              >
                Delete walk block
              </button>
            </div>
          )}
          {selectedItem ? (
            <>
              {selectedIds.length > 1 && (
                <p className="eq-layout-editor-muted">
                  {selectedIds.length} objects selected. Move, resize, rotate,
                  flip, duplicate, remove, or group them together.
                </p>
              )}
              <label>
                ID
                <input
                  value={selectedItem.id}
                  onChange={(event) =>
                    updateSelected({ id: event.target.value })
                  }
                />
              </label>
              <label>
                Visible label
                <input
                  value={selectedItem.label}
                  onChange={(event) =>
                    updateSelected({ label: event.target.value })
                  }
                />
              </label>
              <label>
                Interaction text
                <textarea
                  value={selectedItem.description}
                  onChange={(event) =>
                    updateSelected({ description: event.target.value })
                  }
                />
              </label>
              {selectedItem.groupId && (
                <div className="eq-layout-editor-group-tools">
                  <h2>Selected Group</h2>
                  <label>
                    Group label
                    <input
                      value={selectedItem.groupLabel ?? ""}
                      onChange={(event) =>
                        updateSelectedGroup({ groupLabel: event.target.value })
                      }
                    />
                  </label>
                  <label className="eq-layout-editor-checkbox">
                    <input
                      checked={Boolean(selectedItem.hideLabel)}
                      type="checkbox"
                      onChange={(event) =>
                        updateSelectedGroup({
                          hideLabel: event.target.checked,
                        })
                      }
                    />
                    Hide individual item labels in this group
                  </label>
                </div>
              )}
              <div className="eq-layout-editor-fields">
                <NumberField
                  label="X"
                  value={selectedItem.position.x}
                  onChange={(value) =>
                    updateSelected({
                      position: { ...selectedItem.position, x: value },
                    })
                  }
                />
                <NumberField
                  label="Y"
                  value={selectedItem.position.y}
                  onChange={(value) =>
                    updateSelected({
                      position: { ...selectedItem.position, y: value },
                    })
                  }
                />
                <NumberField
                  label="Width"
                  value={selectedItem.size.width}
                  onChange={(value) =>
                    updateSelected({
                      size: { ...selectedItem.size, width: value },
                    })
                  }
                />
                <NumberField
                  label="Height"
                  value={selectedItem.size.height}
                  onChange={(value) =>
                    updateSelected({
                      size: { ...selectedItem.size, height: value },
                    })
                  }
                />
                <NumberField
                  label="Layer"
                  step={1}
                  value={selectedItem.zIndex ?? 0}
                  onChange={(value) => updateSelected({ zIndex: value })}
                />
              </div>
              <label className="eq-layout-editor-checkbox">
                <input
                  checked={selectedItem.collision}
                  type="checkbox"
                  onChange={(event) =>
                    updateSelectedItems(() => ({
                      collision: event.target.checked,
                    }))
                  }
                />
                Blocks player movement
              </label>
              <h2>Crop Selected Sprite</h2>
              <div className="eq-layout-editor-fields">
                <NumberField
                  label="Crop X"
                  value={selectedItem.sprite.sx}
                  onChange={(value) => updateSelectedSprite({ sx: value })}
                />
                <NumberField
                  label="Crop Y"
                  value={selectedItem.sprite.sy}
                  onChange={(value) => updateSelectedSprite({ sy: value })}
                />
                <NumberField
                  label="Crop W"
                  value={selectedItem.sprite.sw}
                  onChange={(value) => updateSelectedSprite({ sw: value })}
                />
                <NumberField
                  label="Crop H"
                  value={selectedItem.sprite.sh}
                  onChange={(value) => updateSelectedSprite({ sh: value })}
                />
              </div>
              <div className="eq-layout-editor-transform-actions">
                <button
                  disabled={history.length === 0}
                  type="button"
                  onClick={undo}
                >
                  Undo
                </button>
                <button type="button" onClick={rotateSelected}>
                  Rotate 90°
                </button>
                <button type="button" onClick={() => flipSelected("x")}>
                  Flip horizontal
                </button>
                <button type="button" onClick={() => flipSelected("y")}>
                  Flip vertical
                </button>
                <button type="button" onClick={resetSelectedSize}>
                  Reset size
                </button>
                <button type="button" onClick={copySelectedToEditorClipboard}>
                  Copy
                </button>
                <button type="button" onClick={cutSelectedToEditorClipboard}>
                  Cut
                </button>
                <button type="button" onClick={pasteEditorClipboard}>
                  Paste
                </button>
                <button type="button" onClick={duplicateSelected}>
                  Duplicate piece
                </button>
                <button
                  disabled={selectedIds.length < 2}
                  type="button"
                  onClick={groupSelected}
                >
                  Group selected
                </button>
                <button
                  disabled={!selectedItems.some((item) => item.groupId)}
                  type="button"
                  onClick={ungroupSelected}
                >
                  Ungroup
                </button>
                <button
                  disabled={!selectedItem.groupId}
                  type="button"
                  onClick={selectSelectedGroup}
                >
                  Select group
                </button>
              </div>
              <button
                className="eq-layout-editor-danger"
                type="button"
                onClick={removeSelected}
              >
                Remove selected
              </button>
            </>
          ) : (
            <p>Select or add an object to edit it.</p>
          )}

          <h2>Characters In This Scene</h2>
          {characterSettings.length > 0 ? (
            <div className="eq-layout-editor-group-tools">
              {characterSettings.map((setting) => (
                <div
                  className="eq-layout-editor-character-card"
                  key={setting.id}
                >
                  <strong>{setting.name}</strong>
                  <div className="eq-layout-editor-fields">
                    <NumberField
                      label="Speed"
                      step={0.001}
                      value={setting.speed}
                      onChange={(value) =>
                        updateCharacterSetting(setting.id, { speed: value })
                      }
                    />
                    <NumberField
                      label="Pause min ms"
                      step={100}
                      value={setting.pauseMinMs}
                      onChange={(value) =>
                        updateCharacterSetting(setting.id, {
                          pauseMinMs: value,
                        })
                      }
                    />
                    <NumberField
                      label="Pause max ms"
                      step={100}
                      value={setting.pauseMaxMs}
                      onChange={(value) =>
                        updateCharacterSetting(setting.id, {
                          pauseMaxMs: value,
                        })
                      }
                    />
                  </div>
                  <p className="eq-layout-editor-muted">
                    Patrol points:{" "}
                    {setting.patrol?.length
                      ? setting.patrol
                          .map((point) => `${point.x},${point.y}`)
                          .join(" | ")
                      : "stationary"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="eq-layout-editor-empty">
              No NPCs currently start in this scene.
            </p>
          )}

          <h2>Export</h2>
          <textarea readOnly value={exportJson} />
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(exportJson);
            }}
          >
            Copy layout JSON
          </button>
        </aside>
      </section>
    </main>
  );
}

function RoomBackdrop({ scene }: { scene: Scene }) {
  const theme = roomThemes[scene.id];
  if (scene.theme === "exterior") {
    const buildings = [
      {
        accent: "#22d3ee",
        door: { x: 6.85, y: 7.02, width: 1.05, height: 0.72 },
        fill: "#164e63",
        label: "Sales Enablement Studio",
        rect: { x: 3, y: 2.7, width: 7.1, height: 4.85 },
      },
      {
        accent: "#f59e0b",
        door: { x: 21.55, y: 7.02, width: 1.05, height: 0.72 },
        fill: "#713f12",
        label: "Operations Suite",
        rect: { x: 18.9, y: 2.7, width: 8.5, height: 4.85 },
      },
      {
        accent: "#a78bfa",
        door: { x: 14.45, y: 14.72, width: 1.1, height: 0.72 },
        fill: "#4c1d95",
        label: "Learning Systems Lab",
        rect: { x: 11, y: 11.2, width: 8.2, height: 4 },
      },
    ];
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
    return (
      <div className="eq-layout-editor-backdrop eq-layout-editor-campus-backdrop">
        {scene.tilePatches?.map((patch) => (
          <div
            className={`eq-layout-editor-campus-patch ${
              patch.id.includes("threshold") ? "is-threshold" : "is-path"
            }`}
            key={patch.id}
            style={{
              height: patch.size.height * TILE_SIZE,
              left: patch.position.x * TILE_SIZE,
              top: patch.position.y * TILE_SIZE,
              width: patch.size.width * TILE_SIZE,
            }}
          />
        ))}
        {buildings.map((building) => (
          <div
            className="eq-layout-editor-campus-building"
            key={building.label}
            style={
              {
                "--building-accent": building.accent,
                "--building-fill": building.fill,
                height: building.rect.height * TILE_SIZE,
                left: building.rect.x * TILE_SIZE,
                top: building.rect.y * TILE_SIZE,
                width: building.rect.width * TILE_SIZE,
              } as CSSProperties
            }
          >
            <div className="eq-layout-editor-campus-roof" />
            <div className="eq-layout-editor-campus-plaque">
              {building.label}
            </div>
            <div className="eq-layout-editor-campus-windows">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        ))}
        {buildings.map((building) => (
          <div
            className="eq-layout-editor-campus-door"
            key={`${building.label}-door`}
            style={
              {
                "--building-accent": building.accent,
                height: building.door.height * TILE_SIZE,
                left: building.door.x * TILE_SIZE,
                top: building.door.y * TILE_SIZE,
                width: building.door.width * TILE_SIZE,
              } as CSSProperties
            }
          >
            <span />
          </div>
        ))}
        <div className="eq-layout-editor-campus-fountain" />
        {shrubs.map((shrub) => (
          <div
            className="eq-layout-editor-campus-shrub"
            key={`${shrub.x}-${shrub.y}`}
            style={{
              left: shrub.x * TILE_SIZE,
              top: shrub.y * TILE_SIZE,
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <div className="eq-layout-editor-backdrop">
      <div className="eq-layout-editor-wall" />
      <div className="eq-layout-editor-room-frame" />
      {theme && (
        <div
          className="eq-layout-editor-room-title"
          style={{ borderColor: theme.accent }}
        >
          {theme.title}
        </div>
      )}
    </div>
  );
}

function DraggableBlock({
  block,
  isSelected,
  onDragStart,
  onMove,
  onResize,
  onResizeStart,
  onSelect,
}: {
  block: EditorBlock;
  isSelected: boolean;
  onDragStart: () => void;
  onMove: (dx: number, dy: number) => void;
  onResize: (handle: ResizeHandle, dx: number, dy: number) => void;
  onResizeStart: () => void;
  onSelect: () => void;
}) {
  const dragState = useRef<{
    lastClientX: number;
    lastClientY: number;
    savedHistory: boolean;
  } | null>(null);
  const resizeState = useRef<{
    handle: ResizeHandle;
    lastClientX: number;
    lastClientY: number;
    savedHistory: boolean;
  } | null>(null);

  return (
    <div
      className={`eq-layout-editor-block ${isSelected ? "is-selected" : ""}`}
      style={{
        height: block.rect.height * TILE_SIZE,
        left: block.rect.x * TILE_SIZE,
        top: block.rect.y * TILE_SIZE,
        width: block.rect.width * TILE_SIZE,
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        onSelect();
        dragState.current = {
          lastClientX: event.clientX,
          lastClientY: event.clientY,
          savedHistory: false,
        };
      }}
      onPointerMove={(event) => {
        const currentDrag = dragState.current;
        if (
          !currentDrag ||
          !event.currentTarget.hasPointerCapture(event.pointerId)
        ) {
          return;
        }
        const dx = snap((event.clientX - currentDrag.lastClientX) / TILE_SIZE);
        const dy = snap((event.clientY - currentDrag.lastClientY) / TILE_SIZE);
        if (dx === 0 && dy === 0) {
          return;
        }
        if (!currentDrag.savedHistory) {
          onDragStart();
          currentDrag.savedHistory = true;
        }
        currentDrag.lastClientX = event.clientX;
        currentDrag.lastClientY = event.clientY;
        onMove(dx, dy);
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        dragState.current = null;
      }}
    >
      <span>{block.label}</span>
      {isSelected &&
        resizeHandles.map((handle) => (
          <span
            aria-label={`Resize block ${handle}`}
            className={`eq-layout-editor-resize-handle is-${handle}`}
            key={handle}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              event.currentTarget.setPointerCapture(event.pointerId);
              resizeState.current = {
                handle,
                lastClientX: event.clientX,
                lastClientY: event.clientY,
                savedHistory: false,
              };
            }}
            onPointerMove={(event) => {
              const currentResize = resizeState.current;
              if (
                !currentResize ||
                !event.currentTarget.hasPointerCapture(event.pointerId)
              ) {
                return;
              }
              const dx = snap(
                (event.clientX - currentResize.lastClientX) / TILE_SIZE,
              );
              const dy = snap(
                (event.clientY - currentResize.lastClientY) / TILE_SIZE,
              );
              if (dx === 0 && dy === 0) {
                return;
              }
              if (!currentResize.savedHistory) {
                onResizeStart();
                currentResize.savedHistory = true;
              }
              currentResize.lastClientX = event.clientX;
              currentResize.lastClientY = event.clientY;
              onResize(handle, dx, dy);
            }}
            onPointerUp={(event) => {
              event.currentTarget.releasePointerCapture(event.pointerId);
              resizeState.current = null;
            }}
            role="presentation"
          />
        ))}
    </div>
  );
}

function DraggablePortal({
  isSelected,
  onDragStart,
  onMove,
  onSelect,
  portal,
}: {
  isSelected: boolean;
  onDragStart: () => void;
  onMove: (dx: number, dy: number) => void;
  onSelect: () => void;
  portal: EditorPortal;
}) {
  const dragState = useRef<{
    lastClientX: number;
    lastClientY: number;
    savedHistory: boolean;
  } | null>(null);
  return (
    <button
      className={`eq-layout-editor-portal ${isSelected ? "is-selected" : ""}`}
      style={{
        height: portal.rect.height * TILE_SIZE,
        left: portal.rect.x * TILE_SIZE,
        top: portal.rect.y * TILE_SIZE,
        width: portal.rect.width * TILE_SIZE,
      }}
      type="button"
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        onSelect();
        dragState.current = {
          lastClientX: event.clientX,
          lastClientY: event.clientY,
          savedHistory: false,
        };
      }}
      onPointerMove={(event) => {
        const currentDrag = dragState.current;
        if (
          !currentDrag ||
          !event.currentTarget.hasPointerCapture(event.pointerId)
        ) {
          return;
        }
        const dx = snap((event.clientX - currentDrag.lastClientX) / TILE_SIZE);
        const dy = snap((event.clientY - currentDrag.lastClientY) / TILE_SIZE);
        if (dx === 0 && dy === 0) {
          return;
        }
        if (!currentDrag.savedHistory) {
          onDragStart();
          currentDrag.savedHistory = true;
        }
        currentDrag.lastClientX = event.clientX;
        currentDrag.lastClientY = event.clientY;
        onMove(dx, dy);
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        dragState.current = null;
      }}
    >
      <span>{portal.label}</span>
    </button>
  );
}

function RoomGrid({ scene }: { scene: Scene }) {
  const cells: string[] = [];
  for (let row = 0; row < scene.height; row += 1) {
    for (let col = 0; col < scene.width; col += 1) {
      cells.push(`${col}-${row}`);
    }
  }
  return (
    <div
      className="eq-layout-editor-grid"
      style={{
        gridTemplateColumns: `repeat(${scene.width}, ${TILE_SIZE}px)`,
        gridTemplateRows: `repeat(${scene.height}, ${TILE_SIZE}px)`,
      }}
    >
      {cells.map((cell) => (
        <span key={cell} />
      ))}
    </div>
  );
}

function PlayerScaleReference({
  onMove,
  position,
}: {
  onMove: (dx: number, dy: number) => void;
  position: { x: number; y: number };
}) {
  const dragState = useRef<{
    lastClientX: number;
    lastClientY: number;
  } | null>(null);

  return (
    <button
      className="eq-layout-editor-player-reference"
      style={{
        height: 96,
        left: position.x * TILE_SIZE,
        top: position.y * TILE_SIZE,
        width: 48,
      }}
      type="button"
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        dragState.current = {
          lastClientX: event.clientX,
          lastClientY: event.clientY,
        };
      }}
      onPointerMove={(event) => {
        const currentDrag = dragState.current;
        if (
          !currentDrag ||
          !event.currentTarget.hasPointerCapture(event.pointerId)
        ) {
          return;
        }
        const dx = snap((event.clientX - currentDrag.lastClientX) / TILE_SIZE);
        const dy = snap((event.clientY - currentDrag.lastClientY) / TILE_SIZE);
        if (dx === 0 && dy === 0) {
          return;
        }
        currentDrag.lastClientX = event.clientX;
        currentDrag.lastClientY = event.clientY;
        onMove(dx, dy);
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        dragState.current = null;
      }}
    >
      <span className="eq-layout-editor-player-shadow" />
      <SpritePreview
        fill
        sprite={{ image: "adamIdle", sx: 48, sy: 0, sw: 16, sh: 32 }}
        targetHeight={96}
        targetWidth={48}
      />
      <span className="eq-layout-editor-player-label">
        Player size reference
      </span>
    </button>
  );
}

function DraggableItem({
  dragItemIds,
  isEditingLabel,
  isSelected,
  item,
  onCancelLabelEdit,
  onCopyDragStart,
  onDragStart,
  onMoveItems,
  onRenameLabel,
  onResizeSelected,
  onResizeStart,
  onSelect,
  onStartLabelEdit,
  showResizeHandles,
}: {
  dragItemIds: string[];
  isEditingLabel: boolean;
  isSelected: boolean;
  item: EditorItem;
  onCancelLabelEdit: () => void;
  onCopyDragStart: () => string[];
  onDragStart: () => void;
  onMoveItems: (
    itemIds: string[],
    dx: number,
    dy: number,
  ) => { dx: number; dy: number };
  onRenameLabel: (label: string) => void;
  onResizeSelected: (
    handle: ResizeHandle,
    dx: number,
    dy: number,
    keepRatio: boolean,
  ) => void;
  onResizeStart: () => void;
  onSelect: (additive: boolean) => void;
  onStartLabelEdit: () => void;
  showResizeHandles: boolean;
}) {
  const dragState = useRef<{
    itemIds: string[];
    lastClientX: number;
    lastClientY: number;
    savedHistory: boolean;
  } | null>(null);
  const resizeState = useRef<{
    handle: ResizeHandle;
    lastClientX: number;
    lastClientY: number;
    savedHistory: boolean;
  } | null>(null);
  const visibleFrame = getItemVisibleFrame(item);
  const visibleFrameStyle: CSSProperties = {
    height: visibleFrame.size.height * TILE_SIZE,
    left: visibleFrame.offset.x * TILE_SIZE,
    top: visibleFrame.offset.y * TILE_SIZE,
    width: visibleFrame.size.width * TILE_SIZE,
  };

  return (
    <div
      className={`eq-layout-editor-item ${isSelected ? "is-selected" : ""}`}
      style={{
        height: item.size.height * TILE_SIZE,
        left: item.position.x * TILE_SIZE,
        top: item.position.y * TILE_SIZE,
        width: item.size.width * TILE_SIZE,
      }}
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        const shouldCopyDrag =
          isSelected && (event.ctrlKey || event.metaKey) && event.button === 0;
        const itemIdsForDrag = shouldCopyDrag ? onCopyDragStart() : dragItemIds;
        if (!shouldCopyDrag) {
          onSelect(event.ctrlKey || event.metaKey);
        }
        dragState.current = {
          itemIds: itemIdsForDrag,
          lastClientX: event.clientX,
          lastClientY: event.clientY,
          savedHistory: shouldCopyDrag,
        };
      }}
      onPointerMove={(event) => {
        const currentDrag = dragState.current;
        if (
          !currentDrag ||
          !event.currentTarget.hasPointerCapture(event.pointerId)
        ) {
          return;
        }
        const dx = snap((event.clientX - currentDrag.lastClientX) / TILE_SIZE);
        const dy = snap((event.clientY - currentDrag.lastClientY) / TILE_SIZE);
        if (dx === 0 && dy === 0) {
          return;
        }
        if (!currentDrag.savedHistory) {
          onDragStart();
          currentDrag.savedHistory = true;
        }
        const actualMove = onMoveItems(currentDrag.itemIds, dx, dy);
        currentDrag.lastClientX += actualMove.dx * TILE_SIZE;
        currentDrag.lastClientY += actualMove.dy * TILE_SIZE;
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
        dragState.current = null;
      }}
    >
      <SpritePreview
        fill
        sprite={item.sprite}
        transform={item.spriteTransform}
        targetHeight={item.size.height * TILE_SIZE}
        targetWidth={item.size.width * TILE_SIZE}
      />
      {isSelected && (
        <span
          className="eq-layout-editor-visible-bounds"
          style={visibleFrameStyle}
        >
          {showResizeHandles &&
            resizeHandles.map((handle) => (
              <span
                aria-label={`Resize ${handle}`}
                className={`eq-layout-editor-resize-handle is-${handle}`}
                key={handle}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  onSelect(event.ctrlKey || event.metaKey);
                  resizeState.current = {
                    handle,
                    lastClientX: event.clientX,
                    lastClientY: event.clientY,
                    savedHistory: false,
                  };
                }}
                onPointerMove={(event) => {
                  const currentResize = resizeState.current;
                  if (
                    !currentResize ||
                    !event.currentTarget.hasPointerCapture(event.pointerId)
                  ) {
                    return;
                  }
                  const dx = snap(
                    (event.clientX - currentResize.lastClientX) / TILE_SIZE,
                  );
                  const dy = snap(
                    (event.clientY - currentResize.lastClientY) / TILE_SIZE,
                  );
                  if (dx === 0 && dy === 0) {
                    return;
                  }
                  if (!currentResize.savedHistory) {
                    onResizeStart();
                    currentResize.savedHistory = true;
                  }
                  currentResize.lastClientX = event.clientX;
                  currentResize.lastClientY = event.clientY;
                  onResizeSelected(
                    handle,
                    dx,
                    dy,
                    isCornerResizeHandle(handle) ||
                      event.ctrlKey ||
                      event.metaKey,
                  );
                }}
                onPointerUp={(event) => {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                  resizeState.current = null;
                }}
                role="presentation"
              />
            ))}
        </span>
      )}
      {item.label && !item.hideLabel && (
        <InlineEditableLabel
          className="eq-layout-editor-item-label"
          isEditing={isEditingLabel}
          value={item.label}
          onCancel={onCancelLabelEdit}
          onCommit={onRenameLabel}
          onStartEdit={onStartLabelEdit}
        />
      )}
    </div>
  );
}

function SelectionBoxOverlay({ selectionBox }: { selectionBox: SelectionBox }) {
  const left = Math.min(selectionBox.start.x, selectionBox.end.x);
  const top = Math.min(selectionBox.start.y, selectionBox.end.y);
  return (
    <div
      className="eq-layout-editor-selection-box"
      style={{
        height: Math.abs(selectionBox.end.y - selectionBox.start.y),
        left,
        top,
        width: Math.abs(selectionBox.end.x - selectionBox.start.x),
      }}
    />
  );
}

function GroupLabelOverlay({
  group,
  isEditing,
  onCancelEdit,
  onRename,
  onStartEdit,
}: {
  group: {
    bounds: {
      position: { x: number; y: number };
      size: { height: number; width: number };
    };
    groupId: string;
    label: string;
  };
  isEditing: boolean;
  onCancelEdit: () => void;
  onRename: (label: string) => void;
  onStartEdit: () => void;
}) {
  return (
    <InlineEditableLabel
      className="eq-layout-editor-group-label"
      isEditing={isEditing}
      style={{
        left:
          (group.bounds.position.x + group.bounds.size.width / 2) * TILE_SIZE,
        top: (group.bounds.position.y + group.bounds.size.height) * TILE_SIZE,
      }}
      value={group.label}
      onCancel={onCancelEdit}
      onCommit={onRename}
      onStartEdit={onStartEdit}
    />
  );
}

function InlineEditableLabel({
  className,
  isEditing,
  onCancel,
  onCommit,
  onStartEdit,
  style,
  value,
}: {
  className: string;
  isEditing: boolean;
  onCancel: () => void;
  onCommit: (label: string) => void;
  onStartEdit: () => void;
  style?: CSSProperties;
  value: string;
}) {
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldCommitOnBlurRef = useRef(true);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }
    shouldCommitOnBlurRef.current = true;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditing]);

  if (isEditing) {
    return (
      <input
        aria-label="Edit label"
        className={`${className} is-editing`}
        ref={inputRef}
        style={style}
        value={draft}
        onBlur={() => {
          if (shouldCommitOnBlurRef.current) {
            onCommit(draft);
          }
        }}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          event.stopPropagation();
          if (event.key === "Enter") {
            event.preventDefault();
            shouldCommitOnBlurRef.current = false;
            onCommit(draft);
          }
          if (event.key === "Escape") {
            event.preventDefault();
            shouldCommitOnBlurRef.current = false;
            setDraft(value);
            onCancel();
          }
        }}
        onPointerDown={(event) => event.stopPropagation()}
      />
    );
  }

  return (
    <span
      className={className}
      style={style}
      title="Double-click to rename"
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onStartEdit();
      }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {value}
    </span>
  );
}

function SelectedBoundsOverlay({
  bounds,
  onResizeEnd,
  onResizeSelected,
  onResizeStart,
}: {
  bounds: EditorBounds;
  onResizeEnd: () => void;
  onResizeSelected: (
    handle: ResizeHandle,
    dx: number,
    dy: number,
    keepRatio: boolean,
  ) => void;
  onResizeStart: () => void;
}) {
  const resizeState = useRef<{
    handle: ResizeHandle;
    startClientX: number;
    startClientY: number;
    savedHistory: boolean;
  } | null>(null);
  return (
    <div
      className="eq-layout-editor-bounds-box"
      style={{
        height: bounds.size.height * TILE_SIZE,
        left: bounds.position.x * TILE_SIZE,
        top: bounds.position.y * TILE_SIZE,
        width: bounds.size.width * TILE_SIZE,
      }}
    >
      {resizeHandles.map((handle) => (
        <span
          aria-label={`Resize selection ${handle}`}
          className={`eq-layout-editor-resize-handle is-${handle}`}
          key={handle}
          onPointerDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            event.currentTarget.setPointerCapture(event.pointerId);
            resizeState.current = {
              handle,
              startClientX: event.clientX,
              startClientY: event.clientY,
              savedHistory: false,
            };
          }}
          onPointerMove={(event) => {
            const currentResize = resizeState.current;
            if (
              !currentResize ||
              !event.currentTarget.hasPointerCapture(event.pointerId)
            ) {
              return;
            }
            const dx = snap(
              (event.clientX - currentResize.startClientX) / TILE_SIZE,
            );
            const dy = snap(
              (event.clientY - currentResize.startClientY) / TILE_SIZE,
            );
            if (dx === 0 && dy === 0) {
              return;
            }
            if (!currentResize.savedHistory) {
              onResizeStart();
              currentResize.savedHistory = true;
            }
            onResizeSelected(
              handle,
              dx,
              dy,
              isCornerResizeHandle(handle) || event.ctrlKey || event.metaKey,
            );
          }}
          onPointerUp={(event) => {
            event.currentTarget.releasePointerCapture(event.pointerId);
            resizeState.current = null;
            onResizeEnd();
          }}
          role="presentation"
        />
      ))}
    </div>
  );
}

function SpritePreview({
  fill = false,
  sprite,
  targetHeight,
  targetWidth,
  transform,
}: {
  fill?: boolean;
  sprite: SheetSprite;
  targetHeight?: number;
  targetWidth?: number;
  transform?: SpriteTransform;
}) {
  const source = getSpriteSource(sprite);
  const previewWidth = fill ? "100%" : 76;
  const previewHeight = fill ? "100%" : 58;
  const scale = fill
    ? Math.min(
        (targetWidth ?? sprite.sw) / sprite.sw,
        (targetHeight ?? sprite.sh) / sprite.sh,
      )
    : Math.min(76 / sprite.sw, 58 / sprite.sh);
  const renderedWidth = sprite.sw * scale;
  const renderedHeight = sprite.sh * scale;
  const offsetX = fill ? ((targetWidth ?? sprite.sw) - renderedWidth) / 2 : 0;
  const offsetY = fill ? ((targetHeight ?? sprite.sh) - renderedHeight) / 2 : 0;
  return (
    <span
      className="eq-layout-editor-sprite"
      style={{
        backgroundImage: `url(${source.url})`,
        backgroundPosition: `${offsetX - sprite.sx * scale}px ${
          offsetY - sprite.sy * scale
        }px`,
        backgroundSize: `${source.width * scale}px ${source.height * scale}px`,
        height: previewHeight,
        transform: getCssTransform(transform),
        width: previewWidth,
      }}
    />
  );
}

function getSpriteSource(sprite: SheetSprite) {
  if (spriteSources[sprite.image]) {
    return spriteSources[sprite.image];
  }
  const url = (assetUrls as Record<string, string>)[sprite.image];
  return {
    height: sprite.sh,
    url: url ?? officeSheet.url,
    width: sprite.sw,
  };
}

function NumberField({
  label,
  onChange,
  step = 0.05,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  step?: number;
  value: number;
}) {
  return (
    <label>
      {label}
      <input
        step={step}
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function roundPosition(position: EditorItem["position"]) {
  return {
    x: Number(position.x.toFixed(2)),
    y: Number(position.y.toFixed(2)),
  };
}

function roundSize(size: EditorItem["size"]) {
  return {
    height: Number(size.height.toFixed(2)),
    width: Number(size.width.toFixed(2)),
  };
}

function roundToPrecision(value: number) {
  return Number(value.toFixed(3));
}

function getCopiedGroupId(
  groupId: string,
  copiedGroupIds: Map<string, string>,
) {
  const existingGroupId = copiedGroupIds.get(groupId);
  if (existingGroupId) {
    return existingGroupId;
  }
  const nextGroupId = `${groupId}-copy-${copiedGroupIds.size + 1}`;
  copiedGroupIds.set(groupId, nextGroupId);
  return nextGroupId;
}

function getDefaultSizeForItem(item: EditorItem) {
  const matchingPreset =
    presets.find((preset) => preset.id === item.presetId) ??
    presets.find(
      (preset) =>
        preset.sprite.image === item.sprite.image &&
        preset.sprite.sx === item.sprite.sx &&
        preset.sprite.sy === item.sprite.sy &&
        preset.sprite.sw === item.sprite.sw &&
        preset.sprite.sh === item.sprite.sh,
    );
  if (matchingPreset) {
    return matchingPreset.defaultSize;
  }
  return {
    height: Math.max(0.25, item.sprite.sh / TILE_SIZE),
    width: Math.max(0.25, item.sprite.sw / TILE_SIZE),
  };
}

function getEditorItemSortValue(item: EditorItem) {
  return (item.zIndex ?? 0) * 1000 + item.position.y + item.size.height;
}

function getRenderedEditorItems(items: EditorItem[]) {
  return items
    .map((item, index) => ({ index, item }))
    .sort((a, b) => {
      const sortDelta =
        getEditorItemSortValue(a.item) - getEditorItemSortValue(b.item);
      return sortDelta || a.index - b.index;
    })
    .map(({ item }) => item);
}

function getItemVisibleFrame(item: EditorItem) {
  const scale = Math.min(
    item.size.width / item.sprite.sw,
    item.size.height / item.sprite.sh,
  );
  const width = item.sprite.sw * scale;
  const height = item.sprite.sh * scale;
  return {
    offset: {
      x: (item.size.width - width) / 2,
      y: (item.size.height - height) / 2,
    },
    size: { height, width },
  };
}

function getItemVisibleBounds(item: EditorItem) {
  const frame = getItemVisibleFrame(item);
  return {
    position: {
      x: item.position.x + frame.offset.x,
      y: item.position.y + frame.offset.y,
    },
    size: frame.size,
  };
}

function getItemsBounds(items: EditorItem[]) {
  if (items.length === 0) {
    return null;
  }
  const visibleBounds = items.map((item) => getItemVisibleBounds(item));
  const minX = Math.min(...visibleBounds.map((bounds) => bounds.position.x));
  const minY = Math.min(...visibleBounds.map((bounds) => bounds.position.y));
  const maxX = Math.max(
    ...visibleBounds.map((bounds) => bounds.position.x + bounds.size.width),
  );
  const maxY = Math.max(
    ...visibleBounds.map((bounds) => bounds.position.y + bounds.size.height),
  );
  return {
    position: { x: minX, y: minY },
    size: { height: maxY - minY, width: maxX - minX },
  };
}

function getGroupOverlays(items: EditorItem[]) {
  const itemsByGroup = new Map<string, EditorItem[]>();
  for (const item of items) {
    if (!item.groupId || !item.groupLabel) {
      continue;
    }
    itemsByGroup.set(item.groupId, [
      ...(itemsByGroup.get(item.groupId) ?? []),
      item,
    ]);
  }
  return Array.from(itemsByGroup.entries())
    .map(([groupId, groupItems]) => {
      const bounds = getItemsBounds(groupItems);
      const label = groupItems.find((item) => item.groupLabel)?.groupLabel;
      if (!bounds || !label) {
        return null;
      }
      return { bounds, groupId, label };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function scaleItemWithinBounds(
  item: EditorItem,
  previousBounds: {
    position: { x: number; y: number };
    size: { height: number; width: number };
  },
  nextBounds: EditorItem,
) {
  const scaleX = nextBounds.size.width / previousBounds.size.width;
  const scaleY = nextBounds.size.height / previousBounds.size.height;
  const relativeX = item.position.x - previousBounds.position.x;
  const relativeY = item.position.y - previousBounds.position.y;
  return {
    ...item,
    position: {
      x: roundToPrecision(nextBounds.position.x + relativeX * scaleX),
      y: roundToPrecision(nextBounds.position.y + relativeY * scaleY),
    },
    size: {
      height: roundToPrecision(item.size.height * scaleY),
      width: roundToPrecision(item.size.width * scaleX),
    },
  };
}

function getRawTilesForRow(row: number): RawTile[] {
  return Array.from({ length: officeColumns }, (_, col) => ({
    id: `office-r${row + 1}-c${col + 1}`,
    label: `Office sheet row ${row + 1}, column ${col + 1}`,
    sprite: {
      image: "office",
      sx: col * officeTileSize,
      sy: row * officeTileSize,
      sw: officeTileSize,
      sh: officeTileSize,
    },
  }));
}

function getNextRotation(rotation: SpriteTransform["rotate"]) {
  const nextRotation = ((rotation ?? 0) + 90) % 360;
  return nextRotation as 0 | 90 | 180 | 270;
}

function resizeItem(
  item: EditorItem,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  keepRatio: boolean,
  scene: Scene,
) {
  const movesLeft = handle.includes("left");
  const movesRight = handle.includes("right");
  const movesTop = handle.includes("top");
  const movesBottom = handle.includes("bottom");
  const minimumSize = 0.25;
  const originalRight = item.position.x + item.size.width;
  const originalBottom = item.position.y + item.size.height;
  let nextX = item.position.x;
  let nextY = item.position.y;
  let nextWidth = item.size.width;
  let nextHeight = item.size.height;

  if (movesLeft) {
    nextX = clamp(item.position.x + dx, 0, originalRight - minimumSize);
    nextWidth = originalRight - nextX;
  }
  if (movesRight) {
    nextWidth = clamp(item.size.width + dx, minimumSize, scene.width - nextX);
  }
  if (movesTop) {
    nextY = clamp(item.position.y + dy, 0, originalBottom - minimumSize);
    nextHeight = originalBottom - nextY;
  }
  if (movesBottom) {
    nextHeight = clamp(
      item.size.height + dy,
      minimumSize,
      scene.height - nextY,
    );
  }

  if (keepRatio && (movesLeft || movesRight) && (movesTop || movesBottom)) {
    const ratio = item.size.width / item.size.height;
    const widthDelta = Math.abs(nextWidth - item.size.width);
    const heightDelta = Math.abs(nextHeight - item.size.height);
    if (widthDelta >= heightDelta) {
      nextHeight = clamp(nextWidth / ratio, minimumSize, scene.height);
    } else {
      nextWidth = clamp(nextHeight * ratio, minimumSize, scene.width);
    }
    if (movesLeft) {
      nextX = clamp(originalRight - nextWidth, 0, originalRight - minimumSize);
    }
    if (movesTop) {
      nextY = clamp(
        originalBottom - nextHeight,
        0,
        originalBottom - minimumSize,
      );
    }
    nextWidth = clamp(nextWidth, minimumSize, scene.width - nextX);
    nextHeight = clamp(nextHeight, minimumSize, scene.height - nextY);
  }

  return {
    ...item,
    position: {
      x: snap(nextX),
      y: snap(nextY),
    },
    size: {
      height: snap(nextHeight),
      width: snap(nextWidth),
    },
  };
}

function resizeRect(
  rect: Rect,
  handle: ResizeHandle,
  dx: number,
  dy: number,
  scene: Scene,
) {
  const movesLeft = handle.includes("left");
  const movesRight = handle.includes("right");
  const movesTop = handle.includes("top");
  const movesBottom = handle.includes("bottom");
  const minimumSize = 0.25;
  const originalRight = rect.x + rect.width;
  const originalBottom = rect.y + rect.height;
  let nextX = rect.x;
  let nextY = rect.y;
  let nextWidth = rect.width;
  let nextHeight = rect.height;

  if (movesLeft) {
    nextX = clamp(rect.x + dx, 0, originalRight - minimumSize);
    nextWidth = originalRight - nextX;
  }
  if (movesRight) {
    nextWidth = clamp(rect.width + dx, minimumSize, scene.width - nextX);
  }
  if (movesTop) {
    nextY = clamp(rect.y + dy, 0, originalBottom - minimumSize);
    nextHeight = originalBottom - nextY;
  }
  if (movesBottom) {
    nextHeight = clamp(rect.height + dy, minimumSize, scene.height - nextY);
  }

  return {
    height: snap(nextHeight),
    width: snap(nextWidth),
    x: snap(nextX),
    y: snap(nextY),
  };
}

function getCssTransform(transform?: SpriteTransform) {
  const transforms: string[] = [];
  if (transform?.rotate) {
    transforms.push(`rotate(${transform.rotate}deg)`);
  }
  if (transform?.flipX) {
    transforms.push("scaleX(-1)");
  }
  if (transform?.flipY) {
    transforms.push("scaleY(-1)");
  }
  return transforms.join(" ");
}

function getExportTransform(transform?: SpriteTransform) {
  if (!transform?.rotate && !transform?.flipX && !transform?.flipY) {
    return undefined;
  }
  return transform;
}

function snap(value: number) {
  return Math.round(value * 4) / 4;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
