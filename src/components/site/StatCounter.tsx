import { useEffect, useRef, useState } from "react";

interface StatCounterProps {
  value: number;
  suffix: string;
  label: string;
  duration?: number;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function StatCounter({ value, suffix, label, duration = 1600 }: StatCounterProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    let frame: number;
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(easeOutCubic(progress) * value));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [started, value, duration]);

  return (
    <div ref={ref} className="text-center">
      <div className="arch-stat-number text-white tabular-nums">
        {count.toLocaleString("en-IN")}<span style={{ color: "var(--highlight)" }}>{suffix}</span>
      </div>
      <p className="arch-label mt-3" style={{ color: "var(--text-muted)" }}>{label}</p>
    </div>
  );
}
