export type AiTelemetryEvent = {
  id: string;
  ts: number;
  kind:
    | "adapter_selected"
    | "adapter_fallback"
    | "latency"
    | "embed_lookup"
    | "ranker"
    | "error_soft";
  detail: string;
  meta?: Record<string, string | number | boolean>;
};

const RING_MAX = 120;
const ring: AiTelemetryEvent[] = [];

function push(ev: AiTelemetryEvent) {
  ring.push(ev);
  if (ring.length > RING_MAX) ring.splice(0, ring.length - RING_MAX);
}

export function logAiEvent(
  kind: AiTelemetryEvent["kind"],
  detail: string,
  meta?: AiTelemetryEvent["meta"],
): void {
  push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ts: Date.now(),
    kind,
    detail,
    meta,
  });
}

export function getRecentAiEvents(limit = 40): AiTelemetryEvent[] {
  return ring.slice(-limit).reverse();
}

export function clearAiEvents(): void {
  ring.length = 0;
}
