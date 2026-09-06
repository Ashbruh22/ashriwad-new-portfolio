# Project status — handoff for a fresh session

_Updated 2026-09-06._

> **2026-09-06 — new hero source, plus an Experience section the scroll drives.**
>
> **Hero.** `assets/character-source.mp4` is now a 20s clip that combines yaw
> with pitch, so all nine cells of the sprite sheet — the four diagonals
> included — are real frames rather than the nearest available approximation.
> Only **0–12.2s is usable**: the background is pure black up to there, and from
> ~12.5s an office fades in that the alpha key cannot remove. `TIMES` in
> `scripts/build-character-sprite.py` was picked by profiling that window at
> 0.25s (head-silhouette width for the size of the turn, skin-centroid y for the
> tilt). Nothing else about the hero changed.
>
> **Which way is left.** Twice now the outer columns have gone in inverted,
> because a head-crop contact sheet genuinely does not tell you which way the
> hood is sitting. Settle it by driving the cursor to each edge in a browser and
> screenshotting, not by eye on the sheet. To fix, swap the outer columns of
> `TIMES`.
>
> **Experience** (`components/sections/Experience.tsx`) — a two-column section:
> the roles as a timeline, and the character sticky alongside them.
> - `assets/character-working.mp4` opens on him standing on black, in the hero's
>   framing, and dissolves into a desk over its first ~2.5s. **The transition is
>   in the footage** — the component only hands it to the scroll.
> - `scripts/build-working-clip.py` grades it down onto black. There is no
>   cutout to be had — the background is a rendered room, not a keyable colour,
>   and matting it needs a model this build cannot run — so it works by lighting
>   instead: crush everything below 42, multiply by an ellipse over the
>   character and laptop, and the walls, shelf and plant go to true black.
>   Outputs `working.webm` (630 KB) and `working.mp4` (611 KB) — both ship,
>   because Safari needs the H.264 and Chromium builds without proprietary
>   codecs (Playwright's included) need the VP9 — plus a 16 KB poster.
> - `components/experience/WorkingCharacter.tsx` writes `currentTime` from the
>   section's scroll position and never plays, until the scrub reaches the end
>   and hands over to a tail loop from `TAIL_START` so he keeps typing. Coarse
>   pointers skip the scrub and just play the clip; reduced motion gets the
>   poster and **never fetches the video** (the element renders `preload="none"`
>   and is armed a frame later, after the preference has resolved).
>
> **Three things that bit, worth not re-deriving:**
> 1. The scrub range is clamped to `scrollHeight - innerHeight`. While Experience
>    is the last section there is not a full screen of travel below it, so an
>    unclamped mapping never reaches the end of the clip.
> 2. `timeupdate` fires a few times a second, which is too coarse to catch the
>    wrap reliably — the clip reaches `ended` and pauses itself. The `ended`
>    listener is the guarantee; `timeupdate` is only the smooth path.
> 3. The loop entry/exit thresholds are hysteretic (0.995 / 0.97). At the bottom
>    of the page progress lands on 1 only to sub-pixel precision and Lenis leaves
>    it a hair under, which flicks a single threshold between playing and paused.
>
> **Still missing.** `PROJECT_REQUIREMENTS.md` also asks for Featured Projects,
> Project Grid, Skills, Certifications and Contact; none are built, and
> `app/page.tsx` renders Hero → About → Experience. The two Experience entries
> carry title/company/dates only — `summary` is empty in `lib/constants.ts` and
> the timeline renders without it rather than showing invented copy.
> `/resume-placeholder.pdf`, `/og-image.png`, `/apple-touch-icon.png` and
> `/poster.png` are still referenced but absent from `public/`. `package.json`
> has a `test:e2e` script with no `playwright.config.ts` and no `e2e/`.

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
