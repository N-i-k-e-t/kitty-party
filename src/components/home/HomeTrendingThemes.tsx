"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpSoft, staggerChildrenPreset, withReducedMotion } from "@/lib/motion";
import { themes } from "@/data/themes";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { PinterestGrid } from "@/components/patterns/PinterestGrid";

export function TrendingThemesGrid() {
  const slice = themes.slice(0, 6);
  return (
    <motion.section
      variants={withReducedMotion(staggerChildrenPreset)}
      initial="hidden"
      animate="show"
      className="mb-saheli-24"
    >
      <SectionHeader title="Trending themes" subtitle="Pinterest-soft, planner-sharp" />
      <PinterestGrid>
        {slice.map((t) => (
          <motion.div key={t.id} variants={withReducedMotion(fadeUpSoft)} className="mb-saheli-12 break-inside-avoid">
            <Link href={`/plan?prompt=${encodeURIComponent(`Theme ideas for ${t.name}`)}`}>
              <Card variant="glass" padding="sm" className="group overflow-hidden">
                <div className="relative h-28 w-full overflow-hidden rounded-xl">
                  <Image src={t.heroImage} alt={t.name} fill className="object-cover transition duration-500 group-hover:scale-105" sizes="200px" />
                </div>
                <p className="title mt-saheli-8 px-0.5 text-ink-strong">{t.name}</p>
                <p className="caption px-0.5 text-ink-muted line-clamp-2">{t.dressCode}</p>
              </Card>
            </Link>
          </motion.div>
        ))}
      </PinterestGrid>
    </motion.section>
  );
}
