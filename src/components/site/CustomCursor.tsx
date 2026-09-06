import { useEffect, useRef } from "react";

/**
 * Custom cursor — desktop (pointer: fine) only.
 * Tracks mouse position, scales up over data-interactive elements.
 * Hides over input/textarea/select to not obscure text insertion.
 * Removed entirely via CSS on touch/coarse-pointer and reduced-motion.
 */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = cursorRef.current;
    if (!el) return;

    // Only activate on fine-pointer (mouse) devices
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };

    const tick = () => {
      if (el) {
        el.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const onEnterInteractive = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!el) return;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
      ) {
        el.style.opacity = "0";
        return;
      }
      el.classList.add("hs-cursor--large");
      el.style.opacity = "";
    };

    const onLeaveInteractive = () => {
      el?.classList.remove("hs-cursor--large");
      el && (el.style.opacity = "");
    };

    const onEnterField = () => {
      if (el) el.style.opacity = "0";
    };
    const onLeaveField = () => {
      if (el) el.style.opacity = "";
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseenter", () => el?.classList.add("hs-cursor--visible"), true);

    // Delegate to all interactive elements
    const interactiveSelector = "a, button, [data-interactive], [role='button']";
    document.querySelectorAll(interactiveSelector).forEach((el) => {
      el.addEventListener("mouseenter", onEnterInteractive);
      el.addEventListener("mouseleave", onLeaveInteractive);
    });

    // Observe DOM for dynamically added interactive elements
    const observer = new MutationObserver(() => {
      document.querySelectorAll(interactiveSelector).forEach((node) => {
        node.removeEventListener("mouseenter", onEnterInteractive);
        node.removeEventListener("mouseleave", onLeaveInteractive);
        node.addEventListener("mouseenter", onEnterInteractive);
        node.addEventListener("mouseleave", onLeaveInteractive);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Field hides cursor
    document.querySelectorAll("input, textarea, select").forEach((f) => {
      f.addEventListener("mouseenter", onEnterField);
      f.addEventListener("mouseleave", onLeaveField);
    });

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", onMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      id="hs-cursor"
      aria-hidden="true"
    />
  );
}
