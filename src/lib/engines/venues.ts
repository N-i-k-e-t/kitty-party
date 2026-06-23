import type { UserPreferences, Venue, VibeTag } from "@/lib/types";
import { venues } from "@/data/venues";
import { getMockWeather } from "@/lib/context/weather";

export interface VenueQuery {
  city?: string;
  vibes?: VibeTag[];
  groupSize?: number;
  budget?: number;
  indoorOutdoor?: UserPreferences["indoorVsOutdoor"];
  userLat?: number;
  userLng?: number;
  needWeatherSafe?: boolean;
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function budgetFit(v: Venue, budget?: number): number {
  if (!budget) return 0.5;
  const [min, max] = v.priceRangeINR;
  if (budget >= max) return 1;
  if (budget < min) return 0.15;
  return 0.55 + (0.45 * (budget - min)) / Math.max(1, max - min);
}

function groupFit(v: Venue, g?: number): number {
  if (!g) return 0.6;
  if (g >= v.minGroup && g <= v.maxGroup) return 1;
  if (g < v.minGroup) return 0.35;
  return 0.45;
}

function vibeOverlap(v: Venue, vibes?: VibeTag[]): number {
  if (!vibes?.length) return 0.4;
  const hit = vibes.filter((x) => v.vibeTags.includes(x)).length;
  return hit / vibes.length;
}

function ioFit(v: Venue, pref?: UserPreferences["indoorVsOutdoor"]): number {
  if (!pref || pref === "either") return 0.75;
  if (pref === "indoor") return v.indoor ? 1 : v.weatherSafe ? 0.55 : 0.25;
  return v.outdoor ? 1 : v.indoor ? 0.45 : 0.2;
}

/** Wider candidate pool for the two-stage ranker and orchestrator retrieve step. */
export function venueCandidatesFor(query: VenueQuery, limit = 24): Venue[] {
  return recommendVenues(query, limit);
}

export function recommendVenues(query: VenueQuery, limit = 12): Venue[] {
  const city = query.city;
  const weather = city ? getMockWeather(city) : null;
  const rainy = weather?.days.some((d) => d.precipChance > 0.45) ?? false;
  const scored = venues
    .filter((v) => (city ? v.city === city : true))
    .map((v) => {
      let score = 0;
      score += vibeOverlap(v, query.vibes) * 4;
      score += budgetFit(v, query.budget) * 3;
      score += groupFit(v, query.groupSize) * 3;
      score += ioFit(v, query.indoorOutdoor) * 2;
      score += (v.rating / 5) * 1.2;
      score += (v.popularityScore / 100) * 1.4;
      if (query.needWeatherSafe || rainy) {
        score += v.weatherSafe ? 1.2 : -0.6;
        if (rainy && !v.indoor) score -= 0.8;
      }
      if (query.userLat && query.userLng) {
        const d = haversineKm({ lat: query.userLat, lng: query.userLng }, v);
        score -= Math.min(2.5, d / 25);
      }
      return { v, score };
    });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.v);
}

export function estimateDistanceKm(
  user: { lat?: number; lng?: number } | undefined,
  v: Venue,
): number | null {
  if (!user?.lat || !user?.lng) return null;
  return Math.round(haversineKm({ lat: user.lat, lng: user.lng }, v) * 10) / 10;
}
