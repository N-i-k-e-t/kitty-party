import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-champagne/40 bg-white/70 px-2 py-0.5 text-[11px] font-medium text-ink-muted min-h-8",
        className,
      )}
      {...props}
    />
  );
}
