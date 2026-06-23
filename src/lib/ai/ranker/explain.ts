import type { Venue } from "@/lib/types";
import type { FeatureVector } from "@/lib/ai/ranker/features";
import { DEFAULT_WEIGHTS } from "@/lib/ai/ranker/weights";

const labels: Record<keyof FeatureVector, string> = {
  vibeOverlap: "vibe match",
  groupFit: "group size fit",
  budgetFit: "budget fit",
  indoorOutdoorFit: "indoor/outdoor fit",
  weatherSafety: "weather safety",
  distancePenaltyComplement: "distance",
  popularityPrior: "popularity",
  noveltyTerm: "freshness",
  memoryBias: "your saved picks",
};

export function explainVenue(v: Venue, f: FeatureVector): string {
  const w = DEFAULT_WEIGHTS;
  const contribs = (Object.keys(f) as (keyof FeatureVector)[]).map((k) => ({
    k,
    v: w[k] * f[k],
  }));
  contribs.sort((a, b) => b.v - a.v);
  const top = contribs[0];
  const second = contribs[1];
  const a = top ? labels[top.k] : "overall fit";
  const b = second ? labels[second.k] : "comfort details";
  return `${v.name} — strong on ${a} and ${b}.`;
}
