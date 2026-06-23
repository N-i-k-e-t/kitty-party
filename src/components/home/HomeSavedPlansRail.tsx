"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { usePlansStore } from "@/store/plans";

export function HomeSavedPlansRail() {
  const plans = usePlansStore((s) => s.plans);
  if (!plans.length) {
    return (
      <motion.section variants={fadeUp} initial="hidden" animate="show" className="mb-10">
        <SectionHeader title="Your plans" subtitle="Saved gatherings will land here" />
        <Card variant="gradient" padding="lg" className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-xl">
            ✿
          </div>
          <p className="text-sm text-ink-muted">No saved plans yet — your first sparkle is a tap away in Plan.</p>
          <Link href="/plan" className="mt-3 inline-block text-sm font-semibold text-ink underline-offset-4 hover:underline">
            Open planner
          </Link>
        </Card>
      </motion.section>
    );
  }
  return (
    <motion.section variants={staggerChildren(0.05)} initial="hidden" animate="show" className="mb-10">
      <SectionHeader title="Your plans" subtitle="Recently saved" />
      <div className="-mx-1 flex gap-3 overflow-x-auto pb-1">
        {plans.slice(0, 8).map((p) => (
          <motion.div key={p.id} variants={fadeUp} className="w-[220px] shrink-0">
            <Link href={`/plan/${p.id}`}>
              <Card variant="glass" padding="md" className="h-full hover:-translate-y-0.5 hover:shadow-lift">
                <p className="font-serif text-sm font-semibold text-ink">{p.title}</p>
                <p className="mt-1 text-[11px] text-ink-muted">{p.city}</p>
                <p className="mt-3 text-[11px] text-ink-muted">
                  {new Date(p.updatedAt).toLocaleDateString()}
                </p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
