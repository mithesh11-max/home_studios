import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Clock, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { FinalCTA } from "@/components/site/FinalCTA";
import { FadeUp } from "@/components/site/TextReveal";
import { CONTACT } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  component: Contact,
});

const SERVICES = [
  { value: "3d-walkthrough", label: "3D Walkthrough Session" },
  { value: "construction", label: "Construction Package Quote" },
  { value: "structural-design", label: "Structural Design" },
  { value: "plans-approval", label: "Plans Approval" },
  { value: "architecture-design", label: "Architecture Design" },
  { value: "interior-design", label: "Interior Designing" },
  { value: "other", label: "General enquiry" },
];

function buildWhatsAppMessage(data: Record<string, string>) {
  const lines = [
    "HOME STUDIOS ENQUIRY",
    "",
    `Name: ${data["name"] ?? ""}`,
    `Phone: ${data["phone"] ?? ""}`,
    `Email: ${data["email"] ?? ""}`,
    `Service: ${data["service"] ?? ""}`,
    `Message: ${data["message"] ?? ""}`,
  ];
  return encodeURIComponent(lines.join("\n"));
}

function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) { e.currentTarget.reportValidity(); return; }
    const data: Record<string, string> = {};
    new FormData(e.currentTarget).forEach((val, key) => { data[key] = val.toString(); });
    const msg = buildWhatsAppMessage(data);
    window.open(`https://wa.me/918660823337?text=${msg}`, "_blank", "noopener");
    setSent(true);
  }

  return (
    <>
      <SiteHeader />
      <main>
        {/* ── Hero ── */}
        <section
          className="relative pt-32 pb-14 lg:pb-18 overflow-hidden"
          style={{ background: "var(--bg-deep)" }}
          aria-label="Contact hero"
        >
          <div className="arch-grid-dark absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true" />
          <div className="relative arch-container grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14 items-start">

            {/* Left: headline & neat spacious contact directory */}
            <div>
              <p className="arch-label arch-label--accent mb-4">GET IN TOUCH</p>
              <h1 className="font-display text-white leading-[0.92]"
                style={{ fontSize: "var(--text-display-lg)" }}>
                LET'S BUILD<br />SOMETHING<br />REAL.
              </h1>
              <p className="mt-4 text-white/40 text-[0.95rem] leading-relaxed max-w-[42ch]">
                Call, WhatsApp, email or visit the studio in Rajarajeshwari Nagar.
                Tell us about your project and we'll advise on next steps.
              </p>

              {/* Architectural Contact Directory — Spacious & High Legibility */}
              <div className="mt-6 space-y-3">
                {/* 01: Direct Phone */}
                <div className="p-4 sm:p-5 border border-white/10 hover:border-white/20 transition-colors bg-white/[0.02]">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="arch-label arch-label--accent">01 / TELEPHONE</span>
                    <span className="arch-label" style={{ color: "rgba(255,255,255,0.3)" }}>MON – SAT · 9AM – 7PM</span>
                  </div>
                  <a
                    href={CONTACT.phoneHref}
                    className="inline-block font-sans font-600 text-[1.2rem] sm:text-[1.35rem] text-white hover:text-indigo transition-colors tracking-wide leading-snug"
                  >
                    {CONTACT.phone}
                  </a>
                  <p className="mt-1.5 text-white/45 text-[0.84rem] leading-relaxed">
                    Direct line for consultations, project scopes, and immediate queries.
                  </p>
                </div>

                {/* 02: WhatsApp Direct */}
                <div className="p-4 sm:p-5 border border-white/10 hover:border-white/20 transition-colors bg-white/[0.02]">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="arch-label arch-label--accent">02 / WHATSAPP CHAT</span>
                    <span className="arch-label" style={{ color: "rgba(255,255,255,0.3)" }}>INSTANT MESSAGING</span>
                  </div>
                  <a
                    href={CONTACT.whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-sans font-600 text-[1.05rem] sm:text-[1.15rem] text-white hover:text-indigo transition-colors leading-snug"
                  >
                    Chat with Home Studios <ArrowUpRight className="h-4 w-4" style={{ color: "var(--indigo)" }} />
                  </a>
                  <p className="mt-1.5 text-white/45 text-[0.84rem] leading-relaxed">
                    Fastest way to share floor plans, reserve walkthrough slots, and receive estimates.
                  </p>
                </div>

                {/* 03: Email */}
                <div className="p-4 sm:p-5 border border-white/10 hover:border-white/20 transition-colors bg-white/[0.02]">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="arch-label arch-label--accent">03 / OFFICIAL EMAIL</span>
                    <span className="arch-label" style={{ color: "rgba(255,255,255,0.3)" }}>PLANS & RFPS</span>
                  </div>
                  <a
                    href={CONTACT.emailHref}
                    className="inline-block font-sans font-500 text-[1rem] text-white hover:text-indigo transition-colors"
                  >
                    {CONTACT.email}
                  </a>
                  <p className="mt-1.5 text-white/45 text-[0.84rem] leading-relaxed">
                    Send CAD drawings, PDFs, structural designs, or tender documents.
                  </p>
                </div>

                {/* 04: Studio Address */}
                <div className="p-4 sm:p-5 border border-white/10 hover:border-white/20 transition-colors bg-white/[0.02]">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <span className="arch-label arch-label--accent">04 / STUDIO LABORATORY</span>
                    <span className="arch-label" style={{ color: "rgba(255,255,255,0.3)" }}>RR NAGAR · BENGALURU</span>
                  </div>
                  <div className="text-white text-[0.9rem] leading-relaxed space-y-0.5">
                    <p className="font-600 text-white">Home Studios</p>
                    <p className="text-white/75">18th Main, Sapthagiri Layout, Chansandra</p>
                    <p className="text-white/75">Rajarajeshwari Nagar, Bengaluru, Karnataka 560098</p>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[0.78rem] text-white/40">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" style={{ color: "var(--indigo)" }} />
                      Mon – Sat: 9:00 AM – 7:00 PM
                    </span>
                    <span style={{ color: "var(--indigo)" }}>Sessions by advance appointment</span>
                  </div>
                </div>
              </div>

              {/* Coordinates Annotation */}
              <p className="mt-8 arch-label" style={{ color: "rgba(255,255,255,0.22)" }}>
                HOME STUDIOS — RR NAGAR / BENGALURU · 12.92°N 77.51°E
              </p>
            </div>

            {/* Right: form */}
            <div
              className="p-8 lg:p-10"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <h2 className="font-display text-white text-[1.6rem] font-light mb-2">Send an enquiry</h2>
              <p className="text-[0.85rem] mb-8" style={{ color: "var(--text-muted)" }}>We reply to most enquiries within one business day.</p>

              {sent ? (
                <div className="py-8 text-center border" style={{ borderColor: "var(--border)" }}>
                  <p className="arch-label arch-label--accent mb-3">✓ OPENING WHATSAPP</p>
                  <p className="font-display text-white text-[1.4rem] font-light mb-3">Message prepared.</p>
                  <p className="text-[0.88rem] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    Your enquiry has been composed in WhatsApp. If it didn't open automatically,
                    message us directly at{" "}
                    <a href={CONTACT.whatsappHref} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: "var(--indigo)" }}>
                      WhatsApp
                    </a>{" "}
                    or call{" "}
                    <a href={CONTACT.phoneHref} className="hover:underline" style={{ color: "var(--indigo)" }}>{CONTACT.phone}</a>.
                  </p>
                </div>
              ) : (
                <form
                  noValidate
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <ContactField id="c-name" label="Full Name" required>
                      <input id="c-name" name="name" type="text" required autoComplete="name"
                        className="arch-field arch-field-dark" placeholder="Your full name" />
                    </ContactField>
                    <ContactField id="c-phone" label="Phone" required>
                      <input id="c-phone" name="phone" type="tel" required autoComplete="tel"
                        className="arch-field arch-field-dark" placeholder="+91 00000 00000" />
                    </ContactField>
                  </div>
                  <ContactField id="c-email" label="Email" required>
                    <input id="c-email" name="email" type="email" required autoComplete="email"
                      className="arch-field arch-field-dark" placeholder="you@example.com" />
                  </ContactField>
                  <ContactField id="c-service" label="Service" required>
                    <select id="c-service" name="service" required className="arch-field arch-field-dark">
                      <option value="">What can we help with?</option>
                      {SERVICES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </ContactField>
                  <ContactField id="c-message" label="Message" required>
                    <textarea id="c-message" name="message" required rows={4}
                      className="arch-field arch-field-dark resize-none"
                      placeholder="Tell us about your project — plot size, location, timeline…" />
                  </ContactField>
                  <button type="submit" className="arch-btn arch-btn--primary w-full justify-center">
                    SEND VIA WHATSAPP <span className="arch-btn-arrow">→</span>
                  </button>
                  <p className="text-white/25 text-[0.75rem] text-center">
                    This will open WhatsApp with your enquiry pre-filled. We reply within one business day.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ── Map ── */}
        <section className="py-12 bg-paper" aria-label="Studio location map">
          <div className="arch-container">
            <p className="arch-label arch-label--accent mb-3">FIND THE STUDIO</p>
            <h2 className="font-display text-ink leading-none mb-6"
              style={{ fontSize: "var(--text-display-sm)" }}>
              18th Main, Sapthagiri<br />Layout, RR Nagar.
            </h2>
            <div style={{ border: "1px solid var(--border)", overflow: "hidden" }}>
              <iframe
                title="Home Studios location"
                className="h-[320px] w-full arch-map-dark"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={CONTACT.mapEmbedSrc}
                style={{ display: "block" }}
              />
            </div>
          </div>
        </section>

        {/* ── Before you write ── */}
        <section className="py-12" style={{ background: "var(--surface)", borderTop: "1px solid var(--rule)" }} aria-label="What to prepare">
          <div className="arch-container">
            <p className="arch-label arch-label--accent mb-3">BEFORE YOU WRITE IN</p>
            <p className="text-stone text-[0.88rem] mb-6 max-w-[40ch]">A few details that speed up your quote:</p>
            <div className="grid grid-cols-1 gap-0 sm:grid-cols-3" style={{ borderLeft: "1px solid var(--rule)", borderTop: "1px solid var(--rule)" }}>
              {[
                { title: "Plot & built-up area", desc: "Have your plot size and expected built-up area to hand — it helps us accurately scope your project." },
                { title: "Existing floor plan", desc: "If you already have one, describe or attach it in your message." },
                { title: "Timeline", desc: "When you expect to begin construction or when you need approval documents." },
              ].map((item, i) => (
                <div key={item.title} className="p-6" style={{ borderRight: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}>
                  <p className="arch-label arch-label--accent mb-3">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="font-display text-ink text-[1.2rem] font-light mb-2">{item.title}</h3>
                  <p className="text-stone text-[0.85rem] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FinalCTA
          eyebrow="Direct connection"
          title={"WALK THROUGH YOUR HOME\nBEFORE IT'S BUILT."}
          description="Book a session at our RR Nagar studio. Walk every room at 1:1 scale before a single brick is laid."
        />
      </main>

      <SiteFooter />
    </>
  );
}

function ContactField({ id, label, required, children }: {
  id: string; label: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block arch-label arch-label--light mb-2">
        {label}{required && <span className="ml-1" style={{ color: "var(--indigo)" }}>*</span>}
      </label>
      {children}
    </div>
  );
}
