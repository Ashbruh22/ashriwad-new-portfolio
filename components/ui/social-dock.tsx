import { Mail } from 'lucide-react';
import { CONTACT } from '@/lib/constants';

/**
 * Fixed vertical rail of profile links, pinned to the left edge on wide
 * screens only (below `lg` it would sit on top of the hero copy — the same
 * links live in the footer for those viewports).
 *
 * lucide-react v1 dropped its brand marks, so GitHub and LinkedIn are inline
 * paths rather than icon components.
 */
const GithubMark = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.2c-3.34.73-4.04-1.42-4.04-1.42-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.73.08-.73 1.21.09 1.85 1.25 1.85 1.25 1.07 1.85 2.81 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.62-2.8 5.64-5.48 5.94.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .5Z" />
  </svg>
);

const LinkedinMark = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.42v1.56h.05a3.75 3.75 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
  </svg>
);

const SOCIALS = [
  { href: CONTACT.github, label: 'GitHub', Icon: GithubMark },
  { href: CONTACT.linkedin, label: 'LinkedIn', Icon: LinkedinMark },
  { href: `mailto:${CONTACT.email}`, label: 'Email', Icon: () => <Mail size={18} strokeWidth={2} /> },
] as const;

export default function SocialDock() {
  return (
    <div className="fixed bottom-8 left-6 z-40 hidden lg:block">
      <ul className="flex flex-col items-center gap-1">
        {SOCIALS.map(({ href, label, Icon }) => (
          <li key={label}>
            <a
              href={href}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel={href.startsWith('mailto:') ? undefined : 'noreferrer noopener'}
              aria-label={label}
              className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:text-[var(--hero-accent)]"
            >
              <Icon />
            </a>
          </li>
        ))}
      </ul>
      <span aria-hidden="true" className="mx-auto mt-2 block h-16 w-px bg-[var(--border-subtle)]" />
    </div>
  );
}
