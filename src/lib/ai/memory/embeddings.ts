import { get, set } from "idb-keyval";
import { embedHash } from "@/lib/ai/embedHash";
import { mergeAiUserPrefs } from "@/lib/ai/config";
import { readMediumTermPreferences } from "@/lib/ai/memory/mediumTerm";

function keyHash(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h).toString(36);
}

export async function embedText(text: string): Promise<number[]> {
  const id = keyHash(text);
  const cacheKey = `saheli.memory.embeddings.${id}`;
  const cached = await get<number[]>(cacheKey);
  if (cached?.length) return cached;

  const prefs = readMediumTermPreferences();
  const allow = mergeAiUserPrefs(prefs).useTransformers;

  let vec: number[] | null = null;
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/ai/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: [text] }),
      });
      if (res.ok) {
        const data = (await res.json()) as { vectors?: number[][] };
        vec = data.vectors?.[0] ?? null;
      }
    } catch {
      vec = null;
    }
  }
  if (typeof window !== "undefined" && allow && !vec) {
    try {
      const mod = await import("@/lib/ai/adapters/transformers");
      const batch = await mod.runTransformersEmbed([text]);
      vec = batch?.[0] ?? null;
    } catch {
      vec = null;
    }
  }

  const out = vec && vec.length ? vec : embedHash(text, 64);
  await set(cacheKey, out);
  return out;
}
