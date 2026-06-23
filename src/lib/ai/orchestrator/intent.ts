import { parsePlannerPrompt } from "@/lib/ai/nlu";

export type OrchestratorIntentKind =
  | "plan"
  | "venue"
  | "budget"
  | "theme"
  | "games"
  | "invitation"
  | "general";

export type OrchestratorIntent = {
  kind: OrchestratorIntentKind;
  confidence: number;
  entities: ReturnType<typeof parsePlannerPrompt>["entities"];
};

export function classifyIntent(prompt: string): OrchestratorIntent {
  const { intent, entities } = parsePlannerPrompt(prompt);
  let confidence = 0.72;
  const lower = prompt.toLowerCase();
  if (lower.split(/\s+/).length < 4) confidence = 0.55;
  if (entities.city && entities.groupSize) confidence = Math.min(0.95, confidence + 0.08);
  return { kind: intent, confidence, entities };
}
