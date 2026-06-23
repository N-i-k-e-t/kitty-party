"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { successBloom, staggerChildrenPreset, withReducedMotion } from "@/lib/motion";
import type { GatheringIdea } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function WowReveal({
  ideas,
  onContinue,
}: {
  ideas: GatheringIdea[];
  onContinue: () => void;
}) {
  return (
    <motion.div
      variants={withReducedMotion(staggerChildrenPreset)}
      initial="hidden"
      animate="show"
      className="space-y-saheli-24 text-center"
    >
      <p className="h-2 text-ink-strong">Your first three sparks</p>
      <p className="body-sm text-ink-muted">Tap one when you land home — or explore freely.</p>
      <div className="grid gap-saheli-12 sm:grid-cols-3">
        {ideas.slice(0, 3).map((idea) => (
          <motion.div key={idea.id} variants={withReducedMotion(successBloom)} className="text-left">
            <Card variant="raised" padding="sm" className="overflow-hidden">
              <div className="relative h-32 w-full overflow-hidden rounded-xl">
                <Image src={idea.heroImage} alt="" fill className="object-cover" sizes="200px" />
              </div>
              <p className="title mt-saheli-8 px-1 text-ink-strong">{idea.title}</p>
              <p className="caption px-1 text-ink-muted line-clamp-2">{idea.subtitle}</p>
            </Card>
          </motion.div>
        ))}
      </div>
      <Button type="button" className="w-full max-w-xs" onClick={onContinue}>
        Take me home
      </Button>
    </motion.div>
  );
}
