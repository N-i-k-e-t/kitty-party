import "server-only";

import { verifyAdminCookie } from "@/lib/analytics/adminAuth";
import { getAnalyticsSnapshot } from "@/lib/analytics/serverStore";
import type { AdminStatsDTO } from "@/lib/analytics/adminStatsTypes";

export type { AdminStatsDTO } from "@/lib/analytics/adminStatsTypes";

export function buildAdminStatsDTO(adminCookie: string | undefined): AdminStatsDTO | null {
  const secret = process.env.SAHELI_ADMIN_SECRET?.trim();
  if (!verifyAdminCookie(adminCookie, secret)) return null;
  const snap = getAnalyticsSnapshot();
  const now = Date.now();
  const openrouterConfigured = Boolean(process.env.OPENROUTER_API_KEY?.trim());
  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  return {
    ...snap,
    uptimeMs: now - snap.serverStartedAt,
    openrouterConfigured,
    siteUrl: site,
    nodeEnv: process.env.NODE_ENV ?? "development",
    note:
      "Counts live in this server instance only (resets on cold start). For accurate global metrics, add Supabase or an analytics provider later.",
  };
}
