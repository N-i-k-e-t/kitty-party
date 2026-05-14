type Entry<T> = { value: T; expiresAt: number };

export class ServerLruCache<T> {
  private readonly map = new Map<string, Entry<T>>();
  constructor(private readonly maxEntries: number) {}

  get(key: string): T | undefined {
    const e = this.map.get(key);
    if (!e) return undefined;
    if (Date.now() > e.expiresAt) {
      this.map.delete(key);
      return undefined;
    }
    return e.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    if (this.map.size >= this.maxEntries) {
      const first = this.map.keys().next().value;
      if (first) this.map.delete(first);
    }
    this.map.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}

export const serverEmbedCache = new ServerLruCache<number[][]>(256);
export const serverPromptCache = new ServerLruCache<string>(512);
