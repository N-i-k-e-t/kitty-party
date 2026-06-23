"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Venue } from "@/lib/types";

const MapInner = dynamic(() => import("./VenueMapInner"), { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-2xl bg-white/50" /> });

export function VenueMap({ venues: v }: { venues: Venue[] }) {
  const center = useMemo(() => {
    if (!v.length) return { lat: 19.076, lng: 72.8777 };
    const lat = v.reduce((a, x) => a + x.lat, 0) / v.length;
    const lng = v.reduce((a, x) => a + x.lng, 0) / v.length;
    return { lat, lng };
  }, [v]);
  return <MapInner venues={v} center={center} />;
}
