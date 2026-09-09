'use client';

import React from 'react';
import { useReducedMotion } from '@/components/ui/ReducedMotionProvider';

interface MarqueeProps {
  children: React.ReactNode;
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  className?: string;
}

/**
 * React Bits style Marquee: a seamless looping strip (two copies of the
 * content translated -50%). Animation lives in `.animate-marquee` /
 * `.animate-marquee-reverse` (globals.css).
 *
 * Under reduced motion it renders a single static wrapped row and — crucially —
 * emits NO `.animate-marquee*` elements (asserted by e2e/fallback.spec.ts).
 */
export default function Marquee({
  children,
  direction = 'left',
  pauseOnHover = true,
  className = '',
}: MarqueeProps) {
  const { isReducedMotion } = useReducedMotion();

  if (isReducedMotion) {
    return <div className={`flex flex-wrap gap-2.5 ${className}`}>{children}</div>;
  }

  const anim = direction === 'left' ? 'animate-marquee' : 'animate-marquee-reverse';
  const track = pauseOnHover ? 'rb-marquee-track' : '';

  return (
    <div className={`${track} relative flex w-full overflow-hidden ${className}`}>
      <div className={`flex w-max shrink-0 items-center ${anim}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex shrink-0 items-center gap-2.5 pr-2.5"
            aria-hidden={i > 0 ? 'true' : undefined}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}
