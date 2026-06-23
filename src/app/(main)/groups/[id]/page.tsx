"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUpSoft, staggerChildrenPreset, withReducedMotion } from "@/lib/motion";
import { Card } from "@/components/ui/Card";
import { Tabs } from "@/components/ui/Tabs";
import { Chip } from "@/components/ui/Chip";
import { MiniPlanCard } from "@/components/features/groups/GroupCards";
import { KittyFundPanel } from "@/components/features/groups/KittyFundPanel";
import { loadGroupsBundle, patchRsvp, bumpVote, type GroupsBundle, type RsvpStatus } from "@/lib/groups";
import { EmptyState } from "@/components/ui/EmptyState";

export default function GroupDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [bundle, setBundle] = useState<GroupsBundle | null>(null);
  const [tab, setTab] = useState("plans");

  const refresh = useCallback(async () => {
    setBundle(await loadGroupsBundle());
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
  }, [refresh, id]);

  useEffect(() => {
    document.title = "Saheli — Circle";
  }, []);

  const group = bundle?.circles.find((c) => c.id === id);
  const members = bundle?.membersByCircle[id ?? ""] ?? [];
  const plans = bundle?.planRefsByCircle[id ?? ""] ?? [];
  const rsvps = useMemo(() => bundle?.rsvpsByCircle[id ?? ""] ?? [], [bundle, id]);
  const votes = bundle?.votesByCircle[id ?? ""] ?? [];
  const activity = bundle?.activityByCircle[id ?? ""] ?? [];
  const kittyFund = bundle?.kittyFundsByCircle[id ?? ""];

  const goingCount = useMemo(() => rsvps.filter((r) => r.status === "going").length, [rsvps]);

  if (!bundle || !group) {
    return (
      <div className="py-saheli-40 text-center body-sm text-ink-muted">
        Circle not found.{" "}
        <Link href="/groups" className="font-medium text-ink-strong underline">
          Back
        </Link>
      </div>
    );
  }

  return (
    <motion.div variants={withReducedMotion(staggerChildrenPreset)} initial="hidden" animate="show" className="space-y-saheli-24">
      <motion.div variants={withReducedMotion(fadeUpSoft)} className="overflow-hidden rounded-2xl border border-stroke-subtle gradient-dawn p-saheli-24">
        <p className="caption text-ink-muted">{group.typeLabel}</p>
        <h1 className="h-2 mt-saheli-8 text-ink-strong">{group.name}</h1>
        <p className="body-sm mt-saheli-8 text-ink-muted">{goingCount} going · next date TBC</p>
      </motion.div>
      <Tabs
        tabs={[
          { id: "plans", label: "Plans" },
          { id: "rsvps", label: "RSVPs" },
          { id: "votes", label: "Votes" },
          { id: "kitty", label: "Kitty Fund 💰" },
          { id: "activity", label: "Activity" },
          { id: "album", label: "Album" },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === "plans" ? (
        <div className="space-y-saheli-12">
          {plans.length === 0 ? (
            <EmptyState title="No plans linked yet" description="Save a plan, then deep-link from planner." />
          ) : (
            plans.map((p) => <MiniPlanCard key={p.planId} planId={p.planId} title={p.title} subtitle={new Date(p.updatedAt).toLocaleDateString()} />)
          )}
        </div>
      ) : null}
      {tab === "rsvps" ? (
        <Card variant="flat" padding="md" className="space-y-saheli-12">
          <p className="title">Going · {goingCount}</p>
          <div className="space-y-saheli-8">
            {members.map((m) => {
              const row = rsvps.find((r) => r.memberId === m.id);
              const status: RsvpStatus = row?.status ?? "maybe";
              return (
                <div key={m.id} className="flex flex-wrap items-center justify-between gap-saheli-8 border-b border-stroke-subtle py-saheli-8 last:border-0">
                  <p className="body-sm font-medium text-ink-strong">
                    {m.avatarEmoji} {m.name}
                  </p>
                  <div className="flex flex-wrap gap-saheli-8">
                    {(["going", "maybe", "declined"] as const).map((s) => (
                      <Chip
                        key={s}
                        className={status === s ? "border-champagne-600 bg-champagne-200/70" : ""}
                        onClick={() => void patchRsvp(group.id, m.id, s).then(refresh)}
                      >
                        {s}
                      </Chip>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}
      {tab === "votes" ? (
        <div className="space-y-saheli-16">
          {votes.map((poll) => (
            <Card key={poll.id} variant="glass" padding="md">
              <p className="title text-ink-strong">{poll.question}</p>
              <div className="mt-saheli-12 flex flex-wrap gap-saheli-8">
                {poll.options.map((opt) => (
                  <Chip key={opt} onClick={() => void bumpVote(group.id, poll.id, "m1", opt).then(refresh)}>
                    {opt}
                  </Chip>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : null}
      {tab === "activity" ? (
        <ul className="space-y-saheli-12">
          {activity.map((a) => (
            <li key={a.id} className="body-sm text-ink-body">
              <span className="font-semibold text-ink-strong">{a.actorName}</span> {a.message}{" "}
              <span className="caption text-ink-muted">· {new Date(a.at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {tab === "kitty" ? (
        <KittyFundPanel
          circleId={group.id}
          members={members}
          kittyFund={kittyFund}
          onRefresh={refresh}
        />
      ) : null}
      {tab === "album" ? (
        <div className="grid grid-cols-3 gap-saheli-8">
          {plans.map((p) => (
            <div key={p.planId} className="aspect-square rounded-xl bg-gradient-lavender-mist" />
          ))}
        </div>
      ) : null}
    </motion.div>
  );
}
