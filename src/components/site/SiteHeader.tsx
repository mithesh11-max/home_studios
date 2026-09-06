import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { useAppointment } from "@/lib/appointment-context";
import { MobileMenu } from "./MobileMenu";

const NAV = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Walkthrough", to: "/walkthrough" },
  { label: "Construction", to: "/construction" },
  { label: "Contact", to: "/contact" },
] as const;

export function SiteHeader() {
  const { open } = useAppointment();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // All pages in the site have a dark hero section at the top.
  // When at top and menu is closed, use transparent dark-hero style.
  // When scrolled or menu is open, use solid light paper style with backdrop blur.
  const isTransparent = !scrolled && !menuOpen;

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          height: "64px",
          backgroundColor: isTransparent
            ? "transparent"
            : "rgba(8, 11, 26, 0.88)",
          backdropFilter: isTransparent ? "none" : "blur(12px)",
          WebkitBackdropFilter: isTransparent ? "none" : "blur(12px)",
          borderBottom: isTransparent
            ? "1px solid transparent"
            : "1px solid var(--border)",
        }}
      >
        <div className="arch-container h-full flex items-center justify-between gap-6">
          {/* Left: Logo */}
          <Link to="/" hash={pathname !== "/" ? "hs-content" : undefined} className="flex-shrink-0 flex items-center gap-3">
            <img
              src="/logo-footer.png"
              alt="Home Studios"
              className="h-8 w-auto transition-all duration-300"
              style={{
                opacity: isTransparent ? 0.9 : 1,
              }}
            />
          </Link>

          {/* Center: Nav */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary navigation">
            {NAV.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                hash={link.to === "/" && pathname !== "/" ? "hs-content" : undefined}
                className="arch-label transition-colors duration-200 hover:text-white"
                style={{
                  color: "var(--text-secondary)",
                }}
                activeProps={{
                  style: {
                    color: "var(--indigo)",
                    fontWeight: 600,
                  },
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: CTA + Hamburger */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => open()}
              className="hidden lg:inline-flex arch-btn arch-btn--primary transition-colors duration-200"
              aria-label="Book your appointment"
            >
              BOOK YOUR APPOINTMENT <span className="arch-btn-arrow">→</span>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="lg:hidden flex flex-col justify-center items-center gap-[5px] h-10 w-10 text-white"
            >
              <span
                className="block h-px w-5 bg-current transition-all duration-300"
                style={{
                  color: "var(--text-primary)",
                  transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none",
                }}
              />
              <span
                className="block h-px w-5 bg-current transition-all duration-300"
                style={{
                  color: "var(--text-primary)",
                  opacity: menuOpen ? 0 : 1,
                }}
              />
              <span
                className="block h-px w-5 bg-current transition-all duration-300"
                style={{
                  color: "var(--text-primary)",
                  transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none",
                }}
              />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} nav={NAV} />
    </>
  );
}
