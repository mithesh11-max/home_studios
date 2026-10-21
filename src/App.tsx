import React, { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { createMotion, lockScroll, scrollToTarget } from "@/lib/motion";
import { SmokeCanvas } from "@/components/SmokeCanvas";
import studioImg from "@/assets/studio.webp";
import livingImg from "@/assets/project-living.webp";
import kitchenImg from "@/assets/project-kitchen.webp";
import exteriorImg from "@/assets/project-exterior.webp";
import staircaseImg from "@/assets/details/staircase.webp";
import forestImg from "@/assets/details/forest-window.webp";
import livingWideImg from "@/assets/details/living-wide.webp";
import sofaImg from "@/assets/details/living-sofa.webp";
import pendantImg from "@/assets/details/pendant.webp";
import stoolsImg from "@/assets/details/stools.webp";
import terraceImg from "@/assets/details/terrace.webp";
import lanternImg from "@/assets/details/lantern.webp";
import familyImg from "@/assets/details/family-walk.webp";
import planLinesImg from "@/assets/details/plan-lines.webp";
import planEntryImg from "@/assets/details/plan-entry.webp";
import video01 from "@/assets/details/01.mp4";
import video06 from "@/assets/details/06.mp4";
import video08 from "@/assets/details/08.mp4";
import video11 from "@/assets/details/11.mp4";
import homeVideo from "@/assets/details/Home.mp4";

const PHONE = "+91 866 082 3337";
const TEL = "+918660823337";
const WA = "https://wa.me/918660823337";
const EMAIL = "contact@homestudios.co.in";
const ADDRESS = ["18th Main, Sapthagiri Layout, Chansandra", "Rajarajeshwari Nagar, Bengaluru 560098"];
const MAP_EMBED =
  "https://maps.google.com/maps?q=HOME+STUDIOS+INDIA,+18th+Main,+Sapthagiri+Layout,+Chansandra,+Rajarajeshwari+Nagar,+Bengaluru,+Karnataka+560098&t=&z=16&ie=UTF8&iwloc=&output=embed";
const MAP_LINK =
  "https://www.google.com/maps/search/?api=1&query=HOME+STUDIOS+INDIA+18th+Main+Sapthagiri+Layout+Chansandra+Rajarajeshwari+Nagar+Bengaluru+560098";
const HOURS = "Monday to Saturday, 9 am to 7 pm";
const BRAND = "HOME STUDIOS";

const NAV: [string, string][] = [
  ["How it works", "#process"],
  ["Services", "#services"],
  ["Gallery", "#gallery"],
  ["FAQ", "#faq"],
];

const STATEMENT = [
  "A drawing tells you the size of a room.",
  "It can't tell you how it feels.",
  "So we built a studio you can stand in.",
  "Walk your home before you build it.",
];

const STEPS = [
  { t: "Share your plans", d: "Send your floor plan as a PDF or CAD file, with your plot size and timeline.", img: planEntryImg, alt: "The entrance of a floor plan drawn in light on the studio floor" },
  { t: "We set it out at 1:1", d: "Laser projectors draw every wall, doorway and column on the studio floor, exactly where it will stand on site.", img: planLinesImg, alt: "Bedroom and bath outlines projected at full size on the studio floor" },
  { t: "Walk it with your family", d: "Bring everyone. Check whether two people can pass in the corridor, or the island blocks the window.", img: familyImg, alt: "A family walking through a projected floor plan" },
  { t: "Change it on the spot", d: "Full-height walls and furniture on wheels move while you watch. Try another layout before you leave.", img: sofaImg, alt: "A living room seating arrangement" },
  { t: "Sign off together", d: "You, your architect and your builder agree on the same home, standing inside it.", img: staircaseImg, alt: "A timber staircase beside a double-height living room" },
  { t: "We build what you walked", d: "Structure, approvals and construction follow the plan you approved on foot.", img: lanternImg, alt: "A lit wall lantern beside timber screens on a finished home" },
];

const SERVICES = [
  { t: "Real-size walkthroughs", d: "Your exact plan at 1:1, with 40+ movable full-height walls and furniture.", need: "Walkthrough only", img: studioImg },
  { t: "Architecture", d: "Zoning, circulation and privacy, verified in the studio before sign-off.", need: "Architecture", img: livingImg },
  { t: "Structural design", d: "Footing, column, plinth beam and reinforcement drawings for your site.", need: "Structural", img: exteriorImg },
  { t: "Plan approvals", d: "BBMP and BDA sanctions, with BWSSB, BESCOM and fire NOCs.", need: "Approvals", img: studioImg },
  { t: "Construction", d: "Foundation to RCC frame, with a named project manager on schedule.", need: "Construction", img: exteriorImg },
  { t: "Interiors", d: "From a whole home to a single kitchen, tested at full size.", need: "Interiors", img: kitchenImg },
  { t: "Turnkey", d: "One team from first sketch through to snag list and handover.", need: "New home end-to-end", img: livingImg },
];

type Photo = {
  img?: string;
  video?: string;
  poster?: string;
  t: string;
  alt: string;
  w: number;
  h: number;
};

// Three columns, read top to bottom. Real project photos and videos.
const GALLERY: Photo[][] = [
  [
    { video: video01, poster: livingImg, t: "Double-height living", alt: "A double-height living room with tall glass walls opening onto trees", w: 2560, h: 1440 },
    { img: pendantImg, t: "Pendant over the island", alt: "A linear pendant light above a stone kitchen island", w: 900, h: 755 },
    { img: lanternImg, t: "Lantern and timber screens", alt: "A lit wall lantern beside timber screens at dusk", w: 900, h: 736 },
    { img: planLinesImg, t: "Bedroom and bath at 1:1", alt: "Bedroom and bath outlines projected at full size on the studio floor", w: 853, h: 900 },
  ],
  [
    { img: staircaseImg, t: "Timber stair", alt: "A timber staircase rising beside a concrete column", w: 720, h: 900 },
    { video: video06, poster: exteriorImg, t: "Terrace home at dusk", alt: "A three-storey home with timber screens and a cantilevered terrace at dusk", w: 2560, h: 1440 },
    { img: sofaImg, t: "Living room seating", alt: "A low cream sofa around a timber coffee table", w: 900, h: 386 },
    { video: video08, poster: familyImg, t: "Walking the plan", alt: "A family walking through a projected floor plan", w: 2560, h: 1440 },
  ],
  [
    { img: forestImg, t: "Forest-facing glazing", alt: "Floor-to-ceiling windows looking onto trees", w: 663, h: 900 },
    { img: terraceImg, t: "Cantilevered terrace", alt: "A glass-railed terrace under a timber soffit", w: 930, h: 320 },
    { video: video11, poster: kitchenImg, t: "Island kitchen", alt: "A pale kitchen with a stone island and timber cabinetry", w: 2560, h: 1440 },
    { img: stoolsImg, t: "Bar stools", alt: "Black timber bar stools at a stone island", w: 717, h: 900 },
  ],
];
const GALLERY_FLAT = GALLERY.flat();
const DESKTOP_ORDER = GALLERY_FLAT.map((_, i) => i);
// Phones: an editorial rhythm of wide banners and pairs, with videos at 01, 06, 08, 11
// without leaving gaps in the two-column grid. Numbers refer to GALLERY_FLAT.
const MOBILE_LAYOUT: { i: number; wide?: boolean; ratio: string }[] = [
  { i: 0, wide: true, ratio: "16 / 9" },
  { i: 4, ratio: "3 / 4" }, { i: 8, ratio: "3 / 4" },
  { i: 1, ratio: "3 / 4" }, { i: 11, ratio: "3 / 4" },
  { i: 5, wide: true, ratio: "16 / 9" },
  { i: 2, ratio: "3 / 4" }, { i: 7, ratio: "3 / 4" },
  { i: 9, wide: true, ratio: "16 / 7" },
  { i: 3, ratio: "3 / 4" }, { i: 10, ratio: "3 / 4" },
  { i: 6, wide: true, ratio: "16 / 7" },
];
const MOBILE_ORDER = MOBILE_LAYOUT.map((m) => m.i);

const FAQS = [
  { q: "What happens in a walkthrough session?", a: "Laser projectors cast your floor plan onto the studio floor at true 1:1 scale. You walk every room, check corridors and clearances, and our team moves full-height walls and furniture as you ask for changes." },
  { q: "What should I send before my visit?", a: "Your floor plan as a PDF or CAD file. We set it out before you arrive, so the session is spent walking, not waiting." },
  { q: "How long does a session take?", a: "Plan for two to three hours. Homes with more than one floor are walked one level at a time." },
  { q: "Can I bring my family, architect or builder?", a: "Yes, please do. When everyone stands in the same room, everyone agrees on the same home." },
  { q: "Can I compare more than one layout?", a: "Yes. Walls and furniture are moved live, so you can try options side by side in the same visit." },
  { q: "Do I need a finished floor plan?", a: "No. If you're at an early stage, our architects can draft a first plan and then walk it with you." },
  { q: "Construction has already started. Is it still useful?", a: "It's most useful before foundations are dug, but interiors, furniture fit and remaining floors can still be tested at full size." },
  { q: "Can I book just one service?", a: "Yes. A walkthrough, architecture, structural design, approvals, construction or interiors can each be booked on their own." },
  { q: "Is the studio comfortable for children?", a: "Yes. There's a waiting area for kids with streaming and free Wi-Fi." },
];

const NEEDS = ["New home end-to-end", "Walkthrough only", "Architecture", "Structural", "Approvals", "Construction", "Interiors", "Commercial"];

/** Wordmark split into masked letters, so each one can slide up on its own. */
function Letters({ text, attr }: { text: string; attr: string }) {
  return (
    <>
      {text.split("").map((c, i) => (
        <span className={c === " " ? "mask is-space" : "mask"} key={i} aria-hidden="true">
          <span className="ch" {...{ [attr]: "" }}>{c === " " ? " " : c}</span>
        </span>
      ))}
    </>
  );
}

export default function App() {
  const [need, setNeed] = useState("");
  useEffect(() => createMotion(), []);

  const pickService = (n: string) => {
    setNeed(n);
    scrollToTarget("#contact");
  };

  return (
    <>
      <Loader />
      <SmokeCanvas />
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <a href="#main" className="skip">Skip to content</a>
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Statement />
        <Process />
        <Numbers />
        <Services onPick={pickService} />
        <Gallery />
        <Faq />
        <Contact need={need} setNeed={setNeed} />
      </main>
      <Footer />
      <MobileBar />
      <a href={WA} target="_blank" rel="noopener" className="wa" aria-label="Chat with Home Studios on WhatsApp" data-magnetic>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 2.4 1 2.9.8 3.4.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" /></svg>
      </a>
    </>
  );
}

/** Phones: a slim glass bar with the two actions people want, shown once past the hero. */
function MobileBar() {
  return (
    <div className="mbar" data-mbar>
      <a href="#contact" className="mbar-cta">
        <span>Book a walkthrough</span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" /></svg>
      </a>
      <a href={WA} target="_blank" rel="noopener" className="mbar-wa" aria-label="Chat with Home Studios on WhatsApp">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3 2.4 1 2.9.8 3.4.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" /></svg>
      </a>
    </div>
  );
}

function Loader() {
  return (
    <div className="loader" data-loader aria-hidden="true">
      <div className="loader-line"><span data-loader-bar /></div>
      <div className="loader-foot">
        <span className="loader-count" data-loader-count>1%</span>
        <span className="loader-note">Setting out your home at 1:1</span>
      </div>
    </div>
  );
}

function Cursor() {
  return (
    <div className="cursor" data-cursor aria-hidden="true">
      <span className="cursor-img" data-cursor-img />
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  useEffect(() => lockScroll(open), [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="nav" data-nav>
        <div className="wrap nav-inner">
          <a href="#top" className="brand" aria-label="Home Studios, back to top">
            <img src={`${import.meta.env.BASE_URL}mark.png`} alt="" width="28" height="28" />
            <span className="brand-text wordmark-type" data-brand-text><span data-brand-a>HOME</span> <span data-brand-b>STUDIOS</span></span>
          </a>
          <nav className="nav-links" aria-label="Primary">
            {NAV.map(([l, h]) => <a key={h} href={h} data-navlink>{l}</a>)}
          </nav>
          <a href="#contact" className="btn btn-bone nav-cta" data-magnetic>Book a walkthrough</a>
          <button className="nav-toggle" onClick={() => setOpen(true)} aria-expanded={open} aria-controls="menu">Menu</button>
        </div>
        <span className="nav-progress" aria-hidden="true"><span data-nav-progress /></span>
      </header>
      <div id="menu" className={`menu ${open ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Menu" hidden={!open} data-lenis-prevent>
        <div className="wrap nav-inner">
          <a href="#top" className="brand" onClick={() => setOpen(false)}>
            <img src={`${import.meta.env.BASE_URL}mark.png`} alt="" width="28" height="28" />
            <span className="brand-text wordmark-type">{BRAND}</span>
          </a>
          <button className="nav-toggle" onClick={() => setOpen(false)} autoFocus>Close</button>
        </div>
        <nav className="wrap menu-links" aria-label="Menu">
          {[...NAV, ["Contact", "#contact"] as [string, string]].map(([l, h], i) => (
            <a key={h} href={h} onClick={() => setOpen(false)} style={{ animationDelay: `${80 + i * 60}ms` }}>{l}</a>
          ))}
        </nav>
        <div className="wrap menu-foot">
          <a href={`tel:${TEL}`}>{PHONE}</a>
          <a href={WA} target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
    </>
  );
}

function Hero() {
  return (
    <section id="top" className="hero" data-veil="0" data-hero>
      <div className="hero-stage">
        <div className="wrap hero-top">
          <div className="hk-wrap" data-hero-out>
            <p className="hero-kicker" data-hero-fade>A real-size walkthrough studio<br />in Bengaluru</p>
          </div>
          <div className="hi-wrap" data-hero-out>
            <div className="hero-intro" data-hero-fade>
              <p>Walk through your home at true 1:1 scale, room by room, before a single brick is laid.</p>
              <div className="hero-actions">
                <a href="#why" className="btn btn-bone hero-more" data-more>
                  Know more about us
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 2v10M3 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" /></svg>
                </a>
                <a href="#contact" className="btn btn-bone hero-book" data-magnetic>Book a walkthrough</a>
              </div>
            </div>
          </div>
        </div>
        <div className="wrap hero-mark-wrap">
          <h1 className="hero-mark wordmark-type" data-hero-mark aria-label="Home Studios">
            <span className="hm-line" data-hm-a><Letters text="HOME" attr="data-hero-ch" /></span>
            <span className="hm-gap" aria-hidden="true">{" "}</span>
            <span className="hm-line" data-hm-b><Letters text="STUDIOS" attr="data-hero-ch" /></span>
          </h1>
        </div>
        <div className="wrap hero-base" data-hero-out>
          <span className="scroll-cue" data-hero-fade><span className="scroll-cue-line" />Scroll</span>
          <span data-hero-fade>Rajarajeshwari Nagar</span>
          <span data-hero-fade>Est. 2022</span>
        </div>
      </div>
    </section>
  );
}

function Statement() {
  return (
    <section id="why" className="statement" data-veil="0.2" data-statement aria-label="Why walk it first">
      <div className="statement-stage">
        <div className="statement-media" aria-hidden="true">
          <video
            src={homeVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
          <div className="statement-media-scrim" />
        </div>
        <div className="wrap statement-inner">
          {STATEMENT.map((l) => (
            <p key={l} className="statement-line" data-statement-line>{l}</p>
          ))}
        </div>
        <div className="st-dots" role="tablist" aria-label="Statement lines">
          {STATEMENT.map((l, i) => (
            <button key={l} type="button" className="st-dot-btn" data-st-dot={i} aria-label={`Go to line ${i + 1}`}>
              <span className="st-dot-bar" />
            </button>
          ))}
        </div>
        <div className="st-swipe-sign" aria-hidden="true">
          <span className="st-swipe-arrow is-left">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </span>
          <span className="st-swipe-text">Swipe left or right</span>
          <span className="st-swipe-arrow is-right">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </section>
  );
}

function Process() {
  const n = (i: number) => String(i + 1).padStart(2, "0");
  return (
    <section id="process" className="process" data-veil="0.55" data-process>
      <div className="wrap process-head">
        <h2 className="h2" data-split>How a walkthrough works</h2>
        <p className="process-meta">Two to three hours, one floor at a time</p>
      </div>
      {/* Phones: one photo, then the steps as a list. */}
      <div className="track process-phone" data-track>
        <figure className="panel panel-img">
          <img src={planLinesImg} alt="Bedroom and bath outlines projected in light at full size on the studio floor" width={853} height={900} loading="lazy" />
          <figcaption>Your plan, projected at full size on the studio floor</figcaption>
        </figure>
        {STEPS.map((s, i) => (
          <article key={s.t} className="panel panel-step" data-panel>
            <span className="panel-n" data-panel-n>{n(i)}</span>
            <div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </div>
          </article>
        ))}
      </div>
      {/* Computers: the steps scroll on the right while the photo of the current step is
          held on the left. */}
      <div className="wrap process-desk" data-process-desk>
        <div className="pd-media" aria-hidden="true">
          <div className="pd-frame" data-pd-frame>
            <div className="pd-inner" data-pd-inner>
              {STEPS.map((s) => (
                <img key={s.t} src={s.img} alt="" loading="lazy" data-pd-img />
              ))}
              <div className="pd-count">
                <span className="pd-n wordmark-type">
                  <span className="pd-n-track" data-pd-track>
                    {STEPS.map((s, i) => (
                      <span key={s.t}>{n(i)}</span>
                    ))}
                  </span>
                </span>
                <span className="pd-of">/ {n(STEPS.length - 1)}</span>
              </div>
            </div>
          </div>
        </div>
        <ol className="pd-steps">
          {STEPS.map((s, i) => (
            <li key={s.t} className="pd-step" data-pd-step>
              <span className="pd-num">{n(i)}</span>
              <div>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Numbers() {
  const stats = [
    { pre: "", v: 500, s: "+", l: "families and firms have walked with us", count: true },
    { pre: "", v: 250, s: "+", l: "spaces delivered", count: true },
    { pre: "Since", v: 2022, s: "", l: "designing and building in Bengaluru", count: false },
    { pre: "", v: 5000, s: "", l: "sq ft of studio floor", count: true },
  ];
  return (
    <section id="studio" className="numbers" data-veil="0.6" aria-label="Home Studios in numbers">
      <dl className="wrap stats">
        {stats.map((s) => (
          <div key={s.l} className="stat" data-stat>
            <dt>
              {s.pre && <small>{s.pre} </small>}
              <span {...(s.count ? { "data-count": s.v } : {})}>{s.count ? s.v.toLocaleString("en-IN") : s.v}</span>{s.s}
            </dt>
            <dd>{s.l}</dd>
          </div>
        ))}
      </dl>
      <figure className="band" data-band>
        <div className="band-inner" data-band-inner>
          <img src={livingWideImg} alt="A double-height living room opening onto a forest through full-height glass" width={1200} height={720} loading="lazy" />
        </div>
        <figcaption className="wrap">Every room is walked at full size before it's built.</figcaption>
      </figure>
    </section>
  );
}

function Services({ onPick }: { onPick: (need: string) => void }) {
  return (
    <section id="services" className="services" data-veil="0.72">
      <div className="wrap">
        <div className="section-head">
          <h2 className="h2" data-split>One team, from first sketch to handover</h2>
          <p className="lede" data-fade>Book just the walkthrough, or let the team that walked it with you design, approve and build it. Choose a service to start an enquiry.</p>
        </div>
        <ul className="svc-list">
          {SERVICES.map((s) => (
            <li key={s.t} data-row>
              <button className="svc" onClick={() => onPick(s.need)} data-preview={s.img}>
                <span className="svc-t">{s.t}</span>
                <span className="svc-d">{s.d}</span>
                <span className="svc-thumb" aria-hidden="true" data-svc-thumb><img src={s.img} alt="" loading="lazy" /></span>
                <span className="svc-arrow" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 14L14 4M14 4H6M14 4v8" stroke="currentColor" strokeWidth="1.4" /></svg>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const [order, setOrder] = useState<number[]>(DESKTOP_ORDER);
  const lastFocus = useRef<HTMLElement | null>(null);
  const total = GALLERY_FLAT.length;
  const show = useCallback((list: number[], pos: number) => {
    lastFocus.current = document.activeElement as HTMLElement;
    setOrder(list);
    setOpen(pos);
  }, []);
  const close = useCallback(() => {
    setOpen(null);
    lastFocus.current?.focus({ preventScroll: true });
  }, []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + total) % total)), [total]);
  // Swipe left/right to change photo, swipe down to close (phones).
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (t) touch.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    const s0 = touch.current;
    touch.current = null;
    if (!t || !s0) return;
    const dx = t.clientX - s0.x;
    const dy = t.clientY - s0.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
  };

  useEffect(() => {
    lockScroll(open !== null);
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, step]);

  let n = 0;
  const current = open === null ? null : GALLERY_FLAT[order[open]!]!;
  return (
    <section id="gallery" className="gallery" data-veil="0.62">
      <div className="wrap gallery-head">
        <h2 className="gallery-title wordmark-type" data-gallery-title aria-label="Gallery">
          <Letters text="GALLERY" attr="data-gallery-ch" />
        </h2>
        <div className="gallery-meta" data-fade>
          <p className="lede">Light, proportion and the details that make a room. Select any frame to see it full size.</p>
          <span className="gallery-count">{String(total).padStart(2, "0")} photos & videos</span>
        </div>
      </div>
      <div className="wrap gallery-grid g-desktop">
        {GALLERY.map((col, c) => (
          <div className="g-col" key={c} data-g-col={c}>
            {col.map((p) => {
              const idx = n++;
              return (
                <button key={p.t} className="g-item" onClick={() => show(DESKTOP_ORDER, idx)} aria-label={`Open ${p.video ? "video" : "photo"}: ${p.t}`}>
                  <span className="g-img" data-g-reveal style={{ aspectRatio: `${p.w} / ${p.h}` }}>
                    {p.video ? (
                      <>
                        <video
                          src={p.video}
                          poster={p.poster || p.img}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                        />
                        <span className="g-vid-badge" aria-hidden="true">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M3.5 2.5L9.5 6L3.5 9.5V2.5Z" /></svg>
                        </span>
                      </>
                    ) : (
                      <img src={p.img} alt={p.alt} width={p.w} height={p.h} loading="lazy" />
                    )}
                  </span>
                  <span className="g-cap" aria-hidden="true">
                    {String(idx + 1).padStart(2, "0")}
                    {p.video && <span className="g-cap-tag">VIDEO</span>}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="wrap g-mobile">
        {MOBILE_LAYOUT.map((m, pos) => {
          const p = GALLERY_FLAT[m.i]!;
          return (
            <button key={p.t} className={`g-item ${m.wide ? "is-wide" : ""}`} onClick={() => show(MOBILE_ORDER, pos)} aria-label={`Open ${p.video ? "video" : "photo"}: ${p.t}`}>
              <span className="g-img" data-g-reveal style={{ aspectRatio: m.ratio }}>
                {p.video ? (
                  <>
                    <video
                      src={p.video}
                      poster={p.poster || p.img}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                    <span className="g-vid-badge" aria-hidden="true">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path d="M3.5 2.5L9.5 6L3.5 9.5V2.5Z" /></svg>
                    </span>
                  </>
                ) : (
                  <img src={p.img} alt={p.alt} width={p.w} height={p.h} loading="lazy" />
                )}
              </span>
              <span className="g-cap" aria-hidden="true">
                {String(pos + 1).padStart(2, "0")}
                {p.video && <span className="g-cap-tag">VIDEO</span>}
              </span>
            </button>
          );
        })}
      </div>

      {current && createPortal(
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={`${current.video ? "Video" : "Photo"} ${open! + 1} of ${total}: ${current.t}`} data-lenis-prevent onClick={close} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <figure className="lb-figure" onClick={(e) => e.stopPropagation()}>
            {current.video ? (
              <video
                key={current.video + open}
                src={current.video}
                poster={current.poster || current.img}
                autoPlay
                controls
                playsInline
                loop
              />
            ) : (
              <img key={(current.img || "") + open} src={current.img} alt={current.alt} />
            )}
            <figcaption>{String(open! + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}{current.video ? " · VIDEO" : ""}</figcaption>
          </figure>
          <button className="lb-btn lb-prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M12.5 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
          <button className="lb-btn lb-next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next item">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M7.5 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
          <button className="lb-close" onClick={close} autoFocus>Close</button>
        </div>,
        document.body,
      )}
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="faq" data-veil="0.85">
      <div className="wrap faq-grid">
        <div className="faq-side">
          <h2 className="h2" data-split>Questions before your visit</h2>
          <figure className="faq-pic" data-fade>
            <img src={familyImg} alt="A family walking through their floor plan, projected at full size in the studio" width={900} height={900} loading="lazy" />
            <figcaption>Bring your plan, your family and your questions.</figcaption>
          </figure>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className={`faq-item ${isOpen ? "is-open" : ""}`}>
                <h3>
                  <button id={`faq-q-${i}`} aria-controls={`faq-a-${i}`} aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)}>
                    <span>{f.q}</span>
                    <span className="faq-icon" aria-hidden="true" />
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} className="faq-a">
                  <div><p>{f.a}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Contact({ need, setNeed }: { need: string; setNeed: (n: string) => void }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string | undefined>;
    const errs: Record<string, string> = {};
    if (!d["name"]?.trim()) errs["name"] = "Enter your name.";
    if (!/^[6-9]\d{9}$/.test((d["phone"] || "").replace(/\D/g, "").slice(-10))) errs["phone"] = "Enter a 10-digit mobile number.";
    if (!d["need"]) errs["need"] = "Choose what you need.";
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      // Bring the first problem into view (matters on phones, where it can be off-screen).
      const el = document.getElementById(`f-${first}`);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const msg = `Hi Home Studios, I'm ${d["name"]} (${d["phone"]}). I need: ${d["need"]}. Plot: ${d["site"] || "not sure yet"}. ${d["message"] || ""}`.trim();
    window.open(`${WA}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    setSent(true);
  }

  return (
    <section id="contact" className="contact" data-veil="0.88">
      <div className="wrap contact-grid">
        <div className="contact-info">
          <h2 className="h2" data-split>Come stand in your home</h2>
          <p className="lede" data-fade>Tell us your plot size and timeline. We'll set a time for your walkthrough and tell you what to bring.</p>
          <dl className="details">
            <div><dt>Studio</dt><dd>{ADDRESS[0]}<br />{ADDRESS[1]}<br /><a href={MAP_LINK} target="_blank" rel="noopener" className="link">Get directions</a></dd></div>
            <div><dt>Hours</dt><dd>{HOURS}, by appointment</dd></div>
            <div><dt>Call or WhatsApp</dt><dd><a href={`tel:${TEL}`} className="link">{PHONE}</a></dd></div>
            <div><dt>Email</dt><dd><a href={`mailto:${EMAIL}`} className="link">{EMAIL}</a></dd></div>
          </dl>
        </div>
        <form className="form" onSubmit={submit} noValidate data-fade>
          <Field label="Name" error={errors["name"]} id="f-name">
            <input id="f-name" name="name" autoComplete="name" placeholder="Your full name" />
          </Field>
          <Field label="Mobile number" error={errors["phone"]} id="f-phone">
            <input id="f-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98xxx xxxxx" />
          </Field>
          <Field label="What do you need?" error={errors["need"]} id="f-need">
            <select id="f-need" name="need" value={need} onChange={(e) => setNeed(e.target.value)}>
              <option value="" disabled>Choose one</option>
              {NEEDS.map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <Field label="Plot size" id="f-site">
            <select id="f-site" name="site" defaultValue="">
              <option value="">Not sure yet</option>
              {["20×30", "30×40", "30×50", "40×60", "50×80", "Other"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </Field>
          <div className="full">
            <Field label="Anything else? (optional)" id="f-msg">
              <textarea id="f-msg" name="message" rows={3} placeholder="Stage of the project, number of floors, preferred dates" />
            </Field>
          </div>
          <div className="full form-foot">
            <button type="submit" className="btn btn-bone" data-magnetic>Continue on WhatsApp</button>
            <p className="form-note" role="status">
              {sent ? "WhatsApp opened in a new tab. Send the message there to confirm your slot." : "Opens WhatsApp with your details filled in."}
            </p>
          </div>
        </form>
        <div className="map" data-fade>
          <iframe title="Map showing HOME STUDIOS INDIA in Rajarajeshwari Nagar" src={MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          <a href={MAP_LINK} target="_blank" rel="noopener" className="map-badge" aria-label="Open HOME STUDIOS INDIA in Google Maps">
            <span className="map-badge-pin" aria-hidden="true">
              <svg width="18" height="22" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 8.8 10.5 17.1 11 17.5.3.2.7.3 1 .3s.7-.1 1-.3c.5-.4 11-8.7 11-17.5 0-6.627-5.373-12-12-12z" fill="#e53935"/>
                <circle cx="12" cy="11.5" r="4.5" fill="#ffffff"/>
              </svg>
            </span>
            <span className="map-badge-text">HOME STUDIOS INDIA</span>
            <span className="map-badge-sub">Open in Maps ↗</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function Field({ label, error, id, children }: { label: string; error?: string | undefined; id: string; children: ReactNode }) {
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <span className="field-error" role="alert">{error}</span>}
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer" data-veil="0.35" data-footer>
      <div className="wrap footer-cols">
        <nav aria-label="Footer">
          {[...NAV, ["Contact", "#contact"] as [string, string]].map(([l, h]) => <a key={h} href={h}>{l}</a>)}
        </nav>
        <div>
          <a href={`tel:${TEL}`}>{PHONE}</a>
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <a href={WA} target="_blank" rel="noopener">WhatsApp</a>
        </div>
        <div>
          <span>{ADDRESS[0]}</span>
          <span>{ADDRESS[1]}</span>
          <span>{HOURS}</span>
        </div>
      </div>
      <div className="wrap footer-mark-wrap">
        <p className="footer-mark wordmark-type" data-footer-mark aria-hidden="true">
          <Letters text={BRAND} attr="data-footer-ch" />
        </p>
      </div>
      <div className="wrap footer-base">
        <span>© {new Date().getFullYear()} Home Studios India</span>
        <span>Est. 2022</span>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  );
}
