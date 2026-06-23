"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { Chip } from "@/components/ui/Chip";
import { SectionHeader } from "@/components/ui/SectionHeader";

const chips = [
  "Plan monsoon kitty",
  "Games for 12 women",
  "Budget brunch ideas",
  "Luxury rooftop meetup",
  "Indoor rainy-day plans",
];

export function HomeSuggestionChips() {
  const router = useRouter();
  return (
    <motion.section variants={staggerChildren(0.05)} initial="hidden" animate="show" className="mb-6">
      <SectionHeader title="Soft suggestions" subtitle="Tap to open your planner" />
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1">
        {chips.map((c) => (
          <motion.div key={c} variants={fadeUp} className="shrink-0">
            <Chip onClick={() => router.push(`/plan?prompt=${encodeURIComponent(c)}`)}>{c}</Chip>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
