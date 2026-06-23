import type { WeatherForecast } from "@/lib/types";

export interface WeatherProvider {
  getForecast(city: string, when?: Date): Promise<WeatherForecast>;
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number, index: number): T {
  const idx = (seed + index * 9973) % arr.length;
  return arr[idx];
}

const conditions = [
  "Clear skies",
  "Partly cloudy",
  "Humid haze",
  "Light drizzle",
  "Warm breezes",
  "Pleasantly cool",
] as const;

export class MockWeatherProvider implements WeatherProvider {
  async getForecast(city: string, when = new Date()): Promise<WeatherForecast> {
    const dayKey = when.toISOString().slice(0, 10);
    const seed = hashString(`${city.toLowerCase()}|${dayKey}`);
    const days = ["Today", "Saturday", "Sunday"].map((label, i) => {
      const c = pick([...conditions], seed, i);
      const tempC = 22 + (seed >> (i * 3)) % 12;
      const precipChance = ((seed >> (i + 2)) % 100) / 100;
      return { label, condition: c, tempC, precipChance };
    });
    const weekend = days[1];
    let tip = "Skies look kind for a terrace moment — keep a light wrap handy.";
    if (weekend.condition === "Light drizzle" || weekend.precipChance > 0.45) {
      tip =
        "Light drizzle is leaning toward the weekend — a glass-walled brunch or cozy café would be lovely.";
    } else if (weekend.tempC > 30) {
      tip = "Warmth is building Sunday — mist fans, citrus spritzes, and shade-first venues shine.";
    }
    return { city, days, tip };
  }
}

export class OpenWeatherMapProvider implements WeatherProvider {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl = "https://api.openweathermap.org/data/2.5",
  ) {}

  async getForecast(city: string, when = new Date()): Promise<WeatherForecast> {
    void when;
    const url = `${this.baseUrl}/forecast?q=${encodeURIComponent(city)},IN&appid=${encodeURIComponent(this.apiKey)}&units=metric`;
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 6000);
    const res = await fetch(url, { signal: ctl.signal });
    clearTimeout(t);
    if (!res.ok) throw new Error(`OpenWeatherMap ${res.status}`);
    const data = (await res.json()) as {
      list?: Array<{ dt_txt: string; weather: { description: string }[]; main: { temp: number }; pop?: number }>;
    };
    const list = data.list ?? [];
    const days = list.slice(0, 3).map((row, i) => ({
      label: row.dt_txt?.split(" ")[0] ?? `Day ${i + 1}`,
      condition: row.weather[0]?.description ?? "Varied",
      tempC: Math.round(row.main.temp),
      precipChance: row.pop ?? 0,
    }));
    return {
      city,
      days: days.length
        ? days
        : [
            { label: "Today", condition: "Clear", tempC: 28, precipChance: 0.1 },
            { label: "Sat", condition: "Partly cloudy", tempC: 27, precipChance: 0.2 },
            { label: "Sun", condition: "Mild", tempC: 26, precipChance: 0.15 },
          ],
      tip: "Live forecast from OpenWeatherMap — favor weather-safe picks if drizzle rises.",
    };
  }
}

const mock = new MockWeatherProvider();

export default mock;

export async function getWeatherForRouting(
  city: string,
  opts: { apiKey?: string | null; when?: Date },
): Promise<WeatherForecast> {
  if (opts.apiKey) {
    try {
      return await new OpenWeatherMapProvider(opts.apiKey).getForecast(city, opts.when);
    } catch {
      return mock.getForecast(city, opts.when);
    }
  }
  return mock.getForecast(city, opts.when);
}
