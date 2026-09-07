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
import { motion, useReducedMotion } from "framer-motion";
import { getActivePhase } from "./PhaseIndicator";
import { useAppointment } from "@/lib/appointment-context";
import { EASE_ARCH_HEAVY, EASE_ARCH_SLOW, DURATION } from "@/lib/motion";

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
    return `/sequence/mobile/ezgif-frame-${num}.jpg`;
  }
  return `/sequence/ezgif-frame-${num}.jpg`;
}

// ---------------------------------------------------------------------------
// Overlay Phase Definitions (Intermediate sequence chapters)
// ---------------------------------------------------------------------------

const OVERLAYS = [
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
  isMobile?: boolean;
}

function VideoLoader({ done, onDone, isMobile }: VideoLoaderProps) {
  if (isMobile) return null; // Mobile immediately shows the mobile portrait scroll canvas
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
      className="fixed inset-0 z-[100] w-full h-screen overflow-hidden bg-black pointer-events-auto cursor-pointer"
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

function StaticHero({ isMobile = false }: { isMobile?: boolean }) {
  const { open } = useAppointment();
  return (
    <section
      className="relative flex min-h-screen flex-col justify-end pb-16 pt-40 overflow-hidden bg-deep"
      style={{ backgroundColor: "var(--bg-deep)" }}
      aria-label="Hero"
    >
      <img
        src={isMobile ? "/sequence/mobile/ezgif-frame-090.jpg" : "/sequence/ezgif-frame-090.jpg"}
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

  // Reset frame cache and force redraw if user resizes or rotates between mobile & desktop
  const prevIsMobileRef = useRef(isMobile);
  useEffect(() => {
    if (prevIsMobileRef.current !== isMobile) {
      prevIsMobileRef.current = isMobile;
      imagesRef.current = new Array(TOTAL_FRAMES).fill(null);
      lastDrawnFrameRef.current = -1;
      setLoadedCount(0);
    }
  }, [isMobile]);
  
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
  const initialLockupRef = useRef<HTMLDivElement>(null);
  const vignetteRef = useRef<HTMLDivElement>(null);

  // Subtle mouse tracking for optical depth parallax (desktop only)
  const mouseRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0 });

  useEffect(() => {
    if (typeof window === "undefined" || isMobile) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onPointerMove = (e: PointerEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const nx = (e.clientX / w) * 2 - 1;
      const ny = (e.clientY / h) * 2 - 1;
      mouseRef.current.targetX = Math.max(-1, Math.min(1, nx));
      mouseRef.current.targetY = Math.max(-1, Math.min(1, ny));
    };

    const onPointerLeave = () => {
      mouseRef.current.targetX = 0;
      mouseRef.current.targetY = 0;
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [isMobile]);

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

      // Repaint immediately if the decoded frame matches the current active view
      if (Math.round(currentFrameRef.current) === idx) {
        drawFrame(idx);
      }
    },
    [isMobile, drawFrame]
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

      // 4. Staggered keyframe preloading (every 10th frame) for instant scrub response
      const keyframeTasks: Promise<void>[] = [];
      for (let i = INITIAL_BURST_FRAMES; i < TOTAL_FRAMES - 1; i += 10) {
        keyframeTasks.push(loadSingleFrame(i));
      }
      await Promise.all(keyframeTasks);
      if (cancelled) return;

      // 5. Stream remainder in parallel worker pools of 12
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

  // Butter-smooth 60-120fps rAF render loop with cinematic camera locomotion & multi-plane parallax
  useEffect(() => {
    const loop = (timestamp: number) => {
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

      // 2. Multi-Plane Optical Parallax & Continuous Camera Breathing (Reduced on mobile to conserve GPU)
      const mouse = mouseRef.current;
      mouse.currentX += (mouse.targetX - mouse.currentX) * 0.06;
      mouse.currentY += (mouse.targetY - mouse.currentY) * 0.06;
      const mx = isMobile ? 0 : mouse.currentX;
      const my = isMobile ? 0 : mouse.currentY;

      const time = timestamp || performance.now();
      // Organic steadicam camera breathing (gentle continuous drift, disabled on mobile for stable battery/perf)
      const breathX = isMobile ? 0 : Math.sin(time * 0.00032) * 2.5;
      const breathY = isMobile ? 0 : Math.cos(time * 0.00026) * 1.8;
      const breathScale = 1.015 + (isMobile ? 0 : Math.sin(time * 0.00018) * 0.004);

      // Overall sequence scroll progress (0 to 1)
      const scrollProgress = Math.max(0, Math.min(1, target / (TOTAL_FRAMES - 1)));
      const forwardScale = breathScale + scrollProgress * (isMobile ? 0.025 : 0.045);

      // Transform Layer 1: Background Canvas (subtle opposition parallax + forward scaling)
      if (canvasRef.current) {
        const bgX = breathX + mx * -7;
        const bgY = breathY + my * -5;
        canvasRef.current.style.transform = `translate3d(${bgX.toFixed(2)}px, ${bgY.toFixed(2)}px, 0) scale(${forwardScale.toFixed(4)})`;
      }

      // Transform Layer 2: Midground Atmospheric Vignette
      if (vignetteRef.current) {
        const midX = breathX * 0.5 + mx * -11;
        const midY = breathY * 0.5 + my * -8;
        // Soften vignette towards end so the next section emerges through light
        const exitSoftening = scrollProgress > 0.85 ? (scrollProgress - 0.85) / 0.15 : 0;
        const vigOpacity = 1 - exitSoftening * 0.35;
        vignetteRef.current.style.transform = `translate3d(${midX.toFixed(2)}px, ${midY.toFixed(2)}px, 0)`;
        vignetteRef.current.style.opacity = vigOpacity.toFixed(3);
      }

      // Transform Layer 3: Initial Arrival Lockup (Recedes smoothly as camera flies into space)
      if (initialLockupRef.current) {
        // Recedes over first 28 frames
        const recedeT = Math.min(1, Math.max(0, (next - 1) / 27));
        const recedeY = recedeT * 36;
        const recedeScale = 1 - recedeT * 0.08;
        const recedeOpacity = Math.max(0, 1 - recedeT * 1.25);
        const fgX = mx * 14;
        const fgY = my * 10 - recedeY;

        initialLockupRef.current.style.transform = `translate3d(${fgX.toFixed(2)}px, ${fgY.toFixed(2)}px, 0) scale(${recedeScale.toFixed(3)})`;
        initialLockupRef.current.style.opacity = recedeOpacity.toFixed(3);
        initialLockupRef.current.style.pointerEvents = recedeOpacity > 0.35 ? "auto" : "none";
      }

      // Transform Layer 4: Direct DOM Intermediate Overlays (Space & Interior)
      OVERLAYS.forEach((ov, i) => {
        const el = overlayRefs.current[i];
        if (el) {
          const op = calculateOverlayOpacity(displayFrameNum, ov.frames[0], ov.frames[1]);
          const ovFgX = mx * 10;
          const ovFgY = my * 8 + (1 - op) * 14;
          el.style.opacity = String(op);
          el.style.transform = `translate3d(${ovFgX.toFixed(2)}px, ${ovFgY.toFixed(2)}px, 0)`;
          el.style.pointerEvents = op > 0.5 ? "auto" : "none";
        }
      });

      // Transform Layer 5: Final 1:1 Scale Lockup (Arrival at finished architecture)
      const isFinal = displayFrameNum >= 245;
      if (finalLockupRef.current) {
        const finalFgX = mx * 8;
        const finalFgY = my * 6 + (isFinal ? 0 : 16);
        finalLockupRef.current.style.opacity = isFinal ? "1" : "0";
        finalLockupRef.current.style.transform = `translate3d(${finalFgX.toFixed(2)}px, ${finalFgY.toFixed(2)}px, 0)`;
        finalLockupRef.current.style.pointerEvents = isFinal ? "auto" : "none";
      }

      // 4. Update Phase only when crossing phase boundaries
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
        isMobile={isMobile}
      />

      {/* Layer 1: Background Sequence Canvas */}
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Photoreal architectural walkthrough sequence — scroll down to explore"
        style={{
          position: "sticky",
          top: 0,
          width: "100vw",
          height: "100dvh",
          display: "block",
          background: "var(--bg-deep)",
          filter: "saturate(0.88) brightness(0.92)",
          willChange: "transform",
          transformOrigin: "center center",
        }}
      />

      {/* Layer 2: Midground Dark Indigo atmospheric tint + vignette */}
      <div
        ref={vignetteRef}
        className="pointer-events-none sticky top-0 -mt-[100dvh] w-full h-[100dvh] z-10 will-change-transform"
        style={{
          background: "radial-gradient(ellipse at center, rgba(23, 26, 61, 0.20) 0%, rgba(8, 11, 26, 0.60) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Layer 3: Initial Arrival Architectural Lockup (Enters with spatial stagger, recedes on scroll) */}
      <div
        ref={initialLockupRef}
        className="pointer-events-none sticky top-0 -mt-[100dvh] w-full h-[100dvh] z-20 flex flex-col justify-end pb-8 sm:pb-12 will-change-transform"
        style={{
          opacity: isStartAtEnd ? 0 : 1,
          transform: "translate3d(0, 0, 0)",
        }}
      >
        <div className="arch-container">
          <div className="max-w-[56ch]">
            {/* Staggered Item 1: Datum & Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1.0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: EASE_ARCH_HEAVY }}
              className="flex items-center gap-3 mb-3"
            >
              <span className="arch-label arch-label--accent">01 / ARRIVAL</span>
              <span className="inline-block w-3 h-px bg-indigo/40" aria-hidden="true" />
              <span className="arch-label hidden sm:inline" style={{ color: "var(--text-secondary)", fontSize: "9px" }}>
                1:1 PROJECTION FIELD • RR NAGAR
              </span>
            </motion.div>

            {/* Staggered Item 2: Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1.0 }}
              transition={{ duration: 0.85, delay: 0.24, ease: EASE_ARCH_SLOW }}
              className="font-display text-white text-[clamp(2.2rem,4.5vw,4.5rem)] font-light leading-[1.02] tracking-tight mb-4"
            >
              Every space starts with a line.
            </motion.h1>

            {/* Staggered Item 3: Descriptor and subtle scroll guide */}
            <motion.div
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1.0 }}
              transition={{ duration: 0.8, delay: 0.38, ease: EASE_ARCH_HEAVY }}
              className="flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-6"
            >
              <p className="text-white/80 text-[0.98rem] leading-relaxed max-w-[42ch]">
                Walk through your future home at real scale before construction begins.
              </p>

              <div className="flex items-center gap-2 font-mono text-[9px] tracking-widest text-indigo uppercase">
                <span>SCROLL TO ENTER</span>
                <span aria-hidden="true">↓</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Layer 4: Direct DOM Animated Overlays for Intermediate Phases */}
      <div
        className="pointer-events-none sticky top-0 -mt-[100dvh] w-full h-[100dvh] z-20"
        aria-hidden="true"
      >
        {OVERLAYS.map((ov, i) => (
          <div
            key={ov.id}
            ref={(el) => { overlayRefs.current[i] = el; }}
            className="absolute bottom-16 left-0 arch-container transition-transform will-change-transform pointer-events-none"
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
      </div>

      {/* Layer 5: HOME — Final Lockup (Holds single <h1>) */}
      <div
        ref={finalLockupRef}
        id="home-lockup"
        className="absolute bottom-0 left-0 right-0 arch-container pb-6 sm:pb-10 transition-all duration-500 z-30"
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

      {/* Aperture threshold transition to next section (sits behind lockup at z-15) */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-36 z-15"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(8, 11, 26, 0.75) 60%, var(--bg-deep) 100%)",
        }}
        aria-hidden="true"
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Main SequenceHero Export
// ---------------------------------------------------------------------------

function checkIsMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768 || window.innerHeight > window.innerWidth;
}

export function SequenceHero() {
  const prefersReducedMotion = useReducedMotion();
  const scrollContainerRef = useRef<HTMLElement>(null);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => checkIsMobile());
  const [canvasSupported, setCanvasSupported] = useState<boolean>(true);

  useEffect(() => {
    const checkScreen = () => setIsMobile(checkIsMobile());
    checkScreen();
    window.addEventListener("resize", checkScreen);
    window.addEventListener("orientationchange", checkScreen);
    return () => {
      window.removeEventListener("resize", checkScreen);
      window.removeEventListener("orientationchange", checkScreen);
    };
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
    return <StaticHero isMobile={isMobile} />;
  }

  // 0.85x scroll speed: 500vh container gives 488vh of cinematic scroll travel
  // Matching identical paced scroll motion on both mobile phone and PC
  const baseScrollVh = 500;
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
