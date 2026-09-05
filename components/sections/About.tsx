import { EDUCATION, SITE_DESCRIPTION, SITE_ROLE } from '@/lib/constants';

/**
 * A short landing pad under the hero — it gives the hero's "About me" CTA and
 * the nav link somewhere real to scroll to. The full section set from
 * PROJECT_REQUIREMENTS.md (experience, projects, skills, certifications,
 * contact) is not built yet.
 */
export default function About() {
  return (
    <section
      id="about"
      className="relative border-t border-[var(--border-subtle)] px-6 py-24 lg:px-12"
    >
      <div className="mx-auto grid w-full max-w-[1400px] gap-10 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
        <p className="text-xs font-medium tracking-[0.22em] text-[var(--text-secondary)] uppercase">
          About
        </p>

        <div className="max-w-[65ch]">
          <p className="text-xl leading-relaxed text-[var(--text-primary)] sm:text-2xl">
            {SITE_DESCRIPTION}
          </p>

          <dl className="mt-10 grid gap-6 border-t border-[var(--border-subtle)] pt-8 sm:grid-cols-3">
            <div>
              <dt className="text-xs tracking-[0.14em] text-[var(--text-secondary)] uppercase">
                Focus
              </dt>
              <dd className="mt-1.5 text-sm text-[var(--text-primary)]">{SITE_ROLE}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.14em] text-[var(--text-secondary)] uppercase">
                Studying
              </dt>
              <dd className="mt-1.5 text-sm text-[var(--text-primary)]">
                {EDUCATION.degree}
                <span className="block text-[var(--text-secondary)]">
                  {EDUCATION.institution}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.14em] text-[var(--text-secondary)] uppercase">
                Based in
              </dt>
              <dd className="mt-1.5 text-sm text-[var(--text-primary)]">{EDUCATION.location}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
