"use client";

import { motion } from "framer-motion";
import { loaderShimmer } from "@/lib/motion";
import { cn } from "@/lib/cn";

export function Shimmer({ className }: { className?: string }) {
  return (
    <motion.div
      variants={loaderShimmer}
      initial="initial"
      animate="animate"
      className={cn("rounded-lg bg-gradient-to-r from-champagne-100 via-rose-100 to-lavender-100", className)}
      aria-hidden
    />
  );
}
