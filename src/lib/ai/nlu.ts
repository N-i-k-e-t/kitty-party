import type { PlannerEntities, PlannerIntent, VibeTag } from "@/lib/types";

const vibeKeywords: Record<string, VibeTag> = {
  cozy: "cozy",
  glam: "glam",
  glamorous: "glam",
  traditional: "traditional",
  playful: "playful",
  boho: "boho",
  bohemian: "boho",
  luxe: "luxe",
  luxury: "luxe",
  lux: "luxe",
};

const cities = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Bangalore",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
] as const;

function extractCity(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const c of cities) {
    if (lower.includes(c.toLowerCase())) {
      return c === "Bangalore" ? "Bengaluru" : c;
    }
  }
  return undefined;
}

function extractBudget(text: string): number | undefined {
  const m = text.match(/(?:under|below|upto|up to|max|budget)\s*(?:of\s*)?(?:₹|rs\.?|inr)?\s*([\d,]+)/i);
  if (m) return Number(m[1].replace(/,/g, ""));
  const m2 = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/i);
  if (m2) return Number(m2[1].replace(/,/g, ""));
  return undefined;
}

function extractGroup(text: string): number | undefined {
  const m = text.match(/(\d+)\s*(?:women|ladies|guests|people|members|girls)/i);
  if (m) return Number(m[1]);
  const m2 = text.match(/for\s*(\d+)/i);
  if (m2) return Number(m2[1]);
  return undefined;
}

function extractVibes(text: string): VibeTag[] {
  const lower = text.toLowerCase();
  const found = new Set<VibeTag>();
  for (const [word, vibe] of Object.entries(vibeKeywords)) {
    if (lower.includes(word)) found.add(vibe);
  }
  return [...found];
}

function extractIndoorOutdoor(text: string): PlannerEntities["indoorOutdoor"] {
  const lower = text.toLowerCase();
  if (lower.includes("indoor")) return "indoor";
  if (lower.includes("outdoor") || lower.includes("rooftop") || lower.includes("terrace"))
    return "outdoor";
  if (lower.includes("monsoon") || lower.includes("rain")) return "indoor";
  return undefined;
}

export function detectIntent(prompt: string): PlannerIntent {
  const p = prompt.toLowerCase();
  if (p.includes("invite") || p.includes("whatsapp") || p.includes("rsvp")) return "invitation";
  if (p.includes("game") || p.includes("tambola") || p.includes("activities")) return "games";
  if (p.includes("budget") || p.includes("split") || p.includes("per head")) return "budget";
  if (p.includes("venue") || p.includes("café") || p.includes("cafe") || p.includes("place"))
    return "venue";
  if (p.includes("theme") || p.includes("decor")) return "theme";
  if (
    p.includes("plan") ||
    p.includes("kitty") ||
    p.includes("party") ||
    p.includes("gathering")
  )
    return "plan";
  return "general";
}

export function extractEntities(prompt: string): PlannerEntities {
  return {
    groupSize: extractGroup(prompt),
    budget: extractBudget(prompt),
    city: extractCity(prompt),
    vibes: extractVibes(prompt),
    indoorOutdoor: extractIndoorOutdoor(prompt),
    keywords: prompt
      .toLowerCase()
      .split(/[^a-z0-9]+/g)
      .filter((w) => w.length > 3)
      .slice(0, 24),
  };
}

export function parsePlannerPrompt(prompt: string): {
  intent: PlannerIntent;
  entities: PlannerEntities;
} {
  return { intent: detectIntent(prompt), entities: extractEntities(prompt) };
}
