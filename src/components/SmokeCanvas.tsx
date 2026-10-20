import { useEffect, useRef } from "react";
import { FOCUS_X, FRAME_COUNT, FRAME_H, FRAME_W, PORTRAIT_SET, frames, type Drawable } from "@/lib/frames";

/**
 * Fixed, full-viewport canvas that plays the smoke sequence against scroll
 * position for the whole page. Adjacent frames are cross-faded so slow scrolls
 * stay fluid, and nothing is redrawn while the page is still.
 *
 * Phones: frames are decoded off the main thread a little ahead of the scroll, at
 * exactly the size they are drawn (see frames.setSize), and the canvas renders at a
 * lower pixel ratio — the smoke is soft, so it looks the same for far fewer pixels.
 *
 * The easing is measured in time, not frames, so it feels the same on 60, 90 and 120 Hz
 * screens, and the loop sleeps whenever there is nothing new to draw.
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
    let last = 0;
    let maxScroll = 1;
    let focused = -1;
    // Share of the remaining distance covered per 60 Hz frame.
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
      // Phones: have frames decoded at the size they cover the canvas at, so drawing is a
      // straight copy with no scaling.
      const cover = Math.max(w / FRAME_W, h / FRAME_H);
      frames.setSize(Math.round(FRAME_W * cover), Math.round(FRAME_H * cover));
      dirty = true;
      wake();
    };

    const draw = (img: Drawable, alpha: number) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
      const ih = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
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
      if (!a) return false;
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
      return true;
    };

    // Page height is measured only when it changes, never inside the scroll handler.
    const measure = () => {
      maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      readScroll();
    };
    const readScroll = () => {
      const p = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      target = p * (FRAME_COUNT - 1);
      wake();
    };

    const loop = (t: number) => {
      raf = 0;
      const dt = last ? Math.min(64, t - last) : 1000 / 60;
      last = t;
      const d = target - current;
      current = Math.abs(d) < 0.01 ? target : current + d * (1 - Math.pow(1 - ease, dt / (1000 / 60)));
      const idx = Math.round(current);
      if (idx !== focused) {
        focused = idx;
        frames.focus(current);
      }
      const drew = dirty || Math.abs(current - drawn) > 0.01 ? render(current) : true;
      // Keep going while the smoke is still catching up with the scroll; otherwise sleep
      // until the page scrolls or a needed frame arrives.
      if (current !== target || (dirty && drew)) raf = requestAnimationFrame(loop);
      else last = 0;
    };
    function wake() {
      if (!raf) raf = requestAnimationFrame(loop);
    }

    const offFrame = frames.onFrame((i) => {
      if (Math.abs(i - current) < 3 || drawn < 0) {
        dirty = true;
        wake();
      }
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
    wake();

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
