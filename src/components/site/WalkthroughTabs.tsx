import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DURATION, EASE_ARCH_SMOOTH, DISTANCE } from "@/lib/motion";

import laserImg from "@/assets/walkthrough-studio.jpg";
import arImg from "@/assets/walkthrough-ar.jpg";
import vrImg from "@/assets/walkthrough-vr.jpg";
import furnitureImg from "@/assets/walkthrough-furniture.jpg";

const MODES = [
  {
    id: "laser",
    num: "01",
    label: "LASER",
    title: "Laser Projection",
    image: laserImg,
    badge: "1:1 LASER PROJECTION",
    annotation: "PROJECTION FIELD — TRUE SCALE",
    desc: "Commercial-grade laser projectors cast your exact floor plan onto the studio floor at true 1:1 scale — every wall, doorway and dimension exactly where it will sit on site.",
    detail: "The projection system is wireless and damage-free. Your floor plan, at real scale, on the floor.",
  },
  {
    id: "ar",
    num: "02",
    label: "AR",
    title: "Augmented Reality",
    image: arImg,
    badge: "AR SPATIAL OVERLAY",
    annotation: "TABLET 3D WIREFRAME & TEXTURES",
    desc: "iPad-based AR overlays finished walls, cabinets, fittings and materials onto the live studio floor — so you see both the scale and the look simultaneously.",
    detail: "Furniture, wall colours and materials composited over the real projection in real-time.",
  },
  {
    id: "vr",
    num: "03",
    label: "VR",
    title: "Virtual Reality",
    image: vrImg,
    badge: "1:1 VIRTUAL REALITY",
    annotation: "IMMERSIVE INTERIOR SIMULATION",
    desc: "Step inside a fully rendered, dimensionally accurate version of your future home — stand in the kitchen, look out the window, feel the ceiling height.",
    detail: "Rendered at 1:1 scale. Walk every room. Understand every space.",
  },
  {
    id: "furniture",
    num: "04",
    label: "FURNITURE",
    title: "Real Furniture",
    image: furnitureImg,
    badge: "REAL FURNITURE ON WHEELS",
    annotation: "CLEARANCE & SPATIAL CIRCULATION",
    desc: "Full-size, wheeled furniture — sofas, beds, kitchen counters, wardrobes — placed inside the projected outline so you understand true furniture scale and clearance.",
    detail: "On wheels. Move it yourself. Test every arrangement.",
  },
] as const;

export function WalkthroughTabs() {
  const [active, setActive] = useState<string>("laser");
  const mode = MODES.find((m) => m.id === active)!;

  return (
    <div>
      {/* Dynamic Image Box */}
      <div
        className="mb-8 relative overflow-hidden bg-deep arch-img-grade"
        style={{
          aspectRatio: "4/3",
          border: "1px solid var(--border)",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode.id}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              src={mode.image}
              alt={mode.title}
              className="w-full h-full object-cover object-center"
            />
            {/* Subtle bottom edge vignette for caption contrast */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(8,11,26,0.2) 0%, transparent 40%, rgba(8,11,26,0.65) 100%)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Blueprint SVG overlay */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none"
          viewBox="0 0 400 300"
          fill="none"
          aria-hidden="true"
        >
          <rect x="50" y="50" width="300" height="200" stroke="white" strokeWidth="0.8" />
          <line x1="50" y1="150" x2="200" y2="150" stroke="white" strokeWidth="0.4" />
          <line x1="200" y1="50" x2="200" y2="250" stroke="white" strokeWidth="0.4" />
          <circle cx="200" cy="150" r="60" stroke="rgba(138,134,252,0.8)" strokeWidth="0.6" strokeDasharray="4 3" fill="none" />
          <text x="200" y="155" textAnchor="middle" fill="rgba(138,134,252,0.9)" fontSize="7" fontFamily="Manrope" letterSpacing="2">1:1 SCALE</text>
        </svg>

        {/* Dynamic Architectural Badges */}
        <div
          className="absolute top-3 left-3 arch-label flex items-center gap-2 z-10"
          style={{
            color: "rgba(255,255,255,0.85)",
            background: "rgba(8,11,26,0.75)",
            padding: "3px 8px",
            backdropFilter: "blur(4px)",
          }}
        >
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo" />
          <span>{mode.badge}</span>
        </div>

        {/* Technical Coordinate & Scale Readout */}
        <div
          className="absolute top-3 right-3 arch-label hidden sm:block z-10"
          style={{
            color: "var(--indigo)",
            background: "rgba(8,11,26,0.75)",
            padding: "3px 8px",
            fontSize: "9px",
            letterSpacing: "0.15em",
            backdropFilter: "blur(4px)",
          }}
        >
          TOLERANCE: ±0.00m • 1:1 SCALE
        </div>

        <p
          className="absolute bottom-3 left-4 arch-label z-10"
          style={{ color: "rgba(255,255,255,0.65)", fontSize: "9px" }}
        >
          {mode.annotation}
        </p>

        {/* Technical Corner Registration Crosshairs */}
        <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-white/40 pointer-events-none z-20" />
        <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-white/40 pointer-events-none z-20" />
        <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-white/40 pointer-events-none z-20" />
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-white/40 pointer-events-none z-20" />
      </div>

      {/* Tab strip */}
      <div
        className="flex border-b"
        style={{ borderColor: "var(--border)" }}
        role="tablist"
        aria-label="Walkthrough modes"
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={active === m.id}
            aria-controls={`walkthrough-panel-${m.id}`}
            onClick={() => setActive(m.id)}
            className="flex-1 py-4 px-3 text-left transition-all"
            style={{
              borderBottom: active === m.id
                ? "2px solid var(--indigo)"
                : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            <span className="arch-label" style={{ color: active === m.id ? "var(--indigo)" : "var(--text-secondary)" }}>
              {m.num}
            </span>
            <span
              className="block font-sans font-500 mt-1"
              style={{
                fontSize: "0.82rem",
                color: active === m.id ? "var(--text-primary)" : "var(--text-secondary)",
                transition: "color 0.18s ease",
              }}
            >
              {m.label}
            </span>
          </button>
        ))}
      </div>

      {/* Content panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          id={`walkthrough-panel-${active}`}
          role="tabpanel"
          aria-label={mode.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pt-8"
        >
          <span className="arch-label arch-label--accent">{mode.num} / {mode.label}</span>
          <h3 className="font-display text-[clamp(1.6rem,3vw,2.4rem)] font-light mt-3 mb-4" style={{ color: "var(--text-primary)" }}>
            {mode.title}
          </h3>
          <p className="text-[0.97rem] leading-relaxed mb-3 max-w-[44ch]" style={{ color: "var(--text-secondary)" }}>
            {mode.desc}
          </p>
          <p className="text-[0.88rem] leading-relaxed max-w-[40ch]" style={{ color: "var(--text-muted)" }}>
            {mode.detail}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
