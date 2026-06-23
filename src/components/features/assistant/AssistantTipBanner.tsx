"use client";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { AssistantQuickActions } from "@/components/features/assistant/AssistantQuickActions";

export function AssistantTipBanner({
  message,
  tone = "info",
  actions,
  className,
}: {
  message: string;
  tone?: "info" | "warning";
  actions?: { label: string; prompt: string }[];
  className?: string;
}) {
  return (
    <Card
      variant="raised"
      padding="md"
      className={cn(
        "mb-saheli-16 border-l-4 border-l-champagne-500",
        tone === "warning" && "border-l-warning-500 bg-warning-50/80",
        className,
      )}
      role="status"
    >
      <p className="body-sm text-ink-body">{message}</p>
      {actions?.length ? (
        <div className="mt-saheli-12">
          <AssistantQuickActions actions={actions} />
        </div>
      ) : null}
    </Card>
  );
}
