"use client";

import { motion } from "framer-motion";
import { softSpring } from "@/lib/motion";

export function StepProgress({ step, total }: { step: number; total: number }) {
  const pct = Math.min(1, step / Math.max(1, total));
  return (
    <div className="mb-saheli-24 h-1.5 overflow-hidden rounded-pill bg-champagne-100">
      <motion.div
        className="h-full rounded-pill bg-gradient-to-r from-champagne-400 to-rose-300"
        animate={{ width: `${Math.round(pct * 100)}%` }}
        transition={softSpring}
      />
    </div>
  );
}
