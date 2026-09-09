import { useRef, useState, useEffect, type KeyboardEvent } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { EASE_ARCH_HEAVY, EASE_ARCH_SMOOTH, DURATION } from "@/lib/motion";

export interface ProjectItem {
  id: string;
  num: string;
  indexLabel: string; // e.g. "01 / 06"
  title: string;
  category: string;
  description: string;
  image: string;
  to: string;
  params?: Record<string, string>;
  meta: {
    scale: string;
    location: string;
    tag: string;
  };
}

interface SpatialProjectCardProps {
  project: ProjectItem;
  index: number;
  isDimmed: boolean;
  isSelected: boolean;
  onSelect: (project: ProjectItem) => void;
}

export function SpatialProjectCard({
  project,
  index,
  isDimmed,
  isSelected,
  onSelect,
}: SpatialProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-10% 0px" });
  const prefersReducedMotion = useReducedMotion();

  // Pointer-driven inner image translation (strictly ±6px, no card rotation)
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const checkTouch = () => {
      setIsTouchDevice(!window.matchMedia("(pointer: fine)").matches || window.innerWidth < 768);
    };
    checkTouch();
    window.addEventListener("resize", checkTouch);
    return () => window.removeEventListener("resize", checkTouch);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || isTouchDevice) return;

    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1; // -1 to +1
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1; // -1 to +1

    // Subtle restrained optical shift (max 6px)
    setImgOffset({
      x: Math.round(nx * -6 * 10) / 10,
      y: Math.round(ny * -5 * 10) / 10,
    });
  };

  const handlePointerEnter = () => {
    if (!isTouchDevice) setIsHovered(true);
  };

  const handlePointerLeave = () => {
    if (!isTouchDevice) {
      setIsHovered(false);
      setImgOffset({ x: 0, y: 0 });
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(project);
    }
  };

  return (
    <motion.div
      ref={cardRef}
      role="link"
      tabIndex={0}
      aria-label={`${project.indexLabel}: ${project.title} — ${project.category}`}
      onClick={() => onSelect(project)}
      onKeyDown={handleKeyDown}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: isDimmed ? 0.35 : 1, y: 0 } : {}}
      transition={{
        duration: DURATION.SECTION,
        delay: index * 0.08,
        ease: EASE_ARCH_HEAVY,
      }}
      className="group relative block w-full text-left cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo/80 touch-manipulation active:scale-[0.99] transition-transform duration-150"
      data-interactive
      data-cursor="project"
      data-project-num={project.num}
    >
      {/* Rectilinear Architectural Shell (No card rotation or distortion) */}
      <div
        className="relative w-full aspect-[4/3] sm:aspect-[16/11] bg-[#0c1024] border border-white/12 overflow-hidden transition-all duration-400 ease-out"
        style={{
          borderColor: isHovered ? "rgba(138, 134, 252, 0.45)" : "rgba(255, 255, 255, 0.12)",
          boxShadow: isHovered
            ? "0 16px 36px -12px rgba(8, 11, 26, 0.8), 0 0 0 1px rgba(138, 134, 252, 0.2)"
            : "0 6px 20px -8px rgba(8, 11, 26, 0.5)",
        }}
      >
        {/* ── Layer 1: Recessed Image Window with Subtle ±6px Optical Shift ── */}
        <div
          className="absolute -inset-3 overflow-hidden pointer-events-none"
          style={{
            transform: prefersReducedMotion || isTouchDevice
              ? "none"
              : `translate3d(${imgOffset.x}px, ${imgOffset.y}px, 0) scale(1.06)`,
            transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <motion.img
            src={project.image}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-center"
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={inView ? { clipPath: "inset(0% 0% 0% 0%)" } : {}}
            transition={{
              duration: 1.0,
              delay: 0.1 + index * 0.08,
              ease: EASE_ARCH_HEAVY,
            }}
            style={{
              filter: isHovered
                ? "contrast(1.05) brightness(0.92) saturate(0.96)"
                : "contrast(1.02) brightness(0.82) saturate(0.88)",
              transition: "filter 0.4s ease-out",
            }}
          />
        </div>

        {/* Atmospheric Gradient for Monograph Readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(8, 11, 26, 0.45) 0%, rgba(8, 11, 26, 0.15) 42%, rgba(8, 11, 26, 0.90) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Architectural drafting grid overlay */}
        <div className="arch-grid-dark absolute inset-0 opacity-15 pointer-events-none" aria-hidden="true" />

        {/* ── Layer 2: Technical Datum Header (Index Stamp & Scale) ── */}
        <div className="absolute top-0 inset-x-0 p-4 sm:p-5 flex justify-between items-start pointer-events-none z-10">
          {/* Index Stamp: 01 / 06 */}
          <div
            className="flex items-center gap-2 px-2.5 py-1 bg-deep/90 border border-white/15 transition-colors duration-300"
            style={{
              borderColor: isHovered ? "rgba(138, 134, 252, 0.4)" : "rgba(255, 255, 255, 0.15)",
            }}
          >
            <span
              className="font-mono text-[10px] tracking-widest font-semibold transition-colors duration-300"
              style={{ color: isHovered ? "var(--indigo)" : "#FFFFFF" }}
            >
              {project.indexLabel}
            </span>
            <span className="w-1.5 h-px bg-white/20" />
            <span className="font-mono text-[9px] tracking-wider text-white/70 uppercase">
              {project.meta.scale}
            </span>
          </div>

          {/* Category Tag Badge */}
          <span
            className="px-2.5 py-1 font-mono text-[9px] tracking-widest uppercase transition-all duration-300"
            style={{
              backgroundColor: isHovered ? "var(--indigo)" : "rgba(8, 11, 26, 0.85)",
              color: isHovered ? "var(--bg-deep)" : "rgba(255, 255, 255, 0.85)",
              border: isHovered ? "1px solid var(--indigo)" : "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            {project.category}
          </span>
        </div>

        {/* ── Layer 3: Monograph Title & Description Plane ── */}
        <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 flex flex-col justify-end pointer-events-none z-10">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p
                className="font-mono text-[9px] tracking-widest uppercase mb-1.5 transition-colors duration-300"
                style={{ color: isHovered ? "var(--indigo)" : "rgba(255, 255, 255, 0.55)" }}
              >
                {project.meta.location}
              </p>

              {/* Title with smooth architectural color & +4px horizontal slide */}
              <h3
                className="font-display text-white text-[clamp(1.35rem,2.5vw,1.75rem)] font-light leading-tight transition-all duration-300"
                style={{
                  color: isHovered ? "var(--indigo)" : "#FFFFFF",
                  transform: isHovered && !prefersReducedMotion ? "translateX(4px)" : "translateX(0px)",
                }}
              >
                {project.title}
              </h3>

              <p className="mt-2 text-white/70 text-[0.84rem] sm:text-[0.88rem] leading-relaxed line-clamp-2 max-w-[42ch]">
                {project.description}
              </p>
            </div>

            {/* Architectural Arrow Indicator Box */}
            <div
              className="flex-shrink-0 w-9 h-9 border border-white/20 flex items-center justify-center transition-all duration-300"
              style={{
                backgroundColor: isHovered ? "var(--indigo)" : "rgba(8, 11, 26, 0.75)",
                borderColor: isHovered ? "var(--indigo)" : "rgba(255, 255, 255, 0.2)",
                transform: isHovered && !prefersReducedMotion ? "translate(3px, -3px)" : "translate(0, 0)",
              }}
            >
              <svg
                className="w-4 h-4 transition-colors duration-300"
                style={{ color: isHovered ? "var(--bg-deep)" : "#FFFFFF" }}
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 10h12M11 5l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Architectural Corner Alignment Reticles */}
        <div
          className="absolute top-2 left-2 w-2 h-2 border-t border-l pointer-events-none transition-colors duration-300"
          style={{ borderColor: isHovered ? "var(--indigo)" : "rgba(255, 255, 255, 0.25)" }}
        />
        <div
          className="absolute top-2 right-2 w-2 h-2 border-t border-r pointer-events-none transition-colors duration-300"
          style={{ borderColor: isHovered ? "var(--indigo)" : "rgba(255, 255, 255, 0.25)" }}
        />
        <div
          className="absolute bottom-2 left-2 w-2 h-2 border-b border-l pointer-events-none transition-colors duration-300"
          style={{ borderColor: isHovered ? "var(--indigo)" : "rgba(255, 255, 255, 0.25)" }}
        />
        <div
          className="absolute bottom-2 right-2 w-2 h-2 border-b border-r pointer-events-none transition-colors duration-300"
          style={{ borderColor: isHovered ? "var(--indigo)" : "rgba(255, 255, 255, 0.25)" }}
        />

        {/* Selection Expansion Mask */}
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: EASE_ARCH_SMOOTH }}
            className="absolute inset-0 bg-deep/92 z-30 flex items-center justify-center pointer-events-none"
          >
            <span className="font-mono text-[10px] tracking-widest text-indigo uppercase">
              ENTERING SPACE →
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default SpatialProjectCard;
