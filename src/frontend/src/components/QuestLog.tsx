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
  onboarding: "The Broken Onboarding Portal",
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
      aria-label="Mission guide"
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Mission Guide</p>
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
        <h3>Evidence</h3>
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
      title: "Reach the case room",
      description: `Go to ${room} and talk to ${stakeholder}.`,
    },
    {
      id: "investigate",
      title: "Investigate",
      description:
        "Collect each evidence item and read what it says about the performance problem.",
    },
    {
      id: "diagnose",
      title: "Diagnose",
      description:
        "Choose the root cause that best explains the full evidence pattern.",
    },
    {
      id: "design",
      title: "Design",
      description:
        "Choose the enablement intervention that changes behavior and creates a useful metric.",
    },
    {
      id: "complete",
      title: "Measure",
      description: "Review the business impact and earned canvas.",
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
    return `Enter ${room} and talk to ${stakeholder}. They frame the business request before you inspect evidence.`;
  }
  if (questStage === "investigate") {
    return `Collect ${evidenceTotal} evidence items. Each one points to a different part of the performance problem. Evidence collected: ${evidenceCount}/${evidenceTotal}.`;
  }
  if (questStage === "diagnose") {
    return "Open the decision panel and pick the root cause that connects all evidence. Do not just pick the most training-looking answer.";
  }
  if (questStage === "design") {
    return "Choose the intervention that fits the root cause. The best answer should change behavior and create a measurable signal.";
  }
  return "Review the earned canvas. This is the portfolio artifact that explains the problem, evidence, decision, solution, and impact.";
}
