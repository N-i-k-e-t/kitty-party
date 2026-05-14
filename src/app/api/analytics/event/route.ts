import { z } from "zod";
import { NextResponse } from "next/server";

import { recordAnalytics } from "@/lib/analytics/serverStore";
import { clientIp, jsonError } from "@/lib/ai/api/shared";
import { newRequestId } from "@/lib/ai/security/requestId";
import { checkRateLimit, RATE_LIMITS } from "@/lib/ai/security/rateLimit";

export const runtime = "nodejs";

const Body = z.object({
  type: z.enum(["ai_chat", "ai_plan", "ai_plan_error"]),
  sessionId: z.string().min(8).max(128).optional(),
  meta: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

export async function POST(req: Request): Promise<Response> {
  const requestId = newRequestId();
  const ip = clientIp(req.headers);
  const rl = checkRateLimit({ route: "/api/analytics/event", ip, rules: RATE_LIMITS.analytics });
  if (!rl.ok) {
    return jsonError(requestId, "rate_limited", rl.message, 429, { retryAfterMs: rl.retryAfterMs });
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonError(requestId, "bad_json", "Invalid JSON body.", 400);
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return jsonError(requestId, "validation_error", parsed.error.message, 400);
  }
  recordAnalytics({
    type: parsed.data.type,
    sessionId: parsed.data.sessionId,
    meta: parsed.data.meta,
  });
  return NextResponse.json({ ok: true }, { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } });
}
