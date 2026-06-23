import { z } from "zod";
import { NextResponse } from "next/server";

import { clientIp, jsonError } from "@/lib/ai/api/shared";
import { newRequestId } from "@/lib/ai/security/requestId";
import { checkRateLimit, RATE_LIMITS } from "@/lib/ai/security/rateLimit";
import { embedOpenRouter } from "@/lib/ai/adapters/openrouterServer";
import { getServerAIConfig } from "@/lib/ai/config";
import { embedHash } from "@/lib/ai/embedHash";
import { serverEmbedCache } from "@/lib/ai/cache/server";
import { recordAiMetric } from "@/lib/ai/telemetry/metrics";

export const runtime = "edge";

const Body = z.object({
  texts: z.array(z.string()).min(1).max(32),
  model: z.string().optional(),
});

export async function POST(req: Request): Promise<Response> {
  const requestId = newRequestId();
  const ip = clientIp(req.headers);
  const rl = checkRateLimit({ route: "/api/ai/embed", ip, rules: RATE_LIMITS.embed });
  if (!rl.ok) {
    return jsonError(requestId, "rate_limited", rl.message, 429, { retryAfterMs: rl.retryAfterMs }) as unknown as Response;
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonError(requestId, "bad_json", "Invalid JSON body.", 400) as unknown as Response;
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return jsonError(requestId, "validation_error", parsed.error.message, 400) as unknown as Response;
  }
  const texts = parsed.data.texts.map((t) => (t.length > 8000 ? t.slice(0, 8000) : t));
  const key = JSON.stringify([parsed.data.model ?? "default", texts]);
  const hit = serverEmbedCache.get(key);
  if (hit) {
    return NextResponse.json(
      { vectors: hit },
      { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } },
    );
  }
  const cfg = getServerAIConfig();
  if (!cfg.openRouterApiKey) {
    const vectors = texts.map((t) => embedHash(t, 64));
    serverEmbedCache.set(key, vectors, 24 * 60 * 60 * 1000);
    return NextResponse.json({ vectors }, { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } });
  }
  const res = await embedOpenRouter({
    apiKey: cfg.openRouterApiKey,
    referer: cfg.openRouterReferrer,
    model: parsed.data.model ?? "openai/text-embedding-3-small",
    texts,
    signal: req.signal,
  });
  if (res.error || res.vectors.length !== texts.length) {
    const vectors = texts.map((t) => embedHash(t, 64));
    serverEmbedCache.set(key, vectors, 24 * 60 * 60 * 1000);
    return NextResponse.json({ vectors, notes: [res.error ?? "embed_fallback"] }, { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } });
  }
  serverEmbedCache.set(key, res.vectors, 24 * 60 * 60 * 1000);
  void recordAiMetric({
    route: "/api/ai/embed",
    modelId: parsed.data.model ?? "openai/text-embedding-3-small",
    promptTokens: 0,
    completionTokens: 0,
    requestId,
  });
  return NextResponse.json({ vectors: res.vectors }, { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } });
}
