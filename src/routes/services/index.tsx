import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FinalCTA } from "@/components/site/FinalCTA";
import { SpatialProjectShowcase } from "@/components/site/SpatialProjectShowcase";
import { ServiceExplorer } from "@/components/site/ServiceExplorer";
import servicesBannerImg from "@/assets/home-studios-hero.jpg";

export const Route = createFileRoute("/services/")({
  component: ServicesHub,
});

const SERVICES = [
  { num: "01", label: "3D Walk Through", tag: "VISUALIZATION", brief: "Walk your floor plan at 1:1 scale before a brick is laid.", to: "/walkthrough" as const },
  { num: "02", label: "Construction", tag: "BUILD", brief: "Five packages with written specifications and dedicated site teams.", to: "/construction" as const },
  { num: "03", label: "Structural Design", tag: "ENGINEERING", brief: "Complete excavation to reinforcement drawings engineered to your site.", to: "/services/$slug" as const, slug: "structural-design" },
  { num: "04", label: "Plans Approval", tag: "REGULATORY", brief: "Documentation and coordination for municipal building approval.", to: "/services/$slug" as const, slug: "plans-approval" },
  { num: "05", label: "Architecture Design", tag: "DESIGN", brief: "Site-specific layouts tested in our studio before finalization.", to: "/services/$slug" as const, slug: "architecture-design" },
  { num: "06", label: "Interior Designing", tag: "INTERIOR", brief: "Space planning and material concepts tested at real scale.", to: "/services/$slug" as const, slug: "interior-design" },
];

function ServicesHub() {
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
          aria-label="Services hero"
        >
          {/* Parallax Hero Banner Image */}
          <motion.div
            style={{ scale: heroImgScale, y: heroImgY }}
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
          >
            <img
              src={servicesBannerImg}
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
            <p className="arch-label arch-label--accent mb-4">STUDIO INDEX</p>
            <h1 className="font-display text-white leading-[0.92] mb-6"
              style={{ fontSize: "var(--text-display-lg)" }}>
              SIX SERVICES.<br />ONE STUDIO.
            </h1>
            <p className="text-white/45 text-[0.97rem] leading-relaxed max-w-[44ch]">
              Mix and match, or use all six. Visualize, engineer, approve, build and finish
              your project without switching vendors or re-explaining your brief.
            </p>
          </div>
        </section>

        {/* ── Interactive Service Explorer Matrix ── */}
        <ServiceExplorer />

        {/* ── Spatial Project Portfolio ── */}
        <SpatialProjectShowcase
          eyebrow="PORTFOLIO & SPATIAL EXECUTION"
          title="Experience each discipline in space."
          description="From laser-projected 1:1 floor plans to structural engineering and interior fit-outs. Select any discipline to inspect."
          showAllLink={false}
        />

        {/* ── Which service? ── */}
        <section className="py-12 bg-paper" style={{ borderTop: "1px solid var(--rule)" }} aria-label="Service guidance">
          <div className="arch-container">
            <p className="arch-label arch-label--accent mb-3">NOT SURE WHERE TO START</p>
            <h2 className="font-display text-ink leading-none mb-6"
              style={{ fontSize: "var(--text-display-sm)" }}>
              Which service do you need right now?
            </h2>
            <div className="overflow-x-auto" style={{ border: "1px solid var(--rule)" }}>
              <table className="w-full min-w-[540px] border-collapse">
                <thead>
                  <tr>
                    {["Service", "Best for", "When"].map((h) => (
                      <th key={h} className="px-5 py-4 text-left bg-ink" style={{ fontFamily: "var(--font-sans)", fontSize: "10px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "3D Walk Through", for: "Testing a layout before it's finalized", when: "Before construction starts", to: "/walkthrough" as const },
                    { name: "Architecture Design", for: "Getting a floor plan drawn", when: "Start of a new project", slug: "architecture-design" },
                    { name: "Structural Design", for: "Engineering the plan safely", when: "After the architectural plan is set", slug: "structural-design" },
                    { name: "Plans Approval", for: "Getting municipal clearance", when: "Before excavation begins", slug: "plans-approval" },
                    { name: "Interior Designing", for: "Finishing and furnishing the space", when: "Alongside or after construction", slug: "interior-design" },
                  ].map((row) => (
                    <tr key={row.name} className="hover:bg-paper-hi transition-colors" style={{ borderBottom: "1px solid var(--rule)" }}>
                      <th scope="row" className="px-5 py-4 text-left font-sans font-600 text-ink text-[0.88rem]">
                        {"slug" in row ? (
                          <Link to="/services/$slug" params={{ slug: row.slug! }} className="hover:text-indigo transition-colors" style={{ textDecoration: "none" }}>
                            {row.name}
                          </Link>
                        ) : (
                          <Link to={row.to} className="hover:text-indigo transition-colors" style={{ textDecoration: "none" }}>
                            {row.name}
                          </Link>
                        )}
                      </th>
                      <td className="px-5 py-4 text-stone text-[0.88rem]">{row.for}</td>
                      <td className="px-5 py-4 text-stone text-[0.88rem]">{row.when}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <FinalCTA
          eyebrow="Not sure which service you need"
          title={"TELL US ABOUT\nYOUR PROJECT\nAND WE'LL ADVISE."}
          primaryTo="/contact"
          primaryLabel="GET IN TOUCH"
        />
      </main>
      <SiteFooter />
    </>
  );
}
