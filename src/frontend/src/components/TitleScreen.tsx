import { ArrowRight, BrainCircuit, LineChart, SearchCheck } from "lucide-react";
import { useState } from "react";

interface TitleScreenProps {
  onStart: () => void;
  onClose?: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  const [isReviewGuideOpen, setIsReviewGuideOpen] = useState(false);

  return (
    <section className="eq-title-screen" aria-label="Enablement Quest briefing">
      <div className="eq-title-world" aria-hidden="true">
        <span className="eq-title-building is-sales" />
        <span className="eq-title-building is-lab" />
        <span className="eq-title-building is-operations" />
        <span className="eq-title-path is-horizontal" />
        <span className="eq-title-path is-vertical" />
        <span className="eq-title-fountain" />
        <span className="eq-title-avatar" />
      </div>
      <div
        className={`eq-title-card ${isReviewGuideOpen ? "has-review-guide" : ""}`}
      >
        <div className="eq-title-meta">
          <p className="eq-kicker">Enablement Quest</p>
          <p className="eq-byline">Created by Terry Brutus</p>
        </div>
        <h1>The Learning Systems Lab</h1>
        <p className="eq-title-mode">Case 01: The Broken Onboarding Portal</p>
        <p className="eq-title-copy">
          Prove that you can diagnose workplace performance problems, design
          enablement solutions, and connect learning decisions to measurable
          business impact.
        </p>

        <div className="eq-title-grid">
          <article>
            <SearchCheck className="h-5 w-5" />
            <span>Interview the stakeholder and inspect evidence.</span>
          </article>
          <article>
            <BrainCircuit className="h-5 w-5" />
            <span>Diagnose whether this is really a training problem.</span>
          </article>
          <article>
            <LineChart className="h-5 w-5" />
            <span>Choose a solution and connect it to business impact.</span>
          </article>
        </div>

        <section
          className="eq-reviewer-lens"
          aria-label="What recruiters should review"
        >
          <p>Reviewer lens</p>
          <ul>
            <li>Performance consulting: diagnose before designing.</li>
            <li>Sales enablement: connect behavior to pipeline outcomes.</li>
            <li>
              Learning architecture: turn evidence into a practical solution.
            </li>
          </ul>
        </section>

        {isReviewGuideOpen && (
          <div className="eq-review-wrapper">
            <section
              className="eq-creator-statement"
              aria-label="Creator statement"
            >
              <p>Creator statement</p>
              <span>
                I built this as a playable portfolio case study, not a generic
                course demo. The goal is to make my enablement judgment visible:
                gather evidence, diagnose the real problem, choose the right
                intervention, and explain the business impact.
              </span>
            </section>

            <section
              className="eq-review-guide"
              aria-label="How to review this portfolio project"
            >
              <div>
                <p>5-minute review path</p>
                <span>
                  Talk to Maya, inspect the evidence, choose the root cause, and
                  review the earned business-impact canvas.
                </span>
              </div>
              <div>
                <p>What this proves</p>
                <span>
                  Terry diagnoses before designing, connects enablement to
                  behavior, and treats training as one possible solution.
                </span>
              </div>
              <div>
                <p>Sales enablement lens</p>
                <span>
                  Case 02 moves into Sales Strategy Studio to connect discovery
                  behavior, coaching, and pipeline signals.
                </span>
              </div>
              <div>
                <p>Evidence boundary</p>
                <span>
                  Metrics are scenario-based impact targets. The strongest proof
                  is the performance-consulting workflow.
                </span>
              </div>
            </section>
          </div>
        )}

        <div className="eq-title-actions">
          <button
            className="eq-primary-button eq-start-button"
            type="button"
            onClick={onStart}
            data-ocid="title.start_button"
          >
            Start the case
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            className="eq-ghost-button eq-review-guide-button"
            type="button"
            aria-expanded={isReviewGuideOpen}
            onClick={() => setIsReviewGuideOpen((value) => !value)}
            data-ocid="title.review_guide_button"
          >
            {isReviewGuideOpen ? "Hide review guide" : "How to review"}
          </button>
        </div>

        <div className="eq-control-strip">
          <span className="eq-desktop-control">Move: WASD / arrows</span>
          <span className="eq-desktop-control">
            Interact: E / Space / Enter
          </span>
          <span className="eq-desktop-control">Guide: Q</span>
          <span className="eq-desktop-control">Backpack: B</span>
          <span className="eq-mobile-control">Move: joystick</span>
          <span className="eq-mobile-control">Interact: button</span>
        </div>
      </div>
    </section>
  );
}
