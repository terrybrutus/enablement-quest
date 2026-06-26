import { ArrowRight, BrainCircuit, LineChart, SearchCheck } from "lucide-react";

interface TitleScreenProps {
  onStart: () => void;
  onClose?: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
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
      <div className="eq-title-card">
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

        <button
          className="eq-primary-button eq-start-button"
          type="button"
          onClick={onStart}
          data-ocid="title.start_button"
        >
          Start the case
          <ArrowRight className="h-5 w-5" />
        </button>

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
