"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUp, staggerChildren } from "@/lib/motion";
import { usePlansStore } from "@/store/plans";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { useUiStore } from "@/store/ui";

function loadVotes(id: string): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(`saheli-votes-${id}`);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function saveVotes(id: string, v: Record<string, number>) {
  window.sessionStorage.setItem(`saheli-votes-${id}`, JSON.stringify(v));
}

export default function SharePlanPage() {
  const params = useParams<{ id: string }>();
  const hydrate = usePlansStore((s) => s.hydrate);
  const plans = usePlansStore((s) => s.plans);
  const plan = plans.find((p) => p.id === params.id) ?? null;
  const toast = useUiStore((s) => s.pushToast);
  const planId = plan?.id;
  const [votes, setVotes] = useState<Record<string, number>>({});

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!planId) return;
    queueMicrotask(() => setVotes(loadVotes(planId)));
  }, [planId]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/plan/${params.id}/share`;
  }, [params.id]);

  const lastAssistant = plan?.messages.filter((m) => m.role === "assistant").at(-1);

  function bump(option: string) {
    if (!plan) return;
    const next = { ...votes, [option]: (votes[option] ?? 0) + 1 };
    saveVotes(plan.id, next);
    setVotes(next);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    toast({ title: "Link copied", description: "Share gently, gather joyfully." });
  }

  if (!plan) {
    return (
      <div className="py-20 text-center text-sm text-ink-muted">
        This share link has no local plan data.{" "}
        <Link href="/" className="font-medium text-ink underline">
          Home
        </Link>
      </div>
    );
  }

  const wa = `https://wa.me/?text=${encodeURIComponent(`You’re invited to peek at our Saheli plan ✨\n${shareUrl}`)}`;

  return (
    <motion.div variants={staggerChildren(0.05)} initial="hidden" animate="show" className="mx-auto max-w-lg space-y-4 py-4">
      <motion.div variants={fadeUp}>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-ink-muted">Shared plan</p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-ink">{plan.title}</h1>
        <p className="text-sm text-ink-muted">{plan.city}</p>
      </motion.div>
      <motion.div variants={fadeUp}>
        <Card variant="gradient" padding="lg">
          <p className="text-sm leading-relaxed text-ink">{lastAssistant?.content ?? "Your circle saved this gathering outline locally."}</p>
        </Card>
      </motion.div>
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void copyLink()}>
          Copy link
        </Button>
        <a href={wa} target="_blank" rel="noreferrer">
          <Button variant="soft" type="button">
            WhatsApp share
          </Button>
        </a>
      </motion.div>
      <motion.div variants={fadeUp}>
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">Circle pulse (local mock)</p>
        <div className="flex flex-wrap gap-2">
          {["Date A", "Date B", "Surprise me"].map((opt) => (
            <Chip key={opt} onClick={() => bump(opt)}>
              {opt} · {votes[opt] ?? 0}
            </Chip>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink-muted">Votes stay on this device — a whisper of future RSVPs.</p>
      </motion.div>
    </motion.div>
  );
}
