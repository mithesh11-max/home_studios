import { motion } from "framer-motion";

interface ArchitecturalMeasurementProps {
  label: string;
  value: string;
  orientation?: "horizontal" | "vertical";
  length?: number; // length of the line in pixels
  delay?: number;
  className?: string;
  color?: string;
}

export function ArchitecturalMeasurement({
  label,
  value,
  orientation = "horizontal",
  length = 120,
  delay = 0,
  className = "",
  color = "rgba(255,255,255,0.85)",
}: ArchitecturalMeasurementProps) {
  const isHorizontal = orientation === "horizontal";

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: delay } 
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: isHorizontal ? 4 : 0, x: isHorizontal ? 0 : -4 },
    visible: { 
      opacity: 1, 
      y: 0, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut", delay: delay + 0.4 } 
    }
  };

  return (
    <div 
      className={`absolute pointer-events-none flex ${
        isHorizontal ? "flex-col items-center" : "flex-col items-center"
      } ${className}`}
      style={{ color }}
    >
      <motion.div
        variants={textVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ margin: "-10% 0px -10% 0px" }} // Triggers slightly before scrolling out, reversible
        className="mb-1"
      >
        <span className="arch-label !text-[0.65rem] tracking-widest whitespace-nowrap" style={{ color }}>
          {label}
        </span>
      </motion.div>

      <div 
        className="relative flex items-center justify-center"
        style={{ 
          width: isHorizontal ? length : 1, 
          height: isHorizontal ? 1 : length 
        }}
      >
        <svg
          className="absolute overflow-visible"
          width={isHorizontal ? length : 2}
          height={isHorizontal ? 2 : length}
          viewBox={`0 0 ${isHorizontal ? length : 2} ${isHorizontal ? 2 : length}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Tick marks */}
          {isHorizontal ? (
            <>
              <motion.line x1="0" y1="-3" x2="0" y2="5" stroke={color} strokeWidth="1" variants={textVariants} initial="hidden" whileInView="visible" viewport={{ margin: "-10% 0px -10% 0px" }} />
              <motion.line x1={length} y1="-3" x2={length} y2="5" stroke={color} strokeWidth="1" variants={textVariants} initial="hidden" whileInView="visible" viewport={{ margin: "-10% 0px -10% 0px" }} />
            </>
          ) : (
            <>
              <motion.line x1="-3" y1="0" x2="5" y2="0" stroke={color} strokeWidth="1" variants={textVariants} initial="hidden" whileInView="visible" viewport={{ margin: "-10% 0px -10% 0px" }} />
              <motion.line x1="-3" y1={length} x2="5" y2={length} stroke={color} strokeWidth="1" variants={textVariants} initial="hidden" whileInView="visible" viewport={{ margin: "-10% 0px -10% 0px" }} />
            </>
          )}

          {/* Main line */}
          <motion.line
            x1={isHorizontal ? 0 : 1}
            y1={isHorizontal ? 1 : 0}
            x2={isHorizontal ? length : 1}
            y2={isHorizontal ? 1 : length}
            stroke={color}
            strokeWidth="1.5"
            strokeDasharray={isHorizontal ? "4 4" : "4 4"} // Dashed architectural line
            variants={lineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ margin: "-10% 0px -10% 0px" }}
          />
        </svg>
      </div>

      <motion.div
        variants={textVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ margin: "-10% 0px -10% 0px" }}
        className="mt-1"
      >
        <span className="font-display font-light text-[0.85rem] tracking-wide whitespace-nowrap" style={{ color }}>
          {value}
        </span>
      </motion.div>
    </div>
  );
}
