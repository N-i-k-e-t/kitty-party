import { z } from "zod";
import { NextResponse } from "next/server";

import { recordAnalytics } from "@/lib/analytics/serverStore";
import { clientIp, jsonError } from "@/lib/ai/api/shared";
import { newRequestId } from "@/lib/ai/security/requestId";
import { checkRateLimit, RATE_LIMITS } from "@/lib/ai/security/rateLimit";

export const runtime = "nodejs";

const Body = z.object({
  sessionId: z.string().min(8).max(128),
});

export async function POST(req: Request): Promise<Response> {
  const requestId = newRequestId();
  const ip = clientIp(req.headers);
  const rl = checkRateLimit({ route: "/api/analytics/ping", ip, rules: RATE_LIMITS.analytics });
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
  recordAnalytics({ type: "session_ping", sessionId: parsed.data.sessionId });
  return NextResponse.json({ ok: true }, { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } });
}
