/**
 * Home Studios — Central Motion Configuration
 *
 * Architectural Motion Philosophy:
 * - Fast micro-interactions (buttons, tabs, links)
 * - Smooth, heavy section transitions
 * - Slow cinematic hero movement
 * - Strong, weighted exponential easing curves
 * - No unnecessary bouncing, no excessive blur, no jitter
 * - Natural native mobile touch scrolling (syncTouch: false)
 * - Strict prefers-reduced-motion compliance
 */

import type { Variants, Transition } from "framer-motion";
import type { LenisOptions } from "lenis";

// ---------------------------------------------------------------------------
// 1. Architectural Easing Curves
// ---------------------------------------------------------------------------

/**
 * Heavy architectural ease-out.
 * High initial velocity with long, weighted settling.
 * Best for: Section reveals, photo crossfades, card appearances.
 */
export const EASE_ARCH_HEAVY = [0.16, 1, 0.3, 1] as const;

/**
 * Signature monograph smooth ease.
 * Balanced, elegant and fluid.
 * Best for: Standard entrances, accordions, tabs.
 */
export const EASE_ARCH_SMOOTH = [0.22, 1, 0.36, 1] as const;

/**
 * Cinematic slow ease.
 * Unhurried and deliberate.
 * Best for: Hero titles, large typography clip-masks.
 */
export const EASE_ARCH_SLOW = [0.25, 1, 0.5, 1] as const;

/**
 * Fast, tactile micro-interaction ease.
 * Immediate response without bounce.
 * Best for: Buttons, hovers, navigation items.
 */
export const EASE_MICRO = [0.2, 0, 0, 1] as const;

/**
 * CSS String representations of easing curves for inline CSS / stylesheets
 */
export const CSS_EASE = {
  HEAVY: "cubic-bezier(0.16, 1, 0.3, 1)",
  SMOOTH: "cubic-bezier(0.22, 1, 0.36, 1)",
  SLOW: "cubic-bezier(0.25, 1, 0.5, 1)",
  MICRO: "cubic-bezier(0.2, 0, 0, 1)",
} as const;

// ---------------------------------------------------------------------------
// 2. Standardized Motion Durations (seconds)
// ---------------------------------------------------------------------------

export const DURATION = {
  MICRO: 0.18,      // tactile buttons, hover states
  TABS: 0.25,       // tab switches, segmented controls
  MODAL: 0.28,      // dialogs, drawers, mobile menu
  STANDARD: 0.45,   // standard component entrance
  SECTION: 0.65,    // major section reveal, card grids
  HERO: 1.1,        // slow headline reveal, monograph entry
} as const;

// ---------------------------------------------------------------------------
// 3. Standardized Motion Distances (pixels)
// ---------------------------------------------------------------------------

export const DISTANCE = {
  SUBTLE: 8,        // micro transitions, route page switch
  MEDIUM: 16,       // card entrances, section headings
  LARGE: 24,        // major block arrivals
} as const;

// ---------------------------------------------------------------------------
// 4. Central Lenis Smooth Scroll Configuration
// ---------------------------------------------------------------------------

export const LENIS_CONFIG: LenisOptions = {
  // 1.2s duration gives the scroll an architectural weight without feeling sluggish
  duration: 1.2,
  // Exponential ease-out (quintic): starts with responsive momentum, glides softly to a stop
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: "vertical",
  gestureOrientation: "vertical",
  smoothWheel: true,
  // CRITICAL: syncTouch must be false so mobile/touch scrolling remains 100% native
  // with device inertia and zero lag
  syncTouch: false,
  touchMultiplier: 1.0,
  wheelMultiplier: 1.0,
  autoRaf: false, // Managed manually in our unified rAF loop for perfect sync
};

// ---------------------------------------------------------------------------
// 5. Shared Framer Motion Transitions & Variants
// ---------------------------------------------------------------------------

export const TRANSITION_SMOOTH: Transition = {
  duration: DURATION.SECTION,
  ease: EASE_ARCH_SMOOTH,
};

export const TRANSITION_MICRO: Transition = {
  duration: DURATION.MICRO,
  ease: EASE_MICRO,
};

export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: DISTANCE.MEDIUM,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.SECTION,
      ease: EASE_ARCH_HEAVY,
    },
  },
};

export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: DURATION.STANDARD,
      ease: EASE_ARCH_SMOOTH,
    },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

export const clipRevealVariants: Variants = {
  hidden: {
    clipPath: "inset(100% 0 0 0)",
  },
  visible: {
    clipPath: "inset(0% 0 0 0)",
    transition: {
      duration: DURATION.SECTION,
      ease: EASE_ARCH_HEAVY,
    },
  },
};
