import type { GatheringIdea, SavedPlan, Theme } from "@/lib/types";
import { themes } from "@/data/themes";
import { venues } from "@/data/venues";

export interface MemoryTimelineEntry {
  id: string;
  monthKey: string;
  monthLabel: string;
  planId: string;
  title: string;
  city: string;
  coverImage: string;
  themeName: string;
  attendeeLabels: string[];
  caption: string;
  at: number;
}

function themeById(id?: string): Theme | undefined {
  return themes.find((t) => t.id === id);
}

function venueCover(plan: SavedPlan): string {
  const firstVenueId = plan.workspace.venueIds[0];
  const v = venues.find((x) => x.id === firstVenueId);
  return v?.image ?? themeById(plan.workspace.themeId)?.heroImage ?? themes[0].heroImage;
}

/** Builds a chronological timeline from saved plans and optional onboarding ideas. */
export function buildMemoryTimeline(
  plans: SavedPlan[],
  ideas: GatheringIdea[],
): MemoryTimelineEntry[] {
  const fromPlans: MemoryTimelineEntry[] = [...plans]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((p) => {
      const th = themeById(p.workspace.themeId);
      const d = new Date(p.updatedAt);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = d.toLocaleString("en-IN", { month: "long", year: "numeric" });
      return {
        id: `plan:${p.id}`,
        monthKey,
        monthLabel,
        planId: p.id,
        title: p.title,
        city: p.city,
        coverImage: venueCover(p),
        themeName: th?.name ?? p.title,
        attendeeLabels: [],
        caption: th?.dressCode ? `${th.name} · ${th.dressCode}` : `${p.city} gathering`,
        at: p.updatedAt,
      };
    });

  const ideaEntries: MemoryTimelineEntry[] = ideas.map((idea) => {
    const d = new Date();
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const monthLabel = d.toLocaleString("en-IN", { month: "long", year: "numeric" });
    const th = themeById(idea.themeId);
    return {
      id: `idea:${idea.id}`,
      monthKey,
      monthLabel,
      planId: "",
      title: idea.title,
      city: "",
      coverImage: idea.heroImage,
      themeName: th?.name ?? idea.title,
      attendeeLabels: [],
      caption: idea.subtitle,
      at: d.getTime(),
    };
  });

  return [...fromPlans, ...ideaEntries].sort((a, b) => b.at - a.at);
}

export function groupTimelineByMonth(entries: MemoryTimelineEntry[]): Map<string, MemoryTimelineEntry[]> {
  const m = new Map<string, MemoryTimelineEntry[]>();
  for (const e of entries) {
    const list = m.get(e.monthLabel) ?? [];
    list.push(e);
    m.set(e.monthLabel, list);
  }
  return m;
}
