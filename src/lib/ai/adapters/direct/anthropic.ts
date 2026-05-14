import "server-only";

import type { ChatMessage } from "@/lib/ai/types";

export async function directAnthropicChat(input: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  signal?: AbortSignal;
}): Promise<{ text: string; error?: string }> {
  const system = input.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n\n");
  const rest = input.messages.filter((m) => m.role !== "system");
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": input.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: input.model,
        max_tokens: input.max_tokens ?? 1024,
        temperature: input.temperature ?? 0.5,
        system: system || undefined,
        messages: rest.map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: [{ type: "text", text: m.content }],
        })),
      }),
      signal: input.signal,
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { text: "", error: `Anthropic ${res.status}: ${t.slice(0, 300)}` };
    }
    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = (data.content ?? []).map((c) => (c.type === "text" ? c.text ?? "" : "")).join("");
    return { text };
  } catch (e) {
    return { text: "", error: e instanceof Error ? e.message : String(e) };
  }
}
