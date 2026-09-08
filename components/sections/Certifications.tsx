'use client';

import React from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import AnimatedContent from '@/components/reactbits/AnimatedContent';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import { certifications, leadership } from '@/lib/skills';

export default function Certifications() {
  const certs = certifications.filter((cert) => cert.type === 'cert');

  return (
    <section
      id="certifications"
      aria-labelledby="certifications-heading"
      className="mx-auto max-w-[68rem] px-6 py-16 md:py-24"
    >
      <SectionHeader
        eyebrow="Credentials"
        id="certifications-heading"
        className="mb-14"
        description="Verified technical certifications, hackathon leadership, and club involvement."
      >
        Certifications &amp; hackathons
      </SectionHeader>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div>
          <AnimatedContent distance={16}>
            <h3 className="text-sm text-[var(--text-secondary)]">
              Certifications
            </h3>
          </AnimatedContent>
          <ul className="mt-4 flex flex-col divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {certs.map((cert, index) => (
              <li key={cert.id}>
                <AnimatedContent delay={0.05 + index * 0.04} distance={16}>
                  <div className="flex items-baseline justify-between gap-4 py-3">
                    <span className="text-sm text-[var(--text-primary)]">{cert.title}</span>
                    <span className="shrink-0 text-xs text-[var(--text-secondary)]">{cert.issuer}</span>
                  </div>
                </AnimatedContent>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <AnimatedContent distance={16}>
            <h3 className="text-sm text-[var(--text-secondary)]">
              Hackathons &amp; activities
            </h3>
          </AnimatedContent>
          <div className="mt-4 flex flex-col gap-3">
            {leadership.map((item, index) => (
              <AnimatedContent key={item.id} delay={index * 0.05} distance={24}>
                <SpotlightCard className="glass-card p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h4 className="font-display text-sm font-semibold text-[var(--text-primary)]">
                      {item.role}
                    </h4>
                  </div>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{item.event}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {item.description}
                  </p>
                </SpotlightCard>
              </AnimatedContent>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
