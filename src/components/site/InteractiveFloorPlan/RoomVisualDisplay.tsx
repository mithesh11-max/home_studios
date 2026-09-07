import { motion, AnimatePresence } from "framer-motion";
import { ROOMS, MASTER_PLAN_INFO, type RoomId } from "./roomData";

interface RoomVisualDisplayProps {
  activeRoomId: RoomId | null;
  hoveredRoomId: RoomId | null;
}

export function RoomVisualDisplay({
  activeRoomId,
  hoveredRoomId,
}: RoomVisualDisplayProps) {
  const currentId = hoveredRoomId || activeRoomId;
  const currentRoom = currentId ? ROOMS[currentId] : null;

  const currentImage = currentRoom ? currentRoom.image : MASTER_PLAN_INFO.image;
  const currentCaption = currentRoom
    ? currentRoom.imageCaption
    : MASTER_PLAN_INFO.imageCaption;
  const currentTitle = currentRoom ? currentRoom.name : MASTER_PLAN_INFO.name;
  const currentTag = currentRoom ? currentRoom.tag : "MASTER PLAN";
  const currentDimensions = currentRoom
    ? `${currentRoom.dimensionsMetric} · ${currentRoom.dimensionsImperial}`
    : `${MASTER_PLAN_INFO.dimensionsMetric} · ${MASTER_PLAN_INFO.dimensionsImperial}`;

  return (
    <div className="relative w-full h-full min-h-[260px] sm:min-h-[320px] bg-ink border border-white/12 overflow-hidden flex flex-col justify-between">
      {/* Visual Image Layer with Smooth Cross-Fade */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentId || "overview"}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-full"
          >
            <img
              src={currentImage}
              alt={currentTitle}
              className="w-full h-full object-cover object-center"
              style={{ filter: "contrast(1.04) brightness(0.88)" }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(8,11,26,0.6) 0%, rgba(8,11,26,0.1) 40%, rgba(8,11,26,0.85) 100%)",
          }}
          aria-hidden="true"
        />

        {/* Architectural Grid Overlay */}
        <div className="arch-grid-dark absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />
      </div>

      {/* Top Header Datum Bar */}
      <div className="relative z-10 p-4 sm:p-5 flex items-start justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-deep/85 border border-white/15 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 bg-indigo inline-block" />
          <span className="font-mono text-[9px] tracking-widest text-indigo font-medium">
            {currentTag}
          </span>
        </div>

        <span className="font-mono text-[9px] tracking-wider text-white/70 px-2.5 py-1 bg-deep/85 border border-white/15 backdrop-blur-sm">
          {currentDimensions}
        </span>
      </div>

      {/* Bottom Information Caption */}
      <div className="relative z-10 p-4 sm:p-5 bg-gradient-to-t from-deep via-deep/80 to-transparent pointer-events-none">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-mono text-[10px] tracking-widest text-indigo">
            {currentRoom ? currentRoom.index : "00 / 00"}
          </span>
          <h4 className="font-display text-white text-[clamp(1.2rem,2.2vw,1.5rem)] font-light">
            {currentTitle}
          </h4>
        </div>
        <p className="text-white/75 text-[0.82rem] sm:text-[0.85rem] leading-relaxed max-w-[48ch]">
          {currentCaption}
        </p>
      </div>

      {/* Architectural Corner Alignment Marks */}
      <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-white/30 pointer-events-none" />
      <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-white/30 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-white/30 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-white/30 pointer-events-none" />
    </div>
  );
}

export default RoomVisualDisplay;
