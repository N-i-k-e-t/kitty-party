"use client";

import { useRef } from "react";
import { toPng } from "html-to-image";
import type { InvitationBundle, Theme } from "@/lib/types";
import { posterAestheticForTemplate } from "@/lib/engines/invitation";
import { Button } from "@/components/ui/Button";
import { usePreferencesStore } from "@/store/preferences";

export function InvitationPoster({
  theme,
  bundle,
}: {
  theme?: Theme;
  bundle: InvitationBundle;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const name = usePreferencesStore((s) => s.preferences.name);
  async function download() {
    if (!ref.current) return;
    const dataUrl = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "saheli-invite.png";
    a.click();
  }
  const aesthetic = posterAestheticForTemplate(bundle.templateId);
  return (
    <div className="space-y-2">
      <div
        ref={ref}
        className="mx-auto flex aspect-[1080/1350] w-full max-w-[280px] flex-col justify-between rounded-3xl bg-gradient-to-b from-ivory via-rose/25 to-lavender/35 p-6 text-ink shadow-lift"
      >
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-ink-muted">Saheli</p>
          <p className="mt-4 font-serif text-2xl font-semibold leading-tight">{theme?.name ?? "Gathering"}</p>
          <p className="mt-3 text-xs text-ink-muted">{aesthetic}</p>
        </div>
        <div className="space-y-2 text-xs leading-relaxed text-ink">
          <p>Hosted by {name}</p>
          <p className="whitespace-pre-line line-clamp-6">{bundle.whatsappText}</p>
        </div>
        <p className="text-[10px] text-ink-muted">Portrait card · share-ready</p>
      </div>
      <Button type="button" className="w-full" variant="soft" onClick={() => void download()}>
        Download poster PNG
      </Button>
    </div>
  );
}
