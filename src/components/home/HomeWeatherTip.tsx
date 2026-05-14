"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { Card } from "@/components/ui/Card";
import { getMockWeather } from "@/lib/context/weather";
import { usePreferencesStore } from "@/store/preferences";

export function HomeWeatherTip() {
  const city = usePreferencesStore((s) => s.preferences.city);
  const w = getMockWeather(city);
  return (
    <motion.section variants={fadeUp} initial="hidden" animate="show" className="mb-6">
      <Card variant="glass" padding="md">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">Weather-aware</p>
        <p className="mt-2 text-sm text-ink">
          {w.tip} <span className="text-ink-muted">({w.city})</span>
        </p>
      </Card>
    </motion.section>
  );
}
