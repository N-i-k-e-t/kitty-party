import type { Transition, Variants } from "framer-motion";

export const softSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.85,
};

const warmEase: Transition = { duration: 0.32, ease: [0.22, 1, 0.36, 1] };

/** Soft entrance: opacity + small vertical drift (use with `withReducedMotion` in interactive surfaces). */
export const fadeUpSoft: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: softSpring,
  },
};

/** @deprecated Use `fadeUpSoft`; kept for existing imports. */
export const fadeUp = fadeUpSoft;

/** Container: stagger child animations. */
export function staggerChildren(gap = 0.06): Variants {
  return {
    hidden: {},
    show: {
      transition: {
        staggerChildren: gap,
        delayChildren: 0.04,
      },
    },
  };
}

export const staggerChildrenPreset: Variants = staggerChildren(0.06);

export const sheetOpen: Variants = {
  hidden: { opacity: 0, x: 28 },
  show: {
    opacity: 1,
    x: 0,
    transition: warmEase,
  },
};

export const chipPress: Variants = {
  rest: { scale: 1 },
  pressed: { scale: 0.98, transition: { duration: 0.12, ease: [0.4, 0, 0.2, 1] } },
};

export const cardHoverLift: Variants = {
  rest: { y: 0 },
  hover: { y: -4, transition: { type: "spring", stiffness: 420, damping: 28 } },
};

export const routeCrossFade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: "easeIn" } },
};

export const loaderShimmer: Variants = {
  initial: { opacity: 0.65 },
  animate: {
    opacity: [0.65, 1, 0.65],
    transition: { duration: 1.35, repeat: Infinity, ease: "easeInOut" },
  },
};

export const attentionNudge: Variants = {
  nudge: {
    x: [0, -3, 3, -2, 2, 0],
    transition: { duration: 0.45, ease: "easeInOut" },
  },
  idle: { x: 0 },
};

export const successBloom: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 18 },
  },
};

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: softSpring,
  },
};

function stripMovementFromVariants<V extends Variants>(variants: V): V {
  const out = {} as Record<string, unknown>;
  for (const key of Object.keys(variants)) {
    const v = variants[key] as Record<string, unknown> | undefined;
    if (!v || typeof v !== "object" || Array.isArray(v)) {
      out[key] = v;
      continue;
    }
    const next: Record<string, unknown> = { ...v };
    if ("transition" in next && next.transition && typeof next.transition === "object") {
      const t = { ...(next.transition as object) } as Record<string, unknown>;
      delete t.staggerChildren;
      delete t.delayChildren;
      next.transition = t;
    }
    delete next.y;
    delete next.x;
    delete next.scale;
    delete next.rotate;
    if (typeof next.opacity === "number" && next.opacity < 1) {
      next.opacity = 1;
    }
    out[key] = next;
  }
  return out as V;
}

/**
 * Returns variants that avoid positional movement when the user prefers reduced motion
 * (static snapshot at module load — pair with `useReducedMotion` in UI for live updates).
 */
export function withReducedMotion<V extends Variants>(variants: V): V {
  if (typeof window === "undefined" || !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return variants;
  }
  return stripMovementFromVariants(variants);
}
