import type { ChatRequest, ChatResponse } from "@/lib/ai/types";
import type { PlanResponse } from "@/lib/types";
import type { PlannerContext } from "@/lib/ai/planner";
import { heuristicAdapter } from "@/lib/ai/adapters/heuristic";
import type { Adapter } from "@/lib/ai/adapters/types";
import type { UserPreferences } from "@/lib/types";
import { parseSseChunk } from "@/lib/ai/streaming/sse";

async function postJson<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${path} ${res.status}: ${t.slice(0, 200)}`);
  }
  return (await res.json()) as T;
}

export function createOpenrouterBrowserAdapter(getPrefs: () => UserPreferences): Adapter {
  return {
    name: "openrouter",

    async chat(req: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
      const tier = getPrefs().ai?.modelTier ?? "balanced";
      if (req.onToken) {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: req.messages,
            stream: true,
            modelTier: tier,
            temperature: req.temperature,
            max_tokens: req.max_tokens,
            response_format: req.response_format,
            model: req.model,
          }),
          signal,
        });
        if (!res.ok || !res.body) {
          throw new Error(`openrouter chat ${res.status}`);
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let carry = "";
        let buf = "";
        let usage: ChatResponse["usage"];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = dec.decode(value, { stream: true });
          const parsed = parseSseChunk(carry, chunk);
          carry = parsed.buffer;
          for (const ev of parsed.events) {
            if (ev.event !== "ai") continue;
            try {
              const obj = JSON.parse(ev.data) as Record<string, unknown>;
              if (obj.type === "token" && typeof obj.text === "string") {
                buf += obj.text;
                req.onToken?.(obj.text);
              }
              if (obj.type === "done") {
                const u = obj.usage as ChatResponse["usage"] | undefined;
                usage = u;
              }
              if (obj.type === "error") {
                throw new Error(String(obj.message ?? "stream_error"));
              }
            } catch {
              /* ignore partial */
            }
          }
        }
        return { text: buf.trim(), adapter: "openrouter", usage };
      }

      const data = await postJson<{ text: string; adapter?: string; usage?: ChatResponse["usage"] }>(
        "/api/ai/chat",
        {
          messages: req.messages,
          stream: false,
          modelTier: tier,
          temperature: req.temperature,
          max_tokens: req.max_tokens,
          response_format: req.response_format,
          model: req.model,
        },
        signal,
      );
      return { text: data.text ?? "", adapter: "openrouter", usage: data.usage };
    },

    async embed(texts: string[], signal?: AbortSignal): Promise<number[][]> {
      const data = await postJson<{ vectors: number[][] }>(
        "/api/ai/embed",
        { texts },
        signal,
      );
      return data.vectors;
    },

    async plan(prompt: string, ctx: PlannerContext, signal?: AbortSignal): Promise<PlanResponse> {
      return heuristicAdapter.plan(prompt, ctx, signal);
    },
  };
}
