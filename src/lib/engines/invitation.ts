import type { InvitationBundle, Theme } from "@/lib/types";

const templates = {
  classic: {
    whatsappHeader: "You’re warmly invited ✨",
    posterTone: "Ivory deckle edge, rose gold serif, soft peony line art",
  },
  monsoon: {
    whatsappHeader: "A monsoon-soirée invite, just for us",
    posterTone: "Teal glass texture, rain speckles, gold foil headings",
  },
  glam: {
    whatsappHeader: "Dress the mood — glam on arrival",
    posterTone: "Noir backdrop, champagne typography, subtle glitter gradient",
  },
} as const;

export function generateInvitationBundle(input: {
  hostName: string;
  city: string;
  dateLabel: string;
  theme?: Theme;
  groupSize: number;
}): InvitationBundle {
  const themeName = input.theme?.name ?? "Gathering";
  const templateKey =
    input.theme?.id === "monsoon-garden"
      ? "monsoon"
      : input.theme?.vibeTags.includes("glam")
        ? "glam"
        : "classic";
  const tpl = templates[templateKey];
  const whatsappText = `${tpl.whatsappHeader}

${themeName} · ${input.city}
Hosted by ${input.hostName}
Circle of ${input.groupSize} lovely souls
When: ${input.dateLabel}

RSVP with a heart emoji if you’re in — I’ll share the final pin and playlist.`;

  const reminderText = `Gentle reminder: ${themeName} this week — light shawl if it’s breezy, comfy heels if we dance. Can’t wait to see you.`;

  const rsvpPrompt = `Reply “in” with your dietary note (veg / vegan / Jain friendly) and one song you’d love to hear.`;

  return {
    whatsappText,
    reminderText,
    rsvpPrompt,
    templateId: templateKey,
  };
}

export function posterAestheticForTemplate(templateId: InvitationBundle["templateId"]): string {
  return templates[templateId as keyof typeof templates]?.posterTone ?? templates.classic.posterTone;
}
