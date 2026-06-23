"use client";

import { motion } from "framer-motion";
import {
  attentionNudge,
  cardHoverLift,
  chipPress,
  fadeUpSoft,
  loaderShimmer,
  routeCrossFade,
  sheetOpen,
  staggerChildren,
  successBloom,
} from "@/lib/motion";

const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

function swatchVar(family: "rose" | "champagne" | "lavender", step: (typeof STEPS)[number]): string {
  return `var(--saheli-${family}-${step})`;
}

export function DesignShowcase() {
  return (
    <div className="min-h-dvh bg-surface-canvas px-saheli-16 py-saheli-24 text-ink-body">
      <div className="mx-auto max-w-4xl space-y-saheli-24">
        <header>
          <p className="label text-ink-muted">Dev only</p>
          <h1 className="h-1 mt-2 text-ink-strong">Saheli tokens</h1>
          <p className="body-sm mt-2 text-ink-muted">Living reference for ramps, type utilities, glass, gradients, motion presets.</p>
        </header>

        <section className="space-y-saheli-12">
          <h2 className="h-2 text-ink-strong">Color ramps</h2>
          <div className="grid gap-saheli-12 sm:grid-cols-3">
            {(["rose", "champagne", "lavender"] as const).map((family) => (
              <div key={family} className="rounded-xl border border-stroke-subtle bg-surface-raised p-saheli-12">
                <p className="label text-ink-muted">{family}</p>
                <div className="mt-saheli-8 flex flex-wrap gap-1">
                  {STEPS.map((step) => (
                    <div
                      key={step}
                      title={`${family}-${step}`}
                      className="h-8 w-8 rounded-md border border-stroke-subtle"
                      style={{ backgroundColor: swatchVar(family, step) }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-saheli-12">
          <h2 className="h-2 text-ink-strong">Semantic and status</h2>
          <div className="flex flex-wrap gap-saheli-8">
            <div className="rounded-lg bg-surface-raised px-saheli-12 py-saheli-8 text-sm">surface-raised</div>
            <div className="rounded-lg bg-accent/20 px-saheli-12 py-saheli-8 text-sm text-ink-strong">accent tint</div>
            <div className="rounded-lg bg-success-100 px-saheli-12 py-saheli-8 text-sm text-success-700">success</div>
            <div className="rounded-lg bg-warning-100 px-saheli-12 py-saheli-8 text-sm text-warning-700">warning</div>
            <div className="rounded-lg bg-danger-100 px-saheli-12 py-saheli-8 text-sm text-danger-700">danger</div>
            <div className="rounded-lg bg-info-100 px-saheli-12 py-saheli-8 text-sm text-info-700">info</div>
          </div>
        </section>

        <section className="space-y-saheli-12">
          <h2 className="h-2 text-ink-strong">Typography utilities</h2>
          <div className="space-y-saheli-8 rounded-xl border border-stroke-subtle bg-ivory-50 p-saheli-16">
            <p className="h-display">Display</p>
            <p className="h-1">Heading 1</p>
            <p className="h-2">Heading 2</p>
            <p className="h-3">Heading 3</p>
            <p className="title">Title</p>
            <p className="body">Body copy for planner threads and cards.</p>
            <p className="body-sm">Body small for dense metadata.</p>
            <p className="caption">Caption line with slightly tracked letters.</p>
            <p className="label">Label strip</p>
            <p className="mono">mono · token · preview</p>
          </div>
        </section>

        <section className="space-y-saheli-12">
          <h2 className="h-2 text-ink-strong">Gradients</h2>
          <div className="grid gap-saheli-8 sm:grid-cols-2">
            <div className="h-14 rounded-lg gradient-dawn" />
            <div className="h-14 rounded-lg gradient-champagne-veil" />
            <div className="h-14 rounded-lg gradient-lavender-mist" />
            <div className="h-14 rounded-lg gradient-bollywood-twilight" />
            <div className="h-14 rounded-lg gradient-morning-tea" />
            <div className="h-14 rounded-lg gradient-champagne-lavender" />
          </div>
        </section>

        <section className="space-y-saheli-12">
          <h2 className="h-2 text-ink-strong">Glass and elevation</h2>
          <div className="grid gap-saheli-12 sm:grid-cols-2">
            <div className="rounded-2xl glass p-saheli-16 text-sm">glass</div>
            <div className="rounded-2xl glass-strong p-saheli-16 text-sm">glass-strong</div>
            <div
              className="rounded-2xl p-saheli-16 text-sm shadow-elev-1"
              style={{ background: "var(--elev-1-surface)", border: "var(--elev-1-border)" }}
            >
              Tier 1 surface and shadow-elev-1
            </div>
            <div
              className="rounded-2xl p-saheli-16 text-sm shadow-elev-3"
              style={{ background: "var(--elev-3-surface)", border: "var(--elev-3-border)" }}
            >
              Tier 3 surface and shadow-elev-3
            </div>
          </div>
        </section>

        <section className="space-y-saheli-12">
          <h2 className="h-2 text-ink-strong">Motion presets</h2>
          <motion.div
            className="flex flex-wrap gap-saheli-12"
            variants={staggerChildren(0.08)}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={fadeUpSoft} className="rounded-xl border border-stroke-subtle bg-white px-saheli-12 py-saheli-8 text-sm shadow-soft">
              fadeUpSoft
            </motion.div>
            <motion.div
              variants={sheetOpen}
              initial="hidden"
              animate="show"
              className="rounded-xl border border-stroke-subtle bg-white px-saheli-12 py-saheli-8 text-sm shadow-soft"
            >
              sheetOpen
            </motion.div>
            <motion.div variants={successBloom} initial="hidden" animate="show" className="rounded-xl border border-stroke-subtle bg-white px-saheli-12 py-saheli-8 text-sm shadow-soft">
              successBloom
            </motion.div>
            <motion.div
              variants={routeCrossFade}
              initial="initial"
              animate="animate"
              className="rounded-xl border border-stroke-subtle bg-white px-saheli-12 py-saheli-8 text-sm shadow-soft"
            >
              routeCrossFade
            </motion.div>
            <motion.div variants={attentionNudge} initial="idle" animate="nudge" className="rounded-xl border border-stroke-subtle bg-white px-saheli-12 py-saheli-8 text-sm shadow-soft">
              attentionNudge
            </motion.div>
            <motion.div variants={loaderShimmer} initial="initial" animate="animate" className="rounded-xl border border-stroke-subtle bg-linear-to-r from-champagne-100 via-rose-100 to-lavender-100 px-saheli-12 py-saheli-8 text-sm">
              loaderShimmer
            </motion.div>
            <motion.div variants={cardHoverLift} initial="rest" whileHover="hover" className="cursor-pointer rounded-xl border border-stroke-subtle bg-white px-saheli-12 py-saheli-8 text-sm shadow-soft">
              cardHoverLift (hover)
            </motion.div>
            <motion.button
              type="button"
              variants={chipPress}
              initial="rest"
              whileTap="pressed"
              className="rounded-full border border-champagne-500/40 bg-champagne-100 px-saheli-16 py-saheli-8 text-sm font-medium text-ink-strong"
            >
              chipPress
            </motion.button>
          </motion.div>
        </section>

        <section className="space-y-saheli-12">
          <h2 className="h-2 text-ink-strong">Card species (shape)</h2>
          <div className="grid gap-saheli-12 sm:grid-cols-2">
            {[
              { name: "Identity", body: "Avatar lockup, display name, micro trust" },
              { name: "Suggestion", body: "Leading chip, title, rationale, CTA row" },
              { name: "Venue", body: "Media 16:9, title, area, price band, footnote" },
              { name: "Theme", body: "Swatch strip, theme title, dress code excerpt" },
              { name: "Plan-slot", body: "Step index, label, summary, completion dot" },
            ].map((c) => (
              <div key={c.name} className="rounded-2xl border border-stroke-subtle bg-white/90 p-saheli-16 shadow-elev-1">
                <p className="title text-ink-strong">{c.name}</p>
                <p className="body-sm mt-2 text-ink-muted">{c.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
