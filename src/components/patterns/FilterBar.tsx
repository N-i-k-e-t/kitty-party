"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function FilterBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "sticky z-20 -mx-saheli-4 mb-saheli-16 snap-x snap-mandatory overflow-x-auto bg-surface-canvas/90 px-saheli-4 py-saheli-12 backdrop-blur-md",
        "top-[calc(env(safe-area-inset-top)+56px)] md:top-[calc(env(safe-area-inset-top)+56px)] lg:top-0",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}
