'use client';

import { useRef } from 'react';
import WorkingCharacter from '@/components/experience/WorkingCharacter';
import { EXPERIENCE } from '@/lib/constants';

/**
 * Experience.
 *
 * The character stage is sticky inside the section, so the same figure the hero
 * had you looking at stays on screen while the roles scroll past him — and the
 * clip he plays is scrubbed by that scroll, which is what turns "looking
 * around" into "sitting down and working" without a cut.
 */
export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="relative border-t border-[var(--border-subtle)] px-6 py-24 lg:px-12"
    >
      <div className="mx-auto grid w-full max-w-[1400px] gap-12 md:grid-cols-2 md:items-start md:gap-16">
        <div className="xp-stage-column md:order-2">
          <WorkingCharacter
            sectionRef={sectionRef}
            label="A 3D illustration of Ashriwad Behera at a desk, working on a laptop."
          />
        </div>

        <div className="md:order-1">
          <p className="text-xs font-medium tracking-[0.22em] text-[var(--text-secondary)] uppercase">
            Experience
          </p>

          <h2 className="mt-4 max-w-[16ch] text-3xl leading-tight font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Where I&apos;ve put it into practice
          </h2>

          <ol className="xp-timeline mt-12">
            {EXPERIENCE.map((role) => (
              <li key={`${role.company}-${role.period}`} className="xp-entry">
                <p className="xp-entry__period">
                  {role.period} · {role.location}
                </p>
                <h3 className="xp-entry__role">{role.role}</h3>
                <p className="xp-entry__company">{role.company}</p>
                {role.summary ? (
                  <p className="xp-entry__summary">{role.summary}</p>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
