"use client";

import Image from "next/image";
import type { Venue } from "@/lib/types";
import { Sheet } from "@/components/ui/Sheet";
import { Pill } from "@/components/ui/Pill";
import { Stat } from "@/components/ui/Stat";
import { vibeLabel } from "@/store/preferences";
import { Button } from "@/components/ui/Button";

export function VenueDetailsSheet({
  venue,
  open,
  onClose,
  distanceKm,
  onSave,
}: {
  venue: Venue | null;
  open: boolean;
  onClose: () => void;
  distanceKm?: number | null;
  onSave?: () => void;
}) {
  if (!venue) return null;
  const [pmin, pmax] = venue.priceRangeINR;
  return (
    <Sheet open={open} onClose={onClose} side="bottom">
      <div className="max-h-[min(88dvh,720px)] overflow-y-auto p-saheli-24">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl">
          <Image src={venue.image} alt={venue.name} fill className="object-cover" sizes="480px" />
        </div>
        <p className="h-2 mt-saheli-16 text-ink-strong">{venue.name}</p>
        <p className="body-sm mt-saheli-8 text-ink-muted">
          {venue.area} · {venue.city}
        </p>
        <div className="mt-saheli-12 flex flex-wrap gap-saheli-8">
          {venue.vibeTags.slice(0, 4).map((v) => (
            <Pill key={v}>{vibeLabel(v)}</Pill>
          ))}
        </div>
        <div className="mt-saheli-16 grid grid-cols-2 gap-saheli-12">
          <Stat label="Price band" value={`₹${(pmin / 1000).toFixed(0)}k–₹${(pmax / 1000).toFixed(0)}k`} />
          <Stat label="Group" value={`${venue.minGroup}–${venue.maxGroup}`} />
          <Stat label="Rating" value={`★ ${venue.rating.toFixed(1)}`} />
          <Stat label="Distance" value={distanceKm != null ? `~${distanceKm} km` : "—"} />
        </div>
        <p className="body-sm mt-saheli-16 text-ink-body">{venue.description}</p>
        <div className="mt-saheli-24 flex gap-saheli-12">
          {onSave ? (
            <Button type="button" className="flex-1" onClick={onSave}>
              Save venue
            </Button>
          ) : null}
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
