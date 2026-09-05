'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * ThemeToggle
 *
 * Switches between light and dark mode using next-themes.
 * Uses a mounted guard to prevent hydration mismatch (next-themes
 * requires the client to resolve the theme before rendering icons).
 *
 * Note: The "Reduce Motion" toggle is a separate component
 * scheduled for Phase 2 (Nav build-out), per the accessibility
 * requirements in PROJECT_REQUIREMENTS.md §8.
 */
export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Render an invisible placeholder during SSR / before hydration
  // to prevent layout shift
  if (!mounted) {
    return <div className="h-8 w-8 rounded-full" aria-hidden="true" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      id="theme-toggle"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="
        relative flex h-8 w-8 items-center justify-center rounded-full
        text-[var(--text-secondary)] transition-colors
        hover:text-[var(--text-primary)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]
      "
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1 }}
            exit={{    opacity: 0, rotate:  90, scale: 0.6 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute"
          >
            <Sun size={16} strokeWidth={2} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 90,  scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0,   scale: 1 }}
            exit={{    opacity: 0, rotate: -90, scale: 0.6 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="absolute"
          >
            <Moon size={16} strokeWidth={2} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
