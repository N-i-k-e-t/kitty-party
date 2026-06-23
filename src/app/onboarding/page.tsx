"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { majorIndianCities } from "@/data/cities";
import type { GatheringIdea, UserPreferences, VibeTag } from "@/lib/types";
import { usePreferencesStore } from "@/store/preferences";
import { vibeLabel } from "@/store/preferences";
import { StepProgress } from "@/components/patterns/StepProgress";
import { LoaderShimmer } from "@/components/patterns/LoaderShimmer";
import { GradientBackdrop } from "@/components/ui/GradientBackdrop";
import { WowReveal } from "@/components/features/onboarding/WowReveal";

const vibes: VibeTag[] = ["cozy", "glam", "traditional", "playful", "boho", "luxe"];

function Sparkles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-champagne-deep/60"
          initial={{ opacity: 0.2, y: 0 }}
          animate={{
            opacity: [0.2, 0.9, 0.2],
            y: [0, -40 - (i % 5) * 12],
            x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i)],
          }}
          transition={{ duration: 4 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
          style={{ left: `${(i * 53) % 100}%`, top: `${(i * 29) % 80}%` }}
        />
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const hydrated = usePreferencesStore((s) => s.hydrated);
  const preferences = usePreferencesStore((s) => s.preferences);
  const patch = usePreferencesStore((s) => s.patch);
  const complete = usePreferencesStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [loginChoice, setLoginChoice] = useState<string | null>(null);
  const [draft, setDraft] = useState<UserPreferences>(() => ({ ...preferences }));

  const [wowIdeas, setWowIdeas] = useState<GatheringIdea[]>([]);

  useEffect(() => {
    queueMicrotask(() => setDraft({ ...preferences }));
  }, [preferences]);

  useEffect(() => {
    if (!hydrated) return;
    if (preferences.onboardingComplete && step < 12) router.replace("/");
  }, [hydrated, preferences.onboardingComplete, router, step]);

  useEffect(() => {
    if (step !== 11) return;
    let cancelled = false;
    void (async () => {
      await new Promise((r) => setTimeout(r, 1600));
      if (cancelled) return;
      const ideas = await complete();
      if (cancelled) return;
      setWowIdeas(ideas);
      setStep(12);
    })();
    return () => {
      cancelled = true;
    };
  }, [step, complete]);

  if (!hydrated) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center px-4">
        <Card variant="glass" padding="lg" className="w-full text-center text-sm text-ink-muted">
          Preparing your planner…
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-surface-canvas">
      <GradientBackdrop variant="dawn" />
      <div className="relative mx-auto flex min-h-dvh max-w-lg flex-col px-saheli-16 py-saheli-40 pb-saheli-96">
        {step > 0 && step < 11 ? <StepProgress step={Math.min(step, 10)} total={10} /> : null}
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div key="splash" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="relative flex flex-1 flex-col justify-center">
              <Sparkles />
              <Card variant="gradient" padding="lg" className="relative overflow-hidden">
                <p className="text-xs font-medium uppercase tracking-[0.26em] text-ink-muted">Saheli</p>
                <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-ink">
                  Plan unforgettable gatherings effortlessly
                </h1>
                <p className="mt-3 text-sm text-ink-muted">Your stylish planner friend — local, thoughtful, quietly brilliant.</p>
                <Button className="mt-6 w-full" onClick={() => setStep(1)}>
                  Begin
                </Button>
              </Card>
            </motion.div>
          ) : null}
          {step === 1 ? (
            <motion.div key="login" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-ink">Choose a lovely sign-in</h2>
              <p className="text-sm text-ink-muted">Visual only for this MVP — any option continues.</p>
              <div className="grid gap-3">
                {["WhatsApp", "Google", "Phone OTP"].map((label) => (
                  <Button key={label} variant="glass" className="w-full justify-between" onClick={() => { setLoginChoice(label); setStep(2); }}>
                    Continue with {label}
                  </Button>
                ))}
              </div>
              {loginChoice ? <p className="text-xs text-ink-muted">Selected: {loginChoice}</p> : null}
            </motion.div>
          ) : null}
          {step === 2 ? (
            <motion.div key="name" variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
              <Bubble assistant>What should we call you?</Bubble>
              <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Your first name" />
              <Button className="w-full" onClick={() => setStep(3)}>Next</Button>
            </motion.div>
          ) : null}
          {step === 3 ? (
            <motion.div key="types" className="space-y-4">
              <Bubble assistant>What kinds of gatherings do you host most?</Bubble>
              <Input value={draft.gatheringTypes.join(", ")} onChange={(e) => setDraft({ ...draft, gatheringTypes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} placeholder="Kitty parties, brunches, festive circles…" />
              <Button className="w-full" onClick={() => setStep(4)}>Next</Button>
            </motion.div>
          ) : null}
          {step === 4 ? (
            <motion.div key="city" className="space-y-4">
              <Bubble assistant>Which city feels like home base?</Bubble>
              <Select value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })}>
                {majorIndianCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
              <Input value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} placeholder="Or type another city" />
              <Button className="w-full" onClick={() => setStep(5)}>Next</Button>
            </motion.div>
          ) : null}
          {step === 5 ? (
            <motion.div key="budget" className="space-y-4">
              <Bubble assistant>Typical budget window for one gathering?</Bubble>
              <div className="flex items-center gap-3">
                <input type="range" min={5000} max={200000} step={1000} value={draft.budgetMin} onChange={(e) => setDraft({ ...draft, budgetMin: Number(e.target.value) })} className="w-full" />
              </div>
              <p className="text-xs text-ink-muted">Min ₹{draft.budgetMin.toLocaleString("en-IN")}</p>
              <input type="range" min={draft.budgetMin} max={300000} step={1000} value={draft.budgetMax} onChange={(e) => setDraft({ ...draft, budgetMax: Number(e.target.value) })} className="w-full" />
              <p className="text-xs text-ink-muted">Max ₹{draft.budgetMax.toLocaleString("en-IN")}</p>
              <Button className="w-full" onClick={() => setStep(6)}>Next</Button>
            </motion.div>
          ) : null}
          {step === 6 ? (
            <motion.div key="group" className="space-y-4">
              <Bubble assistant>How large is your usual circle?</Bubble>
              <input type="range" min={4} max={40} step={1} value={draft.groupSize} onChange={(e) => setDraft({ ...draft, groupSize: Number(e.target.value) })} className="w-full" />
              <p className="text-sm text-ink-muted">Around {draft.groupSize} guests</p>
              <Button className="w-full" onClick={() => setStep(7)}>Next</Button>
            </motion.div>
          ) : null}
          {step === 7 ? (
            <motion.div key="vibes" className="space-y-4">
              <Bubble assistant>Pick the vibes that feel like you.</Bubble>
              <div className="flex flex-wrap gap-2">
                {vibes.map((v) => {
                  const on = draft.vibes.includes(v);
                  return (
                    <Chip key={v} className={on ? "border-champagne-deep bg-champagne/40" : ""} onClick={() => {
                      setDraft({
                        ...draft,
                        vibes: on ? draft.vibes.filter((x) => x !== v) : [...draft.vibes, v],
                      });
                    }}>
                      {vibeLabel(v)}
                    </Chip>
                  );
                })}
              </div>
              <Button className="w-full" onClick={() => setStep(8)}>Next</Button>
            </motion.div>
          ) : null}
          {step === 8 ? (
            <motion.div key="io" className="space-y-4">
              <Bubble assistant>Indoor warmth or outdoor breeze?</Bubble>
              <div className="grid gap-2">
                {(["indoor", "outdoor", "either"] as const).map((opt) => (
                  <Button key={opt} variant={draft.indoorVsOutdoor === opt ? "primary" : "glass"} className="w-full" onClick={() => setDraft({ ...draft, indoorVsOutdoor: opt })}>
                    {opt === "either" ? "Either works" : opt}
                  </Button>
                ))}
              </div>
              <Button className="w-full" onClick={() => setStep(9)}>Next</Button>
            </motion.div>
          ) : null}
          {step === 9 ? (
            <motion.div key="lux" className="space-y-4">
              <Bubble assistant>Slide toward casual picnics or luxe soirées.</Bubble>
              <input type="range" min={0} max={1} step={0.05} value={draft.luxuryVsCasual} onChange={(e) => setDraft({ ...draft, luxuryVsCasual: Number(e.target.value) })} className="w-full" />
              <p className="text-xs text-ink-muted">{draft.luxuryVsCasual < 0.45 ? "Casual & warm" : draft.luxuryVsCasual > 0.65 ? "Luxe leaning" : "Balanced glam"}</p>
              <Button className="w-full" onClick={() => setStep(10)}>Next</Button>
            </motion.div>
          ) : null}
          {step === 10 ? (
            <motion.div key="travel" className="space-y-4">
              <Bubble assistant>Max travel you’d consider for a venue?</Bubble>
              <input type="range" min={2} max={80} step={1} value={draft.maxTravelKm} onChange={(e) => setDraft({ ...draft, maxTravelKm: Number(e.target.value) })} className="w-full" />
              <p className="text-xs text-ink-muted">Up to {draft.maxTravelKm} km</p>
              <Button className="w-full" onClick={async () => { await patch(draft); setStep(11); }}>Craft my ideas</Button>
            </motion.div>
          ) : null}
          {step === 11 ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-1 flex-col justify-center">
              <LoaderShimmer label="Crafting your gathering ideas…" />
            </motion.div>
          ) : null}
          {step === 12 && wowIdeas.length ? (
            <motion.div key="wowreveal" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-1 flex-col justify-center">
              <WowReveal ideas={wowIdeas} onContinue={() => router.replace("/")} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Bubble({ assistant, children }: { assistant?: boolean; children: React.ReactNode }) {
  return (
    <div className={`max-w-[92%] rounded-3xl px-4 py-3 text-sm leading-relaxed ${assistant ? "bg-white/80 text-ink shadow-soft" : "ml-auto bg-gradient-to-br from-champagne/70 to-lavender/50 text-ink"}`}>
      {children}
    </div>
  );
}
