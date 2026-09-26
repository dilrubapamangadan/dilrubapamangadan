# Mohammed Dilruba Pamangadan — 3D Portfolio

A scroll-driven 3D portfolio. A cartoon developer walks along a glowing trace
across a circuit board; each AI chip he reaches powers up and opens one section
of the portfolio.

Built with Vite, three.js, GSAP ScrollTrigger and Lenis. Everything in the
scene — the character, the board, the chips — is generated in code, so there
are no model files to download or license.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build in dist/
npm run preview   # serve the build
```

## Make it yours

- **Text, links, projects, skills** — all in `src/content.js`.
  Add your LinkedIn URL under `profile.links.linkedin` to show its icon.
- **Chips** — the `chips` list in `src/content.js` sets the section order and
  the codes printed on each chip.
- **Character** — colours and proportions at the top of `src/world/character.js`.
- **Route** — the board's walking path is the `MOVES` list in `src/world/route.js`
  (heading in 45° steps + length).

## How it works

| File | Role |
| --- | --- |
| `src/main.js` | Maps scroll to the character's position: each chapter walks him to the next chip, then parks him there while its panel is shown |
| `src/ui.js` | HTML overlay — nav, hero, one panel per chip, progress rail |
| `src/world/scene.js` | Renderer, lights, bloom, follow camera and the frame loop |
| `src/world/character.js` | Toon-shaded, outlined cartoon rig with walk, idle, blink and wave |
| `src/world/board.js` | Board, traces, vias, components, blinking LEDs and data pulses |
| `src/world/chip.js` | AI chip with gold pins and a neural-net core that lights up |
| `src/world/route.js` | PCB-style path with 45° bends and the chip stops |

The walk cycle advances with distance travelled, so his feet stay planted, and
scrolling back makes him turn round and walk back. Phones get a lighter scene
(no bloom, fewer parts) and bottom-sheet panels; visitors with
`prefers-reduced-motion` get instant moves with no idle animation. Without
WebGL the panels still read as a normal page.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes
to GitHub Pages. Enable it once under **Settings → Pages → Source: GitHub Actions**.
The build uses relative paths, so it also works on Vercel or Netlify as-is.
