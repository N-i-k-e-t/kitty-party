import { WARM_SYSTEM_PREFIX, type Template } from "@/lib/ai/prompts/meta";

function withWarm(system: string): string {
  return `${WARM_SYSTEM_PREFIX}\n\n${system}`;
}

import { plannerTemplate } from "@/lib/ai/prompts/planner";
import { rewriteWarmTemplate } from "@/lib/ai/prompts/rewriteWarm";
import { summarizePlanTemplate } from "@/lib/ai/prompts/summarizePlan";
import { themeStoryTemplate } from "@/lib/ai/prompts/themeStory";
import { venueBlurbTemplate } from "@/lib/ai/prompts/venueBlurb";
import { inviteCopyTemplate } from "@/lib/ai/prompts/inviteCopy";

export { WARM_SYSTEM_PREFIX };

export const templates = {
  planner: { ...plannerTemplate, system: withWarm(plannerTemplate.system) },
  rewriteWarm: { ...rewriteWarmTemplate, system: withWarm(rewriteWarmTemplate.system) },
  summarizePlan: { ...summarizePlanTemplate, system: withWarm(summarizePlanTemplate.system) },
  themeStory: { ...themeStoryTemplate, system: withWarm(themeStoryTemplate.system) },
  venueBlurb: { ...venueBlurbTemplate, system: withWarm(venueBlurbTemplate.system) },
  inviteCopy: { ...inviteCopyTemplate, system: withWarm(inviteCopyTemplate.system) },
} as const;

export type TemplateId = keyof typeof templates;

export function renderTemplate<S>(id: TemplateId, slots: S): { system: string; user: string } {
  const t = templates[id] as Template<S>;
  return { system: t.system, user: t.user(slots) };
}
