import type { PlanResponse } from "@/lib/types";
import type { PlannerContext } from "@/lib/ai/planner";
import type { PlanWithTrace } from "@/lib/ai/types";
import type { OrchestratorDeps } from "@/lib/ai/types";
import { heuristicAdapter } from "@/lib/ai/adapters/heuristic";
import { classifyIntent } from "@/lib/ai/orchestrator/intent";
import { retrieveContext } from "@/lib/ai/orchestrator/retrieve";
import { twoStage } from "@/lib/ai/ranker/pipeline";
import { composeOpeningParagraph } from "@/lib/ai/orchestrator/compose";
import { renderPlanResponse } from "@/lib/ai/orchestrator/render";
import { shortTermPush } from "@/lib/ai/memory/shortTerm";
import { recordLongTerm } from "@/lib/ai/memory/longTerm";
import { logAiEvent } from "@/lib/ai/telemetry/events";

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

export async function runOrchestratorPlan(
  prompt: string,
  ctx: PlannerContext,
  deps: OrchestratorDeps,
): Promise<PlanWithTrace> {
  const stepsOut: PlanWithTrace["steps"] = [];

  const tIntent = now();
  const intent = classifyIntent(prompt);
  stepsOut.push({ id: "intent", ms: Math.round(now() - tIntent) });
  deps.onPlanEvent?.({ type: "intent", intent: intent.kind, ms: stepsOut[stepsOut.length - 1]?.ms ?? 0 });

  const tRet = now();
  const pack = await retrieveContext({
    prompt,
    prefs: ctx.preferences,
    intent,
    plannerCtxMemoryVenues: ctx.memorySavedVenueIds ?? [],
    plannerCtxMemoryThemes: ctx.memorySavedThemeIds ?? [],
    config: deps.config,
  });
  stepsOut.push({ id: "retrieve", ms: Math.round(now() - tRet) });
  deps.onPlanEvent?.({ type: "retrieve", ms: stepsOut[stepsOut.length - 1]?.ms ?? 0 });

  const tRank = now();
  let userEmb: number[] | null = null;
  try {
    const prefLine = `${ctx.preferences.city} ${ctx.preferences.vibes.join(" ")} kitty ${pack.venueQuery.budget}`;
    const batch = await deps.embed([prefLine]);
    userEmb = batch[0] ?? null;
  } catch {
    userEmb = null;
  }
  const ranked = await twoStage(pack.candidates, pack.rankerContext, userEmb);
  stepsOut.push({ id: "rank", ms: Math.round(now() - tRank) });
  deps.onPlanEvent?.({ type: "rank", ms: stepsOut[stepsOut.length - 1]?.ms ?? 0 });

  const tBase = now();
  let base: PlanResponse;
  try {
    base = await heuristicAdapter.plan(prompt, ctx);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    logAiEvent("error_soft", "heuristic_plan_failed", { msg });
    base = {
      message: "I saved the gentle bits locally — let’s try that once more with your city and headcount.",
      cards: [],
      notes: [msg],
    };
  }
  stepsOut.push({ id: "heuristic_plan", ms: Math.round(now() - tBase) });

  const tCompose = now();
  const venueShortlist = ranked
    .slice(0, 6)
    .map((r) => `${r.venue.name} (${r.venue.area})`)
    .join("; ");
  const hyperlocalSummary = `${pack.hyperlocal.season} · ${pack.hyperlocal.weather.tip}`;
  const llmOpening = await composeOpeningParagraph({
    chat: deps.chat,
    slots: {
      city: ctx.preferences.city,
      groupSize: ctx.preferences.groupSize,
      intent: intent.kind,
      memoryBrief: pack.memoryProse,
      hyperlocalSummary,
      venueShortlist,
    },
    onToken: deps.onPlanEvent ? (t) => deps.onPlanEvent?.({ type: "compose:token", text: t }) : undefined,
  });
  stepsOut.push({ id: "compose", ms: Math.round(now() - tCompose) });

  const tRender = now();
  let merged: PlanResponse = {
    ...base,
    message: llmOpening && llmOpening.length > 0 ? llmOpening : base.message,
  };
  merged = await renderPlanResponse({
    base: merged,
    ranked,
    chat: deps.chat,
    onToken: deps.onPlanEvent ? (t) => deps.onPlanEvent?.({ type: "render:token", text: t }) : undefined,
  });
  stepsOut.push({ id: "render", ms: Math.round(now() - tRender) });

  shortTermPush({ role: "user", text: prompt });
  shortTermPush({ role: "assistant", text: merged.message, intent: intent.kind });
  void recordLongTerm({
    kind: "plan_saved",
    payload: { intent: intent.kind, city: ctx.preferences.city },
  }).catch(() => {});

  const totalMs = stepsOut.reduce((s, x) => s + x.ms, 0);
  stepsOut.push({ id: "total", ms: totalMs });

  deps.onPlanEvent?.({ type: "done:plan", response: merged, steps: stepsOut });

  return { response: merged, steps: stepsOut };
}

export async function planFromOrchestrator(
  prompt: string,
  ctx: PlannerContext,
  deps: OrchestratorDeps,
): Promise<PlanResponse> {
  const { response } = await runOrchestratorPlan(prompt, ctx, deps);
  return response;
}
