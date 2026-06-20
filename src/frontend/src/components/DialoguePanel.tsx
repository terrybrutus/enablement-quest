import type { Npc } from "@/game/types";
import { ArrowRight, X } from "lucide-react";

interface DialoguePanelProps {
  npc: Npc;
  line: string;
  lineIndex: number;
  totalLines: number;
  onAdvance: () => void;
  onClose: () => void;
}

export function DialoguePanel({
  npc,
  line,
  lineIndex,
  totalLines,
  onAdvance,
  onClose,
}: DialoguePanelProps) {
  return (
    <section
      className="eq-dialogue"
      data-ocid="dialogue.panel"
      aria-label={`${npc.name} dialogue`}
    >
      <div className="eq-dialogue-speaker">
        <div>
          <p className="eq-kicker">{npc.role}</p>
          <h2>{npc.name}</h2>
        </div>
        <span>
          {lineIndex + 1} / {totalLines}
        </span>
      </div>

      <p>{line}</p>

      <div className="eq-dialogue-actions">
        <span>
          Press <kbd>E</kbd>, <kbd>Space</kbd>, or <kbd>Enter</kbd>
        </span>
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
