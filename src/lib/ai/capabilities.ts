import type { Capabilities, ResolvedAiConfig } from "@/lib/ai/types";
import { mergeAiUserPrefs, resolveAiConfig } from "@/lib/ai/config";
import type { UserPreferences } from "@/lib/types";
import { logAiEvent } from "@/lib/ai/telemetry/events";

let ollamaProbeCache: { key: string; at: number; reachable: boolean } | null = null;
const OLLAMA_PROBE_TTL_MS = 60_000;

export function invalidateCapabilitiesCache(): void {
  ollamaProbeCache = null;
}

function probeWebgpu(): boolean {
  try {
    const nav = typeof navigator !== "undefined" ? (navigator as Navigator & { gpu?: unknown }) : null;
    return Boolean(nav?.gpu);
  } catch {
    return false;
  }
}

function probeWasmThreads(): boolean {
  try {
    return (
      typeof crossOriginIsolated !== "undefined" &&
      crossOriginIsolated === true &&
      typeof SharedArrayBuffer !== "undefined"
    );
  } catch {
    return false;
  }
}

async function probeOllama(baseUrl: string): Promise<boolean> {
  const now = Date.now();
  const key = baseUrl;
  if (ollamaProbeCache && ollamaProbeCache.key === key && now - ollamaProbeCache.at < OLLAMA_PROBE_TTL_MS) {
    return ollamaProbeCache.reachable;
  }
  const url = `${baseUrl.replace(/\/$/, "")}/api/tags`;
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 1500);
    const res = await fetch(url, { method: "GET", signal: ctl.signal });
    clearTimeout(t);
    const ok = res.ok;
    ollamaProbeCache = { key, at: Date.now(), reachable: ok };
    return ok;
  } catch {
    ollamaProbeCache = { key, at: Date.now(), reachable: false };
    return false;
  }
}

export async function buildCapabilities(prefs: UserPreferences | undefined): Promise<Capabilities> {
  const cfg: ResolvedAiConfig = resolveAiConfig(prefs);
  const user = mergeAiUserPrefs(prefs);
  const webgpu = probeWebgpu();
  const wasmThreads = probeWasmThreads();
  let ollamaReachable = false;
  if (user.useOllama) {
    ollamaReachable = await probeOllama(cfg.ollamaBaseUrl);
  }
  const memoryBudgetMB =
    typeof navigator !== "undefined" &&
    "deviceMemory" in navigator &&
    typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory === "number"
      ? Math.round(((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4) * 180)
      : 2048;
  const online = typeof navigator === "undefined" ? true : navigator.onLine;
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  let webllmAvailable = false;
  if (typeof window !== "undefined" && user.useWebLLM && webgpu) {
    try {
      await import("@mlc-ai/web-llm");
      webllmAvailable = true;
    } catch {
      webllmAvailable = false;
    }
  }

  return {
    webgpu,
    wasmThreads,
    ollama: { reachable: ollamaReachable, baseUrl: user.useOllama ? cfg.ollamaBaseUrl : null },
    webllmModel: user.useWebLLM && webgpu ? cfg.webllmModelId : null,
    transformersAllowed: user.useTransformers,
    externalAllowed: user.useExternal && Boolean(cfg.openAiApiKey),
    memoryBudgetMB,
    online,
    reducedMotion,
    webllmAvailable,
  };
}

export async function detectCapabilitiesCached(
  prefs: UserPreferences | undefined,
  force = false,
): Promise<Capabilities> {
  if (force) invalidateCapabilitiesCache();
  const c = await buildCapabilities(prefs);
  logAiEvent("adapter_selected", "capabilities_probe");
  return c;
}
