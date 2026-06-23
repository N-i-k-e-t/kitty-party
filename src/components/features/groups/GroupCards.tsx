"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUpSoft, withReducedMotion } from "@/lib/motion";
import { Card } from "@/components/ui/Card";
import { AvatarGroup } from "@/components/ui/Avatar";
import type { Circle } from "@/lib/groups";
import { cn } from "@/lib/cn";

export function GroupCard({
  group,
  memberNames,
  rsvpGoing,
}: {
  group: Circle;
  memberNames: string[];
  rsvpGoing: number;
}) {
  return (
    <Link href={`/groups/${group.id}`}>
      <motion.div variants={withReducedMotion(fadeUpSoft)} whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 420, damping: 28 }}>
        <Card variant="raised" padding="sm" className="h-full overflow-hidden">
          <div className="relative h-28 w-full overflow-hidden rounded-xl">
            {group.coverImage ? (
              <Image src={group.coverImage} alt="" fill className="object-cover" sizes="320px" />
            ) : (
              <div className="h-full w-full gradient-dawn" />
            )}
          </div>
          <div className="mt-saheli-12 space-y-saheli-8 px-0.5">
            <p className="title text-ink-strong">{group.name}</p>
            <p className="caption text-ink-muted">{group.typeLabel}</p>
            <AvatarGroup names={memberNames} max={4} />
            <div className="flex items-center justify-between gap-saheli-8">
              <p className="caption text-ink-muted">
                {group.nextEventAt ? new Date(group.nextEventAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }) : "Date TBC"}
              </p>
              <p className="caption font-medium text-champagne-700">{rsvpGoing} going</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}

export function MiniPlanCard({ planId, title, subtitle }: { planId: string; title: string; subtitle?: string }) {
  return (
    <Link href={`/plan/${planId}`}>
      <Card variant="glass" padding="md" className={cn("hover:shadow-elev-2")}>
        <p className="title text-ink-strong">{title}</p>
        {subtitle ? <p className="caption mt-1 text-ink-muted">{subtitle}</p> : null}
      </Card>
    </Link>
  );
}
