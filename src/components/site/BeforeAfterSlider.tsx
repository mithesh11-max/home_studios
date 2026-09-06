import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react";
import interiorBeforeImg from "@/assets/interior-before.jpg";
import interiorFinishedImg from "@/assets/interior-finished.jpg";

interface BeforeAfterSliderProps {
  beforeLabel?: string;
  afterLabel?: string;
  aspect?: string;
}

export function BeforeAfterSlider({
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
  aspect = "7/5",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const isDraggingRef = useRef(false);

  const clamp = (v: number) => Math.max(0, Math.min(100, v));

  const updatePosition = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clamp(x));
  }, []);

  // Measure container width for pixel-perfect 1:1 image overlay alignment
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setContainerWidth(w);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Global pointer listeners for smooth dragging outside the container
  useEffect(() => {
    const onGlobalPointerMove = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        updatePosition(e.clientX);
      }
    };

    const onGlobalPointerUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener("pointermove", onGlobalPointerMove, { passive: true });
    window.addEventListener("pointerup", onGlobalPointerUp);
    window.addEventListener("pointercancel", onGlobalPointerUp);

    return () => {
      window.removeEventListener("pointermove", onGlobalPointerMove);
      window.removeEventListener("pointerup", onGlobalPointerUp);
      window.removeEventListener("pointercancel", onGlobalPointerUp);
    };
  }, [updatePosition]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    updatePosition(e.clientX);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPosition((p) => clamp(p - 3));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPosition((p) => clamp(p + 3));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPosition(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setPosition(100);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden group shadow-2xl border border-border"
      style={{
        aspectRatio: aspect,
        cursor: "col-resize",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      aria-label="Before and after interior comparison slider"
    >
      {/* ── Layer 1: AFTER (Finished Interior) — Full background ── */}
      <div className="absolute inset-0 select-none pointer-events-none overflow-hidden">
        <img
          src={interiorFinishedImg}
          alt="Finished luxury interior"
          className="w-full h-full object-cover object-center select-none pointer-events-none block"
          draggable={false}
        />
        <div className="absolute top-3 right-3 z-10 pointer-events-none">
          <span
            className="arch-label"
            style={{
              color: "rgba(255,255,255,0.85)",
              background: "rgba(8,11,26,0.75)",
              padding: "2px 8px",
              fontSize: "10px",
              letterSpacing: "0.15em",
            }}
          >
            FINISHED 1:1 INTERIOR
          </span>
        </div>
        <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
          <span className="arch-label arch-label--light bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] tracking-widest uppercase border border-white/15">
            {afterLabel}
          </span>
        </div>
      </div>

      {/* ── Layer 2: BEFORE (Raw Space) — Dynamically clipped by width ── */}
      <div
        className="absolute top-0 bottom-0 left-0 select-none pointer-events-none overflow-hidden z-10"
        style={{
          width: `${position}%`,
          willChange: "width",
        }}
      >
        {/* Inner container pinned to the left at full container width so image doesn't scale/stretch */}
        <div
          className="relative h-full select-none pointer-events-none"
          style={{
            width: containerWidth > 0 ? `${containerWidth}px` : "100vw",
            maxWidth: "none",
          }}
        >
          <img
            src={interiorBeforeImg}
            alt="Raw space before construction"
            className="w-full h-full object-cover object-center select-none pointer-events-none block"
            draggable={false}
          />
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span
              className="arch-label"
              style={{
                color: "rgba(255,255,255,0.85)",
                background: "rgba(8,11,26,0.75)",
                padding: "2px 8px",
                fontSize: "10px",
                letterSpacing: "0.15em",
              }}
            >
              RAW SPACE — UNFINISHED
            </span>
          </div>
          <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
            <span className="arch-label arch-label--light bg-black/70 backdrop-blur-md px-3 py-1 text-[11px] tracking-widest uppercase border border-white/15">
              {beforeLabel}
            </span>
          </div>
        </div>
      </div>

      {/* ── Layer 3: Divider Line & Interactive Handle ── */}
      <div
        role="slider"
        aria-label="Comparison slider handle"
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="absolute top-0 bottom-0 z-20 flex items-center justify-center pointer-events-none"
        style={{
          left: `${position}%`,
          transform: "translateX(-50%)",
          outline: "none",
          willChange: "left",
        }}
      >
        {/* Crisp vertical dividing line with glow */}
        <div
          className="absolute top-0 bottom-0 w-[2px]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.6) 0%, #ffffff 50%, rgba(255,255,255,0.6) 100%)",
            boxShadow: "0 0 10px rgba(0,0,0,0.8), 0 0 4px rgba(255,255,255,0.9)",
          }}
        />

        {/* Center circular handle button */}
        <div
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-2xl transition-transform group-hover:scale-105 active:scale-95"
          style={{
            background: "var(--indigo, #6366f1)",
            border: "2.5px solid #ffffff",
            boxShadow: "0 4px 16px rgba(0,0,0,0.6), 0 0 12px rgba(99,102,241,0.5)",
          }}
        >
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
            <path d="M5 1L1 6L5 11" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 1L17 6L13 11" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
