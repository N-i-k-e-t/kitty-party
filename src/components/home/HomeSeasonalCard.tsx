"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { Card } from "@/components/ui/Card";
import { getSeasonalContext } from "@/lib/context/seasonal";

export function HomeSeasonalCard() {
  const ctx = getSeasonalContext();
  return (
    <motion.section variants={fadeUp} initial="hidden" animate="show" className="mb-6">
      <Card variant="gradient" padding="lg" className="relative min-h-[160px] overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">Seasonal glow</p>
          <h3 className="mt-2 font-serif text-xl font-semibold text-ink">{ctx.headline}</h3>
          <p className="mt-2 text-sm text-ink-muted">{ctx.subcopy}</p>
        </div>
        <div className="pointer-events-none absolute -right-6 -top-10 h-48 w-48 opacity-90 sm:h-56 sm:w-56">
          <Image src={ctx.heroImage} alt="" fill className="object-cover" sizes="224px" />
        </div>
      </Card>
    </motion.section>
  );
}
