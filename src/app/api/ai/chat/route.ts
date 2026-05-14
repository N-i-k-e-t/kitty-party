import { z } from "zod";
import { NextResponse } from "next/server";

import { clientIp, jsonError } from "@/lib/ai/api/shared";
import { newRequestId } from "@/lib/ai/security/requestId";
import { checkRateLimit, RATE_LIMITS } from "@/lib/ai/security/rateLimit";
import { orderMessagesForOpenRouter, sanitizeChatMessages } from "@/lib/ai/security/sanitize";
import { encodeSseEvent } from "@/lib/ai/streaming/sse";
import { chatComplete, chatStream } from "@/lib/ai/adapters/openrouterServer";
import { directOpenAiChat } from "@/lib/ai/adapters/direct/openai";
import { directAnthropicChat } from "@/lib/ai/adapters/direct/anthropic";
import { directGoogleChat } from "@/lib/ai/adapters/direct/google";
import { getServerAIConfig } from "@/lib/ai/config";
import { selectModel } from "@/lib/ai/models/routing";
import { recordAiMetric } from "@/lib/ai/telemetry/metrics";
import type { ChatMessage, ResponseFormat } from "@/lib/ai/types";

export const runtime = "edge";

const Body = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["system", "user", "assistant"]),
      content: z.string(),
    }),
  ),
  stream: z.boolean().optional().default(true),
  model: z.string().optional(),
  modelTier: z.enum(["cheap", "balanced", "premium"]).optional(),
  temperature: z.number().min(0).max(2).optional(),
  max_tokens: z.number().min(1).max(8192).optional(),
  response_format: z
    .union([
      z.object({ type: z.literal("json_object") }),
      z.object({
        type: z.literal("json_schema"),
        json_schema: z.object({ name: z.string(), strict: z.boolean().optional(), schema: z.unknown() }),
      }),
    ])
    .optional(),
});

function trimHistory(messages: ChatMessage[], max = 12): ChatMessage[] {
  if (messages.length <= max) return messages;
  return messages.slice(-max);
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: Request): Promise<Response> {
  const requestId = newRequestId();
  const ip = clientIp(req.headers);
  const rl = checkRateLimit({ route: "/api/ai/chat", ip, rules: RATE_LIMITS.chat });
  if (!rl.ok) {
    return jsonError(requestId, "rate_limited", rl.message, 429, { retryAfterMs: rl.retryAfterMs }) as unknown as Response;
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return jsonError(requestId, "bad_json", "Invalid JSON body.", 400) as unknown as Response;
  }
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return jsonError(requestId, "validation_error", parsed.error.message, 400) as unknown as Response;
  }
  const body = parsed.data;
  const sanitized = sanitizeChatMessages(body.messages);
  if (!sanitized.ok) {
    return jsonError(requestId, sanitized.code, sanitized.message, 400) as unknown as Response;
  }
  const notes = sanitized.notes;
  const messages = orderMessagesForOpenRouter(trimHistory(sanitized.messages, 12));
  const cfg = getServerAIConfig();
  const tier = body.modelTier ?? "balanced";
  const picked = selectModel({
    intent: "general",
    userTier: tier,
    structured: Boolean(body.response_format),
  });
  const model = body.model ?? picked.id;
  const maxTokens = Math.min(body.max_tokens ?? 512, 8192);
  const temperature = body.temperature ?? 0.6;

  if (!body.stream) {
    const text = await runChatLadder({
      cfg,
      messages,
      model,
      fallbackModel: picked.fallbackId,
      temperature,
      max_tokens: maxTokens,
      response_format: body.response_format,
      signal: req.signal,
    });
    const out =
      text.text.trim().length > 0
        ? text.text
        : "Saheli is in gentle local mode — add OPENROUTER_API_KEY on the server for cloud warmth.";
    return NextResponse.json(
      { text: out, adapter: text.adapter, usage: text.usage, notes },
      { headers: { "X-Request-Id": requestId, "Cache-Control": "no-store" } },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(encodeSseEvent({ event: "ai", data: JSON.stringify(obj) })));
      };
      if (notes.length) send({ type: "note", notes });
      if (!cfg.openRouterApiKey) {
        send({ type: "error", message: "OpenRouter not configured" });
        controller.close();
        return;
      }
      let usageOut: { promptTokens?: number; completionTokens?: number; totalTokens?: number } | undefined;
      try {
        for await (const ev of chatStream({
          apiKey: cfg.openRouterApiKey,
          referer: cfg.openRouterReferrer,
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          response_format: body.response_format,
          signal: req.signal,
        })) {
          if (ev.type === "token") send({ type: "token", text: ev.text });
          if (ev.type === "error") send({ type: "error", message: ev.message });
          if (ev.type === "done") usageOut = ev.usage;
        }
        send({ type: "done", usage: usageOut, model });
        void recordAiMetric({
          route: "/api/ai/chat",
          modelId: model,
          promptTokens: usageOut?.promptTokens ?? 0,
          completionTokens: usageOut?.completionTokens ?? 0,
          requestId,
        });
      } catch (e) {
        send({ type: "error", message: e instanceof Error ? e.message : String(e) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Request-Id": requestId,
    },
  });
}

async function runChatLadder(input: {
  cfg: ReturnType<typeof getServerAIConfig>;
  messages: ChatMessage[];
  model: string;
  fallbackModel: string;
  temperature: number;
  max_tokens: number;
  response_format?: ResponseFormat;
  signal?: AbortSignal;
}): Promise<{ text: string; adapter: string; usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number } }> {
  const { cfg } = input;
  const tryOpenRouter = async (modelId: string) => {
    if (!cfg.openRouterApiKey) return null;
    for (const backoff of [0, 200, 600]) {
      if (backoff) await sleep(backoff);
      const res = await chatComplete({
        apiKey: cfg.openRouterApiKey,
        referer: cfg.openRouterReferrer,
        model: modelId,
        messages: input.messages,
        temperature: input.temperature,
        max_tokens: input.max_tokens,
        response_format: input.response_format,
        signal: input.signal,
      });
      if (!res.error && res.text) return { ...res, adapter: "openrouter" as const };
    }
    return null;
  };

  const o = await tryOpenRouter(input.model);
  if (o) return { text: o.text, adapter: o.adapter, usage: o.usage };
  const o2 = await tryOpenRouter(input.fallbackModel);
  if (o2) return { text: o2.text, adapter: o2.adapter, usage: o2.usage };

  if (cfg.openAiApiKey && cfg.openAiBaseUrl) {
    const r = await directOpenAiChat({
      baseUrl: cfg.openAiBaseUrl,
      apiKey: cfg.openAiApiKey,
      model: "gpt-4o-mini",
      messages: input.messages,
      temperature: input.temperature,
      max_tokens: input.max_tokens,
      response_format: input.response_format?.type === "json_object" ? { type: "json_object" } : undefined,
      signal: input.signal,
    });
    if (!r.error && r.text) return { text: r.text, adapter: "direct_openai" };
  }
  if (cfg.anthropicApiKey) {
    const r = await directAnthropicChat({
      apiKey: cfg.anthropicApiKey,
      model: "claude-3-haiku-20240307",
      messages: input.messages,
      temperature: input.temperature,
      max_tokens: input.max_tokens,
      signal: input.signal,
    });
    if (!r.error && r.text) return { text: r.text, adapter: "direct_anthropic" };
  }
  if (cfg.googleApiKey) {
    const r = await directGoogleChat({
      apiKey: cfg.googleApiKey,
      model: "gemini-2.0-flash",
      messages: input.messages,
      temperature: input.temperature,
      maxOutputTokens: input.max_tokens,
      signal: input.signal,
    });
    if (!r.error && r.text) return { text: r.text, adapter: "direct_google" };
  }
  return { text: "", adapter: "heuristic" };
}
