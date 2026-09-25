import type { GameCharacter, QuestStage } from "@/game/types";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

interface DialoguePanelProps {
  character: GameCharacter;
  line: string;
  lineIndex: number;
  stage: QuestStage;
  totalLines: number;
  onAdvance: () => void;
  onBack: () => void;
  onClose: () => void;
}

export function DialoguePanel({
  character,
  line,
  lineIndex,
  stage,
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

      <aside className="eq-dialogue-learning" aria-label="Conversation tip">
        <strong>Why this matters</strong>
        <span>{conversationPurpose[stage]}</span>
      </aside>

      <div className="eq-dialogue-actions">
        <span className="eq-keyboard-hint">
          Press <kbd>E</kbd>, <kbd>Space</kbd>, or <kbd>Enter</kbd> to continue
        </span>
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

const conversationPurpose: Record<QuestStage, string> = {
  briefing:
    "Leo is explaining the request. Your next job is to check whether the evidence supports it.",
  investigate: "Compare what people say with the clues you collect.",
  diagnose: "Choose the cause that best explains the clues.",
  design: "Choose the support that would improve the work.",
  complete: "Summarize the problem, cause, fix, and expected result.",
};
