import type { Template } from "@/lib/ai/prompts/meta";

export type RewriteWarmSlots = { text: string };

export const rewriteWarmTemplate: Template<RewriteWarmSlots> = {
  id: "rewriteWarm",
  version: 1,
  description: "Tone-only polish for assistant copy.",
  system: "Rewrite the user text to sound like a gracious friend; keep facts; do not add new venues or numbers.",
  user: (s) => `Text:\n${s.text}\nReturn only the rewritten paragraph.`,
};
