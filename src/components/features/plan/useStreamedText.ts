"use client";

import { useCallback, useRef, useState } from "react";
import type { AiModelTier } from "@/lib/ai/types";
import { parseSseChunk } from "@/lib/ai/streaming/sse";

export function useStreamedText() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ctlRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    ctlRef.current?.abort();
  }, []);

  const stream = useCallback(async (messages: Array<{ role: "system" | "user" | "assistant"; content: string }>, tier: AiModelTier) => {
    const ctl = new AbortController();
    ctlRef.current = ctl;
    setBusy(true);
    setError(null);
    setText("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, stream: true, modelTier: tier }),
        signal: ctl.signal,
      });
      if (!res.ok || !res.body) {
        throw new Error(`chat ${res.status}`);
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let carry = "";
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value, { stream: true });
        const parsed = parseSseChunk(carry, chunk);
        carry = parsed.buffer;
        for (const ev of parsed.events) {
          if (ev.event !== "ai") continue;
          try {
            const obj = JSON.parse(ev.data) as { type?: string; text?: string; message?: string };
            if (obj.type === "token" && typeof obj.text === "string") {
              buf += obj.text;
              setText(buf);
            }
            if (obj.type === "error") {
              setError(String(obj.message ?? "error"));
            }
          } catch {
            /* ignore */
          }
        }
      }
      const tail = dec.decode();
      if (tail.length) {
        const parsed = parseSseChunk(carry, tail);
        for (const ev of parsed.events) {
          if (ev.event !== "ai") continue;
          try {
            const obj = JSON.parse(ev.data) as { type?: string; text?: string };
            if (obj.type === "token" && typeof obj.text === "string") {
              buf += obj.text;
              setText(buf);
            }
          } catch {
            /* ignore */
          }
        }
      }
      return buf;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      return "";
    } finally {
      setBusy(false);
      ctlRef.current = null;
    }
  }, []);

  return { text, busy, error, stream, stop, setText };
}
