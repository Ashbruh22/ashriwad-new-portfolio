import { CONTACT, SITE_NAME, SITE_ROLE } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)]">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4 px-6 py-10 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center sm:justify-between lg:px-12">
        <p>
          <span className="text-[var(--text-primary)]">{SITE_NAME}</span> — {SITE_ROLE}
        </p>
        <ul className="flex flex-wrap gap-5">
          <li>
            <a className="link-underline" href={CONTACT.github} target="_blank" rel="noreferrer noopener">
              GitHub
            </a>
          </li>
          <li>
            <a className="link-underline" href={CONTACT.linkedin} target="_blank" rel="noreferrer noopener">
              LinkedIn
            </a>
          </li>
          <li>
            <a className="link-underline" href={`mailto:${CONTACT.email}`}>
              Email
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
