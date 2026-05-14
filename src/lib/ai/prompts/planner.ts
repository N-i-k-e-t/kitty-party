import type { Template } from "@/lib/ai/prompts/meta";

export type PlannerSlots = {
  city: string;
  groupSize: number;
  intent: string;
  memoryBrief: string;
  hyperlocalSummary: string;
  venueShortlist: string;
};

export const plannerTemplate: Template<PlannerSlots> = {
  id: "planner",
  version: 1,
  description: "Full plan composition — system framing plus user slot pack for narrative.",
  system:
    "Compose one short opening paragraph (max 120 words) for a kitty-party planner UI. Do not list JSON or markdown. Honor slots faithfully.",
  user: (s) =>
    `City: ${s.city}. Group size: ${s.groupSize}. Intent: ${s.intent}.\nMemory brief: ${s.memoryBrief}\nHyperlocal: ${s.hyperlocalSummary}\nVenue shortlist: ${s.venueShortlist}\nWrite the paragraph only.`,
};
