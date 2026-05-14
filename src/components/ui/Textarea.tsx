import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-[96px] w-full rounded-xl border border-champagne/35 bg-white/70 px-3 py-2 text-sm text-ink shadow-inner outline-none placeholder:text-ink-muted/70 focus:border-champagne-deep focus:bg-white",
        className,
      )}
      {...props}
    />
  );
}
