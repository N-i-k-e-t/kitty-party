import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function Pill({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-pill border border-stroke-subtle bg-surface-raised px-saheli-8 py-0.5 caption text-ink-body min-h-9",
        className,
      )}
      {...props}
    />
  );
}
