import type { Template } from "@/lib/ai/prompts/meta";

export type VenueBlurbSlots = { venueLine: string };

export const venueBlurbTemplate: Template<VenueBlurbSlots> = {
  id: "venueBlurb",
  version: 1,
  description: "One-line venue micro-copy.",
  system: "Return a single clause under 18 words.",
  user: (s) => `Venue facts: ${s.venueLine}`,
};
