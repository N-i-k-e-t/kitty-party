import "server-only";

import type { ChatMessage } from "@/lib/ai/types";

export async function directGoogleChat(input: {
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  signal?: AbortSignal;
}): Promise<{ text: string; error?: string }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(input.model)}:generateContent?key=${encodeURIComponent(input.apiKey)}`;
  const parts = input.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: `${m.role}: ${m.content}` }],
  }));
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: parts,
        generationConfig: {
          temperature: input.temperature ?? 0.5,
          maxOutputTokens: input.maxOutputTokens ?? 1024,
        },
      }),
      signal: input.signal,
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { text: "", error: `Google ${res.status}: ${t.slice(0, 300)}` };
    }
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    return { text };
  } catch (e) {
    return { text: "", error: e instanceof Error ? e.message : String(e) };
  }
}
