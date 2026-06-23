export type RateLimitWindow = "minute" | "hour";

export type RateLimitRule = {
  perIpPerMinute?: number;
  perIpPerHour?: number;
  perUserPerMinute?: number;
};

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterMs: number; message: string };

type WindowBucket = { start: number; count: number };

export interface RateLimitStore {
  incr(key: string, windowMs: number, limit: number): { allowed: boolean; retryAfterMs: number };
}

class MemoryRateLimitStore implements RateLimitStore {
  private readonly map = new Map<string, WindowBucket>();

  incr(key: string, windowMs: number, limit: number): { allowed: boolean; retryAfterMs: number } {
    const now = Date.now();
    const cur = this.map.get(key);
    if (!cur || now - cur.start >= windowMs) {
      this.map.set(key, { start: now, count: 1 });
      return { allowed: true, retryAfterMs: 0 };
    }
    if (cur.count < limit) {
      cur.count += 1;
      return { allowed: true, retryAfterMs: 0 };
    }
    const retryAfterMs = Math.max(0, windowMs - (now - cur.start));
    return { allowed: false, retryAfterMs };
  }
}

let defaultStore: RateLimitStore = new MemoryRateLimitStore();

export function setRateLimitStore(store: RateLimitStore): void {
  defaultStore = store;
}

export function resetRateLimitStoreForTests(): void {
  defaultStore = new MemoryRateLimitStore();
}

function key(route: string, ip: string, userId?: string | null, kind: "ipm" | "iph" | "um" = "ipm"): string {
  return `${route}:${kind}:${userId ?? ""}:${ip}`;
}

export function checkRateLimit(input: {
  route: string;
  ip: string;
  userId?: string | null;
  rules: RateLimitRule;
}): RateLimitResult {
  const { route, ip, userId, rules } = input;
  if (rules.perIpPerMinute) {
    const k = key(route, ip, null, "ipm");
    const r = defaultStore.incr(k, 60_000, rules.perIpPerMinute);
    if (!r.allowed) {
      return { ok: false, retryAfterMs: r.retryAfterMs, message: "Too many requests (per minute)." };
    }
  }
  if (rules.perIpPerHour) {
    const k = key(route, ip, null, "iph");
    const r = defaultStore.incr(k, 3_600_000, rules.perIpPerHour);
    if (!r.allowed) {
      return { ok: false, retryAfterMs: r.retryAfterMs, message: "Too many requests (per hour)." };
    }
  }
  if (rules.perUserPerMinute && userId) {
    const k = key(route, ip, userId, "um");
    const r = defaultStore.incr(k, 60_000, rules.perUserPerMinute);
    if (!r.allowed) {
      return { ok: false, retryAfterMs: r.retryAfterMs, message: "Too many requests for this account (per minute)." };
    }
  }
  return { ok: true };
}

export const RATE_LIMITS = {
  chat: { perIpPerMinute: 30, perIpPerHour: 120 } satisfies RateLimitRule,
  plan: { perIpPerMinute: 10, perIpPerHour: 60 } satisfies RateLimitRule,
  embed: { perIpPerMinute: 60 } satisfies RateLimitRule,
  analytics: { perIpPerMinute: 120, perIpPerHour: 2000 } satisfies RateLimitRule,
} as const;
