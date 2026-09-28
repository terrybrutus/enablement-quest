import GameCanvas from "@/components/GameCanvas";
import { RoomLayoutEditor } from "@/components/RoomLayoutEditor";

export default function App() {
  if (new URLSearchParams(window.location.search).has("layoutEditor")) {
    return <RoomLayoutEditor />;
  }
  return <GameCanvas />;
}
