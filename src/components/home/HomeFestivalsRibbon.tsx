"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { getUpcomingFestivals } from "@/lib/context/seasonal";
import { Badge } from "@/components/ui/Badge";

export function HomeFestivalsRibbon() {
  const upcoming = getUpcomingFestivals(new Date(), 3);
  return (
    <motion.section variants={staggerChildren(0.05)} initial="hidden" animate="show" className="mb-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">Upcoming festivals</p>
      <div className="flex flex-wrap gap-2">
        {upcoming.map((f) => (
          <motion.div key={f.id} variants={fadeUp}>
            <Badge className="border-champagne/50 bg-white/80 px-3 py-1 text-xs text-ink">
              {f.name}
              {f.regionNote ? <span className="text-ink-muted"> · {f.regionNote}</span> : null}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
