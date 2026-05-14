export function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/60">
      <div
        className="h-full rounded-full bg-gradient-to-r from-rose-deep via-champagne to-lavender"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}
