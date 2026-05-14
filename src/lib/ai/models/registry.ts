export type ModelTier = "cheap" | "balanced" | "premium" | "embed";

export type ModelRegistryEntry = {
  id: string;
  provider: "openrouter";
  contextSize: number;
  costPer1MIn: number;
  costPer1MOut: number;
  json: boolean;
  vision: boolean;
  latencyTier: "fast" | "normal" | "slow";
};

export const MODEL_REGISTRY: ModelRegistryEntry[] = [
  {
    id: "openai/gpt-4o-mini",
    provider: "openrouter",
    contextSize: 128000,
    costPer1MIn: 0.15,
    costPer1MOut: 0.6,
    json: true,
    vision: true,
    latencyTier: "fast",
  },
  {
    id: "anthropic/claude-3-haiku",
    provider: "openrouter",
    contextSize: 200000,
    costPer1MIn: 0.25,
    costPer1MOut: 1.25,
    json: true,
    vision: true,
    latencyTier: "fast",
  },
  {
    id: "google/gemini-2.5-flash-lite-preview-06-17",
    provider: "openrouter",
    contextSize: 1000000,
    costPer1MIn: 0.1,
    costPer1MOut: 0.4,
    json: true,
    vision: true,
    latencyTier: "fast",
  },
  {
    id: "google/gemini-2.5-flash-preview-05-20",
    provider: "openrouter",
    contextSize: 1000000,
    costPer1MIn: 0.15,
    costPer1MOut: 0.6,
    json: true,
    vision: true,
    latencyTier: "normal",
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    provider: "openrouter",
    contextSize: 200000,
    costPer1MIn: 3,
    costPer1MOut: 15,
    json: true,
    vision: true,
    latencyTier: "slow",
  },
  {
    id: "openai/gpt-4.1",
    provider: "openrouter",
    contextSize: 1000000,
    costPer1MIn: 2,
    costPer1MOut: 8,
    json: true,
    vision: true,
    latencyTier: "slow",
  },
];

export function getModelById(id: string): ModelRegistryEntry | undefined {
  return MODEL_REGISTRY.find((m) => m.id === id);
}
