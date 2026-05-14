import { NextResponse } from "next/server";

import { MODEL_REGISTRY } from "@/lib/ai/models/registry";
import { newRequestId } from "@/lib/ai/security/requestId";

export const runtime = "edge";

export async function GET(): Promise<Response> {
  const requestId = newRequestId();
  const rows = MODEL_REGISTRY.map((m) => ({
    id: m.id,
    provider: m.provider,
    contextSize: m.contextSize,
    costPer1MIn: m.costPer1MIn,
    costPer1MOut: m.costPer1MOut,
    json: m.json,
    vision: m.vision,
    latencyTier: m.latencyTier,
  }));
  return NextResponse.json(
    { models: rows },
    { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } },
  );
}
