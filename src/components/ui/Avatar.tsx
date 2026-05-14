import { cn } from "@/lib/cn";

export function Avatar({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const ch = label.trim().slice(0, 1).toUpperCase() || "✦";
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-champagne/40 bg-gradient-to-br from-rose/50 to-lavender/50 text-sm font-semibold text-ink",
        className,
      )}
      aria-hidden
    >
      {ch}
    </div>
  );
}

export function AvatarGroup({ names, max = 4 }: { names: string[]; max?: number }) {
  const slice = names.slice(0, max);
  const extra = names.length - slice.length;
  return (
    <div className="flex -space-x-2">
      {slice.map((n) => (
        <Avatar key={n} label={n} className="ring-2 ring-surface-canvas" />
      ))}
      {extra > 0 ? (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-stroke-subtle bg-champagne-200 text-xs font-semibold text-ink-strong ring-2 ring-surface-canvas">
          +{extra}
        </div>
      ) : null}
    </div>
  );
}
