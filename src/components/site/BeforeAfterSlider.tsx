import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import interiorBeforeImg from "@/assets/interior-before.jpg";
import interiorFinishedImg from "@/assets/interior-finished.jpg";

interface BeforeAfterSliderProps {
  beforeLabel?: string;
  afterLabel?: string;
  aspect?: string;
}

/**
 * Before/after comparison slider using hardware-accelerated clipping.
 * Supports touch, pointer, mouse, and keyboard navigation.
 */
export function BeforeAfterSlider({
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
  aspect = "7/5",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const clamp = (v: number) => Math.max(2, Math.min(98, v));

  const updatePosition = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clamp(x));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback if setPointerCapture is unsupported
    }
    updatePosition(e.clientX);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      updatePosition(e.clientX);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Fallback
    }
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
      setPosition(5);
    } else if (e.key === "End") {
      e.preventDefault();
      setPosition(95);
    }
  };

  const clipStyle = `inset(0 ${100 - position}% 0 0)`;

  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden group shadow-2xl border border-border"
      style={{
        aspectRatio: aspect,
        cursor: "col-resize",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label="Before and after interior comparison slider"
    >
      {/* AFTER panel (full width, base layer) */}
      <div className="absolute inset-0 pointer-events-none">
        <AfterPanel />
        <div className="absolute bottom-4 right-4 z-10">
          <span className="arch-label arch-label--light bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] tracking-widest uppercase border border-white/10">
            {afterLabel}
          </span>
        </div>
      </div>

      {/* BEFORE panel (clipped to left portion) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          clipPath: clipStyle,
          WebkitClipPath: clipStyle,
        }}
      >
        <BeforePanel />
        <div className="absolute bottom-4 left-4 z-10">
          <span className="arch-label arch-label--light bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] tracking-widest uppercase border border-white/10">
            {beforeLabel}
          </span>
        </div>
      </div>

      {/* Dividing Line & Handle */}
      <div
        role="slider"
        aria-label="Comparison slider handle"
        aria-valuenow={Math.round(position)}
        aria-valuemin={2}
        aria-valuemax={98}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="absolute top-0 bottom-0 z-20 flex items-center justify-center pointer-events-none"
        style={{
          left: `${position}%`,
          transform: "translateX(-50%)",
          outline: "none",
        }}
      >
        {/* High-visibility divider line with edge glow */}
        <div
          className="absolute top-0 bottom-0 w-[2px]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.95) 50%, rgba(255,255,255,0.4) 100%)",
            boxShadow: "0 0 8px rgba(0,0,0,0.6), 0 0 2px rgba(255,255,255,0.8)",
          }}
        />

        {/* Central Handle Button */}
        <div
          className="relative z-10 flex h-10 w-10 items-center justify-center shadow-xl transition-transform group-hover:scale-105 active:scale-95"
          style={{
            background: "var(--indigo)",
            border: "2px solid #ffffff",
            boxShadow: "0 4px 14px rgba(0,0,0,0.5)",
          }}
        >
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden="true">
            <path d="M5 1L1 6L5 11" stroke="var(--bg-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 1L17 6L13 11" stroke="var(--bg-deep)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/** Real "before" photo — raw concrete space before finishes & furniture */
function BeforePanel() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-ink">
      <img
        src={interiorBeforeImg}
        alt="Raw interior space before construction and furnishing"
        className="absolute inset-0 w-full h-full object-cover object-center"
        draggable={false}
      />
      {/* Architectural corner annotation */}
      <div className="absolute top-3 left-3" aria-hidden="true">
        <span
          className="arch-label"
          style={{
            color: "rgba(255,255,255,0.75)",
            background: "rgba(8,11,26,0.75)",
            padding: "2px 8px",
            fontSize: "10px",
            letterSpacing: "0.15em",
          }}
        >
          RAW SPACE — UNFINISHED SHELL
        </span>
      </div>
    </div>
  );
}

/** Real "after" photo — finished, furnished luxury interior */
function AfterPanel() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-ink">
      <img
        src={interiorFinishedImg}
        alt="Finished luxury interior with timber wall paneling and custom sectional"
        className="absolute inset-0 w-full h-full object-cover object-center"
        draggable={false}
      />
      {/* Architectural corner annotation */}
      <div className="absolute top-3 right-3" aria-hidden="true">
        <span
          className="arch-label"
          style={{
            color: "rgba(255,255,255,0.75)",
            background: "rgba(8,11,26,0.75)",
            padding: "2px 8px",
            fontSize: "10px",
            letterSpacing: "0.15em",
          }}
        >
          FINISHED 1:1 INTERIOR
        </span>
      </div>
    </div>
  );
}
