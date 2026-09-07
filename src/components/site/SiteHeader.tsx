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
  const [navState, setNavState] = useState<"top" | "compressed" | "compact" | "expanded">("top");
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    const direction = latest > previous ? "down" : "up";

    if (latest <= 60) {
      setNavState("top");
    } else if (latest > 60 && latest < 300) {
      setNavState("compressed");
    } else {
      if (direction === "down") {
        setNavState("compact");
      } else {
        setNavState("expanded");
      }
    }
  });

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isCompact = navState === "compact" && !menuOpen;
  const isTop = navState === "top" && !menuOpen;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-300">
        <motion.div
          layout
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className={`pointer-events-auto flex items-center justify-between overflow-hidden backdrop-blur-md ${
            isCompact
              ? "w-auto h-14 mt-4 rounded-full bg-ink/95 border border-white/10 px-5 sm:px-6 gap-6 sm:gap-10 shadow-2xl"
              : `w-full max-w-[1440px] px-5 sm:px-8 lg:px-12 gap-6 ${
                  isTop ? "h-20 bg-transparent border-b border-transparent" : "h-16 bg-ink/90 border-b border-rule"
                } rounded-none mt-0`
          }`}
        >
          {/* Left: Logo */}
          <motion.div layout className="flex-shrink-0 flex items-center">
            <Link to="/" hash={pathname !== "/" ? "hs-content" : undefined} className="flex items-center gap-3">
              <img
                src="/logo-footer.png"
                alt="Home Studios"
                className={`w-auto transition-all duration-500 ${isCompact ? "h-[1.15rem]" : "h-7"}`}
                style={{ opacity: isTop ? 0.9 : 1 }}
              />
            </Link>
          </motion.div>

          {/* Center: Nav */}
          <motion.nav layout className="hidden lg:flex items-center gap-7" aria-label="Primary navigation">
            {NAV.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                hash={link.to === "/" && pathname !== "/" ? "hs-content" : undefined}
                className="relative arch-label transition-colors duration-200 hover:text-white"
                style={{ color: "var(--text-secondary)" }}
                activeProps={{
                  className: "text-white after:content-[''] after:absolute after:-bottom-[6px] after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[var(--indigo)] after:rounded-full",
                  style: { fontWeight: 600 }
                }}
              >
                {link.label}
              </Link>
            ))}
          </motion.nav>

          {/* Right: CTA + Hamburger */}
          <motion.div layout className="flex items-center gap-4">
            <button
              onClick={() => open()}
              className={`hidden lg:inline-flex arch-btn arch-btn--primary transition-all duration-300 whitespace-nowrap ${
                isCompact ? "h-9 px-4 text-[0.68rem]" : ""
              }`}
              aria-label="Book your appointment"
            >
              {isCompact ? "BOOK" : "BOOK YOUR APPOINTMENT"} <span className="arch-btn-arrow">→</span>
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
          </motion.div>
        </motion.div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} nav={NAV} />
    </>
  );
}
