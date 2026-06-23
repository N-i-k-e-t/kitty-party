import type { Template } from "@/lib/ai/prompts/meta";

export type ThemeStorySlots = { themeName: string; city: string };

export const themeStoryTemplate: Template<ThemeStorySlots> = {
  id: "themeStory",
  version: 1,
  description: "Theme-flavored intro sentence.",
  system: "One sentence only; sensory, inviting.",
  user: (s) => `Theme: ${s.themeName}. City: ${s.city}.`,
};
