'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useReducedMotion } from '@/components/ui/ReducedMotionProvider';

interface SplitTextProps {
  text: string;
  className?: string;
  /** wrapper element — keep the real semantic tag (h1/h2/p) at the call site */
  as?: React.ElementType;
  /** seconds between each character */
  stagger?: number;
  /** seconds before the first character */
  delay?: number;
  duration?: number;
  /** px the characters rise from */
  yFrom?: number;
  /** start-blur in px (React Bits "dramatic" flavour) */
  blur?: number;
  amount?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * React Bits SplitText, reimplemented on framer-motion (no GSAP SplitText /
 * @gsap/react dep, and no global ScrollTrigger teardown). Splits `text` into
 * words → characters and staggers each character in on first view. Spaces are
 * preserved as real text nodes so `textContent` is unchanged — safe on the
 * hero copy and section headings. Renders plain text under reduced motion.
 */
export default function SplitText({
  text,
  className = '',
  as: Tag = 'span',
  stagger = 0.025,
  delay = 0,
  duration = 0.5,
  yFrom = 24,
  blur = 6,
  amount = 0.5,
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount });
  const { isReducedMotion } = useReducedMotion();

  if (isReducedMotion) {
    return <Tag className={className}>{text}</Tag>;
  }

  const words = text.split(' ');
  let charIndex = 0;

  return (
    <Tag ref={ref} className={className} aria-label={text}>
      {words.map((word, wi) => (
        <span key={wi} aria-hidden className="inline-block whitespace-nowrap">
          {word.split('').map((char) => {
            const i = charIndex++;
            return (
              <motion.span
                key={i}
                className="inline-block"
                initial={{ opacity: 0, y: yFrom, filter: `blur(${blur}px)` }}
                animate={
                  inView
                    ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                    : { opacity: 0, y: yFrom, filter: `blur(${blur}px)` }
                }
                transition={{ duration, ease: EASE, delay: delay + i * stagger }}
              >
                {char}
              </motion.span>
            );
          })}
          {wi < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  );
}
