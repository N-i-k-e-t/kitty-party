import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function PinterestGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "columns-2 gap-saheli-12 sm:columns-3 [column-fill:_balance]",
        className,
      )}
    >
      {children}
    </div>
  );
}
