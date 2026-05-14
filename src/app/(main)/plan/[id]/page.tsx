"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { usePlansStore } from "@/store/plans";
import { PlanChat } from "@/components/plan/PlanChat";
import { Button } from "@/components/ui/Button";

export default function PlanDetailPage() {
  const params = useParams<{ id: string }>();
  const hydrate = usePlansStore((s) => s.hydrate);
  const plans = usePlansStore((s) => s.plans);
  const plan = plans.find((p) => p.id === params.id) ?? null;

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!plan) {
    return (
      <div className="py-20 text-center text-sm text-ink-muted">
        Plan not found — it may live on another device.{" "}
        <Link href="/plan" className="font-medium text-ink underline">
          Start fresh
        </Link>
      </div>
    );
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink">{plan.title}</h1>
          <p className="text-sm text-ink-muted">{plan.city}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/invite/${plan.id}`}>
            <Button variant="glass" type="button">
              Invitation studio
            </Button>
          </Link>
          <Link href={`/plan/${plan.id}/share`}>
            <Button variant="soft" type="button">
              Share view
            </Button>
          </Link>
          <Link href="/plan">
            <Button type="button">New chat</Button>
          </Link>
        </div>
      </div>
      <PlanChat
        plan={plan}
        readOnly
        onSend={async () => {}}
        onPinCard={async () => {}}
      />
    </motion.div>
  );
}
