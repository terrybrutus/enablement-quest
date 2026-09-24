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
          <p className="eq-byline">A workplace diagnosis simulation</p>
        </div>
        <h1>The Learning Systems Lab</h1>
        <p className="eq-title-mode">Sales enablement case quest</p>
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
            <strong>Investigate one realistic revenue problem.</strong>
            <span>
              Talk to stakeholders, review evidence, name the real cause, and
              choose the support that should change sales behavior.
            </span>
          </article>
          <article>
            <p>What you leave with</p>
            <strong>A repeatable consulting habit.</strong>
            <span>
              The final debrief helps learners explain the problem, evidence,
              cause, recommendation, and measurable impact.
            </span>
          </article>
        </section>

        <section
          className="eq-case-path-preview"
          aria-label="Two-case learning path"
        >
          <article>
            <Target className="h-5 w-5" />
            <div>
              <p>Main case</p>
              <strong>The vanishing win rate</strong>
              <span>
                Diagnose why Atlas Pro deals reach proposal but close below
                target. The answer depends on evidence, not assumptions.
              </span>
            </div>
          </article>
          <article>
            <BriefcaseBusiness className="h-5 w-5" />
            <div>
              <p>Practice loop</p>
              <strong>Investigate, diagnose, design, measure</strong>
              <span>
                Separate product knowledge, discovery skill, coaching, process,
                and measurement before recommending a fix.
              </span>
            </div>
          </article>
        </section>

        <section className="eq-plain-start" aria-label="Plain language start">
          <p>Simple path</p>
          <span>
            No gaming knowledge needed. Start in the lab, talk with Leo, follow
            the evidence, and answer one practical question: is this really a
            training problem?
          </span>
        </section>

        <div className="eq-mobile-title-start">
          <button
            className="eq-primary-button eq-start-button"
            type="button"
            onClick={onStart}
            data-ocid="title.mobile_start_button"
          >
            Begin the Case
            <ArrowRight className="h-5 w-5" />
          </button>
          <span>Start now; use the debrief after the run.</span>
        </div>

        <section className="eq-finish-line" aria-label="How to finish">
          <div>
            <p>The finish line</p>
            <span>
              You are done when the case produces a plain-language summary and a
              final debrief: problem, root cause, solution, and measurable
              impact.
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
              The case shows sales enablement judgment: behavior, coaching,
              process, evidence, and pipeline signals.
            </span>
          </article>
          <article>
            <p>Learning lens</p>
            <span>
              The finished run gives learners a practical way to explain their
              recommendation in plain language.
            </span>
          </article>
        </section>

        <div className="eq-title-grid">
          <article>
            <SearchCheck className="h-5 w-5" />
            <span>Talk with the case owner and review the evidence trail.</span>
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
              aria-label="What facilitators should review"
            >
              <p>Facilitator lens</p>
              <ul>
                <li>Performance consulting: diagnose before designing.</li>
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
              aria-label="Learning purpose"
            >
              <p>Learning purpose</p>
              <span>
                This playable case study helps learners slow down before
                building training. The goal is to question the request, inspect
                evidence, diagnose the real problem, choose the right support,
                and explain the business impact.
              </span>
            </section>

            <section
              className="eq-review-guide"
              aria-label="How to use this learning experience"
            >
              <div>
                <p>Facilitation path</p>
                <span>
                  Complete the Atlas Pro case. The final debrief gives team
                  discussion prompts and plain-language takeaways.
                </span>
              </div>
              <div>
                <p>What learners practice</p>
                <span>
                  Learners practice solving performance problems instead of
                  automatically building training.
                </span>
              </div>
              <div>
                <p>Sales enablement lens</p>
                <span>
                  The case connects discovery behavior, coaching, CRM notes, and
                  pipeline signals.
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
            Begin the Case
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            className="eq-ghost-button eq-review-guide-button"
            type="button"
            aria-expanded={isReviewGuideOpen}
            onClick={() => setIsReviewGuideOpen((value) => !value)}
            data-ocid="title.review_guide_button"
          >
            {isReviewGuideOpen ? "Hide facilitator guide" : "Facilitator guide"}
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
