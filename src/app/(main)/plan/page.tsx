"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { ai } from "@/lib/ai";
import type { PlanMessage, PlanRichCard, PlanWorkspaceSlot, SavedPlan } from "@/lib/types";
import { usePreferencesStore } from "@/store/preferences";
import { appendAssistantMessage, appendUserMessage, newEmptyPlan, usePlansStore } from "@/store/plans";
import { createId } from "@/lib/id";
import { loadMemoryState } from "@/lib/memory";
import { PlanChat } from "@/components/plan/PlanChat";
import { PlanWorkspace } from "@/components/plan/PlanWorkspace";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/store/ui";

function fireAnalyticsEvent(type: "ai_plan" | "ai_plan_error"): void {
  if (typeof window === "undefined") return;
  const sid = sessionStorage.getItem("saheli_sid") ?? undefined;
  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ type, sessionId: sid }),
  }).catch(() => {
    /* ignore */
  });
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-ink-muted">Opening planner…</div>}>
      <PlanPageInner />
    </Suspense>
  );
}

function PlanPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const prefs = usePreferencesStore((s) => s.preferences);
  const upsert = usePlansStore((s) => s.upsertPlan);
  const toast = useUiStore((s) => s.pushToast);
  const [memoryVenues, setMemoryVenues] = useState<string[]>([]);
  const [memoryThemes, setMemoryThemes] = useState<string[]>([]);
  const [current, setCurrent] = useState<SavedPlan | null>(null);
  const [planning, setPlanning] = useState(false);
  const [planningText, setPlanningText] = useState<string | null>(null);

  useEffect(() => {
    void loadMemoryState().then((m) => {
      setMemoryVenues(m.savedVenueIds);
      setMemoryThemes(m.savedThemeIds);
    });
  }, []);

  const runPlanner = useCallback(
    async (userText: string, base?: SavedPlan | null, signal?: AbortSignal) => {
      const planBase =
        base ??
        newEmptyPlan({
          title: "New gathering",
          city: prefs.city,
        });
      const withUser = appendUserMessage(planBase, userText);
      setCurrent(withUser);
      setPlanning(true);
      setPlanningText(null);
      let streamBuf = "";
      let res: Awaited<ReturnType<typeof ai.plan>>;
      try {
        res = await ai.plan(
          userText,
          {
            preferences: prefs,
            memorySavedVenueIds: memoryVenues,
            memorySavedThemeIds: memoryThemes,
          },
          {
            signal,
            onPlanEvent: (ev) => {
              if (ev.type === "compose:token" || ev.type === "render:token") {
                streamBuf += ev.text;
                setPlanningText(streamBuf);
              }
            },
          },
        );
        fireAnalyticsEvent("ai_plan");
      } catch (e) {
        fireAnalyticsEvent("ai_plan_error");
        setPlanning(false);
        setPlanningText(null);
        throw e;
      }
      setPlanning(false);
      setPlanningText(null);
      const assistantMsg: PlanMessage = {
        id: createId("msg"),
        role: "assistant",
        content: res.message,
        cards: res.cards,
        createdAt: Date.now(),
      };
      const next = appendAssistantMessage(withUser, assistantMsg);
      setCurrent(next);
      await upsert(next);
    },
    [memoryThemes, memoryVenues, prefs, upsert],
  );

  useEffect(() => {
    const p = params.get("prompt");
    if (!p) {
      queueMicrotask(() => {
        setCurrent((c) => c ?? newEmptyPlan({ title: "Your gathering", city: prefs.city }));
      });
      return;
    }
    const dedupeKey = `saheli-plan-seed:${p}`;
    if (sessionStorage.getItem(dedupeKey)) return;
    sessionStorage.setItem(dedupeKey, "1");
    queueMicrotask(() => {
      void runPlanner(p, null);
    });
  }, [params, prefs.city, runPlanner]);

  const slots: PlanWorkspaceSlot[] = useMemo(() => {
    const ws = current?.workspace;
    return [
      { key: "theme", label: "Theme", filled: Boolean(ws?.themeId), summary: ws?.themeId },
      { key: "venue", label: "Venue", filled: (ws?.venueIds?.length ?? 0) > 0, summary: ws?.venueIds?.length ? `${ws?.venueIds.length} pinned` : undefined },
      { key: "budget", label: "Budget", filled: Boolean(ws?.budget), summary: ws?.budget ? `₹${ws.budget.totalINR}` : undefined },
      { key: "games", label: "Games", filled: (ws?.gameIds?.length ?? 0) > 0, summary: ws?.gameIds?.length ? `${ws.gameIds.length} games` : undefined },
      { key: "invitation", label: "Invitation", filled: Boolean(ws?.invitation), summary: ws?.invitation ? "Ready" : undefined },
      { key: "timeline", label: "Timeline", filled: (ws?.timeline?.length ?? 0) > 0, summary: ws?.timeline?.length ? `${ws.timeline.length} beats` : undefined },
    ];
  }, [current]);

  async function onSend(text: string, signal?: AbortSignal) {
    await runPlanner(text, current, signal);
  }

  async function onPinCard(card: PlanRichCard) {
    if (!current) return;
    const pinned = new Set(current.pinnedCardIds);
    pinned.add(card.id);
    const ws = { ...current.workspace };
    if (card.type === "theme" && card.payload.theme) ws.themeId = card.payload.theme.id;
    if (card.type === "venues" && card.payload.venues) ws.venueIds = card.payload.venues.map((v) => v.id);
    if (card.type === "budget" && card.payload.budget) ws.budget = card.payload.budget;
    if (card.type === "games" && card.payload.games) ws.gameIds = card.payload.games.map((g) => g.id);
    if (card.type === "invitation" && card.payload.invitation) ws.invitation = card.payload.invitation;
    if (card.type === "timeline" && card.payload.timeline) ws.timeline = card.payload.timeline;
    const next: SavedPlan = {
      ...current,
      pinnedCardIds: [...pinned],
      workspace: ws,
      updatedAt: Date.now(),
    };
    setCurrent(next);
    await upsert(next);
    toast({ title: "Saved to workspace", description: card.title });
  }

  async function onSavePlan() {
    if (!current) return;
    const next = { ...current, updatedAt: Date.now(), title: current.title || "My gathering" };
    setCurrent(next);
    await upsert(next);
    toast({ title: "Plan saved", description: "Find it anytime under You." });
    router.push(`/plan/${next.id}`);
  }

  return (
    <motion.div variants={staggerChildren(0.04)} initial="hidden" animate="show" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <motion.div variants={fadeUp}>
        <PlanChat
          plan={current}
          onSend={onSend}
          onPinCard={onPinCard}
          planning={planning}
          planningText={planningText}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="soft" onClick={() => void onSend("Plan a monsoon kitty party for 12 women in Mumbai under 15000")}>
            Try monsoon Mumbai
          </Button>
          <Button size="sm" variant="ghost" onClick={() => void onSend("Games for 10 women, glam vibe, 2 hours")}>
            Glam games pack
          </Button>
        </div>
      </motion.div>
      <motion.div variants={fadeUp}>
        <PlanWorkspace
          slots={slots}
          onAsk={(slot) => {
            const hints: Record<PlanWorkspaceSlot["key"], string> = {
              theme: "Suggest a refined theme for my saved preferences",
              venue: "Suggest three venues that feel right for us",
              budget: "Show a gentle budget split for this plan",
              games: "Curate a playful game pack for our afternoon",
              invitation: "Draft invitation copy I can send today",
              timeline: "Outline a relaxed timeline for the day",
            };
            void onSend(hints[slot]);
          }}
        />
        <Button className="mt-4 w-full" onClick={() => void onSavePlan()}>
          Save whole plan
        </Button>
      </motion.div>
    </motion.div>
  );
}
