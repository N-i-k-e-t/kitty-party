export { ai, createGateway, AIGateway } from "@/lib/ai/gateway";
export type {
  Capabilities,
  ChatRequest,
  ChatResponse,
  PlanWithTrace,
  PlanTraceStep,
  PlanStreamEvent,
  PlanOptions,
  RerankResult,
  ResolvedAiConfig,
  AiUserPrefs,
  ServerCapabilities,
} from "@/lib/ai/types";
export { runOrchestratorPlan, planFromOrchestrator } from "@/lib/ai/orchestrator";
export { memory } from "@/lib/ai/memory";
export { invalidateCapabilitiesCache } from "@/lib/ai/capabilities";
export { WARM_SYSTEM_PREFIX, templates, renderTemplate } from "@/lib/ai/prompts/registry";
export type { TemplateId } from "@/lib/ai/prompts/registry";
export { DEFAULT_WEIGHTS } from "@/lib/ai/ranker/weights";
export { twoStage } from "@/lib/ai/ranker/pipeline";
