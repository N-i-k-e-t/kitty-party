"use client";

import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";

export function ShareSheet({
  open,
  onClose,
  whatsappHref,
  onCopy,
  onDownload,
}: {
  open: boolean;
  onClose: () => void;
  whatsappHref: string;
  onCopy: () => void;
  onDownload?: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose}>
      <div className="p-saheli-24">
        <p className="title text-ink-strong">Send to your circle</p>
        <p className="body-sm mt-saheli-8 text-ink-muted">Share gently, gather joyfully.</p>
        <div className="mt-saheli-24 flex flex-col gap-saheli-12">
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="w-full">
            <Button type="button" className="w-full">
              WhatsApp
            </Button>
          </a>
          <Button type="button" variant="soft" className="w-full" onClick={onCopy}>
            Copy link
          </Button>
          {onDownload ? (
            <Button type="button" variant="ghost" className="w-full" onClick={onDownload}>
              Download image
            </Button>
          ) : null}
        </div>
      </div>
    </Sheet>
  );
}
