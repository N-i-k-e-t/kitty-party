"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUpSoft, staggerChildrenPreset, withReducedMotion } from "@/lib/motion";
import { usePlansStore } from "@/store/plans";
import { usePreferencesStore } from "@/store/preferences";
import { buildMemoryTimeline, groupTimelineByMonth } from "@/lib/memories";
import { loadGroupsBundle } from "@/lib/groups";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SoftIllustration } from "@/components/ui/SoftIllustration";

export default function MemoriesPage() {
  const plans = usePlansStore((s) => s.plans);
  const ideas = usePreferencesStore((s) => s.pendingIdeas);
  const hydrate = usePlansStore((s) => s.hydrate);
  const [groupLinks, setGroupLinks] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    void hydrate();
    document.title = "Saheli — Memories";
    void loadGroupsBundle().then((b) =>
      setGroupLinks(b.circles.slice(0, 4).map((c) => ({ id: c.id, name: c.name }))),
    );
  }, [hydrate]);

  const entries = useMemo(() => buildMemoryTimeline(plans, ideas), [plans, ideas]);
  const grouped = useMemo(() => groupTimelineByMonth(entries), [entries]);
  const hero = entries[0];

  if (!entries.length) {
    return (
      <div className="space-y-saheli-24">
        <header className="rounded-2xl border border-stroke-subtle gradient-morning-tea px-saheli-24 py-saheli-32">
          <h1 className="h-2 text-ink-strong">Your stories</h1>
        </header>
        <EmptyState
          title="Your gatherings will live here — make your first one ✿"
          description="Save a plan or finish onboarding to see your timeline bloom."
          icon={<SoftIllustration name="spark" className="h-14 w-14" />}
          action={
            <Link href="/plan" className="body-sm font-semibold text-champagne-700 underline">
              Open planner
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <motion.div variants={withReducedMotion(staggerChildrenPreset)} initial="hidden" animate="show" className="space-y-saheli-24">
      <motion.header variants={withReducedMotion(fadeUpSoft)} className="rounded-2xl border border-stroke-subtle gradient-morning-tea px-saheli-24 py-saheli-32">
        <h1 className="h-2 text-ink-strong">Your stories</h1>
        <p className="body-sm mt-saheli-8 text-ink-muted">Memories from plans and sparks.</p>
      </motion.header>
      {hero ? (
        <motion.div variants={withReducedMotion(fadeUpSoft)}>
          <Card variant="raised" padding="sm" className="overflow-hidden p-0">
            <div className="relative aspect-[21/9] min-h-[140px] w-full">
              <Image src={hero.coverImage} alt="" fill className="object-cover" sizes="960px" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-900/55 to-transparent" />
              <div className="absolute bottom-saheli-16 left-saheli-16 right-saheli-16">
                <p className="caption text-ivory-100/90">Latest</p>
                <p className="h-2 text-ivory-50">{hero.title}</p>
                <p className="body-sm mt-saheli-8 text-ivory-100/90">{hero.caption}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ) : null}
      {groupLinks.length ? (
        <motion.section variants={withReducedMotion(fadeUpSoft)} className="space-y-saheli-8">
          <p className="title text-ink-strong">Recurring circles</p>
          <div className="-mx-saheli-4 flex gap-saheli-12 overflow-x-auto px-saheli-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {groupLinks.map((g) => (
              <Link key={g.id} href={`/groups/${g.id}`} className="shrink-0 rounded-full border border-stroke-subtle bg-surface-raised px-saheli-16 py-saheli-8 body-sm text-ink-body">
                {g.name}
              </Link>
            ))}
          </div>
        </motion.section>
      ) : null}
      {[...grouped.entries()].map(([month, items]) => (
        <motion.section key={month} variants={withReducedMotion(fadeUpSoft)} className="space-y-saheli-12">
          <h2 className="h-3 text-ink-strong">{month}</h2>
          <div className="space-y-saheli-12">
            {items.map((e) => (
              <Link key={e.id} href={e.planId ? `/plan/${e.planId}` : "/plan"}>
                <Card variant="glass" padding="md" className="flex gap-saheli-12">
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg">
                    <Image src={e.coverImage} alt="" fill className="object-cover" sizes="96px" />
                  </div>
                  <div className="min-w-0">
                    <p className="title text-ink-strong">{e.title}</p>
                    <p className="caption text-ink-muted">{e.themeName}</p>
                    <p className="body-sm mt-saheli-8 line-clamp-2 text-ink-muted">{e.caption}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </motion.section>
      ))}
    </motion.div>
  );
}
