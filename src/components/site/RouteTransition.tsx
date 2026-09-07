import { type ReactNode, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
 * Wraps <Outlet> to provide premium spatial transitions between routes.
 * Uses clip-path masking to create an architectural vertical wipe.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const router = useRouter();

  // Track if navigation is via browser back/forward (POP) to preserve scroll position
  const isPopRef = useRef(false);

  useEffect(() => {
    const unsubscribe = router.history.subscribe(() => {
      isPopRef.current = router.history.action === 'POP';
    });
    return () => unsubscribe();
  }, [router]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ 
          clipPath: "inset(100% 0% 0% 0%)",
          y: 40,
          scale: 0.97,
          opacity: 0,
          filter: "brightness(0.6) blur(4px)"
        }}
        animate={{ 
          clipPath: "inset(0% 0% 0% 0%)",
          y: 0,
          scale: 1,
          opacity: 1,
          filter: "brightness(1) blur(0px)"
        }}
        exit={{ 
          clipPath: "inset(0% 0% 100% 0%)",
          y: -40,
          scale: 0.97,
          opacity: 0,
          filter: "brightness(0.6) blur(4px)"
        }}
        transition={{ 
          duration: 0.75, 
          ease: [0.22, 1, 0.36, 1] 
        }}
        className="w-full origin-center relative will-change-transform"
      >
        <ScrollRestorationHandler isPop={isPopRef.current} />
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
