'use client';

// Purpose-built rich-slide project carousel — started from a shadcn-registry
// "CardCarousel" (Swiper coverflow, image-only gallery with a fixed header
// outside the carousel) the user pasted, but rebuilt as rich slides per the
// reference layout they shared: each slide carries its own number, title,
// category, tools list, and screenshot together (not text pinned outside a
// plain image gallery). Adaptations from the pasted starting point:
//   • no `Badge` dependency — the reference has no pill/badge UI at all (the
//     source snippet's badge was demo chrome), and shadcn's default Badge
//     renders theme classes (`bg-primary`, `ring-ring`, …) this project's
//     token system doesn't define.
//   • navigation is hover-driven, not arrow buttons: moving the cursor into
//     the left/right edge zone of the carousel calls `slidePrev()`/
//     `slideNext()`. An earlier version had explicit prev/next buttons,
//     then briefly a per-slide `onMouseEnter`/`onClick` — both removed; see
//     reactbits-transformation memory for the full saga if resurrecting
//     either. The per-slide attempt failed for a instructive reason worth
//     knowing before trying it again: with the coverflow effect's 3D
//     transforms, `document.elementFromPoint()` at a peeking slide's own
//     `getBoundingClientRect()` coordinates resolved to `.swiper-wrapper`,
//     not the slide itself or anything inside it — confirmed directly, and
//     it meant NO pointer event (click, mouseenter, hover) ever reached a
//     per-slide listener there. Tracking cursor X against the *container's*
//     bounding box instead sidesteps that hit-testing quirk entirely: it
//     never needs to hit-test the transformed slide. Two more gotchas
//     apply here:
//   • no `loop`: Swiper's loop mode needs a clone buffer it can't build from
//     only 2 slides (it logs "not enough for loop mode" and silently
//     disables itself) — tried duplicating the project array to give it
//     enough slides, but that just made the pagination bullets count 4
//     instead of 2. Not needed anyway: `slideTo()` on a specific index
//     doesn't care whether the field loops.
//   • gated by the site's `useReducedMotion()` (every other animated
//     component does this) — autoplay off, near-instant slide transitions
//     (see the `speed` prop below for why "instant" isn't literally 0ms —
//     that value silently breaks `slideTo()`/`slideNext()` too).
import React, { useMemo, useRef } from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper/types';
import type { Project } from '@/lib/projects';
import { useReducedMotion } from '@/components/ui/ReducedMotionProvider';

import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';

interface ProjectCarouselProps {
  projects: Project[];
  autoplayDelay?: number;
}

const GLOW_COLOR = '#a78bfa'; // violet-400 — matches the Hero/Experience accent

export function ProjectCarousel({ projects, autoplayDelay = 4500 }: ProjectCarouselProps) {
  const { isReducedMotion } = useReducedMotion();
  // a plain mutable ref, not useState — this repo's `react-hooks/immutability`
  // lint rule flags mutating a useState value even via a library's own
  // imperative API, and a ref is React's sanctioned escape hatch for exactly
  // this ("hold an instance, call methods on it, don't trigger re-renders").
  const swiperRef = useRef<SwiperType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // which edge zone the cursor was in last, so a held-still cursor doesn't
  // re-issue the same slidePrev()/slideNext() call on every mousemove tick
  const zoneRef = useRef<'left' | 'right' | 'center' | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const swiper = swiperRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!swiper || !rect || rect.width === 0) return;

    const relativeX = (e.clientX - rect.left) / rect.width;
    const zone = relativeX < 0.32 ? 'left' : relativeX > 0.68 ? 'right' : 'center';
    if (zone === zoneRef.current) return;
    zoneRef.current = zone;

    if (zone === 'left' && !swiper.isBeginning) swiper.slidePrev();
    else if (zone === 'right' && !swiper.isEnd) swiper.slideNext();
  };

  const handleMouseLeave = () => {
    zoneRef.current = null;
  };

  // Swiper's own inline style tag can't reach into shadow-free global scope
  // any differently than a normal <style> here — kept local to this
  // component rather than added to globals.css since it's purely about the
  // library's own slide-sizing internals, not a reusable site-wide class.
  const css = `
    .project-carousel .swiper { padding-bottom: 3rem; overflow: visible; }
    .project-carousel .swiper-slide {
      width: min(560px, 90vw);
      opacity: 0.35;
      transition: opacity 0.4s ease;
      cursor: pointer;
    }
    .project-carousel .swiper-slide-active {
      opacity: 1;
      cursor: default;
    }
    .project-carousel .swiper-3d .swiper-slide-shadow-left,
    .project-carousel .swiper-3d .swiper-slide-shadow-right { background: none; }
    .project-carousel .swiper-pagination-bullet {
      background: var(--text-secondary);
      opacity: 0.4;
      cursor: pointer;
    }
    .project-carousel .swiper-pagination-bullet-active {
      background: ${GLOW_COLOR};
      opacity: 1;
    }
  `;

  const modules = useMemo(() => [EffectCoverflow, Autoplay, Pagination], []);

  return (
    <div
      ref={containerRef}
      className="project-carousel"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <style>{css}</style>
      <Swiper
        modules={modules}
        effect="coverflow"
        grabCursor
        centeredSlides
        slidesPerView="auto"
        spaceBetween={24}
        // 1ms, not 0 — Swiper's slide transitions complete on the CSS
        // transitionend event, which a genuinely zero-duration transition
        // never fires; slideTo()/slideNext() silently no-op forever as a
        // result (confirmed directly against the Swiper instance: calling
        // slideNext() with speed:0 left activeIndex unchanged, while
        // slideNext(0) — an explicit argument, bypassing params.speed —
        // worked). 1ms is imperceptible but real, so it still fires.
        speed={isReducedMotion ? 1 : 600}
        coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2.5, slideShadows: false }}
        autoplay={isReducedMotion ? false : { delay: autoplayDelay, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        className="w-full"
      >
        {projects.map((project, index) => {
          const imageFirst = index % 2 === 1;
          const number = String(index + 1).padStart(2, '0');
          const title = project.shortTitle ?? project.title;

          const header = (
            <div className="flex items-start justify-between gap-4 sm:gap-6">
              <span className="shrink-0 font-display text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
                {number}
              </span>
              <div className="min-w-0 text-right">
                <h3 className="font-display text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                  {title}
                </h3>
                {project.category && (
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">{project.category}</p>
                )}
              </div>
            </div>
          );

          const tools = project.technologies.length > 0 && (
            <div className="relative mt-6">
              <p className="text-sm font-medium text-[var(--text-primary)]">Tools and features</p>
              <p className="mt-1.5 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
                {project.technologies.join(', ')}
              </p>
              {!imageFirst && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 rounded-full sm:block"
                  style={{
                    background: GLOW_COLOR,
                    filter: 'blur(18px)',
                    opacity: 0.55,
                  }}
                />
              )}
            </div>
          );

          const image = project.image && (
            <div className="relative mt-6 aspect-[16/9] w-full overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
              <Image
                src={project.image.src}
                alt={project.image.alt}
                fill
                sizes="(min-width: 622px) 560px, 90vw"
                className="object-cover object-top"
              />
            </div>
          );

          // mouse hover is handled at the container level (see
          // handleMouseMove) — per-slide pointer listeners don't reliably
          // fire here (see the file-header note). Focus still works fine at
          // this level, though: it doesn't depend on hit-testing, so tabbing
          // to a peeking slide is a real, working keyboard equivalent of
          // hovering it. slideTo() on the already-active slide is a
          // harmless no-op, so this doesn't need an index !== active guard.
          const goTo = () => swiperRef.current?.slideTo(index);

          return (
            <SwiperSlide key={project.id}>
              <div
                className="glass-card rounded-3xl p-6 sm:p-8"
                role="button"
                tabIndex={0}
                aria-label={`Show ${title}`}
                onFocus={goTo}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    goTo();
                  }
                }}
              >
                {imageFirst ? (
                  <>
                    {image}
                    <div className="mt-6">
                      {header}
                      {tools}
                    </div>
                  </>
                ) : (
                  <>
                    {header}
                    {tools}
                    {image}
                  </>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
