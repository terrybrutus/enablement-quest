import type { InputState, QuestStage } from "@/game/types";
import {
  Backpack,
  ClipboardList,
  Crosshair,
  Hand,
  Info,
  MapPin,
  Minimize2,
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
  const [isGuideExpanded, setIsGuideExpanded] = useState(false);
  const shortObjective = shortenObjective(nextObjective);

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <header className="pointer-events-auto absolute left-3 right-3 top-3 flex items-start justify-between gap-2 md:left-5 md:right-5 md:gap-3">
        <section
          className={`eq-hud-card max-w-xl ${isGuideExpanded ? "" : "is-collapsed"}`}
        >
          <button
            className="eq-hud-toggle"
            type="button"
            onClick={() => setIsGuideExpanded((value) => !value)}
            aria-label={isGuideExpanded ? "Collapse guide" : "Expand guide"}
          >
            {isGuideExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}
          </button>

          {isGuideExpanded ? (
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
          ) : (
            <div className="eq-hud-summary">
              <span>{stageLabels[questStage]}</span>
              <strong title={nextObjective}>{shortObjective}</strong>
              <small>
                Evidence {evidenceCount}/{evidenceTotal}
              </small>
            </div>
          )}
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

function shortenObjective(objective: string) {
  return objective
    .replace(
      "Step 1: enter Operations Suite and talk to Maya.",
      "Go to Operations, talk to Maya.",
    )
    .replace(
      "Step 1: talk to Maya, then inspect the marked evidence in order.",
      "Talk to Maya, inspect evidence.",
    )
    .replace(
      "Step 1: enter Sales Strategy Studio and talk to Leo.",
      "Go to Sales Studio, talk to Leo.",
    )
    .replace(
      "Step 1: talk to Leo, then inspect the marked evidence in order.",
      "Talk to Leo, inspect evidence.",
    )
    .replace(
      "Step 7: first canvas earned. Leave, then enter Sales Strategy Studio.",
      "Canvas earned. Go to Sales Studio.",
    )
    .replace(/^Step \d+:\s*/i, "")
    .replace(/, then /gi, " -> ")
    .replace("marked evidence", "evidence")
    .replace("Operations Suite", "Operations")
    .replace("Sales Strategy Studio", "Sales Studio")
    .replace(
      "intervention that fits the root cause and metric",
      "best intervention",
    )
    .replace("press Interact away from objects and choose", "choose");
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
