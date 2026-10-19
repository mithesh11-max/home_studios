# Home Studios — website

Single-page site for Home Studios India (Bengaluru). Vite + React + GSAP + Lenis.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the build locally
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, Cloudflare Pages, cPanel).
If the site lives in a sub-folder, build with `npx vite build --base ./`.

## Where things are

| What | File |
| --- | --- |
| All page content (copy, services, FAQ, contact details) | `src/App.tsx` (constants at the top) |
| Colours, type, layout | `src/styles.css` (tokens at the top) |
| Scroll animations (wordmark docking into the menu bar, pinned statement, sideways steps, gallery reveals and drifting columns, footer letter slide-up), smooth scroll, loader, cursor | `src/lib/motion.ts` |
| Smoke background (500 frames, scrubbed by scroll) | `src/components/SmokeCanvas.tsx`, `src/lib/frames.ts`, `public/frames/` |
| Photos | `src/assets/` (full photos) and `src/assets/details/` (close-up crops) |
| Gallery photos and captions | `GALLERY` list near the top of `src/App.tsx`; swap in real project photos there |

## Notes

- Font: Archivo (variable, self-hosted via `@fontsource-variable/archivo`). The HOME STUDIOS wordmark uses its widest setting (125%) at weight 700; everything else uses the normal width.
- Frames are WebP (≈4.5 MB total) and load coarse-to-fine, so scrolling works within a second and fills in detail as it downloads.
- Motion switches off automatically for visitors who set "reduce motion" on their device.
- The contact form opens WhatsApp with the visitor's details pre-filled; no backend needed.
