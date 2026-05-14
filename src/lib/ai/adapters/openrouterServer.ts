import "server-only";

export type StreamUsage = {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
};

export type StreamUsageNorm = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export type StreamEvent =
  | { type: "token"; text: string }
  | { type: "tool"; name: string; args: unknown }
  | { type: "done"; usage?: StreamUsageNorm }
  | { type: "error"; message: string };

export type OpenRouterChatParams = {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  model: string;
  signal?: AbortSignal;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_schema"; json_schema: { name: string; strict?: boolean; schema: unknown } } | { type: "json_object" };
  stream?: boolean;
};

function headers(apiKey: string, referer: string, title: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": referer,
    "X-Title": title,
  };
}

function normUsage(u?: StreamUsage): StreamUsageNorm | undefined {
  if (!u) return undefined;
  return {
    promptTokens: u.prompt_tokens,
    completionTokens: u.completion_tokens,
    totalTokens: u.total_tokens,
  };
}

async function* readLines(body: ReadableStream<Uint8Array> | null): AsyncGenerator<string> {
  if (!body) return;
  const reader = body.getReader();
  const dec = new TextDecoder();
  let carry = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    carry += dec.decode(value, { stream: true });
    let idx: number;
    while ((idx = carry.indexOf("\n")) !== -1) {
      const line = carry.slice(0, idx).replace(/\r$/, "");
      carry = carry.slice(idx + 1);
      yield line;
    }
  }
  if (carry.length) yield carry.replace(/\r$/, "");
}

export async function* chatStream(params: OpenRouterChatParams & { apiKey: string; referer: string; title?: string }): AsyncIterable<StreamEvent> {
  const { apiKey, referer, title = "Saheli", ...rest } = params;
  let res: Response;
  try {
    res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: headers(apiKey, referer, title),
      body: JSON.stringify({
        model: rest.model,
        messages: rest.messages,
        temperature: rest.temperature ?? 0.6,
        max_tokens: rest.max_tokens,
        stream: true,
        response_format: rest.response_format,
      }),
      signal: rest.signal,
    });
  } catch (e) {
    yield { type: "error", message: e instanceof Error ? e.message : String(e) };
    return;
  }
  if (!res.ok || !res.body) {
    const t = await res.text().catch(() => "");
    yield { type: "error", message: `OpenRouter ${res.status}: ${t.slice(0, 400)}` };
    return;
  }

  let lastUsage: StreamUsageNorm | undefined;
  for await (const line of readLines(res.body)) {
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (payload === "[DONE]") {
      yield { type: "done", usage: lastUsage };
      return;
    }
    let obj: {
      choices?: Array<{ delta?: { content?: string }; finish_reason?: string | null }>;
      error?: { message?: string };
      usage?: StreamUsage;
    };
    try {
      obj = JSON.parse(payload) as typeof obj;
    } catch {
      continue;
    }
    if (obj.error?.message) {
      yield { type: "error", message: obj.error.message };
      return;
    }
    const delta = obj.choices?.[0]?.delta?.content;
    if (delta) yield { type: "token", text: delta };
    if (obj.usage) lastUsage = normUsage(obj.usage);
  }
  yield { type: "done", usage: lastUsage };
}

export async function chatComplete(params: OpenRouterChatParams & { apiKey: string; referer: string; title?: string }): Promise<{
  text: string;
  usage?: StreamUsageNorm;
  error?: string;
}> {
  const { apiKey, referer, title = "Saheli", ...rest } = params;
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: headers(apiKey, referer, title),
      body: JSON.stringify({
        model: rest.model,
        messages: rest.messages,
        temperature: rest.temperature ?? 0.6,
        max_tokens: rest.max_tokens,
        stream: false,
        response_format: rest.response_format,
      }),
      signal: rest.signal,
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { text: "", error: `OpenRouter ${res.status}: ${t.slice(0, 400)}` };
    }
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: StreamUsage;
    };
    const text = data.choices?.[0]?.message?.content ?? "";
    return { text, usage: normUsage(data.usage) };
  } catch (e) {
    return { text: "", error: e instanceof Error ? e.message : String(e) };
  }
}

export async function embedOpenRouter(input: {
  apiKey: string;
  referer: string;
  model: string;
  texts: string[];
  signal?: AbortSignal;
}): Promise<{ vectors: number[][]; error?: string }> {
  try {
    const res = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: headers(input.apiKey, input.referer, "Saheli"),
      body: JSON.stringify({ model: input.model, input: input.texts }),
      signal: input.signal,
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      return { vectors: [], error: `OpenRouter embed ${res.status}: ${t.slice(0, 200)}` };
    }
    const data = (await res.json()) as { data?: Array<{ embedding: number[] }> };
    const rows = data.data ?? [];
    return { vectors: rows.map((r) => r.embedding) };
  } catch (e) {
    return { vectors: [], error: e instanceof Error ? e.message : String(e) };
  }
}
