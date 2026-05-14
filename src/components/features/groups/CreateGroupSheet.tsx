"use client";

import { useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { addCircle } from "@/lib/groups";
import type { VibeTag } from "@/lib/types";
import { vibeLabel } from "@/store/preferences";

const vibes: VibeTag[] = ["cozy", "glam", "traditional", "playful", "boho", "luxe"];

export function CreateGroupSheet({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [typeLabel, setTypeLabel] = useState("Kitty circle");
  const [picked, setPicked] = useState<VibeTag[]>(["cozy"]);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    await addCircle({
      name: name.trim(),
      typeLabel,
      vibes: picked,
      memberIds: [],
      nextEventAt: Date.now() + 1000 * 60 * 60 * 24 * 14,
    });
    setBusy(false);
    onCreated();
    onClose();
    setName("");
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="p-saheli-24">
        <p className="title text-ink-strong">Start a circle</p>
        <p className="body-sm mt-saheli-8 text-ink-muted">A soft space for RSVPs, votes, and plans.</p>
        <div className="mt-saheli-24 space-y-saheli-16">
          <div>
            <label className="label text-ink-muted" htmlFor="gname">
              Name
            </label>
            <Input id="gname" value={name} onChange={(e) => setName(e.target.value)} className="mt-saheli-8" placeholder="e.g. Sunday Bandra circle" />
          </div>
          <div>
            <label className="label text-ink-muted" htmlFor="gtype">
              Type
            </label>
            <Input id="gtype" value={typeLabel} onChange={(e) => setTypeLabel(e.target.value)} className="mt-saheli-8" />
          </div>
          <div>
            <p className="label text-ink-muted">Vibes</p>
            <div className="mt-saheli-8 flex flex-wrap gap-saheli-8">
              {vibes.map((v) => {
                const on = picked.includes(v);
                return (
                  <Chip
                    key={v}
                    onClick={() =>
                      setPicked(on ? picked.filter((x) => x !== v) : [...picked, v])
                    }
                    className={on ? "border-champagne-600 bg-champagne-200/60" : ""}
                  >
                    {vibeLabel(v)}
                  </Chip>
                );
              })}
            </div>
          </div>
          <Button type="button" className="w-full" disabled={busy || !name.trim()} onClick={() => void submit()}>
            Create circle
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
