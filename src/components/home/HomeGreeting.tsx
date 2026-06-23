"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { usePreferencesStore } from "@/store/preferences";
import { greetingFor, getDayPart } from "@/lib/context/time";

export function HomeGreeting() {
  const name = usePreferencesStore((s) => s.preferences.name);
  const part = getDayPart();
  return (
    <motion.section variants={staggerChildren()} initial="hidden" animate="show" className="mb-6">
      <motion.div variants={fadeUp}>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-ink-muted">Today</p>
        <h1 className="mt-1 font-serif text-2xl font-semibold text-balance text-ink sm:text-3xl">
          {greetingFor(part)}, {name} — what shall we plan today?
        </h1>
      </motion.div>
    </motion.section>
  );
}
