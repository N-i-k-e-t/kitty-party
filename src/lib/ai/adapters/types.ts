import type { ChatRequest, ChatResponse, AdapterName } from "@/lib/ai/types";
import type { PlanResponse } from "@/lib/types";
import type { PlannerContext } from "@/lib/ai/planner";

export class UnsupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedError";
  }
}

export interface Adapter {
  readonly name: AdapterName;
  chat(req: ChatRequest, signal?: AbortSignal): Promise<ChatResponse>;
  embed(texts: string[], signal?: AbortSignal): Promise<number[][]>;
  plan(prompt: string, ctx: PlannerContext, signal?: AbortSignal): Promise<PlanResponse>;
}
