// Progressive frame loader for the smoke sequence.
// Frames are requested coarse-to-fine (every 25th, then 12th, 6th, 3rd, 1st),
// so the full scroll range is usable almost immediately and fills in with detail.

export const FRAME_COUNT = 500;
const CONCURRENCY = 6;

// Phones in portrait only ever see a narrow vertical slice of the wide frames, so they get
// a pre-cropped portrait set (405×720): about a third of the download and the memory.
export const PORTRAIT_SET =
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 760px) and (orientation: portrait)").matches;
/** Horizontal point of the frame kept in the centre of the screen. */
export const FOCUS_X = PORTRAIT_SET ? 0.5 : 0.6;

const frameUrl = (i: number) =>
  `${import.meta.env.BASE_URL}${PORTRAIT_SET ? "frames-m" : "frames"}/${String(i + 1).padStart(4, "0")}.webp`;

type ProgressFn = (critical: number, all: number) => void;

class FrameStore {
  readonly images: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
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

  onProgress(fn: ProgressFn) {
    this.listeners.add(fn);
    fn(this.criticalProgress(), this.loaded / FRAME_COUNT);
    return () => this.listeners.delete(fn);
  }

  onFrame(fn: (i: number) => void) {
    this.onFrameListeners.add(fn);
    return () => this.onFrameListeners.delete(fn);
  }

  private criticalProgress() {
    let n = 0;
    for (let k = 0; k < this.criticalCount; k++) if (this.images[this.order[k]!]) n++;
    return n / this.criticalCount;
  }

  start() {
    if (this.started) return;
    this.started = true;
    let cursor = 0;
    const next = () => {
      if (cursor >= this.order.length) return;
      const idx = this.order[cursor++]!;
      const img = new Image();
      img.decoding = "async";
      img.src = frameUrl(idx);
      const done = (ok: boolean) => {
        if (ok) {
          this.images[idx] = img;
          this.onFrameListeners.forEach((f) => f(idx));
        }
        this.loaded++;
        const c = this.criticalProgress();
        const a = this.loaded / FRAME_COUNT;
        this.listeners.forEach((f) => f(c, a));
        next();
      };
      if (PORTRAIT_SET) {
        // On phones, let the browser decode on first draw and evict freely; forcing
        // 500 decoded frames into memory can get a tab reloaded on iOS.
        img.onload = () => done(true);
        img.onerror = () => done(false);
      } else {
        img.decode().then(() => done(true), () => done(img.complete && img.naturalWidth > 0));
      }
    };
    for (let k = 0; k < CONCURRENCY; k++) next();
  }

  /** Closest loaded frame to `i` (searches outward). */
  nearest(i: number): HTMLImageElement | null {
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
