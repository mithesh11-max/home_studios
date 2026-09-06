import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeroProps {
  eyebrow: string;
  crumbs: Crumb[];
  title: string;
  description?: string;
  cta?: React.ReactNode;
}

export function PageHero({ eyebrow, crumbs, title, description, cta }: PageHeroProps) {
  return (
    <section className="relative bg-dark pt-[72px] overflow-hidden">
      {/* Grid overlay */}
      <div className="hs-grid-bg-dark absolute inset-0 opacity-50 pointer-events-none" />

      {/* Dimension annotations */}
      <div className="absolute top-6 right-8 font-mono text-[0.6rem] tracking-[0.14em] text-white/20 uppercase hidden lg:block">
        12°59'N — 77°33'E
      </div>

      <div className="relative mx-auto max-w-[1300px] px-5 sm:px-8 py-16 sm:py-24">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-1.5 font-mono text-[0.68rem] tracking-[0.1em] uppercase text-white/30">
            {crumbs.map((crumb, i) => (
              <li key={crumb.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-white/60 transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white/50">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Eyebrow */}
        <p className="font-mono text-[0.68rem] tracking-[0.18em] uppercase text-accent-hs mb-5">
          {eyebrow}
        </p>

        {/* Title */}
        <h1 className="font-display text-[clamp(2.2rem,5vw,4rem)] font-light text-white leading-[1.04] max-w-[22ch]">
          {title}
        </h1>

        {/* Description */}
        {description && (
          <p className="mt-6 text-[1.04rem] text-white/55 max-w-[52ch] leading-relaxed">
            {description}
          </p>
        )}

        {/* CTA */}
        {cta && <div className="mt-8">{cta}</div>}
      </div>

      {/* Bottom architectural line */}
      <div className="h-px bg-white/10" />
    </section>
  );
}
