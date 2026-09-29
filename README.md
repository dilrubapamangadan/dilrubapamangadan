# Mainframe® — hero landing page

A full-screen hero for the creative agency Mainframe. It has a background
video that you scrub by moving the mouse left and right, a fixed navbar with
a mobile menu, and A.R.I.A's typewriter greeting with action pills.

Built with React, TypeScript, Vite and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build in dist/
npm run preview   # serve the build
```

## Files

| File | Role |
| --- | --- |
| `src/components/BackgroundVideo.tsx` | Fixed video that scrubs with horizontal mouse movement (`SENSITIVITY = 0.8`) and queues seeks through `onSeeked` so it doesn't flood the video with seeks |
| `src/components/Navbar.tsx` | Logo, desktop links and CTA, mobile hamburger and overlay |
| `src/components/Hero.tsx` | Blurred intro, typewriter message, action pills and the email copy button |
| `src/hooks/useTypewriter.ts` | Shows `text` one character at a time and returns `{ displayed, done }` |
| `src/index.css` | Tailwind import, font variables, cursor `blink` keyframes |

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds and publishes
to GitHub Pages. The build uses relative paths, so it also works on Vercel or Netlify.
