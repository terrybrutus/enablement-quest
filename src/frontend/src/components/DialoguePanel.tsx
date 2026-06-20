import { ArrowRight, User } from "lucide-react";

interface DialoguePanelProps {
  npc: { name: string; color: string };
  line: string;
  lineIndex: number;
  totalLines: number;
  onAdvance: () => void;
}

export function DialoguePanel({
  npc,
  line,
  lineIndex,
  totalLines,
  onAdvance,
}: DialoguePanelProps) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 flex items-end justify-center pb-6 px-4"
      onClick={onAdvance}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAdvance();
        }
      }}
      data-ocid="dialogue.panel"
    >
      <div className="w-full max-w-2xl bg-card/95 border border-border/60 rounded-xl p-5 shadow-elevated backdrop-blur-sm animate-fade-in">
        <div className="flex items-start gap-4">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: `${npc.color}20`,
              border: `2px solid ${npc.color}`,
            }}
          >
            <User className="w-5 h-5" style={{ color: npc.color }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-foreground">
                {npc.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {lineIndex + 1} / {totalLines}
              </span>
            </div>

            <p className="text-sm text-foreground/90 leading-relaxed">{line}</p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Press{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">
                  E
                </kbd>{" "}
                or click to continue
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdvance();
                }}
                data-ocid="dialogue.next_button"
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-smooth"
              >
                Next
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: totalLines }).map((_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static visual dots
              key={`dot-${i}`}
              className={`w-1.5 h-1.5 rounded-full transition-smooth ${
                i <= lineIndex ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
