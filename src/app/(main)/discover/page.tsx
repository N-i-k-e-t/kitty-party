"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUpSoft, sheetOpen, staggerChildrenPreset, withReducedMotion } from "@/lib/motion";
import { VenueFiltersBar, useVenueFilters } from "@/components/features/venues/VenueFilters";
import { VenueCard } from "@/components/features/venues/VenueCard";
import { VenueMap } from "@/components/features/venues/VenueMap";
import { VenueDetailsSheet } from "@/components/features/venues/VenueDetailsSheet";
import { estimateDistanceKm } from "@/lib/engines/venues";
import { usePreferencesStore } from "@/store/preferences";
import { FilterBar } from "@/components/patterns/FilterBar";
import { PinterestGrid } from "@/components/patterns/PinterestGrid";
import { Button } from "@/components/ui/Button";
import { AssistantTipBanner } from "@/components/features/assistant/AssistantTipBanner";
import { getMockWeather } from "@/lib/context/weather";
import { toggleSavedVenue } from "@/lib/memory";
import type { Venue } from "@/lib/types";
import Link from "next/link";

function DiscoverInner({ cityParam }: { cityParam?: string }) {
  const filters = useVenueFilters({ city: cityParam });
  const prefs = usePreferencesStore((s) => s.preferences);
  const city = prefs.city;
  const weather = useMemo(() => getMockWeather(city), [city]);
  const [mode, setMode] = useState<"list" | "map">("list");
  const [detail, setDetail] = useState<Venue | null>(null);
  const [fav, setFav] = useState<Venue | null>(null);

  useEffect(() => {
    document.title = "Saheli — Discover";
  }, []);

  async function onSaveVenue(v: Venue) {
    await toggleSavedVenue(v.id);
    setFav(v);
  }

  return (
    <motion.div
      variants={withReducedMotion(staggerChildrenPreset)}
      initial="hidden"
      animate="show"
      className="space-y-saheli-16"
    >
      <motion.div variants={withReducedMotion(fadeUpSoft)}>
        <h1 className="h-2 text-ink-strong">Discover venues</h1>
        <p className="body-sm mt-saheli-8 text-ink-muted">Filters and a living map of your shortlist.</p>
      </motion.div>
      <motion.div variants={withReducedMotion(fadeUpSoft)}>
        <AssistantTipBanner
          tone={weather.days[1].precipChance > 0.45 ? "warning" : "info"}
          message={weather.tip}
          actions={[
            { label: "Plan with venues", prompt: "Suggest three venues that fit my saved preferences" },
          ]}
        />
      </motion.div>
      <FilterBar>
        <div className="flex min-w-max snap-start gap-saheli-12">
          <VenueFiltersBar {...filters} />
          <div className="flex shrink-0 items-center gap-saheli-8 self-center">
            <Button type="button" size="sm" variant={mode === "list" ? "primary" : "ghost"} onClick={() => setMode("list")}>
              List
            </Button>
            <Button type="button" size="sm" variant={mode === "map" ? "primary" : "ghost"} onClick={() => setMode("map")}>
              Map
            </Button>
          </div>
        </div>
      </FilterBar>
      {mode === "map" ? (
        <motion.div variants={withReducedMotion(fadeUpSoft)} className="h-72 overflow-hidden rounded-2xl border border-stroke-subtle">
          <VenueMap venues={filters.filtered} />
        </motion.div>
      ) : (
        <motion.div variants={withReducedMotion(fadeUpSoft)}>
          <PinterestGrid>
            {filters.filtered.map((v) => (
              <div key={v.id} className="mb-saheli-12 break-inside-avoid">
                <VenueCard
                  venue={v}
                  distanceKm={estimateDistanceKm(
                    prefs.lat && prefs.lng ? { lat: prefs.lat, lng: prefs.lng } : undefined,
                    v,
                  )}
                  onOpenDetails={() => setDetail(v)}
                  onSave={() => void onSaveVenue(v)}
                />
              </div>
            ))}
          </PinterestGrid>
        </motion.div>
      )}
      <VenueDetailsSheet
        venue={detail}
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        distanceKm={
          detail
            ? estimateDistanceKm(prefs.lat && prefs.lng ? { lat: prefs.lat, lng: prefs.lng } : undefined, detail)
            : undefined
        }
        onSave={detail ? () => void onSaveVenue(detail) : undefined}
      />
      <AnimatePresence>
        {fav ? (
          <motion.div
            key={fav.id}
            variants={withReducedMotion(sheetOpen)}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] left-saheli-16 right-saheli-16 z-30 lg:left-[260px]"
          >
            <div className="glass flex flex-wrap items-center justify-between gap-saheli-12 rounded-2xl border border-stroke-subtle px-saheli-16 py-saheli-12 shadow-elev-2">
              <p className="body-sm text-ink-body">
                I&apos;ll bring <span className="font-semibold text-ink-strong">{fav.name}</span> to your plan.
              </p>
              <div className="flex gap-saheli-8">
                <Link href="/plan">
                  <Button type="button" size="sm">
                    Open planner
                  </Button>
                </Link>
                <Button type="button" size="sm" variant="ghost" onClick={() => setFav(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="py-saheli-40 text-center body-sm text-ink-muted">Opening discover…</div>}>
      <DiscoverSuspense />
    </Suspense>
  );
}

function DiscoverSuspense() {
  const params = useSearchParams();
  const cityParam = params.get("city") ?? undefined;
  return <DiscoverInner key={cityParam ?? "default"} cityParam={cityParam} />;
}
