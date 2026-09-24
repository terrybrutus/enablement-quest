import {
  diagnosisOptions,
  evidenceItems,
  interventionOptions,
} from "@/game/levels";
import type { CaseId, QuestStage } from "@/game/types";
import { CheckCircle2, Circle, X } from "lucide-react";
import { useState } from "react";

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
  const finishGuidance = getFinishGuidance(currentCaseId, questStage);
  const simpleExplanation = getSimpleExplanation(currentCaseId);
  const guideCards = [
    {
      title: "Do this now",
      body: activeGuidance,
    },
    {
      title: "Why this is useful",
      body: simpleExplanation,
    },
    {
      title: "The whole path",
      body: "Listen to the request, review the evidence, name the cause, choose the fix, then review the business result.",
    },
    {
      title: "The skill you are practicing",
      body: "Slow down, check the facts, avoid the easy answer, and explain a fix in business language.",
    },
    {
      title: "How you finish",
      body: finishGuidance,
    },
  ];
  const [activeGuideIndex, setActiveGuideIndex] = useState(0);
  const activeGuide = guideCards[activeGuideIndex];

  return (
    <section
      className="eq-overlay eq-panel eq-side-panel"
      aria-label="Case guide"
    >
      <div className="eq-panel-header">
        <div>
          <p className="eq-kicker">Case Help</p>
          <h2>{caseTitles[currentCaseId]}</h2>
        </div>
        <button className="eq-ghost-button" type="button" onClick={onClose}>
          <X className="h-4 w-4" />
          Close
        </button>
      </div>

      <section className="eq-guide-carousel" aria-label="Case help steps">
        <div>
          <p className="eq-kicker">
            Help {activeGuideIndex + 1} of {guideCards.length}
          </p>
          <h3>{activeGuide.title}</h3>
          <p>{activeGuide.body}</p>
        </div>
        <div className="eq-guide-carousel-actions">
          <button
            className="eq-ghost-button"
            disabled={activeGuideIndex === 0}
            type="button"
            onClick={() =>
              setActiveGuideIndex((index) => Math.max(0, index - 1))
            }
          >
            Back
          </button>
          <button
            className="eq-primary-button"
            disabled={activeGuideIndex === guideCards.length - 1}
            type="button"
            onClick={() =>
              setActiveGuideIndex((index) =>
                Math.min(guideCards.length - 1, index + 1),
              )
            }
          >
            Next
          </button>
        </div>
      </section>

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
                <small className="eq-step-outcome">
                  Done when: {step.outcome}
                </small>
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
      outcome: `${stakeholder} finishes the briefing and the app points you to the first evidence item.`,
    },
    {
      id: "investigate",
      title: "2. Review the evidence",
      description:
        "Review each evidence item in order. Each one asks what the evidence proves about the work problem.",
      outcome:
        "All three evidence items are checked off and the choice screen opens for the real cause.",
    },
    {
      id: "diagnose",
      title: "3. Name the real cause",
      description:
        "Choose the explanation that connects all three evidence items. The right answer may not be more training.",
      outcome:
        "The fix choices unlock because your cause explains the evidence.",
    },
    {
      id: "design",
      title: "4. Choose the fix",
      description:
        "Pick the fix that changes daily work and gives leaders a number they can watch.",
      outcome:
        "You earn a case summary that explains the work in plain English.",
    },
    {
      id: "complete",
      title: "5. Review the impact",
      description:
        "Review the case summary. It shows the problem, evidence, decision, fix, and business result.",
      outcome:
        caseId === "onboarding"
          ? "Case 02 is available."
          : "The final reviewer debrief is available.",
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
    return `Talk with ${stakeholder} in ${room}. Your job is to understand the request before deciding what to build.`;
  }
  if (questStage === "investigate") {
    return `Review the evidence in order. After each item, choose what it tells you about the real work problem. Evidence reviewed: ${evidenceCount}/${evidenceTotal}.`;
  }
  if (questStage === "diagnose") {
    return "Return to the case person and use Talk or Inspect. Pick the cause that explains all three evidence items.";
  }
  if (questStage === "design") {
    return "Return to the case person and use Talk or Inspect. Pick the fix that matches the cause.";
  }
  return "Review the case summary. It explains the problem, evidence, decision, fix, and business result.";
}

function getSimpleExplanation(caseId: CaseId) {
  if (caseId === "sales") {
    return "This case is about sales enablement. You are checking whether the team needs more training, better coaching, clearer sales habits, or a better way to review sales progress.";
  }
  return "This case is about solving a work problem. You are checking whether a training request is really a training problem, or whether the process around people is broken.";
}

function getFinishGuidance(caseId: CaseId, questStage: QuestStage) {
  if (caseId === "onboarding" && questStage === "complete") {
    return "Case 01 is the performance-consulting proof. Use the case summary button to start Case 02, where the same diagnosis loop shifts into sales enablement.";
  }
  if (caseId === "onboarding") {
    return "Finish Case 01 by earning a plain-language case summary. That summary unlocks Case 02, the sales enablement version of the same diagnostic pattern.";
  }
  if (questStage === "complete") {
    return "After Case 02, review the final debrief. That is the portfolio proof: performance consulting, sales enablement, learning architecture, and business impact in plain language.";
  }
  return "Finish Case 02 by earning the sales enablement summary. That second summary completes the portfolio path and unlocks the final reviewer debrief.";
}
