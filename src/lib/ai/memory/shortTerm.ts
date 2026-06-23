import type { MemoryEventKind } from "@/lib/ai/memory/types";

type Turn = { role: "user" | "assistant"; text: string; intent?: string; ts: number };

const buffer: Turn[] = [];
const MAX = 30;

export function shortTermPush(turn: Omit<Turn, "ts"> & { ts?: number }): void {
  buffer.push({ ...turn, ts: turn.ts ?? Date.now() });
  while (buffer.length > MAX) buffer.shift();
}

export function shortTermRecentVenueIds(): string[] {
  const ids: string[] = [];
  for (const t of buffer) {
    const m = t.text.match(/venue[_-]?id["':\s]+([a-z0-9-]+)/gi);
    if (m) ids.push(...m.map((x) => x.split(/["']/)[1] ?? "").filter(Boolean));
  }
  return [...new Set(ids)].slice(-12);
}

export function shortTermSnapshot(): Turn[] {
  return [...buffer];
}

export function shortTermRecordIntentSummary(intent: string, keywords: string[]): void {
  shortTermPush({
    role: "assistant",
    text: `intent:${intent} keywords:${keywords.join(",")}`,
  });
}

export function shortTermNoteStructured(kind: MemoryEventKind, note: string): void {
  shortTermPush({ role: "assistant", text: `${kind}:${note}` });
}
