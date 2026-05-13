import type { Transition, Variants } from "framer-motion";

export const softSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 32,
  mass: 0.85,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: softSpring,
  },
};

export const staggerChildren = (gap = 0.06): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: gap,
      delayChildren: 0.04,
    },
  },
});

export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: softSpring,
  },
};
