import type { UserPreferences } from "@/lib/types";

export function warmOpenLine(name: string): string {
  return `Lovely to see you, ${name} — tell me the mood, the city, and I’ll weave the details.`;
}

export function affirmPlan(city: string, group: number): string {
  return `Here’s a soft-glow plan for ${group} in ${city} — venues lean weather-smart, and the budget stays graceful.`;
}

export function affirmGames(): string {
  return `Curated a playful pack that fits your timebox — easy to explain, big on laughter.`;
}

export function affirmBudget(): string {
  return `I’ve split this so the table feels abundant without tipping the wallet.`;
}

export function mergeVoice(prefs: UserPreferences): string {
  if (prefs.luxuryVsCasual > 0.65) return "We’ll keep the polish high and the fuss low.";
  if (prefs.luxuryVsCasual < 0.4) return "We’ll keep things warm, wallet-kind, and still photo-ready.";
  return "Balanced glam — thoughtful splurges where guests feel it most.";
}
