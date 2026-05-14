import { NextResponse } from "next/server";

import { getServerAIConfig } from "@/lib/ai/config";
import { newRequestId } from "@/lib/ai/security/requestId";
import { getRecentMetrics } from "@/lib/ai/telemetry/metrics";

export const runtime = "edge";

export async function GET(): Promise<Response> {
  const requestId = newRequestId();
  const cfg = getServerAIConfig();
  const body = {
    openRouterConfigured: Boolean(cfg.openRouterApiKey),
    openWeatherConfigured: Boolean(cfg.openWeatherMapApiKey),
    supabaseConfigured: Boolean(cfg.supabaseUrl && (cfg.supabaseAnonKey || cfg.supabaseServiceRoleKey)),
    upstashConfigured: Boolean(cfg.upstashRedisUrl && cfg.upstashRedisToken),
    recentMetrics: await getRecentMetrics(8),
  };
  return NextResponse.json(body, { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } });
}
