import { Gem, MapPin, ScrollText } from "lucide-react";

interface HudProps {
  zoneName: string;
}

export function Hud({ zoneName }: HudProps) {
  return (
    <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card/80 border border-border/50 backdrop-blur-sm">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {zoneName}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card/80 border border-border/50 backdrop-blur-sm">
            <ScrollText className="w-3.5 h-3.5 text-muted-foreground" />
            <kbd className="text-[10px] font-mono text-muted-foreground">Q</kbd>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              Quests
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card/80 border border-border/50 backdrop-blur-sm">
            <Gem className="w-3.5 h-3.5 text-muted-foreground" />
            <kbd className="text-[10px] font-mono text-muted-foreground">I</kbd>
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              Artifacts
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
