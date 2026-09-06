import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAppointment } from "@/lib/appointment-context";

export interface Phase {
  num: string;
  label: string;
  startFrame: number;
  endFrame: number;
}

export const PHASES: Phase[] = [
  { num: "01", label: "ARRIVAL",   startFrame: 1,   endFrame: 30  },
  { num: "02", label: "THRESHOLD", startFrame: 30,  endFrame: 60  },
  { num: "03", label: "THE SPACE", startFrame: 60,  endFrame: 110 },
  { num: "04", label: "LIVING",    startFrame: 110, endFrame: 160 },
  { num: "05", label: "INTERIOR",  startFrame: 160, endFrame: 210 },
  { num: "06", label: "LIGHT",     startFrame: 210, endFrame: 250 },
  { num: "07", label: "HOME",      startFrame: 250, endFrame: 300 },
];

export function getActivePhase(frame: number): number {
  for (let i = PHASES.length - 1; i >= 0; i--) {
    if (frame >= PHASES[i].startFrame) return i;
  }
  return 0;
}

interface PhaseIndicatorProps {
  /** Active phase index (0 to 6) — only updates when crossing phase boundaries */
  activePhaseIndex: number;
  /** Scroll container element ref — used to compute scroll offset for click-to-scroll */
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  /** Total scroll height of the sequence container in vh units (default 500) */
  scrollVh?: number;
}

export function PhaseIndicator({
  activePhaseIndex,
  scrollContainerRef,
  scrollVh = 500,
}: PhaseIndicatorProps) {
  const { open } = useAppointment();
  const progressBarRef = useRef<HTMLDivElement>(null);

  // High-performance scroll tracking directly on the progress line DOM node
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const container = scrollContainerRef.current;
          if (container && progressBarRef.current) {
            const rect = container.getBoundingClientRect();
            const total = container.offsetHeight - window.innerHeight;
            if (total > 0) {
              const scrolled = Math.max(0, -rect.top);
              const progress = Math.max(0, Math.min(1, scrolled / total));
              progressBarRef.current.style.transform = `scaleY(${progress})`;
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
  }, [scrollContainerRef]);

  const scrollToPhase = (phaseIndex: number) => {
    const phase = PHASES[phaseIndex];
    const frameNorm = (phase.startFrame - 1) / 299;
    const container = scrollContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const containerTop = rect.top + window.scrollY;
    const containerHeight = (scrollVh / 100) * window.innerHeight;
    const targetY = containerTop + frameNorm * (containerHeight - window.innerHeight);
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  return (
    <div
      className="fixed right-0 top-0 h-full z-40 hidden lg:flex flex-col items-end justify-center pr-8 gap-0 pointer-events-none"
      aria-label="Sequence phase navigation"
      role="navigation"
    >
      {/* Vertical progress line */}
      <div
        className="absolute right-4 top-[20%] bottom-[20%] w-px overflow-hidden"
        style={{ background: "var(--border)" }}
        aria-hidden="true"
      >
        <div
          ref={progressBarRef}
          className="absolute top-0 left-0 w-full h-full origin-top will-change-transform"
          style={{ transform: "scaleY(0)", background: "var(--indigo)" }}
        />
      </div>

      {/* Phase list */}
      <ul className="flex flex-col gap-3 pointer-events-auto" role="list">
        {PHASES.map((phase, i) => {
          const isActive = i === activePhaseIndex;
          return (
            <li key={phase.num} role="listitem">
              <button
                onClick={() => scrollToPhase(i)}
                className="flex items-center gap-3 group focus-visible:outline focus-visible:outline-1"
                style={{ outlineColor: "var(--indigo)" }}
                aria-label={`Go to phase ${phase.num}: ${phase.label}`}
                aria-current={isActive ? "step" : undefined}
                data-interactive
              >
                {/* Active indigo rule */}
                {isActive ? (
                  <motion.div
                    layoutId="phase-rule"
                    className="h-px w-6"
                    style={{ background: "var(--indigo)" }}
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                ) : (
                  <div className="h-px w-6 opacity-0" aria-hidden="true" />
                )}

                <span
                  className="flex items-center gap-1.5 transition-colors duration-200"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "0.72rem",
                    letterSpacing: "0.1em",
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                  }}
                >
                  <span style={{ color: isActive ? "var(--indigo)" : "inherit" }}>
                    {phase.num}
                  </span>
                  <span>{phase.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Appointment CTA at bottom */}
      <button
        onClick={() => open()}
        className="pointer-events-auto mt-8"
        data-interactive
        aria-label="Book your appointment"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "9px",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 600,
          color: "var(--indigo)",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
        }}
      >
        BOOK A SLOT →
      </button>
    </div>
  );
}
