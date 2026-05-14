"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SendHorizontal, Square } from "lucide-react";

export function ChatComposer({
  disabled,
  onSend,
  suggestions,
}: {
  disabled?: boolean;
  onSend: (text: string, ctl: AbortController) => Promise<void>;
  suggestions?: string[];
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const ctlRef = useRef<AbortController | null>(null);

  async function submit() {
    const t = text.trim();
    if (!t || busy || disabled) return;
    const ctl = new AbortController();
    ctlRef.current = ctl;
    setBusy(true);
    setText("");
    try {
      await onSend(t, ctl);
    } finally {
      setBusy(false);
      ctlRef.current = null;
    }
  }

  function stop() {
    ctlRef.current?.abort();
  }

  return (
    <div className="space-y-2">
      {suggestions?.length ? (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              className="rounded-full border border-stroke bg-white/70 px-3 py-1 text-xs text-ink-muted hover:text-ink"
              disabled={busy || disabled}
              onClick={() => {
                setText(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex gap-2">
        <Input
          value={text}
          disabled={busy || disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void submit();
          }}
          placeholder="Describe your gathering…"
        />
        <Button
          type="button"
          className="shrink-0 px-3"
          variant={busy ? "soft" : "primary"}
          disabled={disabled}
          onClick={() => {
            if (busy) stop();
            else void submit();
          }}
        >
          {busy ? <Square className="h-5 w-5" /> : <SendHorizontal className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
