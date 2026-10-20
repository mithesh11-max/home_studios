// Motion engine: Lenis smooth scroll + GSAP ScrollTrigger scenes.
// All content is real HTML; this only layers movement on top, and steps aside
// when the visitor prefers reduced motion.

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { frames } from "./frames";

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

let lenis: Lenis | null = null;
let loading = true;

const expo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function scrollToTarget(href: string) {
  const target = href === "#top" ? 0 : document.querySelector<HTMLElement>(href);
  if (target === null) return;
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.8, easing: expo, force: true });
  } else {
    const top = typeof target === "number" ? 0 : target.getBoundingClientRect().top + window.scrollY;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
  }
}

export function lockScroll(lock: boolean) {
  document.documentElement.classList.toggle("is-locked", lock);
  if (loading) return;
  if (lock) lenis?.stop();
  else lenis?.start();
}

/** Size a single-line wordmark so it spans its container edge to edge. */
function fitWordmark(el: HTMLElement) {
  const parent = el.parentElement;
  if (!parent) return;
  const cs = getComputedStyle(parent);
  const avail = parent.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  el.style.fontSize = "100px";
  const w = el.offsetWidth;
  if (w > 0) el.style.fontSize = `${(100 * avail) / w}px`;
}

export function createMotion(): () => void {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const q = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
  const qa = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));

  let killed = false;
  const cleanups: (() => void)[] = [];
  const splits: SplitText[] = [];
  const on = <K extends keyof WindowEventMap>(t: K, fn: (e: WindowEventMap[K]) => void, o?: AddEventListenerOptions) => {
    window.addEventListener(t, fn, o);
    cleanups.push(() => window.removeEventListener(t, fn));
  };

  root.classList.add("js", "is-loading");
  if (!reduce) root.classList.add("motion");
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  loading = true;

  // ── Wordmarks always span the full width ────────────────────────
  const marks = qa("[data-hero-mark], [data-footer-mark]");
  const fitAll = () => marks.forEach(fitWordmark);
  fitAll();
  ScrollTrigger.addEventListener("refreshInit", fitAll);
  cleanups.push(() => ScrollTrigger.removeEventListener("refreshInit", fitAll));

  // ── Smooth scroll ────────────────────────────────────────────────
  // Smooth wheel scrolling for mouse and trackpad only. Phones and tablets keep their own
  // native momentum scrolling, which is the smoothest thing a touch screen can do.
  if (!reduce && finePointer) {
    lenis = new Lenis({ lerp: 0.08, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
    cleanups.push(() => {
      gsap.ticker.remove(raf);
      lenis?.destroy();
      lenis = null;
    });
  }

  const onClick = (e: MouseEvent) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
    const href = a?.getAttribute("href");
    if (!a || !href || href === "#") return;
    e.preventDefault();
    scrollToTarget(href);
    if (href === "#main") q<HTMLElement>("#main")?.focus({ preventScroll: true });
  };
  document.addEventListener("click", onClick);
  cleanups.push(() => document.removeEventListener("click", onClick));

  // ── Nav state ───────────────────────────────────────────────────
  const nav = q("[data-nav]");
  const heroEl = q("[data-hero]");
  // While the wordmark is travelling up into the menu bar, keep the bar fully clear
  // (no frosted backdrop), so the letters never pass behind a blur.
  let clearUntil = 40;
  const measureNav = () => {
    clearUntil = reduce || !heroEl ? 40 : Math.max(40, heroEl.offsetHeight - window.innerHeight - 2);
  };
  measureNav();
  ScrollTrigger.addEventListener("refresh", measureNav);
  cleanups.push(() => ScrollTrigger.removeEventListener("refresh", measureNav));
  // Phones: thin reading-progress line under the menu bar, and a bottom action bar that
  // appears once the hero is done and steps aside when the contact form is on screen.
  const progress = q("[data-nav-progress]");
  const mbar = q("[data-mbar]");
  let maxScroll = 1;
  const measureMax = () => (maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight));
  measureMax();
  ScrollTrigger.addEventListener("refresh", measureMax);
  cleanups.push(() => ScrollTrigger.removeEventListener("refresh", measureMax));
  let contactInView = false;
  // Phones: the menu bar background and the action bar wait until the wordmark has landed
  // in the menu bar, so nothing slides over it mid-flight.
  let phoneDock: { docked: () => boolean; onScroll: (y: number) => void } | null = null;
  const onScroll = () => {
    const y = window.scrollY;
    phoneDock?.onScroll(y);
    const ready = phoneDock ? phoneDock.docked() : y > clearUntil;
    nav?.classList.toggle("is-scrolled", ready && y > 4);
    if (progress) progress.style.transform = `scaleX(${Math.min(1, y / maxScroll)})`;
    mbar?.classList.toggle("is-on", !loading && ready && y > 40 && !contactInView);
  };
  on("scroll", onScroll, { passive: true });
  const barIO = new IntersectionObserver(
    (es) => {
      contactInView = es.some((e) => e.isIntersecting);
      onScroll();
    },
    { rootMargin: "0px 0px -20% 0px" },
  );
  qa("#contact, .footer").forEach((el) => barIO.observe(el));
  cleanups.push(() => barIO.disconnect());
  const isPhone = () => window.matchMedia("(max-width: 760px)").matches;

  const links = qa<HTMLAnchorElement>("[data-navlink]");
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (en.isIntersecting)
          links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${en.target.id}`));
      }),
    { rootMargin: "-45% 0px -50% 0px" },
  );
  qa("section[id]").forEach((s) => io.observe(s));
  cleanups.push(() => io.disconnect());

  const ctx = gsap.context(() => {});

  // ── Loader ──────────────────────────────────────────────────────
  const loader = q("[data-loader]");
  const count = q("[data-loader-count]");
  const bar = q("[data-loader-bar]");
  let target = 0.01;
  let shown = 1;
  let fontsReady = !document.fonts;
  const t0 = performance.now();
  // Wait for the actual brand face (not just document.fonts.ready, which can resolve
  // before the stylesheet has asked for it), then re-fit the wordmarks.
  const fontLoad = document.fonts
    ? Promise.all([document.fonts.load('700 100px "Archivo Variable"'), document.fonts.load('400 16px "Archivo Variable"')])
    : Promise.resolve([]);
  void fontLoad.catch(() => []).then(() => {
    fontsReady = true;
    fitAll();
    ScrollTrigger.refresh();
  });
  const onFontsDone = () => fitAll();
  document.fonts?.addEventListener("loadingdone", onFontsDone);
  cleanups.push(() => document.fonts?.removeEventListener("loadingdone", onFontsDone));
  frames.start();
  const offProgress = frames.onProgress((c) => (target = Math.max(0.01, c)));
  cleanups.push(() => offProgress());
  const safety = window.setTimeout(() => {
    target = 1;
    fontsReady = true;
  }, 9000);
  cleanups.push(() => window.clearTimeout(safety));

  let loaderRaf = 0;
  const loaderTick = () => {
    if (killed) return;
    const goal = target * 100;
    shown = Math.min(goal, shown + Math.max(0.5, (goal - shown) * 0.08));
    const pct = Math.max(1, Math.min(100, Math.round(shown)));
    if (count) count.textContent = `${pct}%`;
    if (bar) bar.style.transform = `scaleX(${shown / 100})`;
    const minTime = reduce ? 300 : 1300;
    if (shown >= 99.9 && fontsReady && performance.now() - t0 > minTime) finishLoading();
    else loaderRaf = requestAnimationFrame(loaderTick);
  };
  loaderRaf = requestAnimationFrame(loaderTick);
  cleanups.push(() => cancelAnimationFrame(loaderRaf));

  function finishLoading() {
    if (killed) return;
    if (count) count.textContent = "100%";
    if (bar) bar.style.transform = "scaleX(1)";
    fitAll();
    buildScenes();
    ctx.add(() => {
      const tl = gsap.timeline({ onComplete: () => loader?.setAttribute("hidden", "") });
      if (reduce) {
        tl.to(loader, { autoAlpha: 0, duration: 0.3 });
        return;
      }
      tl.to(".loader-foot, .loader-line", { opacity: 0, y: -12, duration: 0.5, ease: "power2.in" })
        .to(loader, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.inOut" }, "-=0.1")
        // The brand mark rises letter by letter.
        .fromTo(
          "[data-hero-ch]",
          { yPercent: 118, rotate: 6 },
          { yPercent: 0, rotate: 0, duration: 1.6, ease: "expo.out", stagger: 0.05 },
          "-=0.6",
        )
        .fromTo("[data-hero-fade]", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.07 }, "-=1.2")
        .fromTo(".nav-links, .nav-cta, .nav-toggle, .brand img", { opacity: 0 }, { opacity: 1, duration: 0.9, ease: "power2.out" }, "<");
    });
    loading = false;
    root.classList.remove("is-loading");
    if (!root.classList.contains("is-locked")) lenis?.start();
  }

  // ── Scroll scenes ───────────────────────────────────────────────
  function buildScenes() {
    ctx.add(() => {
      const veil = q("[data-smoke-veil]");
      qa("[data-veil]").forEach((sec) => {
        ScrollTrigger.create({
          trigger: sec,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (s) => {
            if (!s.isActive) return;
            const v = Number(sec.dataset["veil"] ?? 0);
            // Phones put text closer to the bright smoke; darken reading-heavy sections a little more.
            const val = isPhone() && v >= 0.7 ? Math.min(0.95, v + 0.07) : v;
            gsap.to(veil, { opacity: val, duration: 1, ease: "power2.out", overwrite: true });
          },
        });
      });

      if (reduce) return;

      const mm = gsap.matchMedia();
      cleanups.push(() => mm.revert());
      // Each layout reveals only its own gallery grid (the other one is display:none).
      const revealGallery = (sel: string) =>
        qa(`${sel} [data-g-reveal]`).forEach((el) =>
          wipeUp(el, el.closest(".g-item") ?? el, { duration: 1.5, imgFrom: 1.35, imgDuration: 1.8 }),
        );
      mm.add("(min-width: 769px)", () => revealGallery(".g-desktop"));
      mm.add("(max-width: 768px)", () => revealGallery(".g-mobile"));
      mm.add("(min-width: 769px) and (min-height: 501px)", () => {
        heroDock();
        statementScene(false);
        return processDesk();
      });
      mm.add("(max-width: 768px), (max-height: 500px)", () => {
        const undoDock = heroDockPhone();
        const undoStatement = statementPhone();
        const undoProcess = processPhone();
        servicesPhone();
        return () => {
          undoDock?.();
          undoStatement?.();
          undoProcess?.();
        };
      });

      qa("[data-split]").forEach((el) => {
        const s = new SplitText(el, { type: "lines", mask: "lines", linesClass: "split-line" });
        splits.push(s);
        gsap.from(s.lines, {
          yPercent: 105, duration: 1.2, ease: "expo.out", stagger: 0.09,
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        });
      });

      qa("[data-fade]").forEach((el) => {
        gsap.from(el, { opacity: 0, y: 28, duration: 1.2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });


      // Numbers: rules draw, figures count.
      const stats = qa("[data-stat]");
      if (stats.length) {
        gsap.fromTo(stats, { "--draw": 0 }, {
          "--draw": 1, duration: 1.4, ease: "expo.out", stagger: 0.1,
          scrollTrigger: { trigger: stats[0]!, start: "top 88%", once: true },
        });
        gsap.from(stats.map((s) => s.querySelector("dt")), {
          yPercent: 40, opacity: 0, duration: 1.3, ease: "expo.out", stagger: 0.1,
          scrollTrigger: { trigger: stats[0]!, start: "top 88%", once: true },
        });
      }
      qa("[data-count]").forEach((el) => {
        const to = Number(el.dataset["count"]);
        const o = { v: 0 };
        gsap.to(o, {
          v: to, duration: 2.2, ease: "power3.out",
          onUpdate: () => (el.textContent = Math.round(o.v).toLocaleString("en-IN")),
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });

      // Services: rule draws, then names slide in.
      const rows = qa("[data-row]");
      if (rows.length) {
        gsap.fromTo(rows, { "--draw": 0 }, {
          "--draw": 1, duration: 1.4, ease: "expo.out", stagger: 0.07,
          scrollTrigger: { trigger: rows[0]!, start: "top 85%", once: true },
        });
        gsap.from(rows.map((r) => r.querySelector(".svc")), {
          opacity: 0, yPercent: 40, duration: 1.2, ease: "expo.out", stagger: 0.07,
          scrollTrigger: { trigger: rows[0]!, start: "top 85%", once: true },
        });
      }

      // Studio band: opens from a framed card to full bleed.
      const band = q("[data-band-inner]");
      if (band) openFrame(band, { insetX: 0.12, insetY: 0.1, r0: 10, r1: 0, start: 0.92, end: 0.55, imgFrom: 1.3 });

      // Gallery: title rises letter by letter; photos unmask upward; columns drift at different speeds.
      gsap.fromTo("[data-gallery-ch]", { yPercent: 118, rotate: 7 }, {
        yPercent: 0, rotate: 0, duration: 1.5, ease: "expo.out", stagger: 0.06,
        scrollTrigger: { trigger: "[data-gallery-title]", start: "top 92%", once: true },
      });
      ScrollTrigger.matchMedia({
        "(min-width: 761px)": () => {
          const drift = [70, -110, 30];
          qa("[data-g-col]").forEach((col) => {
            const d = drift[Number(col.dataset["gCol"])] ?? 0;
            gsap.fromTo(col, { y: d }, {
              y: -d, ease: "none",
              scrollTrigger: { trigger: ".gallery-grid", start: "top bottom", end: "bottom top", scrub: true },
            });
          });
        },
      });

      // Footer: the wordmark rises letter by letter, and sinks again if you scroll back up.
      gsap.fromTo(
        "[data-footer-ch]",
        { yPercent: 118, rotate: 7 },
        {
          yPercent: 0, rotate: 0, duration: 1.5, ease: "expo.out", stagger: 0.055,
          scrollTrigger: { trigger: "[data-footer-mark]", start: "top 96%", toggleActions: "play none none reverse" },
        },
      );

      if (finePointer) pointerFx();
    });

    const refresh = () => ScrollTrigger.refresh();
    requestAnimationFrame(refresh);
    on("load", refresh);
  }

  // The big wordmark shrinks into the menu bar as you scroll out of the hero. Each word
  // flies to its own word in the bar, so it works whether the hero sets it on one line
  // (desktop) or two (phones). The stage is CSS-sticky, so the browser holds it in place
  // natively: no pin swapping, no jitter on iOS.
  function heroDock() {
    const hero = q("[data-hero]");
    const lineA = q("[data-hm-a]");
    const lineB = q("[data-hm-b]");
    const navA = q("[data-brand-a]");
    const navB = q("[data-brand-b]");
    const navText = q("[data-brand-text]");
    if (!hero || !lineA || !lineB || !navA || !navB || !navText) return;
    // Layout position inside the sticky stage, ignoring any transform currently applied.
    const pos = (el: HTMLElement) => {
      let x = 0;
      let y = 0;
      let n: HTMLElement | null = el;
      while (n && !n.classList.contains("hero-stage")) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent as HTMLElement | null;
      }
      return { x, y };
    };
    const scale = () => navA.offsetWidth / lineA.offsetWidth;
    const dx = (line: HTMLElement, word: HTMLElement) => () => word.getBoundingClientRect().left - pos(line).x;
    const dy = (line: HTMLElement, word: HTMLElement) => () => word.getBoundingClientRect().top - pos(line).y;

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: 1, invalidateOnRefresh: true },
    });
    tl.to("[data-hero-out]", { opacity: 0, y: -40, duration: 0.35 }, 0)
      .fromTo(lineA, { x: 0, y: 0, scale: 1 }, { x: dx(lineA, navA), y: dy(lineA, navA), scale, duration: 1, ease: "power2.inOut" }, 0)
      // On phones the second word starts on its own line; it rises a little later than it
      // shrinks and slides, so it tucks in beside the first word instead of crossing it.
      .fromTo(lineB, { x: 0, scale: 1 }, { x: dx(lineB, navB), scale, duration: 1, ease: "power2.inOut" }, 0)
      .fromTo(lineB, { y: 0 }, { y: dy(lineB, navB), duration: 1, ease: isPhone() ? "power3.in" : "power2.inOut" }, 0)
      .fromTo(navText, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.9)
      .to([lineA, lineB], { opacity: 0, duration: 0.1 }, 0.9);
  }

  // Four lines, one at a time, each lifting out as the next arrives. Phones skip the
  // blur (expensive on mobile GPUs) and use a shorter scroll.
  function statementScene(phone: boolean) {
    const st = q("[data-statement]");
    if (!st) return;
    const lines = qa("[data-statement-line]", st);
    const out = phone ? { yPercent: -50, opacity: 0 } : { yPercent: -70, opacity: 0, filter: "blur(10px)" };
    const inn = phone ? { yPercent: 0, opacity: 1 } : { yPercent: 0, opacity: 1, filter: "blur(0px)" };
    gsap.set(lines.slice(1), phone ? { yPercent: 50, opacity: 0 } : { yPercent: 70, opacity: 0, filter: "blur(10px)" });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: st, start: "top top", end: "bottom bottom", scrub: 0.8 },
    });
    tl.to({}, { duration: 0.4 });
    lines.forEach((l, i) => {
      if (i === 0) return;
      tl.to(lines[i - 1]!, { ...out, duration: 1, ease: "power2.in" })
        .to(l, { ...inn, duration: 1, ease: "power2.out" }, "<0.45")
        .to({}, { duration: 0.6 });
    });
  }

  // Phones: the wordmark flies into the menu bar by itself once you start scrolling, and
  // flies back into the hero when you come back up to it.
  //
  // Smoothness rules:
  //  - Nothing is measured or built when a flight starts. Both ends of the flight and the
  //    flying copies are prepared in advance (and again only after a resize), so the first
  //    frame of a flight costs the same as every other: two transform writes.
  //  - The copies fly in two ready-made layers: one anchored to the page, one to the
  //    screen. Near the hero they fly in the page layer, so they move with the page's own
  //    native scrolling; near the menu bar they fly in the screen layer, so they sit as
  //    still as the bar. They switch layers mid-air, where they move fastest.
  //  - Each end of the flight is pixel-exact with the real text it hands over to.
  //  - If the direction flips mid-flight, the new flight starts from wherever the words are.
  function heroDockPhone() {
    const mark = q("[data-hero-mark]");
    const lineA = q("[data-hm-a]");
    const lineB = q("[data-hm-b]");
    const navA = q("[data-brand-a]");
    const navB = q("[data-brand-b]");
    const navText = q("[data-brand-text]");
    if (!mark || !lineA || !lineB || !navA || !navB || !navText) return;

    const lines = [lineA, lineB];
    const words = [navA, navB];
    const moreBtn = q("[data-more]");

    type Space = "page" | "screen";
    type Pose = { x: number; y: number; s: number };
    type End = { pose: Pose; space: Space };
    type State = "undocked" | "docking" | "docked" | "undocking";

    let state: State = "undocked";
    let flight: gsap.core.Timeline | null = null;
    const prog = [{ p: 0 }, { p: 0 }];
    let from: End[] = [];
    let to: End[] = [];
    let heroIsTarget = false;
    let liveY = window.scrollY;

    // Prepared ends: each line's spot in the hero (page coordinates) and in the menu bar
    // (screen coordinates, the bar is fixed), plus where the copies were last drawn.
    let hero: Pose[] = [];
    let bar: Pose[] = [];
    let cur: End[] = [];
    let frac: { x: number; y: number }[] = [];
    let homeTop = 0;
    let homeH = 0;

    // Two layers of copies. The page layer's copies carry the sub-pixel part of the
    // line's page position as layout, so the browser snaps them exactly like the real
    // lines; the screen layer's copies sit on whole pixels, like the menu text.
    type Layer = { el: HTMLElement; clones: HTMLElement[]; gpu: boolean[] };
    let layers: Record<Space, Layer> | null = null;
    let shown: Space | null = null;

    const showLines = (on: boolean) => lines.forEach((l) => (l.style.visibility = on ? "" : "hidden"));
    const showNav = (on: boolean) => (navText.style.opacity = on ? "1" : "0");

    const buildLayer = (space: Space): Layer => {
      const el = document.createElement("div");
      el.className = space === "page" ? "hero-dock-overlay is-page" : "hero-dock-overlay";
      el.setAttribute("aria-hidden", "true");
      const cs = getComputedStyle(mark);
      const ctx = document.createElement("div");
      ctx.className = mark.className;
      ctx.style.cssText = `position:absolute;left:0;top:0;margin:0;font-size:${cs.fontSize};color:${cs.color}`;
      const clones = lines.map((line, i) => {
        const c = line.cloneNode(true) as HTMLElement;
        [c, ...Array.from(c.querySelectorAll<HTMLElement>("*"))].forEach((n) => {
          Array.from(n.attributes).forEach((a) => a.name.startsWith("data-") && n.removeAttribute(a.name));
        });
        // Letters at rest whatever the intro was doing, written the way GSAP leaves the
        // real ones (an identity translate), so both are painted identically.
        c.querySelectorAll<HTMLElement>(".ch").forEach((ch) => (ch.style.transform = "translate(0px, 0px)"));
        // Painted crisp at every size, rather than one cached bitmap stretched up or down.
        const o = space === "page" ? frac[i]! : { x: 0, y: 0 };
        c.style.cssText = `position:absolute;left:${o.x}px;top:${o.y}px;margin:0;transform-origin:0 0;will-change:auto`;
        ctx.appendChild(c);
        return c;
      });
      el.appendChild(ctx);
      document.body.appendChild(el);
      return { el, clones, gpu: [false, false] };
    };

    const dropLayers = () => {
      if (!layers) return;
      layers.page.el.remove();
      layers.screen.el.remove();
      layers = null;
      shown = null;
    };

    // Measures both ends and rebuilds the copies. Runs at start-up and after a resize or a
    // font change, never during a flight.
    const prepare = () => {
      const probes = [...lines, ...words].map((el) => {
        const p = document.createElement("span");
        p.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
        el.appendChild(p);
        return p;
      });
      const heroSize = parseFloat(getComputedStyle(mark).fontSize) || 1;
      const barSize = parseFloat(getComputedStyle(navText).fontSize) || 1;
      const k = barSize / heroSize;
      const sx = window.scrollX;
      const sy = window.scrollY;
      hero = [];
      bar = [];
      frac = [];
      lines.forEach((line, i) => {
        const r = line.getBoundingClientRect();
        const lineBase = probes[i]!.getBoundingClientRect().top - r.top;
        const w = words[i]!.getBoundingClientRect();
        const wordBase = probes[i + 2]!.getBoundingClientRect().top;
        const px = r.left + sx;
        const py = r.top + sy;
        hero.push({ x: px, y: py, s: 1 });
        frac.push({ x: px - Math.floor(px), y: py - Math.floor(py) });
        // Shrunk to the menu font size, with its baseline on the menu word's baseline.
        bar.push({ x: w.left, y: wordBase - lineBase * k, s: k });
      });
      probes.forEach((p) => p.remove());
      homeTop = hero[0]!.y;
      homeH = lineA.offsetHeight;
      dropLayers();
      layers = { page: buildLayer("page"), screen: buildLayer("screen") };
    };

    const heroEnd = (i: number): End => ({ pose: hero[i]!, space: "page" });
    const barEnd = (i: number): End => ({ pose: bar[i]!, space: "screen" });
    const inSpace = (e: End, space: Space, y: number): Pose =>
      e.space === space ? e.pose : { ...e.pose, y: e.pose.y + (space === "page" ? y : -y) };

    const show = (space: Space | null) => {
      if (!layers || space === shown) return;
      layers.page.el.classList.toggle("is-on", space === "page");
      layers.screen.el.classList.toggle("is-on", space === "screen");
      shown = space;
    };

    const render = () => {
      if (!layers) return;
      const y = liveY;
      // Which layer: the one belonging to the end the words are closer to.
      const q = (prog[0]!.p + prog[1]!.p) / 2;
      const space: Space = (heroIsTarget ? q >= 0.5 : q < 0.5) ? "page" : "screen";
      show(space);
      // On a hard fling the page can outrun the flight up to the bar: the words rise with
      // it only until HOME reaches the bar, never off the top. Both lines move together, so
      // STUDIOS stays a line below HOME until it slides in beside it.
      const lift = heroIsTarget ? 0 : Math.max(0, to[0]!.pose.y - inSpace(from[0]!, "screen", y).y);
      layers[space].clones.forEach((c, i) => {
        const p = prog[i]!.p;
        const a = inSpace(from[i]!, space, y);
        const b = inSpace(to[i]!, space, y);
        const ay = a.y + lift;
        // STUDIOS joins HOME's row only once it has slid clear of it, and leaves the row
        // first on the way back, so the two words never brush past each other.
        const py = i === 0 ? p : heroIsTarget ? 1 - Math.pow(1 - p, 1.8) : Math.pow(p, 1.8);
        const pose = { x: a.x + (b.x - a.x) * p, y: ay + (b.y - ay) * py, s: a.s + (b.s - a.s) * p };
        cur[i] = { pose, space };
        const o = space === "page" ? frac[i]! : { x: 0, y: 0 };
        c.style.transform = `translate(${pose.x - o.x}px, ${pose.y - o.y}px) scale(${pose.s})`;
        // On the way up the words only ever shrink, so mid-flight they can ride on their own
        // GPU layer (moved without repainting) and stay sharp. The first and last frames are
        // drawn normally, so both hand-overs stay pixel-exact. Growing on the way back would
        // blur a GPU layer, so that flight is always drawn normally.
        const gpu = !heroIsTarget && p > 0.04 && p < 0.9;
        if (gpu !== layers![space].gpu[i]) {
          layers![space].gpu[i] = gpu;
          c.style.willChange = gpu ? "transform" : "auto";
        }
      });
    };

    const land = (s: "docked" | "undocked") => {
      flight?.kill();
      flight = null;
      state = s;
      // Show the real text and hide the copies in the same frame: no gap, no double.
      showNav(s === "docked");
      showLines(s === "undocked");
      show(null);
      onScroll();
    };

    // One flight towards the bar ("docking") or back into the hero ("undocking").
    const fly = (dir: "docking" | "undocking") => {
      if (!layers) prepare();
      liveY = window.scrollY;
      let share = 1;
      if (flight) {
        // Turn around from wherever the words are.
        flight.kill();
        from = cur.slice();
        share = Math.max(0.45, (prog[0]!.p + prog[1]!.p) / 2);
      } else {
        from = lines.map((_, i) => (dir === "docking" ? heroEnd(i) : barEnd(i)));
      }
      to = lines.map((_, i) => (dir === "docking" ? barEnd(i) : heroEnd(i)));
      heroIsTarget = dir === "undocking";
      state = dir;
      prog.forEach((o) => (o.p = 0));
      render();
      showLines(false);
      showNav(false);
      onScroll();

      const d = (dir === "docking" ? 0.62 : 0.72) * share;
      flight = gsap.timeline({ onUpdate: render, onComplete: () => land(dir === "docking" ? "docked" : "undocked") });
      // STUDIOS trails HOME a beat, so it tucks in beside it instead of crossing it.
      const lag = dir === "docking" ? [0, 0.05] : [0.05, 0];
      prog.forEach((o, i) => flight!.to(o, { p: 1, duration: d, ease: "power3.out" }, lag[i]! * share));
    };

    const dock = () => {
      if (state === "docked" || state === "docking") return;
      if (reduce) return land("docked");
      fly("docking");
    };
    const undock = () => {
      if (state === "undocked" || state === "undocking") return;
      if (reduce) return land("undocked");
      fly("undocking");
    };

    // Direction is judged over a few pixels, so a finger wobble never flips it.
    let lastY = Math.max(0, window.scrollY);
    let down = 0;
    let up = 0;
    phoneDock = {
      docked: () => state === "docked",
      onScroll: (raw) => {
        liveY = raw;
        const y = Math.max(0, raw);
        const dy = y - lastY;
        lastY = y;
        if (dy > 0) {
          down += dy;
          up = 0;
        } else if (dy < 0) {
          up -= dy;
          down = 0;
        }
        // The wordmark's spot in the hero is (nearly) back on screen.
        const homeNear = y < homeTop + homeH;
        if (y <= 4) undock();
        else if (down >= Math.min(10, y)) dock();
        else if (up >= 10 && homeNear) undock();
      },
    };

    prepare();
    land(window.scrollY > 4 ? "docked" : "undocked");

    // "Know more about us": dock straight away, while the page glides down.
    const onMore = () => dock();
    moreBtn?.addEventListener("click", onMore);

    // A width change re-fits the wordmark: finish any flight where it was heading, then
    // re-measure and rebuild the copies once the new layout is in.
    const settle = () => {
      if (state === "docking") land("docked");
      else if (state === "undocking") land("undocked");
    };
    ScrollTrigger.addEventListener("refreshInit", settle);
    ScrollTrigger.addEventListener("refresh", prepare);

    return () => {
      flight?.kill();
      flight = null;
      dropLayers();
      phoneDock = null;
      moreBtn?.removeEventListener("click", onMore);
      ScrollTrigger.removeEventListener("refreshInit", settle);
      ScrollTrigger.removeEventListener("refresh", prepare);
      lines.forEach((l) => (l.style.visibility = ""));
      navText.style.opacity = "";
      gsap.set(lines, { clearProps: "transform,opacity" });
    };
  }

  // Phones: swipe left or right (or tap) to read through the four statement lines.
  // Smooth slide-fade transitions, responsive dots, tap left/right zones, and gentle auto-advance.
  function statementPhone() {
    const st = q("[data-statement]");
    if (!st) return;
    const stage = (q(".statement-stage", st) as HTMLElement | null) ?? st;
    const lines = qa("[data-statement-line]", st);
    const dots = qa("[data-st-dot]", st);
    if (!lines.length) return;

    let currentIndex = 0;
    let autoTimer: ReturnType<typeof setTimeout> | null = null;
    let isVisible = false;
    let lastTouchTime = 0;

    // Initial state: first line visible, others hidden
    lines.forEach((line, i) => {
      if (i === 0) {
        gsap.set(line, { opacity: 1, xPercent: 0, visibility: "visible", pointerEvents: "auto" });
      } else {
        gsap.set(line, { opacity: 0, xPercent: 45, visibility: "hidden", pointerEvents: "none" });
      }
    });

    const markDots = (idx: number) => {
      dots.forEach((d, k) => {
        d.classList.toggle("is-on", k === idx);
        d.setAttribute("aria-selected", k === idx ? "true" : "false");
      });
    };
    markDots(0);

    function goTo(nextIndex: number, direction?: number) {
      if (lines.length <= 1) return;
      const targetIndex = (nextIndex + lines.length) % lines.length;
      if (targetIndex === currentIndex) return;

      const currentLine = lines[currentIndex]!;
      const nextLine = lines[targetIndex]!;
      const dir = direction !== undefined
        ? direction
        : targetIndex > currentIndex ? 1 : -1;

      // Hide any inactive lines immediately so rapid clicks don't stack
      lines.forEach((l, i) => {
        if (i !== currentIndex && i !== targetIndex) {
          gsap.killTweensOf(l);
          gsap.set(l, { visibility: "hidden", opacity: 0, pointerEvents: "none" });
        }
      });

      // Animate out current line
      gsap.killTweensOf(currentLine);
      gsap.to(currentLine, {
        xPercent: -45 * dir,
        opacity: 0,
        duration: 0.45,
        ease: "power2.inOut",
        onComplete: () => {
          gsap.set(currentLine, { visibility: "hidden", pointerEvents: "none" });
        },
      });

      // Animate in next line
      gsap.killTweensOf(nextLine);
      gsap.set(nextLine, {
        visibility: "visible",
        pointerEvents: "auto",
        opacity: 0,
        xPercent: 45 * dir,
      });

      gsap.to(nextLine, {
        xPercent: 0,
        opacity: 1,
        duration: 0.55,
        ease: "expo.out",
      });

      currentIndex = targetIndex;
      markDots(currentIndex);
    }

    const AUTO_DELAY = 6000;
    function resetAuto() {
      if (autoTimer) clearTimeout(autoTimer);
      if (reduce) return;
      if (isVisible) {
        autoTimer = setTimeout(() => {
          goTo(currentIndex + 1, 1);
          resetAuto();
        }, AUTO_DELAY);
      }
    }

    const st0 = ScrollTrigger.create({
      trigger: st,
      start: "top 75%",
      end: "bottom 25%",
      onToggle: (self) => {
        isVisible = self.isActive;
        if (isVisible) {
          resetAuto();
        } else if (autoTimer) {
          clearTimeout(autoTimer);
          autoTimer = null;
        }
      },
    });

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchStartTime = Date.now();
      if (autoTimer) clearTimeout(autoTimer);
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!e.changedTouches[0]) return;
      lastTouchTime = Date.now();
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const dx = touchEndX - touchStartX;
      const dy = touchEndY - touchStartY;
      const dt = lastTouchTime - touchStartTime;

      const target = e.target as HTMLElement | null;
      if (target?.closest(".st-dots")) {
        resetAuto();
        return;
      }

      // Swipe threshold: at least 32px horizontally and clearly horizontal
      if (Math.abs(dx) > 32 && Math.abs(dx) > Math.abs(dy) * 0.75) {
        if (dx < 0) {
          goTo(currentIndex + 1, 1);
        } else {
          goTo(currentIndex - 1, -1);
        }
      } else if (Math.abs(dx) < 16 && Math.abs(dy) < 16 && dt < 450) {
        // Tap gesture: tap left 32% goes prev, rest goes next
        const rect = stage.getBoundingClientRect();
        const tapX = touchEndX - rect.left;
        if (tapX < rect.width * 0.32) {
          goTo(currentIndex - 1, -1);
        } else {
          goTo(currentIndex + 1, 1);
        }
      }

      resetAuto();
    };

    stage.addEventListener("touchstart", onTouchStart, { passive: true });
    stage.addEventListener("touchend", onTouchEnd, { passive: true });

    const onClick = (e: MouseEvent) => {
      if (Date.now() - lastTouchTime < 500) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest(".st-dots")) return;

      const rect = stage.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX < rect.width * 0.32) {
        goTo(currentIndex - 1, -1);
      } else {
        goTo(currentIndex + 1, 1);
      }
      resetAuto();
    };
    stage.addEventListener("click", onClick);

    const dotCleanups: Array<() => void> = [];
    dots.forEach((dot, idx) => {
      const handler = (e: Event) => {
        e.stopPropagation();
        const dir = idx > currentIndex ? 1 : -1;
        goTo(idx, dir);
        resetAuto();
      };
      dot.addEventListener("click", handler);
      dotCleanups.push(() => dot.removeEventListener("click", handler));
    });

    return () => {
      st0.kill();
      if (autoTimer) clearTimeout(autoTimer);
      stage.removeEventListener("touchstart", onTouchStart);
      stage.removeEventListener("touchend", onTouchEnd);
      stage.removeEventListener("click", onClick);
      dotCleanups.forEach((c) => c());
      lines.forEach((l) => gsap.killTweensOf(l));
      gsap.set(lines, { clearProps: "transform,opacity,visibility,pointerEvents" });
    };
  }

  // Phones: each service photo opens upward a beat after its row slides in.
  function servicesPhone() {
    qa("[data-svc-thumb]").forEach((t) =>
      wipeUp(t, t.parentElement ?? t, { duration: 1.2, imgFrom: 1.4, imgDuration: 1.6, delay: 0.15 }),
    );
  }

  // Reveals a photo with an upward wipe using transforms only: the frame slides up into
  // place while the photo inside slides down by the same amount, so the photo stays put
  // and is uncovered from the bottom. It looks like an animated clip-path, but the browser
  // never repaints the photo while it plays, which keeps fast scrolls smooth on phones.
  // `trigger` is an untransformed element at the same spot, so the start point is exact.
  function wipeUp(box: HTMLElement, trigger: Element, o: { duration: number; imgFrom: number; imgDuration: number; delay?: number }) {
    const img = q("img", box);
    const at = o.delay ?? 0;
    const tl = gsap.timeline({ scrollTrigger: { trigger, start: "top 92%", once: true } });
    tl.fromTo(box, { yPercent: 100 }, { yPercent: 0, duration: o.duration, ease: "expo.out" }, at);
    if (img) {
      tl.fromTo(img, { yPercent: -100 }, { yPercent: 0, duration: o.duration, ease: "expo.out" }, at)
        .fromTo(img, { scale: o.imgFrom }, { scale: 1, duration: o.imgDuration, ease: "expo.out" }, at);
    }
  }

  // A framed photo that opens out to full size as it scrolls into view, with the photo
  // easing from zoomed-in to normal. It looks like an animated clip-path inset, but it is
  // done by scaling the frame and counter-scaling everything inside it around the frame's
  // centre (so the photo and caption stay still), with the corner radius corrected for the
  // scale. Nothing is repainted while you scroll. Scroll ranges match the old clip version:
  // the frame opens from its top at `start` of the screen to its centre at `end`; the
  // photo zooms while the frame crosses the screen.
  function openFrame(box: HTMLElement, o: { insetX: number; insetY: number; r0: number; r1: number; start: number; end: number; imgFrom: number }) {
    const img = q("img", box);
    const kids = Array.from(box.children) as HTMLElement[];
    let t = 0;
    let u = 0;
    const pageTop = (el: HTMLElement) => {
      let y = 0;
      for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
      return y;
    };
    const place = () => {
      // Each child scales around the frame's centre, wherever it sits inside the frame.
      const cx = box.offsetWidth / 2;
      const cy = box.offsetHeight / 2;
      kids.forEach((c) => (c.style.transformOrigin = `${cx - c.offsetLeft}px ${cy - c.offsetTop}px`));
    };
    const apply = () => {
      const sx = 1 - 2 * o.insetX * (1 - t);
      const sy = 1 - 2 * o.insetY * (1 - t);
      const r = o.r0 + (o.r1 - o.r0) * t;
      const k = o.imgFrom + (1 - o.imgFrom) * u;
      box.style.transform = `scale(${sx}, ${sy})`;
      box.style.borderRadius = r > 0 ? `${r / sx}px / ${r / sy}px` : "";
      kids.forEach((c) => {
        const z = c === img ? k : 1;
        c.style.transform = `scale(${z / sx}, ${z / sy})`;
      });
    };
    // GPU layers only while the frame is on screen.
    const layer = (on: boolean) => [box, ...kids].forEach((el) => (el.style.willChange = on ? "transform" : ""));
    const vh = () => window.innerHeight;
    const frame = ScrollTrigger.create({
      start: () => pageTop(box) - o.start * vh(),
      end: () => pageTop(box) + box.offsetHeight / 2 - o.end * vh(),
      onUpdate: (s) => ((t = s.progress), apply()),
      onRefresh: (s) => (place(), (t = s.progress), apply()),
    });
    const zoom = ScrollTrigger.create({
      start: () => pageTop(box) - vh(),
      end: () => pageTop(box) + box.offsetHeight,
      onUpdate: (s) => ((u = s.progress), apply()),
      onRefresh: (s) => ((u = s.progress), apply(), layer(s.isActive)),
      onToggle: (s) => layer(s.isActive),
    });
    return () => {
      frame.kill();
      zoom.kill();
      [box, ...kids].forEach((el) => {
        el.style.transform = "";
        el.style.transformOrigin = "";
        el.style.willChange = "";
      });
      box.style.borderRadius = "";
    };
  }

  // Computers: the page scrolls normally. The steps go by on the right; the step being
  // read is bright and the others step back. On the left, a framed photo of that step is
  // held in place, cross-fading (with a slow settle) as the step changes, and a large
  // counter rolls to its number. The frame opens with an upward wipe when it arrives.
  function processDesk() {
    const box = q("[data-process-desk]");
    if (!box) return;
    const frame = q("[data-pd-frame]", box);
    const inner = q("[data-pd-inner]", box);
    const imgs = qa("[data-pd-img]", box);
    const steps = qa("[data-pd-step]", box);
    const track = q("[data-pd-track]", box);
    let active = -1;
    let z = 1;

    const go = (i: number, instant = false) => {
      if (i === active) return;
      const prev = active;
      active = i;
      steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
      // Anything that is neither arriving nor leaving is cleared at once.
      imgs.forEach((im, k) => {
        if (k !== i && k !== prev) gsap.set(im, { opacity: 0, overwrite: true });
      });
      const img = imgs[i];
      if (img) {
        // Newest photo on top (the shading and counter sit above every photo).
        img.style.zIndex = String((z = (z % 900) + 1));
        if (instant) gsap.set(img, { opacity: 1, scale: 1, overwrite: true });
        else gsap.fromTo(img, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 1.4, ease: "expo.out", overwrite: true });
      }
      // The previous photo stays underneath until the new one has mostly faded in.
      const old = prev >= 0 ? imgs[prev] : undefined;
      if (old) gsap.to(old, { opacity: 0, duration: 0.4, delay: instant ? 0 : 0.7, overwrite: true });
      if (track) {
        const y = (-100 * i) / steps.length;
        if (instant) gsap.set(track, { yPercent: y });
        else gsap.to(track, { yPercent: y, duration: 1.1, ease: "expo.out", overwrite: true });
      }
    };
    go(0, true);

    // A step is current while it crosses the middle of the screen, level with the photo.
    steps.forEach((s, i) =>
      ScrollTrigger.create({
        trigger: s, start: "top 60%", end: "bottom 60%",
        onToggle: (self) => self.isActive && go(i),
      }),
    );

    // Arrival: each step's hairline draws and the step rises in; the frame wipes open.
    steps.forEach((s) => {
      gsap.fromTo(s, { "--draw": 0 }, {
        "--draw": 1, duration: 1.4, ease: "expo.out",
        scrollTrigger: { trigger: s, start: "top 88%", once: true },
      });
      gsap.from(s, {
        y: 40, opacity: 0, duration: 1.2, ease: "power3.out", clearProps: "transform,opacity",
        scrollTrigger: { trigger: s, start: "top 88%", once: true },
      });
    });
    if (frame && inner) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: box, start: "top 82%", once: true } });
      tl.fromTo(frame, { yPercent: 100 }, { yPercent: 0, duration: 1.5, ease: "expo.out", clearProps: "transform" }, 0)
        .fromTo(inner, { yPercent: -100 }, { yPercent: 0, duration: 1.5, ease: "expo.out", clearProps: "transform" }, 0);
      if (imgs[0]) tl.fromTo(imgs[0], { scale: 1.25 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0);
    }

    return () => {
      steps.forEach((s) => s.classList.remove("is-active"));
      imgs.forEach((im) => (im.style.zIndex = ""));
    };
  }

  // Phones: a plain vertical list that scrolls naturally. Each number brightens as its
  // step reaches the middle of the screen, and the words rise in once.
  function processPhone() {
    const sec = q("[data-process]");
    if (!sec) return;
    const pic = q(".panel-img", sec);
    const undoPic = pic ? openFrame(pic, { insetX: 0.08, insetY: 0.12, r0: 10, r1: 6, start: 0.95, end: 0.6, imgFrom: 1.25 }) : undefined;
    qa("[data-panel]", sec).forEach((p) => {
      gsap.fromTo(q("[data-panel-n]", p), { opacity: 0.15 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: p, start: "top 82%", end: "top 52%", scrub: true },
      });
      gsap.from(qa("h3, p", p), {
        y: 24, opacity: 0, duration: 1, ease: "power3.out", stagger: 0.08,
        scrollTrigger: { trigger: p, start: "top 86%", once: true },
      });
      gsap.fromTo(p, { "--draw": 0 }, {
        "--draw": 1, duration: 1.2, ease: "expo.out",
        scrollTrigger: { trigger: p, start: "top 90%", once: true },
      });
    });
    return undoPic;
  }

  function pointerFx() {
    const cur = q("[data-cursor]");
    const curImg = q("[data-cursor-img]");
    if (cur) {
      const xTo = gsap.quickTo(cur, "x", { duration: 0.4, ease: "power3" });
      const yTo = gsap.quickTo(cur, "y", { duration: 0.4, ease: "power3" });
      let lastPreview = "";
      const move = (e: PointerEvent) => {
        cur.classList.add("is-on");
        xTo(e.clientX);
        yTo(e.clientY);
        const t = e.target as HTMLElement;
        const pv = t.closest?.<HTMLElement>("[data-preview]");
        cur.classList.toggle("has-img", !!pv);
        const src = pv?.dataset["preview"] ?? "";
        if (src && src !== lastPreview && curImg) {
          curImg.style.backgroundImage = `url("${src}")`;
          lastPreview = src;
        }
      };
      const leave = () => cur.classList.remove("is-on", "has-img");
      on("pointermove", move, { passive: true });
      document.addEventListener("pointerleave", leave);
      cleanups.push(() => document.removeEventListener("pointerleave", leave));
    }

    qa("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3" });
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
      };
      const leave = () => {
        xTo(0);
        yTo(0);
      };
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      cleanups.push(() => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      });
    });
  }

  let rt = 0;
  // Phones resize the viewport whenever the address bar slides in or out while scrolling.
  // Only re-measure when the width really changes (rotation, desktop resize), so pinned
  // sections never jump mid-scroll on a phone.
  let lastW = window.innerWidth;
  on("resize", () => {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth;
    window.clearTimeout(rt);
    rt = window.setTimeout(() => (reduce ? fitAll() : ScrollTrigger.refresh()), 200);
  });

  return () => {
    killed = true;
    splits.forEach((s) => s.revert());
    ctx.revert();
    cleanups.forEach((f) => f());
    root.classList.remove("js", "motion", "is-loading");
    loading = true;
  };
}
