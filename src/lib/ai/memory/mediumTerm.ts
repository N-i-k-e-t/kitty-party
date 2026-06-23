import type { UserPreferences } from "@/lib/types";
import { usePreferencesStore } from "@/store/preferences";

export function readMediumTermPreferences(): UserPreferences {
  if (typeof window === "undefined") {
    return {
      name: "Guest",
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
    };
  }
  return usePreferencesStore.getState().preferences;
}
