import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

export function Slider({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="range"
      className={cn(
        "h-11 w-full cursor-pointer accent-champagne-600 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
