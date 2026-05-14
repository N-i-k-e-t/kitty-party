"use client";

import { useEffect } from "react";
import { ensureGroupsSeeded } from "@/lib/groups";
import { usePreferencesStore } from "@/store/preferences";
import { usePlansStore } from "@/store/plans";

export function HydrateStores() {
  const hydratePrefs = usePreferencesStore((s) => s.hydrate);
  const hydratePlans = usePlansStore((s) => s.hydrate);
  useEffect(() => {
    void (async () => {
      await hydratePrefs();
      await hydratePlans();
      await ensureGroupsSeeded();
      await hydratePlans();
    })();
  }, [hydratePrefs, hydratePlans]);
  return null;
}
