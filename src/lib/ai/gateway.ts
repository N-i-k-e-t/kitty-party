import type {
  AdapterName,
  Capabilities,
  ChatRequest,
  ChatResponse,
  PlanOptions,
  ServerCapabilities,
} from "@/lib/ai/types";
import type { PlanResponse } from "@/lib/types";
import type { PlannerContext } from "@/lib/ai/planner";
import type { UserPreferences } from "@/lib/types";
import { resolveAiConfig } from "@/lib/ai/config";
import { detectCapabilitiesCached, invalidateCapabilitiesCache } from "@/lib/ai/capabilities";
import { heuristicAdapter } from "@/lib/ai/adapters/heuristic";
import { createOllamaAdapter } from "@/lib/ai/adapters/ollama";
import { createWebllmAdapter } from "@/lib/ai/adapters/webllm";
import { createExternalAdapter } from "@/lib/ai/adapters/external";
import { createOpenrouterBrowserAdapter } from "@/lib/ai/adapters/openrouter";
import { runTransformersEmbed } from "@/lib/ai/adapters/transformers";
import { embedHash } from "@/lib/ai/embedHash";
import { cosine } from "@/lib/ai/ranker/rerank";
import { runOrchestratorPlan } from "@/lib/ai/orchestrator";
import { logAiEvent } from "@/lib/ai/telemetry/events";
import { cacheGet, cacheSet } from "@/lib/ai/cache/persistent";
import { LruCache } from "@/lib/ai/cache/lru";
import { usePreferencesStore } from "@/store/preferences";

function stableKey(parts: unknown[]): string {
  const s = JSON.stringify(parts);
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h).toString(36);
}

async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

async function fetchServerCaps(): Promise<ServerCapabilities | undefined> {
  if (typeof window === "undefined") return undefined;
  try {
    const res = await fetch("/api/ai/capabilities", { cache: "no-store" });
    if (!res.ok) return undefined;
    return (await res.json()) as ServerCapabilities;
  } catch {
    return undefined;
  }
}

export class AIGateway {
  private lastChatAdapter: AdapterName = "heuristic";
  private readonly capMemo = new LruCache<string, Capabilities>(4);

  constructor(private readonly getPrefs: () => UserPreferences) {}

  getLastChatAdapter(): AdapterName {
    return this.lastChatAdapter;
  }

  async detectCapabilities(force = false): Promise<Capabilities> {
    const prefs = this.getPrefs();
    const k = stableKey([prefs.ai ?? {}, force ? "f" : "n"]);
    if (!force) {
      const hit = this.capMemo.get(k);
      if (hit) return hit;
    }
    if (force) invalidateCapabilitiesCache();
    const c = await detectCapabilitiesCached(prefs, force);
    const server = await fetchServerCaps();
    const merged: Capabilities = { ...c, server };
    this.capMemo.set(k, merged);
    return merged;
  }

  async chat(req: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
    const cfg = resolveAiConfig(this.getPrefs());
    const caps = await this.detectCapabilities();
    const useStream = Boolean(req.onToken);
    if (!useStream) {
      const cacheId = stableKey(["chat", req.messages, cfg.ollamaModel, cfg.webllmModelId]);
      const cached = await cacheGet<ChatResponse>(cacheId);
      if (cached) {
        logAiEvent("embed_lookup", "chat_cache_hit");
        this.lastChatAdapter = cached.adapter;
        return cached;
      }
    }

    const openrouter = createOpenrouterBrowserAdapter(this.getPrefs);
    const chain: Array<{ name: AdapterName; run: (sig?: AbortSignal) => Promise<ChatResponse> }> = [];

    if (caps.server?.openRouterConfigured) {
      chain.push({ name: "openrouter", run: (sig) => openrouter.chat(req, sig) });
    }
    if (cfg.user.useOllama && caps.ollama.reachable) {
      const oa = createOllamaAdapter(cfg);
      chain.push({ name: "ollama", run: (sig) => oa.chat(req, sig) });
    }
    if (cfg.user.useWebLLM && caps.webllmAvailable) {
      const wa = createWebllmAdapter(cfg);
      chain.push({ name: "webllm", run: (sig) => wa.chat(req, sig) });
    }
    if (cfg.user.useExternal && caps.externalAllowed) {
      const ea = createExternalAdapter(cfg);
      chain.push({ name: "external", run: (sig) => ea.chat(req, sig) });
    }
    chain.push({ name: "heuristic", run: (sig) => heuristicAdapter.chat(req, sig) });

    let lastErr: unknown;
    for (const step of chain) {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), cfg.chatTimeoutMs);
        try {
          const t0 = Date.now();
          const merged = this.mergeSignals(signal, ctl.signal);
          const res = await step.run(merged ?? undefined);
          clearTimeout(timer);
          this.lastChatAdapter = res.adapter ?? step.name;
          logAiEvent("latency", `chat:${step.name}`, { ms: Date.now() - t0 });
          if (!useStream) {
            const cacheId = stableKey(["chat", req.messages, cfg.ollamaModel, cfg.webllmModelId]);
            await cacheSet(cacheId, res, 10 * 60 * 1000);
          }
          return res;
        } catch (e) {
          lastErr = e;
          clearTimeout(timer);
          const backoff = attempt === 0 ? 200 : 600;
          if (attempt === 0) await sleep(backoff);
        }
      }
      logAiEvent("adapter_fallback", `chat:${step.name}`);
    }
    logAiEvent("error_soft", "chat_exhausted", { msg: String(lastErr) });
    const fallback = await heuristicAdapter.chat(req, signal);
    this.lastChatAdapter = "heuristic";
    if (!useStream) {
      const cacheId = stableKey(["chat", req.messages, cfg.ollamaModel, cfg.webllmModelId]);
      await cacheSet(cacheId, fallback, 10 * 60 * 1000);
    }
    return fallback;
  }

  private mergeSignals(a?: AbortSignal, b?: AbortSignal): AbortSignal | undefined {
    if (a && b) {
      try {
        const anyFn = (
          AbortSignal as unknown as { any?: (signals: AbortSignal[]) => AbortSignal }
        ).any;
        if (typeof anyFn === "function") return anyFn([a, b]);
      } catch {
        /* ignore */
      }
    }
    return b ?? a;
  }

  async embed(texts: string[], signal?: AbortSignal): Promise<number[][]> {
    const cfg = resolveAiConfig(this.getPrefs());
    const caps = await this.detectCapabilities();
    const cacheId = stableKey(["embed", texts, cfg.user.useTransformers, cfg.ollamaBaseUrl]);
    const cached = await cacheGet<number[][]>(cacheId);
    if (cached && cached.length === texts.length) return cached;

    if (caps.server?.openRouterConfigured) {
      try {
        const or = createOpenrouterBrowserAdapter(this.getPrefs);
        const out = await or.embed(texts, signal);
        if (out.length === texts.length) {
          await cacheSet(cacheId, out, 24 * 60 * 60 * 1000);
          return out;
        }
      } catch (e) {
        logAiEvent("adapter_fallback", "embed:openrouter", { msg: String(e) });
      }
    }

    if (typeof window !== "undefined" && cfg.user.useTransformers && caps.transformersAllowed) {
      try {
        const batch = await runTransformersEmbed(texts);
        if (batch && batch.length === texts.length) {
          await cacheSet(cacheId, batch, 24 * 60 * 60 * 1000);
          return batch;
        }
      } catch (e) {
        logAiEvent("adapter_fallback", "embed:transformers", { msg: String(e) });
      }
    }

    if (cfg.user.useOllama && caps.ollama.reachable) {
      try {
        const oa = createOllamaAdapter(cfg);
        const out = await oa.embed(texts, signal);
        await cacheSet(cacheId, out, 24 * 60 * 60 * 1000);
        return out;
      } catch (e) {
        logAiEvent("adapter_fallback", "embed:ollama", { msg: String(e) });
      }
    }

    const hashed = texts.map((t) => embedHash(t, 64));
    await cacheSet(cacheId, hashed, 24 * 60 * 60 * 1000);
    return hashed;
  }

  async rerank(query: string, docs: string[]): Promise<import("@/lib/ai/types").RerankResult[]> {
    const vecs = await this.embed([query, ...docs]);
    const qv = vecs[0];
    const scored = docs.map((text, i) => {
      const dv = vecs[i + 1];
      const cos = qv.length === dv.length ? cosine(qv, dv) : 0;
      return { index: i, score: cos, text };
    });
    scored.sort((a, b) => b.score - a.score);
    logAiEvent("ranker", "rerank_docs");
    return scored;
  }

  async plan(prompt: string, ctx: PlannerContext, opts?: PlanOptions): Promise<PlanResponse> {
    const cfg = resolveAiConfig(this.getPrefs());
    try {
      const { response } = await runOrchestratorPlan(prompt, ctx, {
        chat: (r, s) => this.chat(r, s),
        embed: (t, s) => this.embed(t, s),
        config: cfg,
        onPlanEvent: opts?.onPlanEvent,
      });
      return response;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      logAiEvent("error_soft", "plan_orchestrator", { msg });
      try {
        const res = await heuristicAdapter.plan(prompt, ctx);
        return { ...res, notes: [...(res.notes ?? []), msg] };
      } catch {
        return {
          message: "Something eased off track — your cards will be back on the next send.",
          cards: [],
          notes: [msg],
        };
      }
    }
  }
}

export function createGateway(getPrefs?: () => UserPreferences): AIGateway {
  return new AIGateway(getPrefs ?? (() => usePreferencesStore.getState().preferences));
}

export const ai = createGateway();
