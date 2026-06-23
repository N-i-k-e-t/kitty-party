/** Decorative inline SVG — no external assets. */
export function SoftIllustration({ name, className }: { name: "spark" | "circle"; className?: string }) {
  if (name === "circle") {
    return (
      <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden>
        <circle cx="32" cy="32" r="28" stroke="var(--stroke-subtle)" strokeWidth="1.5" />
        <circle cx="32" cy="32" r="18" stroke="var(--accent-soft)" strokeWidth="1.5" opacity="0.7" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden>
      <path
        d="M32 8l3.5 10.5h11L39 25.5 42.5 36 32 30l-10.5 6L25 25.5 17.5 18.5h11L32 8z"
        fill="var(--accent-soft)"
        opacity="0.55"
      />
    </svg>
  );
}
