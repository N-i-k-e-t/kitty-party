import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const surfaceVariants = cva("rounded-2xl border", {
  variants: {
    elevation: {
      0: "border-stroke-subtle bg-surface-canvas",
      1: "border-stroke-subtle bg-surface-raised shadow-elev-1",
      2: "border-stroke-strong/20 bg-surface-raised shadow-elev-2",
      3: "border-stroke-subtle bg-ivory-50 shadow-elev-3",
    },
  },
  defaultVariants: { elevation: 1 },
});

export interface SurfaceProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {}

export function Surface({ className, elevation, ...props }: SurfaceProps) {
  return <div className={cn(surfaceVariants({ elevation }), className)} {...props} />;
}
