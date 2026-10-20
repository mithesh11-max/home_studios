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
        qa(`${sel} [data-g-reveal]`).forEach((el) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 92%", once: true } });
          tl.fromTo(el, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.out" })
            .fromTo(q("img", el), { scale: 1.35 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0);
        });
      mm.add("(min-width: 761px)", () => revealGallery(".g-desktop"));
      mm.add("(max-width: 760px)", () => revealGallery(".g-mobile"));
      mm.add("(min-width: 761px) and (min-height: 501px)", () => {
        heroDock();
        statementScene(false);
        return processDesktop();
      });
      mm.add("(max-width: 760px), (max-height: 500px)", () => {
        const undoDock = heroDockPhone();
        const undoStatement = statementPhone();
        processPhone();
        servicesPhone();
        return () => {
          undoDock?.();
          undoStatement?.();
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
      if (band) {
        gsap.fromTo(band, { clipPath: "inset(10% 12% 10% 12% round 10px)" }, {
          clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none",
          scrollTrigger: { trigger: band, start: "top 92%", end: "center 55%", scrub: true },
        });
        gsap.fromTo(q("img", band), { scale: 1.3 }, {
          scale: 1, ease: "none",
          scrollTrigger: { trigger: band, start: "top bottom", end: "bottom top", scrub: true },
        });
      }

      // Gallery: title rises letter by letter; photos unmask upward; columns drift at different speeds.
      gsap.fromTo("[data-gallery-ch]", { yPercent: 118, rotate: 7 }, {
        yPercent: 0, rotate: 0, duration: 1.5, ease: "expo.out", stagger: 0.06,
        scrollTrigger: { trigger: "[data-gallery-title]", start: "top 90%", toggleActions: "play none none reverse" },
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

  // Phones: the wordmark flies into the menu bar on its own as soon as you start
  // scrolling (time-based, ~0.8s) and flies back when you return to the top. Each word
  // is re-aimed every frame at its word in the bar, so it lands exactly even while the
  // page keeps moving underneath; the swap to the real menu-bar text happens only once
  // the two overlap perfectly, so there is no visible cross-fade.
  function heroDockPhone() {
    const lineA = q("[data-hm-a]");
    const lineB = q("[data-hm-b]");
    const navA = q("[data-brand-a]");
    const navB = q("[data-brand-b]");
    const navText = q("[data-brand-text]");
    if (!lineA || !lineB || !navA || !navB || !navText) return;
    const lines = [lineA, lineB];
    const words = [navA, navB];
    const state = { p: 0 };
    let goal = 0;
    let tween: gsap.core.Tween | null = null;
    gsap.set(navText, { opacity: 0 });

    // Untransformed layout position of a line on screen right now.
    const base = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform);
      return { x: r.left - m.e, y: r.top - m.f, w: el.offsetWidth };
    };
    const easeX = gsap.parseEase("expo.inOut");
    const easeYLate = gsap.parseEase("power3.in");
    const render = () => {
      const p = state.p;
      lines.forEach((line, i) => {
        const b = base(line);
        const w = words[i]!.getBoundingClientRect();
        const s = words[i]!.offsetWidth / b.w;
        const e = easeX(p);
        // The second word rises a touch later, so it tucks in beside the first.
        const ey = i === 1 ? easeYLate(p) * 0.35 + e * 0.65 : e;
        gsap.set(line, { x: (w.left - b.x) * e, y: (w.top - b.y) * ey, scale: 1 + (s - 1) * e });
      });
    };
    const go = (to: number) => {
      if (goal === to) return;
      goal = to;
      tween?.kill();
      if (to === 0) {
        // Leaving the bar: show the flying words exactly over the menu-bar text, then swap.
        gsap.set(lines, { opacity: 1 });
        gsap.set(navText, { opacity: 0 });
      }
      tween = gsap.to(state, {
        p: to, duration: 0.85, ease: "none", onUpdate: render,
        onComplete: () => {
          if (to === 1) {
            gsap.set(navText, { opacity: 1 });
            gsap.set(lines, { opacity: 0 });
          } else {
            gsap.set(lines, { clearProps: "transform" });
          }
          onScroll();
        },
      });
    };
    phoneDock = {
      docked: () => goal === 1 && state.p === 1,
      onScroll: (y) => {
        if (y > 24) go(1);
        else if (y < 8) go(0);
      },
    };
    if (window.scrollY > 24) go(1);
    return () => {
      tween?.kill();
      phoneDock = null;
      gsap.set(lines, { clearProps: "transform,opacity" });
      gsap.set(navText, { clearProps: "opacity" });
    };
  }

  // Phones: the four lines play on their own while the section is on screen, word by
  // word, each word rising out of its own mask. Transforms only — smooth on any phone.
  function statementPhone() {
    const st = q("[data-statement]");
    if (!st) return;
    const lines = qa("[data-statement-line]", st);
    const dots = qa("[data-st-dot]", st);
    const parts = lines.map((l) => new SplitText(l, { type: "words", mask: "words" }));
    const words = parts.map((p) => p.words);
    words.forEach((w) => gsap.set(w, { yPercent: 110 }));
    const mark = (i: number) => dots.forEach((d, k) => d.classList.toggle("is-on", k === i));
    const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.4 });
    words.forEach((w, i) => {
      tl.call(() => mark(i))
        .to(w, { yPercent: 0, duration: 0.8, stagger: 0.06, ease: "expo.out" })
        .to(w, { yPercent: -110, duration: 0.55, stagger: 0.035, ease: "power3.in" }, i === words.length - 1 ? "+=2.6" : "+=1.7");
    });
    const st0 = ScrollTrigger.create({
      trigger: st, start: "top 65%", end: "bottom 35%",
      onToggle: (self) => (self.isActive ? tl.play() : tl.pause()),
    });
    return () => {
      st0.kill();
      tl.kill();
      parts.forEach((p) => p.revert());
    };
  }

  // Phones: each service photo opens upward a beat after its row slides in.
  function servicesPhone() {
    qa("[data-svc-thumb]").forEach((t) => {
      gsap.fromTo(t, { clipPath: "inset(100% 0% 0% 0% round 10px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 10px)", duration: 1.2, ease: "expo.out", delay: 0.15,
        scrollTrigger: { trigger: t, start: "top 92%", once: true },
      });
      gsap.fromTo(q("img", t), { scale: 1.4 }, {
        scale: 1, duration: 1.6, ease: "expo.out", delay: 0.15,
        scrollTrigger: { trigger: t, start: "top 92%", once: true },
      });
    });
  }

  // Computers: steps travel sideways inside a sticky stage; numbers light up mid-screen.
  function processDesktop() {
    const sec = q("[data-process]");
    const track = q("[data-track]");
    if (!sec || !track) return;
    const barEl = q("[data-track-bar]");
    const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const setHeight = () => (sec.style.height = `${window.innerHeight + dist()}px`);
    setHeight();
    ScrollTrigger.addEventListener("refreshInit", setHeight);
    const move = gsap.to(track, {
      x: () => -dist(),
      ease: "none",
      scrollTrigger: {
        trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true,
        onUpdate: (s) => barEl && (barEl.style.transform = `scaleX(${s.progress})`),
      },
    });
    qa("[data-panel]", sec).forEach((p) => {
      gsap.fromTo(q("[data-panel-n]", p), { opacity: 0.14 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: p, containerAnimation: move, start: "left 80%", end: "left 40%", scrub: true },
      });
    });
    const img = q(".panel-img img", sec);
    if (img) {
      gsap.fromTo(img, { xPercent: 0, scale: 1.15 }, {
        xPercent: 8, scale: 1.15, ease: "none",
        scrollTrigger: { trigger: img.parentElement!, containerAnimation: move, start: "left right", end: "right left", scrub: true },
      });
    }
    return () => {
      ScrollTrigger.removeEventListener("refreshInit", setHeight);
      sec.style.height = "";
    };
  }

  // Phones: a plain vertical list that scrolls naturally. Each number brightens as its
  // step reaches the middle of the screen, and the words rise in once.
  function processPhone() {
    const sec = q("[data-process]");
    if (!sec) return;
    const pic = q(".panel-img", sec);
    if (pic) {
      gsap.fromTo(pic, { clipPath: "inset(12% 8% 12% 8% round 10px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 6px)", ease: "none",
        scrollTrigger: { trigger: pic, start: "top 95%", end: "center 60%", scrub: true },
      });
      gsap.fromTo(q("img", pic), { scale: 1.25 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: pic, start: "top bottom", end: "bottom top", scrub: true },
      });
    }
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
