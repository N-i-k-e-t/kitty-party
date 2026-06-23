import { parsePlannerPrompt } from "@/lib/ai/nlu";
import { plan as heuristicPlan } from "@/lib/ai/planner";
import type { PlannerContext } from "@/lib/ai/planner";
import type { PlanResponse } from "@/lib/types";
import type { Adapter } from "@/lib/ai/adapters/types";
import type { ChatRequest, ChatResponse } from "@/lib/ai/types";
import { embedHash } from "@/lib/ai/embedHash";
import { readMediumTermPreferences } from "@/lib/ai/memory/mediumTerm";
import { mergeVoice } from "@/lib/ai/prompts";

export const heuristicAdapter: Adapter = {
  name: "heuristic",

  async chat(req: ChatRequest, signal?: AbortSignal): Promise<ChatResponse> {
    void signal;
    const last = [...req.messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const { intent, entities } = parsePlannerPrompt(last);
    const prefs = readMediumTermPreferences();
    const city = entities.city ?? prefs.city;
    const tail = mergeVoice(prefs);
    return {
      adapter: "heuristic",
      text: `I’m with you on a ${intent}-shaped ask in ${city}. ${tail} (Local heuristic mode — no cloud model attached.)`,
    };
  },

  async embed(texts: string[], signal?: AbortSignal): Promise<number[][]> {
    void signal;
    return texts.map((t) => embedHash(t, 64));
  },

  async plan(prompt: string, ctx: PlannerContext, signal?: AbortSignal): Promise<PlanResponse> {
    void signal;
    return heuristicPlan(prompt, ctx);
  },
};
