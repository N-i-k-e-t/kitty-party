"use client";

import { useEffect } from "react";
import { ensureGroupsSeeded } from "@/lib/groups";
import { usePreferencesStore } from "@/store/preferences";
import { usePlansStore } from "@/store/plans";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("saheli_sid");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("saheli_sid", id);
  }
  return id;
}

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem("saheli_ping_ok") === "1") return;
    const sid = getOrCreateSessionId();
    if (!sid) return;
    void fetch("/api/analytics/ping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ sessionId: sid }),
    })
      .then((r) => {
        if (r.ok) sessionStorage.setItem("saheli_ping_ok", "1");
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  return null;
}
