import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { FloorPlan2D } from "./FloorPlan2D";
import { ANNOTATIONS, REALITY_CALLOUTS } from "./geometry";

// Lazy-load the Three.js / R3F scene component
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

  // IntersectionObserver: Mount when approaching, unmount when out of view
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearViewport(entry.isIntersecting);
      },
      {
        rootMargin: "350px 0px 350px 0px", // Preload smoothly before user arrives
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Native scroll progress calculation (0 to 1 across the 300vh container)
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

  // Fallback for reduced-motion or unsupported WebGL
  if (prefersReducedMotion || webglSupported === false) {
    return (
      <FloorPlan2D
        reason={
          prefersReducedMotion
            ? "reduced-motion"
            : "webgl-fallback"
        }
      />
    );
  }

  // Active 5-Stage Cinematic Phase identification
  let activePhase: "plan" | "build" | "light" | "walk" | "experience" = "plan";
  if (scrollProgress >= 0.85) activePhase = "experience";
  else if (scrollProgress >= 0.65) activePhase = "walk";
  else if (scrollProgress >= 0.45) activePhase = "light";
  else if (scrollProgress >= 0.20) activePhase = "build";

  const annotationsOpacity = Math.max(0, 1 - scrollProgress / 0.15);
  const realityCalloutsOpacity =
    scrollProgress >= 0.72 ? Math.min(1, (scrollProgress - 0.72) / 0.12) : 0;
  const showFinalCTA = scrollProgress >= 0.90;

  return (
    <section
      ref={containerRef}
      className="relative w-full"
      style={{ height: "500vh", background: "var(--bg-deep)" }}
      aria-label="Cinematic storytelling sequence — PLAN TO EXPERIENCE"
    >
      {/* Pinned 100vh viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between">
        {/* Subtle architectural grid background */}
        <div className="arch-grid-dark absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />

        {/* Section Header & Signature HUD Pill (Top) */}
        <div className="relative z-20 arch-container pt-16 sm:pt-20 pb-4 flex justify-between items-start pointer-events-none">
          <div className="relative h-12 w-full max-w-[600px]">
            <div className="flex items-center gap-2 mb-2">
              <span className="arch-label arch-label--accent">02 / TRANSFORMATION</span>
              <span className="inline-block w-2 h-px bg-indigo/40" />
              <span className="arch-label text-stone hidden sm:inline">1:1 PROJECTION</span>
            </div>
            
            <div className="relative">
              {/* Dynamic Typography Transition for Narrative */}
              <motion.h2 
                initial={false}
                animate={{ opacity: activePhase === "plan" ? 1 : 0, y: activePhase === "plan" ? 0 : -8 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute top-0 left-0 font-display text-white text-[clamp(1.5rem,3.2vw,2.4rem)] font-light leading-none whitespace-nowrap"
              >
                The foundation of truth.
              </motion.h2>
              <motion.h2 
                initial={false}
                animate={{ opacity: activePhase === "build" ? 1 : 0, y: activePhase === "build" ? 0 : (activePhase === "plan" ? 8 : -8) }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute top-0 left-0 font-display text-white text-[clamp(1.5rem,3.2vw,2.4rem)] font-light leading-none whitespace-nowrap"
              >
                Walls take shape.
              </motion.h2>
              <motion.h2 
                initial={false}
                animate={{ opacity: activePhase === "light" ? 1 : 0, y: activePhase === "light" ? 0 : (["plan", "build"].includes(activePhase) ? 8 : -8) }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute top-0 left-0 font-display text-white text-[clamp(1.5rem,3.2vw,2.4rem)] font-light leading-none whitespace-nowrap"
              >
                Atmosphere emerges.
              </motion.h2>
              <motion.h2 
                initial={false}
                animate={{ opacity: activePhase === "walk" ? 1 : 0, y: activePhase === "walk" ? 0 : (["experience"].includes(activePhase) ? -8 : 8) }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute top-0 left-0 font-display text-white text-[clamp(1.5rem,3.2vw,2.4rem)] font-light leading-none whitespace-nowrap"
              >
                Feel the scale.
              </motion.h2>
              <motion.h2 
                initial={false}
                animate={{ opacity: activePhase === "experience" ? 1 : 0, y: activePhase === "experience" ? 0 : 8 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute top-0 left-0 font-display text-white text-[clamp(1.5rem,3.2vw,2.4rem)] font-light leading-none whitespace-nowrap"
              >
                The space before you build it.
              </motion.h2>
            </div>
          </div>

          {/* Signature Phase HUD Pill - Expanded to 5 stages */}
          <div className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3 py-1.5 border border-white/15 bg-deep/85 backdrop-blur-sm font-mono text-[9px] tracking-widest uppercase pointer-events-auto">
            <span className={`transition-colors duration-300 ${activePhase === "plan" ? "text-indigo font-bold" : "text-stone/60"}`}>PLAN</span>
            <span className="text-stone/40">→</span>
            <span className={`transition-colors duration-300 ${activePhase === "build" ? "text-indigo font-bold" : "text-stone/60"}`}>BUILD</span>
            <span className="text-stone/40">→</span>
            <span className={`transition-colors duration-300 ${activePhase === "light" ? "text-indigo font-bold" : "text-stone/60"}`}>LIGHT</span>
            <span className="text-stone/40">→</span>
            <span className={`transition-colors duration-300 ${activePhase === "walk" ? "text-indigo font-bold" : "text-stone/60"}`}>WALK</span>
            <span className="text-stone/40">→</span>
            <span className={`transition-colors duration-300 ${activePhase === "experience" ? "text-indigo font-bold" : "text-stone/60"}`}>EXP</span>
          </div>
        </div>

        {/* 3D Canvas Viewport */}
        <div className="absolute inset-0 z-0 w-full h-full">
          {isNearViewport && webglSupported && (
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center bg-deep">
                  <span className="arch-label text-stone font-mono text-[10px] tracking-widest">
                    INITIALIZING ARCHITECTURAL SCENE...
                  </span>
                </div>
              }
            >
              <LazyFloorPlanScene progress={scrollProgress} isMobile={isMobile} />
            </Suspense>
          )}
        </div>

        {/* 2D Plan Room Annotations (Visible during Stage 1 & early Stage 2) */}
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
                <span className="arch-label text-white/90" style={{ fontSize: "9px" }}>
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

        {/* Stage 7 Reality Spatial Callouts (Fades in at Eye Level) */}
        {scrollProgress >= 0.70 && (
          <div
            className="absolute inset-0 z-15 pointer-events-none arch-container flex flex-col justify-between py-24 sm:py-28 transition-opacity duration-500"
            style={{ opacity: realityCalloutsOpacity }}
            aria-hidden={realityCalloutsOpacity < 0.05 ? "true" : undefined}
          >
            <div className="flex justify-between items-start">
              <div className="px-3 py-1.5 bg-deep/85 border border-white/15 backdrop-blur-sm">
                <p className="arch-label arch-label--accent">3.60M CLEARANCE</p>
                <p className="text-white/70 text-[10px] font-mono">Double-height pavilion volume</p>
              </div>

              <div className="px-3 py-1.5 bg-deep/85 border border-white/15 backdrop-blur-sm text-right">
                <p className="arch-label text-white">DIRECT DAYLIGHT</p>
                <p className="text-white/70 text-[10px] font-mono">North-facing floor glazing</p>
              </div>
            </div>

            <div className="flex justify-between items-end pb-12">
              <div className="px-3 py-1.5 bg-deep/85 border border-white/15 backdrop-blur-sm">
                <p className="arch-label text-indigo">1200MM WALKWAY</p>
                <p className="text-white/70 text-[10px] font-mono">Unobstructed circulation flow</p>
              </div>

              <div className="px-3 py-1.5 bg-deep/85 border border-white/15 backdrop-blur-sm text-right">
                <p className="arch-label arch-label--accent">1:1 SCALE VERIFIED</p>
                <p className="text-white/70 text-[10px] font-mono">RR Nagar studio field</p>
              </div>
            </div>
          </div>
        )}

        {/* Final CTA Overlay (Settles at 0.88 - 1.00) */}
        <div
          className="relative z-20 arch-container pb-8 sm:pb-12 transition-all duration-500 text-center pointer-events-none"
          style={{
            opacity: showFinalCTA ? 1 : 0,
            transform: `translateY(${showFinalCTA ? 0 : 16}px)`,
          }}
        >
          <h3 className="font-display text-white text-[clamp(1.6rem,3.6vw,2.8rem)] font-light leading-tight mb-3">
            SEE THE SPACE BEFORE IT EXISTS.
          </h3>
          <p className="text-white/75 text-[0.95rem] max-w-[46ch] mx-auto mb-5 leading-relaxed">
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
