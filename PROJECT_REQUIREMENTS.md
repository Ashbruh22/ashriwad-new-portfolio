# Portfolio Website — Project Requirements Document
**Owner:** Ashriwad Behera
**Purpose:** A single-page, scroll-driven portfolio site translating the resume into a visual, animated experience — anchored by a custom 3D centerpiece. Built via Antigravity, using this doc + the companion prompt sequence as the spec.

**References:**
- moncy.dev — a Three.js/WebGL/GSAP creative-developer portfolio built around a custom 3D piece. We're borrowing the *approach*, not the asset — his 3D avatar is proprietary and his repo explicitly says not to clone the design/layout/visuals.
- A third-party technical audit of moncy.dev (architecture, performance, accessibility, SEO, security, code quality) — its recommendations are folded into sections 4a, 7, 8, 9, 10, and 11 below.

---

## 1. Goals

- Show recruiters / FDE & full-stack hiring managers a portfolio that *feels* engineered, not templated — this is a signal in itself given the target roles.
- Land a genuine "wow" moment via a bespoke 3D centerpiece, without turning the site into a 3D-artist showcase that distracts from the resume content underneath it.
- Communicate depth on the two flagship projects (ClinDocMicro, CRM Sales Intelligence System) and the RideAbit/Happiest Minds experience without turning into a wall of text.
- Fast, smooth, accessible, crawlable, and secure by default — critically, it degrades gracefully on devices that can't handle WebGL well. A recruiter on a mid-range phone should never see a broken, laggy, or content-less site.

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14+ (App Router), TypeScript | Static export or ISR is enough for a portfolio; TS matches Ashriwad's stack |
| Styling | Tailwind CSS + CSS variables for theming | Fast iteration, easy light/dark tokens |
| 3D | **Three.js via `@react-three/fiber` + `@react-three/drei`** (`useGLTF`, `useAnimations` for the rigged character) | React-idiomatic Three.js — declarative scene graph fits a Next.js/React codebase far better than imperative Three.js |
| Scroll choreography | **GSAP core (not `gsap-trial`) + ScrollTrigger** | Drives the persistent 3D centerpiece's rotation/position/camera across the whole page scroll. Use only GSAP's free/core distribution — trial-tier plugins are explicitly not licensed for production hosting |
| Component-level animation | React Bits (2D UI primitives) + Framer Motion (local variants/orchestration) | Everything that *isn't* the 3D layer — cards, marquees, text reveals, hover states |
| Smooth scroll | Lenis (`@studio-freight/lenis`), synced to GSAP's ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)` | Needed so the GSAP-driven 3D scroll-linking feels buttery, not stepped |
| Text animation | GSAP `SplitText` if included in the licensed core distribution, otherwise a manual span-split utility | For the moncy.dev-style letter-by-letter headline reveal |
| Icons | Lucide React | Consistent with the rest of the stack |
| Theme toggle | `next-themes` | Handles dark/light persistence + system preference |
| Deployment | Vercel | Zero-config with Next.js |

> **Explicitly do NOT install:** physics libraries (`@react-three/cannon`, `@react-three/rapier`) or a postprocessing stack (bloom/DOF/SSAO passes) unless a specific effect genuinely requires it — the rigged character needs an animation system (`AnimationMixer`/`useAnimations`), not a physics engine. Keep the dependency list lean; postprocessing remains a common mobile-GPU cost sink for a portfolio's cost/benefit.

> **Scope note:** this is a materially bigger build than a standard component-driven portfolio. Budget real time for the 3D centerpiece and its performance/fallback/cleanup work — it's the highest-risk, highest-payoff piece of the whole project.

> **Note on "infinite scroll":** for a finite-content portfolio, true infinite scroll doesn't apply to the whole page. Interpret it as: (a) a single continuous, fluid scrollytelling page with no pagination or "load more" clicks, choreographed by GSAP ScrollTrigger against the persistent 3D layer, and (b) genuinely infinite/looping elements where it fits naturally — the skills strip and certifications strip should be seamless looping marquees, not paginated lists.

## 3. Design System — "Bold Gradient / Glow, dual-mode"

**Direction:** modern SaaS landing-page energy — big type, soft glow, gradient accents, generous negative space, glassy cards — now with a 3D centerpiece as the anchor rather than a purely flat/2D hero.

- **Color mode:** toggle between dark and light, `next-themes`, default to system preference. Both modes need the gradient/glow treatment, and the 3D scene's materials/lighting need their own light/dark variants.
- **Palette:**
  - Dark: near-black base (`#0A0A0F`), primary gradient violet → cyan (`#7C3AED → #06B6D4`), secondary accent pink/magenta for CTA highlights (`#EC4899`).
  - Light: off-white base (`#FAFAFA`), same gradient hues desaturated ~15%, used as soft glows/borders rather than solid fills, dark-slate text (`#0F172A`).
  - Keep one shared gradient token (`--gradient-primary`) so both modes stay visually related, and reuse the same hex values as the 3D scene's emissive/accent colors so the 3D piece and the 2D UI read as one system.
- **Typography:** a geometric/grotesk display font for headlines (e.g. Geist, Clash Display, or Space Grotesk) at large sizes (64–96px desktop hero), and Inter for body copy.
- **Surfaces:** glassmorphic cards (`backdrop-blur`, low-opacity gradient border, subtle inner glow on hover) for project and experience cards.
- **Motion tone:** confident but not showy for the 2D layer (200–400ms eases); the 3D centerpiece is allowed to be the one genuinely showy element on the page — everything else stays restrained so it doesn't compete.
- **Hero copy:** per the audit's design critique of moncy.dev (abstract "creative/designer/developer" branding with no concrete value line), keep our one-line positioning statement concrete and outcome-oriented rather than purely aesthetic — "final-year AI/ML engineer who builds production ML pipelines and full-stack systems" beats an abstract tagline alone.

## 4. Site Structure (single page, section-anchored)

1. **Nav** — fixed, becomes glassy/blurred on scroll, theme toggle, section anchor links, resume download button, a visible **"Reduce motion" toggle** (in addition to respecting the OS-level `prefers-reduced-motion`).
2. **Hero** — name (single visible `h1`), role ("AI/ML Engineer & Full-Stack Builder"), one-line positioning statement, GSAP `SplitText` letter-reveal headline, **3D centerpiece as the visual anchor** (see 4a), CTA buttons (View Work / Contact / Download Resume) — the audit specifically recommends a clear primary CTA in the hero rather than relying on nav alone, which we already have.
3. **About** — short narrative: final-year CS (AI/ML) at SRM IST, hands-on build-first style, interests in explainable AI, agentic systems, production ML pipelines, full-stack dev. `h2` heading.
4. **Experience** — vertical timeline (`h2` heading), 2 entries:
   - RideAbit — Backend Developer Intern (Apr–May 2026), Remote
   - Happiest Minds Technologies — AI/ML & Product Engineering Intern (Jun–Jul 2025), Bangalore
5. **Featured Projects** (`h2` heading, 2 large showcase cards, more visual real estate):
   - **AI-Driven CRM Sales Intelligence System** — five-layer real-time pipeline, XGBoost + LSTM dual-model, SHAP explainability, agentic decision layer, 90-day pilot results, ICIDS 2026 publication.
   - **ClinDocMicro** — offline clinical NLP microservice, 4-stage OCR pipeline, quantized Phi-3-Mini via llama.cpp, FHIR R4 + DPDP Act 2023 compliance, 71.2% chart-review time reduction.
6. **Project Grid** (`h2` heading, smaller cards): Enginuity 360, Mental Health Insight, Facial Age & Gender Prediction.
7. **Skills** (`h2` heading) — looping horizontal marquee strip(s), grouped by category (Languages / AI-ML / Backend & DB / Cloud & DevOps / Security & Practices), pausable on hover.
8. **Certifications & Hackathons** (`h2` heading) — compact grid or second marquee: SAP GenAI Developer, MathWorks (2), Meta Databases, Red Hat OpenShift, Cisco Networking, C Programming Bootcamp; DAYZERO Hackathon (Team Lead), Centinels Cyber Security Club.
9. **Contact / Footer** (`h2` heading) — email, phone, GitHub (Ashbruh22), LinkedIn, a closing CTA, subtle gradient footer glow. The 3D centerpiece can make a final small appearance here as a closing bookend.

### 4a. The 3D Centerpiece — concept and architecture

**Decision:** the centerpiece is a **posed, rigged 3D character**, rendered live in the existing `Canvas`/`Centerpiece` architecture, in a **low-poly geometric/faceted style** (flat-shaded, minimalist, techy — confirmed as the "modern" direction over Ready Player Me-style semi-realism or a chibi/cartoon character). The character must be an **original or properly licensed asset that Ashriwad has rights to use** — never a copy or derivative of moncy.dev's actual avatar. **Sourcing path:** since Mixamo's own stock characters (X Bot/Y Bot and its default character library) are mid-poly and realistically-proportioned, not faceted, the practical route is: source a low-poly humanoid mesh with a permissive/commercial license from a marketplace (Sketchfab — filter for low-poly, CC-BY or paid commercial license; itch.io asset packs) in a T-pose, then run it through **Mixamo's "Upload Character" auto-rigger** to get a standard rig, then apply Mixamo's animation library to it via retargeting. This keeps the "don't hand-model/rig from scratch" rule intact — Mixamo does the rigging — while getting the exact faceted look. **Do not hand-model a character from scratch.** A detailed character-design brief exists (uploaded separately) describing a fully custom Blender production pipeline — its *design direction and behavior/architecture specification* are adopted below, but its *production pipeline* (modeling/rigging from scratch) is explicitly not the path we're taking; treat that brief as reference for style/behavior, not as production instructions to follow literally.

**Feasibility note (facial expression), given the low-poly direction:** low-poly/faceted characters typically have minimal or no separate facial geometry (often just a flat-shaded or simply-textured face, no blend-shape rig) — treat true smile/blink facial expression as **out of scope for v1** by default for this style, and get personality/expressiveness entirely from body pose, head/neck orientation, and animation timing instead. Revisit only if a specific sourced asset happens to ship blend shapes.

**Asset budget** (apply when picking the character): the low-poly direction makes this easy to hit — expect well under 20k triangles for a genuinely faceted character (the 20k–50k ideal / 75k ceiling from the general budget is a generous upper bound, not a target to reach for). Favor flat-shaded materials or simple vertex colors over textures — low-poly style typically doesn't need texture maps at all, which is also a performance win.

- **Format & pipeline:** glTF (`.glb`) preferred over FBX for web. Load via `@react-three/drei`'s `useGLTF`/`useAnimations`. Export the Mixamo-rigged result as FBX and convert to `.glb` in the pipeline rather than shipping FBX to the browser.
- **Material/styling:** the faceted geometry itself does a lot of the stylistic work — recolor flat-shaded materials/vertex colors to sit inside the violet/cyan/pink gradient palette, and lean on the rim-light (below) rather than complex material work: flat normals per facet catch a rim light distinctly and will make the low-poly style read well against the dark background with comparatively little material effort.

#### Animation clips & naming convention

Name/rename clips consistently regardless of which source library they came from, so the state-machine code (below) can reference them by a stable name:

- `Idle` — subtle looping idle: slight breathing, small body movement, natural head movement, seamless loop.
- `Wave` — greeting, one hand raised.
- `LookAround` — character looks around naturally.
- `Point` — points toward a UI element/project.
- `Walk` — simple forward walk.
- `Turn` — turns roughly 90–180°.
- Optional, only if the source library has them and it's low extra effort: `Thinking`, `Typing`, `ThumbsUp`, `Celebrate`.

Map whichever Mixamo/marketplace clips are closest to these names onto this naming convention in code — the exact source clip names don't matter, the consistent internal names do.

#### Scroll-driven state machine (not per-scroll-event triggers)

Do **not** restart or re-trigger animation clips on every scroll event — that reads as janky, not alive. Instead:

```
Page Scroll
    ↓
Scroll Progress (0 → 1)
    ↓
Animation Controller (a dedicated hook, e.g. useCharacterAnimation)
    ↓
Character State
    ├── Idle
    ├── LookAround
    ├── Turn
    ├── Walk
    ├── Point
    └── Wave
```

The controller maps scroll-progress ranges to a small set of discrete states, and only crossfades to a new clip when the state actually changes (`actions[name].reset().fadeIn(0.4).play()`, fading out the previous action) — GSAP ScrollTrigger drives the progress value; the hook owns the state transitions.

#### Section-by-section behavior mapping

Adapted from the character brief's Hero/About/Skills/Projects/Contact arc onto our actual section list:

| Section | Character state | Notes |
|---|---|---|
| Hero | `Idle`, subtle look toward viewer | Character centered/prominent, breathing loop |
| About | `Turn` toward content + a subtler idle variant if available | Slight expression/pose change if blend shapes are in play |
| Experience | `Point` (as if presenting career history) | Smaller/off to one side by now, per the position-scrub from the original plan |
| Featured Projects | `Turn`/`Walk` toward the showcase, `Point` at the featured card in view | The two richest 2D cards get the character's most active gesture |
| Project Grid | `LookAround` or continued `Point` | Lighter treatment, matching the cards' own lighter visual weight |
| Skills | `LookAround` toward the marquee | Optional `Point` |
| Certifications | Minimal — idle/look, character mostly out of the way | |
| Contact | Faces the viewer, `Wave` | Closing bookend, matches the original plan's footer cameo |

#### Camera & lighting

- **Camera:** perspective camera, ~50–70mm-equivalent focal length, character centered or slightly offset, positioned roughly at chest/head height. Subtle depth of field only where performance allows (see performance budget in section 7 — cut this first on lower quality tiers). Character stays visually dominant on both desktop and mobile.
- **Lighting (3-light setup, ties to the existing gradient palette):** a large soft key light for primary facial/front illumination; a lower-intensity fill light to soften shadows; a violet/purple rim light positioned behind or to the side for separation from the dark background — this rim light should use the same violet (`#7C3AED`) already defined as a palette token, not a separately-invented purple, so the character and the 2D UI read as one system. Any additional glow is a web-renderer post-processing effect, not baked into the asset.

#### Background & environment

Near-black background, a subtle violet ambient glow, an optional small floating light-orb accent (this echoes the recurring orb motif from the moncy.dev reference screenshots — legitimate to reuse as a generic UI motif, it's not part of his proprietary character), optional sparse particles carried over from the original abstract-shape plan, a soft shadow beneath the character's feet for grounding. The background must not compete with the 2D content sections.

#### Interaction

- **Mouse/touch:** head and/or eyes follow the cursor if the rig has the bones/blend shapes for it, otherwise parallax the whole character group; slight body rotation; movement stays limited and natural — no extreme rotations. Touch interaction replaces mouse interaction on touch devices rather than being simply disabled.
- **Motion-sickness caution:** keep camera moves and character rotations subtle and slow — this is an accessibility/comfort requirement, not just a taste preference (ties to section 8).

#### Component architecture

Introduce a dedicated animation-state hook rather than folding scroll→state logic directly into the scene component:

```
components/three/
  Centerpiece.tsx        (fallback/capability wrapper — unchanged in role)
  CenterpieceScene.tsx    (Canvas + character render — now loads the glTF character)
  CharacterController.tsx (drives position/scale/camera from scroll, owns which state is active)
hooks/
  useCharacterAnimation.ts (scroll-progress → discrete state → clip crossfade logic)
```

- **Cleanup implication (ties to section 11):** loaded glTF scenes, skinned meshes, animation mixers, and textures all need explicit disposal on unmount.
- **Fallback, component boundary, and "required not optional" status:** unchanged from the prior plan — poster-image fallback for genuinely incompatible cases only; the character is expected to render for the large majority of visitors; all semantic content stays in ordinary DOM/HTML regardless of canvas state.
- **What must NOT happen, regardless of how it's built:** no hardcoding of any name, role text, or brand string belonging to moncy.dev or Moncy Yohannan anywhere in code, copy, `alt` text, `aria-label`s, CSS class names, or comments. No code or comment framed as recreating another named site "exactly." All visible name/role/tagline text must come from `lib/constants.ts`, never duplicated as a literal string elsewhere.

## 5. React Bits Components — Mapping by Section (2D layer only — separate from the 3D centerpiece)


| Section | Component(s) | Notes |
|---|---|---|
| Hero headline | GSAP `SplitText` letter reveal (or manual span-split) for name, `GradientText` for the role/tagline | Stagger reveal on load, in front of/beside the 3D canvas |
| Nav / theme toggle | plain Tailwind + `next-themes`, no React Bits needed here | Keep nav lightweight/instant |
| Section headings (About, Experience, Projects, Skills) | `ScrollReveal` or `ScrollFloat` | Consistent reveal pattern reused across sections for rhythm |
| About body copy | `AnimatedContent` / `FadeContent` | Subtle, don't overdo motion on paragraph text |
| Experience timeline nodes | `ScrollFloat` for entries, `GlareHover` on the card surface | Card reveals as it enters viewport |
| Featured project cards | `SpotlightCard` or `TiltedCard` | These two projects get the richest treatment — mouse-follow spotlight or tilt |
| Project grid cards | `MagicBento` or `CardSwap` layout, `GlareHover` per card | Slightly lighter treatment than featured cards |
| Skills strip | `Marquee` (seamless loop, hover-pause) | This is the "infinite" element — genuinely continuous |
| Certifications strip | `Marquee` (opposite direction from skills, for visual rhythm) | |
| Metrics/numbers (accuracy %, latency, F1 scores) | `CountUp` | Use sparingly on the two featured projects only |
| Contact CTA | `ShinyText` or `GradientText` on the CTA button label | |

## 6. Content Mapping (source: resume)

- **Header/contact:** ashriwad.behera@gmail.com · +91-7406028477 · github.com/Ashbruh22 · LinkedIn: Ashriwad Behera
- **Education:** B.Tech CSE (AI & ML), SRM IST Chennai, 2023–2027 (Expected), CGPA 8.45/10.0
- All experience bullets, project bullets, skills list, certifications, and hackathon/positions content should be pulled verbatim from the attached resume — do not invent metrics or responsibilities. Numbers (F1 scores, %, ms, days) must stay exact.
- **Content model:** store this content in typed data files (`lib/experience.ts`, `lib/projects.ts`, `lib/skills.ts`, etc.) and map over them to render sections — per the audit's code-quality recommendation, this avoids duplicated markup and makes future updates (new job, new project) a data change, not a JSX rewrite.

## 7. Performance Requirements

- **Lazy-load the 3D experience.** Import the canvas/scene only after the hero shell has painted (`React.Suspense` + dynamic import), and defer any non-critical scene work until `IntersectionObserver` reports it's near the viewport.
- **Progressive fallback.** A compressed poster image (or static gradient) covers: WebGL init failure, `prefers-reduced-motion`/manual reduce-motion toggle, low-memory devices, narrow screens, and slow network connections (check `navigator.connection?.effectiveType` where available).
- **Adaptive quality tiers.** Centralize a `quality` profile (`low` / `medium` / `high`) that determines device pixel ratio, shadows, antialiasing, texture resolution, particle count, and whether any postprocessing runs at all:

```tsx
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const dpr = Math.min(window.devicePixelRatio, 1.5);

<Canvas dpr={dpr} frameloop={reducedMotion ? "demand" : "always"}>
  <CenterpieceScene quality={quality} />
</Canvas>
```

- **Avoid continuous rendering where possible.** Use `frameloop="demand"` for static/mostly-static states; invalidate only on animation, pointer movement, or scroll-driven state changes.
- **No unused heavy dependencies.** No physics engine, no postprocessing stack, unless a specific effect is actually implemented and justified.
- **Bundle size.** Code-split the Three.js/GSAP bundles so they only load when the Hero (or the persistent-canvas wrapper) actually mounts.
- **Measure on real conditions**, not just desktop: a mid-range Android device and throttled 4G. Track LCP, INP, CLS, JS transfer size, and average frame time, not just a single Lighthouse score.
- **Performance target:** Lighthouse ≥ 90 performance/accessibility on desktop is the goal, but expect the 3D layer to cost some points versus a pure-2D site — prioritize a smooth, interactive *feel* over chasing a perfect number if there's a real tradeoff.

## 8. Accessibility Requirements

- **Skip link** as the first interactive element: `<a href="#main" class="skip-link">Skip to content</a>`.
- **Semantic landmarks:** `<header>`, `<main id="main">`, `<nav aria-label="Primary">`, `<section aria-labelledby="...">` per section, `<footer>`.
- **Heading hierarchy:** exactly one visible `h1` (the name, in Hero), `h2` for every major section (About, Experience, Projects, Skills, Certifications, Contact) — verify headings represent real document structure, not just styling.
- **Reduced motion:** respect `prefers-reduced-motion` *and* provide a visible in-page "Reduce motion" toggle — disable auto-rotation, inertial movement, marquee loops, parallax, and scroll-scrubbed animation for either trigger, replaced with simple fades/static states.
- **Keyboard path:** header links, project links, social links, and the theme/reduce-motion toggles must be reachable in logical order, visibly focused, and operable without a pointer. Tilt/spotlight mouse-follow effects must not be required to access any content.
- **Canvas behavior:** mark the 3D canvas `aria-hidden="true"` (it's decorative, not informational) — no equivalent DOM content needed since it conveys no unique information.
- **Alt text:** meaningful, specific alt text on any real images (the poster/fallback image, project screenshots if added) — not generic labels like "image of project."
- **Color and contrast:** test text/background contrast across animated states, hover states, glow overlays, and both themes — never rely on color, cursor change, or animation alone to communicate state.
- **Motion-sickness caution for the character:** keep the character's scroll-driven rotations, walk/turn transitions, and any camera movement subtle and slow — this is a comfort/accessibility requirement on top of `prefers-reduced-motion`, not just a taste preference.

## 9. SEO Requirements

- Descriptive page title and meta description reflecting name + role ("Ashriwad Behera — AI/ML Engineer & Full-Stack Builder").
- `og:image`, `twitter:card`, favicon/manifest.
- Basic structured data (JSON-LD) using `Person` and `WebSite` entity types.
- `robots.txt` and a `sitemap.xml` (even for a one-page site, this documents the canonical URL).
- External links opening new tabs get explicit accessible text and `rel="noopener noreferrer"`.
- Descriptive anchor text ("View GitHub profile" rather than a bare icon with no label).

## 10. Security & Privacy Baseline

- Set security headers appropriate to a static/Vercel-hosted Next.js site — tailor origins to whatever's actually used (fonts, analytics, etc.), don't deploy an example CSP unchanged:

```http
Content-Security-Policy:
  default-src 'self';
  img-src 'self' data: https:;
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';

X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

- If any analytics is added later, disclose it in a short privacy note.
- Keep dependencies patched; run `npm audit` (or equivalent) in CI.
- Commit a lockfile for reproducible builds.

## 11. Code Quality & Cleanup Requirements

These matter specifically because the 3D + scroll-linked layer creates real resource-leak risk if not handled deliberately:

- Scope every GSAP timeline through `useGSAP()` or `gsap.context()`, and revert it on unmount.
- Kill `ScrollTrigger` instances, event listeners, RAF loops, and any subscriptions on component teardown.
- Dispose Three.js geometries, materials, render targets, textures, **and any loaded glTF scenes/skinned meshes/animation mixers** when the Centerpiece scene unmounts.
- Keep animation state out of React's high-frequency render loop — use refs, GSAP, or React Three Fiber's own state, not `setState` on every frame.
- ESLint + TypeScript build checking (`tsc -b && vite build`/`next build`) as a baseline CI gate.
- **A mandatory grep/lint check, run as part of the build or CI, that fails if any of the following appear anywhere in `app/`, `components/`, `lib/`, or `public/` (case-insensitive): `moncy`, `yohannan`, or any other real person's name/brand that isn't Ashriwad's. This is a hard gate, not a one-time cleanup** — a prior version of this codebase shipped hardcoded "MONCY YOHANNAN" text and CSS explicitly commented as an "exact recreation," which is both a licensing violation and simply wrong content for a resume site. Every visible name/role/tagline string must be sourced from `lib/constants.ts`, never duplicated as a literal.
- A small automated test covering: anchor navigation, external links, keyboard navigation, and the no-WebGL fallback path (Playwright or equivalent).

## 12. Out of Scope (for v1)

- Physics engines and postprocessing effects (bloom/DOF/SSAO) unless a specific need arises.
- Per-project case-study URLs/pages, structured `CreativeWork` data, and a full Lighthouse CI pipeline — good v2 additions per the audit, not required for v1 launch.
- CMS/backend for content — content is hardcoded (in typed data files) from the resume.
- Blog section.
- Multi-page routing — everything lives on one scroll-anchored page.

## 13. Licensing Note

Do not copy moncy.dev's distinctive layout, visuals, 3D avatar asset, or GSAP trial-plugin setup — his repository explicitly restricts this. This document uses his site only as an architectural/technical reference point; the actual design, content, and 3D concept here are original to this project. This applies with equal force now that the centerpiece is a posed 3D character (section 4a) — the character must be a properly licensed/free-to-use asset (e.g. Mixamo) with its own poses and material styling, never Moncy's actual avatar or a visual copy of it, and no code, comment, class name, or asset filename may frame the work as recreating his site. A previous build of this codebase violated this directly — hardcoded "Moncy Yohannan" as the displayed name and labeled its own CSS an "exact recreation" of moncy.dev — that class of mistake is exactly what section 11's mandatory branding check now guards against.