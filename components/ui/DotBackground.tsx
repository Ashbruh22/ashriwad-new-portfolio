'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import FlowField from '@/components/reactbits/FlowField';
import { useReducedMotion } from '@/components/ui/ReducedMotionProvider';

/**
 * Site-wide filament field, fixed behind all content. Decorative — dots ride
 * edge-to-centre filaments and their flow is driven **only by scrolling**. The
 * canvas is fixed + `pointer-events-none` so it never blocks clicks, and the
 * whole layer is unmounted under reduced motion (which also keeps the a11y/e2e
 * "no canvas" guarantee).
 *
 * Hidden entirely while Hero is on screen — Hero has its own WebGL background
 * (`NeuralVortexBackground`) — and mounted once Hero has fully scrolled out of
 * view, so this field only ever appears from About onward.
 */
export default function DotBackground() {
  const { isReducedMotion } = useReducedMotion();
  const { resolvedTheme } = useTheme();

  // client-only: FlowField draws to canvas and needs the resolved theme, so
  // there is nothing meaningful to server-render
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  // starts false (Hero owns the viewport on load, and the only real page here
  // has one) — flips true once Hero is fully scrolled past, flips back if the
  // user scrolls back up into it. All setState calls happen in the observer
  // callback, not synchronously in the effect body.
  const [pastHero, setPastHero] = useState(false);
  useEffect(() => {
    const heroEl = document.querySelector('#hero');
    if (!heroEl) return;
    const observer = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  if (!mounted || isReducedMotion || !pastHero) return null;

  const dark = resolvedTheme !== 'light';

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      {/* back to the original neutral palette, lines brighter than the
          original 0.13/0.11 alpha. Dots are white (near-black in light theme —
          the tonal opposite, since literal white vanishes on a white page);
          accentColor matches dotColor so no cyan tint remains anywhere here. */}
      <FlowField
        lineColor={dark ? 'rgba(139,143,153,0.27)' : 'rgba(90,92,100,0.23)'}
        dotColor={dark ? 'rgba(255,255,255,0.65)' : 'rgba(15,15,20,0.55)'}
        accentColor={dark ? 'rgba(255,255,255,0.65)' : 'rgba(15,15,20,0.55)'}
      />
    </div>
  );
}
