import type { BudgetLine, BudgetResult, VibeTag } from "@/lib/types";

const keys = [
  { key: "venue", label: "Venue & seating" },
  { key: "food", label: "Food & beverages" },
  { key: "decor", label: "Décor & florals" },
  { key: "games", label: "Games & entertainment" },
  { key: "invite", label: "Invitations & keepsakes" },
  { key: "buffer", label: "Contingency" },
] as const;

function weightsFor(vibe: VibeTag[], mode: BudgetResult["mode"], groupSize: number): number[] {
  const luxe = vibe.includes("luxe") || vibe.includes("glam");
  const casual = vibe.includes("cozy") || vibe.includes("playful");
  let base = [0.28, 0.32, 0.14, 0.1, 0.06, 0.1];
  if (luxe) base = [0.26, 0.26, 0.22, 0.1, 0.06, 0.1];
  if (casual && !luxe) base = [0.22, 0.38, 0.12, 0.12, 0.06, 0.1];
  if (mode === "cheaper") base = [0.2, 0.4, 0.1, 0.12, 0.05, 0.13];
  if (mode === "premium") base = [0.3, 0.24, 0.24, 0.08, 0.06, 0.08];
  const g = Math.min(40, Math.max(6, groupSize));
  const sizeBoost = Math.min(0.06, (g - 12) * 0.002);
  base[1] += sizeBoost;
  base[5] -= sizeBoost;
  const sum = base.reduce((a, b) => a + b, 0);
  return base.map((b) => b / sum);
}

export function generateBudget(
  total: number,
  groupSize: number,
  vibe: VibeTag[],
  options?: { mode?: BudgetResult["mode"] },
): BudgetResult {
  const mode = options?.mode ?? "balanced";
  const w = weightsFor(vibe.length ? vibe : ["cozy"], mode, groupSize);
  const lines: BudgetLine[] = keys.map((k, i) => {
    const amountINR = Math.round(total * w[i]);
    return {
      key: k.key,
      label: k.label,
      amountINR,
      percent: Math.round(w[i] * 1000) / 10,
    };
  });
  const drift = total - lines.reduce((a, l) => a + l.amountINR, 0);
  lines[0] = {
    ...lines[0],
    amountINR: lines[0].amountINR + drift,
  };
  const perHeadINR = Math.round(total / Math.max(1, groupSize));
  return { totalINR: total, groupSize, perHeadINR, lines, mode };
}
