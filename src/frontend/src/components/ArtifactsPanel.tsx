import { earnedArtifactsByCase, evidenceItems } from "@/game/levels";
import type { CaseId, EarnedArtifact } from "@/game/types";
import { FileText, FolderOpen, X } from "lucide-react";

interface ArtifactsPanelProps {
  collectedEvidenceIds: string[];
  completedCaseIds: CaseId[];
  earnedArtifact: EarnedArtifact | null;
  onClose: () => void;
  onOpenCanvas: (caseId?: CaseId) => void;
}

export function ArtifactsPanel({
  collectedEvidenceIds,
  completedCaseIds,
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
      aria-label="Case notes"
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Notes</p>
          <h2>Clues and summaries</h2>
        </div>
        <button className="eq-ghost-button" type="button" onClick={onClose}>
          <X className="h-4 w-4" />
          Close
        </button>
      </div>

      {collected.length === 0 ? (
        <div className="eq-empty">
          <FolderOpen className="h-8 w-8" />
          <p>
            No clues saved yet. Enter Operations Suite and inspect the first
            marked clue.
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

      {(earnedArtifact || completedCaseIds.length > 0) && (
        <div className="eq-summary-actions">
          {earnedArtifact && (
            <button
              className="eq-primary-button w-full justify-center"
              type="button"
              onClick={() => onOpenCanvas()}
            >
              Open current case summary
            </button>
          )}

          {completedCaseIds.length > 0 && (
            <div className="eq-mini-section">
              <h3>Completed case summaries</h3>
              {completedCaseIds.map((caseId) => (
                <button
                  className="eq-ghost-button w-full justify-center"
                  key={caseId}
                  type="button"
                  onClick={() => onOpenCanvas(caseId)}
                >
                  {earnedArtifactsByCase[caseId].title}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
