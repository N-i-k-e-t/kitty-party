import { getSeasonalContext, getUpcomingFestivals } from "@/lib/context/seasonal";
import { getDayPart } from "@/lib/context/time";
import type { Festival, UserPreferences, WeatherForecast } from "@/lib/types";
import { getWeatherForRouting } from "@/lib/ai/routing/weatherProvider";
import { resolveCityCoords } from "@/lib/ai/routing/geo";

async function fetchInternalWeather(city: string, lat?: number, lng?: number): Promise<WeatherForecast | null> {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams({ city });
  if (typeof lat === "number" && typeof lng === "number") {
    params.set("lat", String(lat));
    params.set("lng", String(lng));
  }
  try {
    const res = await fetch(`/api/weather?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as WeatherForecast;
  } catch {
    return null;
  }
}

export type HyperlocalContext = {
  season: string;
  festivals: Festival[];
  weather: WeatherForecast;
  timeOfDay: ReturnType<typeof getDayPart>;
  groupSizeHint: number;
  indoorBias: number;
  traffic: "light" | "moderate" | "heavy";
};

export async function buildHyperlocalContext(input: {
  city: string;
  lat?: number;
  lng?: number;
  when?: Date;
  groupSize?: number;
  indoorVsOutdoor?: UserPreferences["indoorVsOutdoor"];
  openWeatherMapApiKey?: string | null;
}): Promise<HyperlocalContext> {
  const when = input.when ?? new Date();
  const seasonal = getSeasonalContext(when);
  const festivals = getUpcomingFestivals(when, 4);
  const live = await fetchInternalWeather(input.city, input.lat, input.lng);
  const weather =
    live ??
    (await getWeatherForRouting(input.city, {
      apiKey: input.openWeatherMapApiKey,
      when,
    }));
  const rainy = weather.days.some((d) => d.precipChance > 0.45);
  let indoorBias = 0.5;
  if (input.indoorVsOutdoor === "indoor") indoorBias = 0.85;
  if (input.indoorVsOutdoor === "outdoor") indoorBias = 0.25;
  if (rainy) indoorBias = Math.min(0.95, indoorBias + 0.25);

  const coords = resolveCityCoords(input.city);
  void coords;
  const traffic: HyperlocalContext["traffic"] =
    getDayPart(when) === "evening" ? "heavy" : getDayPart(when) === "afternoon" ? "moderate" : "light";

  return {
    season: seasonal.season,
    festivals,
    weather,
    timeOfDay: getDayPart(when),
    groupSizeHint: input.groupSize ?? 10,
    indoorBias,
    traffic,
  };
}
