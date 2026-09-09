import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { PACKAGES, PACKAGE_ROWS, type ConstructionPackage } from "@/lib/site-data";
import { useAppointment } from "@/lib/appointment-context";
import { EASE_ARCH_SMOOTH } from "@/lib/motion";

const TIER_NUMS = ["01", "02", "03", "04", "05"];
const TIER_DESCRIPTIONS = [
  "Standard engineered specification for cost-conscious, reliable residential construction.",
  "Upgraded specifications with enhanced fixtures, premium tiles, and reinforced concrete detailing.",
  "Our most requested mid-tier: modular-ready kitchen, branded CP fittings, and designer doors.",
  "High-performance residential package with large-format tiles, premium UPVC glazing, and extended storage.",
  "Turnkey designer specification: bespoke joinery, home automation wiring, and architectural finishes.",
];

export function PackageSelector() {
  const [selectedTier, setSelectedTier] = useState<number>(2); // Default to Luxury (index 2)
  const [viewMode, setViewMode] = useState<"focused" | "table">("focused");
  const [builtUpArea, setBuiltUpArea] = useState<number>(2400); // 2400 sq.ft default
  const { open } = useAppointment();
  const prefersReducedMotion = useReducedMotion();

  const activePackage = PACKAGES[selectedTier];
  const activeRateNum = parseInt(activePackage.priceLabel.replace(/[^0-9]/g, ""), 10);
  const estimatedCost = Math.round((activeRateNum * builtUpArea) / 100000 * 100) / 100; // In Lakhs

  return (
    <section className="py-12 lg:py-20 bg-paper" aria-label="Construction packages comparison">
      <div className="arch-container">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-8 sm:mb-10 pb-6 border-b border-rule">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="arch-label arch-label--accent">02 / SPECIFICATION MATRIX</span>
              <span className="w-2 h-px bg-rule-dark" aria-hidden="true" />
              <span className="arch-label text-stone">FIVE FIXED TIERS</span>
            </div>
            <h2
              className="font-display text-ink leading-none mb-3"
              style={{ fontSize: "var(--text-display-sm)" }}
            >
              Choose your construction tier.
            </h2>
            <p className="text-stone text-[0.92rem] leading-relaxed max-w-[46ch]">
              Every tier is backed by a written Bill of Quantities. Select a package to inspect exact materials, brand specifications, and calculate baseline estimates.
            </p>
          </div>

          {/* View Mode Switcher (Desktop) */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-surface border border-rule self-end lg:self-auto">
            <button
              onClick={() => setViewMode("focused")}
              className={`px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors ${
                viewMode === "focused" ? "bg-ink text-white font-medium shadow-sm" : "text-stone hover:text-ink"
              }`}
              data-interactive
            >
              TIER FOCUS
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-colors ${
                viewMode === "table" ? "bg-ink text-white font-medium shadow-sm" : "text-stone hover:text-ink"
              }`}
              data-interactive
            >
              FULL COMPARISON
            </button>
          </div>
        </div>

        {/* ── Active Tier Track (Segmented Architectural Bar) ── */}
        <div className="mb-8 overflow-x-auto pb-2 scrollbar-none" role="tablist" aria-label="Construction Tiers">
          <div className="grid grid-cols-5 min-w-[620px] border border-rule divide-x divide-rule bg-surface">
            {PACKAGES.map((pkg, idx) => {
              const isSelected = selectedTier === idx;
              return (
                <button
                  key={pkg.name}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedTier(idx)}
                  className={`relative p-3.5 sm:p-4 text-left transition-all duration-200 outline-none select-none ${
                    isSelected ? "bg-white shadow-sm" : "hover:bg-white/40"
                  }`}
                  data-interactive
                  data-cursor="view"
                >
                  {/* Top indicator bar for active tier */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-package-indicator"
                      className="absolute top-0 inset-x-0 h-0.5 bg-indigo"
                      transition={{ duration: 0.25, ease: EASE_ARCH_SMOOTH }}
                    />
                  )}

                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[9px] tracking-widest text-stone">
                      {TIER_NUMS[idx]}
                    </span>
                    {pkg.highlight && (
                      <span className="px-1.5 py-0.2 bg-indigo/15 text-indigo text-[8px] font-mono tracking-wider font-semibold">
                        POPULAR
                      </span>
                    )}
                  </div>

                  <div className="font-display text-[1.15rem] sm:text-[1.35rem] font-light text-ink leading-tight">
                    {pkg.name}
                  </div>

                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="font-mono text-[12px] sm:text-[13px] font-medium text-ink">
                      {pkg.priceLabel}
                    </span>
                    <span className="font-mono text-[9px] text-stone">/sq.ft</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Built-Up Area & Baseline Cost Estimator HUD ── */}
        <div className="mb-10 p-5 sm:p-6 bg-surface border border-rule grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6 items-center">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] tracking-widest uppercase text-stone">
                BUILT-UP AREA ESTIMATOR
              </span>
              <span className="font-mono text-[12px] font-semibold text-ink">
                {builtUpArea.toLocaleString()} SQ.FT
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="6000"
              step="100"
              value={builtUpArea}
              onChange={(e) => setBuiltUpArea(Number(e.target.value))}
              className="w-full accent-indigo cursor-pointer h-1.5 bg-rule rounded-none appearance-none"
              aria-label="Built up area in square feet"
            />
            <div className="flex justify-between text-[9px] font-mono text-stone mt-1.5">
              <span>1,000 sq.ft (Single Floor)</span>
              <span>2,400 sq.ft (30×40 G+1)</span>
              <span>4,000 sq.ft (30×50 G+2)</span>
              <span>6,000 sq.ft</span>
            </div>
          </div>

          <div className="p-4 bg-white border border-rule flex items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[9px] tracking-widest text-stone uppercase block mb-0.5">
                ESTIMATED BASE BUILD ({activePackage.name.toUpperCase()})
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[1.65rem] sm:text-[1.85rem] font-light text-ink leading-none">
                  ₹{estimatedCost.toFixed(2)}
                </span>
                <span className="font-mono text-[11px] font-medium text-stone">Lakhs*</span>
              </div>
            </div>

            <button
              onClick={() => open()}
              className="arch-btn arch-btn--primary flex-shrink-0 text-[11px] py-2 px-3"
              data-interactive
            >
              BOOK ESTIMATE <span className="arch-btn-arrow">→</span>
            </button>
          </div>
        </div>

        {/* ── View Mode: Focused Tier Inspection ── */}
        {viewMode === "focused" ? (
          <div className="bg-white border border-rule p-6 sm:p-8 shadow-sm">
            {/* Tier Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-6 border-b border-rule">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-[11px] tracking-widest text-indigo font-semibold">
                    TIER {TIER_NUMS[selectedTier]} // {activePackage.name.toUpperCase()} SPECIFICATION
                  </span>
                  {activePackage.highlight && (
                    <span className="px-2 py-0.5 bg-indigo/15 text-indigo text-[9px] font-mono tracking-widest font-semibold">
                      MOST RECOMMENDED
                    </span>
                  )}
                </div>
                <p className="text-stone text-[0.88rem] max-w-[54ch]">
                  {TIER_DESCRIPTIONS[selectedTier]}
                </p>
              </div>

              <div className="flex items-baseline gap-2 self-start sm:self-auto bg-surface px-4 py-2 border border-rule">
                <span className="font-display text-[1.75rem] font-light text-ink leading-none">
                  {activePackage.priceLabel}
                </span>
                <span className="font-mono text-[10px] text-stone">/ sq.ft + GST</span>
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {PACKAGE_ROWS.map((row, rIdx) => {
                const specValue = row.values[selectedTier];
                return (
                  <div
                    key={row.category}
                    className="p-4 bg-surface/60 border border-rule flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[9px] tracking-widest uppercase text-stone">
                          0{rIdx + 1} / {row.category}
                        </span>
                      </div>
                      <p className="text-ink text-[0.88rem] font-medium leading-snug">
                        {specValue}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="mt-8 pt-6 border-t border-rule flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-stone text-[0.82rem]">
                *Estimates include structural work, masonry, finishing & amenities per written sheet. Soil-specific excavation & approval fees calculated separately.
              </p>
              <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
                <Link
                  to="/contact"
                  className="arch-btn arch-btn--outline flex-1 sm:flex-initial text-center justify-center"
                >
                  REQUEST DETAILED BOQ
                </Link>
                <button
                  onClick={() => open()}
                  className="arch-btn arch-btn--primary flex-1 sm:flex-initial justify-center"
                  data-interactive
                >
                  CONSULT AN ENGINEER <span className="arch-btn-arrow">→</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── View Mode: Full Side-by-Side Comparison Matrix ── */
          <div className="overflow-x-auto border border-rule bg-white shadow-sm">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-rule bg-surface">
                  <th className="p-4 font-mono text-[10px] tracking-widest uppercase text-stone w-[180px]">
                    CATEGORY
                  </th>
                  {PACKAGES.map((pkg, i) => (
                    <th
                      key={pkg.name}
                      onClick={() => setSelectedTier(i)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedTier === i ? "bg-indigo/10 border-x border-indigo/40" : "hover:bg-white/60"
                      }`}
                    >
                      <div className="font-mono text-[9px] text-stone mb-0.5">{TIER_NUMS[i]}</div>
                      <div className="font-display text-[1.15rem] font-light text-ink leading-tight">
                        {pkg.name}
                      </div>
                      <div className="font-mono text-[11px] text-indigo font-medium mt-1">
                        {pkg.priceLabel}
                        <span className="text-[8px] text-stone">/sq.ft</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-rule text-[0.84rem]">
                {PACKAGE_ROWS.map((row, rIdx) => (
                  <tr key={row.category} className={rIdx % 2 === 0 ? "bg-white" : "bg-surface/30"}>
                    <td className="p-4 font-mono text-[10px] tracking-wider uppercase text-ink/75 font-semibold bg-surface/80 border-r border-rule">
                      {row.category}
                    </td>
                    {row.values.map((val, colIdx) => (
                      <td
                        key={colIdx}
                        onClick={() => setSelectedTier(colIdx)}
                        className={`p-4 transition-colors cursor-pointer leading-snug ${
                          selectedTier === colIdx
                            ? "bg-indigo/5 text-ink font-medium border-x border-indigo/40"
                            : "text-stone"
                        }`}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default PackageSelector;
