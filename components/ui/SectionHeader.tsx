'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useReducedMotion } from './ReducedMotionProvider';

interface SectionHeaderProps {
  /** small kicker above the title — omit to drop it entirely */
  eyebrow?: string;
  /** the h2 id, referenced by the section's aria-labelledby */
  id: string;
  children: string;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
  /** merged onto (and can override) the h2's default size classes via cn()/
   * tailwind-merge, e.g. for a section that wants a bigger title than the rest */
  titleClassName?: string;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * One section header everywhere: a silver-coloured eyebrow, a solid
 * `--text-primary` h2 title, and an optional supporting line. The text
 * itself is always plain/solid — an animated word-by-word scroll-scrub
 * reveal (`ScrollRevealText`, GSAP ScrollTrigger) briefly sat on the title
 * here and was reverted per request ("keep the text solid"); the component
 * file is still in `components/reactbits/` if a future call site wants it.
 * What *does* animate is entrance: eyebrow, title and description all share
 * the same simple inView fade+slide-up (`show`, below) so the header comes
 * in consistently with the rest of the page instead of the eyebrow/title
 * just popping in fully-formed a beat before the description catches up.
 * `once: false` — the reveal replays every time the header crosses the
 * viewport threshold (fades back out scrolling past, back in scrolling
 * back), matching the rest of the page's scroll-reveal content rather than
 * firing only on the first visit. The `<h2 id>` is always a real heading
 * node (aria-labelledby target).
 */
export default function SectionHeader({
  eyebrow,
  id,
  children,
  description,
  align = 'left',
  className = '',
  titleClassName,
}: SectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.4 });
  const { isReducedMotion } = useReducedMotion();
  const show = isReducedMotion || inView;
  const centered = align === 'center';

  return (
    <div
      ref={ref}
      className={`flex flex-col gap-3 ${centered ? 'items-center text-center' : 'items-start'} ${className}`}
    >
      {eyebrow && (
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="silver-text text-lg font-medium tracking-wide"
        >
          {eyebrow}
        </motion.span>
      )}

      <motion.h2
        id={id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
        transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
        className={cn(
          'font-display text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-3xl md:text-[2.5rem] md:leading-[1.1]',
          titleClassName,
        )}
      >
        {children}
      </motion.h2>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.16 }}
          className={`text-base text-[var(--text-secondary)] ${centered ? 'max-w-xl' : 'max-w-2xl'}`}
        >
          {description}
        </motion.p>
      )}
    </div>
  );
}
