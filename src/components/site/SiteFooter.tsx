import { Link } from "@tanstack/react-router";
import { CONTACT } from "@/lib/site-data";

const SERVICES = [
  { label: "3D Walk Through", to: "/walkthrough" },
  { label: "Construction", to: "/construction" },
  { label: "Structural Design", to: "/services/structural-design" },
  { label: "Plans Approval", to: "/services/plans-approval" },
  { label: "Architecture Design", to: "/services/architecture-design" },
  { label: "Interior Designing", to: "/services/interior-design" },
];

const SITE = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Walkthrough", to: "/walkthrough" },
  { label: "Construction", to: "/construction" },
  { label: "Contact", to: "/contact" },
];

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden bg-paper text-white/50" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="arch-grid-dark" style={{ opacity: 0.25, position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }} aria-hidden="true" />

      <div className="relative arch-container">
        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.2fr]"
          style={{ borderBottom: "1px solid var(--border)" }}>

          {/* Brand col */}
          <div>
            <Link to="/" className="inline-block mb-5">
              <img src="/logo-footer.png" alt="Home Studios" className="h-10 w-auto opacity-90" />
            </Link>
            <p className="arch-label arch-label--light mb-3 leading-loose" style={{ color: "var(--text-muted)" }}>
              Architectural Visualization<br />& Construction
            </p>
            <p className="text-[0.85rem] leading-relaxed max-w-[28ch] mt-4" style={{ color: "var(--text-secondary)" }}>
              Walk through your future home at real scale before a single brick is laid.
            </p>

            {/* Coordinates */}
            <p className="arch-label mt-6 leading-loose" style={{ color: "var(--text-muted)" }}>
              12.92°N 77.51°E<br />
              RR NAGAR / BENGALURU
            </p>
          </div>

          {/* Site links */}
          <div>
            <p className="arch-label arch-label--light mb-5" style={{ color: "var(--text-muted)" }}>Studio</p>
            <ul className="space-y-3">
              {SITE.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}
                    className="text-[0.85rem] transition-colors"
                    style={{ textDecoration: "none", color: "var(--text-secondary)" }}
                    activeProps={{ style: { color: "var(--indigo)" } }}
                  >
                    <span className="hover:text-indigo transition-colors">{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <p className="arch-label arch-label--light mb-5" style={{ color: "var(--text-muted)" }}>Services</p>
            <ul className="space-y-3">
              {SERVICES.map((service) => (
                <li key={service.to}>
                  <Link to={service.to}
                    className="text-[0.85rem] transition-colors"
                    style={{ textDecoration: "none", color: "var(--text-secondary)" }}
                    activeProps={{ style: { color: "var(--indigo)" } }}
                  >
                    <span className="hover:text-indigo transition-colors">{service.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="arch-label arch-label--light mb-5" style={{ color: "var(--text-muted)" }}>Get in touch</p>
            <ul className="space-y-3 text-[0.85rem]">
              <li>
                <a href={CONTACT.phoneHref}
                  className="transition-colors hover:text-indigo"
                  style={{ color: "var(--text-secondary)" }}>
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a href={CONTACT.emailHref}
                  className="transition-colors hover:text-indigo"
                  style={{ color: "var(--text-secondary)" }}>
                  {CONTACT.email}
                </a>
              </li>
              <li className="leading-relaxed mt-2" style={{ color: "var(--text-muted)" }}>
                {CONTACT.addressLines.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-6">
          <p className="arch-label" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Home Studios. All rights reserved.{" "}
            <a
              href="https://bettercallmithesh.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--primary)", textDecoration: "underline", textUnderlineOffset: "3px" }}
            >
              click here
            </a>
          </p>
          <p className="arch-label" style={{ color: "var(--text-muted)" }}>
            HOME STUDIOS — RR NAGAR / BENGALURU
          </p>
        </div>
      </div>
    </footer>
  );
}
