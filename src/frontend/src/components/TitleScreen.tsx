import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface TitleScreenProps {
  onStart: () => void;
}

export function TitleScreen({ onStart }: TitleScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div
        className={`text-center max-w-lg px-6 transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 shadow-glow">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>

        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3 text-glow">
          Enablement Quest
        </h1>
        <p className="text-lg text-muted-foreground mb-2">
          The Learning Systems Lab
        </p>
        <p className="text-sm text-muted-foreground/70 mb-8 max-w-sm mx-auto">
          Explore a modern organization, solve workplace enablement challenges,
          and collect learning artifacts.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onStart}
            data-ocid="title.start_button"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-smooth shadow-glow animate-pulse-glow"
          >
            Start Journey
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-muted-foreground/60">
          <div className="flex flex-col items-center gap-1">
            <kbd className="px-2 py-1 rounded bg-card border border-border font-mono text-[10px]">
              WASD
            </kbd>
            <span>Move</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <kbd className="px-2 py-1 rounded bg-card border border-border font-mono text-[10px]">
              E
            </kbd>
            <span>Interact</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <kbd className="px-2 py-1 rounded bg-card border border-border font-mono text-[10px]">
              Q / I
            </kbd>
            <span>Panels</span>
          </div>
        </div>
      </div>
    </div>
  );
}
