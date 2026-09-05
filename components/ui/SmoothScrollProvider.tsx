'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { useReducedMotionPreference } from '@/components/ui/ReducedMotionProvider';

/**
 * Lenis-driven smooth scrolling.
 *
 * Skipped entirely when the visitor has asked for reduced motion — inertial
 * scrolling is exactly the kind of motion that setting is about, and native
 * scroll is the correct fallback.
 */
export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const { reduced } = useReducedMotionPreference();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
