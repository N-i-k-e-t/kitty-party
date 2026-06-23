"use client";

import { motion } from "framer-motion";
import { fadeUpSoft, staggerChildrenPreset, withReducedMotion } from "@/lib/motion";
import { Avatar } from "@/components/ui/Avatar";
import { usePreferencesStore } from "@/store/preferences";
import { greetingFor, getDayPart } from "@/lib/context/time";

export function HeroGreeting({
  variant = "home",
}: {
  variant?: "home" | "circles";
}) {
  const name = usePreferencesStore((s) => s.preferences.name);
  const part = getDayPart();
  const greet = greetingFor(part);
  const title =
    variant === "circles"
      ? "Your circles"
      : `${greet}, ${name}`;
  const subtitle =
    variant === "circles"
      ? "Where RSVPs, votes, and soft memories gather."
      : "What shall we plan today?";

  return (
    <motion.section
      variants={withReducedMotion(staggerChildrenPreset)}
      initial="hidden"
      animate="show"
      className="mb-0"
    >
      <motion.div variants={withReducedMotion(fadeUpSoft)} className="flex items-start gap-saheli-16">
        <Avatar label={name} className="h-12 w-12 shrink-0 text-base" />
        <div className="min-w-0 flex-1 space-y-saheli-6">
          <p className="label text-ink-muted">Today</p>
          <div className="space-y-saheli-10">
            <h1 className="h-2 text-balance text-ink-strong">{title}</h1>
            <p className="body-sm leading-relaxed text-ink-muted">{subtitle}</p>
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
