"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpSoft, withReducedMotion } from "@/lib/motion";
import { Card } from "@/components/ui/Card";
import { getSeasonalContext } from "@/lib/context/seasonal";

export function SeasonalCard() {
  const ctx = getSeasonalContext();
  return (
    <motion.section variants={withReducedMotion(fadeUpSoft)} initial="hidden" animate="show" className="mb-saheli-24">
      <Card variant="glass" padding="lg" className="relative min-h-[168px] overflow-hidden border-stroke-subtle">
        <div className="pointer-events-none absolute inset-0 gradient-lavender-mist opacity-90" aria-hidden />
        <div className="relative z-10 max-w-xl">
          <p className="label text-ink-muted">Seasonal glow</p>
          <h3 className="h-3 mt-saheli-8 text-ink-strong">{ctx.headline}</h3>
          <p className="body-sm mt-saheli-8 text-ink-muted">{ctx.subcopy}</p>
          <Link
            href="/plan"
            className="mt-saheli-16 inline-flex h-11 items-center justify-center rounded-xl bg-rose-200/80 px-saheli-16 text-sm font-medium text-ink-strong shadow-elev-1 hover:bg-rose-200"
          >
            Open planner
          </Link>
        </div>
        <div className="pointer-events-none absolute -right-6 -top-10 h-48 w-48 opacity-90 sm:h-56 sm:w-56">
          <Image src={ctx.heroImage} alt="" fill className="object-cover" sizes="224px" />
        </div>
      </Card>
    </motion.section>
  );
}
