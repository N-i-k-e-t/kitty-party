import { festivals } from "@/data/festivals";
import type { SeasonalContext } from "@/lib/types";
import { uPhoto, unsplash } from "@/data/unsplash";

function month(d: Date): number {
  return d.getMonth() + 1;
}

export function getSeasonalContext(date = new Date()): SeasonalContext {
  const m = month(date);
  if (m >= 6 && m <= 9) {
    return {
      season: "monsoon",
      headline: "Monsoon Garden Soirée",
      subcopy: "Misty windows, warm chai, and candlelit corners — perfect for an intimate indoor glow.",
      heroImage: uPhoto(unsplash.monsoonWindow),
      accent: "monsoon",
    };
  }
  if (m === 10 || m === 11) {
    return {
      season: "festive",
      headline: "Diwali Glow Gatherings",
      subcopy: "Gold accents, mithai flights, and soft sparkle — your circle deserves a luminous night in.",
      heroImage: uPhoto(unsplash.diwaliLights),
      accent: "diwali",
    };
  }
  if (m === 3) {
    return {
      season: "holi",
      headline: "Holi Pastel Brunch",
      subcopy: "Florals first, color play optional — a sunlit tablescape with thandai and laughter.",
      heroImage: uPhoto(unsplash.holiPastel),
      accent: "holi",
    };
  }
  if (m >= 11 || m <= 2) {
    return {
      season: "winter",
      headline: "Winter Cozy Circles",
      subcopy: "Cashmere tones, cocoa bars, and slow conversations by warm light.",
      heroImage: uPhoto(unsplash.teaParty),
      accent: "winter",
    };
  }
  return {
    season: "summer",
    headline: "Tropical Sundowner",
    subcopy: "Citrus spritzes, linen co-ords, and a golden-hour terrace mood.",
    heroImage: uPhoto(unsplash.resortPool),
    accent: "summer",
  };
}

export function getUpcomingFestivals(date = new Date(), limit = 3): typeof festivals {
  const m = month(date);
  const scored = festivals.map((f) => {
    let delta = f.month - m;
    if (delta < 0) delta += 12;
    return { f, delta };
  });
  scored.sort((a, b) => a.delta - b.delta);
  return scored.slice(0, limit).map((s) => s.f);
}
