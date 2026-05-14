"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { softSpring } from "@/lib/motion";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-deep disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-champagne to-champagne-deep text-ink shadow-lift hover:brightness-105",
        ghost: "bg-transparent text-ink hover:bg-white/50",
        soft: "bg-rose/40 text-ink hover:bg-rose/55",
        glass: "glass-panel text-ink hover:bg-white/60",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-4 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export type ButtonProps = Omit<HTMLMotionProps<"button">, "whileTap" | "transition"> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      transition={softSpring}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
