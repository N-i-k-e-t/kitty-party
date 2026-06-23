import type { PlanResponse } from "@/lib/types";

export type AdapterName =
  | "heuristic"
  | "transformers"
  | "webllm"
  | "ollama"
  | "external"
  | "openrouter"
  | "direct_openai"
  | "direct_anthropic"
  | "direct_google";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export type ResponseFormat =
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: { name: string; strict?: boolean; schema: unknown } };

export interface ChatRequest {
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  onToken?: (t: string) => void;
  response_format?: ResponseFormat;
  model?: string;
}

export interface ChatUsage {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

export interface ChatResponse {
  text: string;
  adapter: AdapterName;
  usage?: ChatUsage;
}

export interface RerankResult {
  index: number;
  score: number;
  text: string;
}

export type ServerCapabilities = {
  openRouterConfigured: boolean;
  openWeatherConfigured: boolean;
  supabaseConfigured: boolean;
  upstashConfigured: boolean;
  recentMetrics?: Array<Record<string, unknown>>;
};

export interface Capabilities {
  webgpu: boolean;
  wasmThreads: boolean;
  ollama: { reachable: boolean; baseUrl: string | null };
  webllmModel: string | null;
  transformersAllowed: boolean;
  externalAllowed: boolean;
  memoryBudgetMB: number;
  online: boolean;
  reducedMotion: boolean;
  webllmAvailable: boolean;
  server?: ServerCapabilities;
}

export type AiModelTier = "cheap" | "balanced" | "premium";

export interface AiUserPrefs {
  useWebLLM: boolean;
  useOllama: boolean;
  useTransformers: boolean;
  useExternal: boolean;
  useDirectOpenAI: boolean;
  useDirectAnthropic: boolean;
  useDirectGoogle: boolean;
  modelTier: AiModelTier;
  usePremiumModel: boolean;
}

export interface ResolvedAiConfig {
  ollamaBaseUrl: string;
  openWeatherMapApiKey: string | null;
  openAiBaseUrl: string | null;
  openAiApiKey: string | null;
  anthropicApiKey: string | null;
  googleApiKey: string | null;
  openRouterApiKey: string | null;
  openRouterReferrer: string;
  siteUrl: string;
  supabaseUrl: string | null;
  supabaseAnonKey: string | null;
  supabaseServiceRoleKey: string | null;
  upstashRedisUrl: string | null;
  upstashRedisToken: string | null;
  ollamaModel: string;
  webllmModelId: string;
  chatTimeoutMs: number;
  user: AiUserPrefs;
}

export type PlanTraceStep = {
  id: string;
  ms: number;
};

export interface PlanWithTrace {
  response: PlanResponse;
  steps: PlanTraceStep[];
}

export type PlanStreamEvent =
  | { type: "intent"; intent: string; ms: number }
  | { type: "retrieve"; ms: number }
  | { type: "rank"; ms: number }
  | { type: "compose:token"; text: string }
  | { type: "render:token"; text: string }
  | { type: "done:plan"; response: PlanResponse; steps: PlanTraceStep[] }
  | { type: "error"; message: string };

export interface OrchestratorDeps {
  chat: (req: ChatRequest, signal?: AbortSignal) => Promise<ChatResponse>;
  embed: (texts: string[], signal?: AbortSignal) => Promise<number[][]>;
  config: ResolvedAiConfig;
  onPlanEvent?: (e: PlanStreamEvent) => void;
}

export type PlanOptions = {
  signal?: AbortSignal;
  onPlanEvent?: (e: PlanStreamEvent) => void;
};
