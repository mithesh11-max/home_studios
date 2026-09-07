import { useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useAppointment } from "@/lib/appointment-context";
import { useSmoothScroll } from "@/lib/lenis-context";
import { DURATION, EASE_ARCH_SMOOTH, EASE_ARCH_HEAVY } from "@/lib/motion";
import { CONTACT } from "@/lib/site-data";

interface NavItem {
  readonly label: string;
  readonly to: string;
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  nav: readonly NavItem[];
}

const MENU_LABELS = ["01", "02", "03", "04", "05", "06"];

export function MobileMenu({ open, onClose, nav }: MobileMenuProps) {
  const { open: openAppt } = useAppointment();
  const { stop, start } = useSmoothScroll();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Lock scroll and pause Lenis
  useEffect(() => {
    if (open) {
      stop();
      document.body.style.overflow = "hidden";
    } else {
      start();
      document.body.style.overflow = "";
    }
    return () => {
      start();
      document.body.style.overflow = "";
    };
  }, [open, stop, start]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-40 flex flex-col"
          style={{ backgroundColor: "var(--surface)", paddingTop: "64px" }}
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: DURATION.SECTION, ease: EASE_ARCH_HEAVY }}
          aria-modal="true"
          role="dialog"
          aria-label="Navigation menu"
          data-lenis-prevent
        >
          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto px-6 pt-8 pb-4" aria-label="Mobile navigation">
            {nav.map((item, i) => (
              <motion.div
                key={item.to}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.4, delay: open ? i * 0.06 : 0, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  to={item.to}
                  hash={item.to === "/" && pathname !== "/" ? "hs-content" : undefined}
                  onClick={onClose}
                  className="flex items-baseline gap-4 py-5 border-b group"
                  style={{ textDecoration: "none", borderColor: "var(--border)" }}
                >
                  <span className="arch-label" style={{ minWidth: "1.5rem", color: "var(--indigo)" }}>{MENU_LABELS[i]}</span>
                  <span
                    className="font-display text-[2.4rem] font-light leading-none group-hover:text-indigo"
                    style={{ color: "var(--text-primary)", transition: "color 0.18s ease" }}
                  >
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Footer area */}
          <motion.div
            className="px-6 py-8 border-t"
            style={{ borderColor: "var(--border)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <p className="arch-label mb-4" style={{ color: "var(--text-muted)" }}>Contact</p>
            <div className="space-y-1 mb-6">
              <a href={CONTACT.phoneHref} className="flex items-center min-h-[44px] text-[0.95rem] transition-colors hover:text-white" style={{ color: "var(--text-secondary)" }}>
                {CONTACT.phone}
              </a>
              <a href={CONTACT.emailHref} className="flex items-center min-h-[44px] text-[0.95rem] transition-colors hover:text-white" style={{ color: "var(--text-secondary)" }}>
                {CONTACT.email}
              </a>
            </div>
            <button
              onClick={() => { onClose(); openAppt(); }}
              className="arch-btn arch-btn--primary w-full justify-center"
            >
              BOOK YOUR APPOINTMENT <span className="arch-btn-arrow">→</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
