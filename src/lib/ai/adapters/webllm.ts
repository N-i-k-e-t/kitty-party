import type { Adapter } from "@/lib/ai/adapters/types";
import { UnsupportedError } from "@/lib/ai/adapters/types";
import type { ChatRequest, ChatResponse } from "@/lib/ai/types";
import type { PlanResponse } from "@/lib/types";
import type { PlannerContext } from "@/lib/ai/planner";
import { heuristicAdapter } from "@/lib/ai/adapters/heuristic";
import { embedHash } from "@/lib/ai/embedHash";
import type { ResolvedAiConfig } from "@/lib/ai/types";

export function createWebllmAdapter(config: ResolvedAiConfig): Adapter {
  let engine: import("@mlc-ai/web-llm").MLCEngineInterface | null = null;

  async function ensureEngine(signal?: AbortSignal): Promise<import("@mlc-ai/web-llm").MLCEngineInterface> {
    if (typeof window === "undefined") throw new UnsupportedError("WebLLM requires a browser");
    const nav = navigator as Navigator & { gpu?: unknown };
    if (typeof navigator !== "undefined" && !nav.gpu) {
      throw new UnsupportedError("WebGPU is not available for WebLLM");
    }
    if (engine) return engine;
    try {
      const webllm = await import("@mlc-ai/web-llm");
      const { CreateMLCEngine } = webllm;
      engine = await CreateMLCEngine(config.webllmModelId, {
        initProgressCallback: () => {},
      });
      void signal;
      return engine;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new UnsupportedError(`WebLLM failed to load: ${msg}`);
    }
  }

  return {
    name: "webllm",

    async chat(req: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
      const eng = await ensureEngine(signal);
      const completion = await eng.chat.completions.create({
        messages: req.messages.map((m) => ({ role: m.role, content: m.content })),
        temperature: req.temperature ?? 0.6,
        stream: false,
      });
      const choice = completion.choices[0];
      const text = choice?.message?.content ?? "";
      return { text, adapter: "webllm" };
    },

    async embed(texts: string[], signal?: AbortSignal): Promise<number[][]> {
      void signal;
      return texts.map((t) => embedHash(t, 64));
    },

    async plan(prompt: string, ctx: PlannerContext, signal?: AbortSignal): Promise<PlanResponse> {
      return heuristicAdapter.plan(prompt, ctx, signal);
    },
  };
}
