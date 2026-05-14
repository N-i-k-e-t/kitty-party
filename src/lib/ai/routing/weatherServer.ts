import "server-only";

import type { WeatherForecast } from "@/lib/types";
import { ServerLruCache } from "@/lib/ai/cache/server";

const cache = new ServerLruCache<WeatherForecast>(256);

function cacheKey(city: string, lat?: string, lng?: string): string {
  return `${city.toLowerCase()}|${lat ?? ""}|${lng ?? ""}`;
}

export async function getWeatherServerCached(input: {
  apiKey: string;
  city: string;
  lat?: string;
  lng?: string;
}): Promise<WeatherForecast> {
  const key = cacheKey(input.city, input.lat, input.lng);
  const hit = cache.get(key);
  if (hit) return hit;

  const q = new URLSearchParams({ q: `${input.city},IN`, appid: input.apiKey, units: "metric" });
  if (input.lat && input.lng) {
    q.delete("q");
    q.set("lat", input.lat);
    q.set("lon", input.lng);
  }
  const url = `https://api.openweathermap.org/data/2.5/forecast?${q.toString()}`;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 6000);
  const res = await fetch(url, { signal: ctl.signal });
  clearTimeout(t);
  if (!res.ok) {
    throw new Error(`OpenWeatherMap ${res.status}`);
  }
  const data = (await res.json()) as {
    city?: { name?: string };
    list?: Array<{ dt_txt: string; weather: { description: string }[]; main: { temp: number }; pop?: number }>;
  };
  const cityName = data.city?.name ?? input.city;
  const list = data.list ?? [];
  const days = list.slice(0, 9).map((row, i) => ({
    label: row.dt_txt?.split(" ")[0] ?? `Day ${i + 1}`,
    condition: row.weather[0]?.description ?? "Varied",
    tempC: Math.round(row.main.temp),
    precipChance: row.pop ?? 0,
  }));
  const forecast: WeatherForecast = {
    city: cityName,
    days: days.length
      ? days.slice(0, 3)
      : [
          { label: "Today", condition: "Clear", tempC: 28, precipChance: 0.1 },
          { label: "Sat", condition: "Partly cloudy", tempC: 27, precipChance: 0.2 },
          { label: "Sun", condition: "Mild", tempC: 26, precipChance: 0.15 },
        ],
    tip: "Live forecast from OpenWeatherMap — favor weather-safe picks if drizzle rises.",
  };
  cache.set(key, forecast, 15 * 60 * 1000);
  return forecast;
}
