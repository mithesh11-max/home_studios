import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { WalkthroughTabs } from "@/components/site/WalkthroughTabs";
import { ExpandableRow } from "@/components/site/ExpandableRow";
import { BeforeAfterSlider } from "@/components/site/BeforeAfterSlider";
import { FAQ } from "@/components/site/FAQ";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { FinalCTA } from "@/components/site/FinalCTA";
import { StatCounter } from "@/components/site/StatCounter";
import { FadeUp } from "@/components/site/TextReveal";
import { SequenceHero } from "@/components/site/SequenceHero";
import { FloorPlanRise } from "@/components/site/FloorPlanRise";
import { SpatialProjectShowcase } from "@/components/site/SpatialProjectShowcase";
import { ArchitecturalMeasurement } from "@/components/site/ArchitecturalMeasurement";
import { useAppointment } from "@/lib/appointment-context";
import { useSmoothScroll } from "@/lib/lenis-context";
import { HOME_FAQS, CONTACT } from "@/lib/site-data";
import architectureImg from "@/assets/architecture-site.jpg";

export const Route = createFileRoute("/")({
  component: Index,
});

const PROCESS_STEPS = [
  { num: "01", title: "Schedule", description: "Call, WhatsApp or write in. Tell us about your project, plot size and timeline." },
  { num: "02", title: "Send Your Plan", description: "Share your floor plan and reserve a time slot at the studio." },
  { num: "03", title: "We Prepare", description: "Projection, props and furniture set up to match your exact plan." },
  { num: "04", title: "Walk Through", description: "Walk every room at true 1:1 scale. Leave with a plan you trust." },
];

const WHY_ROWS = [
  { num: "01", title: "Real Furniture", description: "Full-size sofas, beds, wardrobes and kitchen counters placed inside the projected outline — not small-scale models. You understand true furniture scale and clearance." },
  { num: "02", title: "Multiple Layouts", description: "Test more than one floor plan arrangement in the same session. Our prop walls are on wheels specifically so we can reconfigure instantly." },
  { num: "03", title: "40+ Prop Walls", description: "A library of full-height, movable prop walls in different sizes. Any room, any configuration, moved live as you request changes." },
  { num: "04", title: "Wireless Setup", description: "No cables across the floor. Wireless projection and wireless-controlled furniture means changes happen in seconds, not minutes." },
  { num: "05", title: "Family-Friendly Environment", description: "Netflix, Disney+, Stan and free WiFi in the waiting area. Bring children, parents or anyone else — they'll be comfortable while you walk." },
];

const STRUCTURAL_ITEMS = [
  { num: "01", label: "FOUNDATIONS" },
  { num: "02", label: "COLUMNS" },
  { num: "03", label: "BEAMS" },
  { num: "04", label: "SLABS" },
  { num: "05", label: "PLINTH BEAMS" },
  { num: "06", label: "REINFORCEMENT" },
];

const JOURNEY_STAGES = [
  { num: "01", word: "IMAGINE" },
  { num: "02", word: "VISUALIZE" },
  { num: "03", word: "WALK" },
  { num: "04", word: "DESIGN" },
  { num: "05", word: "BUILD" },
  { num: "06", word: "LIVE" },
];

const SERVICES_LIST = [
  { num: "01", label: "Walkthrough", tag: "VISUALIZATION", to: "/walkthrough" },
  { num: "02", label: "Construction", tag: "BUILD", to: "/construction" },
  { num: "03", label: "Structural Design", tag: "ENGINEERING", to: "/services/$slug" as const, slug: "structural-design" },
  { num: "04", label: "Plans Approval", tag: "REGULATORY", to: "/services/$slug" as const, slug: "plans-approval" },
  { num: "05", label: "Architecture Design", tag: "DESIGN", to: "/services/$slug" as const, slug: "architecture-design" },
  { num: "06", label: "Interior Designing", tag: "INTERIOR", to: "/services/$slug" as const, slug: "interior-design" },
];

const ARCH_ITEMS = [
  { label: "SITE", desc: "Plot orientation, setbacks and building envelope." },
  { label: "LIGHT", desc: "Natural light paths and cross-ventilation." },
  { label: "VENTILATION", desc: "Air movement through and across the plan." },
  { label: "LAYOUT", desc: "Circulation, room relationships and furniture fit." },
  { label: "VAASTU", desc: "Directional alignment where it matters to you." },
];

function Index() {
  const { open } = useAppointment();
  const { scrollTo } = useSmoothScroll();
  const hash = useRouterState({ select: (s) => s.location.hash });

  // When arriving via HOME nav from another page, the hash is "hs-content".
  // Scroll to the exact end of the hero sequence so the entire final lockup:
  // from "EXPERIENCE THE SPACE BEFORE YOU BUILD IT." down to "RR NAGAR / BENGALURU 1:1 SCALE"
  // is 100% visible in the viewport with no manual scrolling required.
  useEffect(() => {
    if (hash === "hs-content") {
      const scrollToEnd = () => {
        const section = document.querySelector<HTMLElement>(
          '[aria-label="Scroll-driven architectural walkthrough sequence"]'
        );
        if (section) {
          const maxScroll = section.offsetHeight - window.innerHeight;
          scrollTo(section.offsetTop + maxScroll, { immediate: true });
        } else {
          scrollTo(0, { immediate: true });
        }
      };

      scrollToEnd();
      const raf = requestAnimationFrame(scrollToEnd);
      const timer = setTimeout(scrollToEnd, 60);
      return () => {
        cancelAnimationFrame(raf);
        clearTimeout(timer);
      };
    }
  }, [hash, scrollTo]);

  return (
    <>
      <SiteHeader />
      <main>

        {/* ══════════════════════════════════════════════════════
            HERO — Scroll-driven 300-frame sequence
            ══════════════════════════════════════════════════════ */}
        <SequenceHero />

        {/* Anchor target — HOME nav from other pages scrolls here, skipping the hero sequence */}
        <div id="hs-content" />

        {/* ══════════════════════════════════════════════════════
            SCALE STATEMENT
            ══════════════════════════════════════════════════════ */}
        <section className="py-12 lg:py-16 bg-paper" aria-label="Scale statement">
          <div className="arch-container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-center">
              <FadeUp delay={0.05}>
                <p className="arch-label arch-label--accent mb-4">SECTION A—A</p>
                <h2 className="font-display text-ink leading-[0.95]"
                  style={{ fontSize: "var(--text-display-sm)" }}>
                  PAPER PLANS<br />LIE ABOUT<br />SCALE. YOUR<br />BODY DOESN'T.
                </h2>
                <p className="mt-5 text-stone text-[0.97rem] leading-relaxed max-w-[40ch]">
                  A 1:100 plan is 100× too small. Every judgment you make about room size, corridor width,
                  window placement — it's all at a scale your body has no reference for.
                  Our studio removes that gap.
                </p>
                <div className="mt-5 flex gap-5" aria-hidden="true">
                  <span className="arch-label">PROJECTION FIELD</span>
                  <span className="arch-label" style={{ color: "var(--rule-dark)" }}>—</span>
                  <span className="arch-label">1:1 SCALE</span>
                </div>
              </FadeUp>

              {/* Architecture site photo with clip-path reveal */}
              <ArchImageReveal />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            STATISTICS — Only verified numbers
            ══════════════════════════════════════════════════════ */}
        <section className="bg-ink py-10 lg:py-14" aria-label="Key statistics">
          <div className="arch-grid-dark absolute inset-0 opacity-30 pointer-events-none" aria-hidden="true" />
          <div className="relative arch-container">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-0 lg:divide-x" style={{ '--tw-divide-opacity': '1', borderColor: "rgba(255,255,255,0.08)" } as React.CSSProperties}>
              <div className="lg:pr-16 text-center lg:text-left">
                <StatCounter value={3000} suffix="+" label="WALKTHROUGHS COMPLETED" duration={2000} />
              </div>
              <div className="lg:pl-16 text-center lg:text-left">
                <StatCounter value={100} suffix="+" label="FIVE-STAR GOOGLE REVIEWS" duration={1400} />
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="arch-label arch-label--light">
                RR NAGAR / BENGALURU — SPATIAL CANVAS HOME STUDIOS
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            02 / FROM DRAWING TO SPACE — Interactive 3D Floor Plan Rise
            ══════════════════════════════════════════════════════ */}
        <FloorPlanRise />

        {/* ══════════════════════════════════════════════════════
            03 / WALKTHROUGH MODES
            ══════════════════════════════════════════════════════ */}
        <section className="py-12 lg:py-16 bg-paper" aria-label="Walkthrough modes">
          <div className="arch-container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-12 items-start">
              <div>
                <p className="arch-label arch-label--accent mb-3">03 / WALKTHROUGH</p>
                <h2 className="font-display text-ink leading-none mb-4"
                  style={{ fontSize: "var(--text-display-sm)" }}>
                  Four ways to understand your space before it's built.
                </h2>
                <p className="text-stone text-[0.93rem] leading-relaxed mb-6 max-w-[38ch]">
                  A single session can use one mode or all four — our team sets up whatever gives you
                  the clearest picture of your future home.
                </p>
                <Link to="/walkthrough" className="arch-btn arch-btn--outline">
                  LEARN MORE <span className="arch-btn-arrow">→</span>
                </Link>
              </div>
              <div>
                <WalkthroughTabs />
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            04 / WHY HOME STUDIOS — Expandable list
            ══════════════════════════════════════════════════════ */}
        <section className="py-12 lg:py-16" style={{ background: "var(--surface)" }} aria-label="Why Home Studios">
          <div className="arch-container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-12 items-start">
              <FadeUp>
                <p className="arch-label arch-label--accent mb-4">04 / WHY</p>
                <h2 className="font-display text-ink leading-none"
                  style={{ fontSize: "var(--text-display-sm)" }}>
                  What makes the<br />walkthrough studio<br />different.
                </h2>
              </FadeUp>
              <div>
                {WHY_ROWS.map((row) => (
                  <ExpandableRow key={row.num} num={row.num} title={row.title} description={row.description} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            05 / PROCESS TIMELINE
            ══════════════════════════════════════════════════════ */}
        <section className="py-12 lg:py-16 bg-paper" aria-label="How it works">
          <div className="arch-container">
            <p className="arch-label arch-label--accent mb-3">05 / PROCESS</p>
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-8">
              <h2 className="font-display text-ink leading-none" style={{ fontSize: "var(--text-display-sm)" }}>
                How a walkthrough<br />session works.
              </h2>
              <Link to="/walkthrough" className="arch-btn arch-btn--outline flex-shrink-0">
                SEE ALL DETAILS <span className="arch-btn-arrow">→</span>
              </Link>
            </div>
            <div style={{ borderTop: "1px solid var(--rule)", paddingTop: "3rem" }}>
              <ProcessTimeline steps={PROCESS_STEPS} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            06 / SPATIAL PROJECTS & SERVICES PORTFOLIO
            ══════════════════════════════════════════════════════ */}
        <SpatialProjectShowcase />

        {/* ══════════════════════════════════════════════════════
            07 / STRUCTURAL DESIGN
            ══════════════════════════════════════════════════════ */}
        <section className="py-12 lg:py-16" style={{ background: "var(--surface)" }} aria-label="Structural design">
          <div className="arch-container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-start">
              <FadeUp>
                <p className="arch-label arch-label--accent mb-3">07 / STRUCTURAL</p>
                <h2 className="font-display text-ink leading-none mb-4"
                  style={{ fontSize: "var(--text-display-sm)" }}>
                  Beauty above<br />depends on what<br />lies beneath.
                </h2>
                <p className="text-stone text-[0.93rem] leading-relaxed mb-6 max-w-[38ch]">
                  We deliver complete structural drawings — from excavation layout to reinforcement schedules —
                  so your contractor builds from engineering, not improvisation.
                </p>
                <Link to="/services/$slug" params={{ slug: "structural-design" }} className="arch-btn arch-btn--outline">
                  STRUCTURAL DESIGN <span className="arch-btn-arrow">→</span>
                </Link>
              </FadeUp>

              {/* Numbered list */}
              <FadeUp delay={0.15}>
                <div>
                  {STRUCTURAL_ITEMS.map((item, i) => (
                    <div
                      key={item.num}
                      className="flex items-baseline gap-5 py-4"
                      style={{
                        borderBottom: i < STRUCTURAL_ITEMS.length - 1 ? "1px solid var(--rule)" : "none",
                        borderTop: i === 0 ? "1px solid var(--rule)" : "none",
                      }}
                    >
                      <span className="arch-label" style={{ color: "var(--indigo)", minWidth: "1.8rem" }}>{item.num}</span>
                      <span className="font-display text-[1.5rem] font-light text-ink">{item.label}</span>
                    </div>
                  ))}
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            08 / ARCHITECTURE DESIGN — editorial
            ══════════════════════════════════════════════════════ */}
        <section className="py-12 lg:py-16 bg-paper" aria-label="Architecture design">
          <div className="arch-container">
            <p className="arch-label arch-label--accent mb-6">08 / ARCHITECTURE</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              {ARCH_ITEMS.map((item, i) => (
                <div
                  key={item.label}
                  className="py-6 px-5 group"
                  style={{
                    borderLeft: "1px solid var(--rule)",
                    borderRight: i === ARCH_ITEMS.length - 1 ? "1px solid var(--rule)" : "none",
                  }}
                >
                  <p className="arch-label arch-label--accent mb-3">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="font-display text-[1.45rem] font-light text-ink mb-2">{item.label}</h3>
                  <p className="text-stone text-[0.82rem] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Link to="/services/$slug" params={{ slug: "architecture-design" }} className="arch-btn arch-btn--outline">
                ARCHITECTURE DESIGN <span className="arch-btn-arrow">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            09 / INTERIORS — Before/after slider
            ══════════════════════════════════════════════════════ */}
        <section className="py-12 lg:py-16" style={{ background: "var(--surface)" }} aria-label="Interior design">
          <div className="arch-container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-10 items-start">
              <FadeUp>
                <p className="arch-label arch-label--accent mb-3">09 / INTERIORS</p>
                <h2 className="font-display text-ink leading-none mb-4"
                  style={{ fontSize: "var(--text-display-sm)" }}>
                  Test the interior<br />before you build it.
                </h2>
                <p className="text-stone text-[0.93rem] leading-relaxed mb-6 max-w-[36ch]">
                  Kitchen islands, wardrobe runs, TV units — tested at real scale in the studio
                  before a single cabinet is ordered.
                </p>
                <Link to="/services/$slug" params={{ slug: "interior-design" }} className="arch-btn arch-btn--outline">
                  INTERIOR DESIGNING <span className="arch-btn-arrow">→</span>
                </Link>
              </FadeUp>
              <FadeUp delay={0.15}>
                <BeforeAfterSlider beforeLabel="BEFORE" afterLabel="AFTER" aspect="7/5" />
                <p className="mt-3 arch-label text-center">
                  DRAG TO COMPARE — RAW SPACE / FINISHED INTERIOR
                </p>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            10 / COMPLETE JOURNEY — Oversized serif stages
            ══════════════════════════════════════════════════════ */}
        <section className="py-12 lg:py-16 bg-paper overflow-hidden" aria-label="Complete journey">
          <div className="arch-container">
            <p className="arch-label arch-label--accent mb-4">10 / JOURNEY</p>
            <div>
              {JOURNEY_STAGES.map((stage, i) => (
                <JourneyStage key={stage.num} stage={stage} index={i} total={JOURNEY_STAGES.length} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            11 / FAQ
            ══════════════════════════════════════════════════════ */}
        <section className="py-12 lg:py-16" style={{ background: "var(--surface)" }} aria-label="Frequently asked questions">
          <div className="arch-container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.5fr] lg:gap-10 items-start">
              <FadeUp>
                <p className="arch-label arch-label--accent mb-3">11 / FAQ</p>
                <h2 className="font-display text-ink leading-none"
                  style={{ fontSize: "var(--text-display-sm)" }}>
                  Questions before<br />your first visit.
                </h2>
              </FadeUp>
              <FAQ items={HOME_FAQS} defaultOpen={HOME_FAQS[0]?.question} />
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            CONTACT PREVIEW
            ══════════════════════════════════════════════════════ */}
        <section className="py-10 bg-paper" style={{ borderTop: "1px solid var(--rule)" }} aria-label="Contact information">
          <div className="arch-container">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              {[
                { label: "PHONE", value: CONTACT.phone, href: CONTACT.phoneHref },
                { label: "WHATSAPP", value: "Message us", href: CONTACT.whatsappHref },
                { label: "EMAIL", value: CONTACT.email, href: CONTACT.emailHref },
                { label: "LOCATION", value: "RR Nagar, Bengaluru", href: "/contact" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="arch-label mb-2">{item.label}</p>
                  <a
                    href={item.href}
                    className="text-ink text-[0.88rem] hover:text-indigo transition-colors"
                    style={{ textDecoration: "none" }}
                    {...(item.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {item.value}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FinalCTA
          eyebrow="Ready when you are"
          title={"DON'T JUST LOOK\nAT YOUR PLAN.\nWALK THROUGH IT."}
        />
      </main>

      <SiteFooter />

      {/* WhatsApp float */}
      <a
        href={CONTACT.whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="arch-wa-float"
        aria-label="Chat with Home Studios on WhatsApp"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WHATSAPP US
      </a>
    </>
  );
}

function JourneyStage({ stage, index, total }: { stage: { num: string; word: string }; index: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });

  return (
    <div
      ref={ref}
      className="flex items-baseline gap-6 py-5 lg:py-6"
      style={{
        borderBottom: index < total - 1 ? "1px solid var(--rule)" : "none",
        borderTop: index === 0 ? "1px solid var(--rule)" : "none",
      }}
    >
      <motion.span
        className="arch-label flex-shrink-0"
        style={{ color: "var(--indigo)", minWidth: "2rem" }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.05 }}
      >
        {stage.num}
      </motion.span>
      <div style={{ overflow: "hidden" }}>
        <motion.span
          className="font-display text-ink leading-none block"
          style={{ fontSize: "var(--text-display-md)" }}
          initial={{ y: "110%" }}
          animate={inView ? { y: "0%" } : {}}
          transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          {stage.word}
        </motion.span>
      </div>
    </div>
  );
}

/** Architecture site photo with scroll-triggered clip-path reveal + zoom */
function ArchImageReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <div ref={ref} className="relative overflow-hidden arch-img-grade" style={{ borderRadius: 0 }}>
      {/* Clip-path wipe from left */}
      <motion.div
        className="relative overflow-hidden"
        initial={{ clipPath: "inset(0 100% 0 0)" }}
        animate={inView ? { clipPath: "inset(0 0% 0 0)" } : {}}
        transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Image with zoom-in */}
        <motion.img
          src={architectureImg}
          alt="Architecture and site — Spatial Canvas Home Studios"
          className="w-full block"
          style={{ aspectRatio: "4/3", objectFit: "cover", objectPosition: "center", display: "block" }}
          initial={{ scale: 1.08 }}
          animate={inView ? { scale: 1.0 } : {}}
          transition={{ duration: 1.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          draggable={false}
        />
        {/* Subtle dark indigo overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 50%, rgba(8,11,26,0.6) 100%)" }}
          aria-hidden="true"
        />
      </motion.div>
      {/* Architectural corner annotations */}
      <motion.p
        className="absolute top-3 right-3 arch-label"
        style={{ color: "rgba(255,255,255,0.7)", background: "rgba(8,11,26,0.75)", padding: "2px 6px" }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 1.0 }}
        aria-hidden="true"
      >
        SECTION A—A
      </motion.p>
      <motion.p
        className="absolute bottom-3 left-3 arch-label"
        style={{ color: "rgba(255,255,255,0.7)", background: "rgba(8,11,26,0.75)", padding: "2px 6px" }}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 1.1 }}
        aria-hidden="true"
      >
        PROJECTION FIELD — 1:1 SCALE
      </motion.p>
    </div>
  );
}
