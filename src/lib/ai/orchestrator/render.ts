import type { PlanResponse, PlanRichCard } from "@/lib/types";
import type { ChatRequest } from "@/lib/ai/types";
import { renderTemplate } from "@/lib/ai/prompts/registry";
import type { RankedVenue } from "@/lib/ai/ranker/pipeline";

export async function renderPlanResponse(input: {
  base: PlanResponse;
  ranked: RankedVenue[];
  chat: (req: ChatRequest, signal?: AbortSignal) => Promise<import("@/lib/ai/types").ChatResponse>;
  signal?: AbortSignal;
  onToken?: (t: string) => void;
}): Promise<PlanResponse> {
  const cards: PlanRichCard[] = input.base.cards.map((c) => {
    if (c.type === "venues" && c.payload.venues) {
      const top = input.ranked.slice(0, 3).map((r) => r.venue);
      if (top.length) {
        return { ...c, payload: { ...c.payload, venues: top } };
      }
    }
    return c;
  });

  const rationales: Record<string, string> = {};
  for (const r of input.ranked.slice(0, 3)) {
    rationales[r.venue.id] = r.rationale;
  }

  let message = input.base.message;
  const notes = [...(input.base.notes ?? [])];

  if (message.length < 800) {
    try {
      const { system, user } = renderTemplate("rewriteWarm", { text: message });
      const warm = await input.chat(
        {
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.4,
          onToken: input.onToken,
        },
        input.signal,
      );
      if (warm.adapter !== "heuristic" && warm.text.trim()) message = warm.text.trim();
    } catch {
      notes.push("Warm rewrite skipped (adapter unavailable).");
    }
  }

  return { message, cards, notes, rationales };
}
