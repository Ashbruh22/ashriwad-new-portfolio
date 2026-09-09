'use client';

import React from 'react';

interface ShinyTextProps {
  children: React.ReactNode;
  className?: string;
  /** kept for API compatibility with old call sites */
  shimmerWidth?: number;
  speed?: number;
}

/**
 * React Bits ShinyText, adapted: an accent-2 shimmer sweeps once per cycle
 * across text that otherwise keeps its `currentColor`. Styling lives in
 * `.rb-shiny-text` (globals.css); the sweep is disabled under the
 * `[data-reduced-motion="true"]` guard.
 */
export default function ShinyText({ children, className = '' }: ShinyTextProps) {
  return <span className={`rb-shiny-text ${className}`}>{children}</span>;
}
