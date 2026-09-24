import {
  diagnosisOptions,
  evidenceItems,
  interventionOptions,
} from "@/game/levels";
import type { CaseId, QuestStage } from "@/game/types";
import { CheckCircle2, Circle, X } from "lucide-react";

interface QuestLogProps {
  currentCaseId: CaseId;
  questStage: QuestStage;
  collectedEvidenceIds: string[];
  diagnosisId: string | null;
  interventionId: string | null;
  onClose: () => void;
}

const caseTitles: Record<CaseId, string> = {
  onboarding: "The Broken Onboarding Request",
  sales: "The Stalled Demo Pipeline",
};

const caseRooms: Record<CaseId, string> = {
  onboarding: "Operations Suite",
  sales: "Sales Strategy Studio",
};

export function QuestLog({
  currentCaseId,
  questStage,
  collectedEvidenceIds,
  diagnosisId,
  interventionId,
  onClose,
}: QuestLogProps) {
  const caseEvidence = evidenceItems.filter(
    (item) => item.caseId === currentCaseId,
  );
  const steps = getSteps(currentCaseId);
  const currentIndex = steps.findIndex((step) => step.id === questStage);
  const activeGuidance = getActiveGuidance(
    currentCaseId,
    questStage,
    caseEvidence.filter((item) => collectedEvidenceIds.includes(item.id))
      .length,
    caseEvidence.length,
  );
  const selectedDiagnosis = diagnosisOptions.find(
    (option) => option.caseId === currentCaseId && option.id === diagnosisId,
  );
  const selectedIntervention = interventionOptions.find(
    (option) => option.caseId === currentCaseId && option.id === interventionId,
  );

  return (
    <section
      className="eq-overlay eq-panel eq-side-panel"
      aria-label="Case guide"
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Case Guide</p>
          <h2>{caseTitles[currentCaseId]}</h2>
        </div>
        <button className="eq-ghost-button" type="button" onClick={onClose}>
          <X className="h-4 w-4" />
          Close
        </button>
      </div>

      <div className="eq-mini-section">
        <h3>What to do next</h3>
        <p>{activeGuidance}</p>
      </div>

      <div className="eq-mini-section">
        <h3>The simple path</h3>
        <ol className="eq-simple-path">
          <li>Hear what the leader asked for.</li>
          <li>Review the evidence before building anything.</li>
          <li>Decide what is really causing the problem.</li>
          <li>Choose the solution that changes the work.</li>
          <li>Review the business impact.</li>
        </ol>
      </div>

      <div className="eq-mini-section eq-learning-purpose">
        <h3>What you are practicing</h3>
        <p>
          You are learning to pause before building training, gather evidence,
          diagnose the real work problem, choose the right enablement support,
          and connect the choice to a business result.
        </p>
      </div>

      <div className="eq-mini-section eq-finish-card">
        <h3>How you finish</h3>
        <p>
          Complete this case by earning a case summary. That summary is the
          portfolio artifact: it explains the problem, evidence, decision,
          solution, and measurable impact in plain language.
        </p>
      </div>

      <div className="eq-step-list">
        {steps.map((step, index) => {
          const done = index < currentIndex || questStage === "complete";
          const active = index === currentIndex && questStage !== "complete";
          return (
            <article
              className={`eq-step ${active ? "is-active" : ""}`}
              key={step.id}
            >
              {done ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div className="eq-mini-section">
        <h3>Evidence reviewed</h3>
        {caseEvidence.map((item) => (
          <p key={item.id}>
            {collectedEvidenceIds.includes(item.id) ? "[x]" : "[ ]"}{" "}
            {item.title}
          </p>
        ))}
      </div>

      <div className="eq-mini-section">
        <h3>Decisions</h3>
        <p>Diagnosis: {selectedDiagnosis?.label ?? "Not selected"}</p>
        <p>Intervention: {selectedIntervention?.label ?? "Not selected"}</p>
      </div>
    </section>
  );
}

function getSteps(caseId: CaseId) {
  const room = caseRooms[caseId];
  const stakeholder = caseId === "sales" ? "Leo" : "Maya";
  return [
    {
      id: "briefing",
      title: "1. Hear the request",
      description: `Talk with ${stakeholder} in ${room}. Listen for what leaders asked for, then ask whether that request solves the real problem.`,
    },
    {
      id: "investigate",
      title: "2. Review the evidence",
      description:
        "Inspect each evidence item in order. Each one asks you to separate the useful signal from a tempting wrong assumption.",
    },
    {
      id: "diagnose",
      title: "3. Diagnose the root cause",
      description:
        "Choose the explanation that connects all evidence. The right answer is not automatically more training.",
    },
    {
      id: "design",
      title: "4. Choose the solution",
      description:
        "Pick the intervention that changes the daily work and creates a metric leaders can inspect.",
    },
    {
      id: "complete",
      title: "5. Review the impact",
      description:
        "Review the case summary. It shows the problem, evidence, decision, solution, and business impact.",
    },
  ] as const;
}

function getActiveGuidance(
  caseId: CaseId,
  questStage: QuestStage,
  evidenceCount: number,
  evidenceTotal: number,
) {
  const room = caseRooms[caseId];
  const stakeholder = caseId === "sales" ? "Leo" : "Maya";
  if (questStage === "briefing") {
    return `Talk with ${stakeholder} in ${room}. The learning goal is simple: test the leader's request before designing anything.`;
  }
  if (questStage === "investigate") {
    return `Review the evidence in order. After each item, choose the useful signal. Evidence reviewed: ${evidenceCount}/${evidenceTotal}.`;
  }
  if (questStage === "diagnose") {
    return "Press Talk / Inspect anywhere to open the choices screen. Pick the root cause that explains all three evidence items.";
  }
  if (questStage === "design") {
    return "Press Talk / Inspect anywhere to reopen the choices screen. Choose the solution that fits the root cause.";
  }
  return "Review the case summary. It explains the problem, evidence, decision, solution, and business impact.";
}
