import { NextResponse } from "next/server";

import { newRequestId } from "@/lib/ai/security/requestId";

export const runtime = "nodejs";

export async function POST(): Promise<Response> {
  const requestId = newRequestId();
  const res = NextResponse.json({ ok: true }, { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } });
  res.cookies.set("saheli_admin", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
