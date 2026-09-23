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
        <p className="eq-title-mode">
          Guided Case: The Broken Onboarding Request
        </p>
        <p className="eq-title-copy">
          A leader asks for more training. In this short workplace case, you
          decide whether training is actually the fix.
        </p>

        <section className="eq-plain-start" aria-label="Plain language start">
          <p>No gaming knowledge needed.</p>
          <span>
            Talk with Maya, review three clues, choose the real problem, then
            pick the solution that improves the business result.
          </span>
        </section>

        <p className="eq-title-copy eq-title-copy-secondary">
          This is a playable case study about judgment: diagnose before you
          design.
        </p>

        <div className="eq-title-grid">
          <article>
            <SearchCheck className="h-5 w-5" />
            <span>Talk with the case owner and read three evidence cards.</span>
          </article>
          <article>
            <BrainCircuit className="h-5 w-5" />
            <span>Decide what is actually causing the workplace problem.</span>
          </article>
          <article>
            <LineChart className="h-5 w-5" />
            <span>
              Choose a solution and review the business-impact summary.
            </span>
          </article>
        </div>

        {isReviewGuideOpen && (
          <div className="eq-review-wrapper">
            <section
              className="eq-reviewer-lens"
              aria-label="What recruiters should review"
            >
              <p>Reviewer lens</p>
              <ul>
                <li>
                  Performance consulting: Terry diagnoses before designing.
                </li>
                <li>
                  Learning architecture: evidence becomes a practical solution.
                </li>
                <li>
                  Business impact: every decision points to a measurable result.
                </li>
              </ul>
            </section>

            <section
              className="eq-creator-statement"
              aria-label="Creator statement"
            >
              <p>Creator statement</p>
              <span>
                I built this as a playable portfolio case study, not a generic
                course demo. The goal is to make my enablement judgment visible:
                question the training request, gather evidence, diagnose the
                real problem, choose the right intervention, and explain the
                business impact.
              </span>
            </section>

            <section
              className="eq-review-guide"
              aria-label="How to review this portfolio project"
            >
              <div>
                <p>5-minute review path</p>
                <span>
                  Talk with Maya, inspect three evidence cards, choose the root
                  cause, choose the intervention, and review the business-impact
                  summary.
                </span>
              </div>
              <div>
                <p>What this proves</p>
                <span>
                  Terry solves performance problems instead of automatically
                  building training. The experience shows judgment, not just
                  course production.
                </span>
              </div>
              <div>
                <p>Sales enablement lens</p>
                <span>
                  After the first case, Case 02 moves into Sales Strategy Studio
                  to connect discovery behavior, coaching, and pipeline signals.
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
            Start guided case
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
          <span className="eq-desktop-control">Case File: B</span>
          <span className="eq-mobile-control">Move: joystick</span>
          <span className="eq-mobile-control">Interact: button</span>
        </div>
      </div>
    </section>
  );
}
