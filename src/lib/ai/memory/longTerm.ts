import { get, set } from "idb-keyval";
import type { MemoryEvent, MemoryQuery } from "@/lib/ai/memory/types";
import { embedText } from "@/lib/ai/memory/embeddings";
import { embedHash } from "@/lib/ai/embedHash";

const EVENTS_KEY = "saheli.memory.events";

function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

async function loadEvents(): Promise<MemoryEvent[]> {
  const v = await get<MemoryEvent[]>(EVENTS_KEY);
  return Array.isArray(v) ? v : [];
}

export async function recordLongTerm(event: Omit<MemoryEvent, "id" | "ts"> & { id?: string }): Promise<void> {
  const list = await loadEvents();
  const row: MemoryEvent = {
    id: event.id ?? `ev_${Math.random().toString(36).slice(2, 10)}`,
    ts: Date.now(),
    kind: event.kind,
    payload: event.payload,
    embedding: event.embedding,
  };
  list.push(row);
  const trimmed = list.slice(-400);
  await set(EVENTS_KEY, trimmed);
}

export async function recallLongTerm(query: MemoryQuery): Promise<MemoryEvent[]> {
  const k = query.k ?? 5;
  const list = await loadEvents();
  if (!list.length) return [];
  let qVec: number[];
  try {
    qVec = await embedText(query.text);
  } catch {
    qVec = embedHash(query.text, 64);
  }
  const scored = list
    .filter((e) => e.embedding && e.embedding.length === qVec.length)
    .map((e) => ({ e, s: cosine(qVec, e.embedding!) }))
    .sort((a, b) => b.s - a.s);
  const withEmb = scored.slice(0, k).map((x) => x.e);
  if (withEmb.length >= k) return withEmb;
  const rest = list.filter((e) => !withEmb.includes(e)).slice(-(k - withEmb.length));
  return [...withEmb, ...rest];
}
