import type { Template } from "@/lib/ai/prompts/meta";

export type SummarizePlanSlots = { bullets: string };

export const summarizePlanTemplate: Template<SummarizePlanSlots> = {
  id: "summarizePlan",
  version: 1,
  description: "Short shareable summary.",
  system: "Produce 2 sentences maximum, warm and specific.",
  user: (s) => `Plan bullets:\n${s.bullets}\nSummarize for a WhatsApp status line.`,
};
