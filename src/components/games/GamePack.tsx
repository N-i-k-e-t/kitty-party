import type { Game } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export function GamePack({ games }: { games: Game[] }) {
  return (
    <div className="space-y-2">
      {games.map((g) => (
        <div key={g.id} className="rounded-xl bg-white/65 p-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink">{g.name}</p>
            <Badge>{g.energy}</Badge>
            <Badge>{g.minutesNeeded} min</Badge>
          </div>
          <p className="mt-1 text-[11px] text-ink-muted">{g.howToPlay}</p>
        </div>
      ))}
    </div>
  );
}
