"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpSoft, staggerChildrenPreset, withReducedMotion } from "@/lib/motion";
import { usePreferencesStore } from "@/store/preferences";
import { usePlansStore } from "@/store/plans";
import {
  loadMemoryState,
  toggleSavedTheme,
  toggleSavedVenue,
  upsertRecurringMember,
  removeRecurringMember,
} from "@/lib/memory";
import { createId } from "@/lib/id";
import type { MemoryState, RecurringMember } from "@/lib/types";
import { themes } from "@/data/themes";
import { venues } from "@/data/venues";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Tabs } from "@/components/ui/Tabs";
import { Slider } from "@/components/ui/Slider";
import { Switch } from "@/components/ui/Switch";
import { useUiStore } from "@/store/ui";
import { Sheet } from "@/components/ui/Sheet";

export default function YouPage() {
  const prefs = usePreferencesStore((s) => s.preferences);
  const patch = usePreferencesStore((s) => s.patch);
  const reset = usePreferencesStore((s) => s.resetOnboarding);
  const plans = usePlansStore((s) => s.plans);
  const hydratePlans = usePlansStore((s) => s.hydrate);
  const toast = useUiStore((s) => s.pushToast);
  const [memory, setMemory] = useState<MemoryState | null>(null);
  const [memberName, setMemberName] = useState("");
  const [memberEmoji, setMemberEmoji] = useState("✨");
  const [tab, setTab] = useState<"themes" | "venues" | "plans">("themes");
  const [editOpen, setEditOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(prefers-reduced-motion: reduce)").matches : false,
  );

  useEffect(() => {
    queueMicrotask(() => {
      void hydratePlans();
      void loadMemoryState().then(setMemory);
    });
    document.title = "Saheli — You";
  }, [hydratePlans]);

  async function refreshMem() {
    setMemory(await loadMemoryState());
  }

  if (!memory) {
    return <div className="py-saheli-40 text-center body-sm text-ink-muted">Loading your circle…</div>;
  }

  return (
    <motion.div variants={withReducedMotion(staggerChildrenPreset)} initial="hidden" animate="show" className="space-y-saheli-24 pb-saheli-24">
      <motion.section variants={withReducedMotion(fadeUpSoft)} className="flex flex-wrap items-start justify-between gap-saheli-12">
        <div>
          <h1 className="h-2 text-ink-strong">You</h1>
          <p className="body-sm mt-saheli-8 text-ink-muted">Profile, saved sparks, and preferences.</p>
          <div className="mt-saheli-12 flex flex-wrap gap-saheli-12">
            <Link href="/memories" className="caption font-semibold text-champagne-700 underline-offset-4 hover:underline">
              Memories
            </Link>
            <Link href="/groups" className="caption font-semibold text-champagne-700 underline-offset-4 hover:underline">
              Circles
            </Link>
          </div>
        </div>
        <Button type="button" size="sm" variant="ghost" onClick={() => setEditOpen(true)} aria-label="Edit profile">
          Edit
        </Button>
      </motion.section>
      <motion.section variants={withReducedMotion(fadeUpSoft)}>
        <Card variant="raised" padding="lg" className="flex flex-wrap items-center gap-saheli-16">
          <Avatar label={prefs.name} className="h-14 w-14 text-lg" />
          <div>
            <p className="title text-ink-strong">{prefs.name}</p>
            <p className="body-sm text-ink-muted">{prefs.city}</p>
          </div>
        </Card>
      </motion.section>
      <motion.section variants={withReducedMotion(fadeUpSoft)}>
        <Card variant="glass" padding="lg" className="space-y-saheli-16">
          <p className="label text-ink-muted">Preferences</p>
          <div>
            <p className="caption text-ink-muted">Budget window (min)</p>
            <Slider
              min={5000}
              max={200000}
              step={1000}
              value={prefs.budgetMin}
              onChange={(e) => void patch({ budgetMin: Number(e.target.value) })}
              aria-label="Minimum budget"
            />
          </div>
          <div>
            <p className="caption text-ink-muted">Group size</p>
            <Slider
              min={4}
              max={40}
              step={1}
              value={prefs.groupSize}
              onChange={(e) => void patch({ groupSize: Number(e.target.value) })}
              aria-label="Group size"
            />
            <p className="caption mt-1 text-ink-muted">Around {prefs.groupSize} guests</p>
          </div>
          <div>
            <p className="caption text-ink-muted">Travel distance (km)</p>
            <Slider
              min={2}
              max={80}
              step={1}
              value={prefs.maxTravelKm}
              onChange={(e) => void patch({ maxTravelKm: Number(e.target.value) })}
              aria-label="Maximum travel kilometers"
            />
          </div>
        </Card>
      </motion.section>
      <motion.section variants={withReducedMotion(fadeUpSoft)}>
        <Tabs
          tabs={[
            { id: "themes", label: "Themes" },
            { id: "venues", label: "Venues" },
            { id: "plans", label: "Plans" },
          ]}
          value={tab}
          onChange={(v) => setTab(v as typeof tab)}
        />
        <div className="mt-saheli-16 space-y-saheli-12">
          {tab === "themes" ? (
            <div className="flex flex-wrap gap-saheli-8">
              {themes.map((t) => {
                const on = memory.savedThemeIds.includes(t.id);
                return (
                  <Button
                    key={t.id}
                    size="sm"
                    variant={on ? "primary" : "glass"}
                    type="button"
                    onClick={async () => {
                      await toggleSavedTheme(t.id);
                      await refreshMem();
                      toast({ title: on ? "Removed theme" : "Saved theme" });
                    }}
                  >
                    {t.name}
                  </Button>
                );
              })}
            </div>
          ) : null}
          {tab === "venues" ? (
            <div className="flex flex-col gap-saheli-8">
              {venues.slice(0, 12).map((v) => {
                const on = memory.savedVenueIds.includes(v.id);
                return (
                  <Button
                    key={v.id}
                    size="sm"
                    variant={on ? "primary" : "ghost"}
                    className="w-full justify-start"
                    type="button"
                    onClick={async () => {
                      await toggleSavedVenue(v.id);
                      await refreshMem();
                    }}
                  >
                    {v.name} · {v.city}
                  </Button>
                );
              })}
            </div>
          ) : null}
          {tab === "plans" ? (
            <div className="space-y-saheli-8">
              {plans.length === 0 ? (
                <Card variant="flat" padding="md" className="body-sm text-ink-muted">
                  No plans yet — start in <Link className="font-medium text-ink-strong underline" href="/plan">Plan</Link>.
                </Card>
              ) : (
                plans.map((p) => (
                  <Link key={p.id} href={`/plan/${p.id}`}>
                    <Card variant="raised" padding="md" className="hover:shadow-elev-2">
                      <p className="title text-ink-strong">{p.title}</p>
                      <p className="caption text-ink-muted">{p.city}</p>
                    </Card>
                  </Link>
                ))
              )}
            </div>
          ) : null}
        </div>
      </motion.section>
      <motion.section variants={withReducedMotion(fadeUpSoft)}>
        <Card variant="gradient" padding="lg" className="space-y-saheli-12">
          <p className="label text-ink-muted">Recurring circle (quick tags)</p>
          <p className="caption text-ink-muted">
            For full RSVPs and votes, visit <Link href="/groups" className="font-semibold text-ink-strong underline">Circles</Link>.
          </p>
          <div className="flex flex-wrap gap-saheli-8">
            {memory.recurringMembers.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={async () => {
                  await removeRecurringMember(m.id);
                  await refreshMem();
                }}
                className="flex items-center gap-2 rounded-full border border-stroke-subtle bg-surface-raised px-saheli-12 py-saheli-8 caption"
              >
                <span>{m.avatarEmoji}</span>
                <span>{m.name}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-saheli-8">
            <Input value={memberEmoji} onChange={(e) => setMemberEmoji(e.target.value)} className="w-16" placeholder="✨" />
            <Input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Friend name" className="min-w-[120px] flex-1" />
            <Button
              type="button"
              onClick={async () => {
                if (!memberName.trim()) return;
                const member: RecurringMember = {
                  id: createId("mem"),
                  name: memberName.trim(),
                  avatarEmoji: memberEmoji.trim() || "✨",
                };
                await upsertRecurringMember(member);
                setMemberName("");
                await refreshMem();
              }}
            >
              Add
            </Button>
          </div>
        </Card>
      </motion.section>
      <motion.section variants={withReducedMotion(fadeUpSoft)}>
        <Card variant="flat" padding="lg" className="space-y-saheli-16">
          <p className="label text-ink-muted">Account</p>
          <div className="flex flex-wrap items-center justify-between gap-saheli-12">
            <span className="body-sm text-ink-body">Theme: Light</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-saheli-12">
            <span className="body-sm text-ink-body">Reduced motion (preview)</span>
            <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} id="rm" aria-label="Reduced motion preview" />
          </div>
          <Button variant="ghost" type="button" className="w-full" onClick={() => void reset()}>
            Replay onboarding
          </Button>
        </Card>
      </motion.section>
      <Sheet open={editOpen} onClose={() => setEditOpen(false)}>
        <div className="p-saheli-24">
          <p className="title text-ink-strong">Edit profile</p>
          <div className="mt-saheli-16 space-y-saheli-12">
            <Input value={prefs.name} onChange={(e) => void patch({ name: e.target.value })} aria-label="Name" />
            <Input value={prefs.city} onChange={(e) => void patch({ city: e.target.value })} aria-label="City" />
            <Button type="button" className="w-full" onClick={() => setEditOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Sheet>
    </motion.div>
  );
}
