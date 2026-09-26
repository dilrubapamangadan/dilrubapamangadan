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
  Until it exists, the silhouette in `public/me.svg` is shown.
- **Text, links, projects, skills** — everything lives in `src/content.js`.
  Add your LinkedIn URL under `profile.links.linkedin` to show its icon.
- **Colours / fonts** — CSS variables at the top of `src/style.css`.

## Page structure

| Section | What happens on scroll |
| --- | --- |
| Hero | Distressed name layered behind and in front of the portrait, brush slashes, embers |
| About | Pinned; spec callouts draw out from the portrait one by one |
| Experience | Pinned; a card slides in and steps through each role |
| Projects | Pinned "Legacy vs Modern" duel with a giant outlined word, spark burst and year counter, then a horizontal project gallery |
| Skills | Staggered reveal; chips light up |
| AI Journey | Page turns gold; blur-to-focus headings and a drawn timeline |
| Case studies | Architecture diagrams draw themselves |
| Contact | The hero composition returns: "Let's build" |

Motion is disabled for visitors with `prefers-reduced-motion`, and pinned
horizontal sections become vertical stacks on small screens.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes
to GitHub Pages. Enable it once under **Settings → Pages → Source: GitHub Actions**.
The build uses relative paths, so it also works on Vercel or Netlify as-is.
