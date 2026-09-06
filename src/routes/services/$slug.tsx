import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FinalCTA } from "@/components/site/FinalCTA";
import { FadeUp } from "@/components/site/TextReveal";
import { ProcessTimeline } from "@/components/site/ProcessTimeline";
import { FAQ } from "@/components/site/FAQ";
import { getServiceBySlug } from "@/lib/site-data";
import { useAppointment } from "@/lib/appointment-context";

export const Route = createFileRoute("/services/$slug")({
  beforeLoad: ({ params }) => {
    if (!getServiceBySlug(params.slug)) throw notFound();
  },
  component: ServiceDetail,
});

// Per-service editorial headlines
const HERO_HEADLINES: Record<string, string> = {
  "3d-walkthrough": "WALK THROUGH\nYOUR FUTURE\nHOME.",
  "structural-design": "BEAUTY ABOVE\nDEPENDS ON\nWHAT LIES BENEATH.",
  "plans-approval": "CLEAR THE\nAPPROVAL BEFORE\nYOU DIG.",
  "architecture-design": "ARCHITECTURE\nTHAT BELONGS\nTO THE SITE.",
  "interior-design": "TEST THE INTERIOR\nBEFORE YOU\nBUILD IT.",
};

// Per-service technical label arrays
const TECH_LABELS: Record<string, string[]> = {
  "3d-walkthrough": ["1:1 SCALE", "LASER", "AR", "VR", "REAL FURNITURE"],
  "structural-design": ["FOUNDATION", "FOOTING", "COLUMNS", "PLINTH BEAMS", "REINFORCEMENT"],
  "plans-approval": ["SETBACKS", "FAR", "BYE-LAWS", "SUBMISSION", "SANCTION"],
  "architecture-design": ["LIGHT", "VENTILATION", "LAYOUT", "VAASTU", "BRIEF"],
  "interior-design": ["LIGHTING", "FURNITURE", "MATERIALS", "STORAGE", "CIRCULATION"],
};

function ServiceDetail() {
  const { slug } = Route.useParams();
  const service = getServiceBySlug(slug);
  const { open } = useAppointment();

  if (!service) return null;

  const headline = HERO_HEADLINES[slug] ?? service.name.toUpperCase();
  const techLabels = TECH_LABELS[slug] ?? [];

  const steps = service.steps.map((s, i) => ({
    num: String(i + 1).padStart(2, "0"),
    title: s.title,
    description: s.description,
  }));

  return (
    <>
      <SiteHeader />
      <main>
        {/* ── Hero ── */}
        <section
          className="relative pt-32 pb-14 lg:pb-18 overflow-hidden"
          style={{ background: "linear-gradient(160deg, #1C1914 0%, #111111 100%)" }}
          aria-label={`${service.name} hero`}
        >
          <div className="arch-grid-dark absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />
          <div className="relative arch-container">
            <p className="arch-label arch-label--accent mb-4">SERVICE — {service.name.toUpperCase()}</p>
            <h1 className="font-display text-white leading-[0.92] mb-6"
              style={{ fontSize: "var(--text-display-lg)" }}>
              {headline.split("\n").map((line, i) => (
                <span key={i} className="block">{line}</span>
              ))}
            </h1>
            <p className="text-white/45 text-[0.97rem] leading-relaxed max-w-[46ch] mb-8">
              {service.heroLede}
            </p>

            {/* Technical labels */}
            {techLabels.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-8" aria-hidden="true">
                {techLabels.map((label) => (
                  <span key={label} className="arch-label border px-3 py-1.5" style={{ borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.35)" }}>
                    {label}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <button onClick={() => open(slug)} className="arch-btn arch-btn--primary">
                BOOK YOUR APPOINTMENT <span className="arch-btn-arrow">→</span>
              </button>
              <Link to="/contact" className="arch-btn arch-btn--ghost-light">
                GET A QUOTE <span className="arch-btn-arrow">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Overview ── */}
        <section className="py-12 lg:py-16 bg-paper" aria-label="Service overview">
          <div className="arch-container">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 items-start">
              <FadeUp>
                <p className="arch-label arch-label--accent mb-3">WHAT THIS COVERS</p>
                <h2 className="font-display text-ink leading-none mb-4"
                  style={{ fontSize: "var(--text-display-sm)" }}>
                  {service.name}
                </h2>
                {service.overview.map((para, i) => (
                  <p key={i} className="text-stone text-[0.97rem] leading-relaxed mb-4 max-w-[50ch]">{para}</p>
                ))}
              </FadeUp>

              {/* Highlights */}
              <FadeUp delay={0.15}>
                <div style={{ border: "1px solid var(--rule)", padding: "1.5rem" }}>
                  <p className="arch-label arch-label--accent mb-4">HIGHLIGHTS</p>
                  <ul className="space-y-3">
                    {service.highlights.map((h) => (
                      <li key={h} className="flex gap-3 items-start text-[0.9rem] text-ink leading-relaxed">
                        <span className="flex-shrink-0 mt-0.5" style={{ color: "var(--indigo)" }} aria-hidden="true">—</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            </div>
          </div>
        </section>

        {/* ── Process ── */}
        <section className="py-12 lg:py-16" style={{ background: "var(--surface)" }} aria-label="Process">
          <div className="arch-container">
            <p className="arch-label arch-label--accent mb-3">PROCESS</p>
            <h2 className="font-display text-ink leading-none mb-6"
              style={{ fontSize: "var(--text-display-sm)" }}>
              {service.name} — step by step.
            </h2>
            <div style={{ borderTop: "1px solid var(--rule)", paddingTop: "1.5rem" }}>
              <ProcessTimeline steps={steps} />
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        {service.faqs.length > 0 && (
          <section className="py-12 lg:py-16 bg-paper" aria-label="Frequently asked questions">
            <div className="arch-container">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-10 items-start">
                <FadeUp>
                  <p className="arch-label arch-label--accent mb-4">FAQ</p>
                  <h2 className="font-display text-ink leading-none"
                    style={{ fontSize: "var(--text-display-sm)" }}>
                    {service.name} —<br />frequently asked.
                  </h2>
                </FadeUp>
                <FAQ
                  items={service.faqs.map((f) => ({ question: f.question, answer: f.answer }))}
                  defaultOpen={service.faqs[0]?.question}
                />
              </div>
            </div>
          </section>
        )}

        <FinalCTA
          eyebrow={`Get started with ${service.name.toLowerCase()}`}
          title={`GET IN TOUCH\nABOUT\n${service.name.toUpperCase()}.`}
        />
      </main>
      <SiteFooter />
    </>
  );
}
