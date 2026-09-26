# Mohammed Dilruba Pamangadan — Portfolio

A cinematic, scroll-driven portfolio for a Senior Java Backend Engineer / Technical Lead.
Built with Vite, GSAP ScrollTrigger and Lenis smooth scrolling.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the build
```

## Make it yours

- **Portrait** — add a transparent-background PNG at `public/me.png`
  (portrait orientation, ~1200px tall, cropped around the waist works best).
  It appears in the About section and on the Experience card; until it exists,
  the silhouette in `public/me.svg` is shown.
- **Text, links, projects, skills** — everything lives in `src/content.js`.
  Add your LinkedIn URL under `profile.links.linkedin` to show its icon.
- **Colours / fonts** — CSS variables at the top of `src/style.css`.

## Page structure

| Section | What happens on scroll |
| --- | --- |
| Hero | Distressed name layered behind and in front of the samurai, brush slashes, embers; he raises his blade as you scroll |
| About | Pinned; spec callouts draw out from your portrait one by one |
| Experience | Pinned; the samurai walks in, a card steps through each role, and he readies his sword |
| Projects | Pinned "Legacy vs Modern" duel: crimson and gold samurai walk in and clash, sparks, year counter, then a horizontal project gallery |
| Skills | Staggered reveal; chips light up |
| AI Journey | Page turns gold; blur-to-focus headings and a drawn timeline |
| Case studies | Architecture diagrams draw themselves |
| Contact | The samurai walks back on and plants his sword: "Let's build" |

Motion is disabled for visitors with `prefers-reduced-motion`, and pinned
horizontal sections become vertical stacks on small screens.

## The samurai

The samurai is drawn in code (`src/samurai.js`): an SVG rig of jointed parts
(legs, arms, torso, head, cloak, katana) posed from four values — `walk`
(cycle phase), `walkBlend`, `draw` and `lunge` — which GSAP scrubs with scroll.
Walk cycles are matched to the distance travelled, so the feet don't slide.

To swap in photoreal footage later, generate a 5–10 s clip (Kling, Runway,
Veo or Sora — "armoured samurai walking, dark background, red rim light"),
export it as numbered WebP frames, and draw them to a `<canvas>` indexed by
scroll progress in place of the SVG rig.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes
to GitHub Pages. Enable it once under **Settings → Pages → Source: GitHub Actions**.
The build uses relative paths, so it also works on Vercel or Netlify as-is.
