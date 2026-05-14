import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { buildAdminStatsDTO } from "@/lib/analytics/adminStats";
import { jsonError } from "@/lib/ai/api/shared";
import { newRequestId } from "@/lib/ai/security/requestId";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  const requestId = newRequestId();
  const jar = await cookies();
  const cookieVal = jar.get("saheli_admin")?.value;
  const dto = buildAdminStatsDTO(cookieVal);
  if (!dto) {
    return jsonError(requestId, "unauthorized", "Admin session required.", 401) as unknown as Response;
  }
  return NextResponse.json(dto, {
    headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" },
  });
}
