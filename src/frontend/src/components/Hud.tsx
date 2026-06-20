import type { InputState, QuestStage } from "@/game/types";
import { Backpack, ClipboardList, Crosshair, Hand, MapPin } from "lucide-react";
import type { MutableRefObject } from "react";

interface HudProps {
  sceneName: string;
  sceneSubtitle: string;
  questStage: QuestStage;
  evidenceCount: number;
  evidenceTotal: number;
  hasArtifact: boolean;
  inputRef: MutableRefObject<InputState>;
  onOpenQuest: () => void;
  onOpenBackpack: () => void;
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
  inputRef,
  onOpenQuest,
  onOpenBackpack,
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
            <span>Quest</span>
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
  const setInput = (key: keyof InputState, value: boolean) => {
    inputRef.current[key] = value;
  };

  return (
    <div className="eq-mobile-controls pointer-events-auto md:hidden">
      <div className="grid grid-cols-3 gap-1">
        <span />
        <TouchButton label="Up" onPress={(value) => setInput("up", value)} />
        <span />
        <TouchButton
          label="Left"
          onPress={(value) => setInput("left", value)}
        />
        <TouchButton
          label="Down"
          onPress={(value) => setInput("down", value)}
        />
        <TouchButton
          label="Right"
          onPress={(value) => setInput("right", value)}
        />
      </div>

      <button className="eq-touch-interact" type="button" onClick={onInteract}>
        <Hand className="h-5 w-5" />
        Interact
      </button>
    </div>
  );
}

function TouchButton({
  label,
  onPress,
}: {
  label: string;
  onPress: (pressed: boolean) => void;
}) {
  return (
    <button
      className="eq-touch-button"
      type="button"
      aria-label={label}
      onPointerDown={() => onPress(true)}
      onPointerLeave={() => onPress(false)}
      onPointerUp={() => onPress(false)}
    >
      {label.slice(0, 1)}
    </button>
  );
}
