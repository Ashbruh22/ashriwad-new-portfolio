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
| 3D | **Three.js via `@react-three/fiber` + `@react-three/drei`** | React-idiomatic Three.js — declarative scene graph fits a Next.js/React codebase far better than imperative Three.js |
| Scroll choreography | **GSAP core (not `gsap-trial`) + ScrollTrigger** | Drives the persistent 3D centerpiece's rotation/position/camera across the whole page scroll. Use only GSAP's free/core distribution — trial-tier plugins are explicitly not licensed for production hosting |
| Component-level animation | React Bits (2D UI primitives) + Framer Motion (local variants/orchestration) | Everything that *isn't* the 3D layer — cards, marquees, text reveals, hover states |
| Smooth scroll | Lenis (`@studio-freight/lenis`), synced to GSAP's ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)` | Needed so the GSAP-driven 3D scroll-linking feels buttery, not stepped |
| Text animation | GSAP `SplitText` if included in the licensed core distribution, otherwise a manual span-split utility | For the moncy.dev-style letter-by-letter headline reveal |
| Icons | Lucide React | Consistent with the rest of the stack |
| Theme toggle | `next-themes` | Handles dark/light persistence + system preference |
| Deployment | Vercel | Zero-config with Next.js |

> **Explicitly do NOT install:** physics libraries (`@react-three/cannon`, `@react-three/rapier`) or a postprocessing stack (bloom/DOF/SSAO passes) unless a specific effect genuinely requires it. The audit flagged moncy.dev's dependency list as heavier than it needs to be for what's rendered — our abstract centerpiece (geometry + shader material + optional instanced particles) doesn't need a physics engine, and postprocessing is a common mobile-GPU cost sink for a portfolio's cost/benefit.

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

Moncy's site uses a fully custom-modeled/rigged 3D character — a specialized 3D-art skill and roughly a month of work, not a reasonable ask on a job-search timeline. Instead, build an **abstract 3D object that reads as "AI/ML + engineering"** rather than a character:

- **Concept:** a central geometric form — e.g. an icosahedron/dodecahedron core, or a small cluster of connected nodes resembling a neural-net graph — built from primitives + a custom shader material (fresnel/glow edge, matching the gradient palette), optionally surrounded by a sparse instanced-particle field. No physics engine, no imported 3D models required for v1.
- **Behavior:**
  - Idle: slow continuous rotation, subtle "breathing" scale, a few instanced points drifting near it.
  - Mouse-reactive: gentle parallax tilt following cursor position (desktop only).
  - Scroll-reactive: GSAP ScrollTrigger scrubs its rotation/position/camera distance as the user scrolls, so it feels alive across the whole page. It persists in a fixed canvas behind/beside the content, subtly repositioning per section (bigger/centered in Hero, small and off to one side by Contact).
- **Fallback:** on WebGL-unsupported browsers, low-end/low-memory devices, narrow screens, slow networks, or `prefers-reduced-motion`/the manual reduce-motion toggle, render a static compressed poster image of the same object instead of the live canvas. Detect capability up front.
- **Component boundary** (canvas-plus-DOM pattern — the audit's core architectural recommendation): the 3D centerpiece is a **required, core part of the site's identity** — it is not being built as an optional flourish, and it should ship and run by default for the large majority of visitors. The canvas-plus-DOM split still matters architecturally for a different reason: all semantic content (headings, copy, links, project details) lives in ordinary DOM/HTML rather than being drawn onto the canvas, so navigation, identity, and content stay readable, crawlable, and accessible *regardless* of whether the 3D layer is rendering — that's a resilience property, not a statement that the 3D layer itself is optional. The poster-image fallback in the bullet above exists strictly for genuinely incompatible cases (no WebGL, `prefers-reduced-motion`, very low-end hardware) — it is a compatibility fallback, not a design option to skip the 3D piece by default. Concretely:

```
<AppShell>
  <AccessibilityControls />      {/* skip link, reduce-motion toggle */}
  <HeaderNav />
  <Hero>
    <Suspense fallback={<HeroPoster />}>
      <CenterpieceScene quality={quality} />
    </Suspense>
  </Hero>
  <AboutSection />
  <ExperienceTimeline />
  <FeaturedProjects />
  <ProjectGrid />
  <SkillsSection />
  <CertificationsSection />
  <ContactSection />
  <Footer />
</AppShell>
```

  All semantic content (headings, copy, links, project details) lives in ordinary DOM/HTML so the page stays readable, crawlable, and navigable even in the rare case the canvas can't mount — but the 3D canvas is expected to mount and run for the default/majority case, not treated as a nice-to-have.

This gets the "bespoke 3D signature piece" effect from the reference without requiring character-modeling skills, multi-week production time, or the dependency weight (physics, postprocessing) the audit flagged as avoidable overhead.

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
- Dispose Three.js geometries, materials, render targets, and textures when the Centerpiece scene unmounts.
- Keep animation state out of React's high-frequency render loop — use refs, GSAP, or React Three Fiber's own state, not `setState` on every frame.
- ESLint + TypeScript build checking (`tsc -b && vite build`/`next build`) as a baseline CI gate.
- A small automated test covering: anchor navigation, external links, keyboard navigation, and the no-WebGL fallback path (Playwright or equivalent).

## 12. Out of Scope (for v1)

- A fully custom-modeled/rigged 3D character (moncy.dev's exact approach) — the abstract centerpiece in 4a is the v1 target; a character-level asset is a possible v2 stretch goal.
- Physics engines and postprocessing effects (bloom/DOF/SSAO) unless a specific need arises.
- Per-project case-study URLs/pages, structured `CreativeWork` data, and a full Lighthouse CI pipeline — good v2 additions per the audit, not required for v1 launch.
- CMS/backend for content — content is hardcoded (in typed data files) from the resume.
- Blog section.
- Multi-page routing — everything lives on one scroll-anchored page.

## 13. Licensing Note

Do not copy moncy.dev's distinctive layout, visuals, 3D avatar asset, or GSAP trial-plugin setup — his repository explicitly restricts this. This document uses his site only as an architectural/technical reference point; the actual design, content, and 3D concept here are original to this project.
