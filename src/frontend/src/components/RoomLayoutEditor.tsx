import { scenes } from "@/game/levels";
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

const officeSheet = {
  height: 2544,
  url: "/assets/limezu/office-48.png",
  width: 768,
};

const presets: SpritePreset[] = [
  {
    id: "email-computer-desk",
    label: "Email Computer Desk",
    role: "Use for readable email/computer interactions.",
    defaultSize: { width: 3, height: 2 },
    sprite: { image: "office", sx: 384, sy: 1296, sw: 144, sh: 96 },
  },
  {
    id: "workstation-blue",
    label: "Blue Workstation",
    role: "Use for office work pods and evidence stations.",
    defaultSize: { width: 3, height: 2 },
    sprite: { image: "office", sx: 528, sy: 1296, sw: 144, sh: 96 },
  },
  {
    id: "workstation-corner",
    label: "Corner Workstation",
    role: "Use when you want a larger cubicle corner.",
    defaultSize: { width: 3, height: 2 },
    sprite: { image: "office", sx: 384, sy: 1344, sw: 144, sh: 96 },
  },
  {
    id: "desk-plain",
    label: "Plain Desk",
    role: "Use only as supporting furniture, not for email.",
    defaultSize: { width: 3, height: 1.6 },
    sprite: { image: "office", sx: 336, sy: 1392, sw: 144, sh: 96 },
  },
  {
    id: "monitor-wall",
    label: "Wall Monitor",
    role: "Use for dashboards, reports, or metrics.",
    defaultSize: { width: 2.7, height: 1.35 },
    sprite: { image: "office", sx: 432, sy: 528, sw: 144, sh: 48 },
  },
  {
    id: "whiteboard",
    label: "Whiteboard",
    role: "Use for planning, evidence boards, or briefing walls.",
    defaultSize: { width: 2.7, height: 1.35 },
    sprite: { image: "office", sx: 240, sy: 336, sw: 144, sh: 48 },
  },
  {
    id: "bookcase",
    label: "Bookcase",
    role: "Use against walls to reduce empty space.",
    defaultSize: { width: 2.5, height: 1.8 },
    sprite: { image: "office", sx: 336, sy: 672, sw: 144, sh: 96 },
  },
  {
    id: "server-rack",
    label: "Server Rack",
    role: "Use for evidence storage or systems lab areas.",
    defaultSize: { width: 1.5, height: 1.8 },
    sprite: { image: "office", sx: 0, sy: 1152, sw: 96, sh: 96 },
  },
  {
    id: "printer-cluster",
    label: "Printer Cluster",
    role: "Use as supporting office equipment.",
    defaultSize: { width: 2.8, height: 1.05 },
    sprite: { image: "office", sx: 384, sy: 2004, sw: 192, sh: 60 },
  },
  {
    id: "plant-small",
    label: "Office Plant",
    role: "Use sparingly; keep near walls/corners.",
    defaultSize: { width: 1, height: 1.35 },
    sprite: { image: "office", sx: 288, sy: 192, sw: 48, sh: 96 },
  },
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
  const scene = useMemo(
    () => editorScenes.find((item) => item.id === sceneId) ?? editorScenes[0],
    [sceneId],
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

  function updateSelectedSprite(patch: Partial<SheetSprite>) {
    if (!selectedItem) {
      return;
    }
    updateSelected({ sprite: { ...selectedItem.sprite, ...patch } });
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

  function undo() {
    const previous = history.at(-1);
    if (!previous) {
      return;
    }
    setItemsByScene(previous);
    setHistory((snapshots) => snapshots.slice(0, -1));
    setSelectedIds([]);
  }

  function handleKeyboard(event: KeyboardEvent<HTMLElement>) {
    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement
    ) {
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
      moveItems(selectedIds, nextMove.dx, nextMove.dy);
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      removeSelected();
    }
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
              Keys: arrows move selected pieces, Shift+arrows move faster,
              Ctrl+Z undoes, Ctrl+click multi-select, Shift+drag selects a box.
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
            <h2>Add Starter Examples</h2>
            <p>
              These are only starting crops. Use raw tiles below for exact
              assembly.
            </p>
            {presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => addPreset(preset)}
              >
                <SpritePreview sprite={preset.sprite} />
                <span>
                  <strong>{preset.label}</strong>
                  <small>{preset.role}</small>
                </span>
              </button>
            ))}
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
                    updateSelected({ collision: event.target.checked })
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
                <button
                  type="button"
                  onClick={() =>
                    updateSelected({
                      spriteTransform: {
                        ...selectedItem.spriteTransform,
                        rotate: getNextRotation(
                          selectedItem.spriteTransform?.rotate,
                        ),
                      },
                    })
                  }
                >
                  Rotate 90°
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSelected({
                      spriteTransform: {
                        ...selectedItem.spriteTransform,
                        flipX: !selectedItem.spriteTransform?.flipX,
                      },
                    })
                  }
                >
                  Flip horizontal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateSelected({
                      spriteTransform: {
                        ...selectedItem.spriteTransform,
                        flipY: !selectedItem.spriteTransform?.flipY,
                      },
                    })
                  }
                >
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
  onSelect,
  scene,
}: {
  isSelected: boolean;
  item: EditorItem;
  onDragStart: () => void;
  onMoveSelected: (dx: number, dy: number) => void;
  onSelect: (additive: boolean) => void;
  scene: Scene;
}) {
  const dragState = useRef<{
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
        backgroundImage: `url(${officeSheet.url})`,
        backgroundPosition: `${-sprite.sx * scale}px ${-sprite.sy * scale}px`,
        backgroundSize: `${officeSheet.width * scale}px ${
          officeSheet.height * scale
        }px`,
        height: previewHeight,
        transform: getCssTransform(transform),
        width: previewWidth,
      }}
    />
  );
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
