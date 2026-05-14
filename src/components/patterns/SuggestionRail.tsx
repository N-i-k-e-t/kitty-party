"use client";

import { useRouter } from "next/navigation";
import { Chip } from "@/components/ui/Chip";

const DEFAULT_CHIPS = [
  "Plan a monsoon kitty in Mumbai under ₹15,000",
  "Glam games for 10 women, two hours",
  "Suggest three indoor venues near Bandra",
  "Draft invitation copy for Sunday brunch",
  "Outline a relaxed afternoon timeline",
  "Lower budget without losing sparkle",
] as const;

export function SuggestionRail({ chips = DEFAULT_CHIPS }: { chips?: readonly string[] }) {
  const router = useRouter();
  return (
    <div className="mb-saheli-24 -mx-saheli-4 flex gap-saheli-8 overflow-x-auto px-saheli-4 pb-saheli-4 pt-saheli-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
      {chips.map((c) => (
        <Chip
          key={c}
          className="max-w-[min(280px,80vw)] shrink-0 snap-start whitespace-normal text-left"
          onClick={() => router.push(`/plan?prompt=${encodeURIComponent(c)}`)}
        >
          {c}
        </Chip>
      ))}
    </div>
  );
}
