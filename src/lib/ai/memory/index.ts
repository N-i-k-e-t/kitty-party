import { loadMemoryState } from "@/lib/memory";
import { readMediumTermPreferences } from "@/lib/ai/memory/mediumTerm";
import {
  recordLongTerm as recordLt,
  recallLongTerm as recallLt,
} from "@/lib/ai/memory/longTerm";
import { memoryBrief } from "@/lib/ai/memory/summarize";
import type { MemoryEvent, MemoryQuery } from "@/lib/ai/memory/types";

export const memory = {
  record: recordLt,
  recall: recallLt,
  brief: memoryBrief,
  recurringMembers: async () => (await loadMemoryState()).recurringMembers,
  savedVenues: async () => (await loadMemoryState()).savedVenueIds,
  preferences: readMediumTermPreferences,
};

export type { MemoryEvent, MemoryQuery };
