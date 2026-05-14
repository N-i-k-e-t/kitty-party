import { venueCandidatesFor, type VenueQuery } from "@/lib/engines/venues";
import { suggestThemes } from "@/lib/engines/themes";
import { suggestGames } from "@/lib/engines/games";
import type { UserPreferences, Venue, VibeTag } from "@/lib/types";
import { buildHyperlocalContext } from "@/lib/ai/routing/hyperlocal";
import { memoryBrief } from "@/lib/ai/memory/summarize";
import { shortTermRecentVenueIds } from "@/lib/ai/memory/shortTerm";
import type { RankerContext } from "@/lib/ai/ranker/features";
import type { ResolvedAiConfig } from "@/lib/ai/types";
import type { OrchestratorIntent } from "@/lib/ai/orchestrator/intent";

function uniqVibes(a: VibeTag[], b: VibeTag[]): VibeTag[] {
  return [...new Set([...a, ...b])];
}

export type RetrievePack = {
  venueQuery: VenueQuery;
  candidates: Venue[];
  hyperlocal: Awaited<ReturnType<typeof buildHyperlocalContext>>;
  memoryProse: string;
  themesSample: ReturnType<typeof suggestThemes>;
  gamesSeed: ReturnType<typeof suggestGames>;
  rankerContext: RankerContext;
};

export async function retrieveContext(input: {
  prompt: string;
  prefs: UserPreferences;
  intent: OrchestratorIntent;
  plannerCtxMemoryVenues: string[];
  plannerCtxMemoryThemes: string[];
  config: ResolvedAiConfig;
}): Promise<RetrievePack> {
  const { entities } = input.intent;
  const p = input.prefs;
  const city = entities.city ?? p.city;
  const groupSize = entities.groupSize ?? p.groupSize;
  const budget = entities.budget ?? Math.round((p.budgetMin + p.budgetMax) / 2);
  const vibes = uniqVibes(entities.vibes, p.vibes);
  const indoorOutdoor = entities.indoorOutdoor ?? p.indoorVsOutdoor;
  const lower = input.prompt.toLowerCase();
  const monsoonKitty = lower.includes("monsoon") && lower.includes("kitty");

  const hyperlocal = await buildHyperlocalContext({
    city,
    lat: p.lat,
    lng: p.lng,
    groupSize,
    indoorVsOutdoor: indoorOutdoor,
    openWeatherMapApiKey: input.config.openWeatherMapApiKey ?? undefined,
  });

  const needWeatherSafe =
    hyperlocal.weather.days.some((d) => d.precipChance > 0.45) || monsoonKitty;

  const venueQuery: VenueQuery = {
    city,
    vibes,
    groupSize,
    budget,
    indoorOutdoor: monsoonKitty ? "indoor" : indoorOutdoor,
    userLat: p.lat,
    userLng: p.lng,
    needWeatherSafe,
  };

  let candidates = venueCandidatesFor(venueQuery, 28);
  if (monsoonKitty) {
    candidates = venueCandidatesFor({ ...venueQuery, indoorOutdoor: "indoor" }, 32).filter((v) => v.indoor);
  }

  const { prose } = await memoryBrief({ limit: 6 });
  const themesSample = suggestThemes({ vibes, indoorOutdoor: indoorOutdoor ?? "either" });
  const gamesSeed = suggestGames(
    {
      groupSize,
      minutesBudget: 150,
      indoorOutdoor,
      vibes,
      energy: lower.includes("glam") ? "high" : "medium",
    },
    6,
  );

  const rankerContext: RankerContext = {
    vibes,
    groupSize,
    budget,
    indoorOutdoor,
    userLat: p.lat,
    userLng: p.lng,
    weather: hyperlocal.weather,
    indoorBias: hyperlocal.indoorBias,
    savedVenueIds: input.plannerCtxMemoryVenues,
    recentVenueIds: shortTermRecentVenueIds(),
  };

  void input.plannerCtxMemoryThemes;

  return {
    venueQuery,
    candidates,
    hyperlocal,
    memoryProse: prose,
    themesSample,
    gamesSeed,
    rankerContext,
  };
}
