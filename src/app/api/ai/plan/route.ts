import { z } from "zod";

import { clientIp, jsonError } from "@/lib/ai/api/shared";
import { newRequestId } from "@/lib/ai/security/requestId";
import { checkRateLimit, RATE_LIMITS } from "@/lib/ai/security/rateLimit";
import { encodeSseEvent } from "@/lib/ai/streaming/sse";
import { runOrchestratorPlan } from "@/lib/ai/orchestrator";
import { createServerOrchestratorDeps } from "@/lib/ai/server/gatewayDeps";
import type { OrchestratorDeps, PlanStreamEvent } from "@/lib/ai/types";
import type { PlannerContext } from "@/lib/ai/planner";
import type { UserPreferences } from "@/lib/types";

export const runtime = "nodejs";

const Body = z.object({
  prompt: z.string().min(1).max(4000),
  preferences: z.any(),
  memorySavedVenueIds: z.array(z.string()).optional(),
  memorySavedThemeIds: z.array(z.string()).optional(),
});

export async function POST(req: Request): Promise<Response> {
  const requestId = newRequestId();
  const ip = clientIp(req.headers);
  const rl = checkRateLimit({ route: "/api/ai/plan", ip, rules: RATE_LIMITS.plan });
  if (!rl.ok) {
    return jsonError(requestId, "rate_limited", rl.message, 429, { retryAfterMs: rl.retryAfterMs }) as unknown as Response;
  }
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonError(requestId, "bad_json", "Invalid JSON body.", 400) as unknown as Response;
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return jsonError(requestId, "validation_error", parsed.error.message, 400) as unknown as Response;
  }
  const body = parsed.data;
  const prefs = body.preferences as UserPreferences;
  const ctx: PlannerContext = {
    preferences: prefs,
    memorySavedVenueIds: body.memorySavedVenueIds ?? [],
    memorySavedThemeIds: body.memorySavedThemeIds ?? [],
  };

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (ev: PlanStreamEvent) => {
        controller.enqueue(encoder.encode(encodeSseEvent({ event: "plan", data: JSON.stringify(ev) })));
      };
      try {
        const base = createServerOrchestratorDeps(prefs);
        const deps: OrchestratorDeps = {
          ...base,
          onPlanEvent: (e) => send(e),
        };
        await runOrchestratorPlan(body.prompt, ctx, deps);
      } catch (e) {
        send({ type: "error", message: e instanceof Error ? e.message : String(e) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Request-Id": requestId,
    },
  });
}
