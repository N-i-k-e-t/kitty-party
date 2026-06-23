"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cardHoverLift, withReducedMotion } from "@/lib/motion";
import type { Venue } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { vibeLabel } from "@/store/preferences";
import { cn } from "@/lib/cn";

export function VenueMiniCard({
  venue,
  distanceKm,
  className,
  onSelect,
}: {
  venue: Venue;
  distanceKm?: number | null;
  className?: string;
  onSelect?: () => void;
}) {
  const [pmin] = venue.priceRangeINR;
  const vibe = venue.vibeTags[0];
  return (
    <motion.button
      type="button"
      variants={withReducedMotion(cardHoverLift)}
      initial="rest"
      whileHover="hover"
      onClick={onSelect}
      className={cn("w-[140px] shrink-0 snap-start text-left", className)}
    >
      <Card variant="raised" padding="sm" className="overflow-hidden">
        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
          <Image src={venue.image} alt={venue.name} fill className="object-cover" sizes="140px" />
        </div>
        <p className="title mt-saheli-8 line-clamp-2 px-0.5 text-ink-strong">{venue.name}</p>
        <div className="mt-saheli-8 flex items-center justify-between gap-saheli-8 px-0.5">
          {vibe ? <Pill>{vibeLabel(vibe)}</Pill> : <span />}
          <span className="caption font-semibold text-champagne-700">₹{(pmin / 1000).toFixed(0)}k</span>
        </div>
        {distanceKm != null ? <p className="caption mt-1 px-0.5 text-ink-muted">~{distanceKm} km</p> : null}
      </Card>
    </motion.button>
  );
}
