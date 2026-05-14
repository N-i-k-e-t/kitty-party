import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function Stat({
  label,
  value,
  className,
}: {
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="label text-ink-muted">{label}</span>
      <span className="body-sm font-medium text-ink-strong">{value}</span>
    </div>
  );
}
