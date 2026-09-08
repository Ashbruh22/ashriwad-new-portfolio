import React from 'react';
import ShinyText from '@/components/reactbits/ShinyText';
import { CONTACT, SITE_NAME } from '@/lib/constants';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = [
    { label: 'GitHub', href: CONTACT.github },
    { label: 'LinkedIn', href: CONTACT.linkedin },
    { label: 'Email', href: `mailto:${CONTACT.email}` },
  ];

  return (
    <footer className="border-t border-[var(--border-subtle)] px-6 py-10">
      <div className="mx-auto flex max-w-[68rem] flex-col items-start justify-between gap-4 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center">
        <p>
          &copy; {currentYear} <ShinyText>{SITE_NAME}</ShinyText>
        </p>
        <nav aria-label="Footer" className="flex items-center gap-5">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="transition-colors hover:text-[var(--text-primary)]"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
