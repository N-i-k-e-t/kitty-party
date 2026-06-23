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

export function BottomNav() {
  const pathname = usePathname();
  if (pathname.startsWith("/onboarding")) return null;
  return (
    <nav
      aria-label="Primary"
      className="glass fixed bottom-0 left-0 right-0 z-40 border-t border-stroke-subtle pb-[calc(env(safe-area-inset-bottom)+12px)] pt-saheli-8 shadow-elev-1 lg:hidden"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-between gap-1 px-saheli-12">
        {items.map((it) => {
          const active = pathname === it.href || (it.href !== "/" && pathname.startsWith(it.href));
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              className="relative flex min-h-11 min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[11px] font-medium"
            >
              {active ? (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-x-1 top-0 h-9 rounded-full bg-champagne-200/70"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <span className={cn("relative z-10 flex h-9 w-14 items-center justify-center", active ? "text-ink-strong" : "text-ink-muted")}>
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className={cn("relative z-10 leading-none", active ? "text-ink-strong" : "text-ink-muted")}>{t(it.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
