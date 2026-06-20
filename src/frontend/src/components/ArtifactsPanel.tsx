import type { Artifact } from "@/game/types";
import { BookOpen, Gem, X } from "lucide-react";
import { useState } from "react";

interface ArtifactsPanelProps {
  artifacts: Artifact[];
  onClose: () => void;
}

export function ArtifactsPanel({ artifacts, onClose }: ArtifactsPanelProps) {
  const [selectedId, setSelectedId] = useState<number | null>(
    artifacts.length > 0 ? Number(artifacts[0].id) : null,
  );

  const selected = artifacts.find((a) => Number(a.id) === selectedId);

  return (
    <div className="absolute top-14 right-4 z-30 w-80 max-h-[70vh] overflow-auto animate-slide-in-right">
      <div className="bg-card/95 border border-border/60 rounded-xl shadow-elevated backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Gem className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Artifacts</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-ocid="artifacts.close_button"
            className="p-1 rounded-md hover:bg-muted transition-smooth"
            aria-label="Close artifacts panel"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4">
          {artifacts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No artifacts yet. Complete quests to earn artifacts.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                {artifacts.map((artifact) => (
                  <button
                    type="button"
                    key={Number(artifact.id)}
                    onClick={() => setSelectedId(Number(artifact.id))}
                    data-ocid={`artifacts.item.${Number(artifact.id)}`}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-smooth ${
                      selectedId === Number(artifact.id)
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Gem className="w-3.5 h-3.5 text-primary" />
                      <span className="font-medium text-foreground">
                        {artifact.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {selected && (
                <div className="mt-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {selected.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selected.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-2">
                    Earned:{" "}
                    {new Date(Number(selected.earnedAt)).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
