import { evidenceItems } from "@/game/levels";
import type { EarnedArtifact } from "@/game/types";
import { Backpack, FileText, X } from "lucide-react";

interface ArtifactsPanelProps {
  collectedEvidenceIds: string[];
  earnedArtifact: EarnedArtifact | null;
  onClose: () => void;
  onOpenCanvas: () => void;
}

export function ArtifactsPanel({
  collectedEvidenceIds,
  earnedArtifact,
  onClose,
  onOpenCanvas,
}: ArtifactsPanelProps) {
  const collected = evidenceItems.filter((item) =>
    collectedEvidenceIds.includes(item.id),
  );

  return (
    <section
      className="eq-overlay eq-panel eq-side-panel is-right"
      aria-label="Backpack"
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Backpack</p>
          <h2>Evidence and artifacts</h2>
        </div>
        <button className="eq-ghost-button" type="button" onClick={onClose}>
          <X className="h-4 w-4" />
          Close
        </button>
      </div>

      {collected.length === 0 ? (
        <div className="eq-empty">
          <Backpack className="h-8 w-8" />
          <p>
            No evidence collected yet. Enter Operations Suite and inspect the
            case artifacts.
          </p>
        </div>
      ) : (
        <div className="eq-artifact-list">
          {collected.map((item) => (
            <article className="eq-artifact-card" key={item.id}>
              <FileText className="h-5 w-5" />
              <div>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <p className="eq-artifact-insight">{item.insight}</p>
                <small>{item.metric}</small>
              </div>
            </article>
          ))}
        </div>
      )}

      {earnedArtifact && (
        <button
          className="eq-primary-button w-full justify-center"
          type="button"
          onClick={onOpenCanvas}
        >
          Open {earnedArtifact.title}
        </button>
      )}
    </section>
  );
}
