export type ChainStep = {
  id: string;
  run: () => Promise<unknown>;
};

export async function runChain(
  steps: ChainStep[],
  _input: unknown,
  cache?: Map<string, unknown>,
): Promise<{ results: Record<string, unknown>; timings: { id: string; ms: number }[] }> {
  void _input;
  const results: Record<string, unknown> = {};
  const timings: { id: string; ms: number }[] = [];
  for (const s of steps) {
    if (cache?.has(s.id)) {
      results[s.id] = cache.get(s.id)!;
      timings.push({ id: s.id, ms: 0 });
      continue;
    }
    const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
    const out = await s.run();
    const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
    results[s.id] = out;
    timings.push({ id: s.id, ms: Math.round(t1 - t0) });
    cache?.set(s.id, out);
  }
  return { results, timings };
}
