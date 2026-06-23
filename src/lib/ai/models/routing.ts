import type { OrchestratorIntentKind } from "@/lib/ai/orchestrator/intent";
import type { ModelTier } from "@/lib/ai/models/registry";
import type { AiModelTier } from "@/lib/ai/types";
import { getModelById } from "@/lib/ai/models/registry";

export type SelectModelInput = {
  intent: OrchestratorIntentKind;
  lengthHint?: number;
  userTier: AiModelTier;
  structured?: boolean;
  deepPlan?: boolean;
};

export type SelectedModel = {
  id: string;
  tier: ModelTier;
  supportsJson: boolean;
  contextSize: number;
  fallbackId: string;
  maxTokens: number;
};

const CHEAP_PRIMARY = "openai/gpt-4o-mini";
const CHEAP_FALLBACK = "anthropic/claude-3-haiku";
const BALANCED_PRIMARY = "google/gemini-2.5-flash-preview-05-20";
const BALANCED_FALLBACK = "openai/gpt-4o-mini";
const PREMIUM_PRIMARY = "anthropic/claude-3.5-sonnet";
const PREMIUM_FALLBACK = "openai/gpt-4.1";

export function selectModel(input: SelectModelInput): SelectedModel {
  const wantsPremium = input.userTier === "premium" || input.deepPlan === true;
  const wantsCheap = input.userTier === "cheap" && !wantsPremium;

  let id = BALANCED_PRIMARY;
  let fallbackId = BALANCED_FALLBACK;
  let tier: ModelTier = "balanced";
  let maxTokens = 900;

  if (wantsPremium) {
    id = PREMIUM_PRIMARY;
    fallbackId = PREMIUM_FALLBACK;
    tier = "premium";
    maxTokens = 1200;
  } else if (wantsCheap || input.intent === "general") {
    id = CHEAP_PRIMARY;
    fallbackId = CHEAP_FALLBACK;
    tier = "cheap";
    maxTokens = 512;
  }

  if (input.intent === "plan" && !wantsCheap) {
    id = BALANCED_PRIMARY;
    fallbackId = BALANCED_FALLBACK;
    tier = "balanced";
    maxTokens = 1100;
  }

  if (typeof input.lengthHint === "number" && input.lengthHint > 2000 && wantsPremium) {
    maxTokens = 1600;
  }

  const meta = getModelById(id);
  return {
    id,
    tier,
    supportsJson: Boolean(meta?.json ?? true),
    contextSize: meta?.contextSize ?? 128000,
    fallbackId,
    maxTokens: input.structured ? Math.min(maxTokens, 1400) : maxTokens,
  };
}
