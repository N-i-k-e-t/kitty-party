/**
 * Central copy keys for i18n-safe expansion. Values are plain strings;
 * interpolate via separate parameters rather than embedding variables in source.
 */
const messages: Record<string, string> = {
  "app.name": "Saheli",
  "app.tagline": "Your gathering planner",
  "nav.home": "Home",
  "nav.plan": "Plan",
  "nav.discover": "Discover",
  "nav.circles": "Circles",
  "nav.you": "You",
  "common.continue": "Continue",
  "common.loading": "Loading…",
  "errors.generic": "Something went softly wrong. Try again in a moment.",
};

export function t(key: string): string {
  return messages[key] ?? key;
}

export function tWith(
  key: string,
  params: Record<string, string | number>,
): string {
  let out = messages[key] ?? key;
  for (const [k, v] of Object.entries(params)) {
    out = out.replaceAll(`{{${k}}}`, String(v));
  }
  return out;
}
