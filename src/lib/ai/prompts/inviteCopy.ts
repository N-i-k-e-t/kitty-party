import type { Template } from "@/lib/ai/prompts/meta";

export type InviteCopySlots = { hostName: string; city: string; dateLabel: string; themeName: string };

export const inviteCopyTemplate: Template<InviteCopySlots> = {
  id: "inviteCopy",
  version: 1,
  description: "WhatsApp invite body.",
  system: "Return a concise invite with greeting, date, city, dress hint; no hashtags.",
  user: (s) =>
    `Host: ${s.hostName}. City: ${s.city}. When: ${s.dateLabel}. Theme: ${s.themeName}.`,
};
