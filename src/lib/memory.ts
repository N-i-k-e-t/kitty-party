import { get, set, del } from "idb-keyval";
import type { MemoryState, RecurringMember, SavedPlan, UserPreferences } from "@/lib/types";

const K = {
  preferences: "saheli/preferences",
  plans: "saheli/plans",
  memory: "saheli/memory",
} as const;

const defaultMemory: MemoryState = {
  savedVenueIds: [],
  savedThemeIds: [],
  recurringMembers: [],
};

export async function loadPreferences(): Promise<UserPreferences | null> {
  const v = await get<UserPreferences>(K.preferences);
  return v ?? null;
}

export async function savePreferences(p: UserPreferences): Promise<void> {
  await set(K.preferences, p);
}

export async function clearPreferences(): Promise<void> {
  await del(K.preferences);
}

export async function loadPlans(): Promise<SavedPlan[]> {
  const v = await get<SavedPlan[]>(K.plans);
  return Array.isArray(v) ? v : [];
}

export async function savePlans(plans: SavedPlan[]): Promise<void> {
  await set(K.plans, plans);
}

export async function loadMemoryState(): Promise<MemoryState> {
  const v = await get<MemoryState>(K.memory);
  if (!v) return { ...defaultMemory };
  return {
    savedVenueIds: v.savedVenueIds ?? [],
    savedThemeIds: v.savedThemeIds ?? [],
    recurringMembers: v.recurringMembers ?? [],
  };
}

export async function saveMemoryState(m: MemoryState): Promise<void> {
  await set(K.memory, m);
}

export async function toggleSavedVenue(id: string): Promise<MemoryState> {
  const m = await loadMemoryState();
  const has = m.savedVenueIds.includes(id);
  const savedVenueIds = has
    ? m.savedVenueIds.filter((x) => x !== id)
    : [...m.savedVenueIds, id];
  const next = { ...m, savedVenueIds };
  await saveMemoryState(next);
  return next;
}

export async function toggleSavedTheme(id: string): Promise<MemoryState> {
  const m = await loadMemoryState();
  const has = m.savedThemeIds.includes(id);
  const savedThemeIds = has
    ? m.savedThemeIds.filter((x) => x !== id)
    : [...m.savedThemeIds, id];
  const next = { ...m, savedThemeIds };
  await saveMemoryState(next);
  return next;
}

export async function upsertRecurringMember(member: RecurringMember): Promise<MemoryState> {
  const m = await loadMemoryState();
  const idx = m.recurringMembers.findIndex((r) => r.id === member.id);
  const recurringMembers =
    idx === -1
      ? [...m.recurringMembers, member]
      : m.recurringMembers.map((r, i) => (i === idx ? member : r));
  const next = { ...m, recurringMembers };
  await saveMemoryState(next);
  return next;
}

export async function removeRecurringMember(id: string): Promise<MemoryState> {
  const m = await loadMemoryState();
  const next = {
    ...m,
    recurringMembers: m.recurringMembers.filter((r) => r.id !== id),
  };
  await saveMemoryState(next);
  return next;
}
