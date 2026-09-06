import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { FloorPlan2D } from "./FloorPlan2D";
import { ANNOTATIONS } from "./geometry";

// Lazy-load the heavy Three.js / R3F scene component
const LazyFloorPlanScene = lazy(() => import("./Scene"));

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function FloorPlanRise() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Screen size check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // WebGL support check
  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  // IntersectionObserver: Mount only when approaching, unmount when out of view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearViewport(entry.isIntersecting);
      },
      {
        rootMargin: "300px 0px 300px 0px", // Preload slightly before scroll arrives
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Native scroll progress calculation (0 to 1 across the ~250vh section)
  useEffect(() => {
    if (!isNearViewport) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const el = containerRef.current;
          if (el) {
            const rect = el.getBoundingClientRect();
            const totalScroll = el.offsetHeight - window.innerHeight;
            if (totalScroll > 0) {
              const current = -rect.top;
              const p = Math.max(0, Math.min(1, current / totalScroll));
              setScrollProgress(p);
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isNearViewport]);

  // If mobile, reduced-motion, or no WebGL support, use high-fidelity SVG/Photo 2D fallback
  if (isMobile || prefersReducedMotion || webglSupported === false) {
    return (
      <FloorPlan2D
        reason={
          isMobile
            ? "mobile"
            : prefersReducedMotion
            ? "reduced-motion"
            : "webgl-fallback"
        }
      />
    );
  }

  const annotationsOpacity = Math.max(0, 1 - scrollProgress / 0.18);
  const showFinalCTA = scrollProgress >= 0.92;

  return (
    <section
      ref={containerRef}
      className="relative w-full"
      style={{ height: "250vh", background: "var(--bg-deep)" }}
      aria-label="3D Interactive Floor Plan Extrusion"
    >
      {/* Pinned 100vh viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Subtle grid background */}
        <div className="arch-grid-light absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true" />

        {/* Section Header & Metadata Overlay (Top) */}
        <div className="relative z-10 arch-container pt-20 pb-4 flex justify-between items-start pointer-events-none">
          <div>
            <p className="arch-label arch-label--accent mb-2">——— 02 / FROM DRAWING TO SPACE</p>
            <h2 className="font-display text-ink text-[clamp(1.6rem,3.2vw,2.4rem)] font-light leading-none">
              A line on paper becomes living architecture.
            </h2>
          </div>

          <div className="hidden md:flex flex-col items-end gap-1">
            <span className="arch-label">PROJECTION FIELD</span>
            <span className="arch-label arch-label--accent">1:1 SCALE • BENGALURU</span>
          </div>
        </div>

        {/* 3D Canvas Viewport */}
        <div className="absolute inset-0 z-0 w-full h-full">
          {isNearViewport && webglSupported && (
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-paper">
                  <span className="arch-label text-stone">PREPARING 3D PERSPECTIVE...</span>
                </div>
              }
            >
              <LazyFloorPlanScene progress={scrollProgress} />
            </Suspense>
          )}
        </div>

        {/* 2D Plan Room Annotations (Fade out after progress > 0.15) */}
        <div
          className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center transition-opacity duration-300"
          style={{ opacity: annotationsOpacity }}
          aria-hidden={annotationsOpacity < 0.05 ? "true" : undefined}
        >
          <div className="relative w-full max-w-[800px] h-[500px]">
            {ANNOTATIONS.map((ann) => (
              <div
                key={ann.label}
                className="absolute flex flex-col items-center transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${50 + ann.x * 6}%`,
                  top: `${50 + ann.z * 6}%`,
                }}
              >
                <span className="arch-label text-stone" style={{ fontSize: "9px" }}>
                  {ann.label}
                </span>
                {ann.dimension && (
                  <span className="arch-label arch-label--accent" style={{ fontSize: "8px" }}>
                    {ann.dimension}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA Overlay (Settles at 0.95 - 1.00) */}
        <div
          className="relative z-20 arch-container pb-12 transition-all duration-500 text-center pointer-events-none"
          style={{
            opacity: showFinalCTA ? 1 : 0,
            transform: `translateY(${showFinalCTA ? 0 : 16}px)`,
          }}
        >
          <h3 className="font-display text-ink text-[clamp(1.75rem,4vw,3rem)] font-light leading-tight mb-4">
            SEE THE SPACE BEFORE IT EXISTS.
          </h3>
          <p className="text-stone text-[0.95rem] max-w-[46ch] mx-auto mb-6 leading-relaxed">
            Every room, corridor and opening mapped to scale so you can verify sightlines and clearance in real life.
          </p>
          <div className="pointer-events-auto">
            <Link to="/walkthrough" className="arch-btn arch-btn--primary" data-interactive>
              EXPLORE 3D WALKTHROUGH <span className="arch-btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FloorPlanRise;
