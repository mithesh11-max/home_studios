/**
 * TileGridBackground — 3D Isometric Tile Grid Ripple Animation
 *
 * Direct, 1:1 port of the Tile Grid Ripple HTML prototype:
 * - 3D isometric perspective projection with eased vanishing point following the cursor
 * - Pointer move drops interactive ripple trail points
 * - Pointer click fires a high-velocity shockwave burst
 * - Idle drops periodic ambient raindrop ripples
 * - Shaded 3D extruded side walls on lifted tiles
 * - Indigo edge glow (#8A86FC) over deep midnight background (#080B1A)
 * - Pure 2D Canvas at 60fps with clamped DPR (1.5)
 * - Auto-pauses on background tab and respects prefers-reduced-motion
 */

import { useEffect, useRef } from "react";

const cfg = {
  tile: 30,
  gap: 8,
  lift: 38,
  persp: 1200,
  tilt: 1,
  speed: 0.5,
  freq: 12,
  width: 0.08,
  fade: 0.6,
  amp: 1,
  idle: 0,
  click: 2.6,
  boost: 1.6,
  color: [138, 134, 252] as [number, number, number],
  bg: [8, 11, 26] as [number, number, number],
};

const MAX = 24;
const SPACING = 16;

interface TrailPoint {
  x: number;
  y: number;
  age: number;
  strength: number;
  burst?: boolean;
}

interface PreparedRipple {
  x: number;
  y: number;
  waveDist: number;
  fadeStrength: number;
  maxRadiusPx: number;
  maxRadiusPxSq: number;
  minRadiusPxSq: number;
}

export function TileGridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const rawCanvas = canvasRef.current;
    if (!rawCanvas) return;

    const rawCtx = rawCanvas.getContext("2d");
    if (!rawCtx) return;

    const canvas: HTMLCanvasElement = rawCanvas;
    const ctx: CanvasRenderingContext2D = rawCtx;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let rafId = 0;
    let isRunning = false;

    const trail: TrailPoint[] = [];
    let last: { x: number; y: number } | null = null;
    let sinceMove = 99;
    let idleT = 0;
    let vx = 0.5;
    let vy = 0.5;
    let tvx = 0.5;
    let tvy = 0.5;
    let lastT = performance.now();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resize, { passive: true });
    resize();

    /* ---- ripple trail listeners ---- */
    function onPointerMove(e: PointerEvent) {
      // On touch devices, prevent touch scrolling from triggering continuous canvas recalculations
      if (reducedMotion || e.pointerType === "touch") return;
      const x = e.clientX;
      const y = e.clientY;
      tvx = x / Math.max(w, 1);
      tvy = y / Math.max(h, 1);

      let d = 999;
      if (last) d = Math.hypot(x - last.x, y - last.y);
      if (d >= SPACING) {
        if (trail.length >= MAX) trail.shift();
        trail.push({
          x,
          y,
          age: 0,
          strength: Math.min(Math.max(d / 40, 0.3), 1.2),
        });
        last = { x, y };
      }
      sinceMove = 0;
      idleT = 0;
      startLoop();
    }

    function onPointerDown(e: PointerEvent) {
      if (reducedMotion || cfg.click <= 0) return;
      const x = e.clientX;
      const y = e.clientY;
      if (trail.length >= MAX) trail.shift();
      trail.push({
        x,
        y,
        age: 0,
        strength: cfg.click,
        burst: true,
      });
      last = { x, y };
      sinceMove = 0;
      idleT = 0;
      startLoop();
    }

    function onPointerLeave() {
      tvx = 0.5;
      tvy = 0.5;
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave, { passive: true });

    function proj(
      x: number,
      y: number,
      z: number,
      pvx: number,
      pvy: number
    ): [number, number] {
      const s = cfg.persp / Math.max(cfg.persp - z, 1);
      return [pvx + (x - pvx) * s, pvy + (y - pvy) * s];
    }

    /* ---- animation frame loop ---- */
    function frame(now: number) {
      if (!isRunning) return;

      const dt = Math.min((now - lastT) / 1000, 1 / 20);
      lastT = now;

      // Age & expire trail
      const expiry = cfg.fade * 4;
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].age += dt;
        if (trail[i].age > expiry) trail.splice(i, 1);
      }

      // Prepare active ripple data once per frame (NOT per tile!)
      const invH = 1 / Math.max(h, 1);
      const invWidthSq = 1 / (cfg.width * cfg.width);
      const activeRipples: PreparedRipple[] = [];

      let minX = w;
      let maxX = 0;
      let minY = h;
      let maxY = 0;

      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        const fade = Math.exp(-t.age / cfg.fade);
        if (fade < 0.008) continue; // Decayed beyond visibility

        const speed = t.burst ? cfg.speed * cfg.boost : cfg.speed;
        const waveDist = speed * t.age;
        const fadeStrength = fade * t.strength;

        // Wave packet envelope is exp(-rel^2 / width^2).
        // win < 0.001 when |rel| > 0.22
        const maxDistNorm = waveDist + 0.22;
        const minDistNorm = Math.max(0, waveDist - 0.22);
        const maxRadiusPx = maxDistNorm * h;
        const minRadiusPx = minDistNorm * h;

        activeRipples.push({
          x: t.x,
          y: t.y,
          waveDist,
          fadeStrength,
          maxRadiusPx,
          maxRadiusPxSq: maxRadiusPx * maxRadiusPx,
          minRadiusPxSq: minRadiusPx * minRadiusPx,
        });

        if (t.x - maxRadiusPx < minX) minX = t.x - maxRadiusPx;
        if (t.x + maxRadiusPx > maxX) maxX = t.x + maxRadiusPx;
        if (t.y - maxRadiusPx < minY) minY = t.y - maxRadiusPx;
        if (t.y + maxRadiusPx > maxY) maxY = t.y + maxRadiusPx;
      }

      // Sleep and clear when no mouse ripples are active
      if (activeRipples.length === 0) {
        ctx.clearRect(0, 0, w, h);
        stopLoop();
        return;
      }

      // Ease vanishing point
      const e = 1 - Math.exp(-dt * 4);
      vx += (tvx - vx) * e;
      vy += (tvy - vy) * e;
      const pvx = (0.5 + (vx - 0.5) * cfg.tilt) * w;
      const pvy = (0.5 + (vy - 0.5) * cfg.tilt) * h;

      ctx.clearRect(0, 0, w, h);

      const T = cfg.tile;
      const hs = T / 2 - cfg.gap / 2;
      const cols = Math.ceil(w / T) + 1;
      const rows = Math.ceil(h / T) + 1;

      // Spatial bounding box: only iterate tiles within active ripple zone
      const colStart = Math.max(-1, Math.floor(minX / T));
      const colEnd = Math.min(cols, Math.ceil(maxX / T));
      const rowStart = Math.max(-1, Math.floor(minY / T));
      const rowEnd = Math.min(rows, Math.ceil(maxY / T));

      function liftAt(px: number, py: number): number {
        let sum = 0;
        let tot = 0;
        for (let k = 0; k < activeRipples.length; k++) {
          const r = activeRipples[k];
          const dx = px - r.x;
          const dy = py - r.y;
          const dsq = dx * dx + dy * dy;

          // Rapid outer and inner circle rejection (no sqrt, no exp!)
          if (dsq > r.maxRadiusPxSq || dsq < r.minRadiusPxSq) continue;

          const dist = Math.sqrt(dsq) * invH;
          const rel = dist - r.waveDist;
          if (rel > 0.22 || rel < -0.22) continue;

          const win = Math.exp(-(rel * rel) * invWidthSq);
          if (win < 0.001) continue;

          const atten = 1 / (1 + dist * 3);
          const wgt = r.fadeStrength * win * atten;
          sum += wgt * Math.cos(cfg.freq * rel);
          tot += wgt;
        }
        if (tot <= 0) return 0;
        return Math.max(0, Math.min(1, (sum / Math.max(tot, 1)) * cfg.amp));
      }

      const tiles: [number, number, number][] = [];
      for (let j = rowStart; j <= rowEnd; j++) {
        for (let i = colStart; i <= colEnd; i++) {
          const x = i * T;
          const y = j * T;
          const l = liftAt(x + T / 2, y + T / 2);
          if (l > 0.005) {
            tiles.push([l, x, y]);
          }
        }
      }

      // If no tiles are lifted, clear and continue loop
      if (tiles.length === 0) {
        rafId = requestAnimationFrame(frame);
        return;
      }

      tiles.sort((a, b) => a[0] - b[0]);

      const [cr, cg, cb] = cfg.color;
      const [br, bg_, bb] = cfg.bg;

      for (let i = 0; i < tiles.length; i++) {
        const [l, x, y] = tiles[i];
        const z = l * cfg.lift;
        const cx = x + T / 2;
        const cy = y + T / 2;
        const corners: [number, number][] = [
          [cx - hs, cy - hs],
          [cx + hs, cy - hs],
          [cx + hs, cy + hs],
          [cx - hs, cy + hs],
        ];
        const top = z > 0.1
          ? corners.map(([px, py]) => proj(px, py, z, pvx, pvy))
          : corners;

        // 3D side walls with soft alpha
        if (z > 0.5) {
          const base = corners.map(([px, py]) => proj(px, py, 0, pvx, pvy));
          for (let k = 0; k < 4; k++) {
            const k2 = (k + 1) % 4;
            const sh = 0.30 + 0.22 * (k / 3);
            const wallAlpha = Math.min(0.9, l * 1.6);
            ctx.fillStyle = `rgba(${(cr * sh) | 0},${(cg * sh) | 0},${(cb * sh) | 0},${wallAlpha})`;
            ctx.beginPath();
            ctx.moveTo(base[k][0], base[k][1]);
            ctx.lineTo(base[k2][0], base[k2][1]);
            ctx.lineTo(top[k2][0], top[k2][1]);
            ctx.lineTo(top[k][0], top[k][1]);
            ctx.closePath();
            ctx.fill();
          }
        }

        // Top face fill — fades in and out with ripple wave
        const a = 0.14 + l * 0.86;
        const topAlpha = Math.min(0.85, l * 1.4);
        ctx.fillStyle = `rgba(${(br + (cr - br) * a) | 0},${(bg_ + (cg - bg_) * a) | 0},${(bb + (cb - bb) * a) | 0},${topAlpha})`;
        ctx.beginPath();
        ctx.moveTo(top[0][0], top[0][1]);
        for (let k = 1; k < 4; k++) ctx.lineTo(top[k][0], top[k][1]);
        ctx.closePath();
        ctx.fill();

        // Outline — glowing electric indigo fading with ripple amplitude
        const strokeAlpha = Math.min(1, l * 1.8);
        ctx.strokeStyle = `rgba(${cr},${cg},${cb},${strokeAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      rafId = requestAnimationFrame(frame);
    }

    function startLoop() {
      if (isRunning) return;
      isRunning = true;
      lastT = performance.now();
      if (reducedMotion) {
        frame(performance.now());
        isRunning = false;
      } else {
        rafId = requestAnimationFrame(frame);
      }
    }

    function stopLoop() {
      isRunning = false;
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    startLoop();

    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
      if (reducedMotion) {
        stopLoop();
      } else {
        startLoop();
      }
    };
    motionQuery.addEventListener("change", onMotionChange);

    const onVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopLoop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerleave", onPointerLeave);
      motionQuery.removeEventListener("change", onMotionChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="tile-grid-bg"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        opacity: 0.35,
        pointerEvents: "none",
        zIndex: 0,
        transform: "translate3d(0, 0, 0)",
        willChange: "transform",
        contain: "strict",
      }}
    />
  );
}

export default TileGridBackground;
