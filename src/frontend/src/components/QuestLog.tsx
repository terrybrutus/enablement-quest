import {
  diagnosisOptions,
  evidenceItems,
  interventionOptions,
} from "@/game/levels";
import type { QuestStage } from "@/game/types";
import { CheckCircle2, Circle, X } from "lucide-react";

interface QuestLogProps {
  questStage: QuestStage;
  collectedEvidenceIds: string[];
  diagnosisId: string | null;
  interventionId: string | null;
  onClose: () => void;
}

const steps = [
  {
    id: "briefing",
    title: "Reach the case room",
    description:
      "Leave the lab through the blue doorway, then enter Operations Suite.",
  },
  {
    id: "investigate",
    title: "Investigate",
    description:
      "Talk to Maya, then collect the interview note, process map, and performance metric.",
  },
  {
    id: "diagnose",
    title: "Diagnose",
    description:
      "Decide whether this is a training problem, workflow problem, tool problem, or reinforcement problem.",
  },
  {
    id: "design",
    title: "Design",
    description: "Choose the enablement intervention that fits the root cause.",
  },
  {
    id: "complete",
    title: "Measure",
    description: "Review the business impact and earned diagnostic canvas.",
  },
] as const;

export function QuestLog({
  questStage,
  collectedEvidenceIds,
  diagnosisId,
  interventionId,
  onClose,
}: QuestLogProps) {
  const currentIndex = steps.findIndex((step) => step.id === questStage);
  const activeGuidance = getActiveGuidance(
    questStage,
    collectedEvidenceIds.length,
  );
  const selectedDiagnosis = diagnosisOptions.find(
    (option) => option.id === diagnosisId,
  );
  const selectedIntervention = interventionOptions.find(
    (option) => option.id === interventionId,
  );

  return (
    <section
      className="eq-overlay eq-panel eq-side-panel"
      aria-label="Mission guide"
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Mission Guide</p>
          <h2>The Broken Onboarding Portal</h2>
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
        {evidenceItems.map((item) => (
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

function getActiveGuidance(questStage: QuestStage, evidenceCount: number) {
  if (questStage === "briefing") {
    return "Leave the lab, enter Operations Suite, and talk to Maya before collecting evidence.";
  }
  if (questStage === "investigate") {
    return `Collect the three evidence items. Each one points to a different part of the performance problem. Evidence collected: ${evidenceCount}/3.`;
  }
  if (questStage === "diagnose") {
    return "Press interact to open the decision panel, then decide whether the root cause is training, workflow, tool friction, or reinforcement.";
  }
  if (questStage === "design") {
    return "Choose the intervention that fits the root cause. The best answer should change behavior and create a measurable signal.";
  }
  return "Review the earned canvas. This is the portfolio artifact that explains the problem, evidence, decision, solution, and impact.";
}
