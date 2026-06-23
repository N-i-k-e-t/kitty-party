import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

const map = {
  dawn: "gradient-dawn",
  "champagne-veil": "gradient-champagne-veil",
  "lavender-mist": "gradient-lavender-mist",
} as const;

export function GradientBackdrop({
  variant,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { variant: keyof typeof map }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 -z-10 opacity-90", map[variant], className)}
      {...props}
    />
  );
}
