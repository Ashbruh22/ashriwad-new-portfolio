# Project status — handoff for a fresh session

_Updated 2026-09-05._

> **2026-09-05 — the hero is the 3D character sprite.** The centrepiece is a
> nine-pose sprite sheet of the character that turns to follow the cursor,
> wrapped in a purple gradient glow and layered between two display words.
>
> **New**
> - `assets/character-source.mp4` — the 10s source render. Not served; it is the
>   input to the build script. Only the first ~5s are usable: the clip sweeps
>   yaw (right, through centre, to left) and then pitch (up, then down) on a
>   locked camera, and after that it pushes in to a close-up that no amount of
>   registration can match to the rest.
> - `scripts/build-character-sprite.py` — cuts nine frames out of that clip and
>   writes:
>   - `public/hero/character-sprite.webp` — 3x3 sheet, 1860px, ~191 KB, row
>     major: up-left / up / up-right, left / centre / right, down-left / down /
>     down-right.
>   - `public/hero/character-poster.webp` — the centre cell alone, ~23 KB.
>   Needs `pillow numpy scipy imageio-ffmpeg`; re-run it after editing the
>   `TIMES` table at the top. Two passes per frame:
>   **alpha** — the black background is keyed out by flood-filling the
>   near-black region in from the frame border, so only pixels connected to the
>   outside are cut and his own dark cap and hair survive; and
>   **registration** — he leans into each turn, which would make the whole bust
>   jump sideways on every pose switch, so each frame is shifted to put his
>   torso centre on the same x. Nothing is mirrored: the backpack sits on one
>   shoulder and a flipped cell would make it swap sides mid-sweep. The corner
>   cells come from the moments where one sweep hands over to the next.
> - `components/hero/CharacterGaze.tsx` — the interactive sprite. Normalises the
>   pointer to [-1, 1] around the character's head, damps it, and **snaps to the
>   nearest of the nine poses** (with hysteresis) rather than cross-fading a
>   bilinear blend: the poses are nine separate renders, not frames of one turn,
>   so blending neighbours leaves two faces visible at half strength. A 130ms
>   CSS opacity transition covers the switch and a continuous parallax
>   translate/rotate on the stack supplies the analogue motion. Idles into a
>   slow look-around after 2.6s without pointer movement. Reduced motion renders
>   the poster only and never fetches the sheet.
> - **The glow** (`.gaze__aura` in globals.css) — the source render has no rim
>   light, so it is built in CSS: a purple gradient masked by the sprite's own
>   alpha and blurred, which makes the glow the character's silhouette instead
>   of a circle parked behind him. Two passes, a wide wash and a tight rim. The
>   mask-position follows the active pose, set by the same JS that switches
>   cells. Spread comes from the blur, not from scaling the layer — a large
>   scale with a modest blur reads as a second, offset character.
> - `components/sections/Hero.tsx` — the layered composition. Everything sits in
>   one CSS grid cell (`.hero-stack > *`): glow, "AI / ML" behind the character,
>   the character, "DEVELOPER" in front, then the copy.
> - Shell components the layout already imported but that had never been
>   committed: `ReducedMotionProvider` (a `useSyncExternalStore` over the OS
>   media query + a localStorage override), `SmoothScrollProvider` (Lenis, off
>   under reduced motion), `Nav`, `Footer`, `DotBackground`, `social-dock`.
> - `components/sections/About.tsx` — a short landing pad so the hero's
>   "About me" CTA and the nav link have somewhere real to scroll to.
>
> **Known limits of the source.** The clip never combines a downward tilt with
> a turn to the viewer's left, so `down-left` is the strongest left turn at a
> level head rather than a genuine down-and-left. The stage's `rotateX` carries
> the pitch there.
>
> **Still missing.** `PROJECT_REQUIREMENTS.md` asks for Experience, Featured
> Projects, Project Grid, Skills, Certifications and Contact sections; none of
> them are built, and `app/page.tsx` renders only Hero + About. The nav is
> trimmed to the links that resolve. `/resume-placeholder.pdf`,
> `/og-image.png`, `/apple-touch-icon.png` and `/poster.png` are all still
> referenced by `lib/constants.ts` / `app/layout.tsx` but absent from `public/`
> — the hero's résumé CTA was dropped rather than ship a dead download.
> `package.json` has a `test:e2e` script but there is no `playwright.config.ts`
> and no `e2e/` directory.

---

## Earlier — 2026-09-03

_The minimal / Vercel-like restyle is **complete**; what's left is real-asset
deploy blockers (bottom of this doc)._

> **2026-09-04 — the whole custom 3D layer was scrapped.** Both the 3D developer
> character AND the hand-built "chrome orb" (MarchingCubes + spring sim) are gone.
> The hero centerpiece is now **React Bits `Orb`** (`components/reactbits/Orb.tsx`,
> added via `npx shadcn@latest add https://reactbits.dev/r/Orb-TS-TW`) — a
> self-contained WebGL (`ogl`) glowing orb with built-in hover distortion +
> rotate-on-hover.
> - **Deleted:** the entire `components/three/` folder, `lib/threeQuality.ts`,
>   `lib/sceneSections.ts`, `public/centerpiece-poster.svg`.
> - **Uninstalled:** `three`, `@react-three/fiber`, `@react-three/drei`,
>   `@types/three`. **Added:** `ogl`.
> - `app/layout.tsx` no longer mounts `<PersistentCanvas/>` / `SceneStatusProvider`
>   (the whole capability-gate + poster plumbing is gone).
> - `components/sections/Hero.tsx` renders `<Orb/>` in the right column (wrapped
>   `aria-hidden`), with a static CSS-gradient glow fallback when WebGL is
>   unavailable or reduced motion is on. `<h1>` stays `text-6xl` / `font-medium`.
> - `next.config.ts` dropped `transpilePackages: ['three']`. `eslint.config.mjs`
>   override moved from `components/three/**` to `components/reactbits/**`.
> - e2e `fallback.spec.ts` rewritten (no poster; asserts canvas mounts / is
>   aria-hidden / reduce-motion removes it). All 10 e2e green.
> - `MODEL_SWAP.md`, `public/models/*` (gone), `art/*` and the character sections
>   below are all historical.

---

## What this is

Single-page portfolio for Ashriwad Behera (final-year AI/ML + full-stack). Spec:
`PROJECT_REQUIREMENTS.md`. Stack: Next.js 16.3.3 (App Router, Turbopack),
TypeScript, Tailwind v4, `@react-three/fiber` + `drei` + `three`, GSAP core,
Lenis, framer-motion, next-themes. Deploy target Vercel.

**Read `AGENTS.md` first** — this Next.js has breaking changes vs. training data;
the version-matched docs are in `node_modules/next/dist/docs/`.

## Current design — minimal, Vercel-like (DONE)

Monochrome on near-black (`#0a0a0a`) + one blue accent (`#3291ff` dark /
`#0070f3` light), Geist Sans, hairline borders, flat cards, short 260ms
fade-ups, one calm hero-only 3D character. The full approved plan is at
`~/.claude/plans/noble-spinning-acorn.md`.

### Restyle — completed this session (was items 1–11)

- **`app/globals.css`** — the universal `*{margin:0;padding:0}` reset is now
  wrapped in `@layer base` (an unlayered reset was beating every Tailwind
  `p-*` / `px-*` utility → all spacing was silently collapsing). `.gradient-text`
  is a subtle top-down clip used **only** on the hero `h1`. Marquee keyframes
  removed.
- **`components/three/SceneLights.tsx`** — neutral: one white directional key +
  soft ambient + faint point fill, dimmer in light mode so the dark figure reads
  as a dark silhouette on white.
- **`components/three/PrimitiveCharacter.tsx`** — `C` palette is near-monochrome
  (hoodie `#3a3a42`, cap/jeans near-black, kept skin, screen `#3291ff`). Fit
  target height `1.95` (was `2.35`). `idle` pose reworked so the forearms come
  down to a laptop held at waist height (was raised near the face); smaller
  hands; screen emissive `1.05`.
- **`components/three/useChoreography.ts`** — rewritten as a plain passive
  `scroll` listener (no ScrollTrigger) writing `sceneState.target.robotOpacity`
  from scroll depth: full at the hero, 0 by ~0.8 viewports down, a faint
  bookend centred on `#contact`.
- **`components/three/RobotCenterpiece.tsx`** — opacity damp sped up (~0.15s
  time constant + snap) so the figure doesn't linger over the About content.
- **`components/three/CenterpieceCanvas.tsx` / `PersistentCanvas.tsx`** —
  removed the `document.hidden` → `frameloop:'demand'` pause. It froze the
  figure at a stale opacity when a user tabbed away/back; `frameloop` is now
  always `'always'` (browsers already suspend rAF for hidden tabs).
- **`components/ui/SectionHeader.tsx`** — small plain eyebrow (secondary text,
  sentence case — no mono/uppercase), plain `h2`, one 260ms fade-up.
- **`components/reactbits/*`** — all neutralised. `Marquee` always renders the
  static wrapped list. `SpotlightCard` / `GlareHover` / `GradientText` /
  `ShinyText` are plain pass-through wrappers. `ScrollFloat` / `FadeContent` are
  aliases of `ScrollReveal` (the one shared reveal: opacity 0→1 + 10px lift,
  260ms, once). `CountUp` kept.
- **`components/sections/*`** — all rewritten flat: hairline `.glass-card`, no
  glow/gradient/chroma, `py-16 md:py-24`, `max-w-[68rem]`, blue accent used
  sparingly. Hero: plain fade-up (no SplitText), `bg-[var(--text-primary)]`
  primary CTA + hairline secondaries. Skills is a static definition list.
- **`components/ui/{Nav,Footer}.tsx`** — Nav has an always-on hairline bottom
  border, small `font-medium` links, icon toggles + one Résumé button. Footer is
  a hairline top border + copyright + three text links.
- **`components/three/HeroPoster.tsx`** — now an **inlined** monochrome line-art
  SVG (seated developer at a laptop, `currentColor` strokes + one blue screen)
  so it's theme-aware. `public/centerpiece-poster.svg` mirrors it. e2e matches
  `getByRole('img', {name:/developer/i})`.
- **`eslint.config.mjs`** — pruned the deleted `hooks/useCharacterAnimation.ts`
  from the `components/three/**` override.
- **`e2e/fallback.spec.ts`** — poster matcher `/robot/i` → `/developer/i`;
  marquee assertion now also checks the static Skills list renders.
- **`MODEL_SWAP.md`** + memory `3d-centerpiece.md` — updated to hero-only +
  monochrome.

### Verified

`npm run build` (prohibited-content gate + tsc), `npm run lint` (0 errors) and
`npm run test:e2e` (10/10) all pass. Visually reviewed every section in a
production build (`next start`) in dark and light mode: layout, type, spacing,
hairline cards, reveals, nav, footer, and the reduced-motion poster all read
correctly.

**Not visually confirmed** (test-environment limit — the Chrome automation tab
is always `document.hidden`, which throttles/suspends the WebGL rAF loop): the
live 3D character in **light mode** and the **scroll-fade** in motion. The code
paths are simple and were checked by reading `sceneState` live (the fade math
resolves to 0 past the hero); dark-mode rendering + pose were confirmed before
the light-mode lighting tweak. Worth a real-browser eyeball.

## Architecture cheat-sheet

- **3D layer:** `PersistentCanvas` (fixed `z-1`, capability-gated, `ssr:false`)
  → `CenterpieceCanvas` (R3F `<Canvas>`, `frameloop="always"`, calls
  `useChoreography`) → `Scene` → `RobotCenterpiece` (`GroundShadow` +
  `PrimitiveCharacter`) / `CameraRig` / `SceneLights`.
- **State channel:** `components/three/sceneState.ts` — mutable module singleton;
  scroll listener + pointer write it, `useFrame` reads + damps. No React
  re-renders from animation (PROJECT_REQUIREMENTS.md §11).
- **The character** is hand-built from Three.js primitives in
  `PrimitiveCharacter.tsx` — NO GLB. `lib/sceneSections.ts` is a single
  `HERO_KEYFRAME`. `MODEL_SWAP.md` has the future-GLB path.
- **Fallback:** `HeroPoster.tsx` (inlined line-art SVG) in the hero's own layout
  when the canvas is off (no WebGL / reduced-motion / <640px / low-end).
  `SceneStatus` context coordinates canvas-vs-poster.
- **Providers** (`app/layout.tsx`): ThemeProvider → ReducedMotionProvider →
  SceneStatusProvider → SmoothScrollProvider (Lenis ↔ ScrollTrigger).
- **Content model:** typed data in `lib/{experience,projects,skills,constants}.ts`.
  Verbatim from the résumé; don't invent metrics.
- **Build gate:** `npm run build` runs `scripts/check-prohibited-content.mjs`
  (fails if `moncy` / `yohannan` appear in `app/components/lib/public`).
- **Dev-server quirk:** Turbopack Fast Refresh + R3F often blanks the canvas
  after an edit — a hard reload or fresh `next dev` fixes it; production always
  renders. On Windows a stale `.next/dev` lock blocks a new `next dev` —
  `rm -rf .next/dev` and `taskkill //IM node.exe //F`.

## Deploy blockers (need real assets / user input — NOT done)

| Item | State |
|---|---|
| Résumé PDF | `public/resume-placeholder.pdf` is 0 bytes; `RESUME_PATH` in `lib/constants.ts` |
| `SITE_URL` | placeholder `https://ashriwad.dev` in `lib/constants.ts` (feeds metadata / JSON-LD / sitemap) |
| `og-image.png` / `poster.png` | generic scaffold images in `public/`, not redesigned for the minimal look |
| Git | repo is **not initialized** — no commits |
| `package.json` `"type": "module"` | not added (cosmetic Turbopack warning about `tailwind.config.ts`) |

## Memory

`~/.claude/projects/C--Users-ashri-OneDrive-Desktop-portfoliowebsite/memory/` —
`MEMORY.md` index + `3d-centerpiece.md` (updated) + `deploy-placeholders.md`.
