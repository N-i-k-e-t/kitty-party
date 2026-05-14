"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { usePreferencesStore } from "@/store/preferences";

export function HomePersonalizedIdeas() {
  const ideas = usePreferencesStore((s) => s.pendingIdeas);
  const clearPending = usePreferencesStore((s) => s.clearPendingIdeas);
  const router = useRouter();
  if (!ideas.length) return null;
  return (
    <motion.section variants={staggerChildren(0.06)} initial="hidden" animate="show" className="mb-6">
      <SectionHeader title="Crafted for you" subtitle="From your onboarding sparkle" />
      <div className="grid gap-3 sm:grid-cols-3">
        {ideas.map((idea) => (
          <motion.button
            type="button"
            key={idea.id}
            variants={fadeUp}
            onClick={() => {
              clearPending();
              router.push(`/plan?prompt=${encodeURIComponent(idea.promptSeed)}`);
            }}
            className="text-left"
          >
            <Card variant="elevated" padding="sm" className="overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lift">
              <div className="relative h-32 w-full overflow-hidden rounded-xl">
                <Image src={idea.heroImage} alt={idea.title} fill className="object-cover" sizes="280px" />
              </div>
              <div className="mt-2 px-1">
                <p className="font-serif text-sm font-semibold text-ink">{idea.title}</p>
                <p className="text-[11px] text-ink-muted">{idea.subtitle}</p>
                <p className="mt-2 text-[11px] font-medium text-ink-muted">
                  Est. ₹{(idea.estimatedBudgetINR / 1000).toFixed(1)}k
                </p>
              </div>
            </Card>
          </motion.button>
        ))}
      </div>
    </motion.section>
  );
}
