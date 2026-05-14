import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-champagne/35 bg-white/70 px-3 text-sm text-ink shadow-inner outline-none ring-0 placeholder:text-ink-muted/70 focus:border-champagne-deep focus:bg-white",
        className,
      )}
      {...props}
    />
  );
}
