// Progressive frame loader for the smoke sequence.
// Frames are requested coarse-to-fine (every 25th, then 12th, 6th, 3rd, 1st),
// so the full scroll range is usable almost immediately and fills in with detail.
//
// Desktop: each frame is an <img>, decoded once as it arrives.
// Phones:  every frame is downloaded as compressed bytes (about 2 MB in all), but only the
//          frames around the current scroll position are decoded, off the main thread,
//          with createImageBitmap. Drawing a ready bitmap costs almost nothing, so scrolling
//          never waits on a decode, and memory stays flat (about 30 frames at a time).

// Phones in portrait get their own sequence, composed vertically for a tall screen
// (720×1280, every other frame of the 1080×1920 portrait render).
export const PORTRAIT_SET =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 760px) and (orientation: portrait)").matches;
export const FRAME_COUNT = PORTRAIT_SET ? 250 : 500;
const CONCURRENCY = 6;
/** Horizontal point of the frame kept in the centre of the screen. */
export const FOCUS_X = PORTRAIT_SET ? 0.5 : 0.6;

const frameUrl = (i: number) =>
  `${import.meta.env.BASE_URL}${PORTRAIT_SET ? "frames-m" : "frames"}/${String(i + 1).padStart(4, "0")}.webp`;

export type Drawable = HTMLImageElement | ImageBitmap;
type ProgressFn = (critical: number, all: number) => void;

const canBitmap = typeof window !== "undefined" && typeof window.createImageBitmap === "function";

class FrameStore {
  /** Desktop: decoded images. Phones: unused. */
  private readonly images: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
  /** Phones: compressed bytes for every frame, plus a small window of decoded bitmaps. */
  private readonly blobs: (Blob | null)[] = new Array(FRAME_COUNT).fill(null);
  private readonly bitmaps = new Map<number, ImageBitmap>();
  private readonly decoding = new Set<number>();
  private centre = 0;
  private readonly radius = 14;

  private readonly order: number[] = [];
  private readonly criticalCount: number;
  private loaded = 0;
  private started = false;
  private listeners = new Set<ProgressFn>();
  private onFrameListeners = new Set<(i: number) => void>();

  constructor() {
    const seen = new Set<number>();
    const passes = [25, 12, 6, 3, 1];
    let critical = 0;
    passes.forEach((stride, p) => {
      for (let i = 0; i < FRAME_COUNT; i += stride) {
        if (seen.has(i)) continue;
        seen.add(i);
        this.order.push(i);
      }
      if (!seen.has(FRAME_COUNT - 1)) {
        seen.add(FRAME_COUNT - 1);
        this.order.push(FRAME_COUNT - 1);
      }
      if (p === 1) critical = this.order.length; // first two passes gate the intro
    });
    this.criticalCount = critical;
  }

  private get phoneMode() {
    return PORTRAIT_SET && canBitmap;
  }

  onProgress(fn: ProgressFn) {
    this.listeners.add(fn);
    fn(this.criticalProgress(), this.loaded / FRAME_COUNT);
    return () => this.listeners.delete(fn);
  }

  onFrame(fn: (i: number) => void) {
    this.onFrameListeners.add(fn);
    return () => this.onFrameListeners.delete(fn);
  }

  private has(i: number) {
    return this.phoneMode ? !!this.blobs[i] : !!this.images[i];
  }

  private criticalProgress() {
    let n = 0;
    for (let k = 0; k < this.criticalCount; k++) if (this.has(this.order[k]!)) n++;
    return n / this.criticalCount;
  }

  private settle(idx: number, ok: boolean) {
    if (ok) this.onFrameListeners.forEach((f) => f(idx));
    this.loaded++;
    const c = this.criticalProgress();
    const a = this.loaded / FRAME_COUNT;
    this.listeners.forEach((f) => f(c, a));
  }

  start() {
    if (this.started) return;
    this.started = true;
    let cursor = 0;
    const next = () => {
      if (cursor >= this.order.length) return;
      const idx = this.order[cursor++]!;
      if (this.phoneMode) {
        fetch(frameUrl(idx))
          .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
          .then((b) => {
            this.blobs[idx] = b;
            this.settle(idx, true);
            if (Math.abs(idx - this.centre) <= this.radius) this.pump();
          })
          .catch(() => this.settle(idx, false))
          .finally(next);
        return;
      }
      const img = new Image();
      img.decoding = "async";
      img.src = frameUrl(idx);
      const done = (ok: boolean) => {
        if (ok) this.images[idx] = img;
        this.settle(idx, ok);
        next();
      };
      img.decode().then(() => done(true), () => done(img.complete && img.naturalWidth > 0));
    };
    for (let k = 0; k < CONCURRENCY; k++) next();
  }

  /** Phones: tell the store where the scroll is, so it decodes ahead and frees the rest. */
  focus(i: number) {
    if (!this.phoneMode) return;
    const c = Math.round(i);
    if (c === this.centre) return;
    this.centre = c;
    for (const [k, bmp] of this.bitmaps) {
      if (Math.abs(k - c) > this.radius + 4) {
        bmp.close();
        this.bitmaps.delete(k);
      }
    }
    this.pump();
  }

  private pump() {
    if (this.decoding.size >= 2) return;
    // Nearest frames first, alternating ahead and behind.
    for (let d = 0; d <= this.radius; d++) {
      for (const k of d === 0 ? [this.centre] : [this.centre + d, this.centre - d]) {
        if (k < 0 || k >= FRAME_COUNT) continue;
        if (this.bitmaps.has(k) || this.decoding.has(k)) continue;
        const blob = this.blobs[k];
        if (!blob) continue;
        this.decoding.add(k);
        createImageBitmap(blob)
          .then((bmp) => {
            if (Math.abs(k - this.centre) > this.radius + 4) bmp.close();
            else {
              this.bitmaps.set(k, bmp);
              this.onFrameListeners.forEach((f) => f(k));
            }
          })
          .catch(() => {})
          .finally(() => {
            this.decoding.delete(k);
            this.pump();
          });
        if (this.decoding.size >= 2) return;
      }
    }
  }

  /** Closest ready frame to `i` (searches outward). */
  nearest(i: number): Drawable | null {
    if (this.phoneMode) {
      const direct = this.bitmaps.get(i);
      if (direct) return direct;
      for (let d = 1; d <= this.radius + 4; d++) {
        const l = this.bitmaps.get(i - d);
        if (l) return l;
        const r = this.bitmaps.get(i + d);
        if (r) return r;
      }
      return null;
    }
    const direct = this.images[i];
    if (direct) return direct;
    for (let d = 1; d < FRAME_COUNT; d++) {
      const l = this.images[i - d];
      if (l) return l;
      const r = this.images[i + d];
      if (r) return r;
      if (i - d < 0 && i + d >= FRAME_COUNT) break;
    }
    return null;
  }
}

export const frames = new FrameStore();
