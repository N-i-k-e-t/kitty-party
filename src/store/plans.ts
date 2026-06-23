import { create } from "zustand";
import type { PlanMessage, SavedPlan } from "@/lib/types";
import { loadPlans, savePlans } from "@/lib/memory";
import { createId } from "@/lib/id";

interface PlansState {
  hydrated: boolean;
  plans: SavedPlan[];
  hydrate: () => Promise<void>;
  upsertPlan: (plan: SavedPlan) => Promise<void>;
  getById: (id: string) => SavedPlan | undefined;
  removePlan: (id: string) => Promise<void>;
}

export const usePlansStore = create<PlansState>((set, get) => ({
  hydrated: false,
  plans: [],
  hydrate: async () => {
    const plans = await loadPlans();
    set({ plans, hydrated: true });
  },
  upsertPlan: async (plan) => {
    const others = get().plans.filter((p) => p.id !== plan.id);
    const next = [plan, ...others];
    set({ plans: next });
    await savePlans(next);
  },
  getById: (id) => get().plans.find((p) => p.id === id),
  removePlan: async (id) => {
    const next = get().plans.filter((p) => p.id !== id);
    set({ plans: next });
    await savePlans(next);
  },
}));

export function newEmptyPlan(partial: Pick<SavedPlan, "title" | "city">): SavedPlan {
  const now = Date.now();
  return {
    id: createId("plan"),
    title: partial.title,
    city: partial.city,
    createdAt: now,
    updatedAt: now,
    messages: [],
    workspace: { venueIds: [] },
    pinnedCardIds: [],
  };
}

export function appendAssistantMessage(plan: SavedPlan, msg: PlanMessage): SavedPlan {
  return {
    ...plan,
    updatedAt: Date.now(),
    messages: [...plan.messages, msg],
  };
}

export function appendUserMessage(plan: SavedPlan, content: string): SavedPlan {
  const msg: PlanMessage = {
    id: createId("msg"),
    role: "user",
    content,
    createdAt: Date.now(),
  };
  return {
    ...plan,
    updatedAt: Date.now(),
    messages: [...plan.messages, msg],
  };
}
