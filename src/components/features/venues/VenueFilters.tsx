"use client";

import { useMemo, useState } from "react";
import type { UserPreferences, VibeTag } from "@/lib/types";
import { venues } from "@/data/venues";
import { Select } from "@/components/ui/Select";
import { Chip } from "@/components/ui/Chip";
import { majorIndianCities } from "@/data/cities";

const vibes: VibeTag[] = ["cozy", "glam", "traditional", "playful", "boho", "luxe"];

export function useVenueFilters(searchParams: { city?: string }) {
  const [city, setCity] = useState(searchParams.city ?? "Mumbai");
  const [vibe, setVibe] = useState<VibeTag | "any">("any");
  const [io, setIo] = useState<UserPreferences["indoorVsOutdoor"] | "any">("any");
  const [price, setPrice] = useState<"any" | "low" | "mid" | "high">("any");

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      if (v.city !== city) return false;
      if (vibe !== "any" && !v.vibeTags.includes(vibe)) return false;
      if (io !== "any" && io !== "either") {
        if (io === "indoor" && !v.indoor) return false;
        if (io === "outdoor" && !v.outdoor) return false;
      }
      const maxp = v.priceRangeINR[1];
      if (price === "low" && maxp > 45000) return false;
      if (price === "mid" && (maxp <= 45000 || maxp > 150000)) return false;
      if (price === "high" && maxp <= 150000) return false;
      return true;
    });
  }, [city, io, price, vibe]);

  return { city, setCity, vibe, setVibe, io, setIo, price, setPrice, filtered };
}

export function VenueFiltersBar(props: ReturnType<typeof useVenueFilters>) {
  const { city, setCity, vibe, setVibe, io, setIo, price, setPrice } = props;
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-[11px] font-medium text-ink-muted">City</p>
          <Select value={city} onChange={(e) => setCity(e.target.value)}>
            {majorIndianCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <p className="mb-1 text-[11px] font-medium text-ink-muted">Price band</p>
          <Select
            value={price}
            onChange={(e) => setPrice(e.target.value as typeof price)}
          >
            <option value="any">Any</option>
            <option value="low">Under ₹45k max</option>
            <option value="mid">₹45k–₹1.5L</option>
            <option value="high">Above ₹1.5L</option>
          </Select>
        </div>
      </div>
      <div>
        <p className="mb-1 text-[11px] font-medium text-ink-muted">Vibe</p>
        <div className="flex flex-wrap gap-2">
          <Chip className={vibe === "any" ? "border-champagne-deep bg-champagne/40" : ""} onClick={() => setVibe("any")}>
            Any
          </Chip>
          {vibes.map((v) => (
            <Chip key={v} className={vibe === v ? "border-champagne-deep bg-champagne/40" : ""} onClick={() => setVibe(v)}>
              {v}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1 text-[11px] font-medium text-ink-muted">Setting</p>
        <div className="flex flex-wrap gap-2">
          {(["any", "indoor", "outdoor"] as const).map((x) => (
            <Chip key={x} className={io === x ? "border-champagne-deep bg-champagne/40" : ""} onClick={() => setIo(x)}>
              {x}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
