'use client';

// Aceternity UI "FloatingDock", adapted: rotated to a vertical rail, re-skinned
// to the project's design tokens. The cursor-proximity magnify was removed —
// growing icons reflowed the column and shoved neighbours around on hover; the
// rail is now fixed-size with a hover tooltip only. `motion/react` →
// `framer-motion` (already a dep). Tooltips open to the right since the dock
// sits on the left edge. The mobile hamburger variant is dropped — the Footer
// carries the same links on small screens.

import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useReducedMotion } from '@/components/ui/ReducedMotionProvider';

export interface DockItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  external?: boolean;
}

const linkBase =
  'relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]';

export function FloatingDock({ items, className }: { items: DockItem[]; className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {items.map((item) => (
        <DockLink key={item.title} item={item} />
      ))}
    </div>
  );
}

function DockLink({ item }: { item: DockItem }) {
  const { isReducedMotion } = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={item.href}
      aria-label={item.title}
      {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={linkBase}
    >
      <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>

      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={isReducedMotion ? { opacity: 1 } : { opacity: 0, x: -6, y: '-50%' }}
            animate={{ opacity: 1, x: 0, y: '-50%' }}
            exit={isReducedMotion ? { opacity: 0 } : { opacity: 0, x: -6, y: '-50%' }}
            className="pointer-events-none absolute left-full top-1/2 ml-3 w-fit whitespace-pre rounded-md border border-[var(--border-subtle)] bg-[var(--surface)] px-2 py-0.5 text-xs text-[var(--text-primary)]"
          >
            {item.title}
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  );
}
