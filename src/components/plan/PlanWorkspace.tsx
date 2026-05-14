"use client";

import { Card } from "@/components/ui/Card";
import type { PlanWorkspaceSlot } from "@/lib/types";

export function PlanWorkspace({
  slots,
  onAsk,
}: {
  slots: PlanWorkspaceSlot[];
  onAsk: (slot: PlanWorkspaceSlot["key"]) => void;
}) {
  return (
    <Card variant="elevated" padding="md" className="lg:sticky lg:top-24">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">Workspace</p>
      <h3 className="mt-1 font-serif text-base font-semibold text-ink">Assembled plan</h3>
      <div className="mt-3 space-y-2">
        {slots.map((s) => (
          <button
            type="button"
            key={s.key}
            onClick={() => onAsk(s.key)}
            className="flex w-full items-center justify-between rounded-2xl border border-champagne/25 bg-white/70 px-3 py-2 text-left text-sm transition hover:border-champagne-deep/50"
          >
            <span>
              <span className="font-medium text-ink">{s.label}</span>
              {s.summary ? <span className="ml-2 text-xs text-ink-muted">{s.summary}</span> : null}
            </span>
            <span className="text-[11px] text-ink-muted">{s.filled ? "●" : "○"}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-ink-muted">Tap a row to ask me to fill or refresh it.</p>
    </Card>
  );
}
