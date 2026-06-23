import type { Theme, UserPreferences, VibeTag } from "@/lib/types";
import { themes } from "@/data/themes";
import { getSeasonalContext } from "@/lib/context/seasonal";

export interface ThemeSuggestContext {
  vibes: VibeTag[];
  indoorOutdoor: UserPreferences["indoorVsOutdoor"];
  seasonAccent?: string;
}

function scoreTheme(t: Theme, ctx: ThemeSuggestContext): number {
  let s = 0;
  for (const v of ctx.vibes) {
    if (t.vibeTags.includes(v)) s += 3;
  }
  if (ctx.indoorOutdoor === "indoor" && t.indoorPreferred) s += 2;
  if (ctx.indoorOutdoor === "outdoor" && t.outdoorPreferred) s += 2;
  if (ctx.seasonAccent === "monsoon" && t.id === "monsoon-garden") s += 4;
  if (ctx.seasonAccent === "diwali" && t.id === "diwali-glow") s += 4;
  if (ctx.seasonAccent === "holi" && t.id === "holi-pastel") s += 4;
  return s;
}

export function suggestThemes(ctx: ThemeSuggestContext): Theme[] {
  const seasonal = getSeasonalContext();
  const withSeason = { ...ctx, seasonAccent: seasonal.accent };
  const ranked = [...themes].sort(
    (a, b) => scoreTheme(b, withSeason) - scoreTheme(a, withSeason),
  );
  return ranked.slice(0, 3);
}
