/// <reference lib="webworker" />
// Phones: downloads and decodes the smoke frames off the main thread.
//
// Every frame is kept as compressed bytes (about 2 MB in all). Only the frames around the
// current scroll position are decoded, straight to the size they are drawn at, and handed
// to the page as ImageBitmaps (transferred, not copied). Frames the page no longer needs
// are handed back and released here, so freeing memory costs the page nothing either.

type In =
  | { type: "init"; urls: string[]; order: number[]; concurrency: number }
  | { type: "size"; w: number; h: number }
  | { type: "focus"; centre: number; radius: number }
  | { type: "free"; idx: number; gen: number; bitmap: ImageBitmap };

const post = (msg: unknown, transfer: Transferable[] = []) => (self as DedicatedWorkerGlobalScope).postMessage(msg, transfer);

let urls: string[] = [];
let blobs: (Blob | null)[] = [];
let size = { w: 0, h: 0 };
let centre = 0;
let radius = 10;
let generation = 0; // bumps when the draw size changes, so stale decodes are dropped
const held = new Set<number>(); // decoded frames the page currently has
const decoding = new Set<number>();
const MAX_DECODES = 2;

const decode = (k: number) => {
  const blob = blobs[k];
  if (!blob) return;
  const gen = generation;
  decoding.add(k);
  const opts: ImageBitmapOptions = size.w > 0 ? { resizeWidth: size.w, resizeHeight: size.h, resizeQuality: "medium" } : {};
  createImageBitmap(blob, opts)
    .then((bmp) => {
      if (gen !== generation || Math.abs(k - centre) > radius + 4) bmp.close();
      else {
        held.add(k);
        post({ type: "bitmap", idx: k, bitmap: bmp, gen }, [bmp]);
      }
    })
    .catch(() => {})
    .finally(() => {
      decoding.delete(k);
      pump();
    });
};

// Nearest frames first, alternating ahead and behind.
function pump() {
  for (let d = 0; d <= radius && decoding.size < MAX_DECODES; d++) {
    for (const k of d === 0 ? [centre] : [centre + d, centre - d]) {
      if (decoding.size >= MAX_DECODES) return;
      if (k < 0 || k >= urls.length || held.has(k) || decoding.has(k) || !blobs[k]) continue;
      decode(k);
    }
  }
}

function load(order: number[], concurrency: number) {
  let cursor = 0;
  const next = () => {
    if (cursor >= order.length) return;
    const idx = order[cursor++]!;
    fetch(urls[idx]!)
      .then((r) => (r.ok ? r.blob() : Promise.reject(r.status)))
      .then((b) => {
        blobs[idx] = b;
        post({ type: "loaded", idx, ok: true });
        if (Math.abs(idx - centre) <= radius) pump();
      })
      .catch(() => post({ type: "loaded", idx, ok: false }))
      .finally(next);
  };
  for (let k = 0; k < concurrency; k++) next();
}

self.onmessage = (e: MessageEvent<In>) => {
  const m = e.data;
  if (m.type === "init") {
    urls = m.urls;
    blobs = new Array(urls.length).fill(null);
    load(m.order, m.concurrency);
  } else if (m.type === "size") {
    if (m.w === size.w && m.h === size.h) return;
    size = { w: m.w, h: m.h };
    generation++;
    held.clear(); // the page drops (and hands back) everything it had at the old size
    pump();
  } else if (m.type === "focus") {
    centre = m.centre;
    radius = m.radius;
    pump();
  } else if (m.type === "free") {
    m.bitmap.close();
    // A frame from an older draw size says nothing about what the page holds now.
    if (m.gen === generation) held.delete(m.idx);
    pump();
  }
};

post({ type: "ready", ok: typeof createImageBitmap === "function" });
