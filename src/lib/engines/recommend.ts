import type { GatheringIdea, UserPreferences, VibeTag } from "@/lib/types";
import { themes } from "@/data/themes";
import { createId } from "@/lib/id";
import { uPhoto, unsplash } from "@/data/unsplash";

function pickVibes(p: UserPreferences): VibeTag[] {
  if (p.vibes.length) return p.vibes;
  return ["cozy", "glam"];
}

export function suggestGatheringIdeas(p: UserPreferences): GatheringIdea[] {
  const vibes = pickVibes(p);
  const primaryVibe = vibes[0] ?? "cozy";
  const t1 = themes.find((t) => t.vibeTags.includes(primaryVibe)) ?? themes[0];
  const t2 = themes.find((t) => t.id !== t1.id && t.vibeTags.some((v) => vibes.includes(v))) ?? themes[1];
  const t3 =
    themes.find((t) => t.id !== t1.id && t.id !== t2.id) ?? themes[2];

  const budgetMid = Math.round((p.budgetMin + p.budgetMax) / 2);

  return [
    {
      id: createId("idea"),
      title: `${t1.name} in ${p.city}`,
      subtitle: `For ${p.groupSize} guests · ${vibes.slice(0, 2).join(" · ")}`,
      themeId: t1.id,
      heroImage: t1.heroImage,
      estimatedBudgetINR: Math.min(p.budgetMax, Math.max(p.budgetMin, Math.round(budgetMid * 0.95))),
      vibeTags: t1.vibeTags.filter((v) => vibes.includes(v)).length
        ? t1.vibeTags.filter((v) => vibes.includes(v))
        : t1.vibeTags.slice(0, 2),
      promptSeed: `Plan a ${t1.name.toLowerCase()} for ${p.groupSize} women in ${p.city} under ${p.budgetMax}`,
    },
    {
      id: createId("idea"),
      title: `${t2.name} afternoon`,
      subtitle: `Soft glam · ${p.city} · indoor-friendly`,
      themeId: t2.id,
      heroImage: t2.heroImage,
      estimatedBudgetINR: Math.min(p.budgetMax, Math.round(budgetMid * 1.05)),
      vibeTags: t2.vibeTags.slice(0, 2),
      promptSeed: `Suggest ${t2.name.toLowerCase()} ideas for ${p.groupSize} guests in ${p.city} with ${vibes.join(", ")} vibe`,
    },
    {
      id: createId("idea"),
      title: "Sunset terrace circle",
      subtitle: "Champagne accents · playlist-ready",
      themeId: t3.id,
      heroImage: uPhoto(unsplash.rooftopGolden),
      estimatedBudgetINR: Math.min(p.budgetMax, Math.round(budgetMid * 1.1)),
      vibeTags: ["glam", "playful"],
      promptSeed: `Plan a glam rooftop kitty for ${p.groupSize} women in ${p.city} under ${p.budgetMax}`,
    },
  ];
}
