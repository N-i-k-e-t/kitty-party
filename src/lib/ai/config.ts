import type { AiUserPrefs, ResolvedAiConfig } from "@/lib/ai/types";
import type { UserPreferences } from "@/lib/types";

const DEFAULT_AI_USER: AiUserPrefs = {
  useWebLLM: false,
  useOllama: false,
  useTransformers: true,
  useExternal: false,
  useDirectOpenAI: false,
  useDirectAnthropic: false,
  useDirectGoogle: false,
  modelTier: "balanced",
  usePremiumModel: false,
};

function readEnv(name: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

export function mergeAiUserPrefs(prefs: UserPreferences | undefined): AiUserPrefs {
  const ai = prefs?.ai;
  return {
    useWebLLM: ai?.useWebLLM ?? DEFAULT_AI_USER.useWebLLM,
    useOllama: ai?.useOllama ?? DEFAULT_AI_USER.useOllama,
    useTransformers: ai?.useTransformers ?? DEFAULT_AI_USER.useTransformers,
    useExternal: ai?.useExternal ?? DEFAULT_AI_USER.useExternal,
    useDirectOpenAI: ai?.useDirectOpenAI ?? DEFAULT_AI_USER.useDirectOpenAI,
    useDirectAnthropic: ai?.useDirectAnthropic ?? DEFAULT_AI_USER.useDirectAnthropic,
    useDirectGoogle: ai?.useDirectGoogle ?? DEFAULT_AI_USER.useDirectGoogle,
    modelTier: ai?.modelTier ?? DEFAULT_AI_USER.modelTier,
    usePremiumModel: ai?.usePremiumModel ?? DEFAULT_AI_USER.usePremiumModel,
  };
}

export function resolveAiConfig(prefs: UserPreferences | undefined): ResolvedAiConfig {
  const user = mergeAiUserPrefs(prefs);
  return {
    ollamaBaseUrl: readEnv("OLLAMA_BASE_URL") ?? readEnv("NEXT_PUBLIC_OLLAMA_BASE_URL") ?? "http://localhost:11434",
    openWeatherMapApiKey: readEnv("OPENWEATHERMAP_API_KEY") ?? null,
    openAiBaseUrl: readEnv("OPENAI_BASE_URL") ?? null,
    openAiApiKey: readEnv("OPENAI_API_KEY") ?? null,
    anthropicApiKey: readEnv("ANTHROPIC_API_KEY") ?? null,
    googleApiKey: readEnv("GOOGLE_API_KEY") ?? null,
    openRouterApiKey: readEnv("OPENROUTER_API_KEY") ?? null,
    openRouterReferrer: readEnv("OPENROUTER_REFERRER") ?? readEnv("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
    siteUrl: readEnv("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
    supabaseUrl: readEnv("SUPABASE_URL") ?? null,
    supabaseAnonKey: readEnv("SUPABASE_ANON_KEY") ?? null,
    supabaseServiceRoleKey: readEnv("SUPABASE_SERVICE_ROLE_KEY") ?? null,
    upstashRedisUrl: readEnv("UPSTASH_REDIS_REST_URL") ?? null,
    upstashRedisToken: readEnv("UPSTASH_REDIS_REST_TOKEN") ?? null,
    ollamaModel: readEnv("OLLAMA_MODEL") ?? "llama3.1:8b-instruct-q4_K_M",
    webllmModelId: readEnv("NEXT_PUBLIC_WEBLLM_MODEL") ?? "Llama-3.2-3B-Instruct-q4f16_1-MLC",
    chatTimeoutMs: Number(readEnv("SAHELI_AI_CHAT_TIMEOUT_MS") ?? "8000") || 8000,
    user,
  };
}

export type ServerAIConfig = {
  openRouterApiKey: string | null;
  openRouterReferrer: string;
  openAiBaseUrl: string | null;
  openAiApiKey: string | null;
  anthropicApiKey: string | null;
  googleApiKey: string | null;
  openWeatherMapApiKey: string | null;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  supabaseServiceRoleKey: string | null;
  upstashRedisUrl: string | null;
  upstashRedisToken: string | null;
  siteUrl: string;
};

export function getServerAIConfig(): ServerAIConfig {
  return {
    openRouterApiKey: readEnv("OPENROUTER_API_KEY") ?? null,
    openRouterReferrer: readEnv("OPENROUTER_REFERRER") ?? readEnv("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
    openAiBaseUrl: readEnv("OPENAI_BASE_URL") ?? null,
    openAiApiKey: readEnv("OPENAI_API_KEY") ?? null,
    anthropicApiKey: readEnv("ANTHROPIC_API_KEY") ?? null,
    googleApiKey: readEnv("GOOGLE_API_KEY") ?? null,
    openWeatherMapApiKey: readEnv("OPENWEATHERMAP_API_KEY") ?? null,
    supabaseUrl: readEnv("SUPABASE_URL") ?? null,
    supabaseAnonKey: readEnv("SUPABASE_ANON_KEY") ?? null,
    supabaseServiceRoleKey: readEnv("SUPABASE_SERVICE_ROLE_KEY") ?? null,
    upstashRedisUrl: readEnv("UPSTASH_REDIS_REST_URL") ?? null,
    upstashRedisToken: readEnv("UPSTASH_REDIS_REST_TOKEN") ?? null,
    siteUrl: readEnv("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3000",
  };
}

export function getClientAIPrefs(prefs: UserPreferences | undefined): AiUserPrefs {
  return mergeAiUserPrefs(prefs);
}
