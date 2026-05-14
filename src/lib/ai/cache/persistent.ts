import { get, set, del } from "idb-keyval";

const PREFIX = "saheli.cache.ai.";

export type CachedEntry<T> = { value: T; expiresAt: number };

function key(k: string): string {
  return `${PREFIX}${k}`;
}

export async function cacheGet<T>(id: string): Promise<T | null> {
  const row = await get<CachedEntry<T>>(key(id));
  if (!row) return null;
  if (Date.now() > row.expiresAt) {
    await del(key(id));
    return null;
  }
  return row.value;
}

export async function cacheSet<T>(id: string, value: T, ttlMs: number): Promise<void> {
  await set(key(id), { value, expiresAt: Date.now() + ttlMs } satisfies CachedEntry<T>);
}

/** Reserved for future bounded eviction passes; no-op for now. */
export async function cacheCompact(): Promise<void> {
  return;
}
