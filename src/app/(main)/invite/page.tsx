"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpSoft, withReducedMotion } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function InviteLandingPage() {
  return (
    <motion.div variants={withReducedMotion(fadeUpSoft)} initial="hidden" animate="show" className="mx-auto max-w-lg space-y-saheli-24 py-saheli-16">
      <div>
        <h1 className="h-2 text-ink-strong">Invitation studio</h1>
        <p className="body-sm mt-saheli-8 text-ink-muted">Pick a saved plan to craft a poster, story, and WhatsApp text.</p>
      </div>
      <Card variant="glass" padding="lg" className="space-y-saheli-12">
        <p className="body-sm text-ink-body">Open a plan from the planner, then generate invites tuned to its theme.</p>
        <Link href="/plan">
          <Button type="button" className="w-full">
            Go to planner
          </Button>
        </Link>
      </Card>
    </motion.div>
  );
}
