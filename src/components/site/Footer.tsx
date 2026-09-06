import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { CONTACT, SERVICES } from "@/lib/site-data";

const FOOTER_LINKS = [
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Construction", to: "/construction" },
  { label: "Contact", to: "/contact" },
];

export function Footer() {
  return (
    <footer className="bg-dark text-white/60 pt-16">
      {/* Architectural grid overlay */}
      <div className="relative">
        <div className="hs-grid-bg-dark absolute inset-0 opacity-50 pointer-events-none" />

        <div className="relative mx-auto max-w-[1300px] px-5 sm:px-8">
          {/* Main grid */}
          <div className="grid grid-cols-1 gap-10 border-b border-white/10 pb-14 sm:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr_1fr]">
            {/* Brand col */}
            <div>
              <Link to="/" className="inline-block mb-5">
                <img src="/logo-footer.png" alt="Home Studios" className="h-12 w-auto opacity-90" />
              </Link>
              <p className="text-[0.88rem] text-white/45 leading-relaxed max-w-[30ch] mb-6">
                Real-size 3D walkthroughs, construction, structural design and plan approvals — under one roof in Bengaluru.
              </p>
              {/* Technical annotation */}
              <div className="font-mono text-[0.62rem] tracking-[0.16em] text-white/25 uppercase mb-5">
                18°33'N — 77°17'E<br />
                RR Nagar / Bengaluru
              </div>
              <div className="flex gap-2">
                <a
                  href={CONTACT.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with Home Studios on WhatsApp"
                  className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/40 hover:border-accent-hs hover:text-accent-hs transition-colors"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Company links */}
            <div>
              <h4 className="mb-5 font-mono text-[0.68rem] font-700 tracking-[0.18em] uppercase text-white/35">
                Company
              </h4>
              <ul className="space-y-3">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-[0.88rem] text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="mb-5 font-mono text-[0.68rem] font-700 tracking-[0.18em] uppercase text-white/35">
                Services
              </h4>
              <ul className="space-y-3">
                {SERVICES.map((service) => (
                  <li key={service.slug}>
                    <Link
                      to="/services/$slug"
                      params={{ slug: service.slug }}
                      className="text-[0.88rem] text-white/50 hover:text-white transition-colors"
                    >
                      {service.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/construction" className="text-[0.88rem] text-white/50 hover:text-white transition-colors">
                    Construction
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-5 font-mono text-[0.68rem] font-700 tracking-[0.18em] uppercase text-white/35">
                Studio
              </h4>
              <ul className="space-y-3 text-[0.88rem]">
                <li>
                  <a href={CONTACT.phoneHref} className="text-white/50 hover:text-white transition-colors">
                    {CONTACT.phone}
                  </a>
                </li>
                <li>
                  <a href={CONTACT.emailHref} className="text-white/50 hover:text-white transition-colors">
                    {CONTACT.email}
                  </a>
                </li>
                <li className="text-white/35">
                  {CONTACT.addressLines.map((line) => (
                    <span key={line} className="block leading-relaxed">
                      {line}
                    </span>
                  ))}
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-6">
            <span className="font-mono text-[0.68rem] tracking-[0.1em] text-white/25 uppercase">
              © {new Date().getFullYear()} Home Studios. All rights reserved.{" "}
              <a
                href="https://bettercallmithesh.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8A86FC] underline underline-offset-2 hover:text-white transition-colors"
              >
                click here
              </a>
            </span>
            <span className="font-mono text-[0.68rem] tracking-[0.1em] text-white/25 uppercase">
              Bengaluru, Karnataka, India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
