import { Link } from "@tanstack/react-router";
import { ROOMS, ROOM_IDS, MASTER_PLAN_INFO, type RoomId } from "./roomData";

interface RoomSpecPanelProps {
  activeRoomId: RoomId | null;
  hoveredRoomId: RoomId | null;
  onSelectRoom: (roomId: RoomId | null) => void;
}

export function RoomSpecPanel({
  activeRoomId,
  hoveredRoomId,
  onSelectRoom,
}: RoomSpecPanelProps) {
  const currentId = hoveredRoomId || activeRoomId;
  const room = currentId ? ROOMS[currentId] : null;

  return (
    <div className="flex flex-col justify-between h-full bg-[#0c1024] border border-white/12 p-6 sm:p-8">
      {/* Top: Quick Room Selector Buttons */}
      <div>
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <span className="arch-label arch-label--accent">ARCHITECTURAL SPECIFICATION</span>
          <span className="font-mono text-[9px] text-white/50 tracking-wider">
            {room ? room.index : "OVERVIEW"}
          </span>
        </div>

        {/* Room Navigation Pill Selector */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-1.5 mb-6">
          <button
            type="button"
            onClick={() => onSelectRoom(null)}
            className={`min-h-[42px] sm:min-h-[34px] px-2.5 py-2 sm:py-1.5 font-mono text-[10px] sm:text-[9px] tracking-wider uppercase border transition-all text-center touch-manipulation active:scale-[0.98] ${
              activeRoomId === null
                ? "bg-indigo text-deep font-bold border-indigo"
                : "bg-deep/80 text-white/70 border-white/15 hover:border-white/40 hover:text-white"
            }`}
          >
            ALL
          </button>
          {ROOM_IDS.map((id) => {
            const r = ROOMS[id];
            const isSelected = activeRoomId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectRoom(isSelected ? null : id)}
                className={`min-h-[42px] sm:min-h-[34px] px-2 py-2 sm:py-1.5 font-mono text-[10px] sm:text-[9px] tracking-wider uppercase border transition-all truncate text-center touch-manipulation active:scale-[0.98] ${
                  isSelected
                    ? "bg-indigo text-deep font-bold border-indigo"
                    : "bg-deep/80 text-white/70 border-white/15 hover:border-white/40 hover:text-white"
                }`}
                title={r.name}
              >
                {r.name.split(" ")[0]}
              </button>
            );
          })}
        </div>

        {/* Room Header */}
        <div className="mb-6">
          <p className="font-mono text-[10px] tracking-widest text-indigo uppercase mb-1.5">
            {room ? room.subtitle : MASTER_PLAN_INFO.subtitle}
          </p>
          <h3 className="font-display text-white text-[clamp(1.6rem,2.6vw,2.2rem)] font-light leading-tight">
            {room ? room.name : MASTER_PLAN_INFO.name}
          </h3>
          <p className="mt-2 text-stone text-[0.88rem] leading-relaxed max-w-[46ch]">
            {room ? room.description : MASTER_PLAN_INFO.description}
          </p>
        </div>

        {/* Primary Measurements Grid */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-deep/90 border border-white/10 mb-6">
          <div>
            <p className="font-mono text-[9px] tracking-wider text-white/50 uppercase">Dimensions (Metric)</p>
            <p className="font-mono text-[13px] text-indigo font-medium mt-0.5">
              {room ? room.dimensionsMetric : MASTER_PLAN_INFO.dimensionsMetric}
            </p>
          </div>
          <div>
            <p className="font-mono text-[9px] tracking-wider text-white/50 uppercase">Dimensions (Imperial)</p>
            <p className="font-mono text-[13px] text-white font-medium mt-0.5">
              {room ? room.dimensionsImperial : MASTER_PLAN_INFO.dimensionsImperial}
            </p>
          </div>
          <div className="pt-2 border-t border-white/10">
            <p className="font-mono text-[9px] tracking-wider text-white/50 uppercase">Usable Floor Area</p>
            <p className="font-mono text-[12px] text-white/90 mt-0.5">
              {room ? `${room.areaMetric}  (${room.areaImperial})` : `${MASTER_PLAN_INFO.areaMetric}  (${MASTER_PLAN_INFO.areaImperial})`}
            </p>
          </div>
          <div className="pt-2 border-t border-white/10">
            <p className="font-mono text-[9px] tracking-wider text-white/50 uppercase">Clearance Height</p>
            <p className="font-mono text-[12px] text-white/90 mt-0.5">
              {room ? room.clearance : MASTER_PLAN_INFO.clearance}
            </p>
          </div>
        </div>

        {/* Engineering Specifications List */}
        {room && (
          <div className="space-y-2 mb-6">
            <p className="font-mono text-[9px] tracking-widest uppercase text-white/50 mb-2">
              TECHNICAL CLEARANCES & SPECIFICATION
            </p>
            {room.specifications.map((spec) => (
              <div
                key={spec.label}
                className="flex items-baseline justify-between py-1.5 border-b border-white/5 text-[0.84rem]"
              >
                <span className="text-white/60">{spec.label}</span>
                <span className="font-mono text-[11px] text-white/90 text-right">{spec.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons: Reversible Overview & Session Booking */}
      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {activeRoomId !== null && (
          <button
            type="button"
            onClick={() => onSelectRoom(null)}
            className="arch-btn arch-btn--outline text-center justify-center py-2.5 px-4 text-[10px] font-mono tracking-widest flex-1"
          >
            ← RETURN TO OVERVIEW
          </button>
        )}

        <Link
          to="/contact"
          className="arch-btn arch-btn--primary text-center justify-center py-2.5 px-5 text-[10px] font-mono tracking-widest flex-1"
        >
          TEST ROOM AT 1:1 SCALE <span className="arch-btn-arrow">→</span>
        </Link>
      </div>
    </div>
  );
}

export default RoomSpecPanel;
