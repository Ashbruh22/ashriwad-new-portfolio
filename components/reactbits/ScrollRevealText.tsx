'use client';

// React Bits — ScrollReveal (JS-TW variant). Vendored from
// https://reactbits.dev/r/ScrollReveal-JS-TW.json
// Named `ScrollRevealText` here, not `ScrollReveal` — this codebase already
// has `components/reactbits/ScrollReveal.tsx` (the shared trigger-once
// fade+direction+blur reveal aliased everywhere as FadeContent/
// AnimatedContent/ScrollFloat) doing something quite different; reusing the
// name would silently shadow it for every other import in the app.
// Adaptations from the source:
//   • full TypeScript.
//   • `as` prop (default 'h2', matches upstream) instead of a hardcoded
//     `<h2><p>...</p></h2>` — every call site here needs to own its heading
//     tag/id directly (Hero's single-per-page `<h1>`, each section's own
//     `<h2 id>` that its `aria-labelledby` points at), so this renders
//     *as* that tag around the word spans, no extra wrapper element.
//   • the source's cleanup killed **every** ScrollTrigger on the page
//     (`ScrollTrigger.getAll().forEach(t => t.kill())`) — harmless with
//     exactly one instance on a page, broken with more than one (this site
//     uses it on Hero's name *and* every section heading): unmounting any
//     single instance would kill every other instance's triggers too. Each
//     tween's own `.scrollTrigger` is captured and only those get killed.
//   • gated by the site's `useReducedMotion()` (every other animated text
//     component here does this) — renders the plain string with no word
//     splitting and creates no ScrollTrigger instance at all.
//   • GSAP's ScrollTrigger is already registered and synced to this site's
//     Lenis smooth-scroll in SmoothScrollProvider.tsx
//     (`lenis.on('scroll', ScrollTrigger.update)`) — no scrollerProxy setup
//     needed here, scroll position is already kept in sync globally.
import React, { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/components/ui/ReducedMotionProvider';

gsap.registerPlugin(ScrollTrigger);

export interface ScrollRevealTextProps extends React.HTMLAttributes<HTMLElement> {
  text: string;
  /** wrapper element — keep the real semantic tag (h1/h2/etc.) at the call site */
  as?: React.ElementType;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  rotationEnd?: string;
  wordAnimationEnd?: string;
  'data-hero-item'?: boolean;
}

export default function ScrollRevealText({
  text,
  as: Tag = 'h2',
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  rotationEnd = 'bottom bottom',
  wordAnimationEnd = 'bottom bottom',
  className = '',
  ...rest
}: ScrollRevealTextProps) {
  const ref = useRef<HTMLElement>(null);
  const { isReducedMotion } = useReducedMotion();

  const words = useMemo(
    () =>
      text.split(/(\s+)/).map((word, index) =>
        /^\s+$/.test(word) ? (
          word
        ) : (
          <span className="word inline-block" key={index}>
            {word}
          </span>
        ),
      ),
    [text],
  );

  useEffect(() => {
    if (isReducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const triggers: ScrollTrigger[] = [];
    const track = (tween: gsap.core.Tween) => {
      if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
    };

    track(
      gsap.fromTo(
        el,
        { transformOrigin: '0% 50%', rotate: baseRotation },
        {
          ease: 'none',
          rotate: 0,
          scrollTrigger: { trigger: el, start: 'top bottom', end: rotationEnd, scrub: true },
        },
      ),
    );

    const wordElements = el.querySelectorAll<HTMLElement>('.word');

    track(
      gsap.fromTo(
        wordElements,
        { opacity: baseOpacity },
        {
          ease: 'none',
          opacity: 1,
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: 'top bottom-=20%', end: wordAnimationEnd, scrub: true },
        },
      ),
    );

    if (enableBlur) {
      track(
        gsap.fromTo(
          wordElements,
          { filter: `blur(${blurStrength}px)` },
          {
            ease: 'none',
            filter: 'blur(0px)',
            stagger: 0.05,
            scrollTrigger: { trigger: el, start: 'top bottom-=20%', end: wordAnimationEnd, scrub: true },
          },
        ),
      );
    }

    return () => triggers.forEach((t) => t.kill());
  }, [isReducedMotion, enableBlur, baseOpacity, baseRotation, blurStrength, rotationEnd, wordAnimationEnd, text]);

  if (isReducedMotion) {
    return (
      <Tag ref={ref} className={className} {...rest}>
        {text}
      </Tag>
    );
  }

  return (
    <Tag ref={ref} className={className} {...rest}>
      {words}
    </Tag>
  );
}
