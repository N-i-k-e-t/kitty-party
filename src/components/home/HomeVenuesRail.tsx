"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { fadeUpSoft, staggerChildrenPreset, withReducedMotion } from "@/lib/motion";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { recommendVenues, estimateDistanceKm } from "@/lib/engines/venues";
import { VenueMiniCard } from "@/components/features/venues/VenueMiniCard";
import { usePreferencesStore } from "@/store/preferences";
import { useEffect, useState } from "react";
import { loadMemoryState } from "@/lib/memory";

export function NearbyVenueRail() {
  const prefs = usePreferencesStore((s) => s.preferences);
  const router = useRouter();
  const [memVenues, setMemVenues] = useState<string[]>([]);
  useEffect(() => {
    void loadMemoryState().then((m) => setMemVenues(m.savedVenueIds));
  }, []);
  const list = recommendVenues(
    {
      city: prefs.city,
      vibes: prefs.vibes,
      groupSize: prefs.groupSize,
      budget: Math.round((prefs.budgetMin + prefs.budgetMax) / 2),
      indoorOutdoor: prefs.indoorVsOutdoor,
      userLat: prefs.lat,
      userLng: prefs.lng,
    },
    8,
  );
  const biased = [...list].sort((a, b) => {
    const ba = memVenues.includes(a.id) ? 1 : 0;
    const bb = memVenues.includes(b.id) ? 1 : 0;
    return bb - ba;
  });
  return (
    <motion.section
      variants={withReducedMotion(staggerChildrenPreset)}
      initial="hidden"
      animate="show"
      className="mb-saheli-24"
    >
      <SectionHeader title="Nearby venues" subtitle="Curated for your city and vibe" />
      <div className="-mx-saheli-4 flex gap-saheli-12 overflow-x-auto px-saheli-4 pb-saheli-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
        {biased.slice(0, 6).map((v) => (
          <motion.div key={v.id} variants={withReducedMotion(fadeUpSoft)}>
            <VenueMiniCard
              venue={v}
              distanceKm={estimateDistanceKm(
                prefs.lat && prefs.lng ? { lat: prefs.lat, lng: prefs.lng } : undefined,
                v,
              )}
              onSelect={() => router.push(`/discover?city=${encodeURIComponent(prefs.city)}`)}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
