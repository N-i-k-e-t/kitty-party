import type {
  PlanResponse,
  PlanRichCard,
  PlannerIntent,
  UserPreferences,
  VibeTag,
} from "@/lib/types";
import { parsePlannerPrompt } from "@/lib/ai/nlu";
import { affirmBudget, affirmGames, affirmPlan, mergeVoice } from "@/lib/ai/prompts";
import { suggestThemes } from "@/lib/engines/themes";
import { recommendVenues } from "@/lib/engines/venues";
import { generateBudget } from "@/lib/engines/budget";
import { suggestGames } from "@/lib/engines/games";
import { generateInvitationBundle } from "@/lib/engines/invitation";
import { themes } from "@/data/themes";
import { createId } from "@/lib/id";
import { getMockWeather } from "@/lib/context/weather";
import { getSeasonalContext } from "@/lib/context/seasonal";

export interface PlannerContext {
  preferences: UserPreferences;
  memorySavedVenueIds?: string[];
  memorySavedThemeIds?: string[];
}

function uniqVibes(a: VibeTag[], b: VibeTag[]): VibeTag[] {
  return [...new Set([...a, ...b])];
}

function pickThemeForMonsoon(vibes: VibeTag[]) {
  const t = themes.find((x) => x.id === "monsoon-garden") ?? suggestThemes({ vibes, indoorOutdoor: "indoor" })[0];
  return t;
}

function buildTimeline(themeName: string, city: string): string[] {
  return [
    `11:00 — Doors open, chai and polaroid corner in ${city}`,
    `11:30 — Welcome circle & light introductions`,
    `12:15 — ${themeName} tablescape reveal + first course`,
    `13:30 — Games block (two rounds, easy wins)`,
    `15:00 — Dessert, gratitude toast, parting favors`,
  ];
}

function card(id: string, partial: Omit<PlanRichCard, "id">): PlanRichCard {
  return { id, ...partial };
}

export function plan(prompt: string, ctx: PlannerContext): PlanResponse {
  const { intent, entities } = parsePlannerPrompt(prompt);
  const p = ctx.preferences;
  const city = entities.city ?? p.city;
  const groupSize = entities.groupSize ?? p.groupSize;
  const budget =
    entities.budget ?? Math.round((p.budgetMin + p.budgetMax) / 2);
  const vibes = uniqVibes(entities.vibes, p.vibes);
  const indoorOutdoor = entities.indoorOutdoor ?? p.indoorVsOutdoor;
  const weather = getMockWeather(city);
  const seasonal = getSeasonalContext();

  const lower = prompt.toLowerCase();
  const monsoonKitty = lower.includes("monsoon") && lower.includes("kitty");

  const themePrimary = monsoonKitty
    ? pickThemeForMonsoon(vibes)
    : suggestThemes({ vibes, indoorOutdoor: indoorOutdoor })[0];

  const venueQuery = {
    city,
    vibes,
    groupSize,
    budget,
    indoorOutdoor,
    userLat: p.lat,
    userLng: p.lng,
    needWeatherSafe: weather.days.some((d) => d.precipChance > 0.45) || monsoonKitty,
  };

  let topVenues = recommendVenues(venueQuery, 8).slice(0, 3);
  if (monsoonKitty) {
    const indoorFirst = recommendVenues({ ...venueQuery, indoorOutdoor: "indoor" }, 12).filter(
      (v) => v.indoor,
    );
    topVenues = indoorFirst.slice(0, 3);
  }
  if (ctx.memorySavedVenueIds?.length) {
    const boosted = [...topVenues].sort((a, b) => {
      const ba = ctx.memorySavedVenueIds?.includes(a.id) ? 1 : 0;
      const bb = ctx.memorySavedVenueIds?.includes(b.id) ? 1 : 0;
      return bb - ba;
    });
    topVenues = boosted.slice(0, 3);
  }

  const budgetResult = generateBudget(budget, groupSize, vibes, { mode: "balanced" });
  const games = suggestGames(
    {
      groupSize,
      minutesBudget: intent === "games" ? 120 : 150,
      indoorOutdoor,
      vibes,
      energy: lower.includes("glam") ? "high" : "medium",
    },
    6,
  );

  const invitation = generateInvitationBundle({
    hostName: p.name,
    city,
    dateLabel: "Next Sunday, 11 am onwards",
    theme: themePrimary,
    groupSize,
  });

  const timeline = buildTimeline(themePrimary.name, city);

  const cards: PlanRichCard[] = [];

  const shouldTheme =
    intent === "plan" || intent === "theme" || intent === "general" || intent === "venue";
  const shouldVenues =
    intent === "plan" ||
    intent === "venue" ||
    intent === "general" ||
    intent === "budget";
  const shouldBudget =
    intent === "plan" || intent === "budget" || intent === "general" || intent === "venue";
  const shouldGames =
    intent === "plan" || intent === "games" || intent === "general" || intent === "venue";
  const shouldInvite =
    intent === "plan" || intent === "invitation" || intent === "general" || intent === "theme";

  if (shouldTheme) {
    cards.push(
      card(createId("card"), {
        type: "theme",
        title: "Theme direction",
        payload: { theme: themePrimary },
      }),
    );
  }
  if (shouldVenues) {
    cards.push(
      card(createId("card"), {
        type: "venues",
        title: "Venues that fit your circle",
        payload: { venues: topVenues },
      }),
    );
  }
  if (shouldBudget) {
    cards.push(
      card(createId("card"), {
        type: "budget",
        title: "Budget breakdown",
        payload: { budget: budgetResult },
      }),
    );
  }
  if (shouldGames) {
    cards.push(
      card(createId("card"), {
        type: "games",
        title: "Game pack",
        payload: { games },
      }),
    );
  }
  if (shouldInvite) {
    cards.push(
      card(createId("card"), {
        type: "invitation",
        title: "Invitation preview",
        payload: { invitation },
      }),
    );
  }
  if (intent === "plan" || intent === "general") {
    cards.push(
      card(createId("card"), {
        type: "timeline",
        title: "Gentle timeline",
        payload: { timeline },
      }),
    );
  }

  let message = "";
  if (intent === "games") {
    message = `${affirmGames()} ${mergeVoice(p)}`;
  } else if (intent === "budget") {
    message = `${affirmBudget()} ${mergeVoice(p)}`;
  } else {
    message = `${affirmPlan(city, groupSize)} ${seasonal.headline} energy is in the air — ${weather.tip}`;
  }

  if (intent === "invitation") {
    message = `Here’s invitation language you can send as-is or personalize — ${mergeVoice(p)}`;
  }

  return { message, cards: dedupeCards(cards) };
}

function dedupeCards(cards: PlanRichCard[]): PlanRichCard[] {
  const seen = new Set<PlanRichCard["type"]>();
  const out: PlanRichCard[] = [];
  for (const c of cards) {
    if (seen.has(c.type)) continue;
    seen.add(c.type);
    out.push(c);
  }
  return out;
}

export function planForIntent(intent: PlannerIntent, prompt: string, ctx: PlannerContext): PlanResponse {
  return plan(prompt, ctx);
}
