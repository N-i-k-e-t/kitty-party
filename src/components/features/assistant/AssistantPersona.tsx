import { cn } from "@/lib/cn";

export function AssistantPersona({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-saheli-12", className)}>
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-champagne-400/50 bg-gradient-to-br from-champagne-200 to-rose-200 shadow-elev-1"
        aria-hidden
      >
        <svg viewBox="0 0 40 40" className="h-8 w-8 text-champagne-700" fill="currentColor" aria-hidden>
          <path d="M20 8c-4 0-7 3-7 7 0 3 2 5 4 6-3 1-6 4-7 8h20c-1-4-4-7-7-8 2-1 4-3 4-6 0-4-3-7-7-7z" opacity="0.35" />
        </svg>
      </div>
      <div>
        <p className="title text-ink-strong">Saheli</p>
        <p className="caption text-ink-muted">your gathering planner</p>
      </div>
    </div>
  );
}
