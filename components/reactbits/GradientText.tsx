'use client';

import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  /** render element — defaults to a span so it can sit inside headings/links */
  as?: React.ElementType;
  /** kept for API compatibility with old call sites; palette is token-driven */
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

/**
 * React Bits GradientText, adapted to the site's palette. A mono base with an
 * accent → accent-2 sheen panning through it (`.rb-gradient-text`, defined in
 * globals.css). The looping animation is disabled by the
 * `[data-reduced-motion="true"]` guard, which also drops the clip so the text
 * falls back to a solid colour.
 */
export default function GradientText({
  children,
  className = '',
  as: Tag = 'span',
}: GradientTextProps) {
  return <Tag className={`rb-gradient-text ${className}`}>{children}</Tag>;
}
