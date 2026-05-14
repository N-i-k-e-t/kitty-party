export type ServerSentEvent = { event?: string; data: string; id?: string };

export function encodeSseEvent(ev: ServerSentEvent): string {
  const lines: string[] = [];
  if (ev.id) lines.push(`id: ${ev.id}`);
  if (ev.event) lines.push(`event: ${ev.event}`);
  const payload = ev.data.replace(/\n/g, "\ndata: ");
  lines.push(`data: ${payload}`);
  lines.push("");
  lines.push("");
  return lines.join("\n");
}

function parseSseBlock(block: string): ServerSentEvent | null {
  const lines = block.split(/\r?\n/);
  let event: string | undefined;
  let id: string | undefined;
  const dataLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("id:")) id = line.slice(3).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
  }
  if (!dataLines.length) return null;
  return { event, id, data: dataLines.join("\n") };
}

/**
 * Append incoming text to a buffer, emit complete SSE events split on blank line.
 */
export function drainSseBuffer(
  carry: string,
  incoming: string,
): { carry: string; events: ServerSentEvent[] } {
  let buf = carry + incoming;
  const events: ServerSentEvent[] = [];
  while (true) {
    const idx = buf.indexOf("\n\n");
    if (idx === -1) break;
    const raw = buf.slice(0, idx);
    buf = buf.slice(idx + 2);
    const ev = parseSseBlock(raw);
    if (ev) events.push(ev);
  }
  return { carry: buf, events };
}

/** Spec alias: parse incremental chunk into events + remainder. */
export function parseSseChunk(carry: string, chunk: string): { buffer: string; events: ServerSentEvent[] } {
  const { carry: next, events } = drainSseBuffer(carry, chunk);
  return { buffer: next, events };
}

export function createSseTransform(): TransformStream<Uint8Array, ServerSentEvent> {
  const decoder = new TextDecoder();
  let carry = "";
  return new TransformStream<Uint8Array, ServerSentEvent>({
    transform(chunk, controller) {
      const text = decoder.decode(chunk, { stream: true });
      const { carry: next, events } = drainSseBuffer(carry, text);
      carry = next;
      for (const e of events) controller.enqueue(e);
    },
    flush(controller) {
      const text = decoder.decode();
      if (text.length) {
        const { carry: next, events } = drainSseBuffer(carry, text);
        carry = next;
        for (const e of events) controller.enqueue(e);
      }
    },
  });
}
