"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { successBloom, withReducedMotion } from "@/lib/motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { usePreferencesStore } from "@/store/preferences";
import { useState } from "react";

const DISMISS_KEY = "saheli-dismiss-quick-ideas";

function readDismissedFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function QuickIdeas() {
  const ideas = usePreferencesStore((s) => s.pendingIdeas);
  const clearPending = usePreferencesStore((s) => s.clearPendingIdeas);
  const router = useRouter();
  const [dismissed, setDismissed] = useState(readDismissedFromStorage);

  if (!ideas.length || dismissed) return null;

  return (
    <motion.section layout className="mb-saheli-24">
      <div className="mb-saheli-12 flex items-end justify-between gap-saheli-12">
        <SectionHeader title="Crafted for you" subtitle="From your onboarding sparkle" />
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            try {
              window.localStorage.setItem(DISMISS_KEY, "1");
            } catch {
              /* ignore */
            }
            setDismissed(true);
            clearPending();
          }}
        >
          Dismiss
        </Button>
      </div>
      <div className="grid gap-saheli-12 sm:grid-cols-3">
        <AnimatePresence>
          {ideas.map((idea) => (
            <motion.button
              type="button"
              key={idea.id}
              variants={withReducedMotion(successBloom)}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              onClick={() => {
                clearPending();
                router.push(`/plan?prompt=${encodeURIComponent(idea.promptSeed)}`);
              }}
              className="text-left"
            >
              <Card variant="raised" padding="sm" className="overflow-hidden">
                <div className="relative h-32 w-full overflow-hidden rounded-xl">
                  <Image src={idea.heroImage} alt="" fill className="object-cover" sizes="280px" />
                </div>
                <div className="mt-saheli-8 px-1">
                  <p className="title text-ink-strong">{idea.title}</p>
                  <p className="caption mt-1 text-ink-muted">{idea.subtitle}</p>
                  <p className="caption mt-saheli-8 text-ink-muted">
                    Est. ₹{(idea.estimatedBudgetINR / 1000).toFixed(1)}k
                  </p>
                </div>
              </Card>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
