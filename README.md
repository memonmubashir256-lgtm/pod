# VALENCE — Precision Hermetic Vaults (PWA)

Futuristic luxury product showcase and interactive 3D Progressive Web Application built with React, Vite, Tailwind CSS v4, Three.js, and Workbox (`vite-plugin-pwa`).

## Features

- **Interactive 3D Product Showcase**: Real-time Three.js WebGL capsule with `RoomEnvironment` PBR lighting, 360-degree `OrbitControls`, exploded-view assembly slider, PVD color finish switching, play/pause animation toggle, and interactive component hotspots.
- **10 Full Sections**: Hero with live slide showcase, 3D Showcase, Color-Selectable Product Collection, Special Features, Interactive Acoustic Architecture diagram, Brand Philosophy, Visual Gallery with Lightbox viewer, Labeled Sample Testimonials Carousel, Validated Newsletter Dispatch, and Footer with Legal modals.
- **Progressive Web App (PWA)**: Web App Manifest (`standalone` mode), Workbox service worker precaching & runtime font caching, custom PNG & maskable icons, iOS Apple Touch metadata, offline fallback (`public/offline.html`), live offline status indicator, update notification banner, and in-app install flow.
- **Accessibility & Performance**: Reduced-motion support (`prefers-reduced-motion` + manual toggle), semantic landmarks, keyboard navigation (`Escape`, arrow keys in lightbox), and software-WebGL pacing.

## Project Structure

- `src/components/` — `Navbar`, `Capsule3DCanvas`, `Modals` (Product Detail, Lightbox, Install Guide, Legal), `PWAControls`
- `src/sections/` — `HeroSection`, `Showcase3DSection`, `CollectionSection`, `FeaturesSection`, `ExperienceSection`, `AboutSection`, `GallerySection`, `TestimonialsSection`, `NewsletterSection`, `FooterSection`
- `src/hooks/` — `usePWAInstall`, `usePWAUpdate`, `useOnlineStatus`, `useReducedMotion`
- `src/utils/` — Pure logic (`valenceLogic.ts`) and `node:test` unit tests (`valenceLogic.test.ts`)
- `public/` — PWA PNG & SVG icons, `offline.html`, and procedural studio assets

## Setup & Scripts

```bash
npm install
npm run dev      # Start dev server on port 3000 with dev PWA service worker enabled
npm run build    # Production bundle + Workbox service worker & manifest
npm run lint     # TypeScript check
npx --yes tsx --test src/utils/valenceLogic.test.ts
```
