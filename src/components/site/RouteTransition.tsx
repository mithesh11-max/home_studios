import { type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "@tanstack/react-router";

/**
 * Wraps <Outlet> to provide fade+rise transitions between routes.
 * Current page: fades + rises 8px out (0.25s).
 * New page: fades in from 8px below (0.35s).
 * Scroll resets to top on navigation.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onAnimationStart={() => {
          // Reset scroll on navigation
          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "instant" });
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
