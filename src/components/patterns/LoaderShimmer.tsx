"use client";

import { motion } from "framer-motion";
import { loaderShimmer, withReducedMotion } from "@/lib/motion";
import { Shimmer } from "@/components/ui/Shimmer";

export function LoaderShimmer({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-saheli-16 py-saheli-32 text-center">
      <motion.div variants={withReducedMotion(loaderShimmer)} initial="initial" animate="animate" className="w-full max-w-xs space-y-2">
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-4/5" />
        <Shimmer className="h-3 w-3/5" />
      </motion.div>
      <p className="h-2 font-display text-ink-strong">{label}</p>
      <p className="body-sm text-ink-muted">Pulling venues, themes, and gentle budgets into bloom.</p>
    </div>
  );
}
