'use client';

import React from 'react';

interface StarBorderProps {
  children?: React.ReactNode;
  className?: string;
  /** colour of the travelling glints; defaults to the accent hue */
  color?: string;
  /** animation duration, e.g. "6s" */
  speed?: string;
  /** border-radius of the wrapper */
  radius?: string;
}

/**
 * React Bits StarBorder, adapted: a thin wrapper that runs two glints along the
 * top and bottom edge of whatever it wraps (keep the child's own padding /
 * background). Keyframes + `.animate-star-movement-*` live in globals.css and
 * are disabled under the reduced-motion guard.
 */
export default function StarBorder({
  children,
  className = '',
  color = 'var(--accent)',
  speed = '6s',
  radius = '9999px',
}: StarBorderProps) {
  return (
    <span
      className={`relative inline-flex overflow-hidden ${className}`}
      style={{ borderRadius: radius, padding: '1.5px' }}
    >
      <span
        aria-hidden="true"
        className="animate-star-movement-bottom pointer-events-none absolute bottom-[-11px] right-[-250%] z-0 h-1/2 w-[300%] rounded-full opacity-60"
        style={{ background: `radial-gradient(circle, ${color}, transparent 10%)`, animationDuration: speed }}
      />
      <span
        aria-hidden="true"
        className="animate-star-movement-top pointer-events-none absolute left-[-250%] top-[-10px] z-0 h-1/2 w-[300%] rounded-full opacity-60"
        style={{ background: `radial-gradient(circle, ${color}, transparent 10%)`, animationDuration: speed }}
      />
      <span className="relative z-[1] inline-flex w-full">{children}</span>
    </span>
  );
}
