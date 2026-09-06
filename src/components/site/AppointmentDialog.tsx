import { useEffect, useRef, type FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAppointment } from "@/lib/appointment-context";
import { CONTACT } from "@/lib/site-data";

const SERVICES = [
  { value: "3d-walkthrough", label: "3D Walkthrough Session" },
  { value: "construction", label: "Construction Package Quote" },
  { value: "structural-design", label: "Structural Design" },
  { value: "plans-approval", label: "Plans Approval" },
  { value: "architecture-design", label: "Architecture Design" },
  { value: "interior-design", label: "Interior Designing" },
  { value: "other", label: "General enquiry" },
];

const TIMES = [
  "09:00–10:00", "10:00–11:00", "11:00–12:00",
  "12:00–13:00", "14:00–15:00", "15:00–16:00",
  "16:00–17:00", "17:00–18:00",
];

function buildWhatsAppMessage(data: Record<string, string>) {
  const lines = [
    "HOME STUDIOS APPOINTMENT REQUEST",
    "",
    `Name: ${data["name"]}`,
    `Phone: ${data["phone"]}`,
    `Email: ${data["email"]}`,
    `Preferred Date: ${data["date"]}`,
    `Preferred Time: ${data["time"]}`,
    `Service: ${data["service"]}`,
    `Message: ${data["message"] ?? "—"}`,
  ];
  return encodeURIComponent(lines.join("\n"));
}

export function AppointmentDialog() {
  const { isOpen, close, prefillService } = useAppointment();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [sent, setSent] = useState(false);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => closeRef.current?.focus(), 50);
    } else {
      setSent(false);
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, close]);

  // Trap focus
  useEffect(() => {
    if (!isOpen) return;
    const panel = dialogRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", trap);
    return () => document.removeEventListener("keydown", trap);
  }, [isOpen]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const data: Record<string, string> = {};
    new FormData(form).forEach((val, key) => { data[key] = val.toString(); });
    const msg = buildWhatsAppMessage(data);
    window.open(`https://wa.me/918660823337?text=${msg}`, "_blank", "noopener");
    setSent(true);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="arch-dialog-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={close}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="arch-dialog" role="dialog" aria-modal="true" aria-label="Book your appointment">
            <motion.div
              ref={dialogRef}
              className="arch-dialog-panel"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="arch-label arch-label--accent mb-2">Book your appointment</p>
                  <h2 className="font-display text-[1.8rem] font-light leading-tight" style={{ color: "var(--text-primary)" }}>
                    Let's talk about<br />your project.
                  </h2>
                </div>
                <button
                  ref={closeRef}
                  onClick={close}
                  aria-label="Close appointment dialog"
                  className="flex h-10 w-10 items-center justify-center transition-colors flex-shrink-0 hover:text-white"
                  style={{ border: "1px solid var(--border-interactive)", color: "var(--text-secondary)" }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {sent ? (
                <div className="py-8 px-6 text-center" style={{ border: "1px solid var(--border)" }}>
                  <p className="arch-label arch-label--accent mb-3">✓ Message sent</p>
                  <p className="font-display text-[1.4rem] font-light mb-3" style={{ color: "var(--text-primary)" }}>
                    Opening WhatsApp…
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Your appointment request has been prepared in WhatsApp.
                    If it didn't open automatically, message us at{" "}
                    <a href={CONTACT.phoneHref} className="hover:underline" style={{ color: "var(--indigo)" }}>
                      {CONTACT.phone}
                    </a>
                  </p>
                  <button onClick={close} className="mt-6 arch-btn arch-btn--primary">
                    CLOSE
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DialogField id="name" label="Full Name" required>
                      <input id="name" name="name" type="text" required autoComplete="name"
                        className="arch-field" placeholder="Your full name" />
                    </DialogField>
                    <DialogField id="phone" label="Phone Number" required>
                      <input id="phone" name="phone" type="tel" required autoComplete="tel"
                        className="arch-field" placeholder="+91 00000 00000" />
                    </DialogField>
                  </div>
                  <DialogField id="email" label="Email Address" required>
                    <input id="email" name="email" type="email" required autoComplete="email"
                      className="arch-field" placeholder="you@example.com" />
                  </DialogField>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DialogField id="date" label="Preferred Date" required>
                      <input id="date" name="date" type="date" required
                        className="arch-field"
                        min={new Date().toISOString().split("T")[0]} />
                    </DialogField>
                    <DialogField id="time" label="Preferred Time" required>
                      <select id="time" name="time" required className="arch-field">
                        <option value="">Select time</option>
                        {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </DialogField>
                  </div>
                  <DialogField id="service" label="Service" required>
                    <select id="service" name="service" required className="arch-field"
                      defaultValue={prefillService}>
                      <option value="">Which service?</option>
                      {SERVICES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </DialogField>
                  <DialogField id="message" label="Message">
                    <textarea id="message" name="message" rows={3}
                      className="arch-field resize-none"
                      placeholder="Tell us about your project — plot size, location, timeline…" />
                  </DialogField>

                  <div className="pt-2 flex flex-col gap-3">
                    <button type="submit" className="arch-btn arch-btn--primary justify-center w-full">
                      SEND VIA WHATSAPP <span className="arch-btn-arrow">→</span>
                    </button>
                    <p className="text-[11px] text-center leading-relaxed" style={{ color: "var(--text-muted)" }}>
                      This will open WhatsApp with your message pre-filled.
                      We reply to most enquiries within one business day.
                    </p>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function DialogField({ id, label, required, children }: {
  id: string; label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block arch-label mb-2">
        {label}{required && <span className="ml-1" style={{ color: "var(--indigo)" }}>*</span>}
      </label>
      {children}
    </div>
  );
}
