import type { Game, GameEnergy, VibeTag } from "@/lib/types";
import { games } from "@/data/games";

export interface GameSuggestContext {
  groupSize: number;
  minutesBudget?: number;
  indoorOutdoor?: "indoor" | "outdoor" | "either";
  vibes: VibeTag[];
  energy?: GameEnergy;
}

function fitsGroup(g: Game, size: number): boolean {
  return size >= g.minPlayers && size <= g.maxPlayers;
}

function energyMatch(g: Game, pref?: GameEnergy): number {
  if (!pref) return 0.5;
  if (g.energy === pref) return 1;
  const order: GameEnergy[] = ["low", "medium", "high"];
  const d = Math.abs(order.indexOf(g.energy) - order.indexOf(pref));
  return 1 - d * 0.25;
}

export function suggestGames(ctx: GameSuggestContext, count = 6): Game[] {
  const ranked = games
    .filter((g) => fitsGroup(g, ctx.groupSize))
    .map((g) => {
      let s = 0;
      s += ctx.vibes.some((v) => g.vibeTags.includes(v)) ? 2 : 0.4;
      if (ctx.indoorOutdoor === "indoor" && g.indoor) s += 1.2;
      if (ctx.indoorOutdoor === "outdoor" && g.outdoor) s += 1.2;
      if (ctx.indoorOutdoor === "either") s += 0.8;
      s += energyMatch(g, ctx.energy);
      if (ctx.minutesBudget) {
        const diff = Math.abs(g.minutesNeeded - ctx.minutesBudget / 4);
        s += Math.max(0, 1.2 - diff / 40);
      }
      return { g, s };
    });
  ranked.sort((a, b) => b.s - a.s);
  const pack = ranked.slice(0, count).map((x) => x.g);
  return pack.length ? pack : games.slice(0, count);
}
