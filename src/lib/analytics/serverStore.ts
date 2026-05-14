import "server-only";

export type AnalyticsEvent = {
  ts: number;
  type: string;
  sessionId?: string;
  meta?: Record<string, unknown>;
};

type Bag = {
  startedAt: number;
  sessions: Set<string>;
  /** One ping per HydrateStores mount (tab loads). */
  totalPings: number;
  aiChats: number;
  aiPlans: number;
  planErrors: number;
  events: AnalyticsEvent[];
};

const MAX_EVENTS = 100;

function getBag(): Bag {
  const g = globalThis as unknown as { __saheliAnalytics?: Bag };
  if (!g.__saheliAnalytics) {
    g.__saheliAnalytics = {
      startedAt: Date.now(),
      sessions: new Set(),
      totalPings: 0,
      aiChats: 0,
      aiPlans: 0,
      planErrors: 0,
      events: [],
    };
  }
  return g.__saheliAnalytics;
}

export function recordAnalytics(input: { type: string; sessionId?: string; meta?: Record<string, unknown> }): void {
  const b = getBag();
  const ev: AnalyticsEvent = { ts: Date.now(), type: input.type, sessionId: input.sessionId, meta: input.meta };
  b.events.push(ev);
  if (b.events.length > MAX_EVENTS) b.events.splice(0, b.events.length - MAX_EVENTS);

  if (input.type === "session_ping") {
    if (input.sessionId) b.sessions.add(input.sessionId);
    b.totalPings += 1;
  }
  if (input.type === "ai_chat") b.aiChats += 1;
  if (input.type === "ai_plan") b.aiPlans += 1;
  if (input.type === "ai_plan_error") b.planErrors += 1;
}

export function getAnalyticsSnapshot(): {
  uniqueSessions: number;
  totalPings: number;
  aiChats: number;
  aiPlans: number;
  planErrors: number;
  recentEvents: AnalyticsEvent[];
  serverStartedAt: number;
} {
  const b = getBag();
  return {
    uniqueSessions: b.sessions.size,
    totalPings: b.totalPings,
    aiChats: b.aiChats,
    aiPlans: b.aiPlans,
    planErrors: b.planErrors,
    recentEvents: [...b.events].reverse().slice(0, 40),
    serverStartedAt: b.startedAt,
  };
}
