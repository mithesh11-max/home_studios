import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import architectureImg from "@/assets/architecture-site.jpg";

interface FloorPlan2DProps {
  reason?: "mobile" | "webgl-fallback" | "reduced-motion";
}

export function FloorPlan2D({ reason = "mobile" }: FloorPlan2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Crossfade between SVG drawing and real architecture photo
  const planOpacity = useTransform(scrollYProgress, [0, 0.45, 0.65], [1, 1, 0]);
  const photoOpacity = useTransform(scrollYProgress, [0.45, 0.7, 1], [0, 1, 1]);
  const photoScale = useTransform(scrollYProgress, [0.45, 1], [1.08, 1.0]);
  const overlayY = useTransform(scrollYProgress, [0.65, 0.9], [20, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0.65, 0.85], [0, 1]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: prefersReducedMotion ? "auto" : "180vh" }}
      aria-label="Floor plan to architectural space visualization"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-paper px-4 py-8">
        {/* Subtle grid background */}
        <div className="arch-grid-light absolute inset-0 opacity-40 pointer-events-none" aria-hidden="true" />

        {/* Section Header */}
        <div className="absolute top-20 left-0 right-0 arch-container pointer-events-none z-10 flex justify-between items-start">
          <div>
            <p className="arch-label arch-label--accent mb-2">——— 02 / FROM DRAWING TO SPACE</p>
            <h2 className="font-display text-ink text-[clamp(1.75rem,3.5vw,2.5rem)] font-light leading-none">
              A line on paper becomes living architecture.
            </h2>
          </div>
          <div className="hidden sm:block text-right">
            <span className="arch-label">PROJECTION FIELD</span>
            <p className="arch-label arch-label--accent">1:1 SCALE VERIFIED</p>
          </div>
        </div>

        {/* Central Display: SVG Plan / Architecture Photo */}
        <div
          className="relative w-full max-w-[840px] aspect-[4/3] bg-paper-hi border border-rule overflow-hidden shadow-sm"
          style={{ borderRadius: 0 }}
        >
          {/* 1. SVG Floor Plan Layer */}
          <motion.div
            className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-between"
            style={{ opacity: prefersReducedMotion ? 0 : planOpacity }}
          >
            {/* North arrow & technical stamps */}
            <div className="flex justify-between items-start text-[9px] font-sans tracking-widest text-stone">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 border border-rule flex items-center justify-center text-[7px]">N</span>
                <span>NORTH / TRUE 1:1</span>
              </div>
              <span>DRWG NO. HS-2026-A1</span>
            </div>

            {/* SVG Floor plan geometry */}
            <svg
              className="w-full h-[75%] my-auto"
              viewBox="0 0 600 400"
              fill="none"
              stroke="currentColor"
              aria-label="Architectural floor plan schematic"
            >
              {/* Outer boundary guidelines */}
              <rect x="50" y="30" width="500" height="340" stroke="var(--border)" strokeWidth="0.8" strokeDasharray="3 3" />

              {/* Main Living Wall Enclosure */}
              <motion.path
                d="M 160 80 L 440 80 L 440 300 L 160 300 Z"
                stroke="var(--text-primary)"
                strokeWidth="2.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Master Bedroom Suite (West) */}
              <motion.path
                d="M 60 120 L 160 120 M 60 120 L 60 300 L 160 300"
                stroke="var(--text-primary)"
                strokeWidth="2.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Kitchen & Dining Suite (East) */}
              <motion.path
                d="M 440 100 L 540 100 L 540 280 L 440 280"
                stroke="var(--text-primary)"
                strokeWidth="2.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Glass Glazing Wall (North Opening) */}
              <line x1="200" y1="80" x2="400" y2="80" stroke="var(--indigo)" strokeWidth="1.5" strokeDasharray="6 2" />

              {/* Dimension strings */}
              <text x="300" y="70" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontFamily="Manrope" letterSpacing="1">7.40 M</text>
              <text x="455" y="190" fill="var(--text-secondary)" fontSize="10" fontFamily="Manrope" letterSpacing="1">6.00 M</text>
              <text x="110" y="210" fill="var(--text-muted)" fontSize="9" fontFamily="Manrope" textAnchor="middle">SUITE / 4.2M</text>
              <text x="300" y="190" fill="var(--text-primary)" fontSize="11" fontFamily="Manrope" fontWeight="600" textAnchor="middle">DOUBLE-HEIGHT LIVING</text>
              <text x="490" y="190" fill="var(--text-muted)" fontSize="9" fontFamily="Manrope" textAnchor="middle">DINING / 3.8M</text>
            </svg>

            {/* Bottom annotations */}
            <div className="flex justify-between items-end text-[9px] font-sans tracking-widest text-stone border-t border-rule pt-2">
              <span>SCALE: 1:1 REPRODUCIBLE</span>
              <span style={{ color: "var(--indigo)" }}>EXTRUSION STAGE: PLAN PHASE</span>
            </div>
          </motion.div>

          {/* 2. Photo Crossfade Layer */}
          <motion.div
            className="absolute inset-0"
            style={{
              opacity: prefersReducedMotion ? 1 : photoOpacity,
              scale: prefersReducedMotion ? 1 : photoScale,
            }}
          >
            <img
              src={architectureImg}
              alt="Realized architectural pavilion space — Spatial Canvas Home Studios"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(20,19,16,0.2) 0%, rgba(20,19,16,0.65) 100%)",
              }}
            />
          </motion.div>

          {/* Technical Corner Markers */}
          <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-stone pointer-events-none" />
          <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-stone pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-stone pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-stone pointer-events-none" />
        </div>

        {/* 3. Overlay CTA Lockup */}
        <motion.div
          className="absolute bottom-12 left-0 right-0 arch-container text-center z-20 pointer-events-auto"
          style={{
            opacity: prefersReducedMotion ? 1 : overlayOpacity,
            y: prefersReducedMotion ? 0 : overlayY,
          }}
        >
          <h3 className="font-display text-[clamp(1.5rem,3.2vw,2.4rem)] font-light text-ink sm:text-ink mb-3 leading-none">
            SEE THE SPACE BEFORE IT EXISTS.
          </h3>
          <p className="text-stone text-[0.92rem] max-w-[44ch] mx-auto mb-5 leading-relaxed">
            Every room, corridor and opening mapped to scale so you can verify sightlines and proportions in real life.
          </p>
          <Link to="/walkthrough" className="arch-btn arch-btn--primary" data-interactive>
            EXPLORE 3D WALKTHROUGH <span className="arch-btn-arrow">→</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
