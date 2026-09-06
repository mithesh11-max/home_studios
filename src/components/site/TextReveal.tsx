import { useRef, type ReactNode } from "react";
import { motion, useInView, useScroll, useTransform, useReducedMotion } from "framer-motion";

// ---------------------------------------------------------------------------
// Reveal — clip-path wipe from bottom for headlines
// ---------------------------------------------------------------------------

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function Reveal({ children, className = "", delay = 0, once = true }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-15% 0px" });

  return (
    <div ref={ref} style={{ overflow: "hidden" }} className={className}>
      <motion.div
        initial={{ clipPath: "inset(100% 0 0 0)" }}
        animate={inView ? { clipPath: "inset(0% 0 0 0)" } : {}}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TextReveal — per-line masked clip-path headline reveal
// ---------------------------------------------------------------------------

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  splitLines?: boolean;
}

export function TextReveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "h1",
  splitLines = true,
}: TextRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  if (!splitLines) {
    return (
      <Tag ref={ref as React.RefObject<HTMLHeadingElement & HTMLParagraphElement>} className={className}>
        <motion.span
          style={{ display: "block", overflow: "hidden" }}
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={inView ? { clipPath: "inset(0 0 0% 0)" } : {}}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.span>
      </Tag>
    );
  }

  const lines = children.split("\n").filter(Boolean);

  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement & HTMLParagraphElement>} className={className}>
      {lines.map((line, i) => (
        <span key={i} style={{ display: "block", overflow: "hidden" }}>
          <motion.span
            style={{ display: "block" }}
            initial={{ y: "110%", opacity: 0 }}
            animate={inView ? { y: "0%", opacity: 1 } : {}}
            transition={{
              duration: 1.0,
              delay: delay + i * 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

// ---------------------------------------------------------------------------
// FadeUp — opacity + 20px rise for body copy and small elements
// ---------------------------------------------------------------------------

export function FadeUp({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// StaggerGroup — wraps children with staggered entrance (0.06s apart)
// ---------------------------------------------------------------------------

export function StaggerGroup({
  children,
  className = "",
  delay = 0,
  staggerDelay = 0.06,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
        hidden: {},
      }}
    >
      {children}
    </motion.div>
  );
}

// Each child in a StaggerGroup should use this
export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Parallax — subtle ±60px parallax on images and annotations
// ---------------------------------------------------------------------------

export function Parallax({
  children,
  className = "",
  speed = 0.3,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-60 * speed, 60 * speed]);

  // Disable on mobile and reduced motion
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={ref} className={className} style={{ overflow: "hidden" }}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TiltCard — CSS 3D tilt following cursor up to 6°, spring return
// ---------------------------------------------------------------------------

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

export function TiltCard({
  children,
  className = "",
  maxTilt = 6,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    el.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    el.style.transition = "transform 0.08s ease-out";
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: "preserve-3d",
        transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)",
        transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {children}
    </div>
  );
}

