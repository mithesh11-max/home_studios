# HOME STUDIOS premium architecture website

## Overview
Rebuild the blank project as a polished, responsive, multi-route architecture-studio website. The design will use the exact warm paper, charcoal, muted stone, white, and restrained terracotta palette; Cormorant Garamond display type; Manrope UI/body type; and a strict editorial grid. Testimonials will be omitted until genuine quotes are supplied.

## Site structure
- Shared responsive navigation and footer with an overlay-to-opaque desktop header and full-screen mobile menu.
- Home page as the main visual narrative: hero, verified stats, scale statement, walkthrough modes, architectural-index advantages, process, service index, construction selector, architecture, structural engineering, before/after interiors, complete journey, team/about, values, FAQ, final CTA, and contact preview.
- Dedicated routes for About, Services, Walkthrough, Construction, Contact, plus six service-detail routes for Walkthrough, Construction, Structural Design, Plans Approval, Architecture Design, and Interior Design.
- Every route receives distinct SEO and social metadata; all navigation and service links use typed TanStack Router links.

## Visual system and assets
- Define all color, typography, radius, rule, spacing, shadow, and motion roles as semantic Tailwind v4 tokens in the global design system.
- Load Cormorant Garamond and Manrope through document-head stylesheet links.
- Generate a small cohesive set of premium architectural visuals for the hero, 1:1 walkthrough modes, architecture, services, construction, and interior comparison; optimize delivery and lazy-load non-critical media.
- Build reusable grid, section-label, technical-rule, annotation, service-row, and architectural-drawing primitives instead of generic cards.
- Use 12/8/4-column responsive compositions, intentionally recomposed for mobile rather than simply stacked.

## Interaction and motion
- Add Motion for React for restrained clip reveals, headline masks, image crossfades, scroll-linked parallax, line drawing, number counters, row expansion, route transitions, and accordion height animation.
- Build functional Laser/AR/VR/Real Furniture tabs, expandable Why Home Studios rows, service hover/focus previews, construction package selector with updating specifications, tactile before/after slider, FAQ accordion, and mobile navigation.
- Respect `prefers-reduced-motion`, remove custom cursor behavior on touch/mobile, and preserve keyboard/focus accessibility for every interactive control.

## Content and conversion
- Use only supplied company information, package prices, service names, verified stats, and claims.
- Keep the contact form frontend-only with clear validation and direct phone/email/WhatsApp actions; embed the supplied Bengaluru location on Google Maps without adding a backend.
- Omit testimonials completely rather than inventing or presenting placeholder reviews.

## Technical implementation
- Install only the lightweight motion dependency required for the interaction system.
- Keep page sections componentized and data-driven while preserving the requested editorial composition.
- Add accessible landmarks, one H1 per route, labels, alt text, touch targets, contrast, and responsive text containment.
- Verify the production build plus desktop and mobile layouts, interactive states, route navigation, console output, and key accessibility behavior in-browser.
