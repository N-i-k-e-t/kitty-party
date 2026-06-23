import type { Adapter } from "@/lib/ai/adapters/types";
import type { ChatRequest, ChatResponse } from "@/lib/ai/types";
import type { PlanResponse } from "@/lib/types";
import type { PlannerContext } from "@/lib/ai/planner";
import { heuristicAdapter } from "@/lib/ai/adapters/heuristic";
import type { ResolvedAiConfig } from "@/lib/ai/types";

export function createOllamaAdapter(config: ResolvedAiConfig): Adapter {
  const base = config.ollamaBaseUrl.replace(/\/$/, "");
  return {
    name: "ollama",

    async chat(req: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
      const res = await fetch(`${base}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.ollamaModel,
          messages: req.messages,
          stream: false,
          options: { temperature: req.temperature ?? 0.6 },
        }),
        signal,
      });
      if (!res.ok) throw new Error(`Ollama chat ${res.status}`);
      const data = (await res.json()) as { message?: { content?: string } };
      const text = data.message?.content ?? "";
      return { text, adapter: "ollama" };
    },

    async embed(texts: string[], signal?: AbortSignal): Promise<number[][]> {
      const out: number[][] = [];
      for (const prompt of texts) {
        const res = await fetch(`${base}/api/embeddings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: config.ollamaModel, prompt }),
          signal,
        });
        if (!res.ok) throw new Error(`Ollama embed ${res.status}`);
        const data = (await res.json()) as { embedding?: number[] };
        if (!data.embedding?.length) throw new Error("Ollama embed empty");
        out.push(data.embedding);
      }
      return out;
    },

    async plan(prompt: string, ctx: PlannerContext, signal?: AbortSignal): Promise<PlanResponse> {
      void signal;
      return heuristicAdapter.plan(prompt, ctx);
    },
  };
}
