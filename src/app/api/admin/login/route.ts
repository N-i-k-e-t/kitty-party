import { z } from "zod";
import { NextResponse } from "next/server";

import { adminCookieValue, timingSafeSecretEqual } from "@/lib/analytics/adminAuth";
import { clientIp, jsonError } from "@/lib/ai/api/shared";
import { newRequestId } from "@/lib/ai/security/requestId";
import { checkRateLimit } from "@/lib/ai/security/rateLimit";

export const runtime = "nodejs";

const Body = z.object({
  secret: z.string().min(1).max(500),
});

export async function POST(req: Request): Promise<Response> {
  const requestId = newRequestId();
  const ip = clientIp(req.headers);
  const rl = checkRateLimit({ route: "/api/admin/login", ip, rules: { perIpPerMinute: 20, perIpPerHour: 100 } });
  if (!rl.ok) {
    return jsonError(requestId, "rate_limited", rl.message, 429, { retryAfterMs: rl.retryAfterMs });
  }
  const envSecret = process.env.SAHELI_ADMIN_SECRET?.trim();
  if (!envSecret || envSecret.length < 8) {
    return jsonError(requestId, "not_configured", "Set SAHELI_ADMIN_SECRET (min 8 chars) in environment.", 503);
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
  if (!timingSafeSecretEqual(parsed.data.secret, envSecret)) {
    return jsonError(requestId, "unauthorized", "Invalid secret.", 401);
  }
  const token = adminCookieValue(envSecret);
  const secure = process.env.NODE_ENV === "production";
  const res = NextResponse.json({ ok: true }, { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } });
  res.cookies.set("saheli_admin", token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
