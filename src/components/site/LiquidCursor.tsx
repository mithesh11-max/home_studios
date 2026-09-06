/**
 * LiquidCursor — Gooey metaball trail cursor
 *
 * Physics & rendering specifications:
 * - 14 nodes, constant geometry: head radius 30px, gentle taper r = 30 * (1 - i/14 * 0.55)
 * - Zero velocity scaling: no stretch, no squash, no velocity response
 * - Distance constraint (rope clamp): maxGap = (r[i-1] + r[i]) * 0.55 guarantees constant overlap
 * - Pointer sub-stepping: for fast movement (> 40px delta), up to 6 sub-steps per frame
 * - Uniform higher easing: ease = 0.24 - i * 0.004 (clamped >= 0.15)
 * - Strengthened SVG goo filter: stdDeviation=14, feColorMatrix alpha row: 20 -10
 * - Mounts only on (hover: hover) && (pointer: fine) — zero mount on touch
 * - prefers-reduced-motion fallback to StaticDot
 */

import { useEffect, useRef } from "react";

const NODE_COUNT = 14;
const MAX_RADIUS = 30;

// Gentle taper: tail stays ~45% of head instead of shrinking to nothing
function nodeRadius(i: number) {
  return MAX_RADIUS * (1 - (i / NODE_COUNT) * 0.55);
}

const BASE_RADII = Array.from({ length: NODE_COUNT }, (_, i) => nodeRadius(i));

// Uniform, higher easing: stays well above 0.15 across all 14 nodes
function nodeEase(i: number) {
  return Math.max(0.15, 0.24 - i * 0.004);
}

const NODE_EASE = Array.from({ length: NODE_COUNT }, (_, i) => nodeEase(i));

// SVG filter constants — heavy blur then high-contrast alpha-crush
const BLUR_STD = 14;
const ALPHA_MATRIX = "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10";

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

// ─── Static dot (reduced-motion fallback) ────────────────────────────────────
function StaticDot() {
  const ref = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    document.documentElement.style.cursor = "none";

    const onMove = (e: PointerEvent) => {
      el.setAttribute("cx", String(e.clientX));
      el.setAttribute("cy", String(e.clientY));
    };

    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.style.removeProperty("cursor");
    };
  }, []);

  return (
    <svg
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "visible",
      }}
    >
      <circle
        ref={ref}
        r={7}
        fill="#8A86FC"
        opacity={0.85}
      />
    </svg>
  );
}

// ─── Full gooey blob cursor ───────────────────────────────────────────────────
function LiquidBlob() {
  const svgRef = useRef<SVGSVGElement>(null);
  const circleRefs = useRef<SVGCircleElement[]>([]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Node state — plain numbers, zero React overhead
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }));

    const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const prevPointer = { x: pointer.x, y: pointer.y };

    let rafId = 0;
    let paused = false;
    let outside = false;
    let hasEntered = false;

    let opTarget = 0.85;
    let opCurrent = 0;
    let blendMode = "screen";

    // ── Update chase chain with rope distance clamping ──────────────────────
    const updateChain = (ix: number, iy: number) => {
      // Head node lerps toward target position
      nodes[0].x += (ix - nodes[0].x) * NODE_EASE[0];
      nodes[0].y += (iy - nodes[0].y) * NODE_EASE[0];

      // Each following node lerps toward preceding node, then distance is clamped
      for (let i = 1; i < NODE_COUNT; i++) {
        const ease = NODE_EASE[i];
        nodes[i].x += (nodes[i - 1].x - nodes[i].x) * ease;
        nodes[i].y += (nodes[i - 1].y - nodes[i].y) * ease;

        // Hard distance constraint: circles must overlap to merge cleanly
        const maxGap = (BASE_RADII[i - 1] + BASE_RADII[i]) * 0.55;
        const dx = nodes[i].x - nodes[i - 1].x;
        const dy = nodes[i].y - nodes[i - 1].y;
        const dist = Math.hypot(dx, dy);

        if (dist > maxGap && dist > 0) {
          const k = maxGap / dist;
          nodes[i].x = nodes[i - 1].x + dx * k;
          nodes[i].y = nodes[i - 1].y + dy * k;
        }
      }
    };

    // ── Pointer events ──────────────────────────────────────────────────────
    const onMove = (e: PointerEvent) => {
      if (!hasEntered) {
        // Snap immediately to entry point to prevent teleport snap across screen
        for (let i = 0; i < NODE_COUNT; i++) {
          nodes[i].x = e.clientX;
          nodes[i].y = e.clientY;
        }
        prevPointer.x = e.clientX;
        prevPointer.y = e.clientY;
        hasEntered = true;
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      outside = false;
      if (opTarget === 0) opTarget = 0.85;
    };

    const onEnter = (e: PointerEvent) => {
      outside = false;
      opTarget = 0.85;
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes[i].x = e.clientX;
        nodes[i].y = e.clientY;
      }
      prevPointer.x = e.clientX;
      prevPointer.y = e.clientY;
      hasEntered = true;
    };

    const onLeave = () => {
      outside = true;
      hasEntered = false;
    };

    const onOver = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (!t) return;

      // Hide custom cursor over text inputs
      if (
        t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        t.tagName === "SELECT" ||
        t.hasAttribute("data-native-cursor") ||
        getComputedStyle(t).cursor === "text"
      ) {
        opTarget = 0;
        return;
      }

      opTarget = 0.85;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerenter", onEnter, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });

    document.documentElement.style.cursor = "none";

    const onVis = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    // ── rAF loop ─────────────────────────────────────────────────────────────
    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (paused) return;

      // Sub-step pointer on fast movement (> 40px displacement)
      const pDx = pointer.x - prevPointer.x;
      const pDy = pointer.y - prevPointer.y;
      const pointerDelta = Math.hypot(pDx, pDy);

      // Cap at 6 sub-steps so frame budget is strictly bounded
      const steps = pointerDelta > 0 ? Math.min(Math.max(1, Math.ceil(pointerDelta / 40)), 6) : 1;

      for (let s = 0; s < steps; s++) {
        const t = (s + 1) / steps;
        const ix = prevPointer.x + pDx * t;
        const iy = prevPointer.y + pDy * t;
        updateChain(ix, iy);
      }

      prevPointer.x = pointer.x;
      prevPointer.y = pointer.y;

      // Smooth opacity transition
      const opGoal = outside ? 0 : opTarget;
      opCurrent += (opGoal - opCurrent) * 0.16;

      // Direct DOM writes — 14 circle coordinates updated once per frame
      const circles = circleRefs.current;
      for (let i = 0; i < NODE_COUNT; i++) {
        const c = circles[i];
        if (!c) continue;
        c.setAttribute("cx", String(nodes[i].x));
        c.setAttribute("cy", String(nodes[i].y));
      }

      svg.style.opacity = String(clamp(opCurrent, 0, 1));
      svg.style.mixBlendMode = blendMode as string;
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("visibilitychange", onVis);
      document.documentElement.style.removeProperty("cursor");
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 9999,
        overflow: "visible",
        opacity: 0,
        willChange: "opacity",
      }}
    >
      <defs>
        <filter
          id="hs-goo"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation={BLUR_STD} result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values={ALPHA_MATRIX}
            result="goo"
          />
        </filter>
      </defs>

      <g filter="url(#hs-goo)" fill="#8A86FC">
        {Array.from({ length: NODE_COUNT }, (_, i) => (
          <circle
            key={i}
            ref={(el) => {
              if (el) circleRefs.current[i] = el;
            }}
            cx={-9999}
            cy={-9999}
            r={BASE_RADII[i]}
          />
        ))}
      </g>
    </svg>
  );
}

// ─── Public export ────────────────────────────────────────────────────────────
/**
 * Mount once at app root inside MotionConfig.
 * Self-guards against touch devices and SSR.
 */
export function LiquidCursor() {
  if (typeof window === "undefined") return null;

  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!canHover) return null;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return reducedMotion ? <StaticDot /> : <LiquidBlob />;
}
