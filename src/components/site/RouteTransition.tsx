import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "@tanstack/react-router";
import { useSmoothScroll } from "@/lib/lenis-context";
import { DURATION, EASE_ARCH_SMOOTH, DISTANCE } from "@/lib/motion";

/**
 * Wraps <Outlet> to provide swift, non-blocking fade+rise transitions between routes.
 * Uses centralized motion tokens and coordinates scroll reset with Lenis.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { scrollTo } = useSmoothScroll();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: DISTANCE.SUBTLE }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -DISTANCE.SUBTLE }}
        transition={{ duration: DURATION.TABS, ease: EASE_ARCH_SMOOTH }}
        onAnimationStart={() => {
          // If no hash is present, reset scroll to top immediately on route change
          if (typeof window !== "undefined" && !window.location.hash) {
            scrollTo(0, { immediate: true });
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
