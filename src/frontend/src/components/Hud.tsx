import type { InputState, QuestStage } from "@/game/types";
import {
  Backpack,
  ClipboardList,
  Crosshair,
  Hand,
  MapPin,
  SlidersHorizontal,
} from "lucide-react";
import { type MutableRefObject, type PointerEvent, useState } from "react";

interface HudProps {
  sceneName: string;
  sceneSubtitle: string;
  questStage: QuestStage;
  evidenceCount: number;
  evidenceTotal: number;
  hasArtifact: boolean;
  nextObjective: string;
  inputRef: MutableRefObject<InputState>;
  onOpenQuest: () => void;
  onOpenBackpack: () => void;
  onOpenSettings: () => void;
  onInteract: () => void;
}

const stageLabels: Record<QuestStage, string> = {
  briefing: "Briefing",
  investigate: "Investigate",
  diagnose: "Diagnose",
  design: "Design",
  complete: "Measure",
};

export function Hud({
  sceneName,
  sceneSubtitle,
  questStage,
  evidenceCount,
  evidenceTotal,
  hasArtifact,
  nextObjective,
  inputRef,
  onOpenQuest,
  onOpenBackpack,
  onOpenSettings,
  onInteract,
}: HudProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <header className="pointer-events-auto absolute left-3 right-3 top-3 flex flex-col gap-3 md:left-5 md:right-5 md:flex-row md:items-start md:justify-between">
        <section className="eq-hud-card max-w-xl">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-cyan-300" />
            <div>
              <p className="eq-kicker">{sceneName}</p>
              <h1>{sceneSubtitle}</h1>
              <p className="eq-next-objective">{nextObjective}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="eq-pill">
                  <Crosshair className="h-3.5 w-3.5" />
                  {stageLabels[questStage]}
                </span>
                <span className="eq-pill">
                  Evidence {evidenceCount}/{evidenceTotal}
                </span>
                {hasArtifact && (
                  <span className="eq-pill is-success">Canvas earned</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <nav
          className="flex gap-2 self-end md:self-auto"
          aria-label="Game controls"
        >
          <button className="eq-hud-button" type="button" onClick={onOpenQuest}>
            <ClipboardList className="h-4 w-4" />
            <span>Guide</span>
            <kbd>Q</kbd>
          </button>
          <button
            className="eq-hud-button"
            type="button"
            onClick={onOpenBackpack}
          >
            <Backpack className="h-4 w-4" />
            <span>Backpack</span>
            <kbd>B</kbd>
          </button>
          <button
            className="eq-hud-button"
            type="button"
            onClick={onOpenSettings}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </nav>
      </header>

      <MobileControls inputRef={inputRef} onInteract={onInteract} />
    </div>
  );
}

function MobileControls({
  inputRef,
  onInteract,
}: {
  inputRef: MutableRefObject<InputState>;
  onInteract: () => void;
}) {
  const [stick, setStick] = useState({ x: 0, y: 0, active: false });

  const setInput = (key: keyof InputState, value: boolean) => {
    inputRef.current[key] = value;
  };

  const resetInput = () => {
    inputRef.current.up = false;
    inputRef.current.down = false;
    inputRef.current.left = false;
    inputRef.current.right = false;
  };

  const moveStick = (event: PointerEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rawX = event.clientX - centerX;
    const rawY = event.clientY - centerY;
    const distance = Math.hypot(rawX, rawY);
    const maxDistance = 34;
    const scale = distance > maxDistance ? maxDistance / distance : 1;
    const x = rawX * scale;
    const y = rawY * scale;
    const threshold = 10;

    resetInput();
    setInput("left", x < -threshold);
    setInput("right", x > threshold);
    setInput("up", y < -threshold);
    setInput("down", y > threshold);
    setStick({ x, y, active: true });
  };

  const releaseStick = () => {
    resetInput();
    setStick({ x: 0, y: 0, active: false });
  };

  return (
    <div className="eq-mobile-controls pointer-events-auto md:hidden">
      <button
        aria-label="Move"
        className={`eq-joystick ${stick.active ? "is-active" : ""}`}
        type="button"
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          moveStick(event);
        }}
        onPointerMove={(event) => {
          if (stick.active) {
            moveStick(event);
          }
        }}
        onPointerCancel={releaseStick}
        onPointerUp={releaseStick}
      >
        <span
          className="eq-joystick-thumb"
          style={{ transform: `translate(${stick.x}px, ${stick.y}px)` }}
        />
      </button>

      <button className="eq-touch-interact" type="button" onClick={onInteract}>
        <Hand className="h-5 w-5" />
        Interact
      </button>
    </div>
  );
}
