import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function IconBubble({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-2xl border border-champagne/40 bg-white/70 text-ink shadow-sm",
        className,
      )}
    >
      <Icon className="h-5 w-5" />
    </div>
  );
}
