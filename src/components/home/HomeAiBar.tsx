"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mic, SendHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { IconBubble } from "@/components/ui/IconBubble";

export function HomeAiBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  return (
    <motion.section variants={fadeUp} initial="hidden" animate="show" className="mb-5">
      <div className="glass-panel relative flex items-center gap-2 rounded-3xl p-2 pl-3 shadow-soft">
        <IconBubble icon={Mic} className="shrink-0 opacity-70" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && q.trim()) {
              router.push(`/plan?prompt=${encodeURIComponent(q.trim())}`);
            }
          }}
          placeholder="Ask your party assistant…"
          className="flex-1 bg-transparent py-2 text-sm text-ink outline-none placeholder:text-ink-muted"
        />
        <button
          type="button"
          onClick={() => q.trim() && router.push(`/plan?prompt=${encodeURIComponent(q.trim())}`)}
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-champagne to-champagne-deep text-ink shadow-md"
          aria-label="Send"
        >
          <SendHorizontal className="h-5 w-5" />
        </button>
      </div>
    </motion.section>
  );
}
