import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

export function CustomCursor() {
  const [hasPointer, setHasPointer] = useState(false);
  const [cursorState, setCursorState] = useState<"default" | "hover" | "view" | "enter" | "drag">("default");
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // High stiffness for extremely low latency trailing
  const springConfig = { damping: 25, stiffness: 400, mass: 0.15 };
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
      // Ignore simulated pointer events on touch screens
      if (e.pointerType === "touch") return;

      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const target = e.target as HTMLElement;
      if (!target) return;
      
      const cursorElement = target.closest('[data-cursor]');
      const clickableElement = target.closest('a, button, input, textarea, select, [role="button"], [data-interactive]');

      if (cursorElement) {
        const type = cursorElement.getAttribute('data-cursor');
        if (type === "view" || type === "enter" || type === "drag") {
          setCursorState(type as any);
        } else {
          setCursorState("hover");
        }
      } else if (clickableElement) {
        if (clickableElement.tagName === "INPUT" || clickableElement.tagName === "TEXTAREA") {
          setCursorState("default"); 
        } else {
          setCursorState("hover");
        }
      } else {
        setCursorState("default");
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

  const isText = cursorState === "view" || cursorState === "enter" || cursorState === "drag";

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference"
      style={{
        x: smoothX,
        y: smoothY,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <motion.div
        layout
        className="flex items-center justify-center overflow-hidden"
        initial={false}
        animate={{
          width: isText ? "auto" : cursorState === "hover" ? 36 : 6,
          height: isText ? 28 : cursorState === "hover" ? 36 : 6,
          borderRadius: 9999,
          backgroundColor: isText ? "rgba(255, 255, 255, 1)" : cursorState === "hover" ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 1)",
          border: cursorState === "hover" ? "1px solid rgba(255, 255, 255, 0.5)" : "0px solid transparent",
          padding: isText ? "0 14px" : "0",
        }}
        transition={{ type: "spring", stiffness: 450, damping: 30, mass: 0.3 }}
      >
        <AnimatePresence mode="wait">
          {isText && (
            <motion.span
              key={cursorState}
              initial={{ opacity: 0, scale: 0.5, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -5 }}
              transition={{ duration: 0.2 }}
              className="text-[0.65rem] font-bold tracking-widest text-black uppercase whitespace-nowrap pt-[2px]"
            >
              {cursorState}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
