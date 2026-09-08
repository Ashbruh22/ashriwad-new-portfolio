'use client';

import { Accessibility } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NAV_LINKS, RESUME_DOWNLOAD_NAME, RESUME_PATH, SITE_NAME } from '@/lib/constants';
import PillNav from '@/components/reactbits/PillNav';
import { useReducedMotion } from './ReducedMotionProvider';
import ThemeToggle from './ThemeToggle';

// Hoisted so the reference is stable across re-renders (the scroll-spy below
// re-renders Nav on every section change) — keeps PillNav's layout effect from
// needlessly re-running.
const NAV_ITEMS = NAV_LINKS.map(({ href, label }) => ({ href, label }));

export default function Nav() {
  const [activeSection, setActiveSection] = useState('#about');
  const { isReducedMotion, toggleReducedMotion } = useReducedMotion();

  useEffect(() => {
    const sections = NAV_LINKS.map(({ href }) => document.querySelector(href)).filter(
      (section): section is Element => section !== null,
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(`#${visible.target.id}`);
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  return (
    <header role="banner" className="fixed inset-x-0 top-0 z-50 bg-transparent">
      {/* Transparent, centred cluster — every control is a self-contained pill,
          so the bar floats over the content with no scrim. */}
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-3 lg:justify-center lg:gap-4">
        <PillNav
          className="min-w-0 flex-1 lg:flex-none"
          logo="/monogram.svg"
          logoAlt={`${SITE_NAME} — home`}
          logoHref="#hero"
          logoBg="transparent"
          navItemsBg="transparent"
          items={NAV_ITEMS}
          activeHref={activeSection}
          baseColor="var(--text-primary)"
          pillColor="color-mix(in oklab, var(--bg-elevated) 18%, transparent)"
          pillTextColor="var(--text-primary)"
          hoveredPillTextColor="var(--bg-base)"
          ease="power2.easeOut"
        />

        <div
          className="flex shrink-0 items-center gap-1.5 rounded-full border p-1 backdrop-blur-md"
          style={{
            background: 'color-mix(in oklab, var(--surface) 18%, transparent)',
            borderColor: 'color-mix(in oklab, var(--border-subtle) 35%, transparent)',
          }}
        >
          <button
            type="button"
            onClick={toggleReducedMotion}
            aria-pressed={isReducedMotion}
            aria-label={`${isReducedMotion ? 'Disable' : 'Enable'} reduced motion`}
            title="Reduce motion"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
              isReducedMotion
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Accessibility size={15} aria-hidden="true" />
          </button>
          <ThemeToggle />
        </div>

        <a
          href={RESUME_PATH}
          download={RESUME_DOWNLOAD_NAME}
          className="hidden shrink-0 rounded-full bg-[var(--text-primary)] px-4 py-2 text-xs font-bold text-[var(--bg-base)] transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)] sm:inline-flex"
        >
          Résumé
        </a>
      </div>
    </header>
  );
}
