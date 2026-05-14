import type { ChatRequest, ChatResponse } from "@/lib/ai/types";
import { renderTemplate } from "@/lib/ai/prompts/registry";
import type { PlannerSlots } from "@/lib/ai/prompts/planner";

export async function composeOpeningParagraph(input: {
  chat: (req: ChatRequest, signal?: AbortSignal) => Promise<ChatResponse>;
  slots: PlannerSlots;
  signal?: AbortSignal;
  onToken?: (t: string) => void;
}): Promise<string | null> {
  const { system, user } = renderTemplate("planner", input.slots);
  const res = await input.chat(
    {
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.55,
      onToken: input.onToken,
    },
    input.signal,
  );
  if (res.adapter === "heuristic") return null;
  return res.text.trim();
}
