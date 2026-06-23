import type { UserPreferences, Venue, VibeTag, WeatherForecast } from "@/lib/types";
import { haversineKm } from "@/lib/ai/routing/geo";

export type RankerContext = {
  vibes: VibeTag[];
  groupSize: number;
  budget: number;
  indoorOutdoor: UserPreferences["indoorVsOutdoor"];
  userLat?: number;
  userLng?: number;
  weather: WeatherForecast;
  indoorBias: number;
  savedVenueIds: string[];
  recentVenueIds: string[];
};

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

export function featVibeOverlap(v: Venue, vibes: VibeTag[]): number {
  if (!vibes.length) return 0.4;
  const hit = vibes.filter((x) => v.vibeTags.includes(x)).length;
  return clamp01(hit / vibes.length);
}

export function featGroupFit(v: Venue, g: number): number {
  if (!g) return 0.6;
  if (g >= v.minGroup && g <= v.maxGroup) return 1;
  if (g < v.minGroup) return 0.35;
  return 0.45;
}

export function featBudgetFit(v: Venue, budget: number): number {
  if (!budget) return 0.5;
  const [min, max] = v.priceRangeINR;
  if (budget >= max) return 1;
  if (budget < min) return 0.15;
  return clamp01(0.55 + (0.45 * (budget - min)) / Math.max(1, max - min));
}

export function featIndoorOutdoorFit(
  v: Venue,
  pref: UserPreferences["indoorVsOutdoor"],
): number {
  if (!pref || pref === "either") return 0.75;
  if (pref === "indoor") return v.indoor ? 1 : v.weatherSafe ? 0.55 : 0.25;
  return v.outdoor ? 1 : v.indoor ? 0.45 : 0.2;
}

export function featWeatherSafety(v: Venue, weather: WeatherForecast): number {
  const rainy = weather.days.some((d) => d.precipChance > 0.45);
  if (!rainy) return clamp01(0.65 + (v.weatherSafe ? 0.35 : 0));
  return v.weatherSafe ? 1 : v.indoor ? 0.72 : 0.25;
}

export function featDistancePenaltyComplement(
  v: Venue,
  userLat?: number,
  userLng?: number,
): number {
  if (!userLat || !userLng) return 0.55;
  const d = haversineKm({ lat: userLat, lng: userLng }, { lat: v.lat, lng: v.lng });
  const penalty = Math.min(1, d / 40);
  return clamp01(1 - penalty);
}

export function featPopularityPrior(v: Venue): number {
  return clamp01((v.rating / 5) * 0.55 + (v.popularityScore / 100) * 0.45);
}

export function featNoveltyTerm(v: Venue, recentVenueIds: string[]): number {
  if (!recentVenueIds.includes(v.id)) return 1;
  return 0.35;
}

export function featMemoryBias(v: Venue, savedVenueIds: string[]): number {
  return savedVenueIds.includes(v.id) ? 1 : 0.45;
}

export type FeatureVector = {
  vibeOverlap: number;
  groupFit: number;
  budgetFit: number;
  indoorOutdoorFit: number;
  weatherSafety: number;
  distancePenaltyComplement: number;
  popularityPrior: number;
  noveltyTerm: number;
  memoryBias: number;
};

export function extractFeatures(v: Venue, ctx: RankerContext): FeatureVector {
  return {
    vibeOverlap: featVibeOverlap(v, ctx.vibes),
    groupFit: featGroupFit(v, ctx.groupSize),
    budgetFit: featBudgetFit(v, ctx.budget),
    indoorOutdoorFit: featIndoorOutdoorFit(v, ctx.indoorOutdoor),
    weatherSafety: featWeatherSafety(v, ctx.weather),
    distancePenaltyComplement: featDistancePenaltyComplement(v, ctx.userLat, ctx.userLng),
    popularityPrior: featPopularityPrior(v),
    noveltyTerm: featNoveltyTerm(v, ctx.recentVenueIds),
    memoryBias: featMemoryBias(v, ctx.savedVenueIds),
  };
}
