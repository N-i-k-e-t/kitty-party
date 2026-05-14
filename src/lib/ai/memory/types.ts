export type MemoryEventKind =
  | "plan_saved"
  | "venue_viewed"
  | "preference_patch"
  | "ranker_decision"
  | "chat_turn";

export interface MemoryEvent {
  id: string;
  ts: number;
  kind: MemoryEventKind;
  payload: Record<string, unknown>;
  embedding?: number[];
}

export interface MemoryQuery {
  text: string;
  k?: number;
}
