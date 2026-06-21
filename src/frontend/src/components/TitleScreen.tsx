import { ArrowRight, BrainCircuit, LineChart, SearchCheck } from "lucide-react";

interface TitleScreenProps {
  onStart: () => void;
  onClose?: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <section className="eq-title-screen" aria-label="Enablement Quest briefing">
      <div className="eq-title-card">
        <p className="eq-kicker">Enablement Quest</p>
        <h1>The Learning Systems Lab</h1>
        <p className="eq-byline">Created by Terry Brutus</p>
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
          <span>Move: WASD / arrows</span>
          <span>Interact: E / Space / Enter</span>
          <span>Guide: Q</span>
          <span>Backpack: B</span>
        </div>
      </div>
    </section>
  );
}
