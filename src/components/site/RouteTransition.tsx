import { type ReactNode, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useLocation, useRouter } from "@tanstack/react-router";
import { useSmoothScroll } from "@/lib/lenis-context";

// Inner component to ensure scroll happens only when the new page mounts,
// avoiding layout jumps while the old page is still exiting.
function ScrollRestorationHandler({ isPop }: { isPop: boolean }) {
  const { scrollTo } = useSmoothScroll();
  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.hash && !isPop) {
      scrollTo(0, { immediate: true });
    }
  }, [isPop, scrollTo]);
  return null;
}

/**
 * Wraps <Outlet> to provide crisp architectural transitions between routes.
 * Uses clip-path masking to create an architectural vertical unmasking sheet (380ms).
 * When prefers-reduced-motion is set, route changes are instant (opacity only, 50ms).
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  // Track if navigation is via browser back/forward (POP) to preserve scroll position
  const isPopRef = useRef(false);

  useEffect(() => {
    const unsubscribe = router.history.subscribe(() => {
      isPopRef.current = router.history.action === "POP";
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={
          prefersReducedMotion
            ? { opacity: 1 }
            : { clipPath: "inset(100% 0% 0% 0%)", opacity: 0.85 }
        }
        animate={
          prefersReducedMotion
            ? { opacity: 1 }
            : { clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }
        }
        exit={
          prefersReducedMotion
            ? { opacity: 1 }
            : { clipPath: "inset(0% 0% 100% 0%)", opacity: 0.85 }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0.05 }
            : { duration: 0.38, ease: [0.22, 1, 0.36, 1] }
        }
        // Deliberately no `y`/transform here: this wrapper is an ancestor of the
        // fixed-position SiteHeader in every route. Any transform on it (even a
        // resting translateY(0)) creates a CSS containing block that breaks
        // position:fixed for descendants, so the header scrolls away with the
        // page instead of staying pinned. clip-path + opacity give the same
        // "unmasking sheet" transition without ever touching transform.
        className="w-full origin-center relative"
      >
        <ScrollRestorationHandler isPop={isPopRef.current} />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export default RouteTransition;
