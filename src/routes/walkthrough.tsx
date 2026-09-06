import { createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FinalCTA } from "@/components/site/FinalCTA";
import { FadeUp } from "@/components/site/TextReveal";
import { CONTACT } from "@/lib/site-data";

import walkthroughFurnitureImg from "@/assets/walkthrough-furniture.jpg";
import walkthroughStudioImg from "@/assets/walkthrough-studio.jpg";
import walkthroughArImg from "@/assets/walkthrough-ar.jpg";
import walkthroughVrImg from "@/assets/walkthrough-vr.jpg";

export const Route = createFileRoute("/walkthrough")({
  component: WalkthroughPage,
});

const MODES = [
  {
    num: "01",
    title: "Laser Projection",
    tag: "LASER",
    image: walkthroughStudioImg,
    badge: "1:1 FLOOR PROJECTION",
    desc: "Commercial-grade laser projectors cast your exact floor plan onto the studio floor at true 1:1 scale. Every wall, doorway, column and dimension appears exactly where it will sit on site. Walk through the kitchen, check if two people can pass in the corridor, open the wardrobe door.",
  },
  {
    num: "02",
    title: "Augmented Reality",
    tag: "AR",
    image: walkthroughArImg,
    badge: "3D SPATIAL OVERLAY",
    desc: "iPad-based AR overlays finished walls, cabinetry, fittings and material finishes onto the live studio floor. You see both the scale and the look simultaneously — understanding how a room will feel when complete.",
  },
  {
    num: "03",
    title: "Virtual Reality",
    tag: "VR",
    image: walkthroughVrImg,
    badge: "1:1 IMMERSIVE WALK",
    desc: "Step inside a fully rendered, dimensionally accurate version of your future home. Stand in the kitchen and look out the window. Feel the ceiling height. Walk every room at the scale it will actually be.",
  },
  {
    num: "04",
    title: "Real Furniture",
    tag: "FURNITURE",
    image: walkthroughFurnitureImg,
    badge: "MODULAR ON WHEELS",
    desc: "Full-size, wheeled furniture — sofas, beds, wardrobes, kitchen counters — placed inside the projected outline. You understand true furniture scale, circulation and clearance in a way no plan or render can convey.",
  },
];

const INCLUDED = [
  { label: "40+ prop walls", desc: "Movable full-height walls in different sizes." },
  { label: "Real furniture on wheels", desc: "Move pieces yourself. Test every arrangement." },
  { label: "Wireless setup", desc: "No cables. Changes in seconds, not minutes." },
  { label: "Team guidance", desc: "A specialist walks the session with you." },
  { label: "Family-friendly waiting", desc: "Netflix, Disney+, Stan, free WiFi." },
  { label: "Multiple layouts", desc: "Test more than one arrangement per session." },
];

const PROCESS = [
  { num: "01", title: "Schedule", desc: "Call, WhatsApp or write in. Tell us your plan size and timeline." },
  { num: "02", title: "Send Your Plan", desc: "Share your floor plan and reserve a studio slot." },
  { num: "03", title: "We Prepare", desc: "Laser projection, prop walls and wheeled furniture are set up to match your plan." },
  { num: "04", title: "Walk Through", desc: "Walk every room at true size, test arrangements, leave with a validated plan." },
];

function WalkthroughPage() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScrollY } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroImgScale = useTransform(heroScrollY, [0, 1], [1.08, 1.0]);
  const heroImgY = useTransform(heroScrollY, [0, 1], ["0%", "15%"]);

  return (
    <>
      <SiteHeader />
      <main>
        {/* ── Hero with Ambient Parallax Background ── */}
        <section
          ref={heroRef}
          className="relative pt-32 pb-14 lg:pb-18 overflow-hidden bg-ink"
          aria-label="Page hero"
        >
          <motion.div
            style={{ scale: heroImgScale, y: heroImgY }}
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
          >
            <img
              src={walkthroughStudioImg}
              alt=""
              className="w-full h-full object-cover object-center"
              style={{ filter: "brightness(0.35) saturate(0.85)" }}
            />
          </motion.div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(160deg, rgba(28,25,20,0.85) 0%, rgba(17,17,17,0.7) 50%, rgba(17,17,17,0.95) 100%)",
            }}
            aria-hidden="true"
          />
          <div className="arch-grid-dark absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />

          <div className="relative arch-container">
            <p className="arch-label arch-label--accent mb-4">01 / WALKTHROUGH</p>
            <h1 className="font-display text-white leading-[0.92] mb-6"
              style={{ fontSize: "var(--text-display-lg)" }}>
              WALK THROUGH<br />YOUR FUTURE HOME<br />BEFORE IT'S BUILT.
            </h1>
            <p className="text-white/50 text-[0.97rem] leading-relaxed max-w-[44ch] mb-8">
              Our studio uses laser projection, augmented reality, virtual reality and real furniture
              to let you experience your floor plan at true, 1:1 scale — before construction begins.
            </p>
            <div className="flex items-center gap-6" aria-hidden="true">
              <span className="arch-label" style={{ color: "rgba(255,255,255,0.35)" }}>1:1 SCALE</span>
              <span className="arch-label" style={{ color: "rgba(255,255,255,0.15)" }}>—</span>
              <span className="arch-label" style={{ color: "rgba(255,255,255,0.35)" }}>LASER · AR · VR · REAL FURNITURE</span>
            </div>
          </div>
        </section>

        {/* ── What it is — Real Studio Image Section ── */}
        <section className="py-12 lg:py-16 bg-paper" aria-label="What is a walkthrough session">
          <div className="arch-container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <FadeUp>
                <p className="arch-label arch-label--accent mb-3">WHAT IT IS</p>
                <h2 className="font-display text-ink leading-none mb-4"
                  style={{ fontSize: "var(--text-display-sm)" }}>
                  The only way to truly<br />understand a space is<br />to stand inside it.
                </h2>
                <p className="text-stone text-[0.97rem] leading-relaxed mb-4 max-w-[44ch]">
                  A floor plan drawn at 1:100 scale looks nothing like a room once you're standing inside it.
                  A 2D print tells you nothing about whether the corridor is wide enough, whether the kitchen
                  island blocks the window, or whether the master bedroom will actually fit your bed.
                </p>
                <p className="text-stone text-[0.97rem] leading-relaxed max-w-[44ch]">
                  Our studio casts your exact plan onto the floor at real size — and brings in real furniture
                  so you can walk, test and decide with certainty.
                </p>
                <div className="mt-6 flex gap-6" aria-hidden="true">
                  <span className="arch-label">PROJECTION FIELD</span>
                  <span className="arch-label" style={{ color: "var(--rule-dark)" }}>—</span>
                  <span className="arch-label">1:1 SCALE VERIFICATION</span>
                </div>
              </FadeUp>

              {/* Real studio photograph with scroll-reveal and architectural annotations */}
              <FadeUp delay={0.15}>
                <div
                  className="relative overflow-hidden border border-rule bg-ink"
                  style={{ aspectRatio: "4/3" }}
                >
                  <motion.img
                    src={walkthroughFurnitureImg}
                    alt="Clients and architect walking inside a 1:1 scale floor plan with real furniture on wheels"
                    className="w-full h-full object-cover object-center"
                    initial={{ scale: 1.06 }}
                    whileInView={{ scale: 1.0 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    viewport={{ once: true }}
                  />
                  {/* Atmospheric subtle vignette */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(17,17,17,0.1) 0%, transparent 40%, rgba(17,17,17,0.4) 100%)",
                    }}
                  />
                  {/* Subtle Blueprint SVG overlay lines */}
                  <svg
                    className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none"
                    viewBox="0 0 400 300"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect x="50" y="50" width="300" height="200" stroke="white" strokeWidth="0.8" />
                    <line x1="50" y1="150" x2="200" y2="150" stroke="white" strokeWidth="0.4" />
                    <line x1="200" y1="50" x2="200" y2="250" stroke="white" strokeWidth="0.4" />
                  </svg>
                  {/* Architectural callouts */}
                  <span
                    className="absolute top-4 left-4 arch-label"
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      background: "rgba(17,17,17,0.75)",
                      padding: "4px 10px",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    FIGURE 01 / 1:1 PROJECTION FIELD & REAL FURNITURE
                  </span>
                  <div
                    className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2"
                  >
                    <span className="arch-label text-white/90 text-[0.75rem] bg-ink/75 px-2.5 py-1 backdrop-blur-sm">
                      900mm DOORWAY CLEARANCE · TESTED LIVE
                    </span>
                    <span className="arch-label text-white/50 text-[0.72rem] hidden sm:inline-block">
                      RR NAGAR / BENGALURU
                    </span>
                  </div>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ── Four Modes — With Photographic Visual Previews ── */}
        <section className="py-12 lg:py-16" style={{ background: "var(--surface)" }} aria-label="Walkthrough modes">
          <div className="arch-container">
            <p className="arch-label arch-label--accent mb-6">FOUR MODES</p>
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4" style={{ borderLeft: "1px solid var(--rule)" }}>
              {MODES.map((mode) => (
                <div
                  key={mode.num}
                  className="flex flex-col border-r border-b border-rule bg-paper group hover:bg-surface-lt transition-colors"
                >
                  {/* Mode Image Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden border-b border-rule bg-ink">
                    <img
                      src={mode.image}
                      alt={mode.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent pointer-events-none" />
                    <span className="absolute bottom-2.5 left-3 arch-label text-white/90 text-[0.68rem] bg-ink/70 px-2 py-0.5 backdrop-blur-sm">
                      {mode.badge}
                    </span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="arch-label arch-label--accent mb-2.5">{mode.num} / {mode.tag}</p>
                      <h3 className="font-display text-[1.4rem] font-light text-ink mb-2.5">{mode.title}</h3>
                      <p className="text-stone text-[0.85rem] leading-relaxed">{mode.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Included in every session ── */}
        <section className="py-12 lg:py-16 bg-paper" aria-label="What's included">
          <div className="arch-container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-start">
              <FadeUp>
                <p className="arch-label arch-label--accent mb-3">WHAT'S INCLUDED</p>
                <h2 className="font-display text-ink leading-none"
                  style={{ fontSize: "var(--text-display-sm)" }}>
                  Every session<br />comes with.
                </h2>
              </FadeUp>
              <div>
                {INCLUDED.map((item, i) => (
                  <div
                    key={item.label}
                    className="flex gap-5 py-3.5"
                    style={{
                      borderBottom: i < INCLUDED.length - 1 ? "1px solid var(--rule)" : "none",
                      borderTop: i === 0 ? "1px solid var(--rule)" : "none",
                    }}
                  >
                    <span className="arch-label arch-label--accent flex-shrink-0" style={{ minWidth: "1.8rem" }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-sans font-600 text-ink text-[0.92rem] mb-0.5">{item.label}</p>
                      <p className="text-stone text-[0.85rem] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Process ── */}
        <section className="py-12 lg:py-16" style={{ background: "var(--surface)" }} aria-label="How to book">
          <div className="arch-container">
            <p className="arch-label arch-label--accent mb-6">HOW TO BOOK</p>
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4" style={{ borderLeft: "1px solid var(--rule)" }}>
              {PROCESS.map((step) => (
                <div
                  key={step.num}
                  className="p-6"
                  style={{ borderRight: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}
                >
                  <p className="arch-label arch-label--accent mb-3">{step.num}</p>
                  <h3 className="font-display text-[1.45rem] font-light text-ink mb-2">{step.title}</h3>
                  <p className="text-stone text-[0.85rem] leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FinalCTA
          eyebrow="Book your session"
          title={"EXPERIENCE THE\nSPACE BEFORE\nYOU BUILD IT."}
        />
      </main>
      <SiteFooter />
    </>
  );
}
