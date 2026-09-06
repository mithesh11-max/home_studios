import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ProcessStep {
  num: string;
  title: string;
  description: string;
}

interface ProcessTimelineProps {
  steps: ProcessStep[];
}

export function ProcessTimeline({ steps }: ProcessTimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <div ref={ref}>
      {/* Desktop: horizontal */}
      <div className="hidden lg:grid" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: "0" }}>
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="pr-8 relative"
            style={{ borderLeft: i === 0 ? "none" : "1px solid var(--border)", paddingLeft: i === 0 ? 0 : "2rem" }}
          >
            <span className="arch-label arch-label--accent">{step.num}</span>
            <h3 className="font-display text-[clamp(1.3rem,2vw,1.7rem)] font-light mt-3 mb-3 leading-tight" style={{ color: "var(--text-primary)" }}>
              {step.title}
            </h3>
            <p className="text-[0.88rem] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{step.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="flex flex-col gap-0 lg:hidden">
        {steps.map((step, i) => (
          <motion.div
            key={step.num}
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-5 py-6"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex-shrink-0 pt-1">
              <span className="arch-label arch-label--accent">{step.num}</span>
            </div>
            <div>
              <h3 className="font-display text-[1.25rem] font-light mb-2 leading-tight" style={{ color: "var(--text-primary)" }}>
                {step.title}
              </h3>
              <p className="text-[0.88rem] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
