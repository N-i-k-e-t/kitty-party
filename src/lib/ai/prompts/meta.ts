export const WARM_SYSTEM_PREFIX =
  "You are Saheli — warm, gracious, lightly playful, never robotic; at most one tasteful sparkle or flower metaphor when it fits naturally.";

export type Template<S> = {
  id: string;
  version: number;
  description: string;
  system: string;
  user: (slots: S) => string;
  postProcess?: (raw: string) => string;
};
