import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function PageShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-2xl sm:max-w-2xl md:max-w-4xl lg:max-w-6xl min-h-[100dvh] px-saheli-16 pb-[calc(env(safe-area-inset-bottom)+5.5rem)] pt-saheli-16 sm:px-saheli-24 sm:pb-saheli-24 lg:pb-saheli-24 lg:pl-saheli-16",
        className,
      )}
    >
      {children}
    </div>
  );
}
