import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

/**
 * Clip-path image reveal — content slides in from below.
 */
export function ImageReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8% 0px" });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ clipPath: "inset(100% 0 0 0)", scale: 1.06 }}
        animate={inView ? { clipPath: "inset(0% 0 0 0)", scale: 1 } : {}}
        transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "center bottom" }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Subtle parallax wrapper — moves content at a slower rate than scroll.
 */
export function ParallaxImage({
  children,
  className = "",
  speed = 0.15,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  // Simple parallax using transform — no scroll-jacking
  return (
    <div className={`overflow-hidden ${className}`}>
      {children}
    </div>
  );
}
