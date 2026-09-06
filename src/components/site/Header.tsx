import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { NAV_LINKS, CONTACT, SERVICES } from "@/lib/site-data";

const DESKTOP_LINKS = [
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Construction", to: "/construction" },
  { label: "Contact", to: "/contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [location]);

  const isHome = location === "/";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isHome || open
            ? "bg-paper border-b border-line shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
        style={{
          backdropFilter: scrolled || !isHome ? "blur(12px)" : "none",
          backgroundColor: scrolled || !isHome || open ? "rgba(244,241,235,0.96)" : "transparent",
        }}
      >
        <div className="mx-auto flex h-[72px] max-w-[1300px] items-center justify-between px-5 sm:px-8">
          {/* Logo */}
          <Link
            to="/"
            hash={isHome ? undefined : "hs-content"}
            className="flex items-center gap-3 flex-shrink-0"
            onClick={() => setOpen(false)}
          >
            <img
              src="/logo-header.png"
              alt="Home Studios"
              className="h-9 w-auto sm:h-10"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Primary navigation">
            {DESKTOP_LINKS.map((link) =>
              link.label === "Services" ? (
                <div key={link.to} className="group relative">
                  <Link
                    to={link.to}
                    className={`relative px-4 py-2 font-sans text-[0.82rem] font-600 tracking-[0.06em] uppercase transition-colors duration-200 ${
                      isHome && !scrolled ? "text-white/80 hover:text-white" : "text-muted-hs hover:text-dark"
                    }`}
                  >
                    Services
                  </Link>
                  {/* Dropdown */}
                  <div className="invisible absolute left-0 top-full w-[220px] border border-line bg-paper shadow-lg opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    {SERVICES.map((service) => (
                      <Link
                        key={service.slug}
                        to="/services/$slug"
                        params={{ slug: service.slug }}
                        className="block px-5 py-3 text-[0.8rem] font-sans font-500 text-muted-hs hover:text-dark hover:bg-paper-hi border-b border-line last:border-0 transition-colors"
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 font-sans text-[0.82rem] font-600 tracking-[0.06em] uppercase transition-colors duration-200 ${
                    isHome && !scrolled ? "text-white/80 hover:text-white" : "text-muted-hs hover:text-dark"
                  }`}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/contact"
              className="hs-btn-accent text-[0.72rem] py-2.5 px-5"
            >
              BOOK A SLOT →
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className={`flex lg:hidden h-10 w-10 items-center justify-center border transition-colors ${
              isHome && !scrolled && !open
                ? "border-white/30 text-white hover:border-white/60"
                : "border-line-dark text-dark"
            }`}
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <div
        className={`fixed inset-0 z-40 bg-paper transition-all duration-500 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        style={{ top: "72px" }}
        aria-hidden={!open}
      >
        <nav className="flex flex-col px-5 pt-8 pb-12 h-full overflow-y-auto" aria-label="Mobile navigation">
          {DESKTOP_LINKS.map((link, i) => (
            <div key={link.to}>
              <Link
                to={link.to}
                onClick={() => setOpen(false)}
                className="block py-5 font-display text-[2.2rem] font-light text-dark border-b border-line transition-colors hover:text-accent-hs"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {link.label}
              </Link>
              {link.label === "Services" && (
                <div className="pl-4 border-b border-line">
                  {SERVICES.map((service) => (
                    <Link
                      key={service.slug}
                      to="/services/$slug"
                      params={{ slug: service.slug }}
                      onClick={() => setOpen(false)}
                      className="block py-3.5 font-sans text-[0.88rem] text-muted-hs hover:text-dark transition-colors border-b border-line last:border-0"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="hs-btn-accent justify-center"
            >
              BOOK A SLOT →
            </Link>
            <a
              href={CONTACT.whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hs-btn-outline justify-center"
            >
              WHATSAPP US
            </a>
          </div>

          <div className="mt-auto pt-8">
            <p className="font-mono text-[0.7rem] text-muted-hs tracking-[0.12em] uppercase">
              {CONTACT.phone}
            </p>
          </div>
        </nav>
      </div>
    </>
  );
}
