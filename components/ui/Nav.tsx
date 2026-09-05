'use client';

import { useEffect, useState } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useReducedMotionPreference } from '@/components/ui/ReducedMotionProvider';
import { CONTACT, SITE_NAME } from '@/lib/constants';

/** Sections that actually exist on the page — nothing here scrolls to a stub. */
const LINKS = [{ href: '#about', label: 'About' }] as const;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { reduced, toggle } = useReducedMotionPreference();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 transition-colors duration-200',
        scrolled
          ? 'border-b border-[var(--border-subtle)] bg-[color-mix(in_oklab,var(--bg-base)_80%,transparent)] backdrop-blur-md'
          : 'border-b border-transparent',
      ].join(' ')}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-6 lg:px-12"
      >
        <a
          href="#home"
          className="text-sm font-semibold tracking-tight text-[var(--text-primary)]"
        >
          {SITE_NAME.split(' ')[0].toLowerCase()}
          <span className="text-[var(--hero-accent)]">.dev</span>
        </a>

        <div className="flex items-center gap-1 sm:gap-2">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center px-3 text-xs font-medium tracking-[0.16em] text-[var(--text-secondary)] uppercase transition-colors hover:text-[var(--text-primary)]"
            >
              {link.label}
            </a>
          ))}
          <a
            href={`mailto:${CONTACT.email}`}
            className="flex min-h-11 items-center px-3 text-xs font-medium tracking-[0.16em] text-[var(--text-secondary)] uppercase transition-colors hover:text-[var(--text-primary)]"
          >
            Contact
          </a>

          <button
            type="button"
            onClick={toggle}
            aria-pressed={reduced}
            className="ml-1 hidden h-8 items-center rounded-full border border-[var(--border-subtle)] px-3 text-[0.65rem] font-medium tracking-[0.14em] text-[var(--text-secondary)] uppercase transition-colors hover:text-[var(--text-primary)] sm:flex"
          >
            {reduced ? 'Motion off' : 'Motion on'}
          </button>

          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
