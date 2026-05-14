"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Mic, SendHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUpSoft, withReducedMotion } from "@/lib/motion";
import { IconBubble } from "@/components/ui/IconBubble";
import { IconButton } from "@/components/ui/IconButton";

const PROMPTS = [
  "Ask your party assistant for a monsoon kitty in Mumbai…",
  "Ask your party assistant for glam games for ten guests…",
  "Ask your party assistant for a lavender brunch timeline…",
  "Ask your party assistant for budget-smart venues this week…",
] as const;

export function AssistantInputBar() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const placeholder = useMemo(() => PROMPTS[idx % PROMPTS.length], [idx]);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setIdx((i) => i + 1), 4200);
    return () => window.clearInterval(id);
  }, [reduce]);

  function go() {
    const t = q.trim();
    if (!t) return;
    router.push(`/plan?prompt=${encodeURIComponent(t)}`);
  }

  return (
    <motion.section variants={withReducedMotion(fadeUpSoft)} initial="hidden" animate="show" className="mb-saheli-20">
      <div className="relative overflow-hidden rounded-2xl glass p-saheli-8 shadow-elev-1">
        <div className="pointer-events-none absolute inset-0 rounded-2xl gradient-champagne-veil opacity-40" aria-hidden />
        <div className="relative flex items-center gap-saheli-8 rounded-xl bg-surface-glass/80 px-saheli-12 py-saheli-8">
          <IconBubble icon={Mic} className="shrink-0 opacity-70" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") go();
            }}
            placeholder={placeholder}
            aria-label="Ask your party assistant"
            inputMode="search"
            className="min-h-11 flex-1 bg-transparent body-sm text-ink-body outline-none placeholder:text-ink-muted"
          />
          <IconButton aria-label="Send to planner" onClick={go} className="shrink-0 border-champagne-400/40 bg-champagne-200/50">
            <SendHorizontal className="h-5 w-5" />
          </IconButton>
        </div>
      </div>
    </motion.section>
  );
}
