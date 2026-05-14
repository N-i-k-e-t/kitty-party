import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export function Tag({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-champagne-300/50 bg-champagne-100/60 px-saheli-8 py-0.5 caption text-ink-strong",
        className,
      )}
      {...props}
    />
  );
}
