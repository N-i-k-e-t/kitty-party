import { logAiEvent } from "@/lib/ai/telemetry/events";
import { cacheGet, cacheSet } from "@/lib/ai/cache/persistent";
import { getModelById } from "@/lib/ai/models/registry";

type MetricEntry = Record<string, unknown>;

const g = globalThis as unknown as { __saheli_ai_metrics?: MetricEntry[] };

function serverRing(): MetricEntry[] {
  if (!g.__saheli_ai_metrics) g.__saheli_ai_metrics = [];
  return g.__saheli_ai_metrics;
}

export type CostEstimate = {
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  usd: number;
};

export function estimateCostUsd(modelId: string, promptTokens: number, completionTokens: number): CostEstimate {
  const m = getModelById(modelId);
  const inRate = (m?.costPer1MIn ?? 0.2) / 1_000_000;
  const outRate = (m?.costPer1MOut ?? 0.8) / 1_000_000;
  const usd = promptTokens * inRate + completionTokens * outRate;
  return { modelId, promptTokens, completionTokens, usd };
}

export async function recordAiMetric(input: {
  route: string;
  modelId: string;
  promptTokens: number;
  completionTokens: number;
  requestId: string;
}): Promise<void> {
  const cost = estimateCostUsd(input.modelId, input.promptTokens, input.completionTokens);
  logAiEvent("latency", `metrics:${input.route}`, {
    usd: Math.round(cost.usd * 1_000_000) / 1_000_000,
    prompt: input.promptTokens,
    completion: input.completionTokens,
  });
  const entry: MetricEntry = { ...input, usd: cost.usd, at: Date.now() };
  if (typeof window === "undefined") {
    const ring = serverRing();
    ring.push(entry);
    if (ring.length > 60) ring.splice(0, ring.length - 60);
    return;
  }
  const ring = (await cacheGet<MetricEntry[]>("ai_metrics_ring")) ?? [];
  ring.push(entry);
  await cacheSet("ai_metrics_ring", ring.slice(-40), 7 * 24 * 60 * 60 * 1000);
}

export async function getRecentMetrics(limit = 20): Promise<MetricEntry[]> {
  if (typeof window === "undefined") {
    return serverRing().slice(-limit);
  }
  const ring = await cacheGet<MetricEntry[]>("ai_metrics_ring");
  if (!Array.isArray(ring)) return [];
  return ring.slice(-limit);
}
