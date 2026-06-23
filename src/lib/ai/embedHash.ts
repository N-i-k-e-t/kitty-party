/**
 * Deterministic pseudo-embedding for cosine similarity when no model is loaded.
 */
export function embedHash(text: string, dim = 64): number[] {
  const out = new Array<number>(dim).fill(0);
  for (let i = 0; i < text.length; i += 1) {
    const c = text.charCodeAt(i);
    const slot = (c + i * 31) % dim;
    out[slot] += (c % 97) / 97;
  }
  const norm = Math.sqrt(out.reduce((s, x) => s + x * x, 0)) || 1;
  return out.map((x) => x / norm);
}
