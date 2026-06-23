"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUpSoft, withReducedMotion } from "@/lib/motion";
import { usePlansStore } from "@/store/plans";
import { usePreferencesStore } from "@/store/preferences";
import { themes } from "@/data/themes";
import { generateInvitationBundle } from "@/lib/engines/invitation";
import type { InvitationBundle, SavedPlan } from "@/lib/types";
import { Tabs } from "@/components/ui/Tabs";
import { Input } from "@/components/ui/Input";
import { WhatsAppPreview } from "@/components/invitation/WhatsAppPreview";

const InvitationPoster = dynamic(
  () => import("@/components/invitation/InvitationPoster").then((m) => ({ default: m.InvitationPoster })),
  { ssr: false, loading: () => <div className="h-80 animate-pulse rounded-2xl bg-surface-raised" /> },
);

function InviteEditor({ plan }: { plan: SavedPlan }) {
  const prefs = usePreferencesStore((s) => s.preferences);
  const [tab, setTab] = useState<"poster" | "story" | "wa">("poster");
  const [localTitle, setLocalTitle] = useState(plan.title);
  const [dateLabel, setDateLabel] = useState("Next Sunday, 11 am onwards");

  const theme = useMemo(() => themes.find((t) => t.id === plan.workspace.themeId), [plan.workspace.themeId]);

  const bundle: InvitationBundle = useMemo(
    () =>
      generateInvitationBundle({
        hostName: prefs.name,
        city: plan.city,
        dateLabel,
        theme,
        groupSize: prefs.groupSize,
      }),
    [prefs.name, prefs.groupSize, plan.city, dateLabel, theme],
  );

  return (
    <motion.div variants={withReducedMotion(fadeUpSoft)} initial="hidden" animate="show" className="grid gap-saheli-24 lg:grid-cols-2">
      <div className="space-y-saheli-16">
        <Tabs
          tabs={[
            { id: "poster", label: "Poster" },
            { id: "story", label: "Story" },
            { id: "wa", label: "WhatsApp" },
          ]}
          value={tab}
          onChange={(id) => setTab(id as typeof tab)}
        />
        <div className="space-y-saheli-12">
          <label className="label text-ink-muted" htmlFor="ititle">
            Title
          </label>
          <Input id="ititle" value={localTitle} onChange={(e) => setLocalTitle(e.target.value)} />
          <label className="label text-ink-muted" htmlFor="idate">
            Date line
          </label>
          <Input id="idate" value={dateLabel} onChange={(e) => setDateLabel(e.target.value)} />
        </div>
        {tab === "wa" ? <WhatsAppPreview bundle={bundle} /> : null}
      </div>
      <div>
        {tab === "poster" ? <InvitationPoster theme={theme} bundle={bundle} /> : null}
        {tab === "story" ? (
          <div className="mx-auto flex aspect-[9/16] w-full max-w-sm flex-col justify-end rounded-2xl border border-stroke-subtle gradient-bollywood-twilight p-saheli-16 text-ivory-50 shadow-elev-2">
            <p className="caption opacity-80">Story preview</p>
            <p className="h-3 mt-saheli-8">{localTitle}</p>
            <p className="body-sm mt-saheli-12 opacity-90">{dateLabel}</p>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export default function InvitePlanPage() {
  const params = useParams<{ planId: string }>();
  const hydrate = usePlansStore((s) => s.hydrate);
  const plan = usePlansStore((s) => s.plans.find((p) => p.id === params.planId));

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.title = "Saheli — Invite";
  }, []);

  if (!plan) {
    return (
      <div className="py-saheli-40 text-center body-sm text-ink-muted">
        Plan not found.{" "}
        <Link href="/invite" className="underline">
          Back
        </Link>
      </div>
    );
  }

  return <InviteEditor key={plan.id} plan={plan} />;
}
