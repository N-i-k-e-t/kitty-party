import type { FeatureVector } from "@/lib/ai/ranker/features";

export const DEFAULT_WEIGHTS: FeatureVector = {
  vibeOverlap: 0.18,
  groupFit: 0.14,
  budgetFit: 0.14,
  indoorOutdoorFit: 0.1,
  weatherSafety: 0.1,
  distancePenaltyComplement: 0.1,
  popularityPrior: 0.08,
  noveltyTerm: 0.08,
  memoryBias: 0.08,
};

export type Weights = FeatureVector;

export function linearScore(f: FeatureVector, w: Weights = DEFAULT_WEIGHTS): number {
  let s = 0;
  (Object.keys(w) as (keyof FeatureVector)[]).forEach((k) => {
    s += w[k] * f[k];
  });
  return s;
}
