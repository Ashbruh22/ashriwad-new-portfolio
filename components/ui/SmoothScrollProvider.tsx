'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from './ReducedMotionProvider';

gsap.registerPlugin(ScrollTrigger);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * Wires Lenis smooth-scroll to GSAP ScrollTrigger so the scroll-linked 3D
 * choreography stays in sync with Lenis's inertial position.
 *
 *  - Lenis drives the scroll position; `lenis.on('scroll', ScrollTrigger.update)`
 *    keeps GSAP in sync.
 *  - A single `gsap.ticker` callback drives Lenis's RAF (no double loop);
 *    `lagSmoothing(0)` stops GSAP from compensating in a way that desyncs.
 *  - `anchors: true` gives smooth in-page navigation for the nav's `#section`
 *    links without a plugin.
 *
 * Reduced motion: Lenis is destroyed / never created — native scroll is used.
 */
export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const { isReducedMotion } = useReducedMotion();

  useEffect(() => {
    if (isReducedMotion) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      // slower/more graceful than the default scroll-wheel duration above —
      // an anchor jump (nav links, Hero's "View work"/"Get in touch") can
      // cover a lot more distance in one go than a wheel tick, so it reads
      // as an abrupt snap at the same duration; 2.2s eases it out visibly
      anchors: { offset: -72, duration: 2.2 },
      autoRaf: false,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    ScrollTrigger.refresh();

    return () => {
      lenis.off('scroll', ScrollTrigger.update);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [isReducedMotion]);

  return <>{children}</>;
}
