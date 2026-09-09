'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/components/ui/ReducedMotionProvider';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** kept for API compatibility */
  duration?: number;
  direction?: Direction;
  /** px offset the element travels from */
  distance?: number;
  /** start-blur in px */
  blur?: number;
  /** viewport fraction that must be visible before revealing */
  amount?: number;
  once?: boolean;
}

const EASE = [0.16, 1, 0.3, 1] as const;

function offset(direction: Direction, distance: number) {
  switch (direction) {
    case 'up':
      return { y: distance };
    case 'down':
      return { y: -distance };
    case 'left':
      return { x: distance };
    case 'right':
      return { x: -distance };
    default:
      return {};
  }
}

/**
 * The shared scroll-reveal used across the site. Opacity + directional slide +
 * optional blur, replaying every time the element crosses the viewport
 * threshold (not just once) — fades back out on the way past, then fades
 * back in on re-entry, so scrolling up and down the page feels consistent
 * rather than "used up" after the first pass. Slowed from an earlier faster
 * default per explicit feedback ("make it less faster so it feels soothing
 * to scroll"). `ScrollFloat`, `FadeContent` and `AnimatedContent` are
 * aliases of this. Renders children unchanged (no animation) under reduced
 * motion.
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.9,
  direction = 'up',
  distance = 28,
  blur = 4,
  amount = 0.2,
  once = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: '-10% 0px -10% 0px', amount });
  const { isReducedMotion } = useReducedMotion();

  if (isReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  const from = { opacity: 0, filter: `blur(${blur}px)`, ...offset(direction, distance) };
  const to = { opacity: 1, filter: 'blur(0px)', x: 0, y: 0 };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={from}
      animate={inView ? to : from}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
