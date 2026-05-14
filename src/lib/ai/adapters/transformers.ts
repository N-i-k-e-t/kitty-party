import type { Adapter } from "@/lib/ai/adapters/types";
import type { ChatRequest, ChatResponse } from "@/lib/ai/types";
import type { PlanResponse } from "@/lib/types";
import type { PlannerContext } from "@/lib/ai/planner";
import { heuristicAdapter } from "@/lib/ai/adapters/heuristic";
import type { ResolvedAiConfig } from "@/lib/ai/types";

export async function runTransformersEmbed(texts: string[]): Promise<number[][] | null> {
  if (typeof window === "undefined") return null;
  try {
    const { pipeline, env } = await import("@xenova/transformers");
    if (env && typeof env === "object") {
      Object.assign(env, { allowLocalModels: true });
    }
    const extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    const out: number[][] = [];
    for (const text of texts) {
      const tensor = await extractor(text, { pooling: "mean", normalize: true });
      const raw = tensor as { data?: Float32Array };
      if (!raw.data) return null;
      out.push(Array.from(raw.data));
    }
    return out;
  } catch {
    return null;
  }
}

export function createTransformersAdapter(): Adapter {
  return {
    name: "transformers",

    async chat(req: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
      return heuristicAdapter.chat(req, signal);
    },

    async embed(texts: string[], signal?: AbortSignal): Promise<number[][]> {
      void signal;
      const batch = await runTransformersEmbed(texts);
      if (!batch) throw new Error("Transformers embed unavailable");
      return batch;
    },

    async plan(prompt: string, ctx: PlannerContext, signal?: AbortSignal): Promise<PlanResponse> {
      return heuristicAdapter.plan(prompt, ctx, signal);
    },
  };
}

export function createTransformersAdapterWithConfig(_config: ResolvedAiConfig): Adapter {
  void _config;
  return createTransformersAdapter();
}
