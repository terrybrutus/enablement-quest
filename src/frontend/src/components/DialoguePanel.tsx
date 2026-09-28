import type { GameCharacter } from "@/game/types";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { CSSProperties } from "react";

interface DialoguePanelProps {
  character: GameCharacter;
  line: string;
  lineIndex: number;
  style?: CSSProperties;
  totalLines: number;
  onAdvance: () => void;
  onBack: () => void;
  onClose: () => void;
}

export function DialoguePanel({
  character,
  line,
  lineIndex,
  style,
  totalLines,
  onAdvance,
  onBack,
  onClose,
}: DialoguePanelProps) {
  return (
    <section
      className="eq-dialogue"
      data-ocid="dialogue.panel"
      aria-label={`${character.name} dialogue`}
      style={style}
    >
      <div className="eq-dialogue-speaker">
        <div>
          <p className="eq-kicker">{character.role}</p>
          <h2>{character.name}</h2>
        </div>
        <span>
          {lineIndex + 1} / {totalLines}
        </span>
      </div>

      <p>{line}</p>

      <div className="eq-dialogue-actions">
        <span className="eq-keyboard-hint">Space / Enter continues</span>
        <span className="eq-touch-hint">Tap Continue or Talk or Inspect</span>
        <div>
          <button
            className="eq-ghost-button"
            disabled={lineIndex === 0}
            type="button"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <button className="eq-ghost-button" type="button" onClick={onClose}>
            <X className="h-4 w-4" />
            Close
          </button>
          <button
            className="eq-primary-button"
            type="button"
            onClick={onAdvance}
            data-ocid="dialogue.next_button"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
