'use client';

import React, { useRef } from 'react';
import { motion, useInView, type Variants } from 'framer-motion';
import { useReducedMotion } from './ReducedMotionProvider';

type RevealVariant = 'rise' | 'mask' | 'fade';

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  /** stagger children that are themselves <Reveal> or motion elements */
  stagger?: number;
  as?: 'div' | 'span' | 'li' | 'section';
}

const EASE = [0.16, 1, 0.3, 1] as const;

const VARIANTS: Record<RevealVariant, Variants> = {
  rise: {
    hidden: { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  },
  fade: {
    hidden: { opacity: 0, filter: 'blur(6px)' },
    show: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: EASE } },
  },
  mask: {
    hidden: { opacity: 0, y: '38%', clipPath: 'inset(0 0 100% 0)' },
    show: {
      opacity: 1,
      y: '0%',
      clipPath: 'inset(0 0 -2% 0)',
      transition: { duration: 0.8, ease: EASE },
    },
  },
};

/**
 * The single scroll-reveal primitive. `mask` is a clip-path wipe for headings;
 * `rise` / `fade` for everything else. Consistent easing + optional stagger.
 * Falls back to a plain wrapper under reduced motion.
 */
export default function Reveal({
  children,
  className = '',
  variant = 'rise',
  delay = 0,
  stagger,
  as = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px -10% 0px' });
  const { isReducedMotion } = useReducedMotion();

  const MotionTag = motion[as] as typeof motion.div;

  if (isReducedMotion) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  if (stagger != null) {
    return (
      <MotionTag
        ref={ref as React.RefObject<HTMLDivElement>}
        className={className}
        initial="hidden"
        animate={inView ? 'show' : 'hidden'}
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: stagger, delayChildren: delay } },
        }}
      >
        {children}
      </MotionTag>
    );
  }

  return (
    <MotionTag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={className}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      variants={VARIANTS[variant]}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}

/** A child item for use inside a `<Reveal stagger>` parent. */
export function RevealItem({
  children,
  className = '',
  variant = 'rise',
}: {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
}) {
  const { isReducedMotion } = useReducedMotion();
  if (isReducedMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={VARIANTS[variant]}>
      {children}
    </motion.div>
  );
}
