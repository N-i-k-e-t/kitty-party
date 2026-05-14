import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { verifyAdminCookie } from "@/lib/analytics/adminAuth";
import { getAnalyticsSnapshot } from "@/lib/analytics/serverStore";
import { jsonError } from "@/lib/ai/api/shared";
import { newRequestId } from "@/lib/ai/security/requestId";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const requestId = newRequestId();
  const secret = process.env.SAHELI_ADMIN_SECRET?.trim();
  const jar = await cookies();
  const cookieVal = jar.get("saheli_admin")?.value;
  if (!verifyAdminCookie(cookieVal, secret)) {
    return jsonError(requestId, "unauthorized", "Admin session required.", 401);
  }
  const snap = getAnalyticsSnapshot();
  const openrouterConfigured = Boolean(process.env.OPENROUTER_API_KEY?.trim());
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  return NextResponse.json(
    {
      ...snap,
      openrouterConfigured,
      siteUrl: site,
      nodeEnv: process.env.NODE_ENV ?? "development",
      note:
        "Counts live in this server instance only (resets on cold start). For accurate global metrics, add Supabase or an analytics provider later.",
    },
    { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } },
  );
}
