import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import Lenis, { type ScrollToOptions } from "lenis";
import { LENIS_CONFIG } from "./motion";

interface SmoothScrollContextType {
  lenis: Lenis | null;
  scrollTo: (
    target: string | HTMLElement | number,
    options?: ScrollToOptions & { offset?: number }
  ) => void;
  stop: () => void;
  start: () => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
  scrollTo: () => {},
  stop: () => {},
  start: () => {},
});

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const [lenisState, setLenisState] = useState<Lenis | null>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion: if user prefers reduced motion, do not enable smooth scroll
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      return;
    }

    const lenis = new Lenis(LENIS_CONFIG);
    lenisRef.current = lenis;
    setLenisState(lenis);

    // Attach to window for global inspection/debugging
    if (typeof window !== "undefined") {
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    }

    // Unified animation frame loop
    let rafId = 0;
    function onFrame(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(onFrame);
    }
    rafId = requestAnimationFrame(onFrame);

    // Handle dynamically changing reduced motion preference
    const onMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        lenis.destroy();
        lenisRef.current = null;
        setLenisState(null);
      }
    };
    motionQuery.addEventListener("change", onMotionChange);

    return () => {
      cancelAnimationFrame(rafId);
      motionQuery.removeEventListener("change", onMotionChange);
      lenis.destroy();
      lenisRef.current = null;
      setLenisState(null);
      if (typeof window !== "undefined") {
        delete (window as unknown as { __lenis?: Lenis }).__lenis;
      }
    };
  }, []);

  const scrollTo = useCallback(
    (
      target: string | HTMLElement | number,
      options?: ScrollToOptions & { offset?: number }
    ) => {
      const lenis = lenisRef.current;
      // Default offset of -64 to account for fixed SiteHeader height
      const defaultOffset = typeof target === "number" ? 0 : -64;
      const opts = {
        offset: defaultOffset,
        ...options,
      };

      if (lenis) {
        lenis.scrollTo(target, opts);
      } else {
        // Fallback for native / reduced-motion
        if (typeof target === "number") {
          window.scrollTo({ top: target, behavior: options?.immediate ? "instant" : "smooth" });
        } else if (typeof target === "string") {
          const el = document.querySelector(target);
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY + (opts.offset || 0);
            window.scrollTo({ top, behavior: options?.immediate ? "instant" : "smooth" });
          }
        } else if (target instanceof HTMLElement) {
          const top = target.getBoundingClientRect().top + window.scrollY + (opts.offset || 0);
          window.scrollTo({ top, behavior: options?.immediate ? "instant" : "smooth" });
        }
      }
    },
    []
  );

  const stop = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  // Global anchor click interception: smooth scroll to internal hash links
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Check for in-page hashes (e.g. "#section", "/#hs-content", "#hs-content")
      const isCurrentPageHash =
        href.startsWith("#") ||
        (href.startsWith("/#") && window.location.pathname === "/");

      if (isCurrentPageHash) {
        const hash = href.startsWith("/#") ? href.slice(2) : href.slice(1);
        if (!hash) return;

        const targetEl = document.getElementById(hash);
        if (targetEl) {
          e.preventDefault();
          scrollTo(targetEl, { offset: -64 });
          window.history.pushState(null, "", `#${hash}`);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [scrollTo]);

  return (
    <SmoothScrollContext.Provider
      value={{
        lenis: lenisState,
        scrollTo,
        stop,
        start,
      }}
    >
      {children}
    </SmoothScrollContext.Provider>
  );
}

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}
