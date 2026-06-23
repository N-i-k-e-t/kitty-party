import "server-only";

import type { ChatMessage } from "@/lib/ai/types";

export async function directOpenAiChat(input: {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
  signal?: AbortSignal;
}): Promise<{ text: string; error?: string }> {
  const base = input.baseUrl.replace(/\/$/, "");
  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${input.apiKey}`,
      },
      body: JSON.stringify({
        model: input.model,
        messages: input.messages,
        temperature: input.temperature ?? 0.5,
        max_tokens: input.max_tokens,
        response_format: input.response_format,
      }),
      signal: input.signal,
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { text: "", error: `OpenAI ${res.status}: ${t.slice(0, 300)}` };
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return { text: data.choices?.[0]?.message?.content ?? "" };
  } catch (e) {
    return { text: "", error: e instanceof Error ? e.message : String(e) };
  }
}
