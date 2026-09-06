/**
 * SequenceHero — Ultra-Smooth, Full HD Photoreal Architectural Walkthrough
 *
 * Performance & Visual Design:
 * - 500vh scroll container (300vh on mobile), sticky 100vh canvas
 * - Opaque 2D context with imageSmoothingQuality = "high" for crisp high-DPI rendering
 * - Accurate object-fit: cover math ensuring zero letterboxing or distortion on any screen ratio
 * - Zero React re-renders in the rAF loop: decoupled canvas drawing from state updates
 * - Passive scroll tracking without layout thrashing
 * - Fast multi-stream async image preloader using GPU background decoding (img.decode())
 * - Film-grade lerp (0.15) for silky fluid response without strobe or jank
 * - Instant fallback to nearest loaded frame during ultra-fast scrubbing
 */

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type RefObject,
} from "react";
import { Link } from "@tanstack/react-router";
import { useReducedMotion } from "framer-motion";
import { getActivePhase } from "./PhaseIndicator";
import { useAppointment } from "@/lib/appointment-context";

// Module-level flag: false on every fresh load/reload (JS re-executes),
// true after the intro video plays once — survives SPA navigation.
let introShown = false;

const TOTAL_FRAMES = 300;
/**
 * Scroll speed factor: 0.85x
 * Slows down the rate of frame progression per pixel of scroll (by 15%),
 * extending the scroll distance so the architectural walkthrough feels
 * paced, cinematic, and unhurried rather than rushing past too fast.
 */
const SCROLL_SPEED = 0.85;
const LERP_FACTOR = 0.12;
const INITIAL_BURST_FRAMES = 40;
const CONCURRENT_DOWNLOADS = 12;
const LOADER_TIMEOUT_MS = 5000;

function getFrameSrc(n: number, isMobile: boolean): string {
  const num = String(n).padStart(3, "0");
  if (isMobile) {
    return `/sequence/half/ezgif-frame-${num}.jpg`;
  }
  return `/sequence/ezgif-frame-${num}.jpg`;
}

// ---------------------------------------------------------------------------
// Overlay Phase Definitions
// ---------------------------------------------------------------------------

const OVERLAYS = [
  {
    id: "arrival",
    phaseIndex: 0,
    frames: [1, 30] as const,
    label: "01 / ARRIVAL",
    copy: "Every space starts with a line.",
    large: false,
  },
  {
    id: "space",
    phaseIndex: 2,
    frames: [60, 110] as const,
    label: "03 / THE SPACE",
    copy: "SEE THE SPACE\nBEFORE IT EXISTS.",
    large: true,
  },
  {
    id: "interior",
    phaseIndex: 4,
    frames: [160, 210] as const,
    label: "05 / INTERIOR",
    copy: "Test layouts, furniture and movement\nbefore they become expensive mistakes.",
    large: false,
  },
] as const;

function calculateOverlayOpacity(frame: number, start: number, end: number): number {
  const fade = 8;
  if (frame < start || frame > end) return 0;
  if (frame < start + fade) return (frame - start) / fade;
  if (frame > end - fade) return (end - frame) / fade;
  return 1;
}

// ---------------------------------------------------------------------------
// Loader Component
// ---------------------------------------------------------------------------

interface LoaderProps {
  progress: number;
  done: boolean;
  onDone: () => void;
}

// ---------------------------------------------------------------------------
// Video Loader Component (Plays Scene.mp4 with 1.5s smooth fade)
// ---------------------------------------------------------------------------

interface VideoLoaderProps {
  done: boolean;
  onDone: () => void;
}

function VideoLoader({ done, onDone }: VideoLoaderProps) {
  const isStartAtEnd = typeof window !== "undefined" && window.location.hash.includes("hs-content");
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(introShown || isStartAtEnd); // skip if already played this session or navigating to lockup
  const [videoEnded, setVideoEnded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const triggerFadeOut = useCallback(() => {
    if (fading || hidden) return;
    setFading(true);
    // Smooth 1.5 second fade duration as requested
    const timer = setTimeout(() => {
      introShown = true; // mark as played for the lifetime of this JS context
      setHidden(true);
      onDone();
    }, 1500);
    return () => clearTimeout(timer);
  }, [fading, hidden, onDone]);

  // Fade out when video finishes or buffer is ready
  useEffect(() => {
    if (videoEnded && done && !fading && !hidden) {
      triggerFadeOut();
    }
  }, [videoEnded, done, fading, hidden, triggerFadeOut]);

  // Safety fallback: if video is long or fails, fade out smoothly after 5.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!fading && !hidden) {
        triggerFadeOut();
      }
    }, 5500);
    return () => clearTimeout(timer);
  }, [fading, hidden, triggerFadeOut]);

  if (hidden) return null;

  return (
    <div
      onClick={triggerFadeOut}
      className="fixed inset-0 z-[100] w-screen h-screen overflow-hidden bg-black pointer-events-auto cursor-pointer"
      style={{
        opacity: fading ? 0 : 1,
        transition: "opacity 1500ms cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      aria-label="Intro video experience"
      role="status"
    >
      {/* Fullscreen Edge-to-Edge Intro Video */}
      <video
        ref={videoRef}
        src="/Scene.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={() => {
          setVideoEnded(true);
        }}
        onError={() => {
          setVideoEnded(true);
        }}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Subtle Skip CTA top-right */}
      <div className="absolute top-6 right-8 z-10 pointer-events-none">
        <span
          className="arch-label arch-label--light tracking-[0.2em] opacity-60 hover:opacity-100 transition-opacity"
          style={{ fontSize: "10px" }}
        >
          SKIP INTRO →
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Static Fallback (Reduced motion or canvas failure)
// ---------------------------------------------------------------------------

function StaticHero() {
  const { open } = useAppointment();
  return (
    <section
      className="relative flex min-h-screen flex-col justify-end pb-16 pt-40 overflow-hidden bg-deep"
      style={{ backgroundColor: "var(--bg-deep)" }}
      aria-label="Hero"
    >
      <img
        src="/sequence/ezgif-frame-090.jpg"
        alt="Double-height living room with floor-to-ceiling glass walls — Home Studios 1:1 walkthrough"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ filter: "saturate(0.88) brightness(0.6)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, rgba(8,11,26,0.3) 0%, rgba(8,11,26,0.9) 100%)",
        }}
        aria-hidden="true"
      />

      <div className="relative arch-container z-10 pb-6 sm:pb-10">
        <p className="arch-label arch-label--accent mb-3 sm:mb-4">HOME</p>
        <h1
          className="font-display text-white mb-4 sm:mb-5"
          style={{
            fontSize: "clamp(2.2rem, 4.2vw, 4.4rem)",
            fontWeight: 300,
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            maxWidth: "18ch",
          }}
        >
          EXPERIENCE THE SPACE<br />BEFORE YOU BUILD IT.
        </h1>
        <p className="text-white/70 mb-6 sm:mb-8 max-w-[48ch] leading-relaxed text-[0.95rem] sm:text-[1.05rem]">
          Walk through your future home at real scale before construction begins.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => open()}
            className="arch-btn arch-btn--primary"
            data-interactive
            aria-label="Book your appointment"
          >
            BOOK YOUR APPOINTMENT <span className="arch-btn-arrow">→</span>
          </button>
          <Link to="/walkthrough" className="arch-btn arch-btn--ghost-light" data-interactive>
            EXPLORE 3D WALKTHROUGH <span className="arch-btn-arrow">↓</span>
          </Link>
        </div>
        <div className="mt-6 sm:mt-8 flex gap-6" aria-hidden="true">
          <span className="arch-label arch-label--light">RR NAGAR / BENGALURU</span>
          <span className="arch-label arch-label--light">1:1 SCALE</span>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Canvas Hero Core
// ---------------------------------------------------------------------------

interface CanvasHeroProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
  isMobile: boolean;
  onPhaseChange: (phaseIndex: number) => void;
}

function CanvasHero({ scrollContainerRef, isMobile, onPhaseChange }: CanvasHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  
  // Animation loop variables stored in refs to avoid React re-renders during 60fps scrub
  const isStartAtEnd = typeof window !== "undefined" && window.location.hash.includes("hs-content");
  const currentFrameRef = useRef(isStartAtEnd ? TOTAL_FRAMES - 1 : 0);
  const targetFrameRef = useRef(isStartAtEnd ? TOTAL_FRAMES - 1 : 0);
  const rafIdRef = useRef<number>(0);
  const lastDrawnFrameRef = useRef(-1);
  const currentPhaseIndexRef = useRef(isStartAtEnd ? 6 : 0);

  // Overlay DOM element refs for instant style updates without React reconciliation
  const overlayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const finalLockupRef = useRef<HTMLDivElement>(null);

  const [loadedCount, setLoadedCount] = useState(0);
  const [loaderDone, setLoaderDone] = useState(false);
  const { open } = useAppointment();

  // High-Definition Canvas Painter with Exact Cover Math
  const drawFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    // Nearest-neighbor fallback search if this frame is still decoding
    let img = imagesRef.current[frameIndex];
    if (!img || !img.complete || !img.naturalWidth) {
      for (let d = 1; d < TOTAL_FRAMES; d++) {
        const prev = frameIndex - d;
        const next = frameIndex + d;
        if (prev >= 0 && imagesRef.current[prev]?.complete && imagesRef.current[prev]?.naturalWidth) {
          img = imagesRef.current[prev];
          break;
        }
        if (next < TOTAL_FRAMES && imagesRef.current[next]?.complete && imagesRef.current[next]?.naturalWidth) {
          img = imagesRef.current[next];
          break;
        }
      }
    }

    if (!img || !img.complete || !img.naturalWidth) return;

    // High quality bicubic resampling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;

    const canvasRatio = cw / ch;
    const imageRatio = iw / ih;

    let sx = 0;
    let sy = 0;
    let sw = iw;
    let sh = ih;

    if (canvasRatio > imageRatio) {
      sh = iw / canvasRatio;
      sy = (ih - sh) / 2;
    } else {
      sw = ih * canvasRatio;
      sx = (iw - sw) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  }, []);

  // Responsive Canvas Size Setup
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    drawFrame(Math.round(currentFrameRef.current));
  }, [drawFrame]);

  // Asynchronous Image Loader with GPU-decode
  const loadSingleFrame = useCallback(
    async (idx: number): Promise<void> => {
      if (imagesRef.current[idx]) return;
      const img = new Image();
      img.decoding = "async";
      img.src = getFrameSrc(idx + 1, isMobile);

      try {
        await img.decode();
        imagesRef.current[idx] = img;
      } catch {
        // Fallback for Safari/older engines
        imagesRef.current[idx] = img;
      }
      setLoadedCount((c) => c + 1);
    },
    [isMobile]
  );

  // Fast Parallel Batch Preloading
  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const runPreload = async () => {
      // 1. Frame 0 and Frame 299 immediate paint
      await Promise.all([
        loadSingleFrame(0),
        loadSingleFrame(TOTAL_FRAMES - 1),
      ]);
      if (cancelled) return;
      const initialFrame = Math.round(currentFrameRef.current);
      drawFrame(initialFrame);

      // 2. Load initial burst (frames 1–40) concurrently
      const burstTasks: Promise<void>[] = [];
      for (let i = 1; i < Math.min(INITIAL_BURST_FRAMES, TOTAL_FRAMES - 1); i++) {
        burstTasks.push(loadSingleFrame(i));
      }
      await Promise.all(burstTasks);
      if (cancelled) return;

      // 3. Dismiss loader once initial view is completely smooth
      setLoaderDone(true);

      // 4. Stream remainder in parallel worker pools of 12
      let nextIndex = INITIAL_BURST_FRAMES;
      const worker = async () => {
        while (nextIndex < TOTAL_FRAMES - 1 && !cancelled) {
          const idx = nextIndex++;
          await loadSingleFrame(idx);
        }
      };

      const workers = Array.from({ length: CONCURRENT_DOWNLOADS }, () => worker());
      await Promise.all(workers);
    };

    runPreload();

    // Safety timeout to dismiss loader
    timeoutId = setTimeout(() => {
      setLoaderDone(true);
    }, LOADER_TIMEOUT_MS);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [drawFrame, isMobile, loadSingleFrame]);

  // Window Resize Debounce
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(updateCanvasDimensions, 100);
    };
    window.addEventListener("resize", onResize);
    updateCanvasDimensions();
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [updateCanvasDimensions]);

  // Lightweight Passive Scroll Tracker (Zero layout thrashing in rAF)
  useEffect(() => {
    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const maxScroll = container.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const scrolled = Math.max(0, -container.getBoundingClientRect().top);
      const progress = Math.max(0, Math.min(1, scrolled / maxScroll));
      targetFrameRef.current = progress * (TOTAL_FRAMES - 1);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollContainerRef]);

  // Butter-smooth 60-120fps rAF render loop
  useEffect(() => {
    const loop = () => {
      const current = currentFrameRef.current;
      const target = targetFrameRef.current;
      const diff = target - current;
      const next = Math.abs(diff) > 80 ? target : current + diff * LERP_FACTOR;
      currentFrameRef.current = next;

      const roundedFrame = Math.round(next);
      const displayFrameNum = roundedFrame + 1;

      // 1. Paint canvas only when frame index changes
      if (roundedFrame !== lastDrawnFrameRef.current) {
        drawFrame(roundedFrame);
        lastDrawnFrameRef.current = roundedFrame;
      }

      // 2. Direct DOM overlay update (bypasses React virtual DOM reconciliation for zero stutter)
      OVERLAYS.forEach((ov, i) => {
        const el = overlayRefs.current[i];
        if (el) {
          const op = calculateOverlayOpacity(displayFrameNum, ov.frames[0], ov.frames[1]);
          el.style.opacity = String(op);
          el.style.transform = `translateY(${(1 - op) * 12}px)`;
          el.style.pointerEvents = op > 0.5 ? "auto" : "none";
        }
      });

      // 3. Final phase lockup
      const isFinal = displayFrameNum >= 245;
      if (finalLockupRef.current) {
        finalLockupRef.current.style.opacity = isFinal ? "1" : "0";
        finalLockupRef.current.style.transform = `translateY(${isFinal ? 0 : 16}px)`;
        finalLockupRef.current.style.pointerEvents = isFinal ? "auto" : "none";
      }

      // 4. Update Phase only when crossing phase boundaries (only 7 updates across the whole page!)
      const newPhase = getActivePhase(displayFrameNum);
      if (newPhase !== currentPhaseIndexRef.current) {
        currentPhaseIndexRef.current = newPhase;
        onPhaseChange(newPhase);
      }

      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [drawFrame, onPhaseChange]);

  return (
    <>
      <VideoLoader
        done={loaderDone}
        onDone={() => {}}
      />

      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Photoreal architectural walkthrough sequence — scroll down to explore"
        style={{
          position: "sticky",
          top: 0,
          width: "100vw",
          height: "100vh",
          display: "block",
          background: "var(--bg-deep)",
          filter: "saturate(0.88) brightness(0.92)",
        }}
      />

      {/* Dark Indigo atmospheric tint + vignette */}
      <div
        className="pointer-events-none sticky top-0 -mt-[100vh] w-screen h-screen z-10"
        style={{
          background: "radial-gradient(ellipse at center, rgba(23, 26, 61, 0.20) 0%, rgba(8, 11, 26, 0.60) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Direct DOM Animated Overlays */}
      {OVERLAYS.map((ov, i) => (
        <div
          key={ov.id}
          ref={(el) => { overlayRefs.current[i] = el; }}
          className="absolute bottom-16 left-0 arch-container transition-transform will-change-transform pointer-events-none z-20"
          style={{ opacity: 0 }}
        >
          <p className="arch-label arch-label--light mb-4">{ov.label}</p>
          {ov.large ? (
            <h2
              className="font-display text-white"
              style={{
                fontSize: "var(--text-display-lg)",
                fontWeight: 300,
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                maxWidth: "18ch",
              }}
            >
              {ov.copy.split("\n").map((line, idx) => (
                <span key={idx} className="block overflow-hidden">
                  <span className="block">{line}</span>
                </span>
              ))}
            </h2>
          ) : (
            <p className="text-white/85 max-w-[44ch] text-[1.05rem] leading-relaxed whitespace-pre-line">
              {ov.copy}
            </p>
          )}
        </div>
      ))}

      {/* HOME — Final Lockup (Holds single <h1>) */}
      <div
        ref={finalLockupRef}
        id="home-lockup"
        className="absolute bottom-0 left-0 right-0 arch-container pb-6 sm:pb-10 transition-all duration-500 z-20"
        style={{
          opacity: isStartAtEnd ? 1 : 0,
          transform: isStartAtEnd ? "none" : "translateY(16px)",
          pointerEvents: isStartAtEnd ? "auto" : "none",
        }}
      >
        <p className="arch-label arch-label--accent mb-3 sm:mb-4">HOME</p>
        <h1
          className="font-display text-white mb-4 sm:mb-5"
          style={{
            fontSize: "clamp(2.2rem, 4.2vw, 4.4rem)",
            fontWeight: 300,
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            maxWidth: "18ch",
          }}
        >
          EXPERIENCE THE SPACE<br />BEFORE YOU BUILD IT.
        </h1>
        <p className="text-white/75 mb-6 sm:mb-8 max-w-[48ch] leading-relaxed text-[0.95rem] sm:text-[1.05rem]">
          Walk through your future home at real scale before construction begins.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => open()}
            className="arch-btn arch-btn--primary"
            data-interactive
            aria-label="Book your appointment"
          >
            BOOK YOUR APPOINTMENT <span className="arch-btn-arrow">→</span>
          </button>
          <Link to="/walkthrough" className="arch-btn arch-btn--ghost-light" data-interactive>
            EXPLORE 3D WALKTHROUGH <span className="arch-btn-arrow">↓</span>
          </Link>
        </div>
        <div className="mt-6 sm:mt-8 flex gap-6" aria-hidden="true">
          <span className="arch-label arch-label--light">RR NAGAR / BENGALURU</span>
          <span className="arch-label arch-label--light">1:1 SCALE</span>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main SequenceHero Export
// ---------------------------------------------------------------------------

export function SequenceHero() {
  const prefersReducedMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLElement>(null);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [canvasSupported, setCanvasSupported] = useState<boolean>(true);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setCanvasSupported(!!c.getContext("2d"));
    } catch {
      setCanvasSupported(false);
    }
  }, []);

  if (prefersReducedMotion || canvasSupported === false) {
    return <StaticHero />;
  }

  // 0.85x scroll speed: scale scroll container height so frame advance per pixel is 0.85x
  // Desktop: 500vh / 0.85 ≈ 588vh (giving 488vh of active scroll travel)
  // Mobile: 300vh / 0.85 ≈ 353vh (giving 253vh of active scroll travel)
  const baseScrollVh = isMobile ? 300 : 500;
  const scrollVh = Math.round(baseScrollVh / SCROLL_SPEED);

  return (
    <section
      ref={scrollContainerRef as React.RefObject<HTMLElement>}
      style={{ height: `${scrollVh}vh`, position: "relative" }}
      aria-label="Scroll-driven architectural walkthrough sequence"
    >
      <CanvasHero
        scrollContainerRef={scrollContainerRef}
        isMobile={isMobile}
        onPhaseChange={setActivePhaseIndex}
      />
    </section>
  );
}

export default SequenceHero;
