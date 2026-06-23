"use client";

import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { ReactNode } from "react";
import { staggerChildrenPreset, withReducedMotion } from "@/lib/motion";

export function StaggerList({
  children,
  className,
  variants = staggerChildrenPreset,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
}) {
  return (
    <motion.div variants={withReducedMotion(variants)} initial="hidden" animate="show" className={className}>
      {children}
    </motion.div>
  );
}
