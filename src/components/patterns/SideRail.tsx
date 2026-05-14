"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarHeart, Compass, Home, UserRound, UsersRound } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { t } from "@/lib/copy";

const items = [
  { href: "/", labelKey: "nav.home", icon: Home },
  { href: "/plan", labelKey: "nav.plan", icon: CalendarHeart },
  { href: "/discover", labelKey: "nav.discover", icon: Compass },
  { href: "/groups", labelKey: "nav.circles", icon: UsersRound },
  { href: "/you", labelKey: "nav.you", icon: UserRound },
] as const;

export function SideRail() {
  const pathname = usePathname();
  if (pathname.startsWith("/onboarding")) return null;
  return (
    <aside className="sticky top-0 hidden h-dvh w-[220px] shrink-0 flex-col border-r border-stroke-subtle bg-surface-glass/80 px-saheli-12 pt-saheli-24 pb-saheli-32 backdrop-blur-md lg:flex">
      <p className="label text-ink-muted">{t("app.name")}</p>
      <nav aria-label="Primary" className="mt-saheli-24 flex flex-1 flex-col gap-saheli-8">
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                "relative flex min-h-11 items-center gap-saheli-12 rounded-xl px-saheli-12 py-saheli-8 text-sm font-medium transition-colors",
                active ? "text-ink-strong" : "text-ink-muted hover:text-ink-body",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="rail-pill"
                  className="absolute inset-0 rounded-xl bg-champagne-200/55"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              ) : null}
              <Icon className="relative z-10 h-5 w-5 shrink-0" aria-hidden />
              <span className="relative z-10">{t(it.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
      <footer className="mt-auto space-y-saheli-6 border-t border-stroke-subtle pt-saheli-20">
        <p className="font-display text-sm font-semibold text-ink-strong">{t("app.name")}</p>
        <p className="caption text-ink-muted">{t("app.tagline")}</p>
        <p className="caption text-ink-muted">v0.1</p>
      </footer>
    </aside>
  );
}
