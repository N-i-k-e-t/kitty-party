import type { ChatRequest, ChatResponse } from "@/lib/ai/types";
import type { PlanResponse } from "@/lib/types";
import type { PlannerContext } from "@/lib/ai/planner";
import { heuristicAdapter } from "@/lib/ai/adapters/heuristic";
import type { Adapter } from "@/lib/ai/adapters/types";
import type { ResolvedAiConfig } from "@/lib/ai/types";

export function createExternalAdapter(config: ResolvedAiConfig): Adapter {
  const base = (config.openAiBaseUrl ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const key = config.openAiApiKey ?? "";

  return {
    name: "external",

    async chat(req: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
      if (!key) throw new Error("OPENAI_API_KEY missing");
      const res = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: req.messages,
          temperature: req.temperature ?? 0.5,
        }),
        signal,
      });
      if (!res.ok) throw new Error(`External chat ${res.status}`);
      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = data.choices?.[0]?.message?.content ?? "";
      return { text, adapter: "external" };
    },

    async embed(texts: string[], signal?: AbortSignal): Promise<number[][]> {
      if (!key) throw new Error("OPENAI_API_KEY missing");
      const res = await fetch(`${base}/embeddings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ model: "text-embedding-3-small", input: texts }),
        signal,
      });
      if (!res.ok) throw new Error(`External embed ${res.status}`);
      const data = (await res.json()) as { data?: Array<{ embedding: number[] }> };
      const rows = data.data ?? [];
      return rows.map((r) => r.embedding);
    },

    async plan(prompt: string, ctx: PlannerContext, signal?: AbortSignal): Promise<PlanResponse> {
      return heuristicAdapter.plan(prompt, ctx, signal);
    },
  };
}
