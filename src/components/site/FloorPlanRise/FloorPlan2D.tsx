import { useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import architectureImg from "@/assets/architecture-site.jpg";
import interiorFinishedImg from "@/assets/interior-finished.jpg";
import { EASE_ARCH_HEAVY, EASE_ARCH_SMOOTH } from "@/lib/motion";

interface FloorPlan2DProps {
  reason?: "mobile" | "webgl-fallback" | "reduced-motion";
}

export function FloorPlan2D({ reason = "mobile" }: FloorPlan2DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [activePhase, setActivePhase] = useState<"plan" | "space" | "reality">("plan");

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Track active phase for HUD
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.32) {
      setActivePhase("plan");
    } else if (latest < 0.68) {
      setActivePhase("space");
    } else {
      setActivePhase("reality");
    }
  });

  // Scroll-linked transforms
  // 1. Stage 01 (Plan): Line drawing progresses 0.0 -> 0.28
  const pathLength1 = useTransform(scrollYProgress, [0.02, 0.18], [0, 1]);
  const pathLength2 = useTransform(scrollYProgress, [0.08, 0.24], [0, 1]);
  const pathLength3 = useTransform(scrollYProgress, [0.14, 0.28], [0, 1]);
  const planOpacity = useTransform(scrollYProgress, [0, 0.45, 0.65], [1, 1, 0]);

  // 2. Stage 02 (Space): Depth offset & furniture outlines 0.28 -> 0.65
  const spaceOpacity = useTransform(scrollYProgress, [0.28, 0.42, 0.62, 0.72], [0, 1, 1, 0]);
  const furnitureScale = useTransform(scrollYProgress, [0.34, 0.52], [0.85, 1]);

  // 3. Stage 03 (Reality): Finished interior image & callouts 0.62 -> 1.0
  const photoOpacity = useTransform(scrollYProgress, [0.62, 0.78, 1], [0, 1, 1]);
  const photoScale = useTransform(scrollYProgress, [0.62, 1], [1.08, 1.0]);
  const realityCalloutOpacity = useTransform(scrollYProgress, [0.72, 0.85], [0, 1]);

  // Bottom CTA
  const overlayOpacity = useTransform(scrollYProgress, [0.82, 0.94], [0, 1]);
  const overlayY = useTransform(scrollYProgress, [0.82, 0.96], [16, 0]);

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: prefersReducedMotion ? "auto" : "240vh", background: "var(--bg-deep)" }}
      aria-label="Floor plan to architectural space transformation"
    >
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between items-center overflow-hidden px-4 py-8">
        {/* Subtle grid background */}
        <div className="arch-grid-dark absolute inset-0 opacity-25 pointer-events-none" aria-hidden="true" />

        {/* Section Header & HUD */}
        <div className="relative z-20 w-full max-w-6xl mx-auto pt-16 flex justify-between items-start pointer-events-none">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="arch-label arch-label--accent">02 / INTERACTIVE TRANSFORMATION</span>
              <span className="inline-block w-2 h-px bg-indigo/40" />
              <span className="arch-label text-stone">1:1 SCALE</span>
            </div>
            <h2 className="font-display text-white text-[clamp(1.5rem,3.2vw,2.4rem)] font-light leading-none">
              From drawing to physical space.
            </h2>
          </div>

          {/* Signature Phase HUD Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 border border-rule-light/20 bg-deep/80 backdrop-blur-sm font-mono text-[9px] tracking-widest uppercase">
            <span
              className={`transition-colors duration-300 ${
                activePhase === "plan" ? "text-indigo font-bold" : "text-stone/60"
              }`}
            >
              01 PLAN
            </span>
            <span className="text-stone/40">→</span>
            <span
              className={`transition-colors duration-300 ${
                activePhase === "space" ? "text-indigo font-bold" : "text-stone/60"
              }`}
            >
              02 SPACE
            </span>
            <span className="text-stone/40">→</span>
            <span
              className={`transition-colors duration-300 ${
                activePhase === "reality" ? "text-indigo font-bold" : "text-stone/60"
              }`}
            >
              03 REALITY
            </span>
          </div>
        </div>

        {/* Central Display: SVG Plan / Space Volume / Architecture Photo */}
        <div
          className="relative w-full max-w-[880px] aspect-[16/10] sm:aspect-[16/9] bg-[#0E122A] border border-white/10 overflow-hidden my-auto"
          style={{ borderRadius: 0 }}
        >
          {/* Layer 1: 2D Drafting Blueprint Lines */}
          <motion.div
            className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between z-10"
            style={{ opacity: prefersReducedMotion ? 0 : planOpacity }}
          >
            <div className="flex justify-between items-start text-[9px] font-mono tracking-widest text-indigo/70">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 border border-indigo/40 flex items-center justify-center text-[7px]">
                  N
                </span>
                <span>NORTH ORIENTED</span>
              </div>
              <span>SCALE 1:1 REPRODUCIBLE</span>
            </div>

            <svg
              className="w-full h-[78%] my-auto"
              viewBox="0 0 600 380"
              fill="none"
              stroke="currentColor"
              aria-label="Architectural floor plan schematic"
            >
              {/* Outer boundary lines */}
              <motion.rect
                x="40"
                y="30"
                width="520"
                height="320"
                stroke="rgba(138, 134, 252, 0.25)"
                strokeWidth="1"
                strokeDasharray="4 4"
                style={{ pathLength: pathLength1 }}
              />

              {/* Main Living Wall Enclosure */}
              <motion.path
                d="M 170 70 L 430 70 L 430 290 L 170 290 Z"
                stroke="#8A86FC"
                strokeWidth="2.4"
                style={{ pathLength: pathLength1 }}
              />

              {/* Master Bedroom Suite (West) */}
              <motion.path
                d="M 70 110 L 170 110 M 70 110 L 70 290 L 170 290"
                stroke="#8A86FC"
                strokeWidth="2.0"
                style={{ pathLength: pathLength2 }}
              />

              {/* Kitchen & Dining Suite (East) */}
              <motion.path
                d="M 430 90 L 530 90 L 530 270 L 430 270"
                stroke="#8A86FC"
                strokeWidth="2.0"
                style={{ pathLength: pathLength2 }}
              />

              {/* Glass Wall (North Opening) */}
              <motion.line
                x1="210"
                y1="70"
                x2="390"
                y2="70"
                stroke="#A9AED0"
                strokeWidth="1.8"
                strokeDasharray="6 2"
                style={{ pathLength: pathLength3 }}
              />

              {/* Dimension Callouts */}
              <text x="300" y="60" textAnchor="middle" fill="#A9AED0" fontSize="9" fontFamily="monospace" letterSpacing="1">
                7.40 M
              </text>
              <text x="445" y="180" fill="#A9AED0" fontSize="9" fontFamily="monospace" letterSpacing="1">
                6.00 M
              </text>
              <text x="300" y="185" fill="#FFFFFF" fontSize="11" fontFamily="Manrope" fontWeight="500" textAnchor="middle">
                DOUBLE-HEIGHT LIVING
              </text>
              <text x="120" y="200" fill="#A9AED0" fontSize="9" fontFamily="Manrope" textAnchor="middle">
                SUITE / 4.2M
              </text>
              <text x="480" y="180" fill="#A9AED0" fontSize="9" fontFamily="Manrope" textAnchor="middle">
                DINING / 3.8M
              </text>
            </svg>

            <div className="flex justify-between items-end text-[9px] font-mono tracking-widest text-stone border-t border-white/10 pt-2">
              <span>DRWG NO. HS-2026-A1</span>
              <span className="text-indigo">STAGE 01: 2D DRAFTING</span>
            </div>
          </motion.div>

          {/* Layer 2: Spatial Volume & Furniture Outlines (Stage 02) */}
          <motion.div
            className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between pointer-events-none z-15"
            style={{ opacity: prefersReducedMotion ? 0 : spaceOpacity }}
          >
            <div className="flex justify-between text-[9px] font-mono tracking-widest text-indigo">
              <span>EXTRUSION DEPTH: ACTIVE</span>
              <span>VOLUME: 3.60M CLEARANCE</span>
            </div>

            <motion.svg
              className="w-full h-[78%] my-auto"
              viewBox="0 0 600 380"
              fill="none"
              style={{ scale: furnitureScale }}
            >
              {/* Furniture Footprints */}
              {/* Living Room Area Rug */}
              <rect x="220" y="140" width="160" height="110" fill="rgba(138, 134, 252, 0.08)" stroke="#8A86FC" strokeWidth="0.8" strokeDasharray="3 3" />
              {/* Sectional Sofa */}
              <rect x="240" y="210" width="120" height="30" fill="#1B2248" stroke="#8A86FC" strokeWidth="1.2" />
              <rect x="240" y="170" width="35" height="40" fill="#1B2248" stroke="#8A86FC" strokeWidth="1.2" />
              {/* Coffee Table */}
              <rect x="270" y="170" width="60" height="25" fill="#2E241E" stroke="#A9AED0" strokeWidth="1" />
              {/* Kitchen Island */}
              <rect x="450" y="150" width="40" height="70" fill="#252C54" stroke="#8A86FC" strokeWidth="1.2" />
              {/* Master Bed */}
              <rect x="90" y="160" width="60" height="70" fill="#2E241E" stroke="#8A86FC" strokeWidth="1.2" />

              <text x="300" y="160" fill="#8A86FC" fontSize="9" fontFamily="monospace" textAnchor="middle">
                FURNITURE CLEARANCE: 1200MM
              </text>
            </motion.svg>

            <div className="flex justify-between text-[9px] font-mono tracking-widest text-stone border-t border-white/10 pt-2">
              <span>SHADOW DEPTH: ACTIVATED</span>
              <span className="text-indigo">STAGE 02: SPATIAL EXTRUSION</span>
            </div>
          </motion.div>

          {/* Layer 3: Photoreal Architecture Interior Reality (Stage 03) */}
          <motion.div
            className="absolute inset-0 z-20"
            style={{
              opacity: prefersReducedMotion ? 1 : photoOpacity,
              scale: prefersReducedMotion ? 1 : photoScale,
            }}
          >
            <img
              src={architectureImg}
              alt="Realized architectural pavilion space at 1:1 scale — Spatial Canvas Home Studios"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(180deg, rgba(8,11,26,0.15) 0%, rgba(8,11,26,0.7) 100%)",
              }}
            />

            {/* Reality Callouts */}
            <motion.div
              className="absolute inset-0 p-6 flex flex-col justify-between pointer-events-none"
              style={{ opacity: prefersReducedMotion ? 1 : realityCalloutOpacity }}
            >
              <div className="flex justify-between items-start">
                <span className="px-2 py-1 bg-deep/80 border border-white/10 font-mono text-[9px] text-white">
                  3.60M CEILING HEIGHT
                </span>
                <span className="px-2 py-1 bg-deep/80 border border-white/10 font-mono text-[9px] text-indigo">
                  NATURAL CROSS-VENTILATION
                </span>
              </div>

              <div className="flex justify-between items-end">
                <span className="px-2 py-1 bg-deep/80 border border-white/10 font-mono text-[9px] text-white/80">
                  TRUE 1:1 SCALE VERIFIED
                </span>
                <span className="px-2 py-1 bg-indigo text-deep font-mono text-[9px] font-bold">
                  STAGE 03: REALITY
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Technical Corner Crop Marks */}
          <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/30 pointer-events-none z-30" />
          <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/30 pointer-events-none z-30" />
          <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/30 pointer-events-none z-30" />
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/30 pointer-events-none z-30" />
        </div>

        {/* Bottom CTA Lockup */}
        <motion.div
          className="relative z-20 w-full max-w-xl mx-auto text-center pb-4 pointer-events-auto"
          style={{
            opacity: prefersReducedMotion ? 1 : overlayOpacity,
            y: prefersReducedMotion ? 0 : overlayY,
          }}
        >
          <h3 className="font-display text-white text-[clamp(1.4rem,3vw,2.2rem)] font-light mb-2 leading-tight">
            SEE THE SPACE BEFORE IT EXISTS.
          </h3>
          <p className="text-white/70 text-[0.92rem] max-w-[44ch] mx-auto mb-4 leading-relaxed">
            Every room, corridor and opening mapped to 1:1 scale so you can verify sightlines and proportions in real life.
          </p>
          <Link to="/walkthrough" className="arch-btn arch-btn--primary" data-interactive>
            EXPLORE 3D WALKTHROUGH <span className="arch-btn-arrow">→</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default FloorPlan2D;

