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

export interface WeatherProvider {
  getMockWeather(city: string, date?: Date): import("@/lib/types").WeatherForecast;
}

export const weatherProvider: WeatherProvider = {
  getMockWeather(city: string, date = new Date()) {
    const dayKey = date.toISOString().slice(0, 10);
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
  },
};

export function getMockWeather(city: string, date?: Date) {
  return weatherProvider.getMockWeather(city, date);
}
