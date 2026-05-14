import type { InvitationBundle } from "@/lib/types";
import { Card } from "@/components/ui/Card";

export function WhatsAppPreview({ bundle }: { bundle: InvitationBundle }) {
  return (
    <Card variant="elevated" padding="sm" className="bg-[#e9f6e6]">
      <p className="text-[11px] font-semibold text-emerald-900">WhatsApp preview</p>
      <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-emerald-950">{bundle.whatsappText}</p>
      <p className="mt-3 text-[11px] text-emerald-900/80">{bundle.rsvpPrompt}</p>
    </Card>
  );
}
