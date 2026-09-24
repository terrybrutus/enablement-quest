import {
  ArrowRight,
  BrainCircuit,
  BriefcaseBusiness,
  LineChart,
  SearchCheck,
  Target,
} from "lucide-react";
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
        <p className="eq-title-mode">Two-case portfolio path</p>
        <p className="eq-title-copy">
          A plain-language RPG case study where you diagnose workplace problems,
          choose enablement fixes, and see the business impact.
        </p>

        <section
          className="eq-title-promise"
          aria-label="What this experience produces"
        >
          <article>
            <p>What you do</p>
            <strong>Investigate two realistic workplace problems.</strong>
            <span>
              Talk to the case owner, review evidence, name the real cause, and
              choose the support that should change the work.
            </span>
          </article>
          <article>
            <p>What you leave with</p>
            <strong>A portfolio-ready proof of judgment.</strong>
            <span>
              The final debrief gives plain-language resume, LinkedIn,
              interview, and portfolio language tied to business impact.
            </span>
          </article>
        </section>

        <section
          className="eq-case-path-preview"
          aria-label="Two-case learning path"
        >
          <article>
            <BriefcaseBusiness className="h-5 w-5" />
            <div>
              <p>Case 01</p>
              <strong>Broken onboarding request</strong>
              <span>
                Decide whether leadership really needs training, or whether the
                evidence points to workflow, access, and manager reinforcement.
              </span>
            </div>
          </article>
          <article>
            <Target className="h-5 w-5" />
            <div>
              <p>Case 02</p>
              <strong>Sales discovery gap</strong>
              <span>
                Apply the same diagnosis loop to demo conversion, manager
                coaching, discovery quality, and pipeline signals.
              </span>
            </div>
          </article>
        </section>

        <section className="eq-plain-start" aria-label="Plain language start">
          <p>Simple path</p>
          <span>
            No gaming knowledge needed. Start with Maya, follow the guide, and
            answer one practical question: is this really a training problem?
          </span>
        </section>

        <div className="eq-mobile-title-start">
          <button
            className="eq-primary-button eq-start-button"
            type="button"
            onClick={onStart}
            data-ocid="title.mobile_start_button"
          >
            Begin Case 01
            <ArrowRight className="h-5 w-5" />
          </button>
          <span>Start now; review the portfolio details after the run.</span>
        </div>

        <section className="eq-finish-line" aria-label="How to finish">
          <div>
            <p>The finish line</p>
            <span>
              You are done when both cases produce plain-language summaries and
              a final reviewer debrief: problem, root cause, solution, and
              measurable impact.
            </span>
          </div>
          <div>
            <p>For non-gamers</p>
            <span>
              Use the Help button if you feel lost. The experience tells you
              exactly what to do next; movement is only how you explore the
              case.
            </span>
          </div>
        </section>

        <section
          className="eq-reviewer-proof-strip"
          aria-label="What reviewers should look for"
        >
          <article>
            <p>Business lens</p>
            <span>
              The player must question a request, inspect evidence, and choose a
              fix tied to measurable outcomes.
            </span>
          </article>
          <article>
            <p>Enablement lens</p>
            <span>
              Case 01 shows performance consulting. Case 02 shows sales
              enablement: behavior, coaching, and pipeline signals.
            </span>
          </article>
          <article>
            <p>Portfolio lens</p>
            <span>
              The finished run produces copyable resume, portfolio, LinkedIn,
              and interview language.
            </span>
          </article>
        </section>

        <div className="eq-title-grid">
          <article>
            <SearchCheck className="h-5 w-5" />
            <span>
              Talk with the case owner and review three evidence items.
            </span>
          </article>
          <article>
            <BrainCircuit className="h-5 w-5" />
            <span>Decide what is actually causing the workplace problem.</span>
          </article>
          <article>
            <LineChart className="h-5 w-5" />
            <span>Choose a fix and review the business-impact summary.</span>
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
                  Learning architecture: evidence becomes a practical fix.
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
                question the training request, inspect evidence, diagnose the
                real problem, choose the right intervention, and explain the
                business impact.
              </span>
            </section>

            <section
              className="eq-review-guide"
              aria-label="How to review this portfolio project"
            >
              <div>
                <p>Portfolio review path</p>
                <span>
                  Complete Case 01 for performance consulting, then Case 02 for
                  sales enablement. The final debrief gives the resume and
                  portfolio language.
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
                <p>Scenario boundary</p>
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
            Begin Case 01
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
            Talk or inspect: E / Space / Enter
          </span>
          <span className="eq-desktop-control">Help: Q</span>
          <span className="eq-desktop-control">Notes: B</span>
          <span className="eq-mobile-control">Move: joystick</span>
          <span className="eq-mobile-control">Talk or inspect: button</span>
        </div>
      </div>
    </section>
  );
}
