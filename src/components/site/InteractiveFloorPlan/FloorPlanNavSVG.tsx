import React, { useState } from "react";
import { ROOMS, ROOM_IDS, type RoomId } from "./roomData";

interface FloorPlanNavSVGProps {
  activeRoomId: RoomId | null;
  hoveredRoomId: RoomId | null;
  onSelectRoom: (roomId: RoomId | null) => void;
  onHoverRoom: (roomId: RoomId | null) => void;
}

export function FloorPlanNavSVG({
  activeRoomId,
  hoveredRoomId,
  onSelectRoom,
  onHoverRoom,
}: FloorPlanNavSVGProps) {
  const [focusRoomId, setFocusRoomId] = useState<RoomId | null>(null);

  const currentFocus = hoveredRoomId || focusRoomId || activeRoomId;

  return (
    <div className="relative w-full h-full flex flex-col justify-between select-none">
      {/* Blueprint Header HUD */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 font-mono text-[9px] tracking-wider text-white/60">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-indigo inline-block animate-pulse" />
          <span className="text-white uppercase font-medium">CAD INTERFACE / PLANAR SPEC</span>
          <span className="text-white/30">|</span>
          <span className="text-white/40">LEVEL 01 / GROUND</span>
        </div>
        <div className="flex items-center gap-3">
          <span>SCALE: 1:100 REF · 1:1 STUDIO</span>
          <span className="text-white/30">|</span>
          <span className="text-indigo">CLICK ROOM TO INSPECT</span>
        </div>
      </div>

      {/* SVG Blueprint Canvas */}
      <div className="relative flex-1 w-full flex items-center justify-center p-2 sm:p-4 overflow-hidden">
        <svg
          viewBox="0 0 800 560"
          className="w-full h-full max-h-[500px] object-contain drop-shadow-[0_12px_24px_rgba(8,11,26,0.6)]"
          aria-label="Interactive 2D architectural blueprint floor plan"
        >
          <defs>
            {/* Fine architectural drafting grid */}
            <pattern id="archGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(138, 134, 252, 0.07)"
                strokeWidth="0.5"
              />
            </pattern>

            {/* Subtle hatch pattern for active room */}
            <pattern id="archHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(138, 134, 252, 0.25)" strokeWidth="0.8" />
            </pattern>

            {/* Glow filter for highlighted room */}
            <filter id="roomGlow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#8A86FC" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Grid Background */}
          <rect x="20" y="20" width="760" height="520" fill="url(#archGrid)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Exterior Site Reference & Construction Guides */}
          <g opacity="0.3" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" strokeWidth="0.6">
            <line x1="40" y1="40" x2="760" y2="40" />
            <line x1="40" y1="520" x2="760" y2="520" />
            <line x1="40" y1="40" x2="40" y2="520" />
            <line x1="760" y1="40" x2="760" y2="520" />
          </g>

          {/* North Arrow Datum */}
          <g transform="translate(730, 80)" opacity="0.75">
            <circle cx="0" cy="0" r="16" fill="rgba(8,11,26,0.6)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
            <line x1="0" y1="12" x2="0" y2="-12" stroke="#8A86FC" strokeWidth="1.2" />
            <polygon points="0,-12 -4,-4 4,-4" fill="#8A86FC" />
            <text x="0" y="-16" textAnchor="middle" fill="#8A86FC" fontSize="8" fontFamily="monospace">N</text>
          </g>

          {/* Foyer / Entry Threshold Graphics (Non-selectable) */}
          <g opacity="0.5">
            <rect x="340" y="440" width="120" height="70" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
            <path d="M 380 510 A 40 40 0 0 0 420 470" fill="none" stroke="rgba(255,255,255,0.3)" strokeDasharray="2 2" strokeWidth="0.8" />
            <text x="400" y="480" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">MAIN ENTRY</text>
          </g>

          {/* ────────────────────────────────────────────────────────
              INTERACTIVE ROOM ZONES
              ──────────────────────────────────────────────────────── */}
          {ROOM_IDS.map((id) => {
            const room = ROOMS[id];
            const isSelected = activeRoomId === id;
            const isHovered = hoveredRoomId === id;
            const isFocused = focusRoomId === id;
            const isHighlighted = isSelected || isHovered || isFocused;
            const hasAnyActive = activeRoomId !== null || hoveredRoomId !== null;
            const isDimmed = hasAnyActive && !isHighlighted;

            return (
              <g
                key={id}
                role="button"
                tabIndex={0}
                aria-label={`${room.name}, ${room.dimensionsMetric}. ${room.description}`}
                aria-pressed={isSelected}
                className="cursor-pointer transition-all duration-300 outline-none"
                onClick={() => onSelectRoom(isSelected ? null : id)}
                onMouseEnter={() => onHoverRoom(id)}
                onMouseLeave={() => onHoverRoom(null)}
                onFocus={() => {
                  setFocusRoomId(id);
                  onHoverRoom(id);
                }}
                onBlur={() => {
                  setFocusRoomId(null);
                  onHoverRoom(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectRoom(isSelected ? null : id);
                  }
                }}
                style={{
                  opacity: isDimmed ? 0.4 : 1,
                  filter: isHighlighted ? "url(#roomGlow)" : "none",
                }}
              >
                {/* Room Floor Plane polygon */}
                <polygon
                  points={room.svg.polygon}
                  fill={
                    isSelected
                      ? "rgba(138, 134, 252, 0.22)"
                      : isHovered
                      ? "rgba(138, 134, 252, 0.14)"
                      : "rgba(16, 21, 43, 0.65)"
                  }
                  stroke={
                    isSelected
                      ? "#8A86FC"
                      : isHovered
                      ? "rgba(138, 134, 252, 0.85)"
                      : "rgba(255, 255, 255, 0.2)"
                  }
                  strokeWidth={isHighlighted ? 1.8 : 1}
                  className="transition-colors duration-200"
                />

                {/* Active architectural hatch pattern overlay */}
                {isSelected && (
                  <polygon
                    points={room.svg.polygon}
                    fill="url(#archHatch)"
                    pointerEvents="none"
                    opacity={0.7}
                  />
                )}

                {/* Specific Room Architectural Icons & Furniture Guides */}
                {id === "living" && (
                  <g opacity={isHighlighted ? 0.75 : 0.35} pointerEvents="none">
                    {/* Modular Sofa layout outline */}
                    <rect x="330" y="270" width="140" height="42" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white" />
                    <rect x="300" y="235" width="45" height="75" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white" />
                    {/* Coffee Table */}
                    <rect x="375" y="225" width="70" height="30" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white" />
                    {/* Area Rug */}
                    <rect x="290" y="200" width="220" height="135" fill="none" stroke="#8A86FC" strokeDasharray="3 3" strokeWidth="0.6" />
                  </g>
                )}

                {id === "kitchen" && (
                  <g opacity={isHighlighted ? 0.75 : 0.35} pointerEvents="none">
                    {/* Central Island Counter */}
                    <rect x="580" y="235" width="100" height="48" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white" />
                    {/* Bar Stools circles */}
                    <circle cx="600" cy="305" r="9" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white" />
                    <circle cx="630" cy="305" r="9" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white" />
                    <circle cx="660" cy="305" r="9" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white" />
                  </g>
                )}

                {id === "bedroom" && (
                  <g opacity={isHighlighted ? 0.75 : 0.35} pointerEvents="none">
                    {/* King Bed outline with headboard */}
                    <rect x="125" y="230" width="90" height="105" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white" />
                    <rect x="115" y="220" width="110" height="12" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white" />
                    {/* Side tables */}
                    <rect x="95" y="230" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-white" />
                    <rect x="223" y="230" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-white" />
                  </g>
                )}

                {id === "bathroom" && (
                  <g opacity={isHighlighted ? 0.75 : 0.35} pointerEvents="none">
                    {/* Shower enclosure */}
                    <rect x="95" y="385" width="60" height="55" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white" />
                    <line x1="95" y1="385" x2="155" y2="440" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 2" className="text-white" />
                    {/* Vanity */}
                    <rect x="175" y="385" width="50" height="25" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white" />
                  </g>
                )}

                {id === "balcony" && (
                  <g opacity={isHighlighted ? 0.75 : 0.35} pointerEvents="none">
                    {/* Railing mullions & decking lines */}
                    <line x1="260" y1="70" x2="540" y2="70" stroke="#8A86FC" strokeWidth="1.2" />
                    <line x1="270" y1="100" x2="530" y2="100" stroke="currentColor" strokeDasharray="3 3" strokeWidth="0.6" className="text-white" />
                    <line x1="270" y1="130" x2="530" y2="130" stroke="currentColor" strokeDasharray="3 3" strokeWidth="0.6" className="text-white" />
                  </g>
                )}

                {/* Room Identification Stamp */}
                <g pointerEvents="none">
                  {/* Room Index */}
                  <text
                    x={room.svg.labelPos[0]}
                    y={room.svg.labelPos[1] - 12}
                    textAnchor="middle"
                    fill={isHighlighted ? "#8A86FC" : "rgba(255,255,255,0.4)"}
                    fontSize="9"
                    fontFamily="monospace"
                    letterSpacing="1.5"
                    className="transition-colors duration-200"
                  >
                    {room.index}
                  </text>

                  {/* Room Name */}
                  <text
                    x={room.svg.labelPos[0]}
                    y={room.svg.labelPos[1] + 4}
                    textAnchor="middle"
                    fill={isHighlighted ? "#FFFFFF" : "rgba(255,255,255,0.85)"}
                    fontSize="13"
                    fontWeight={isHighlighted ? 600 : 400}
                    fontFamily="var(--font-display, Cormorant Garamond, serif)"
                    letterSpacing="0.5"
                    className="transition-colors duration-200"
                  >
                    {room.name.toUpperCase()}
                  </text>

                  {/* Room Dimensions Metric / Imperial */}
                  <text
                    x={room.svg.labelPos[0]}
                    y={room.svg.labelPos[1] + 18}
                    textAnchor="middle"
                    fill={isHighlighted ? "#8A86FC" : "rgba(255,255,255,0.45)"}
                    fontSize="8.5"
                    fontFamily="monospace"
                    className="transition-colors duration-200"
                  >
                    {room.dimensionsMetric}
                  </text>
                </g>

                {/* Subtle Measurement Callout Lines (Visible on Hover / Selection) */}
                {isHighlighted && (
                  <g pointerEvents="none" className="animate-fadeIn">
                    {room.svg.dimensionLines.map((dim, idx) => (
                      <g key={idx}>
                        {/* Dimension leader lines */}
                        <line
                          x1={dim.x1}
                          y1={dim.y1}
                          x2={dim.x2}
                          y2={dim.y2}
                          stroke="#8A86FC"
                          strokeWidth="1"
                        />
                        {/* Start tick */}
                        <line
                          x1={dim.align === "top" || dim.align === "bottom" ? dim.x1 : dim.x1 - 4}
                          y1={dim.align === "top" || dim.align === "bottom" ? dim.y1 - 4 : dim.y1}
                          x2={dim.align === "top" || dim.align === "bottom" ? dim.x1 : dim.x1 + 4}
                          y2={dim.align === "top" || dim.align === "bottom" ? dim.y1 + 4 : dim.y1}
                          stroke="#8A86FC"
                          strokeWidth="1"
                        />
                        {/* End tick */}
                        <line
                          x1={dim.align === "top" || dim.align === "bottom" ? dim.x2 : dim.x2 - 4}
                          y1={dim.align === "top" || dim.align === "bottom" ? dim.y2 - 4 : dim.y2}
                          x2={dim.align === "top" || dim.align === "bottom" ? dim.x2 : dim.x2 + 4}
                          y2={dim.align === "top" || dim.align === "bottom" ? dim.y2 + 4 : dim.y2}
                          stroke="#8A86FC"
                          strokeWidth="1"
                        />
                        {/* Dimension Text */}
                        <text
                          x={(dim.x1 + dim.x2) / 2}
                          y={
                            dim.align === "top"
                              ? dim.y1 - 6
                              : dim.align === "bottom"
                              ? dim.y1 + 12
                              : (dim.y1 + dim.y2) / 2 + 3
                          }
                          textAnchor={
                            dim.align === "left"
                              ? "end"
                              : dim.align === "right"
                              ? "start"
                              : "middle"
                          }
                          dx={dim.align === "left" ? -6 : dim.align === "right" ? 6 : 0}
                          fill="#8A86FC"
                          fontSize="8.5"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {dim.label}
                        </text>
                      </g>
                    ))}
                  </g>
                )}
              </g>
            );
          })}

          {/* Architectural Dimension String Bounds (Master boundary lines) */}
          <g opacity="0.3" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6">
            {/* North total span */}
            <line x1="80" y1="30" x2="720" y2="30" />
            <text x="400" y="24" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="monospace">
              TOTAL SPAN: 14.00 M (46'0")
            </text>
          </g>
        </svg>
      </div>

      {/* Blueprint Footer Datum Bar */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-white/10 font-mono text-[9px] tracking-wider text-white/50 gap-2">
        <div>
          <span>ACTIVE FOCUS: </span>
          <span className="text-white font-medium">
            {currentFocus ? ROOMS[currentFocus].name.toUpperCase() : "MASTER PLAN OVERVIEW"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>COORDINATES: BENGALURU STUDIO</span>
          <span className="text-white/20">/</span>
          <span>1:1 SCALE REVERSIBLE</span>
        </div>
      </div>
    </div>
  );
}

export default FloorPlanNavSVG;
