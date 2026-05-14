"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { usePreferencesStore } from "@/store/preferences";
import { greetingFor, getDayPart } from "@/lib/context/time";
import { t } from "@/lib/copy";

export function AppBar() {
  const pathname = usePathname();
  const name = usePreferencesStore((s) => s.preferences.name);
  if (pathname.startsWith("/onboarding")) return null;
  const greet = greetingFor(getDayPart());
  return (
    <header className="sticky top-0 z-30 border-b border-stroke-subtle bg-surface-glass/85 px-saheli-16 py-saheli-12 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-saheli-12">
        <div>
          <p className="label text-ink-muted">{t("app.name")}</p>
          <p className="body-sm text-ink-body">
            {greet}, <span className="font-semibold text-ink-strong">{name}</span>
          </p>
        </div>
        <Link href="/you" aria-label={t("nav.you")}>
          <Avatar label={name} />
        </Link>
      </div>
    </header>
  );
}
