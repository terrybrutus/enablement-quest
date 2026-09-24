import type { GameCharacter, QuestStage } from "@/game/types";
import { ArrowRight, X } from "lucide-react";

interface DialoguePanelProps {
  character: GameCharacter;
  line: string;
  lineIndex: number;
  stage: QuestStage;
  totalLines: number;
  onAdvance: () => void;
  onClose: () => void;
}

export function DialoguePanel({
  character,
  line,
  lineIndex,
  stage,
  totalLines,
  onAdvance,
  onClose,
}: DialoguePanelProps) {
  return (
    <section
      className="eq-dialogue"
      data-ocid="dialogue.panel"
      aria-label={`${character.name} dialogue`}
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

      <aside className="eq-dialogue-learning" aria-label="Conversation purpose">
        <strong>Listen for</strong>
        <span>{conversationPurpose[stage]}</span>
      </aside>

      <div className="eq-dialogue-actions">
        <span className="eq-keyboard-hint">
          Press <kbd>E</kbd>, <kbd>Space</kbd>, or <kbd>Enter</kbd> to continue
        </span>
        <span className="eq-touch-hint">Tap Continue or Talk / Inspect</span>
        <div>
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

const conversationPurpose: Record<QuestStage, string> = {
  briefing:
    "Separate the leader's request from the real performance problem before you build anything.",
  investigate:
    "Connect what this person says to the evidence pattern you are collecting.",
  diagnose:
    "Check whether your root-cause answer explains what would still be broken after more training.",
  design:
    "Listen for the support, reinforcement, and metric the solution needs.",
  complete:
    "Turn the case into a plain-language portfolio story: problem, decision, solution, and impact.",
};
