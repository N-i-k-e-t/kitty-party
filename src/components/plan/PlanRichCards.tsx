"use client";

import Image from "next/image";
import type { PlanRichCard } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BudgetBreakdown } from "@/components/budget/BudgetBreakdown";
import { GamePack } from "@/components/games/GamePack";
import { WhatsAppPreview } from "@/components/invitation/WhatsAppPreview";
import { InvitationPoster } from "@/components/invitation/InvitationPoster";

export function PlanRichCards({
  cards,
  onPin,
  readOnly,
}: {
  cards: PlanRichCard[];
  onPin: (c: PlanRichCard) => void | Promise<void>;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-3">
      {cards.map((c) => (
        <Card key={c.id} variant="glass" padding="md" className="border-champagne/30">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{c.title}</p>
            {!readOnly ? (
              <Button size="sm" variant="soft" className="h-8 px-2 text-xs" type="button" onClick={() => void onPin(c)}>
                Save
              </Button>
            ) : null}
          </div>
          {c.type === "theme" && c.payload.theme ? (
            <div className="flex gap-3">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl">
                <Image src={c.payload.theme.heroImage} alt="" fill className="object-cover" sizes="96px" />
              </div>
              <div>
                <p className="font-serif text-sm font-semibold text-ink">{c.payload.theme.name}</p>
                <p className="mt-1 text-xs text-ink-muted line-clamp-3">{c.payload.theme.dressCode}</p>
              </div>
            </div>
          ) : null}
          {c.type === "venues" && c.payload.venues ? (
            <div className="space-y-2">
              {c.payload.venues.map((v) => (
                <div key={v.id} className="flex gap-2 rounded-xl bg-white/60 p-2">
                  <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Image src={v.image} alt={v.name} fill className="object-cover" sizes="64px" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{v.name}</p>
                    <p className="text-[11px] text-ink-muted">{v.area}</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {v.vibeTags.slice(0, 2).map((t) => (
                        <Badge key={t}>{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
          {c.type === "budget" && c.payload.budget ? <BudgetBreakdown data={c.payload.budget} /> : null}
          {c.type === "games" && c.payload.games ? <GamePack games={c.payload.games} /> : null}
          {c.type === "invitation" && c.payload.invitation ? (
            <div className="space-y-3">
              <WhatsAppPreview bundle={c.payload.invitation} />
              <InvitationPoster bundle={c.payload.invitation} theme={undefined} />
            </div>
          ) : null}
          {c.type === "timeline" && c.payload.timeline ? (
            <ul className="list-disc space-y-1 pl-4 text-xs text-ink-muted">
              {c.payload.timeline.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          ) : null}
        </Card>
      ))}
    </div>
  );
}
