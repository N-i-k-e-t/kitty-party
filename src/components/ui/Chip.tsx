"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { softSpring } from "@/lib/motion";

export type ChipProps = Omit<HTMLMotionProps<"button">, "whileHover" | "whileTap" | "transition">;

export function Chip({ className, ...props }: ChipProps) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={softSpring}
      className={cn(
        "rounded-full border border-champagne/40 bg-white/60 px-3 py-1.5 text-xs font-medium text-ink shadow-sm backdrop-blur-md",
        className,
      )}
      type="button"
      {...props}
    />
  );
}
