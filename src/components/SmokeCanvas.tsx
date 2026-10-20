import { useEffect, useRef } from "react";
import { FOCUS_X, FRAME_COUNT, PORTRAIT_SET, frames, type Drawable } from "@/lib/frames";

const size = (d: Drawable) =>
  d instanceof HTMLImageElement ? [d.naturalWidth, d.naturalHeight] : [d.width, d.height];

/**
 * Fixed, full-viewport canvas that plays the smoke sequence against scroll
 * position for the whole page. Adjacent frames are cross-faded so slow scrolls
 * stay fluid, and nothing is redrawn while the page is still.
 *
 * Phones: frames are decoded off the main thread a little ahead of the scroll
 * (see frames.focus), and the canvas renders at a lower pixel ratio — the smoke
 * is soft, so it looks the same and costs half the pixels per frame.
 */
export function SmokeCanvas() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    let target = 0;
    let current = 0;
    let drawn = -1;
    let dirty = true;
    let raf = 0;
    let maxScroll = 1;
    let focused = -1;
    const ease = PORTRAIT_SET ? 0.22 : 0.16;

    const resize = () => {
      // Phones render at CSS-pixel resolution: the smoke is soft and the screen upscales it
      // invisibly, while each frame costs a fraction of a full-resolution draw.
      const cap = PORTRAIT_SET ? 1 : 1.75;
      const dpr = Math.min(window.devicePixelRatio || 1, cap);
      // Size from the element (100lvh tall), not innerHeight, so a phone's address bar
      // sliding in and out never resizes or clears the canvas mid-scroll.
      const w = Math.round(canvas.clientWidth * dpr);
      const h = Math.round(canvas.clientHeight * dpr);
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = PORTRAIT_SET ? "low" : "high";
      dirty = true;
    };

    const draw = (img: Drawable, alpha: number) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const [iw, ih] = size(img);
      if (!iw || !ih) return;
      const s = Math.max(cw / iw, ch / ih);
      const w = iw * s;
      const h = ih * s;
      const x = Math.min(0, Math.max(cw - w, cw / 2 - w * FOCUS_X));
      const y = (ch - h) / 2;
      ctx.globalAlpha = alpha;
      ctx.drawImage(img, x, y, w, h);
    };

    const render = (f: number) => {
      const base = Math.floor(f);
      const frac = f - base;
      const a = frames.nearest(base);
      if (!a) return;
      draw(a, 1);
      // Blend in the next frame only when it can be seen: on phones, skip it while the page
      // is moving quickly (frames change faster than a blend could be noticed).
      const slow = !PORTRAIT_SET || Math.abs(target - f) < 0.6;
      if (slow && frac > 0.02 && base + 1 < FRAME_COUNT) {
        const b = frames.nearest(base + 1);
        if (b && b !== a) draw(b, frac);
      }
      ctx.globalAlpha = 1;
      drawn = f;
      dirty = false;
    };

    // Page height is measured only when it changes, never inside the scroll handler.
    const measure = () => {
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      readScroll();
    };
    const readScroll = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      target = p * (FRAME_COUNT - 1);
    };

    const loop = () => {
      const d = target - current;
      current = Math.abs(d) < 0.01 ? target : current + d * ease;
      const idx = Math.round(current);
      if (idx !== focused) {
        focused = idx;
        frames.focus(current);
      }
      if (dirty || Math.abs(current - drawn) > 0.01) render(current);
      raf = requestAnimationFrame(loop);
    };

    const offFrame = frames.onFrame((i) => {
      if (Math.abs(i - current) < 3 || drawn < 0) dirty = true;
    });

    const ro = new ResizeObserver(measure);
    ro.observe(document.body);

    resize();
    measure();
    current = target;
    frames.focus(current);
    const onResize = () => {
      resize();
      measure();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", readScroll, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      offFrame();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", readScroll);
    };
  }, []);

  return (
    <div className="smoke" aria-hidden="true">
      <canvas ref={ref} />
      <div className="smoke-veil" data-smoke-veil />
    </div>
  );
}
