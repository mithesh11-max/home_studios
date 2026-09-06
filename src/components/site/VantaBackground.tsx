/**
 * VantaBackground — Ambient animated background for #080B1A dark sections
 *
 * Implements Vanta.js TRUNK with p5:
 * - Lazy-loaded via dynamic import() only when approaching viewport on desktop (>=768px)
 * - Module-level Singleton Coordinator ensures strictly at most ONE instance alive
 * - Unmounts and calls .destroy() when section leaves viewport
 * - Never requested on mobile (<768px) or prefers-reduced-motion
 * - Restrained opacity (0.35) + #080B1A central radial vignette for guaranteed text legibility
 * - pointer-events: none — zero click or scroll interception
 */

import { useEffect, useId, useRef, useState } from "react";
import type { VantaEffect } from "@/types/vanta";

interface VantaRegistration {
  id: string;
  wrapperEl: HTMLElement;
  canvasContainer: HTMLElement;
  isIntersecting: boolean;
  rectDistance: number;
}

class VantaCoordinator {
  private registrations = new Map<string, VantaRegistration>();
  private observer: IntersectionObserver | null = null;
  private activeId: string | null = null;
  private activeEffect: VantaEffect | null = null;
  private vantaModulePromise: Promise<{ TRUNK: any; p5: any }> | null = null;
  private scrollRaf = 0;
  private isEvaluating = false;

  constructor() {
    if (typeof window === "undefined") return;

    // Visibility handling
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.destroyActive();
      } else {
        this.scheduleEvaluate();
      }
    });

    // Resize handling
    window.addEventListener("resize", () => {
      this.scheduleEvaluate();
    }, { passive: true });

    // Scroll handling to pick candidate closest to viewport center
    window.addEventListener("scroll", () => {
      this.scheduleEvaluate();
    }, { passive: true });
  }

  public register(id: string, wrapperEl: HTMLElement, canvasContainer: HTMLElement) {
    if (typeof window === "undefined") return;

    if (!this.observer) {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            for (const reg of this.registrations.values()) {
              if (reg.wrapperEl === entry.target) {
                reg.isIntersecting = entry.isIntersecting;
                break;
              }
            }
          }
          this.scheduleEvaluate();
        },
        { rootMargin: "200px 0px 200px 0px" }
      );
    }

    this.registrations.set(id, {
      id,
      wrapperEl,
      canvasContainer,
      isIntersecting: false,
      rectDistance: Infinity,
    });

    this.observer.observe(wrapperEl);
    this.scheduleEvaluate();
  }

  public unregister(id: string) {
    const reg = this.registrations.get(id);
    if (reg) {
      if (this.observer) {
        this.observer.unobserve(reg.wrapperEl);
      }
      if (this.activeId === id) {
        this.destroyActive();
      }
      this.registrations.delete(id);
      this.scheduleEvaluate();
    }
  }

  private scheduleEvaluate() {
    if (this.scrollRaf) return;
    this.scrollRaf = requestAnimationFrame(() => {
      this.scrollRaf = 0;
      this.evaluate();
    });
  }

  private destroyActive() {
    if (this.activeEffect) {
      try {
        this.activeEffect.destroy();
      } catch (err) {
        console.warn("[VantaBackground] Error destroying effect", err);
      }
      this.activeEffect = null;
    }
    this.activeId = null;
  }

  private async loadVantaModule(): Promise<{ TRUNK: any; p5: any }> {
    if (this.vantaModulePromise) return this.vantaModulePromise;

    this.vantaModulePromise = (async () => {
      const [vantaMod, p5Mod]: [any, any] = await Promise.all([
        // @ts-ignore
        import("vanta/dist/vanta.trunk.min.js"),
        import("p5"),
      ]);

      const vMod = vantaMod as any;
      const TRUNK =
        (typeof (window as any)?.VANTA?.TRUNK === "function" ? (window as any).VANTA.TRUNK : null) ||
        (typeof vMod.default === "function"
          ? vMod.default
          : typeof vMod.default?.default === "function"
            ? vMod.default.default
            : typeof vMod.TRUNK === "function"
              ? vMod.TRUNK
              : typeof (window as any)?._vantaEffect?.default === "function"
                ? (window as any)._vantaEffect.default
                : vMod.default || vMod);

      const p5 =
        (typeof (window as any)?.p5 === "function" ? (window as any).p5 : null) ||
        (typeof p5Mod.default === "function"
          ? p5Mod.default
          : typeof p5Mod.default?.default === "function"
            ? p5Mod.default.default
            : p5Mod.default || p5Mod);

      if (typeof window !== "undefined") {
        (window as any).p5 = p5;
      }

      return { TRUNK, p5 };
    })();

    return this.vantaModulePromise;
  }

  private async evaluate() {
    if (this.isEvaluating || typeof window === "undefined") return;
    this.isEvaluating = true;

    try {
      // 1. Mobile check: under 768px do not load or run
      if (window.innerWidth < 768) {
        this.destroyActive();
        return;
      }

      // 2. Reduced motion check
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        this.destroyActive();
        return;
      }

      // 3. Tab hidden check
      if (document.hidden) {
        this.destroyActive();
        return;
      }

      // 4. Hero sequence scrubbing check (suppress during hero exploration)
      // Hero scroll region is roughly the top 3.5 viewport heights
      if (window.scrollY < window.innerHeight * 3.5 && this.registrations.size > 0) {
        const hasHeroBelow = Array.from(this.registrations.values()).some(
          (r) => r.wrapperEl.getBoundingClientRect().top > window.innerHeight
        );
        if (hasHeroBelow && window.scrollY < window.innerHeight * 2.5) {
          this.destroyActive();
          return;
        }
      }

      // 5. Find visible intersecting candidates
      const candidates: VantaRegistration[] = [];
      const viewportCenter = window.innerHeight / 2;

      for (const reg of this.registrations.values()) {
        if (!reg.isIntersecting) continue;
        const rect = reg.wrapperEl.getBoundingClientRect();
        // Section must have dimensions and overlap viewport
        if (rect.height > 0 && rect.bottom > -200 && rect.top < window.innerHeight + 200) {
          const center = (rect.top + rect.bottom) / 2;
          reg.rectDistance = Math.abs(center - viewportCenter);
          candidates.push(reg);
        }
      }

      if (candidates.length === 0) {
        this.destroyActive();
        return;
      }

      // 6. Select candidate closest to viewport center
      candidates.sort((a, b) => a.rectDistance - b.rectDistance);
      const chosen = candidates[0];

      // If chosen is already active, maintain it
      if (this.activeId === chosen.id && this.activeEffect) {
        return;
      }

      // Otherwise, tear down prior active instance and switch
      this.destroyActive();
      this.activeId = chosen.id;

      // Lazy import Vanta and p5
      const { TRUNK, p5 } = await this.loadVantaModule();

      // Verify chosen is still current after async load
      if (this.activeId !== chosen.id || !chosen.canvasContainer) {
        return;
      }

      if (typeof window !== "undefined") {
        (window as any).p5 = p5;
      }

      const effect = TRUNK({
        el: chosen.canvasContainer,
        p5,
        mouseControls: true,
        touchControls: false,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0x8a86fc,
        backgroundColor: 0x080b1a,
        spacing: 10.0,
        chaos: 4.0,
      });

      if (this.activeId !== chosen.id) {
        effect.destroy();
        return;
      }

      this.activeEffect = effect;
    } catch (err) {
      console.warn("[VantaBackground] Failed to initialize TRUNK effect", err);
      this.destroyActive();
    } finally {
      this.isEvaluating = false;
    }
  }
}

// Color match validator for #080B1A (rgb(8, 11, 26) / oklch(0.156 0.032 273.18))
function isDarkBgMatch(colorStr: string): boolean {
  if (!colorStr) return false;

  // Handle oklch(...)
  if (colorStr.includes("oklch")) {
    const nums = colorStr.match(/[\d.]+/g);
    if (nums && nums.length >= 3) {
      const l = Number(nums[0]);
      const c = Number(nums[1]);
      const h = Number(nums[2]);
      return Math.abs(l - 0.156) <= 0.02 && Math.abs(c - 0.032) <= 0.015 && Math.abs(h - 273.18) <= 5;
    }
  }

  // Handle rgb(...) / rgba(...)
  if (colorStr.startsWith("rgb")) {
    const nums = colorStr.match(/[\d.]+/g);
    if (nums && nums.length >= 3) {
      const r = Math.round(Number(nums[0]));
      const g = Math.round(Number(nums[1]));
      const b = Math.round(Number(nums[2]));
      return Math.abs(r - 8) <= 2 && Math.abs(g - 11) <= 2 && Math.abs(b - 26) <= 2;
    }
  }

  // Handle color(srgb ...)
  if (colorStr.includes("srgb")) {
    const nums = colorStr.match(/[\d.]+/g);
    if (nums && nums.length >= 3) {
      const r = Math.round(Number(nums[0]) * 255);
      const g = Math.round(Number(nums[1]) * 255);
      const b = Math.round(Number(nums[2]) * 255);
      return Math.abs(r - 8) <= 2 && Math.abs(g - 11) <= 2 && Math.abs(b - 26) <= 2;
    }
  }

  return false;
}

const coordinator = new VantaCoordinator();

export function VantaBackground() {
  const id = useId();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isEligible, setIsEligible] = useState<boolean | null>(null);

  useEffect(() => {
    const anchor = anchorRef.current || wrapperRef.current;
    if (!anchor) return;

    // Rule: Must mount inside an element carrying [data-vanta]
    const host = anchor.parentElement?.closest("[data-vanta]");
    if (!host) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          "[VantaBackground] Parent section does not carry 'data-vanta'. Vanta TRUNK renders ONLY on sections explicitly marked with data-vanta. Unmounting."
        );
      }
      setIsEligible(false);
      return;
    }

    // Dev-only assertion: Check host element's computed background color
    if (process.env.NODE_ENV !== "production") {
      const computedBg = window.getComputedStyle(host).backgroundColor;
      if (!isDarkBgMatch(computedBg)) {
        console.warn(
          `[VantaBackground] Dev assertion failed: Host <${host.tagName.toLowerCase()} data-vanta> computed background is "${computedBg}", expected rgb(8, 11, 26) (#080B1A). Vanta canvas would paint #080B1A and cause a visible color seam!`
        );
      }
    }

    setIsEligible(true);
  }, []);

  useEffect(() => {
    if (!isEligible) return;
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    coordinator.register(id, wrapper, canvas);

    return () => {
      coordinator.unregister(id);
    };
  }, [id, isEligible]);

  // If determined ineligible (no data-vanta attribute), render NOTHING — not a hidden canvas, nothing
  if (isEligible === false) {
    return null;
  }

  // Initial probe anchor to query parentElement in useEffect
  if (isEligible === null) {
    return <span ref={anchorRef} style={{ display: "none" }} aria-hidden="true" />;
  }

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ backgroundColor: "#080B1A", zIndex: 0 }}
    >
      {/* Vanta TRUNK mounting container */}
      <div
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.55 }}
      />

      {/* Subtle central radial gradient so text remains crisp and highly legible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(8, 11, 26, 0.5) 0%, rgba(8, 11, 26, 0.1) 70%, transparent 100%)",
        }}
      />
    </div>
  );
}
