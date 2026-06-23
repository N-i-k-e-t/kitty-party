import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function IconButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-stroke-subtle bg-surface-raised text-ink-body transition-colors hover:bg-surface-glass focus-visible:outline-none",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
