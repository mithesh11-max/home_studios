import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FinalCTA } from "@/components/site/FinalCTA";
import { FadeUp } from "@/components/site/TextReveal";
import { FAQ } from "@/components/site/FAQ";
import { CONTACT } from "@/lib/site-data";

import aboutStudioBannerImg from "@/assets/about-studio-banner.jpg";
import architectureSiteImg from "@/assets/architecture-site.jpg";
import walkthroughStudioImg from "@/assets/walkthrough-studio.jpg";
import interiorFinishedImg from "@/assets/interior-finished.jpg";

export const Route = createFileRoute("/about")({
  component: About,
});

const DISCIPLINES = [
  { num: "01", title: "Architecture & Design", desc: "Layouts shaped around how you'll actually live — light, ventilation, vaastu and circulation resolved before the plan is locked." },
  { num: "02", title: "Visualization", desc: "1:1 scale walkthrough sessions that replace guesswork with certainty before a foundation is dug." },
  { num: "03", title: "Structural Engineering", desc: "Complete drawings from excavation layout to reinforcement schedules — so your contractor builds from engineering, not improvisation." },
  { num: "04", title: "Approvals & Documentation", desc: "Plan preparation and municipal submission so your project isn't held up by paperwork." },
  { num: "05", title: "Construction", desc: "Five transparent packages with detailed specifications in writing and a named team on site." },
  { num: "06", title: "Interior Designing", desc: "Space planning and material concepts tested at real scale in the studio before execution begins." },
];

const VALUES = [
  { label: "ACCURACY OVER GUESSWORK", desc: "Real-size projection and engineering drawings replace assumptions with something you can measure." },
  { label: "TRANSPARENT SPECIFICATIONS", desc: "Every package and service comes with clear specifications in writing before anything is agreed." },
  { label: "ACCOUNTABLE DELIVERY", desc: "Regular site visits and a named team on every project — no disappearing after the contract is signed." },
  { label: "CLIENT-FIRST ADVICE", desc: "We tell clients what we'd choose for our own home, even when it's the simpler option." },
];

const ABOUT_FAQS = [
  { question: "Where is the studio located?", answer: "We're based at 18th Main, Sapthagiri Layout, Chansandra, Rajarajeshwari Nagar, Bengaluru 560098. Sessions are by appointment." },
  { question: "Do you work with architects and developers?", answer: "Yes — architects, interior designers, residential developers and commercial clients all use our studio and services, alongside individual homeowners." },
  { question: "Can I commission just one service?", answer: "Yes. You can use any individual service independently — a structural design only, a single walkthrough session, or plans approval without taking on the full construction package." },
];

/** Full-width panoramic banner with scroll-motion parallax */
function ParallaxStudioBanner() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.12, 1.05, 1.12]);

  return (
    <section
      ref={bannerRef}
      className="relative h-[340px] sm:h-[420px] lg:h-[480px] overflow-hidden bg-ink"
      aria-label="Studio drafting banner"
    >
      <motion.div
        style={{ y, scale }}
        className="absolute -inset-y-[15%] inset-x-0 w-full h-[130%]"
      >
        <img
          src={aboutStudioBannerImg}
          alt="Home Studios senior architects and engineers collaborating over physical scale models"
          className="w-full h-full object-cover object-center"
          style={{ filter: "contrast(1.02)" }}
        />
      </motion.div>

      {/* Subtle vignette for caption contrast */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,17,17,0.3) 0%, transparent 45%, rgba(17,17,17,0.5) 100%)",
        }}
        aria-hidden="true"
      />
      <div className="arch-grid-dark absolute inset-0 opacity-25 pointer-events-none" aria-hidden="true" />

      {/* Architectural corner markings & formal captions */}
      <div className="relative arch-container h-full flex flex-col justify-between py-8 lg:py-12 pointer-events-none">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span
            className="arch-label"
            style={{
              color: "rgba(255,255,255,0.85)",
              background: "rgba(17,17,17,0.65)",
              padding: "4px 12px",
              backdropFilter: "blur(4px)",
            }}
          >
            PLATE 01 / ARCHITECTURAL PRACTICE & SCALE RESEARCH
          </span>
          <span
            className="arch-label hidden sm:inline-block"
            style={{
              color: "rgba(255,255,255,0.65)",
              background: "rgba(17,17,17,0.65)",
              padding: "4px 12px",
              backdropFilter: "blur(4px)",
            }}
          >
            HOME STUDIOS · LABORATORY ARCHIVE
          </span>
        </div>

        <div className="max-w-[560px] p-6 lg:p-8 bg-ink/80 backdrop-blur-md border border-white/10">
          <p className="arch-label arch-label--accent mb-2.5">PHYSICAL & SPATIAL MODELING</p>
          <p className="font-display text-white text-[1.35rem] sm:text-[1.7rem] font-light leading-snug mb-3">
            Every massing, void and light path is verified in physical space before construction begins.
          </p>
          <div className="flex items-center gap-4 text-white/45 text-[0.8rem]">
            <span>SCALE: 1:50 · 1:20 · 1:1</span>
            <span>—</span>
            <span>BENGALURU HEADQUARTERS</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Multi-banner scroll-motion exhibition showing the physical continuum */
function ScrollMotionExhibition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const leftParallaxY = useTransform(scrollYProgress, [0, 1], ["30px", "-30px"]);
  const rightParallaxY = useTransform(scrollYProgress, [0, 1], ["-20px", "40px"]);
  const panoramaScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.07]);

  return (
    <section ref={containerRef} className="py-12 lg:py-16 bg-paper overflow-hidden" aria-label="Spatial Reel">
      <div className="arch-container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="arch-label arch-label--accent mb-4">03 / SPATIAL REEL</p>
            <h2 className="font-display text-ink leading-none" style={{ fontSize: "var(--text-display-sm)" }}>
              The continuum: from drawing<br />to true scale to site.
            </h2>
          </div>
          <p className="text-stone text-[0.93rem] leading-relaxed max-w-[38ch]">
            Architecture should not be an abstract hypothesis. We bridge the gap between design theory and physical reality.
          </p>
        </div>

        {/* Dual Asymmetric Parallax Banners */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          {/* Left Column (7 cols) - Site Execution */}
          <div className="lg:col-span-7">
            <motion.div
              style={{ y: leftParallaxY }}
              className="relative overflow-hidden border border-rule bg-ink"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={architectureSiteImg}
                  alt="Site structural geometry and cantilever construction"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-4 left-4 arch-label bg-paper/90 text-ink px-2.5 py-1">
                  PLATE 02 / SITE EXECUTION
                </span>
                <span className="absolute bottom-4 left-4 font-display text-white text-[1.3rem] font-light">
                  Structural Reality · Engineered Precision
                </span>
              </div>
              <div className="p-6 bg-paper-hi border-t border-rule">
                <p className="text-stone text-[0.88rem] leading-relaxed">
                  Excavation lines, structural columns, and cantilevered slabs engineered to carry load permanently without improvisations on site.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column (5 cols) - 1:1 Projection Studio */}
          <div className="lg:col-span-5 lg:pt-14">
            <motion.div
              style={{ y: rightParallaxY }}
              className="relative overflow-hidden border border-rule bg-ink"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={walkthroughStudioImg}
                  alt="1:1 scale floor plan laser projection field"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent pointer-events-none" />
                <span className="absolute top-4 left-4 arch-label px-2.5 py-1" style={{ backgroundColor: "var(--indigo)", color: "var(--bg-deep)" }}>
                  PLATE 03 / 1:1 WALKTHROUGH
                </span>
                <span className="absolute bottom-4 left-4 font-display text-white text-[1.2rem] font-light">
                  1:1 Spatial Validation
                </span>
              </div>
              <div className="p-6 bg-paper-hi border-t border-rule">
                <p className="text-stone text-[0.88rem] leading-relaxed">
                  Every wall line and doorway projected at real scale. Clients and architects test clearances with body and furniture before building.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Lower Wide Panoramic Banner - Finished Interior Realization */}
        <div className="relative overflow-hidden border border-rule bg-ink mt-8">
          <div className="relative h-[280px] sm:h-[380px] lg:h-[440px] overflow-hidden">
            <motion.img
              src={interiorFinishedImg}
              alt="Finished interior architecture and bespoke joinery"
              className="w-full h-full object-cover object-center"
              style={{ scale: panoramaScale, filter: "contrast(1.02)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/65 via-ink/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 arch-grid-dark opacity-20 pointer-events-none" />

            <div className="absolute inset-0 p-8 sm:p-12 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="arch-label bg-white/10 text-white backdrop-blur-md px-3 py-1 border border-white/10">
                  PLATE 04 / OCCUPIED REALIZATION
                </span>
                <span className="arch-label text-white/50 hidden sm:inline-block">
                  CIRCULATION & MATERIALITY
                </span>
              </div>
              <div className="max-w-[500px]">
                <h3 className="font-display text-white text-[1.6rem] sm:text-[2.2rem] font-light leading-tight mb-2.5">
                  Built to the millimeter.
                </h3>
                <p className="text-white/65 text-[0.9rem] leading-relaxed">
                  When the plan is proven at 1:1 scale, the finished home matches expectations with zero design regrets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function About() {
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
        {/* ── Hero with Scroll-Motion Studio Banner ── */}
        <section
          ref={heroRef}
          className="relative pt-32 pb-14 lg:pb-18 overflow-hidden bg-ink"
          aria-label="About hero"
        >
          {/* Parallax Hero Studio Banner Image */}
          <motion.div
            style={{ scale: heroImgScale, y: heroImgY }}
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
          >
            <img
              src={aboutStudioBannerImg}
              alt=""
              className="w-full h-full object-cover object-center"
              style={{ filter: "brightness(0.32) contrast(1.08) saturate(0.85)" }}
            />
          </motion.div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(160deg, rgba(28,25,20,0.85) 0%, rgba(17,17,17,0.7) 45%, rgba(17,17,17,0.95) 100%)",
            }}
            aria-hidden="true"
          />
          <div className="arch-grid-dark absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />

          <div className="relative arch-container">
            <p className="arch-label arch-label--accent mb-4">ABOUT HOME STUDIOS</p>
            <h1 className="font-display text-white leading-[0.92] mb-6"
              style={{ fontSize: "var(--text-display-lg)" }}>
              BUILT BY PEOPLE<br />WHO'D RATHER YOU<br />FIND THE MISTAKE<br />ON THE FLOOR.
            </h1>
            <p className="text-white/50 text-[0.97rem] leading-relaxed max-w-[48ch]">
              A Bengaluru-based studio of architects, structural engineers, project managers
              and visualization specialists. We believe every rupee spent on planning saves
              several more spent on rework.
            </p>
            <div className="mt-6 flex items-center gap-5" aria-hidden="true">
              <span className="arch-label" style={{ color: "rgba(255,255,255,0.35)" }}>RR NAGAR / BENGALURU</span>
              <span className="arch-label" style={{ color: "rgba(255,255,255,0.15)" }}>—</span>
              <span className="arch-label" style={{ color: "rgba(255,255,255,0.35)" }}>12.92°N 77.51°E</span>
            </div>
          </div>
        </section>

        {/* ── Studio statement ── */}
        <section className="py-12 lg:py-16 bg-paper" aria-label="Studio philosophy">
          <div className="arch-container">
            <div className="max-w-[800px]">
              <p className="arch-label arch-label--accent mb-4">STUDIO</p>
              <h2 className="font-display text-ink leading-[0.95] mb-6"
                style={{ fontSize: "var(--text-display-md)" }}>
                Construction decisions<br />made on paper<br />are guesses. We turn<br />them into certainties.
              </h2>
              <p className="text-stone text-[1rem] leading-relaxed max-w-[56ch] mb-4">
                Home Studios started with a simple observation: the most expensive mistakes in a build —
                a badly placed column, a kitchen a foot too narrow, a staircase that eats the living room —
                are almost always decided on a 2D drawing, months before anyone can stand in the space.
              </p>
              <p className="text-stone text-[1rem] leading-relaxed max-w-[56ch]">
                Our real-size walkthrough studio exists to close that gap. Pair that with in-house structural
                design, plan approvals, architecture and construction, and a client can go from idea to occupied
                home without switching vendors or re-explaining their brief.
              </p>
            </div>
          </div>
        </section>

        {/* ── Large typographic philosophy statements ── */}
        <section
          className="py-12 lg:py-16 overflow-hidden"
          style={{ background: "var(--surface)" }}
          aria-label="Philosophy"
        >
          <div className="arch-grid-dark absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />
          <div className="relative arch-container">
            <p className="arch-label arch-label--light mb-6">PHILOSOPHY</p>
            {[
              { word: "SPACE", sub: "Designed from how you live in it." },
              { word: "SCALE", sub: "Tested at 1:1 before a wall is built." },
              { word: "MATERIAL", sub: "Specified in writing. No surprises." },
              { word: "PEOPLE", sub: "A named team. One brief. One build." },
              { word: "PRECISION", sub: "Engineering before improvisation." },
            ].map((item, i, arr) => (
              <div
                key={item.word}
                className="flex items-baseline justify-between py-3.5 lg:py-4.5"
                style={{
                  borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                  borderTop: i === 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
              >
                <span className="font-display text-white leading-none" style={{ fontSize: "var(--text-display-md)" }}>
                  {item.word}
                </span>
                <span className="text-white/25 text-[0.88rem] hidden sm:block">{item.sub}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Full-Width Panoramic Scroll-Motion Parallax Banner ── */}
        <ParallaxStudioBanner />

        {/* ── Disciplines ── */}
        <section className="py-12 lg:py-16 bg-paper" aria-label="Disciplines">
          <div className="arch-container">
            <p className="arch-label arch-label--accent mb-6">DISCIPLINES</p>
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-3" style={{ borderTop: "1px solid var(--rule)", borderLeft: "1px solid var(--rule)" }}>
              {DISCIPLINES.map((d) => (
                <div
                  key={d.num}
                  className="p-6"
                  style={{ borderRight: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}
                >
                  <p className="arch-label arch-label--accent mb-3">{d.num}</p>
                  <h3 className="font-display text-[1.45rem] font-light text-ink mb-2">{d.title}</h3>
                  <p className="text-stone text-[0.86rem] leading-relaxed">{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Multi-Banner Scroll-Motion Spatial Reel ── */}
        <ScrollMotionExhibition />

        {/* ── Values ── */}
        <section className="py-12 lg:py-16" style={{ background: "var(--surface)" }} aria-label="Our values">
          <div className="arch-container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-10 items-start">
              <FadeUp>
                <p className="arch-label arch-label--accent mb-4">VALUES</p>
                <h2 className="font-display text-ink leading-none"
                  style={{ fontSize: "var(--text-display-sm)" }}>
                  What we hold<br />ourselves to.
                </h2>
              </FadeUp>
              <div>
                {VALUES.map((v, i) => (
                  <div
                    key={v.label}
                    className="py-4"
                    style={{
                      borderBottom: i < VALUES.length - 1 ? "1px solid var(--rule)" : "none",
                      borderTop: i === 0 ? "1px solid var(--rule)" : "none",
                    }}
                  >
                    <p className="font-sans font-600 text-[0.78rem] tracking-[0.14em] uppercase text-ink mb-1.5">{v.label}</p>
                    <p className="text-stone text-[0.93rem] leading-relaxed">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Location ── */}
        <section className="py-12 lg:py-14 bg-paper" style={{ borderTop: "1px solid var(--rule)" }} aria-label="Location">
          <div className="arch-container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-start">
              <div>
                <p className="arch-label arch-label--accent mb-4">LOCATION</p>
                <h2 className="font-display text-ink leading-none mb-4"
                  style={{ fontSize: "var(--text-display-sm)" }}>
                  RR Nagar,<br />Bengaluru.
                </h2>
                <p className="text-stone text-[0.93rem] leading-relaxed max-w-[36ch] mb-4">
                  Our studio is based in Rajarajeshwari Nagar. We operate by appointment —
                  book a time and our team will confirm your slot.
                </p>
                <div className="space-y-1.5">
                  {CONTACT.addressLines.map((l) => (
                    <p key={l} className="text-stone text-[0.88rem]">{l}</p>
                  ))}
                </div>
                <div className="mt-6 flex gap-4 flex-wrap">
                  <a href={CONTACT.phoneHref} className="arch-btn arch-btn--outline">{CONTACT.phone}</a>
                  <Link to="/contact" className="arch-btn arch-btn--primary">GET IN TOUCH <span className="arch-btn-arrow">→</span></Link>
                </div>
              </div>
              <div>
                <FAQ items={ABOUT_FAQS} defaultOpen={ABOUT_FAQS[0]?.question} />
              </div>
            </div>
          </div>
        </section>

        <FinalCTA
          eyebrow="Start with a walkthrough"
          title={"COME SEE THE\nSTUDIO FOR\nYOURSELF."}
          description="Walk through your floor plan at 1:1 scale and meet the team that would work on your project."
        />
      </main>
      <SiteFooter />
    </>
  );
}
