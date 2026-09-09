import { useState, useRef, useEffect } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { EASE_ARCH_HEAVY, EASE_ARCH_SMOOTH } from "@/lib/motion";

import walkthroughStudioImg from "@/assets/walkthrough-studio.jpg";
import architectureSiteImg from "@/assets/architecture-site.jpg";
import aboutStudioBannerImg from "@/assets/about-studio-banner.jpg";
import homeStudiosHeroImg from "@/assets/home-studios-hero.jpg";
import walkthroughArImg from "@/assets/walkthrough-ar.jpg";
import interiorFinishedImg from "@/assets/interior-finished.jpg";

export interface ServiceExplorerItem {
  num: string;
  label: string;
  tag: string;
  brief: string;
  scaleDelivery: string;
  image: string;
  to?: string;
  slug?: string;
  specs: [string, string, string];
  ctaText: string;
}

export const EXPLORER_SERVICES: ServiceExplorerItem[] = [
  {
    num: "01",
    label: "3D Walk Through",
    tag: "VISUALIZATION",
    brief: "Walk your floor plan at 1:1 scale using commercial laser projection and real wheeled furniture before construction begins.",
    scaleDelivery: "1:1 REAL SCALE • 2-3 HOUR SESSION",
    image: walkthroughStudioImg,
    to: "/walkthrough",
    specs: [
      "Commercial 4K laser projection mapping floor plan at 1:1 true scale",
      "40+ full-height movable prop walls on wheels reconfigured live",
      "Real full-size sofas, beds, wardrobes & counters for true clearance testing",
    ],
    ctaText: "EXPLORE WALKTHROUGH STUDIO",
  },
  {
    num: "02",
    label: "Construction & Site Execution",
    tag: "BUILD",
    brief: "Five transparent packages with 100% written brand specifications and dedicated on-site engineering teams.",
    scaleDelivery: "TURNKEY BUILD • 5 WRITTEN PACKAGES",
    image: architectureSiteImg,
    to: "/construction",
    specs: [
      "Rigid written bill of quantities with zero verbal substitutions",
      "Named site engineer present every working day with milestone tracking",
      "4-year structural warranty & transparent escrow payment milestones",
    ],
    ctaText: "COMPARE CONSTRUCTION PACKAGES",
  },
  {
    num: "03",
    label: "Structural Design",
    tag: "ENGINEERING",
    brief: "Complete excavation, footing, column and plinth beam working drawings engineered strictly to your plot conditions.",
    scaleDelivery: "IS CODE COMPLIANT • SLIDING SCALE",
    image: aboutStudioBannerImg,
    slug: "structural-design",
    specs: [
      "Excavation layout with precise dig lines matched to soil testing",
      "Detailed column, footing, and plinth beam working drawings",
      "Complete bar bending and reinforcement schedules for contractor compliance",
    ],
    ctaText: "VIEW STRUCTURAL SPECIFICATIONS",
  },
  {
    num: "04",
    label: "Plans Approval",
    tag: "REGULATORY",
    brief: "Comprehensive regulatory documentation and direct municipal liaison for hassle-free BBMP & BDA sanctions.",
    scaleDelivery: "FULL LIAISON • BBMP / BDA COMPLIANT",
    image: homeStudiosHeroImg,
    slug: "plans-approval",
    specs: [
      "Bye-law verification: setbacks, ground coverage, and FAR calculations",
      "Official municipal submission drawings, key plans, and section details",
      "Complete coordination for BWSSB, BESCOM, and fire clearance NOCs",
    ],
    ctaText: "EXPLORE APPROVAL PROCESS",
  },
  {
    num: "05",
    label: "Architecture Design",
    tag: "DESIGN",
    brief: "Site-specific floor plans shaped around natural light, cross-ventilation, and Vaastu alignment — validated in 1:1 scale.",
    scaleDelivery: "BESPOKE HOMES • 1:1 SCALE TESTED",
    image: walkthroughArImg,
    slug: "architecture-design",
    specs: [
      "Solar path and microclimate analysis for daylighting and breeze channels",
      "Circulation, zoning, and private-versus-public spatial separation",
      "Every plan verified inside our physical walkthrough studio before signoff",
    ],
    ctaText: "EXPLORE ARCHITECTURAL DESIGN",
  },
  {
    num: "06",
    label: "Interior Designing",
    tag: "INTERIOR",
    brief: "Space planning, joinery runs, and material concepts tested at 1:1 scale before expensive procurement and fabrication.",
    scaleDelivery: "TURNKEY FIT-OUT • SPATIAL VALIDATION",
    image: interiorFinishedImg,
    slug: "interior-design",
    specs: [
      "Kitchen island, wardrobe run, and corridor clearances tested at real scale",
      "Custom joinery details, finishes schedule, and integrated lighting schemas",
      "Zero post-fabrication regret through physical ergonomics verification",
    ],
    ctaText: "EXPLORE INTERIOR ARCHITECTURE",
  },
];

export function ServiceExplorer() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const activeService = EXPLORER_SERVICES[activeIndex];

  const handleNavigate = (svc: ServiceExplorerItem) => {
    if (svc.slug) {
      router.navigate({
        to: "/services/$slug",
        params: { slug: svc.slug },
      });
    } else if (svc.to) {
      router.navigate({ to: svc.to as any });
    }
  };

  return (
    <section className="py-12 lg:py-20 bg-paper" aria-label="Interactive services exploration system">
      <div className="arch-container">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-10 pb-6 border-b border-rule">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="arch-label arch-label--accent">DISCIPLINE MATRIX</span>
              <span className="w-2 h-px bg-rule-dark" aria-hidden="true" />
              <span className="arch-label text-stone">SELECT TO INSPECT VIEWPORT</span>
            </div>
            <h2
              className="font-display text-ink leading-none"
              style={{ fontSize: "var(--text-display-sm)" }}
            >
              Interactive studio index.
            </h2>
          </div>
          <p className="text-stone text-[0.92rem] leading-relaxed max-w-[42ch]">
            Every discipline is unified under one roof. Hover or select a service to examine its engineering deliverables, technical specifications, and scale verification.
          </p>
        </div>

        {/* Desktop Split View: 45% List / 55% Architectural Viewport */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-14 items-start">
          {/* Left Column: Architectural Services List */}
          <div className="flex flex-col divide-y divide-rule" role="tablist" aria-label="Services List">
            {EXPLORER_SERVICES.map((svc, i) => {
              const isActive = activeIndex === i;

              return (
                <div
                  key={svc.num}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0}
                  onPointerEnter={() => !isMobile && setActiveIndex(i)}
                  onClick={() => setActiveIndex(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setActiveIndex(i);
                    }
                  }}
                  className={`relative py-5 lg:py-6 px-4 -mx-4 cursor-pointer transition-all duration-300 outline-none select-none ${
                    isActive
                      ? "bg-white/60 shadow-sm border-l-2 border-indigo pl-5"
                      : "hover:bg-white/30 border-l-2 border-transparent"
                  }`}
                  data-interactive
                  data-cursor="view"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
                        <span
                          className={`font-mono text-[11px] tracking-widest transition-colors duration-200 ${
                            isActive ? "text-indigo font-bold" : "text-stone"
                          }`}
                        >
                          {svc.num}
                        </span>
                        <span
                          className={`font-display text-[clamp(1.35rem,2.2vw,1.85rem)] font-light leading-snug transition-colors duration-200 ${
                            isActive ? "text-ink font-normal" : "text-ink/80 hover:text-ink"
                          }`}
                        >
                          {svc.label}
                        </span>
                        <span
                          className={`arch-label transition-colors duration-200 ${
                            isActive ? "arch-label--accent" : "text-stone"
                          }`}
                        >
                          {svc.tag}
                        </span>
                      </div>

                      <p className="text-stone text-[0.87rem] leading-relaxed max-w-[46ch]">
                        {svc.brief}
                      </p>

                      {/* Mobile Inline Spec Preview */}
                      {isMobile && isActive && (
                        <div className="mt-4 pt-4 border-t border-rule animate-fadeIn">
                          <div className="relative aspect-[16/10] bg-ink overflow-hidden mb-3 border border-rule">
                            <img
                              src={svc.image}
                              alt={svc.label}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-deep/85 text-[9px] font-mono tracking-widest text-indigo">
                              {svc.scaleDelivery}
                            </div>
                          </div>

                          <ul className="space-y-1.5 mb-4">
                            {svc.specs.map((spec, specIdx) => (
                              <li key={specIdx} className="flex items-start gap-2 text-[0.82rem] text-stone">
                                <span className="text-indigo font-mono">―</span>
                                <span>{spec}</span>
                              </li>
                            ))}
                          </ul>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(svc);
                            }}
                            className="arch-btn arch-btn--primary w-full justify-center"
                          >
                            {svc.ctaText} <span className="arch-btn-arrow">→</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Arrow Indicator */}
                    <div
                      className={`flex-shrink-0 w-8 h-8 flex items-center justify-center border transition-all duration-300 ${
                        isActive
                          ? "border-indigo bg-indigo text-deep"
                          : "border-rule bg-white/40 text-stone"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path
                          d="M4 10h12M11 5l5 5-5 5"
                          stroke="currentColor"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Live Architectural Viewport (Desktop) */}
          <div className="hidden lg:block sticky top-28">
            <div className="relative w-full bg-deep border border-rule overflow-hidden shadow-2xl">
              {/* Top Viewport Datum Bar */}
              <div className="p-3 px-4 bg-deep/95 border-b border-white/10 flex items-center justify-between text-white/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo inline-block animate-pulse" />
                  <span className="font-mono text-[10px] tracking-widest text-indigo uppercase">
                    VIEWPORT // {activeService.num}
                  </span>
                  <span className="text-white/25">|</span>
                  <span className="font-mono text-[10px] tracking-wider text-white/70">
                    {activeService.scaleDelivery}
                  </span>
                </div>
                <span className="font-mono text-[9px] tracking-widest uppercase text-white/50">
                  HOME STUDIOS ARCHIVE
                </span>
              </div>

              {/* Viewport Frame with Corner Alignment Marks */}
              <div className="relative aspect-[16/11] bg-ink overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeService.num}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1.0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0.01 : 0.35,
                      ease: EASE_ARCH_SMOOTH,
                    }}
                    className="absolute inset-0 w-full h-full"
                  >
                    <img
                      src={activeService.image}
                      alt={activeService.label}
                      className="w-full h-full object-cover object-center"
                      style={{ filter: "brightness(0.9) contrast(1.05) saturate(0.95)" }}
                    />
                    {/* Architectural grid overlay */}
                    <div className="arch-grid-dark absolute inset-0 opacity-15 pointer-events-none" />
                    {/* Monograph gradient overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(8, 11, 26, 0.25) 0%, rgba(8, 11, 26, 0.1) 40%, rgba(8, 11, 26, 0.92) 100%)",
                      }}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Viewport Corner Reticles */}
                <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/40 pointer-events-none" />
                <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/40 pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/40 pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/40 pointer-events-none" />
              </div>

              {/* Bottom Technical HUD & Direct Action */}
              <div className="p-6 bg-deep border-t border-white/10 text-white">
                <div className="mb-5">
                  <span className="font-mono text-[9px] tracking-widest text-indigo uppercase block mb-1">
                    ENGINEERING DELIVERABLES
                  </span>
                  <ul className="space-y-2">
                    {activeService.specs.map((spec, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2.5 text-[0.85rem] text-white/80">
                        <span className="text-indigo font-mono text-[11px] leading-tight mt-0.5">0{sIdx + 1}</span>
                        <span className="leading-snug">{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-[9px] tracking-widest text-white/40 uppercase block">
                      STATUS
                    </span>
                    <span className="font-mono text-[11px] text-white/85 font-medium">
                      AVAILABLE AT RR NAGAR
                    </span>
                  </div>

                  <button
                    onClick={() => handleNavigate(activeService)}
                    className="arch-btn arch-btn--primary"
                    data-interactive
                  >
                    {activeService.ctaText} <span className="arch-btn-arrow">→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServiceExplorer;
