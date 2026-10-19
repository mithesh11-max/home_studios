import { useEffect, useRef } from "react";
import { FRAME_COUNT, frames } from "@/lib/frames";

/**
 * Fixed, full-viewport canvas that plays the smoke sequence against scroll
 * position for the whole page. Adjacent frames are cross-faded so slow scrolls
 * stay fluid, and nothing is redrawn while the page is still.
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

    // Focal point: the smoke lives right of centre, so keep it in frame on tall screens.
    const FOCUS_X = 0.6;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      dirty = true;
    };

    const draw = (img: HTMLImageElement, alpha: number) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
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
      if (frac > 0.02 && base + 1 < FRAME_COUNT) {
        const b = frames.nearest(base + 1);
        if (b && b !== a) draw(b, frac);
      }
      ctx.globalAlpha = 1;
      drawn = f;
      dirty = false;
    };

    const readScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      target = p * (FRAME_COUNT - 1);
    };

    const loop = () => {
      const d = target - current;
      current = Math.abs(d) < 0.01 ? target : current + d * 0.16;
      if (dirty || Math.abs(current - drawn) > 0.01) render(current);
      raf = requestAnimationFrame(loop);
    };

    const offFrame = frames.onFrame((i) => {
      if (Math.abs(i - current) < 3 || drawn < 0) dirty = true;
    });

    resize();
    readScroll();
    current = target;
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", readScroll, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      offFrame();
      window.removeEventListener("resize", resize);
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
