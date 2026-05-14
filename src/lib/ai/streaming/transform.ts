export type TokenStream = AsyncIterable<{ type: "token"; text: string }>;

export async function tokenStreamToText(stream: TokenStream): Promise<string> {
  let out = "";
  for await (const ev of stream) {
    if (ev.type === "token") out += ev.text;
  }
  return out;
}

export async function tokenStreamToCallback(
  stream: TokenStream,
  onToken: (t: string) => void,
): Promise<void> {
  for await (const ev of stream) {
    if (ev.type === "token") onToken(ev.text);
  }
}

/**
 * Best-effort JSON delta accumulation; validates with zod when stream completes.
 * Streaming JSON from models is model-dependent; caller supplies parseFinal.
 */
export async function jsonModeStream<T>(
  stream: AsyncIterable<{ type: "token"; text: string }>,
  parseFinal: (raw: string) => T,
  onPartial?: (raw: string) => void,
): Promise<T> {
  let buf = "";
  for await (const ev of stream) {
    if (ev.type === "token") {
      buf += ev.text;
      onPartial?.(buf);
    }
  }
  return parseFinal(buf);
}
