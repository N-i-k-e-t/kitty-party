"use client";

import { motion, useReducedMotion } from "framer-motion";
import { staggerChildrenPreset, fadeUpSoft } from "@/lib/motion";

export function TypingPulse() {
  const reduce = useReducedMotion();
  if (reduce) {
    return <span className="inline-block h-2 w-10 rounded-full bg-ink/15" aria-hidden />;
  }
  return (
    <span className="inline-flex gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-2 w-2 rounded-full bg-ink/35"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </span>
  );
}

export function ChatStream({ text, streaming }: { text: string; streaming: boolean }) {
  const reduce = useReducedMotion();
  const words = text.trim().length ? text.split(/\s+/) : [];
  if (streaming && !text) {
    return (
      <div className="text-sm text-ink-muted">
        <TypingPulse />
      </div>
    );
  }
  if (reduce) {
    return <p className="text-sm leading-relaxed text-ink">{text}</p>;
  }
  return (
    <motion.p variants={staggerChildrenPreset} initial="hidden" animate="show" className="text-sm leading-relaxed text-ink">
      {words.map((w, i) => (
        <motion.span key={`${i}-${w}`} variants={fadeUpSoft} className="mr-1 inline-block">
          {w}
        </motion.span>
      ))}
    </motion.p>
  );
}
