import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-saheli-12 flex items-end justify-between gap-saheli-12", className)}>
      <div>
        <h2 className="h-3 text-ink-strong">{title}</h2>
        {subtitle ? <p className="body-sm mt-0.5 text-ink-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
