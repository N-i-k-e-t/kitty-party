"use client";

import { motion } from "framer-motion";
import { fadeUpSoft, staggerChildren } from "@/lib/motion";
import type { PlanMessage, PlanRichCard, SavedPlan } from "@/lib/types";
import { PlanRichCards } from "@/components/plan/PlanRichCards";
import { ChatComposer } from "@/components/features/plan/ChatComposer";
import { ChatStream } from "@/components/features/plan/ChatStream";

export function PlanChat({
  plan,
  onSend,
  onPinCard,
  readOnly,
  planningText,
  planning,
}: {
  plan: SavedPlan | null;
  onSend: (t: string, signal?: AbortSignal) => Promise<void>;
  onPinCard: (c: PlanRichCard) => Promise<void>;
  readOnly?: boolean;
  planningText?: string | null;
  planning?: boolean;
}) {
  return (
    <div className="glass-panel rounded-3xl p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">Planner</p>
          <h2 className="font-serif text-lg font-semibold text-ink">Let’s compose something beautiful</h2>
        </div>
      </div>
      <div className="max-h-[min(70vh,560px)] space-y-3 overflow-y-auto pr-1">
        {!plan?.messages.length && !planning ? (
          <p className="text-sm text-ink-muted">Share a city, headcount, and mood — I’ll return cards you can keep.</p>
        ) : null}
        <motion.div variants={staggerChildren(0.04)} initial="hidden" animate="show" className="space-y-3">
          {plan?.messages.map((m: PlanMessage) => (
            <motion.div key={m.id} variants={fadeUpSoft} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[92%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-champagne/80 to-lavender/50 text-ink"
                    : "bg-white/85 text-ink shadow-sm"
                }`}
              >
                <p>{m.content}</p>
                {m.cards?.length ? (
                  <div className="mt-3 space-y-3">
                    <PlanRichCards readOnly={readOnly} cards={m.cards} onPin={onPinCard} />
                  </div>
                ) : null}
              </div>
            </motion.div>
          ))}
          {planning ? (
            <motion.div variants={fadeUpSoft} className="flex justify-start">
              <div className="max-w-[92%] rounded-3xl bg-white/85 px-4 py-3 text-sm leading-relaxed text-ink shadow-sm">
                <ChatStream text={planningText ?? ""} streaming={Boolean(planning && !(planningText ?? "").length)} />
              </div>
            </motion.div>
          ) : null}
        </motion.div>
      </div>
      <div className="mt-4">
        <ChatComposer
          disabled={readOnly}
          suggestions={["Monsoon kitty in Mumbai", "Glam games for 10", "Budget split for 15 guests"]}
          onSend={async (t, ctl) => {
            await onSend(t, ctl.signal);
          }}
        />
      </div>
    </div>
  );
}
