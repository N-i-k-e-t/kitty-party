"use client";

import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

export function Switch({
  className,
  checked,
  onCheckedChange,
  id,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  onCheckedChange?: (v: boolean) => void;
}) {
  return (
    <label htmlFor={id} className={cn("relative inline-flex h-7 w-12 cursor-pointer items-center", className)}>
      <input
        id={id}
        type="checkbox"
        role="switch"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
      <span className="absolute inset-0 rounded-pill border border-stroke-subtle bg-surface-raised transition-colors peer-checked:bg-champagne-300 peer-focus-visible:ring-2 peer-focus-visible:ring-champagne-500/40" />
      <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-ivory-50 shadow-elev-1 transition-transform peer-checked:translate-x-5" />
    </label>
  );
}
