import { useRef, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useAppointment } from "@/lib/appointment-context";
import interiorFinishedImg from "@/assets/interior-finished.jpg";

export function PlanSpaceExperience() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { open } = useAppointment();
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Stage progress boundaries
  // Stage 1 (PLAN): 0.00 -> 0.35
  // Stage 2 (SPACE): 0.35 -> 0.70
  // Stage 3 (EXPERIENCE): 0.70 -> 1.00

  // 1. Drawing vector strokes for Stage 1
  const lineDrawProgress = useTransform(scrollYProgress, [0.02, 0.28], [0, 1]);
  const planOpacity = useTransform(scrollYProgress, [0, 0.25, 0.65, 0.75], [1, 1, 0.2, 0]);

  // 2. Isometric 3D Space Extrusion for Stage 2
  const isoRotateX = useTransform(scrollYProgress, [0.25, 0.55], [0, isMobile ? 42 : 54]);
  const isoRotateZ = useTransform(scrollYProgress, [0.25, 0.55], [0, isMobile ? -24 : -36]);
  const isoScale = useTransform(scrollYProgress, [0.25, 0.65], [1, isMobile ? 0.95 : 1.05]);
  const wallExtrudeHeight = useTransform(scrollYProgress, [0.32, 0.60], [0, isMobile ? 28 : 52]);
  const furnitureOpacity = useTransform(scrollYProgress, [0.42, 0.62], [0, 1]);
  const furnitureY = useTransform(scrollYProgress, [0.42, 0.62], [14, 0]);

  // 3. Photographic Architectural Reality for Stage 3
  const realityOpacity = useTransform(scrollYProgress, [0.65, 0.85], [0, 1]);
  const realityScale = useTransform(scrollYProgress, [0.65, 1.0], [1.08, 1.0]);
  const realityCalloutsOpacity = useTransform(scrollYProgress, [0.78, 0.92], [0, 1]);

  // Dynamic Phase Identifier
  const [activeStage, setActiveStage] = useState<"plan" | "space" | "experience">("plan");

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (latest >= 0.70) setActiveStage("experience");
      else if (latest >= 0.32) setActiveStage("space");
      else setActiveStage("plan");
    });
  }, [scrollYProgress]);

  return (
    <section
      ref={containerRef}
      className="relative w-full bg-deep"
      style={{
        height: isMobile ? "220vh" : "280vh",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
      }}
      aria-label="Signature Experience — PLAN TO EXPERIENCE"
    >
      {/* Sticky 100vh Viewport Chamber */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between py-6 sm:py-10">
        {/* Subtle Architectural Drafting Grid Background */}
        <div className="arch-grid-dark absolute inset-0 opacity-25 pointer-events-none" aria-hidden="true" />

        {/* ── Top Header & Technical Status Bar ── */}
        <div className="relative z-20 arch-container flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-none pt-12 sm:pt-14">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="arch-label arch-label--accent">02 / SIGNATURE EXPERIENCE</span>
              <span className="inline-block w-2 h-px bg-indigo/40" />
              <span className="arch-label text-stone hidden sm:inline">1:1 SCALE PROJECTION</span>
            </div>
            <h2
              className="font-display text-white text-[clamp(1.4rem,3vw,2.2rem)] font-light leading-none"
            >
              {activeStage === "plan" && "The drawing is a promise."}
              {activeStage === "space" && "Walls take physical shape."}
              {activeStage === "experience" && "Walk through before you build."}
            </h2>
          </div>

          {/* Precision Architectural Stage HUD */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface/90 border border-white/12 backdrop-blur-sm pointer-events-auto self-start sm:self-auto font-mono text-[9px] tracking-widest uppercase">
            <span className={activeStage === "plan" ? "text-indigo font-bold" : "text-stone/60"}>
              01 PLAN
            </span>
            <span className="text-stone/40">→</span>
            <span className={activeStage === "space" ? "text-indigo font-bold" : "text-stone/60"}>
              02 SPACE
            </span>
            <span className="text-stone/40">→</span>
            <span className={activeStage === "experience" ? "text-indigo font-bold" : "text-stone/60"}>
              03 EXPERIENCE
            </span>
          </div>
        </div>

        {/* ── Center Stage: Isometric Transformation Chamber ── */}
        <div className="relative z-10 w-full flex-1 flex items-center justify-center px-4 overflow-hidden">
          <div
            className="relative w-full max-w-[760px] aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center"
            style={{
              perspective: prefersReducedMotion ? "none" : "1200px",
            }}
          >
            {/* ── STAGE 1 & 2: 2D Blueprint -> 3D Isometric Extrusion Frame ── */}
            <motion.div
              style={{
                opacity: planOpacity,
                rotateX: prefersReducedMotion ? 0 : isoRotateX,
                rotateZ: prefersReducedMotion ? 0 : isoRotateZ,
                scale: isoScale,
                transformStyle: "preserve-3d",
              }}
              className="absolute inset-4 sm:inset-6 border border-indigo/35 bg-surface/60 backdrop-blur-sm shadow-2xl flex items-center justify-center p-4 sm:p-8 select-none"
            >
              {/* Floor Plan Drafting Grid & Vectors */}
              <svg
                viewBox="0 0 600 400"
                className="w-full h-full overflow-visible"
                fill="none"
              >
                {/* Background Blueprint Grid Lines */}
                <defs>
                  <pattern id="archGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(138, 134, 252, 0.08)" strokeWidth="0.6" />
                  </pattern>
                </defs>
                <rect width="600" height="400" fill="url(#archGrid)" />

                {/* Outer Perimeter Wall Vector */}
                <motion.rect
                  x="60"
                  y="50"
                  width="480"
                  height="300"
                  stroke="#8A86FC"
                  strokeWidth="2"
                  pathLength={lineDrawProgress}
                />

                {/* Living Pavilion Glazing Wall */}
                <motion.line
                  x1="60"
                  y1="350"
                  x2="540"
                  y2="350"
                  stroke="#38BDF8"
                  strokeWidth="3.5"
                  strokeDasharray="8 4"
                  pathLength={lineDrawProgress}
                />

                {/* Interior Partition Walls */}
                <motion.line
                  x1="260"
                  y1="50"
                  x2="260"
                  y2="240"
                  stroke="#8A86FC"
                  strokeWidth="2"
                  pathLength={lineDrawProgress}
                />
                <motion.line
                  x1="260"
                  y1="180"
                  x2="440"
                  y2="180"
                  stroke="#8A86FC"
                  strokeWidth="2"
                  pathLength={lineDrawProgress}
                />

                {/* Doorway Openings & Arcs */}
                <motion.path
                  d="M 260,240 A 45,45 0 0,1 215,285"
                  stroke="rgba(138, 134, 252, 0.6)"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  pathLength={lineDrawProgress}
                />

                {/* Dimension Strings */}
                <g className="font-mono text-[9px] fill-stone">
                  <text x="300" y="35" textAnchor="middle" fill="#8A86FC">24' 0" (7.30M)</text>
                  <text x="35" y="200" textAnchor="middle" transform="rotate(-90 35 200)" fill="#8A86FC">18' 6" (5.60M)</text>
                  <text x="360" y="280" textAnchor="middle" fill="#A9AED0">1200mm CLEARANCE</text>
                </g>

                {/* Room Zone Labels */}
                <text x="160" y="140" textAnchor="middle" fill="rgba(255,255,255,0.7)" className="font-sans text-[11px] font-semibold tracking-wider">
                  PRIMARY SUITE
                </text>
                <text x="400" y="110" textAnchor="middle" fill="rgba(255,255,255,0.7)" className="font-sans text-[11px] font-semibold tracking-wider">
                  CULINARY ISLAND
                </text>
                <text x="380" y="270" textAnchor="middle" fill="white" className="font-sans text-[13px] font-semibold tracking-widest">
                  LIVING PAVILION
                </text>
              </svg>

              {/* 3D Extruded Wall Slabs (Visible during Stage 2) */}
              <motion.div
                style={{
                  height: wallExtrudeHeight,
                  transform: "translateZ(18px)",
                }}
                className="absolute inset-x-8 top-12 pointer-events-none border-t-2 border-indigo/80 bg-gradient-to-b from-indigo/20 to-transparent"
              />

              {/* Procedural Modular Furniture Outline Layout (Stage 2) */}
              <motion.div
                style={{
                  opacity: furnitureOpacity,
                  y: furnitureY,
                  transform: "translateZ(12px)",
                }}
                className="absolute bottom-16 right-16 sm:right-24 w-44 sm:w-56 h-28 sm:h-36 border border-white/40 bg-surface-lt/80 p-2.5 flex flex-col justify-between shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-white/15 pb-1">
                  <span className="arch-label text-[8px] text-indigo">SECTIONAL SOFA</span>
                  <span className="arch-label text-[8px] text-stone">3.2M × 1.8M</span>
                </div>
                <div className="w-16 h-8 border border-indigo/60 bg-indigo/10 self-center flex items-center justify-center">
                  <span className="font-mono text-[7px] text-white/80">COFFEE TABLE</span>
                </div>
                <span className="arch-label text-[7px] text-emerald-400">1:1 FURNITURE ON WHEELS</span>
              </motion.div>
            </motion.div>

            {/* ── STAGE 3: Full-Scale Finished Reality Photograph ── */}
            <motion.div
              style={{
                opacity: realityOpacity,
                scale: realityScale,
              }}
              className="absolute inset-0 bg-deep border border-indigo/50 overflow-hidden shadow-2xl"
              data-cursor="view"
            >
              <img
                src={interiorFinishedImg}
                alt="1:1 verified architectural living pavilion at Home Studios"
                loading="lazy"
                className="w-full h-full object-cover object-center"
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(8,11,26,0.3) 0%, transparent 40%, rgba(8,11,26,0.75) 100%)",
                }}
              />

              {/* Verified Scale HUD Callouts */}
              <motion.div
                style={{ opacity: realityCalloutsOpacity }}
                className="absolute inset-0 p-4 sm:p-8 flex flex-col justify-between pointer-events-none"
              >
                <div className="flex justify-between items-start">
                  <div className="px-2.5 py-1.5 bg-deep/90 border border-white/20 backdrop-blur-sm">
                    <p className="arch-label arch-label--accent text-[8px] sm:text-[9px]">3.60M CLEARANCE</p>
                    <p className="font-mono text-[9px] text-white/80">Double-height pavilion</p>
                  </div>
                  <div className="px-2.5 py-1.5 bg-deep/90 border border-white/20 backdrop-blur-sm text-right">
                    <p className="arch-label text-white text-[8px] sm:text-[9px]">DIRECT DAYLIGHT</p>
                    <p className="font-mono text-[9px] text-white/80">North floor glazing</p>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="px-2.5 py-1.5 bg-deep/90 border border-white/20 backdrop-blur-sm">
                    <p className="arch-label text-indigo text-[8px] sm:text-[9px]">1200MM WALKWAY</p>
                    <p className="font-mono text-[9px] text-white/80">Verified circulation flow</p>
                  </div>
                  <div className="px-2.5 py-1.5 bg-deep/90 border border-indigo/60 backdrop-blur-sm text-right">
                    <p className="arch-label arch-label--accent text-[8px] sm:text-[9px]">1:1 SCALE VALIDATED</p>
                    <p className="font-mono text-[9px] text-white/80">RR Nagar Studio</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* ── Bottom Action & Context Bar ── */}
        <div className="relative z-20 arch-container flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
          <div className="text-stone font-mono text-[10px] tracking-wider">
            <span>SCROLL TO PROGRESS THROUGH PLAN · SPACE · EXPERIENCE</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => open()}
              className="arch-btn arch-btn--primary"
              data-interactive
              data-magnetic
            >
              BOOK 1:1 WALKTHROUGH <span className="arch-btn-arrow">→</span>
            </button>
            <Link
              to="/walkthrough"
              className="arch-btn arch-btn--outline"
              data-interactive
            >
              VIEW ALL MODES <span className="arch-btn-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PlanSpaceExperience;
