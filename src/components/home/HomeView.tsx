"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePreferencesStore } from "@/store/preferences";
import { Skeleton } from "@/components/ui/Skeleton";
import { HeroGreeting } from "@/components/patterns/HeroGreeting";
import { AssistantInputBar } from "@/components/patterns/AssistantInputBar";
import { SuggestionRail } from "@/components/patterns/SuggestionRail";
import { SeasonalCard } from "@/components/features/home/SeasonalCard";
import { NearbyVenueRail } from "@/components/home/HomeVenuesRail";
import { TrendingThemesGrid } from "@/components/home/HomeTrendingThemes";
import { HomeFestivalsRibbon } from "@/components/home/HomeFestivalsRibbon";
import { HomeWeatherTip } from "@/components/home/HomeWeatherTip";
import { QuickIdeas } from "@/components/features/home/QuickIdeas";
import { MemoriesRail } from "@/components/features/home/MemoriesRail";
import { AssistantTipBanner } from "@/components/features/assistant/AssistantTipBanner";
import { getMockWeather } from "@/lib/context/weather";
import { motion } from "framer-motion";
import { fadeUpSoft } from "@/lib/motion";

export function HomeView() {
  const router = useRouter();
  const hydrated = usePreferencesStore((s) => s.hydrated);
  const complete = usePreferencesStore((s) => s.preferences.onboardingComplete);
  const city = usePreferencesStore((s) => s.preferences.city);

  useEffect(() => {
    if (!hydrated) return;
    if (!complete) router.replace("/onboarding");
  }, [hydrated, complete, router]);

  useEffect(() => {
    if (!hydrated || !complete) return;
    document.title = "Saheli — Home";
  }, [hydrated, complete]);

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-md space-y-saheli-12 py-saheli-40">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (!complete) return null;

  const weather = getMockWeather(city);
  const weekend = weather.days[1];
  const warn = weekend.precipChance > 0.45;

  return (
    <div className="flex w-full flex-col gap-saheli-16 sm:gap-saheli-20">
      <motion.div variants={fadeUpSoft} initial="hidden" animate="show">
        {warn ? (
          <AssistantTipBanner
            tone="warning"
            message={weather.tip}
            actions={[
              { label: "Indoor venues", prompt: "Suggest three indoor venues for a drizzle-safe gathering" },
              { label: "Open planner", prompt: "Plan a cozy indoor kitty for 12 women" },
            ]}
          />
        ) : (
          <AssistantTipBanner
            message={weather.tip}
            actions={[{ label: "Plan Sunday", prompt: "Plan a Sunday brunch kitty for 10 women in my city" }]}
          />
        )}
      </motion.div>
      <HeroGreeting />
      <div className="flex flex-col gap-saheli-20">
        <AssistantInputBar />
        <SuggestionRail />
      </div>
      <QuickIdeas />
      <SeasonalCard />
      <NearbyVenueRail />
      <TrendingThemesGrid />
      <HomeFestivalsRibbon />
      <HomeWeatherTip />
      <MemoriesRail />
    </div>
  );
}
