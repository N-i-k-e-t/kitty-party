"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ai, runOrchestratorPlan } from "@/lib/ai";
import { resolveAiConfig } from "@/lib/ai/config";
import type { AiModelTier, Capabilities, PlanTraceStep } from "@/lib/ai/types";
import { getRecentAiEvents, clearAiEvents } from "@/lib/ai/telemetry/events";
import { invalidateCapabilitiesCache } from "@/lib/ai/capabilities";
import { usePreferencesStore } from "@/store/preferences";
import { estimateCostUsd } from "@/lib/ai/telemetry/metrics";
import { parseSseChunk } from "@/lib/ai/streaming/sse";

export default function AiDevShowcase() {
  const prefs = usePreferencesStore((s) => s.preferences);
  const patch = usePreferencesStore((s) => s.patch);
  const [caps, setCaps] = useState<Capabilities | null>(null);
  const [tests, setTests] = useState<{ label: string; ms: number; detail: string }[]>([]);
  const [trace, setTrace] = useState<PlanTraceStep[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const [lastAdapter, setLastAdapter] = useState<string>("");
  const [tier, setTier] = useState<AiModelTier>("balanced");
  const [streamLog, setStreamLog] = useState("");
  const [rateHint, setRateHint] = useState<string>("");

  const refreshEvents = useCallback(() => {
    setEvents(getRecentAiEvents(30).map((e) => `${new Date(e.ts).toLocaleTimeString()} ${e.kind} ${e.detail}`));
  }, []);

  const probe = useCallback(async () => {
    invalidateCapabilitiesCache();
    const c = await ai.detectCapabilities(true);
    setCaps(c);
    refreshEvents();
    try {
      const res = await fetch("/api/ai/capabilities", { cache: "no-store" });
      const body = (await res.json()) as Record<string, unknown>;
      setRateHint(
        `HTTP ${res.status} · OpenRouter: ${String(body.openRouterConfigured)} · Supabase: ${String(body.supabaseConfigured)} · OWM: ${String(body.openWeatherConfigured)}`,
      );
    } catch {
      setRateHint("capabilities fetch failed");
    }
  }, [refreshEvents]);

  useEffect(() => {
    void probe();
  }, [probe]);

  async function pushTest(label: string, fn: () => Promise<void>) {
    const t0 = Date.now();
    try {
      await fn();
      setTests((prev) => [{ label, ms: Date.now() - t0, detail: "ok" }, ...prev].slice(0, 12));
    } catch (e) {
      setTests((prev) =>
        [
          {
            label,
            ms: Date.now() - t0,
            detail: e instanceof Error ? e.message : String(e),
          },
          ...prev,
        ].slice(0, 12),
      );
    }
    setLastAdapter(ai.getLastChatAdapter());
    refreshEvents();
  }

  async function runGatewayChat() {
    await pushTest("ai.chat", async () => {
      const r = await ai.chat({
        messages: [{ role: "user", content: "Say hello in one short sentence for a kitty planner." }],
      });
      if (!r.text) throw new Error("empty chat");
    });
  }

  async function runStreamChat() {
    setStreamLog("");
    const t0 = performance.now();
    let first: number | null = null;
    let tokens = 0;
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: "Stream a 25-word warm welcome for a kitty planner." }],
        stream: true,
        modelTier: tier,
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      setRateHint(`chat ${res.status}: ${t.slice(0, 200)}`);
      throw new Error(`stream ${res.status}`);
    }
    const reader = res.body?.getReader();
    if (!reader) throw new Error("no body");
    const dec = new TextDecoder();
    let carry = "";
    let buf = "";
    let usage: { promptTokens?: number; completionTokens?: number; totalTokens?: number } | undefined;
    let model = "";
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
            if (first === null) first = performance.now();
            tokens += 1;
            buf += obj.text;
            setStreamLog(buf);
          }
          if (obj.type === "done") {
            usage = obj.usage as typeof usage;
            model = String(obj.model ?? "");
          }
        } catch {
          /* ignore */
        }
      }
    }
    const total = performance.now() - t0;
    const ft = first ? Math.round(first - t0) : 0;
    const est = estimateCostUsd(model || "openai/gpt-4o-mini", usage?.promptTokens ?? 0, usage?.completionTokens ?? 0);
    setTests((p) =>
      [
        {
          label: "stream chat",
          ms: Math.round(total),
          detail: `firstToken=${ft}ms tokens=${tokens} estUSD=${est.usd.toFixed(6)} model=${model || "default"}`,
        },
        ...p,
      ].slice(0, 12),
    );
    setLastAdapter("openrouter");
    refreshEvents();
  }

  async function runGatewayEmbed() {
    await pushTest("ai.embed", async () => {
      const v = await ai.embed(["saheli", "mumbai kitty"]);
      if (!v[0]?.length) throw new Error("empty embed");
    });
  }

  async function runGatewayRerank() {
    await pushTest("ai.rerank", async () => {
      const r = await ai.rerank("rooftop brunch", ["indoor cafe circle", "glass terrace sunset", "banquet hall glam"]);
      if (!r.length) throw new Error("empty rerank");
    });
  }

  async function runOrchestratorTrace() {
    const cfg = resolveAiConfig(prefs);
    const t0 = Date.now();
    try {
      const { steps } = await runOrchestratorPlan(
        "Suggest three venues that feel right for us in Mumbai",
        {
          preferences: prefs,
          memorySavedVenueIds: [],
          memorySavedThemeIds: [],
        },
        {
          chat: (r, s) => ai.chat(r, s),
          embed: (t, s) => ai.embed(t, s),
          config: cfg,
        },
      );
      setTrace(steps);
      setTests((p) => [{ label: "orchestrator", ms: Date.now() - t0, detail: `${steps.length} steps` }, ...p].slice(0, 12));
    } catch (e) {
      setTests((p) => [
        {
          label: "orchestrator",
          ms: Date.now() - t0,
          detail: e instanceof Error ? e.message : String(e),
        },
        ...p,
      ].slice(0, 12));
    }
    setLastAdapter(ai.getLastChatAdapter());
    refreshEvents();
  }

  const matrix = useMemo(() => {
    void caps;
    return [
      ["OpenRouter (default)", "server", "chat/embed/structured", "yes", "SSE", "json_schema/json_object", "optional", "next adapter"],
      ["Direct OpenAI", "server", "compat chat", "opt-in", "non-stream", "json_object", "embeddings", "next adapter"],
      ["Direct Anthropic", "server", "messages API", "opt-in", "non-stream", "prompt-only", "no", "next adapter"],
      ["Direct Google", "server", "generateContent", "opt-in", "non-stream", "prompt-only", "no", "next adapter"],
      ["Ollama", "local/server", "optional chat", "opt-in", "non-stream", "varies", "yes", "next adapter"],
      ["WebLLM", "browser", "optional chat", "opt-in", "token", "varies", "no", "next adapter"],
      ["Transformers.js", "browser", "embeddings", "opt-in", "n/a", "n/a", "yes", "hash fallback"],
      ["Heuristic", "client", "terminal fallback", "yes", "n/a", "n/a", "hash", "notes"],
    ] as const;
  }, [caps]);

  const aiDefaults = {
    useWebLLM: false,
    useOllama: false,
    useTransformers: true,
    useExternal: false,
    useDirectOpenAI: false,
    useDirectAnthropic: false,
    useDirectGoogle: false,
    modelTier: "balanced" as AiModelTier,
    usePremiumModel: false,
  } as const;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 text-sm text-ink">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">AI dev console</h1>
        <p className="mt-1 text-ink-muted">OpenRouter-first gateway with modular adapters and live API probes.</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">Capabilities</h2>
        <pre className="overflow-x-auto rounded-lg border border-stroke bg-surface-muted p-3 text-xs">
          {caps ? JSON.stringify(caps, null, 2) : "Probing…"}
        </pre>
        <p className="text-xs text-ink-muted">Last chat adapter: {lastAdapter || "—"}</p>
        <p className="text-xs text-ink-muted">Server probe: {rateHint}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="rounded-md border border-stroke px-3 py-1.5" onClick={() => void probe()}>
            Re-probe
          </button>
          <button type="button" className="rounded-md border border-stroke px-3 py-1.5" onClick={() => void runGatewayChat()}>
            Test ai.chat
          </button>
          <button type="button" className="rounded-md border border-stroke px-3 py-1.5" onClick={() => void runStreamChat()}>
            Test stream /api/ai/chat
          </button>
          <button type="button" className="rounded-md border border-stroke px-3 py-1.5" onClick={() => void runGatewayEmbed()}>
            Test ai.embed
          </button>
          <button type="button" className="rounded-md border border-stroke px-3 py-1.5" onClick={() => void runGatewayRerank()}>
            Test ai.rerank
          </button>
          <button type="button" className="rounded-md border border-stroke px-3 py-1.5" onClick={() => void runOrchestratorTrace()}>
            Run orchestrator trace
          </button>
          <button type="button" className="rounded-md border border-stroke px-3 py-1.5" onClick={() => { clearAiEvents(); refreshEvents(); }}>
            Clear telemetry
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">Model tier (stream test)</h2>
        <div className="flex flex-wrap gap-2">
          {(["cheap", "balanced", "premium"] as const).map((t) => (
            <label key={t} className="flex items-center gap-2 rounded-md border border-stroke px-3 py-2">
              <input type="radio" name="tier" checked={tier === t} onChange={() => setTier(t)} />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">Provider matrix (static)</h2>
        <div className="overflow-x-auto rounded-lg border border-stroke">
          <table className="w-full text-xs">
            <thead className="bg-surface-muted text-left">
              <tr>
                {["Provider", "Where", "Role", "Default?", "Streaming", "JSON", "Embedding", "Failure"].map((h) => (
                  <th key={h} className="px-2 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.map((row) => (
                <tr key={row[0]} className="border-t border-stroke/60">
                  {row.map((c) => (
                    <td key={c} className="px-2 py-2 align-top">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">Streaming log</h2>
        <pre className="min-h-[80px] whitespace-pre-wrap rounded-lg border border-stroke bg-surface-muted p-3 text-xs">{streamLog || "—"}</pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">Preference toggles</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["useWebLLM", "WebLLM"] as const,
              ["useOllama", "Ollama"] as const,
              ["useTransformers", "Transformers.js"] as const,
              ["useExternal", "External API"] as const,
              ["useDirectOpenAI", "Direct OpenAI"] as const,
              ["useDirectAnthropic", "Direct Anthropic"] as const,
              ["useDirectGoogle", "Direct Google"] as const,
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 rounded-md border border-stroke px-3 py-2">
              <input
                type="checkbox"
                checked={prefs.ai?.[key] ?? aiDefaults[key]}
                onChange={(e) => {
                  void patch({
                    ai: { ...prefs.ai, [key]: e.target.checked },
                  });
                  void probe();
                }}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-ink-muted">Transformers defaults on; WebLLM and Ollama default off.</p>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">Recent gateway tests</h2>
        <ul className="space-y-2">
          {tests.map((t) => (
            <li key={`${t.label}-${t.ms}-${t.detail}`} className="rounded-lg border border-stroke p-3 text-xs">
              <div className="flex justify-between gap-2 text-ink-muted">
                <span>{t.label}</span>
                <span>{t.ms} ms</span>
              </div>
              <p className="mt-1 whitespace-pre-wrap">{t.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">Orchestrator steps</h2>
        <ul className="space-y-1 text-xs">
          {trace.map((s) => (
            <li key={`${s.id}-${s.ms}`} className="flex justify-between border-b border-stroke/60 py-1">
              <span>{s.id}</span>
              <span>{s.ms} ms</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">Telemetry (local ring)</h2>
        <ul className="max-h-48 overflow-y-auto rounded-lg border border-stroke bg-surface-muted p-2 text-xs">
          {events.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
