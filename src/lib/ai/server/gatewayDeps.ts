import "server-only";

import type { ChatRequest, ChatResponse, OrchestratorDeps } from "@/lib/ai/types";
import { getServerAIConfig, resolveAiConfig } from "@/lib/ai/config";
import { chatComplete, chatStream, embedOpenRouter } from "@/lib/ai/adapters/openrouterServer";
import { orderMessagesForOpenRouter, sanitizeChatMessages } from "@/lib/ai/security/sanitize";
import { selectModel } from "@/lib/ai/models/routing";
import { embedHash } from "@/lib/ai/embedHash";
import { serverEmbedCache } from "@/lib/ai/cache/server";
import type { UserPreferences } from "@/lib/types";

function trimHistory<T extends { role: string }>(messages: T[], max = 12): T[] {
  if (messages.length <= max) return messages;
  return messages.slice(-max);
}

export function createServerOrchestratorDeps(prefs: UserPreferences | undefined): OrchestratorDeps {
  const config = resolveAiConfig(prefs);
  const sec = getServerAIConfig();

  return {
    config: {
      ...config,
      openRouterApiKey: sec.openRouterApiKey ?? config.openRouterApiKey,
      openRouterReferrer: sec.openRouterReferrer ?? config.openRouterReferrer,
    },
    embed: async (texts, signal) => {
      const key = JSON.stringify(texts);
      const hit = serverEmbedCache.get(key);
      if (hit) return hit;
      const apiKey = sec.openRouterApiKey ?? config.openRouterApiKey;
      if (apiKey) {
        const res = await embedOpenRouter({
          apiKey,
          referer: sec.openRouterReferrer,
          model: "openai/text-embedding-3-small",
          texts,
          signal,
        });
        if (!res.error && res.vectors.length === texts.length) {
          serverEmbedCache.set(key, res.vectors, 24 * 60 * 60 * 1000);
          return res.vectors;
        }
      }
      const hashed = texts.map((t) => embedHash(t, 64));
      serverEmbedCache.set(key, hashed, 24 * 60 * 60 * 1000);
      return hashed;
    },
    chat: async (req: ChatRequest, signal): Promise<ChatResponse> => {
      const sanitized = sanitizeChatMessages(req.messages);
      if (!sanitized.ok) {
        return { text: "", adapter: "heuristic" };
      }
      const picked = selectModel({
        intent: "plan",
        userTier: config.user.modelTier,
        structured: Boolean(req.response_format),
      });
      const model = req.model ?? picked.id;
      const messages = orderMessagesForOpenRouter(trimHistory(sanitized.messages, 12));
      const apiKey = sec.openRouterApiKey ?? config.openRouterApiKey;
      if (!apiKey) {
        return { text: "", adapter: "heuristic" };
      }
      if (req.onToken) {
        let buf = "";
        let usage: ChatResponse["usage"];
        for await (const ev of chatStream({
          apiKey,
          referer: sec.openRouterReferrer,
          model,
          messages,
          temperature: req.temperature ?? 0.55,
          max_tokens: Math.min(req.max_tokens ?? picked.maxTokens, 1200),
          response_format: req.response_format,
          signal,
        })) {
          if (ev.type === "token") {
            buf += ev.text;
            req.onToken(ev.text);
          }
          if (ev.type === "done" && ev.usage) {
            usage = {
              promptTokens: ev.usage.promptTokens,
              completionTokens: ev.usage.completionTokens,
              totalTokens: ev.usage.totalTokens,
            };
          }
          if (ev.type === "error") {
            return { text: buf, adapter: "heuristic", usage };
          }
        }
        return { text: buf.trim(), adapter: "openrouter", usage };
      }

      const res = await chatComplete({
        apiKey,
        referer: sec.openRouterReferrer,
        model,
        messages,
        temperature: req.temperature ?? 0.55,
        max_tokens: Math.min(req.max_tokens ?? picked.maxTokens, 1200),
        response_format: req.response_format,
        signal,
      });
      if (res.error || !res.text) {
        return { text: "", adapter: "heuristic" };
      }
      return {
        text: res.text,
        adapter: "openrouter",
        usage: {
          promptTokens: res.usage?.promptTokens,
          completionTokens: res.usage?.completionTokens,
          totalTokens: res.usage?.totalTokens,
        },
      };
    },
  };
}
