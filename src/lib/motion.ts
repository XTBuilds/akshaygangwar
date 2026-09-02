import type { Transition, Variants } from "motion/react";

/**
 * XT motion system — single source of truth for timing, easing and
 * interaction values. Import from here instead of inlining numbers.
 *
 * Presets
 *  snap    : instant UI feedback (toggles, chips, active states)
 *  ui      : standard interface motion (panels, drawers, menus)
 *  gentle  : content entering the viewport, soft state changes
 *  lively  : playful emphasis (CTAs, counters, success)
 *  ambient : slow, continuous background drift
 */
export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  in: [0.7, 0, 0.84, 0] as const,
};

export const presets = {
  snap: { type: "spring", stiffness: 900, damping: 50, mass: 0.6 } satisfies Transition,
  ui: { type: "spring", stiffness: 420, damping: 38, mass: 0.9 } satisfies Transition,
  gentle: { duration: 0.7, ease: ease.out } satisfies Transition,
  lively: { type: "spring", stiffness: 520, damping: 22, mass: 0.8 } satisfies Transition,
  ambient: { duration: 18, ease: "linear", repeat: Infinity, repeatType: "mirror" } satisfies Transition,
} as const;

/** Enter/exit values used by every reveal in the app. */
export const enter = {
  y: 28,
  scale: 0.975,
  blur: 6,
  duration: 0.7,
} as const;

/** Standard hover lift and press compression. */
export const hover = { y: -3, scale: 1.015, transition: presets.ui } as const;
export const press = { scale: 0.97, transition: presets.snap } as const;

/** Stagger timings for lists/grids. */
export const stagger = {
  children: 0.06,
  delay: 0.04,
  max: 0.34,
} as const;

/** Variants for a reveal container + children. */
export const revealParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: stagger.children, delayChildren: stagger.delay } },
};

export const revealChild: Variants = {
  hidden: { opacity: 0, y: 20, scale: enter.scale },
  show: { opacity: 1, y: 0, scale: 1, transition: presets.gentle },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: enter.y, filter: `blur(${enter.blur}px)` },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: presets.gentle },
};

/** Panel/drawer/popover motion. */
export const panel: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: presets.ui },
  exit: { opacity: 0, y: 10, scale: 0.97, transition: { duration: 0.18, ease: ease.in } },
};

/** Viewport trigger defaults for whileInView usage. */
export const viewport = { once: true, amount: 0.18, margin: "0px 0px -10% 0px" } as const;
