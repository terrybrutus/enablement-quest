import type { Quest, Waypoint } from "@/game/types";
import { CheckCircle2, Circle, MapPin, ScrollText, X } from "lucide-react";

interface QuestLogProps {
  quests: Quest[];
  waypoints: Waypoint[];
  onClose: () => void;
}

export function QuestLog({ quests, waypoints, onClose }: QuestLogProps) {
  return (
    <div className="absolute top-14 left-4 z-30 w-80 max-h-[70vh] overflow-auto animate-slide-in-left">
      <div className="bg-card/95 border border-border/60 rounded-xl shadow-elevated backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Quest Log</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-ocid="quest.close_button"
            className="p-1 rounded-md hover:bg-muted transition-smooth"
            aria-label="Close quest log"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {quests.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No quests yet. Talk to NPCs to find quests.
            </div>
          ) : (
            quests.map((quest) => {
              const questWaypoints = waypoints.filter((w) =>
                quest.requiredWaypoints.includes(w.id),
              );
              const observedCount = questWaypoints.filter(
                (w) => w.observed,
              ).length;
              const totalCount = questWaypoints.length;

              return (
                <div
                  key={quest.id}
                  className={`p-3 rounded-lg border ${
                    quest.status === "completed"
                      ? "bg-success/10 border-success/30"
                      : quest.status === "inProgress"
                        ? "bg-primary/5 border-primary/20"
                        : "bg-muted/30 border-border/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {quest.status === "completed" ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {quest.title}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                    {quest.description}
                  </p>

                  {quest.status !== "notStarted" && totalCount > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-foreground font-medium">
                          {observedCount} / {totalCount}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{
                            width: `${totalCount > 0 ? (observedCount / totalCount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <div className="space-y-1 mt-2">
                        {questWaypoints.map((wp) => (
                          <div
                            key={wp.id}
                            className="flex items-center gap-1.5 text-xs"
                          >
                            <MapPin
                              className={`w-3 h-3 ${wp.observed ? "text-success" : "text-muted-foreground"}`}
                            />
                            <span
                              className={
                                wp.observed
                                  ? "text-success line-through"
                                  : "text-muted-foreground"
                              }
                            >
                              {wp.waypointLabel}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {quest.status === "completed" && (
                    <div className="mt-2 text-xs text-success font-medium">
                      Quest completed!
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
