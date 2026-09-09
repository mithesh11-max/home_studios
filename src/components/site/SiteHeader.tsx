import { useState, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
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
  const [isCompressed, setIsCompressed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsCompressed(latest > 50);
  });

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 pointer-events-auto ${
          isCompressed
            ? "h-14 sm:h-16 bg-deep/95 border-b border-rule backdrop-blur-md shadow-lg"
            : "h-16 sm:h-20 bg-transparent border-b border-transparent"
        }`}
      >
        <div className="w-full max-w-[1440px] h-full mx-auto px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4 sm:gap-6">
          {/* Left: Studio Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              to="/"
              hash={pathname !== "/" ? "hs-content" : undefined}
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
              data-interactive
            >
              <img
                src="/logo-footer.png"
                alt="Home Studios — Real-Size 3D Walkthroughs"
                className={`w-auto transition-all duration-300 ${
                  isCompressed ? "h-6 sm:h-6" : "h-6 sm:h-7"
                }`}
              />
            </Link>
          </div>

          {/* Center: Monograph Navigation */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Primary navigation">
            {NAV.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                hash={link.to === "/" && pathname !== "/" ? "hs-content" : undefined}
                className="relative arch-label text-[11px] tracking-[0.16em] uppercase transition-colors duration-200 text-stone hover:text-white py-1"
                activeProps={{
                  className:
                    "text-white font-semibold after:content-[''] after:absolute after:-bottom-1 after:left-0 after:right-0 after:h-[2px] after:bg-indigo",
                }}
                data-interactive
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: CTA Button + Mobile Hamburger */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => open()}
              className={`hidden lg:inline-flex arch-btn arch-btn--primary transition-all duration-200 ${
                isCompressed ? "py-2 px-5 text-[10px]" : "py-2.5 px-6 text-[11px]"
              }`}
              data-interactive
              data-magnetic
              aria-label="Book your appointment"
            >
              BOOK YOUR APPOINTMENT <span className="arch-btn-arrow">→</span>
            </button>

            {/* Mobile hamburger - accessible 44x44px minimum touch target */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className="lg:hidden flex flex-col justify-center items-center gap-[5px] h-11 w-11 text-white touch-manipulation active:scale-95 transition-transform"
            >
              <span
                className="block h-px w-5 bg-current transition-all duration-300"
                style={{ transform: menuOpen ? "translateY(6px) rotate(45deg)" : "none" }}
              />
              <span
                className="block h-px w-5 bg-current transition-all duration-300"
                style={{ opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="block h-px w-5 bg-current transition-all duration-300"
                style={{ transform: menuOpen ? "translateY(-6px) rotate(-45deg)" : "none" }}
              />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} nav={NAV} />
    </>
  );
}

export default SiteHeader;
