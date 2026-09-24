import { earnedArtifactsByCase, evidenceItems } from "@/game/levels";
import type { CaseId, EarnedArtifact } from "@/game/types";
import { FileText, FolderOpen, X } from "lucide-react";

interface ArtifactsPanelProps {
  collectedEvidenceIds: string[];
  completedCaseIds: CaseId[];
  currentCaseId: CaseId;
  earnedArtifact: EarnedArtifact | null;
  onClose: () => void;
  onOpenCanvas: (caseId?: CaseId) => void;
}

export function ArtifactsPanel({
  collectedEvidenceIds,
  completedCaseIds,
  currentCaseId,
  earnedArtifact,
  onClose,
  onOpenCanvas,
}: ArtifactsPanelProps) {
  const collected = evidenceItems.filter((item) =>
    collectedEvidenceIds.includes(item.id),
  );
  const currentCaseEvidence = collected.filter(
    (item) => item.caseId === currentCaseId,
  );
  const priorCaseEvidence = collected.filter(
    (item) => item.caseId !== currentCaseId,
  );
  const currentCaseLabel =
    currentCaseId === "sales"
      ? "Current case: sales enablement"
      : "Current case: onboarding performance";
  const emptyGuidance =
    currentCaseId === "sales"
      ? "No evidence saved yet. Enter Sales Strategy Studio and review the first marked evidence item."
      : "No evidence saved yet. Enter Operations Suite and review the first marked evidence item.";

  return (
    <section
      className="eq-overlay eq-panel eq-side-panel is-right"
      aria-label="Case notes"
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Notes</p>
          <h2>Evidence and summaries</h2>
          <p>
            This is where the case stops being a game map and becomes your
            recommendation trail.
          </p>
        </div>
        <button className="eq-ghost-button" type="button" onClick={onClose}>
          <X className="h-4 w-4" />
          Close
        </button>
      </div>

      <div className="eq-mini-section">
        <h3>{currentCaseLabel}</h3>
        {currentCaseEvidence.length === 0 ? (
          <div className="eq-empty">
            <FolderOpen className="h-8 w-8" />
            <p>{emptyGuidance}</p>
          </div>
        ) : (
          <>
            <aside className="eq-notes-purpose" aria-label="How to use notes">
              <strong>How to use this evidence</strong>
              <span>
                Focus on the evidence for the case you are solving right now.
                One item can be a symptom; the pattern is what supports your
                final recommendation.
              </span>
            </aside>
            <div className="eq-artifact-list">
              {currentCaseEvidence.map((item) => (
                <EvidenceNoteCard item={item} key={item.id} />
              ))}
            </div>
          </>
        )}
      </div>

      {priorCaseEvidence.length > 0 && (
        <div className="eq-mini-section">
          <h3>Evidence from completed cases</h3>
          <p>
            Keep this separate from the case you are solving now. It is useful
            for comparison, but it should not drive the current diagnosis.
          </p>
          <div className="eq-artifact-list">
            {priorCaseEvidence.map((item) => (
              <EvidenceNoteCard item={item} key={item.id} />
            ))}
          </div>
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

function EvidenceNoteCard({
  item,
}: {
  item: (typeof evidenceItems)[number];
}) {
  return (
    <article className="eq-artifact-card">
      <FileText className="h-5 w-5" />
      <div>
        <h3>{item.title}</h3>
        <p>{item.summary}</p>
        <p className="eq-artifact-insight">{item.insight}</p>
        <small>{item.metric}</small>
      </div>
    </article>
  );
}
