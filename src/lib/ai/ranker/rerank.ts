import { get, set } from "idb-keyval";
import type { Venue } from "@/lib/types";
import { embedText } from "@/lib/ai/memory/embeddings";
import { embedHash } from "@/lib/ai/embedHash";
import { mergeAiUserPrefs } from "@/lib/ai/config";
import { readMediumTermPreferences } from "@/lib/ai/memory/mediumTerm";

function venueText(v: Venue): string {
  return `${v.name} ${v.city} ${v.area} ${v.vibeTags.join(" ")} ${v.description}`;
}

export async function getVenueEmbedding(
  v: Venue,
  embedFn: (t: string) => Promise<number[]> = embedText,
): Promise<number[]> {
  const k = `saheli.embeddings.venues.${v.id}`;
  const cached = await get<number[]>(k);
  if (cached?.length) return cached;
  const prefs = readMediumTermPreferences();
  const allow = mergeAiUserPrefs(prefs).useTransformers;
  let vec: number[];
  try {
    vec = allow ? await embedFn(venueText(v)) : embedHash(venueText(v), 64);
  } catch {
    vec = embedHash(venueText(v), 64);
  }
  await set(k, vec);
  return vec;
}

export function cosine(a: number[], b: number[]): number {
  if (!a.length || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const d = Math.sqrt(na) * Math.sqrt(nb);
  return d === 0 ? 0 : dot / d;
}

export async function rerankBlend(
  linear: number,
  userVec: number[],
  venueVec: number[],
  alpha = 0.4,
): Promise<number> {
  if (userVec.length !== venueVec.length) return linear;
  const c = cosine(userVec, venueVec);
  return alpha * c + (1 - alpha) * linear;
}
