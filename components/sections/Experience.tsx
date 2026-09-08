'use client';

import React from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import AnimatedContent from '@/components/reactbits/AnimatedContent';
import { experience } from '@/lib/experience';

// Editorial timeline redesign (ref: a career-timeline screenshot the user
// shared) — centered section title, then a three-column row per entry: role
// on the left, a big year on a glowing thread in the middle, description on
// the right. Chronological ascending (oldest → newest, top → bottom) rather
// than the data's resume-order (newest-first) so the glowing terminus dot at
// the bottom reads as "most recent", matching the reference's flow toward
// "now". The three columns are fixed-width (role/year) + flexible
// (description) rather than fr-proportional, specifically so the line's
// absolute `left` offset lands on the same x at every viewport width — a
// proportional column would drift the boundary as the container resizes.
const timeline = [...experience].reverse();

const LINE_COLOR = '#8b5cf6'; // violet-500 — matches the Hero name gradient's first stop
const GLOW_COLOR = '#a78bfa'; // violet-400 — lighter, for the glow itself
const ROLE_COL = '16rem';
const YEAR_COL = '6rem';
const LINE_OFFSET = `calc(${ROLE_COL} + ${YEAR_COL})`;

function yearOf(dateStr: string) {
  return new Date(dateStr).getFullYear();
}

export default function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-heading"
      className="mx-auto max-w-[68rem] px-6 py-16 md:py-24"
    >
      <SectionHeader
        id="experience-heading"
        align="center"
        className="mb-16"
        titleClassName="text-4xl sm:text-5xl md:text-[3.75rem]"
      >
        My career &amp; experience
      </SectionHeader>

      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute top-2 bottom-2 hidden w-px lg:block"
          style={{
            left: LINE_OFFSET,
            background: `linear-gradient(to bottom, color-mix(in oklab, ${LINE_COLOR} 25%, transparent), ${LINE_COLOR})`,
          }}
        />

        <div className="flex flex-col gap-14">
          {timeline.map((entry, index) => {
            const isLatest = index === timeline.length - 1;
            return (
              <AnimatedContent key={entry.id} delay={index * 0.06} distance={28}>
                <div
                  className="flex flex-col gap-2 lg:grid lg:items-center lg:gap-8"
                  style={{ gridTemplateColumns: `${ROLE_COL} ${YEAR_COL} 1fr` }}
                >
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl">
                      {entry.role}
                    </h3>
                    <p className="mt-1 text-sm font-medium" style={{ color: LINE_COLOR }}>
                      {entry.company}
                    </p>
                  </div>

                  <div className="relative flex items-baseline gap-3 lg:block">
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 right-[-5px] hidden h-2.5 w-2.5 -translate-y-1/2 rounded-full lg:block"
                      style={
                        isLatest
                          ? {
                              background: GLOW_COLOR,
                              boxShadow: `0 0 0 6px color-mix(in oklab, ${GLOW_COLOR} 22%, transparent), 0 0 18px 2px color-mix(in oklab, ${GLOW_COLOR} 65%, transparent)`,
                            }
                          : { background: 'var(--text-secondary)' }
                      }
                    />
                    <span className="font-display text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
                      {yearOf(entry.startDate)}
                    </span>
                    <span className="text-xs text-[var(--text-secondary)] lg:hidden">{entry.period}</span>
                  </div>

                  <p className="max-w-2xl text-sm leading-relaxed text-[var(--text-secondary)]">
                    {entry.summary}
                  </p>
                </div>
              </AnimatedContent>
            );
          })}
        </div>
      </div>
    </section>
  );
}
