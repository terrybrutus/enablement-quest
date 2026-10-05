import GameCanvas from "@/components/GameCanvas";
import {
  RoomLayoutEditor,
  layoutPreviewStorageKey,
} from "@/components/RoomLayoutEditor";
import type { Position, Scene } from "@/game/types";

interface LayoutPreviewPayload {
  position: Position;
  scene: Scene;
}

export default function App() {
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.has("layoutEditor")) {
    return <RoomLayoutEditor />;
  }
  if (searchParams.has("layoutPreview")) {
    const preview = getLayoutPreviewPayload();
    return <GameCanvas layoutPreview={preview} />;
  }
  return <GameCanvas />;
}

function getLayoutPreviewPayload(): LayoutPreviewPayload | null {
  const saved = window.localStorage.getItem(layoutPreviewStorageKey);
  if (!saved) {
    return null;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}
