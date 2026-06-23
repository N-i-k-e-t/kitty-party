"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { cardHoverLift, withReducedMotion } from "@/lib/motion";
import type { Venue } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Pill } from "@/components/ui/Pill";
import { Stat } from "@/components/ui/Stat";
import { Button } from "@/components/ui/Button";
import { vibeLabel } from "@/store/preferences";
import { cn } from "@/lib/cn";

export function VenueListCard({
  venue,
  distanceKm,
  className,
  onOpen,
}: {
  venue: Venue;
  distanceKm?: number | null;
  className?: string;
  onOpen?: () => void;
}) {
  return (
    <motion.button
      type="button"
      variants={withReducedMotion(cardHoverLift)}
      initial="rest"
      whileHover="hover"
      onClick={onOpen}
      className={cn("flex w-full gap-saheli-12 rounded-2xl border border-stroke-subtle bg-surface-raised p-saheli-12 text-left shadow-elev-1", className)}
    >
      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg">
        <Image src={venue.image} alt="" fill className="object-cover" sizes="80px" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="title text-ink-strong">{venue.name}</p>
        <p className="caption text-ink-muted">
          {venue.area} · {venue.city}
          {distanceKm != null ? ` · ~${distanceKm} km` : ""}
        </p>
        <p className="caption mt-1 text-champagne-700">★ {venue.rating.toFixed(1)}</p>
      </div>
    </motion.button>
  );
}

export function VenueCard({
  venue,
  distanceKm,
  className,
  onOpenDetails,
  onSave,
}: {
  venue: Venue;
  distanceKm?: number | null;
  className?: string;
  onOpenDetails?: () => void;
  onSave?: () => void;
}) {
  const [pmin, pmax] = venue.priceRangeINR;
  const pills = venue.vibeTags.slice(0, 3);
  return (
    <motion.div variants={withReducedMotion(cardHoverLift)} initial="rest" whileHover="hover" className={cn("h-full", className)}>
      <Card variant="raised" padding="sm" className="flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl">
          <Image src={venue.image} alt={venue.name} fill className="object-cover" sizes="(max-width:768px) 100vw, 320px" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-900/25 via-transparent to-ink-900/35" />
          <div className="absolute bottom-2 left-2 right-2">
            <p className="h-3 line-clamp-2 text-ivory-50 drop-shadow-sm">{venue.name}</p>
            <p className="caption mt-1 text-ivory-100/90">
              {venue.area} · {venue.city}
            </p>
          </div>
        </div>
        <div className="mt-saheli-12 flex flex-wrap gap-saheli-8 px-0.5">
          {pills.map((v) => (
            <Pill key={v}>{vibeLabel(v)}</Pill>
          ))}
        </div>
        <div className="mt-saheli-12 grid grid-cols-2 gap-saheli-8 px-0.5">
          <Stat label="Price" value={`₹${(pmin / 1000).toFixed(0)}k–₹${(pmax / 1000).toFixed(0)}k`} />
          <Stat label="Distance" value={distanceKm != null ? `~${distanceKm} km` : "—"} />
        </div>
        <div className="mt-auto flex gap-saheli-8 pt-saheli-16">
          {onSave ? (
            <Button type="button" size="sm" variant="soft" className="flex-1" onClick={onSave}>
              Save
            </Button>
          ) : null}
          {onOpenDetails ? (
            <Button type="button" size="sm" variant="glass" className="flex-1" onClick={onOpenDetails}>
              Open details
            </Button>
          ) : null}
        </div>
      </Card>
    </motion.div>
  );
}
