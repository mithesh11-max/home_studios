import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PACKAGES, PACKAGE_ROWS } from "@/lib/site-data";
import { TiltCard } from "@/components/site/TextReveal";

export function PackageSelector() {
  const [active, setActive] = useState(2); // Default: Luxury

  return (
    <div>
      {/* Horizontal tab strip */}
      <div
        className="flex overflow-x-auto"
        style={{ borderBottom: "1px solid var(--rule)" }}
        role="tablist"
        aria-label="Construction packages"
      >
        {PACKAGES.map((pkg, i) => (
          <button
            key={pkg.name}
            role="tab"
            aria-selected={active === i}
            aria-controls={`pkg-panel-${i}`}
            onClick={() => setActive(i)}
            className="flex-shrink-0 flex-1 min-w-[100px] py-5 px-4 text-left transition-all"
            style={{
              borderBottom: active === i ? "2px solid var(--indigo)" : "2px solid transparent",
              marginBottom: "-1px",
              background: active === i ? "var(--surface)" : "transparent",
            }}
          >
            <span className="block font-sans font-600 text-[0.82rem]" style={{ color: "var(--text-primary)" }}>{pkg.name}</span>
            <span
              className="block font-display text-[1.1rem] font-light mt-0.5"
              style={{ color: active === i ? "var(--indigo)" : "var(--text-secondary)" }}
            >
              {pkg.priceLabel}
            </span>
            <span className="arch-label" style={{ color: "var(--text-muted)" }}>/ sq.ft</span>
          </button>
        ))}
      </div>

      {/* Specification panel */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          id={`pkg-panel-${active}`}
          role="tabpanel"
          aria-label={`${PACKAGES[active]?.name} specifications`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="pt-8"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PACKAGE_ROWS.map((row) => (
              <TiltCard key={row.category} className="arch-pkg-card" maxTilt={5}>
                <p className="arch-label arch-label--accent mb-2">{row.category}</p>
                <p className="text-[0.88rem] leading-relaxed font-sans" style={{ color: "var(--text-primary)" }}>{row.values[active]}</p>
              </TiltCard>
            ))}
          </div>
          <p className="mt-8 text-[0.8rem] leading-relaxed border-t pt-5" style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>
            Exact specifications, brands and quantities are confirmed in your written quote before construction begins.
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
