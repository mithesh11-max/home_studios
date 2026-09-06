import { Link } from "@tanstack/react-router";
import { useAppointment } from "@/lib/appointment-context";

interface FinalCTAProps {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryLabel?: string;
  primaryTo?: string;
  onPrimaryClick?: () => void;
}

export function FinalCTA({
  eyebrow = "Ready when you are",
  title,
  description,
  primaryLabel = "BOOK YOUR APPOINTMENT",
  primaryTo,
  onPrimaryClick,
}: FinalCTAProps) {
  const { open } = useAppointment();

  return (
    <section
      className="relative overflow-hidden bg-paper py-14 lg:py-20"
      style={{ borderTop: "1px solid var(--border)" }}
      aria-label="Call to action"
    >

      {/* Architectural grid overlay */}
      <div className="arch-grid-dark absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />

      <div className="relative arch-container">
        <div className="max-w-[800px]">
          <p className="arch-label mb-6" style={{ color: "var(--indigo)" }}>{eyebrow}</p>
          <h2 className="font-display text-white leading-[0.95]"
            style={{ fontSize: "var(--text-display-md)" }}>
            {title.split("\n").map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </h2>
          {description && (
            <p className="mt-6 text-[0.97rem] leading-relaxed max-w-[44ch]" style={{ color: "var(--text-secondary)" }}>
              {description}
            </p>
          )}
          <div className="mt-10 flex flex-wrap gap-4 items-center">
            {primaryTo ? (
              <Link to={primaryTo as "/"} className="arch-btn arch-btn--primary">
                {primaryLabel} <span className="arch-btn-arrow">→</span>
              </Link>
            ) : (
              <button
                onClick={onPrimaryClick ?? (() => open())}
                className="arch-btn arch-btn--primary"
              >
                {primaryLabel} <span className="arch-btn-arrow">→</span>
              </button>
            )}
            <Link to="/contact" className="arch-btn arch-btn--ghost-light">
              CONTACT US <span className="arch-btn-arrow">→</span>
            </Link>
          </div>
        </div>

        {/* Annotation */}
        <div
          className="absolute bottom-0 right-0 pb-6 pr-6 hidden lg:block"
          aria-hidden="true"
        >
          <p className="arch-label" style={{ color: "var(--text-muted)" }}>
            HOME STUDIOS<br />
            RR NAGAR / BENGALURU<br />
            12.92°N 77.51°E
          </p>
        </div>
      </div>
    </section>
  );
}
