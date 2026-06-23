"use client";

import { cn } from "@/lib/cn";
import { Chip } from "@/components/ui/Chip";
import { useRouter } from "next/navigation";

export function AssistantQuickActions({
  actions,
  className,
}: {
  actions: { label: string; prompt: string }[];
  className?: string;
}) {
  const router = useRouter();
  return (
    <div className={cn("flex flex-wrap gap-saheli-8", className)}>
      {actions.map((a) => (
        <Chip key={a.label} onClick={() => router.push(`/plan?prompt=${encodeURIComponent(a.prompt)}`)}>
          {a.label}
        </Chip>
      ))}
    </div>
  );
}
