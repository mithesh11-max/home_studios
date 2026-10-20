// Progressive frame loader for the smoke sequence.
// Frames are requested coarse-to-fine (every 25th, then 12th, 6th, 3rd, 1st),
// so the full scroll range is usable almost immediately and fills in with detail.
//
// Desktop: each frame is an <img>, decoded once as it arrives.
// Phones:  a background worker downloads every frame as compressed bytes (about 2 MB in
//          all) and decodes only the frames around the current scroll position, straight
//          to the size they are drawn at. The page just draws ready bitmaps, so scrolling
//          never waits on a decode and the main thread never pays for one. Memory stays flat
//          (about 25 screen-sized frames at a time). Without worker support, the same
//          happens on the main thread.

// Phones in portrait get their own sequence, composed vertically for a tall screen
// (720×1280, every other frame of the 1080×1920 portrait render).
export const PORTRAIT_SET =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 760px) and (orientation: portrait)").matches;
export const FRAME_COUNT = PORTRAIT_SET ? 250 : 500;
/** Pixel size of the source frames. */
export const FRAME_W = PORTRAIT_SET ? 720 : 1280;
export const FRAME_H = PORTRAIT_SET ? 1280 : 720;
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
  private readonly bitmapGen = new Map<number, number>();
  private readonly decoding = new Set<number>();
  private centre = 0;
  private readonly radius = 10;
  /** Phones: size the frames are drawn at; `gen` counts changes, so stale bitmaps are dropped. */
  private size = { w: 0, h: 0 };
  private gen = 0;
  private worker: Worker | null = null;
  private readonly arrived: boolean[] = new Array(FRAME_COUNT).fill(false);

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
    if (this.worker) return this.arrived[i]!;
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
    if (this.phoneMode && this.startWorker()) return;
    this.startHere();
  }

  /** Phones: hand downloading and decoding to a worker. False if workers aren't available. */
  private startWorker() {
    let w: Worker;
    try {
      w = new Worker(new URL("./frameWorker.ts", import.meta.url), { type: "module" });
    } catch {
      return false;
    }
    this.worker = w;
    const fail = () => {
      // Worker unusable here: do the same work on the main thread instead.
      w.terminate();
      if (this.worker !== w) return;
      this.worker = null;
      this.startHere();
    };
    w.onerror = fail;
    w.onmessage = (e: MessageEvent) => {
      const m = e.data as
        | { type: "ready"; ok: boolean }
        | { type: "loaded"; idx: number; ok: boolean }
        | { type: "bitmap"; idx: number; bitmap: ImageBitmap; gen: number };
      if (m.type === "ready") {
        if (!m.ok) return fail();
        const urls = Array.from({ length: FRAME_COUNT }, (_, i) => new URL(frameUrl(i), location.href).href);
        w.postMessage({ type: "init", urls, order: this.order, concurrency: CONCURRENCY });
        if (this.size.w) w.postMessage({ type: "size", ...this.size });
        w.postMessage({ type: "focus", centre: this.centre, radius: this.radius });
      } else if (m.type === "loaded") {
        if (m.ok) this.arrived[m.idx] = true;
        this.settle(m.idx, m.ok);
      } else if (m.type === "bitmap") {
        if (m.gen !== this.gen || this.bitmaps.has(m.idx) || Math.abs(m.idx - this.centre) > this.radius + 4) {
          w.postMessage({ type: "free", idx: m.idx, gen: m.gen, bitmap: m.bitmap }, [m.bitmap]);
          return;
        }
        this.bitmaps.set(m.idx, m.bitmap);
        this.bitmapGen.set(m.idx, m.gen);
        this.onFrameListeners.forEach((f) => f(m.idx));
      }
    };
    return true;
  }

  /** Drop a decoded frame: handed back to the worker to free, or closed here. */
  private release(k: number) {
    const bmp = this.bitmaps.get(k);
    if (!bmp) return;
    this.bitmaps.delete(k);
    const gen = this.bitmapGen.get(k) ?? 0;
    this.bitmapGen.delete(k);
    if (this.worker) this.worker.postMessage({ type: "free", idx: k, gen, bitmap: bmp }, [bmp]);
    else bmp.close();
  }

  /** Phones: the size frames are drawn at, so they can be decoded at exactly that size. */
  setSize(w: number, h: number) {
    if (!this.phoneMode || (w === this.size.w && h === this.size.h)) return;
    this.size = { w, h };
    this.gen++;
    for (const k of Array.from(this.bitmaps.keys())) this.release(k);
    if (this.worker) this.worker.postMessage({ type: "size", w, h });
    else this.pump();
  }

  private startHere() {
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
    for (const k of Array.from(this.bitmaps.keys())) {
      if (Math.abs(k - c) > this.radius + 4) this.release(k);
    }
    if (this.worker) this.worker.postMessage({ type: "focus", centre: c, radius: this.radius });
    else this.pump();
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
        const gen = this.gen;
        const opts: ImageBitmapOptions = this.size.w
          ? { resizeWidth: this.size.w, resizeHeight: this.size.h, resizeQuality: "medium" }
          : {};
        createImageBitmap(blob, opts)
          .then((bmp) => {
            if (gen !== this.gen || this.bitmaps.has(k) || Math.abs(k - this.centre) > this.radius + 4) bmp.close();
            else {
              this.bitmaps.set(k, bmp);
              this.bitmapGen.set(k, gen);
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
