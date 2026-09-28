import { scenes } from "@/game/levels";
import type { Prop, Scene, SheetSprite } from "@/game/types";
import { TILE_SIZE } from "@/game/types";
import { useEffect, useMemo, useState } from "react";
import type { PointerEvent } from "react";

interface EditorItem {
  collision: boolean;
  description: string;
  id: string;
  label: string;
  position: { x: number; y: number };
  presetId: string;
  size: { width: number; height: number };
  sprite: SheetSprite;
}

interface SpritePreset {
  defaultSize: { width: number; height: number };
  id: string;
  label: string;
  role: string;
  sprite: SheetSprite;
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
const layoutEditorStorageKey = "enablementQuestRoomLayouts";

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

export function RoomLayoutEditor() {
  const [sceneId, setSceneId] = useState<string>(editorScenes[0]?.id ?? "lab");
  const scene = useMemo(
    () => editorScenes.find((item) => item.id === sceneId) ?? editorScenes[0],
    [sceneId],
  );
  const [itemsByScene, setItemsByScene] = useState<
    Record<string, EditorItem[]>
  >(() => {
    const defaultLayouts = Object.fromEntries(
      editorScenes.map((item) => [
        item.id,
        item.props
          .filter((prop) => prop.sprite)
          .map((prop) => propToEditorItem(prop)),
      ]),
    );
    const savedLayouts = window.localStorage.getItem(layoutEditorStorageKey);
    if (!savedLayouts) {
      return defaultLayouts;
    }
    try {
      return { ...defaultLayouts, ...JSON.parse(savedLayouts) };
    } catch {
      return defaultLayouts;
    }
  });
  const items = itemsByScene[scene.id] ?? [];
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "");
  const selectedItem =
    items.find((item) => item.id === selectedId) ?? items[0] ?? null;

  useEffect(() => {
    window.localStorage.setItem(
      layoutEditorStorageKey,
      JSON.stringify(itemsByScene),
    );
  }, [itemsByScene]);

  function updateItems(nextItems: EditorItem[]) {
    setItemsByScene((previous) => ({ ...previous, [scene.id]: nextItems }));
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

  function addPreset(preset: SpritePreset) {
    const nextItem = createItem(preset, items.length);
    updateItems([...items, nextItem]);
    setSelectedId(nextItem.id);
  }

  function removeSelected() {
    if (!selectedItem) {
      return;
    }
    const remaining = items.filter((item) => item.id !== selectedItem.id);
    updateItems(remaining);
    setSelectedId(remaining[0]?.id ?? "");
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
        collision: item.collision || undefined,
      })),
    },
    null,
    2,
  );

  return (
    <main className="eq-layout-editor">
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
          <label>
            Room
            <select
              value={scene.id}
              onChange={(event) => {
                setSceneId(event.target.value);
                const nextItems = itemsByScene[event.target.value] ?? [];
                setSelectedId(nextItems[0]?.id ?? "");
              }}
            >
              {editorScenes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <div className="eq-layout-editor-palette">
            <h2>Add Assets</h2>
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
        </aside>

        <section className="eq-layout-editor-stage-panel">
          <div
            className="eq-layout-editor-stage"
            style={{
              height: scene.height * TILE_SIZE,
              width: scene.width * TILE_SIZE,
            }}
          >
            <RoomBackdrop scene={scene} />
            <RoomGrid scene={scene} />
            {items.map((item) => (
              <DraggableItem
                isSelected={item.id === selectedItem?.id}
                item={item}
                key={item.id}
                onChange={(nextItem) => {
                  updateItems(
                    items.map((current) =>
                      current.id === item.id ? nextItem : current,
                    ),
                  );
                }}
                onSelect={() => setSelectedId(item.id)}
                scene={scene}
              />
            ))}
          </div>
        </section>

        <aside className="eq-layout-editor-inspector">
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
  onChange,
  onSelect,
  scene,
}: {
  isSelected: boolean;
  item: EditorItem;
  onChange: (item: EditorItem) => void;
  onSelect: () => void;
  scene: Scene;
}) {
  function moveItem(event: PointerEvent<HTMLButtonElement>) {
    const parent = event.currentTarget.parentElement;
    if (!parent) {
      return;
    }
    const rect = parent.getBoundingClientRect();
    const x = clamp(
      snap(
        (event.clientX - rect.left - (item.size.width * TILE_SIZE) / 2) /
          TILE_SIZE,
      ),
      0,
      scene.width - item.size.width,
    );
    const y = clamp(
      snap(
        (event.clientY - rect.top - (item.size.height * TILE_SIZE) / 2) /
          TILE_SIZE,
      ),
      0,
      scene.height - item.size.height,
    );
    onChange({ ...item, position: { x, y } });
  }

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
        event.currentTarget.setPointerCapture(event.pointerId);
        onSelect();
        moveItem(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          moveItem(event);
        }
      }}
      onPointerUp={(event) => {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }}
    >
      <SpritePreview
        fill
        sprite={item.sprite}
        targetHeight={item.size.height * TILE_SIZE}
        targetWidth={item.size.width * TILE_SIZE}
      />
      {item.label && (
        <span className="eq-layout-editor-item-label">{item.label}</span>
      )}
    </button>
  );
}

function SpritePreview({
  fill = false,
  sprite,
  targetHeight,
  targetWidth,
}: {
  fill?: boolean;
  sprite: SheetSprite;
  targetHeight?: number;
  targetWidth?: number;
}) {
  const previewWidth = fill ? "100%" : 58;
  const previewHeight = fill ? "100%" : 42;
  const scale = fill
    ? Math.min(
        (targetWidth ?? sprite.sw) / sprite.sw,
        (targetHeight ?? sprite.sh) / sprite.sh,
      )
    : Math.min(58 / sprite.sw, 42 / sprite.sh);
  return (
    <span
      className="eq-layout-editor-sprite"
      style={{ height: previewHeight, width: previewWidth }}
    >
      <img
        alt=""
        src={officeSheet.url}
        style={{
          height: officeSheet.height * scale,
          transform: `translate(${-sprite.sx * scale}px, ${-sprite.sy * scale}px)`,
          width: officeSheet.width * scale,
        }}
      />
    </span>
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

function snap(value: number) {
  return Math.round(value * 4) / 4;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
