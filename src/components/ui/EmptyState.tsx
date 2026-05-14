import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-stroke-subtle bg-surface-raised/60 px-saheli-24 py-saheli-32 text-center",
        className,
      )}
    >
      {icon ? <div className="mb-saheli-12 text-champagne-600">{icon}</div> : null}
      <p className="title text-ink-strong">{title}</p>
      {description ? <p className="body-sm mt-saheli-8 max-w-sm text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-saheli-16">{action}</div> : null}
    </div>
  );
}
