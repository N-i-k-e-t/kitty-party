import { loadMemoryState } from "@/lib/memory";
import { readMediumTermPreferences } from "@/lib/ai/memory/mediumTerm";
import { recallLongTerm } from "@/lib/ai/memory/longTerm";

export type MemoryBriefSnapshot = {
  favoriteVenueIds: string[];
  favoriteThemeIds: string[];
  recurringMembers: { id: string; name: string }[];
  budgetTendency: "value" | "balanced" | "premium";
};

export async function memoryBrief(opts: { limit?: number }): Promise<{
  prose: string;
  snapshot: MemoryBriefSnapshot;
}> {
  const prefs = readMediumTermPreferences();
  const mem = await loadMemoryState();
  const recalled = await recallLongTerm({
    text: `${prefs.city} ${prefs.vibes.join(" ")} kitty gathering`,
    k: opts.limit ?? 5,
  });

  const budgetTendency: MemoryBriefSnapshot["budgetTendency"] =
    prefs.luxuryVsCasual > 0.62 ? "premium" : prefs.luxuryVsCasual < 0.38 ? "value" : "balanced";

  const snapshot: MemoryBriefSnapshot = {
    favoriteVenueIds: mem.savedVenueIds.slice(0, 12),
    favoriteThemeIds: mem.savedThemeIds.slice(0, 12),
    recurringMembers: mem.recurringMembers.map((r) => ({ id: r.id, name: r.name })),
    budgetTendency,
  };

  const recallHint =
    recalled.length > 0
      ? ` Recent signals: ${recalled
          .slice(0, 2)
          .map((e) => e.kind)
          .join(", ")}.`
      : "";

  const prose = `Circle leans ${budgetTendency} in ${prefs.city} with ${prefs.vibes.slice(0, 2).join(" / ")} energy; ${mem.savedVenueIds.length} saved venues and ${mem.recurringMembers.length} recurring friends on file.${recallHint}`;

  return { prose, snapshot };
}
