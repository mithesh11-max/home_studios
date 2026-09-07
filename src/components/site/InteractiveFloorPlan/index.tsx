import { useState, useEffect, lazy, Suspense } from "react";
import { useReducedMotion } from "framer-motion";
import { FloorPlanNavSVG } from "./FloorPlanNavSVG";
import { RoomSpecPanel } from "./RoomSpecPanel";
import { RoomVisualDisplay } from "./RoomVisualDisplay";
import { type RoomId } from "./roomData";

// Lazy-load the 3D Three.js scene
const LazyFloorPlanScene3D = lazy(() => import("./FloorPlanScene3D"));

function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

interface InteractiveFloorPlanProps {
  eyebrow?: string;
  title?: string;
  description?: string;
}

export function InteractiveFloorPlan({
  eyebrow = "02 / INTERACTIVE SPATIAL EXPLORER",
  title = "The floor plan as an architectural interface.",
  description = "Select any room to test clearances, examine natural daylight paths, and guide the 3D camera into the space before your 1:1 studio walkthrough.",
}: InteractiveFloorPlanProps) {
  const [activeRoomId, setActiveRoomId] = useState<RoomId | null>("living"); // Default to living room for immediate visual interest
  const [hoveredRoomId, setHoveredRoomId] = useState<RoomId | null>(null);
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setWebglSupported(isWebGLAvailable());
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelectRoom = (id: RoomId | null) => {
    setActiveRoomId(id);
  };

  const handleHoverRoom = (id: RoomId | null) => {
    setHoveredRoomId(id);
  };

  const canUse3D = webglSupported && !prefersReducedMotion;

  return (
    <section
      className="py-16 lg:py-24 bg-paper"
      style={{ borderTop: "1px solid var(--rule)" }}
      aria-label="Interactive Architectural Floor Plan Experience"
    >
      <div className="arch-container">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-10 sm:mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="arch-label arch-label--accent">{eyebrow}</span>
              <span className="inline-block w-2 h-px bg-indigo/40" />
              <span className="arch-label text-stone hidden sm:inline">1:1 SCALE VALIDATION</span>
            </div>
            <h2
              className="font-display text-ink leading-none mb-3"
              style={{ fontSize: "var(--text-display-sm)" }}
            >
              {title}
            </h2>
            <p className="text-stone text-[0.93rem] leading-relaxed max-w-[50ch]">
              {description}
            </p>
          </div>

          {/* Viewport Mode Switcher: 2D Blueprint vs 3D Spatial Camera */}
          {canUse3D && (
            <div className="flex items-center p-1 bg-deep/90 border border-white/15 self-start lg:self-auto font-mono text-[10px] tracking-widest uppercase">
              <button
                type="button"
                onClick={() => setViewMode("2d")}
                className={`px-3 py-1.5 transition-colors ${
                  viewMode === "2d"
                    ? "bg-indigo text-deep font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                2D BLUEPRINT
              </button>
              <button
                type="button"
                onClick={() => setViewMode("3d")}
                className={`px-3 py-1.5 transition-colors flex items-center gap-1.5 ${
                  viewMode === "3d"
                    ? "bg-indigo text-deep font-bold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <span>3D CAMERA</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              </button>
            </div>
          )}
        </div>

        {/* ── Main Interactive Canvas & Spec Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          {/* Left Column (7 cols): Interactive Blueprint Interface OR 3D Camera Scene */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/3] bg-deep border border-white/15 overflow-hidden p-3 sm:p-5 flex flex-col justify-between">
              {viewMode === "2d" || !canUse3D ? (
                <FloorPlanNavSVG
                  activeRoomId={activeRoomId}
                  hoveredRoomId={hoveredRoomId}
                  onSelectRoom={handleSelectRoom}
                  onHoverRoom={handleHoverRoom}
                />
              ) : (
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center bg-deep">
                      <span className="arch-label text-stone font-mono text-[10px] tracking-widest">
                        CONNECTING 3D CAMERA CONTROLLER...
                      </span>
                    </div>
                  }
                >
                  <LazyFloorPlanScene3D
                    activeRoomId={activeRoomId}
                    hoveredRoomId={hoveredRoomId}
                    onSelectRoom={handleSelectRoom}
                    isMobile={isMobile}
                  />
                </Suspense>
              )}
            </div>

            {/* Bottom Caption for Floor Plan Interface */}
            <div className="mt-3 flex items-center justify-between text-stone font-mono text-[10px] tracking-wider">
              <span>
                CURRENT MODE: {viewMode === "3d" && canUse3D ? "3D DYNAMIC CAMERA FLYTHROUGH" : "2D CAD PLANAR SPECIFICATION"}
              </span>
              <span className="text-indigo">
                {activeRoomId ? "CLICK TO DESELECT" : "TAP ROOM TO NAVIGATE"}
              </span>
            </div>
          </div>

          {/* Right Column (5 cols): Synchronized Room Visual & Architectural Specification Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Visual Photographic Preview of Room */}
            <div className="flex-shrink-0">
              <RoomVisualDisplay
                activeRoomId={activeRoomId}
                hoveredRoomId={hoveredRoomId}
              />
            </div>

            {/* Architectural Specification & Measurements Panel */}
            <div className="flex-1">
              <RoomSpecPanel
                activeRoomId={activeRoomId}
                hoveredRoomId={hoveredRoomId}
                onSelectRoom={handleSelectRoom}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default InteractiveFloorPlan;
