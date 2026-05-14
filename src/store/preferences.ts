import { create } from "zustand";
import type { GatheringIdea, UserPreferences, VibeTag } from "@/lib/types";
import { loadPreferences, savePreferences } from "@/lib/memory";
import { suggestGatheringIdeas } from "@/lib/engines/recommend";

const defaultPreferences = (): UserPreferences => ({
  name: "Priya",
  gatheringTypes: [],
  city: "Mumbai",
  budgetMin: 8000,
  budgetMax: 25000,
  groupSize: 10,
  vibes: ["cozy", "glam"],
  indoorVsOutdoor: "either",
  luxuryVsCasual: 0.55,
  maxTravelKm: 12,
  onboardingComplete: false,
});

interface PreferencesState {
  hydrated: boolean;
  preferences: UserPreferences;
  pendingIdeas: GatheringIdea[];
  setHydrated: (v: boolean) => void;
  hydrate: () => Promise<void>;
  patch: (p: Partial<UserPreferences>) => Promise<void>;
  clearPendingIdeas: () => void;
  completeOnboarding: () => Promise<GatheringIdea[]>;
  resetOnboarding: () => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  hydrated: false,
  preferences: defaultPreferences(),
  pendingIdeas: [],
  setHydrated: (v) => set({ hydrated: v }),
  hydrate: async () => {
    const loaded = await loadPreferences();
    set({
      preferences: loaded ?? defaultPreferences(),
      hydrated: true,
    });
  },
  patch: async (p) => {
    const next = { ...get().preferences, ...p };
    set({ preferences: next });
    await savePreferences(next);
  },
  clearPendingIdeas: () => set({ pendingIdeas: [] }),
  completeOnboarding: async () => {
    const ideas = suggestGatheringIdeas(get().preferences);
    const next = { ...get().preferences, onboardingComplete: true };
    set({ preferences: next, pendingIdeas: ideas });
    await savePreferences(next);
    return ideas;
  },
  resetOnboarding: async () => {
    const next = { ...defaultPreferences(), onboardingComplete: false };
    set({ preferences: next, pendingIdeas: [] });
    await savePreferences(next);
  },
}));

export function vibeLabel(v: VibeTag): string {
  const map: Record<VibeTag, string> = {
    cozy: "Cozy",
    glam: "Glam",
    traditional: "Traditional",
    playful: "Playful",
    boho: "Boho",
    luxe: "Luxe",
  };
  return map[v];
}
