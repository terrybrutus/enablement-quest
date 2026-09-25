import type { InputState, QuestStage } from "@/game/types";
import {
  ClipboardList,
  FolderOpen,
  Hand,
  RotateCcw,
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
  coachAction: string;
  coachReason: string;
  inputRef: MutableRefObject<InputState>;
  onOpenQuest: () => void;
  onOpenCaseFile: () => void;
  onOpenSettings: () => void;
  onInteract: () => void;
  onRestart: () => void;
}

const stageLabels: Record<QuestStage, string> = {
  briefing: "Step 1 of 5",
  investigate: "Step 2 of 5",
  diagnose: "Step 3 of 5",
  design: "Step 4 of 5",
  complete: "Step 5 of 5",
};

export function Hud({
  sceneName,
  sceneSubtitle,
  questStage,
  evidenceCount,
  evidenceTotal,
  hasArtifact,
  nextObjective,
  coachAction,
  coachReason,
  inputRef,
  onOpenQuest,
  onOpenCaseFile,
  onOpenSettings,
  onInteract,
  onRestart,
}: HudProps) {
  const [isRestartConfirmOpen, setIsRestartConfirmOpen] = useState(false);
  const stepLabel = getStepLabel(questStage, evidenceCount, evidenceTotal);

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <header className="pointer-events-auto absolute left-3 right-3 top-3 flex justify-end gap-2 md:left-5 md:right-5">
        <nav className="eq-hud-nav" aria-label="Case controls">
          <button className="eq-hud-button" type="button" onClick={onOpenQuest}>
            <ClipboardList className="h-4 w-4" />
            <span>Guide</span>
            <kbd>Q</kbd>
          </button>
          <button
            className="eq-hud-button"
            type="button"
            onClick={onOpenCaseFile}
          >
            <FolderOpen className="h-4 w-4" />
            <span>Evidence</span>
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
          <button
            className="eq-hud-button"
            type="button"
            onClick={() => setIsRestartConfirmOpen(true)}
          >
            <RotateCcw className="h-4 w-4" />
            <span>Start Over</span>
          </button>
        </nav>
      </header>

      <section className="eq-bottom-directive" aria-label="Current objective">
        <div>
          <p className="eq-kicker">
            {stepLabel} | {sceneName}
          </p>
          <h1>{coachAction}</h1>
          <p>{nextObjective}</p>
          <small>{coachReason}</small>
        </div>
        <div className="eq-directive-status">
          <span>{sceneSubtitle}</span>
          <strong>
            Evidence {evidenceCount}/{evidenceTotal}
          </strong>
          {hasArtifact && <strong>Summary earned</strong>}
        </div>
      </section>

      {isRestartConfirmOpen && (
        <section
          className="eq-restart-confirm pointer-events-auto"
          aria-label="Start over confirmation"
        >
          <div className="eq-panel">
            <p className="eq-kicker">Start Over</p>
            <h2>Restart the case?</h2>
            <p>
              This clears your current evidence and returns you to the intro
              screen.
            </p>
            <div className="eq-confirm-actions">
              <button
                className="eq-ghost-button"
                type="button"
                onClick={() => setIsRestartConfirmOpen(false)}
              >
                Cancel
              </button>
              <button
                className="eq-primary-button"
                type="button"
                onClick={() => {
                  setIsRestartConfirmOpen(false);
                  onRestart();
                }}
              >
                Start over
              </button>
            </div>
          </div>
        </section>
      )}

      <MobileControls inputRef={inputRef} onInteract={onInteract} />
    </div>
  );
}

function getStepLabel(
  questStage: QuestStage,
  evidenceCount: number,
  evidenceTotal: number,
) {
  if (questStage === "investigate") {
    return `Step 2 of 5 | Evidence ${evidenceCount}/${evidenceTotal}`;
  }
  return (
    stageLabels[questStage] ?? `Evidence ${evidenceCount}/${evidenceTotal}`
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
        Talk or Inspect
      </button>
    </div>
  );
}
