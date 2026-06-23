"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { fadeUpSoft, staggerChildrenPreset, withReducedMotion } from "@/lib/motion";
import { HeroGreeting } from "@/components/patterns/HeroGreeting";
import { GroupCard } from "@/components/features/groups/GroupCards";
import { CreateGroupSheet } from "@/components/features/groups/CreateGroupSheet";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SoftIllustration } from "@/components/ui/SoftIllustration";
import { loadGroupsBundle, type GroupsBundle } from "@/lib/groups";
import { AssistantTipBanner } from "@/components/features/assistant/AssistantTipBanner";

export default function GroupsPage() {
  const [bundle, setBundle] = useState<GroupsBundle | null>(null);
  const [sheet, setSheet] = useState(false);

  const refresh = useCallback(async () => {
    setBundle(await loadGroupsBundle());
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void refresh();
    });
    document.title = "Saheli — Circles";
  }, [refresh]);

  const rows = useMemo(() => {
    if (!bundle) return [];
    return bundle.circles.map((g) => {
      const members = bundle.membersByCircle[g.id] ?? [];
      const rsvps = bundle.rsvpsByCircle[g.id] ?? [];
      const going = rsvps.filter((r) => r.status === "going").length;
      return { g, memberNames: members.map((m) => m.name), going };
    });
  }, [bundle]);

  if (!bundle) {
    return <div className="py-saheli-40 text-center body-sm text-ink-muted">Opening circles…</div>;
  }

  return (
    <motion.div
      variants={withReducedMotion(staggerChildrenPreset)}
      initial="hidden"
      animate="show"
      className="space-y-saheli-24 pb-saheli-24"
    >
      <motion.div variants={withReducedMotion(fadeUpSoft)}>
        <AssistantTipBanner
          message="Bring a venue from Discover into your planner — your circle will feel the warmth."
          actions={[{ label: "Discover", prompt: "Suggest three venues that fit my saved preferences" }]}
        />
      </motion.div>
      <HeroGreeting variant="circles" />
      {rows.length === 0 ? (
        <EmptyState
          title="Begin your first circle"
          description="Gather RSVPs, votes, and shared plans in one gentle place."
          icon={<SoftIllustration name="circle" className="h-16 w-16" />}
          action={
            <Button type="button" onClick={() => setSheet(true)}>
              Start a circle
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-saheli-12 md:grid-cols-3 lg:grid-cols-4">
          {rows.map(({ g, memberNames, going }) => (
            <GroupCard key={g.id} group={g} memberNames={memberNames} rsvpGoing={going} />
          ))}
        </div>
      )}
      <Button type="button" className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] left-1/2 z-20 min-h-11 -translate-x-1/2 rounded-pill px-saheli-24 shadow-elev-3 lg:left-[calc(50%+110px)]" onClick={() => setSheet(true)}>
        Start a circle
      </Button>
      <CreateGroupSheet open={sheet} onClose={() => setSheet(false)} onCreated={refresh} />
    </motion.div>
  );
}
