import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { PACKAGES, PACKAGE_ROWS, type ConstructionPackage } from "@/lib/site-data";
import { useAppointment } from "@/lib/appointment-context";
import { EASE_ARCH_SMOOTH } from "@/lib/motion";

const TIER_NUMS = ["01", "02", "03", "04", "05"];
const TIER_DESCRIPTIONS = [
  "Standard engineered specification for cost-conscious, reliable residential construction with verified structural RCC.",
  "Upgraded specifications with enhanced fixtures, premium tiles, reinforced concrete detailing, and branded plumbing.",
  "Our most requested architect-specified tier: modular-ready kitchen, branded CP fittings, designer doors, and enhanced electricals.",
  "High-performance residential package featuring large-format tiles, premium UPVC glazing, extended storage, and textured finishes.",
  "Turnkey designer masterpiece: full bespoke joinery, home-automation-ready infrastructure, and architectural exterior coatings.",
];

export function PackageSelector() {
  const [selectedTier, setSelectedTier] = useState<number>(2); // Default to Luxury (index 2)
  const [viewMode, setViewMode] = useState<"focused" | "table">("focused");
  const { open } = useAppointment();
  const prefersReducedMotion = useReducedMotion();

  const activePackage = PACKAGES[selectedTier];

  return (
    <section
      className="py-14 lg:py-22 bg-[#203C7F] text-white relative overflow-hidden"
      aria-label="Construction packages specification comparison"
    >
      {/* Subtle drafting grid overlay */}
      <div className="arch-grid-dark absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />

      <div className="relative arch-container">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-5 mb-10 pb-6 border-b border-white/12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="arch-label arch-label--accent">02 / SPECIFICATION MATRIX</span>
              <span className="w-2 h-px bg-white/20" aria-hidden="true" />
              <span className="arch-label text-white/60">FIVE FIXED TIERS</span>
            </div>
            <h2
              className="font-display text-white leading-tight mb-3"
              style={{ fontSize: "clamp(1.85rem, 3.2vw, 2.6rem)" }}
            >
              Five packages. Zero verbal substitutions.
            </h2>
            <p className="text-white/70 text-[0.93rem] leading-relaxed max-w-[50ch]">
              Every tier is backed by a locked Bill of Quantities with named brand specifications. Select any tier below to inspect exact materials and engineering standards.
            </p>
          </div>

          {/* View Mode Switcher (Desktop) */}
          <div className="flex items-center gap-1 p-1 bg-[#2A4A8F] border border-white/15 self-start lg:self-auto">
            <button
              onClick={() => setViewMode("focused")}
              className={`px-3.5 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-all ${
                viewMode === "focused"
                  ? "bg-[#C9E1CA] text-[#203C7F] font-semibold shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
              data-interactive
            >
              TIER FOCUS
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3.5 py-1.5 font-mono text-[10px] tracking-widest uppercase transition-all ${
                viewMode === "table"
                  ? "bg-[#C9E1CA] text-[#203C7F] font-semibold shadow-sm"
                  : "text-white/70 hover:text-white"
              }`}
              data-interactive
            >
              FULL COMPARISON
            </button>
          </div>
        </div>

        {/* ── Active Tier Track (High-Contrast Segmented Bar) ── */}
        <div className="mb-8" role="tablist" aria-label="Construction Tiers">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            {PACKAGES.map((pkg, idx) => {
              const isSelected = selectedTier === idx;
              return (
                <button
                  key={pkg.name}
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedTier(idx)}
                  className={`relative p-4 sm:p-5 text-left transition-all duration-200 outline-none select-none border ${
                    isSelected
                      ? "bg-[#2A4A8F] border-[#98BFCB] shadow-lg"
                      : "bg-[#1B336C] border-white/12 hover:border-white/30 hover:bg-[#264080]"
                  }`}
                  data-interactive
                  data-cursor="view"
                >
                  {/* Top indicator bar for active tier */}
                  {isSelected && (
                    <motion.div
                      layoutId="active-pkg-pill"
                      className="absolute top-0 inset-x-0 h-0.5 bg-[#98BFCB]"
                      transition={{ duration: 0.22, ease: EASE_ARCH_SMOOTH }}
                    />
                  )}

                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-mono text-[10px] tracking-widest text-[#98BFCB] font-semibold">
                      {TIER_NUMS[idx]}
                    </span>
                    {pkg.highlight && (
                      <span className="px-1.5 py-0.5 bg-[#98BFCB]/25 text-[#98BFCB] text-[8px] font-mono tracking-wider font-semibold border border-[#98BFCB]/40">
                        POPULAR
                      </span>
                    )}
                  </div>

                  <div className="font-display text-[1.25rem] sm:text-[1.4rem] font-light text-white leading-tight mb-1">
                    {pkg.name}
                  </div>

                  <div className="font-mono text-[9px] tracking-wider text-white/60 uppercase">
                    {pkg.gradeLabel}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── View Mode: Focused Tier Inspection ── */}
        {viewMode === "focused" ? (
          <div className="bg-[#1B336C] border border-white/15 p-6 sm:p-8 shadow-2xl">
            {/* Tier Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-7 border-b border-white/12">
              <div>
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <span className="font-mono text-[11px] tracking-widest text-[#98BFCB] font-semibold">
                    TIER {TIER_NUMS[selectedTier]} // {activePackage.name.toUpperCase()} SPECIFICATION
                  </span>
                  {activePackage.highlight && (
                    <span className="px-2 py-0.5 bg-[#98BFCB]/20 text-[#98BFCB] text-[9px] font-mono tracking-widest font-semibold border border-[#98BFCB]/40">
                      MOST REQUESTED
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-[0.92rem] leading-relaxed max-w-[58ch]">
                  {TIER_DESCRIPTIONS[selectedTier]}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-[#152A5C] px-4 py-2.5 border border-white/15 self-start sm:self-auto">
                <span className="w-2 h-2 bg-[#98BFCB] inline-block animate-pulse" />
                <span className="font-mono text-[10px] tracking-widest text-white/85 uppercase">
                  100% WRITTEN BOQ GUARANTEE
                </span>
              </div>
            </div>

            {/* Specifications Grid (8 High-Contrast Dark Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PACKAGE_ROWS.map((row, rIdx) => {
                const specValue = row.values[selectedTier];
                return (
                  <div
                    key={row.category}
                    className="p-4 bg-[#152A5C] border border-white/12 flex flex-col justify-between hover:border-[#98BFCB]/50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[10px] tracking-widest uppercase text-[#98BFCB] font-medium">
                          0{rIdx + 1} / {row.category}
                        </span>
                      </div>
                      <p className="text-white text-[0.90rem] font-normal leading-snug">
                        {specValue}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className="mt-8 pt-6 border-t border-white/12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <p className="text-white/60 text-[0.84rem] max-w-[52ch] leading-relaxed">
                All materials, brands, and structural standards are confirmed in writing prior to site mobilization. No verbal substitution is ever permitted.
              </p>
              <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
                <Link
                  to="/contact"
                  className="px-4 py-2.5 border border-white/30 text-white hover:border-white hover:bg-white/10 font-mono text-[11px] tracking-widest uppercase transition-colors flex-1 sm:flex-initial text-center"
                >
                  REQUEST BOQ SPEC SHEET
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
          <div className="overflow-x-auto border border-white/15 bg-[#1B336C] shadow-2xl">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-white/15 bg-[#152A5C]">
                  <th className="p-4 font-mono text-[10px] tracking-widest uppercase text-white/50 w-[180px]">
                    CATEGORY
                  </th>
                  {PACKAGES.map((pkg, i) => (
                    <th
                      key={pkg.name}
                      onClick={() => setSelectedTier(i)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedTier === i
                          ? "bg-[#98BFCB]/20 border-x border-[#98BFCB]/50"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className="font-mono text-[9px] text-[#98BFCB] mb-0.5">{TIER_NUMS[i]}</div>
                      <div className="font-display text-[1.2rem] font-light text-white leading-tight">
                        {pkg.name}
                      </div>
                      <div className="font-mono text-[9px] text-white/60 uppercase mt-0.5">
                        {pkg.gradeLabel}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-[0.86rem]">
                {PACKAGE_ROWS.map((row, rIdx) => (
                  <tr
                    key={row.category}
                    className={rIdx % 2 === 0 ? "bg-[#1B336C]" : "bg-[#152A5C]"}
                  >
                    <td className="p-4 font-mono text-[10px] tracking-wider uppercase text-[#98BFCB] font-semibold bg-[#152A5C] border-r border-white/12">
                      {row.category}
                    </td>
                    {row.values.map((val, colIdx) => (
                      <td
                        key={colIdx}
                        onClick={() => setSelectedTier(colIdx)}
                        className={`p-4 transition-colors cursor-pointer leading-snug ${
                          selectedTier === colIdx
                            ? "bg-[#98BFCB]/15 text-white font-medium border-x border-[#98BFCB]/50"
                            : "text-white/75"
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
