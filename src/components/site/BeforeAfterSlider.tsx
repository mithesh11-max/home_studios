import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react";
import interiorBeforeImg from "@/assets/interior-before.jpg";
import interiorFinishedImg from "@/assets/interior-finished.jpg";

interface BeforeAfterSliderProps {
  beforeLabel?: string;
  afterLabel?: string;
  aspect?: string;
}

/**
 * Before/after comparison slider using clip-path.
 * Supports mouse, touch, and keyboard (arrow keys).
 */
export function BeforeAfterSlider({
  beforeLabel = "BEFORE",
  afterLabel = "AFTER",
  aspect = "16/9",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const clamp = (v: number) => Math.max(5, Math.min(95, v));

  const updateFromX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clamp(x));
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    updateFromX(e.clientX);
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (dragging.current) updateFromX(e.clientX);
  }, [updateFromX]);

  const onMouseUp = useCallback(() => { dragging.current = false; }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) updateFromX(touch.clientX);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); setPosition((p) => clamp(p - 2)); }
    if (e.key === "ArrowRight") { e.preventDefault(); setPosition((p) => clamp(p + 2)); }
  };

  // Interior visualization panels using SVG/CSS gradients (no external images needed)
  return (
    <div
      ref={containerRef}
      className="relative select-none overflow-hidden"
      style={{ aspectRatio: aspect, cursor: "col-resize" }}
      onMouseDown={onMouseDown}
      onTouchMove={onTouchMove}
      onTouchStart={(e) => { const t = e.touches[0]; if (t) updateFromX(t.clientX); }}
      aria-label="Before and after interior comparison slider"
    >
      {/* AFTER panel (full width, behind) */}
      <div className="absolute inset-0">
        <AfterPanel />
        <div className="absolute bottom-4 right-4 z-10">
          <span className="arch-label arch-label--light bg-black/40 px-2 py-1">{afterLabel}</span>
        </div>
      </div>

      {/* BEFORE panel (clipped to left portion) */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <BeforePanel />
        <div className="absolute bottom-4 left-4 z-10">
          <span className="arch-label arch-label--light bg-black/40 px-2 py-1">{beforeLabel}</span>
        </div>
      </div>

      {/* Handle */}
      <div
        role="slider"
        aria-label="Comparison slider handle"
        aria-valuenow={Math.round(position)}
        aria-valuemin={5}
        aria-valuemax={95}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="absolute top-0 bottom-0 z-20 flex items-center justify-center"
        style={{
          left: `${position}%`,
          transform: "translateX(-50%)",
          cursor: "col-resize",
          outline: "none",
        }}
      >
        {/* Vertical line */}
        <div className="absolute top-0 bottom-0 w-px bg-white/60" />
        {/* Handle circle */}
        <div
          className="relative z-10 flex h-10 w-10 items-center justify-center shadow-lg"
          style={{ background: "var(--indigo)", border: "1px solid var(--indigo-strong)" }}
        >
          <svg width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
            <path d="M5 1L1 5L5 9" stroke="var(--bg-deep)" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M11 1L15 5L11 9" stroke="var(--bg-deep)" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}


/** Real "before" photo — raw interior space */
function BeforePanel() {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <img
        src={interiorBeforeImg}
        alt="Interior before — raw unfinished space"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ filter: "saturate(0.7) brightness(0.85)" }}
        draggable={false}
      />
      {/* Subtle cool-tone grade */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, rgba(23,26,61,0.2) 0%, transparent 60%)" }}
        aria-hidden="true"
      />
      {/* Subtle architectural annotation */}
      <div className="absolute top-3 left-3" aria-hidden="true">
        <span className="arch-label" style={{ color: "rgba(255,255,255,0.6)", background: "rgba(8,11,26,0.6)", padding: "2px 6px" }}>
          SECTION A—A
        </span>
      </div>
    </div>
  );
}

/** Real "after" photo — finished, furnished interior */
function AfterPanel() {
  return (
    <div className="w-full h-full relative overflow-hidden">
      <img
        src={interiorFinishedImg}
        alt="Interior after — finished furnished space"
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{ filter: "saturate(0.95) brightness(0.92)" }}
        draggable={false}
      />
      {/* Cool indigo tone overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse at 55% 40%, rgba(138,134,252,0.12) 0%, transparent 65%)" }}
        aria-hidden="true"
      />
    </div>
  );
}
