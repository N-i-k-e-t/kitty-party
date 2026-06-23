"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUpSoft, withReducedMotion } from "@/lib/motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { usePlansStore } from "@/store/plans";
import { themes } from "@/data/themes";

export function MemoriesRail() {
  const plans = usePlansStore((s) => s.plans);
  if (!plans.length) return null;
  return (
    <motion.section variants={withReducedMotion(fadeUpSoft)} initial="hidden" animate="show" className="mb-saheli-24">
      <SectionHeader
        title="Your stories"
        subtitle="Gatherings saved as memories"
        action={
          <Link href="/memories" className="caption font-semibold text-champagne-700 underline-offset-4 hover:underline">
            View all
          </Link>
        }
      />
      <div className="-mx-saheli-4 flex gap-saheli-12 overflow-x-auto px-saheli-4 pb-saheli-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
        {plans.slice(0, 6).map((p) => {
          const th = themes.find((t) => t.id === p.workspace.themeId);
          const cover = th?.heroImage;
          return (
            <Link key={p.id} href="/memories" className="snap-start">
              <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl border border-stroke-subtle shadow-elev-1">
                {cover ? <Image src={cover} alt="" fill className="object-cover" sizes="160px" /> : null}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 to-transparent" />
                <p className="absolute bottom-2 left-2 right-2 truncate font-display text-sm text-ivory-50">{p.title}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.section>
  );
}
