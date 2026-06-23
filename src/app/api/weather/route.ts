import { NextResponse } from "next/server";

import { getServerAIConfig } from "@/lib/ai/config";
import { getWeatherServerCached } from "@/lib/ai/routing/weatherServer";
import { newRequestId } from "@/lib/ai/security/requestId";
import mockWeather from "@/lib/ai/routing/weatherProvider";

export const runtime = "edge";

export async function GET(req: Request): Promise<Response> {
  const requestId = newRequestId();
  const url = new URL(req.url);
  const city = url.searchParams.get("city") ?? "Mumbai";
  const lat = url.searchParams.get("lat") ?? undefined;
  const lng = url.searchParams.get("lng") ?? undefined;
  const cfg = getServerAIConfig();
  if (!cfg.openWeatherMapApiKey) {
    const forecast = await mockWeather.getForecast(city);
    return NextResponse.json(forecast, { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } });
  }
  try {
    const forecast = await getWeatherServerCached({
      apiKey: cfg.openWeatherMapApiKey,
      city,
      lat,
      lng,
    });
    return NextResponse.json(forecast, { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json(
      {
        error: {
          code: "weather_error",
          message: e instanceof Error ? e.message : String(e),
          requestId,
        },
      },
      { status: 502, headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } },
    );
  }
}
