"use client";

import { useMemo, useState } from "react";
import type { BudgetResult } from "@/lib/types";
import { generateBudget } from "@/lib/engines/budget";
import { Progress } from "@/components/ui/Progress";
import { Button } from "@/components/ui/Button";
import { usePreferencesStore } from "@/store/preferences";

export function BudgetBreakdown({ data }: { data: BudgetResult }) {
  const [mode, setMode] = useState<BudgetResult["mode"]>(data.mode);
  const prefsVibes = usePreferencesStore((s) => s.preferences.vibes);
  const merged = useMemo(
    () =>
      mode === data.mode
        ? data
        : generateBudget(data.totalINR, data.groupSize, prefsVibes.length ? prefsVibes : ["cozy"], {
            mode,
          }),
    [data, mode, prefsVibes],
  );
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant={mode === "cheaper" ? "primary" : "ghost"} type="button" onClick={() => setMode("cheaper")}>
          Cheaper mix
        </Button>
        <Button size="sm" variant={mode === "balanced" ? "primary" : "ghost"} type="button" onClick={() => setMode("balanced")}>
          Balanced
        </Button>
        <Button size="sm" variant={mode === "premium" ? "primary" : "ghost"} type="button" onClick={() => setMode("premium")}>
          Premium glow
        </Button>
      </div>
      <p className="text-xs text-ink-muted">Per head ~ ₹{merged.perHeadINR}</p>
      {merged.lines.map((l) => (
        <div key={l.key}>
          <div className="mb-1 flex justify-between text-[11px] text-ink-muted">
            <span>{l.label}</span>
            <span>₹{l.amountINR.toLocaleString("en-IN")}</span>
          </div>
          <Progress value={l.percent} />
        </div>
      ))}
    </div>
  );
}
