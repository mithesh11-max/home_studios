import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

export type CursorMode = "default" | "hover" | "view" | "project" | "explore" | "drag";

export function CustomCursor() {
  const [hasPointer, setHasPointer] = useState(false);
  const [cursorMode, setCursorMode] = useState<CursorMode>("default");
  const [projectNum, setProjectNum] = useState<string>("01");

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Precision low-latency spring trailing
  const springConfig = { damping: 28, stiffness: 480, mass: 0.12 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    let styleEl: HTMLStyleElement | null = null;

    const checkPointer = () => {
      // Must be desktop width (>= 768px) and have a real mouse with fine hover pointer
      const isDesktop = window.innerWidth >= 768;
      const isFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
      const enabled = isDesktop && isFinePointer;
      setHasPointer(enabled);

      if (enabled && !styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "custom-cursor-style";
        styleEl.innerHTML = `
          body, a, button, input, textarea, select, [role="button"], [data-interactive], [data-cursor] {
            cursor: none !important;
          }
        `;
        document.head.appendChild(styleEl);
      } else if (!enabled && styleEl) {
        if (styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
        styleEl = null;
      }
    };

    checkPointer();

    const moveCursor = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;

      let targetX = e.clientX;
      let targetY = e.clientY;

      const target = e.target as HTMLElement;
      if (!target) return;

      const cursorElement = target.closest<HTMLElement>("[data-cursor]");
      const clickableElement = target.closest<HTMLElement>(
        'a, button, [role="button"], [data-interactive], [data-magnetic]'
      );

      // ── Subtle Magnetic Pull (4–6px max displacement) ──
      if (clickableElement) {
        const rect = clickableElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);

        // If cursor is close to element center, gently bias toward it
        if (dist < Math.max(rect.width, rect.height) * 0.75) {
          const maxDisplacement = 6;
          const pullStrength = 0.22;
          const dx = (centerX - e.clientX) * pullStrength;
          const dy = (centerY - e.clientY) * pullStrength;
          targetX += Math.max(-maxDisplacement, Math.min(maxDisplacement, dx));
          targetY += Math.max(-maxDisplacement, Math.min(maxDisplacement, dy));
        }
      }

      cursorX.set(targetX);
      cursorY.set(targetY);

      if (cursorElement) {
        const type = cursorElement.getAttribute("data-cursor");
        const pNum = cursorElement.getAttribute("data-project-num");
        if (pNum) setProjectNum(pNum);

        if (type === "view" || type === "project" || type === "explore" || type === "drag") {
          setCursorMode(type);
        } else {
          setCursorMode("hover");
        }
      } else if (clickableElement) {
        if (clickableElement.tagName === "INPUT" || clickableElement.tagName === "TEXTAREA") {
          setCursorMode("default");
        } else {
          setCursorMode("hover");
        }
      } else {
        setCursorMode("default");
      }
    };

    window.addEventListener("pointermove", moveCursor, { passive: true });
    window.addEventListener("resize", checkPointer, { passive: true });

    const mql = window.matchMedia("(pointer: fine) and (hover: hover)");
    mql.addEventListener("change", checkPointer);

    return () => {
      window.removeEventListener("pointermove", moveCursor);
      window.removeEventListener("resize", checkPointer);
      mql.removeEventListener("change", checkPointer);
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    };
  }, [cursorX, cursorY]);

  if (!hasPointer) return null;

  const isBadge = cursorMode === "view" || cursorMode === "project" || cursorMode === "explore" || cursorMode === "drag";

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] select-none"
      style={{
        x: smoothX,
        y: smoothY,
        translateX: "-50%",
        translateY: "-50%",
      }}
      aria-hidden="true"
    >
      <AnimatePresence mode="wait">
        {/* ── 1. Default Architectural Crosshair with Hairline Ticks ── */}
        {cursorMode === "default" && (
          <motion.div
            key="default"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="relative w-7 h-7 flex items-center justify-center"
          >
            {/* Center Core Dot */}
            <div className="w-1.5 h-1.5 bg-white shadow-[0_0_8px_rgba(138,134,252,0.8)]" />

            {/* Hairline 4-Way Axis Ticks */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-1.5 bg-indigo/75" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-1.5 bg-indigo/75" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-px bg-indigo/75" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-px bg-indigo/75" />
          </motion.div>
        )}

        {/* ── 2. Hover Reticle (Corner Brackets) ── */}
        {cursorMode === "hover" && (
          <motion.div
            key="hover"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-8 h-8 flex items-center justify-center"
          >
            {/* Center Dot */}
            <div className="w-1.5 h-1.5 bg-indigo" />

            {/* Corner Alignment Reticles */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-indigo" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-indigo" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-indigo" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-indigo" />
          </motion.div>
        )}

        {/* ── 3. Image Viewfinder Badge ("VIEW") ── */}
        {cursorMode === "view" && (
          <motion.div
            key="view"
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.75, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative px-3 py-1.5 bg-deep/95 border border-indigo/60 backdrop-blur-md shadow-2xl flex items-center gap-1.5"
          >
            <div className="w-1 h-1 bg-indigo" />
            <span className="font-mono text-[9px] tracking-[0.22em] text-white font-bold uppercase">
              VIEW
            </span>
            {/* Corner ticks */}
            <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-white/60" />
            <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-white/60" />
          </motion.div>
        )}

        {/* ── 4. Project Curated Badge ("01 / VIEW") ── */}
        {cursorMode === "project" && (
          <motion.div
            key="project"
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.75, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative px-3 py-1 bg-deep/95 border border-indigo/70 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center min-w-[56px]"
          >
            <span className="font-mono text-[8px] tracking-widest text-indigo font-semibold">
              {projectNum}
            </span>
            <span className="font-mono text-[9px] tracking-[0.2em] text-white font-bold uppercase">
              VIEW
            </span>
            {/* Corner ticks */}
            <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-indigo" />
            <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-indigo" />
          </motion.div>
        )}

        {/* ── 5. Spatial Exploration Badge ("EXPLORE") ── */}
        {cursorMode === "explore" && (
          <motion.div
            key="explore"
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.75, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative px-3 py-1.5 bg-deep/95 border border-white/35 backdrop-blur-md shadow-2xl flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="font-mono text-[9px] tracking-[0.2em] text-white font-bold uppercase">
              EXPLORE
            </span>
          </motion.div>
        )}

        {/* ── 6. Draggable Interaction Badge ("← DRAG →") ── */}
        {cursorMode === "drag" && (
          <motion.div
            key="drag"
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.75, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative px-3 py-1.5 bg-deep/95 border border-indigo/80 backdrop-blur-md shadow-2xl flex items-center gap-1.5"
          >
            <span className="text-indigo text-[10px] font-mono">←</span>
            <span className="font-mono text-[9px] tracking-[0.2em] text-white font-bold uppercase">
              DRAG
            </span>
            <span className="text-indigo text-[10px] font-mono">→</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CustomCursor;
