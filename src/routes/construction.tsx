import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FinalCTA } from "@/components/site/FinalCTA";
import { FadeUp } from "@/components/site/TextReveal";
import { PackageSelector } from "@/components/site/PackageSelector";
import { FAQ } from "@/components/site/FAQ";
import { CONTACT } from "@/lib/site-data";
import constructionBannerImg from "@/assets/architecture-site.jpg";

export const Route = createFileRoute("/construction")({
  component: Construction,
});

const WHY = [
  { num: "01", title: "Tested before it's built", desc: "Your layout is tested in our walkthrough studio before construction starts — so the plan you build from is one you've physically stood inside." },
  { num: "02", title: "One team, one brief", desc: "Structural design, plan approval, architecture and construction run through the same team. No re-explaining." },
  { num: "03", title: "Clear package specifications", desc: "Five packages with written specifications. Every material and fit-out confirmed before site work begins." },
  { num: "04", title: "Regular site visits", desc: "A named project manager visits regularly and reports progress against the agreed schedule." },
];

const TIMELINE = [
  { num: "01", title: "Foundation & Structure", desc: "Excavation, footing, plinth and RCC frame to the approved structural design." },
  { num: "02", title: "Walls, Roofing & Utilities", desc: "Masonry, roof slab, plumbing and electrical rough-in per package specification." },
  { num: "03", title: "Finishing", desc: "Flooring, painting, doors, windows, fittings and fixtures to your package spec." },
  { num: "04", title: "Handover", desc: "Final walkthrough, snag list closure and handover of your completed home." },
];

const FAQS = [
  { question: "Which package suits my project?", answer: "Basic and Deluxe are for cost-conscious builds. Luxury is our most requested mid-tier. Elite and Supreme are for clients who want premium and designer-grade finishes throughout." },
  { question: "Is structural design included?", answer: "Structural design and plans approval are separate services. Most clients bundle them with the construction package for a single coordinated quote." },
  { question: "Can I change package partway through?", answer: "Upgrades are possible before the relevant stage begins — for example, moving to a higher kitchen tier before kitchen fit-out starts. We confirm the cost impact before making any change." },
  { question: "Do you handle renovations?", answer: "Yes — our construction team takes on both new builds and renovations. Get in touch with your site details for a scoped quote." },
  { question: "How long does a build take?", answer: "Most independent homes run 10–14 months from foundation to handover. Exact duration depends on built-up area, package and site conditions." },
];

function Construction() {
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
        {/* ── Hero with Scroll-Motion Banner ── */}
        <section
          ref={heroRef}
          className="relative pt-32 pb-14 lg:pb-18 overflow-hidden bg-ink"
          aria-label="Page hero"
        >
          {/* Parallax Hero Banner Image */}
          <motion.div
            style={{ scale: heroImgScale, y: heroImgY }}
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
          >
            <img
              src={constructionBannerImg}
              alt=""
              className="w-full h-full object-cover object-center"
              style={{ filter: "brightness(0.32) contrast(1.08) saturate(0.85)" }}
            />
          </motion.div>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(160deg, rgba(8,11,26,0.85) 0%, rgba(8,11,26,0.7) 45%, rgba(8,11,26,0.95) 100%)",
            }}
            aria-hidden="true"
          />
          <div className="arch-grid-dark absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />

          <div className="relative arch-container">
            <p className="arch-label arch-label--accent mb-4">02 / CONSTRUCTION</p>
            <h1 className="font-display text-white leading-[0.92] mb-6"
              style={{ fontSize: "var(--text-display-lg)" }}>
              FIVE PACKAGES.<br />ONE FIXED<br />SPECIFICATION<br />SHEET FOR EACH.
            </h1>
            <p className="text-white/45 text-[0.97rem] leading-relaxed max-w-[46ch] mb-8">
              Every Home Studios construction package sets out exactly what's used — structure, kitchen,
              washrooms, doors, windows, electrical, flooring, painting and amenities —
              with clear written specifications for your project.
            </p>
            <Link to="/contact" className="arch-btn arch-btn--primary">
              GET A QUOTE <span className="arch-btn-arrow">→</span>
            </Link>
          </div>
        </section>

        {/* ── 02 / Package Selector Matrix & Cost Estimator ── */}
        <PackageSelector />

        {/* ── Why build with Home Studios ── */}
        <section className="py-12 lg:py-16" style={{ background: "var(--surface)" }} aria-label="Why build with Home Studios">
          <div className="arch-container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-start">
              <FadeUp>
                <p className="arch-label arch-label--accent mb-4">WHY HOME STUDIOS</p>
                <h2 className="font-display text-ink leading-none mb-4"
                  style={{ fontSize: "var(--text-display-sm)" }}>
                  The same team<br />that designs it<br />also builds it.
                </h2>
                <p className="text-stone text-[0.95rem] leading-relaxed max-w-[40ch]">
                  Architecture, structural engineering, plan approval, walkthrough testing and construction —
                  one team, one brief, one coordinated project.
                </p>
              </FadeUp>
              <div>
                {WHY.map((item, i) => (
                  <div
                    key={item.num}
                    className="flex gap-5 py-4"
                    style={{
                      borderBottom: i < WHY.length - 1 ? "1px solid var(--rule)" : "none",
                      borderTop: i === 0 ? "1px solid var(--rule)" : "none",
                    }}
                  >
                    <span className="arch-label arch-label--accent flex-shrink-0" style={{ minWidth: "1.8rem" }}>{item.num}</span>
                    <div>
                      <p className="font-sans font-600 text-ink text-[0.92rem] mb-1">{item.title}</p>
                      <p className="text-stone text-[0.88rem] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Build timeline ── */}
        <section className="py-12 lg:py-16 bg-paper" aria-label="Construction timeline">
          <div className="arch-container">
            <p className="arch-label arch-label--accent mb-6">TYPICAL TIMELINE</p>
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 lg:grid-cols-4" style={{ borderLeft: "1px solid var(--rule)" }}>
              {TIMELINE.map((stage) => (
                <div
                  key={stage.num}
                  className="p-6"
                  style={{ borderRight: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}
                >
                  <p className="arch-label arch-label--accent mb-3">{stage.num}</p>
                  <h3 className="font-display text-[1.4rem] font-light text-ink mb-2">{stage.title}</h3>
                  <p className="text-stone text-[0.86rem] leading-relaxed">{stage.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-stone text-[0.82rem] leading-relaxed">
              Most independent homes run 10–14 months from foundation to handover. Exact duration depends on built-up area, package and site conditions.
            </p>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-12 lg:py-16" style={{ background: "var(--surface)" }} aria-label="FAQ">
          <div className="arch-container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-10 items-start">
              <FadeUp>
                <p className="arch-label arch-label--accent mb-3">FAQ</p>
                <h2 className="font-display text-ink leading-none"
                  style={{ fontSize: "var(--text-display-sm)" }}>
                  Construction —<br />frequently asked.
                </h2>
              </FadeUp>
              <FAQ items={FAQS} defaultOpen={FAQS[0]?.question} />
            </div>
          </div>
        </section>

        <FinalCTA
          eyebrow="Ready to build"
          title={"GET A PACKAGE\nQUOTE FOR\nYOUR PLOT."}
        />
      </main>
      <SiteFooter />
    </>
  );
}
