import type { Venue } from "@/lib/types";
import type { RankerContext } from "@/lib/ai/ranker/features";
import { extractFeatures } from "@/lib/ai/ranker/features";
import { DEFAULT_WEIGHTS, linearScore } from "@/lib/ai/ranker/weights";
import { getVenueEmbedding, rerankBlend } from "@/lib/ai/ranker/rerank";
import { explainVenue } from "@/lib/ai/ranker/explain";
import { logAiEvent } from "@/lib/ai/telemetry/events";

export type RankedVenue = {
  venue: Venue;
  score: number;
  features: ReturnType<typeof extractFeatures>;
  rationale: string;
};

export async function twoStage(
  candidates: Venue[],
  ctx: RankerContext,
  userEmbedding?: number[] | null,
): Promise<RankedVenue[]> {
  const scored: RankedVenue[] = [];
  for (const v of candidates) {
    const features = extractFeatures(v, ctx);
    let lin = linearScore(features, DEFAULT_WEIGHTS);
    if (userEmbedding?.length) {
      try {
        const vEmb = await getVenueEmbedding(v);
        lin = await rerankBlend(lin, userEmbedding, vEmb);
      } catch {
        /* keep linear */
      }
    }
    scored.push({
      venue: v,
      score: lin,
      features,
      rationale: explainVenue(v, features),
    });
  }
  scored.sort((a, b) => b.score - a.score);
  logAiEvent("ranker", "twoStage", { count: scored.length });
  return scored;
}
