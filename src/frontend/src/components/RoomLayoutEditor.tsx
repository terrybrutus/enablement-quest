import { assetUrls, scenes } from "@/game/levels";
import type { Prop, Scene, SheetSprite, SpriteTransform } from "@/game/types";
import { TILE_SIZE } from "@/game/types";
import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";

interface EditorItem {
  collision: boolean;
  description: string;
  id: string;
  label: string;
  position: { x: number; y: number };
  presetId: string;
  size: { width: number; height: number };
  sprite: SheetSprite;
  spriteTransform?: SpriteTransform;
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

const editorScenes = scenes.filter((scene) => scene.theme === "interior");
const layoutEditorStorageKey = "enablementQuestRoomLayouts.v3";
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
  lab: {
    accent: "#8b5cf6",
    fill: "rgba(124, 58, 237, 0.08)",
    title: "Learning Systems Lab",
    zones: [
      { x: 1.8, y: 3.3, width: 4.4, height: 2.8 },
      { x: 6.5, y: 3.1, width: 3.9, height: 2.4 },
      { x: 10.5, y: 3.2, width: 4.9, height: 2.9 },
      { x: 2.1, y: 7.4, width: 4.5, height: 2.6 },
      { x: 11.6, y: 7.1, width: 4.3, height: 2.6 },
    ],
  },
  operations: {
    accent: "#f59e0b",
    fill: "rgba(120, 53, 15, 0.07)",
    title: "Onboarding Diagnostic Room",
    zones: [
      { x: 6.9, y: 2.8, width: 4.2, height: 2.5 },
      { x: 2.2, y: 4.1, width: 4.7, height: 2.9 },
      { x: 7.1, y: 7.2, width: 4.4, height: 3.1 },
      { x: 11.8, y: 3.8, width: 4.2, height: 3 },
    ],
  },
  sales: {
    accent: "#22d3ee",
    fill: "rgba(8, 145, 178, 0.07)",
    title: "Sales Enablement Studio",
    zones: [
      { x: 4.5, y: 3.5, width: 4.2, height: 2.7 },
      { x: 2.5, y: 5.4, width: 4.4, height: 3.1 },
      { x: 6.7, y: 7.6, width: 5.6, height: 2.7 },
      { x: 11.9, y: 4.1, width: 4.5, height: 3.5 },
    ],
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

function getBlankLayouts() {
  return Object.fromEntries(editorScenes.map((item) => [item.id, []]));
}

export function RoomLayoutEditor() {
  const [sceneId, setSceneId] = useState<string>(editorScenes[0]?.id ?? "lab");
  const [tileRow, setTileRow] = useState(0);
  const [assetCategory, setAssetCategory] = useState(
    "Complete Starter Objects",
  );
  const [assetSearch, setAssetSearch] = useState("");
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
  const items = itemsByScene[scene.id] ?? [];
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [history, setHistory] = useState<Array<Record<string, EditorItem[]>>>(
    [],
  );
  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);
  const selectedItem =
    items.find((item) => item.id === selectedIds[selectedIds.length - 1]) ??
    null;
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  useEffect(() => {
    window.localStorage.setItem(
      layoutEditorStorageKey,
      JSON.stringify(itemsByScene),
    );
  }, [itemsByScene]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardEvent);
    return () => window.removeEventListener("keydown", handleKeyboardEvent);
  });

  function saveHistory() {
    setHistory((previous) => [...previous.slice(-29), itemsByScene]);
  }

  function updateItems(nextItems: EditorItem[], saveSnapshot = true) {
    if (saveSnapshot) {
      saveHistory();
    }
    setItemsByScene((previous) => ({ ...previous, [scene.id]: nextItems }));
  }

  function loadCurrentRoomLayout() {
    const currentLayouts = getCurrentGameLayouts();
    const nextItems = currentLayouts[scene.id] ?? [];
    updateItems(nextItems);
    setSelectedIds(nextItems[0] ? [nextItems[0].id] : []);
  }

  function clearRoomLayout() {
    updateItems([]);
    setSelectedIds([]);
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
    const nextItems = selectedItems.map((item, index) => ({
      ...item,
      id: `${item.id}-copy-${items.length + index + 1}`,
      position: {
        x: clamp(item.position.x + 0.5, 0, scene.width - item.size.width),
        y: clamp(item.position.y + 0.5, 0, scene.height - item.size.height),
      },
    }));
    updateItems([...items, ...nextItems]);
    setSelectedIds(nextItems.map((item) => item.id));
  }

  function removeSelected() {
    if (selectedIds.length === 0) {
      return;
    }
    const remaining = items.filter((item) => !selectedIds.includes(item.id));
    updateItems(remaining);
    setSelectedIds([]);
  }

  function selectItem(itemId: string, additive: boolean) {
    if (!additive) {
      setSelectedIds([itemId]);
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
      return;
    }
    updateItems(
      items.map((item) => {
        if (!itemIds.includes(item.id)) {
          return item;
        }
        return {
          ...item,
          position: {
            x: clamp(item.position.x + dx, 0, scene.width - item.size.width),
            y: clamp(item.position.y + dy, 0, scene.height - item.size.height),
          },
        };
      }),
      saveSnapshot,
    );
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

  function resizeSelectedByKeyboard(dx: number, dy: number) {
    if (selectedIds.length === 0) {
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
    setItemsByScene(previous);
    setHistory((snapshots) => snapshots.slice(0, -1));
    setSelectedIds([]);
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
    const movement: Record<string, { dx: number; dy: number } | undefined> = {
      ArrowDown: { dx: 0, dy: event.shiftKey ? 1 : 0.25 },
      ArrowLeft: { dx: event.shiftKey ? -1 : -0.25, dy: 0 },
      ArrowRight: { dx: event.shiftKey ? 1 : 0.25, dy: 0 },
      ArrowUp: { dx: 0, dy: event.shiftKey ? -1 : -0.25 },
    };
    const nextMove = movement[event.key];
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
        const itemMinX = item.position.x * TILE_SIZE;
        const itemMaxX = (item.position.x + item.size.width) * TILE_SIZE;
        const itemMinY = item.position.y * TILE_SIZE;
        const itemMaxY = (item.position.y + item.size.height) * TILE_SIZE;
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
      props: items.map((item) => ({
        id: item.id,
        label: item.label || undefined,
        description: item.description || undefined,
        position: roundPosition(item.position),
        size: roundSize(item.size),
        sprite: item.sprite,
        spriteTransform: getExportTransform(item.spriteTransform),
        collision: item.collision || undefined,
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
              Start with a blank room, add only assets that are clear, then copy
              the JSON back to Codex.
            </span>
            <small>
              Keys: arrows move, Ctrl+arrows resize, Alt+arrows crop position,
              Alt+Shift+arrows crop size, Delete removes. Ctrl+click
              multi-select, Shift+drag selects a box, Ctrl+drag a corner keeps
              the resize ratio.
            </small>
          </div>

          <label>
            Room
            <select
              value={scene.id}
              onChange={(event) => {
                setSceneId(event.target.value);
                const nextItems = itemsByScene[event.target.value] ?? [];
                setSelectedIds(nextItems[0] ? [nextItems[0].id] : []);
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
          </div>

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
            className="eq-layout-editor-stage"
            style={{
              height: scene.height * TILE_SIZE,
              width: scene.width * TILE_SIZE,
            }}
            onPointerDown={(event) => {
              if (!event.shiftKey || event.target !== event.currentTarget) {
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
            {items.map((item) => (
              <DraggableItem
                isSelected={selectedIds.includes(item.id)}
                item={item}
                key={item.id}
                onDragStart={saveHistory}
                onMoveSelected={(dx, dy) =>
                  moveItems(
                    selectedIds.includes(item.id) ? selectedIds : [item.id],
                    dx,
                    dy,
                    false,
                  )
                }
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
                scene={scene}
              />
            ))}
            {selectionBox && (
              <SelectionBoxOverlay selectionBox={selectionBox} />
            )}
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
          {selectedItem ? (
            <>
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
                <button type="button" onClick={duplicateSelected}>
                  Duplicate piece
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
  return (
    <div className="eq-layout-editor-backdrop">
      <div className="eq-layout-editor-wall" />
      <div className="eq-layout-editor-room-frame" />
      {theme && (
        <>
          <div
            className="eq-layout-editor-room-title"
            style={{ borderColor: theme.accent }}
          >
            {theme.title}
          </div>
          {theme.zones.map((zone) => (
            <div
              className="eq-layout-editor-zone"
              key={`${scene.id}-${zone.x}-${zone.y}`}
              style={{
                backgroundColor: theme.fill,
                borderColor: `${theme.accent}55`,
                height: zone.height * TILE_SIZE,
                left: zone.x * TILE_SIZE,
                top: zone.y * TILE_SIZE,
                width: zone.width * TILE_SIZE,
              }}
            />
          ))}
        </>
      )}
      {scene.portals.map((portal) => (
        <div
          className="eq-layout-editor-portal"
          key={portal.id}
          style={{
            height: portal.rect.height * TILE_SIZE,
            left: portal.rect.x * TILE_SIZE,
            top: portal.rect.y * TILE_SIZE,
            width: portal.rect.width * TILE_SIZE,
          }}
        >
          <span>{portal.label}</span>
        </div>
      ))}
    </div>
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

function DraggableItem({
  isSelected,
  item,
  onDragStart,
  onMoveSelected,
  onResizeSelected,
  onResizeStart,
  onSelect,
  scene,
}: {
  isSelected: boolean;
  item: EditorItem;
  onDragStart: () => void;
  onMoveSelected: (dx: number, dy: number) => void;
  onResizeSelected: (
    handle: ResizeHandle,
    dx: number,
    dy: number,
    keepRatio: boolean,
  ) => void;
  onResizeStart: () => void;
  onSelect: (additive: boolean) => void;
  scene: Scene;
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
    <button
      className={`eq-layout-editor-item ${isSelected ? "is-selected" : ""}`}
      style={{
        height: item.size.height * TILE_SIZE,
        left: item.position.x * TILE_SIZE,
        top: item.position.y * TILE_SIZE,
        width: item.size.width * TILE_SIZE,
      }}
      type="button"
      onPointerDown={(event) => {
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        onSelect(event.ctrlKey || event.metaKey);
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
        onMoveSelected(dx, dy);
        const itemMaxX = scene.width - item.size.width;
        const itemMaxY = scene.height - item.size.height;
        if (
          item.position.x + dx < 0 ||
          item.position.x + dx > itemMaxX ||
          item.position.y + dy < 0 ||
          item.position.y + dy > itemMaxY
        ) {
          currentDrag.lastClientX -= dx * TILE_SIZE;
          currentDrag.lastClientY -= dy * TILE_SIZE;
        }
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
      {item.label && (
        <span className="eq-layout-editor-item-label">{item.label}</span>
      )}
      {isSelected &&
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
              onResizeSelected(handle, dx, dy, event.ctrlKey || event.metaKey);
            }}
            onPointerUp={(event) => {
              event.currentTarget.releasePointerCapture(event.pointerId);
              resizeState.current = null;
            }}
            role="presentation"
          />
        ))}
    </button>
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
  return (
    <span
      className="eq-layout-editor-sprite"
      style={{
        backgroundImage: `url(${source.url})`,
        backgroundPosition: `${-sprite.sx * scale}px ${-sprite.sy * scale}px`,
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
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <label>
      {label}
      <input
        step="0.05"
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
