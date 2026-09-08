'use client';

import React from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import FadeContent from '@/components/reactbits/FadeContent';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import ProfileCard from '@/components/reactbits/ProfileCard';
import { CONTACT, EDUCATION, SITE_NAME, SITE_ROLE } from '@/lib/constants';

const facts = [
  { label: 'Education', value: EDUCATION.degree, sub: `${EDUCATION.institution} · ${EDUCATION.period.replace(' (Expected)', '')}` },
  { label: 'CGPA', value: EDUCATION.cgpa, sub: 'Cumulative, across 6 semesters' },
  { label: 'Focus', value: 'Production AI & full-stack', sub: 'Explainable ML, agentic systems, microservices' },
];

const focusAreas = [
  {
    title: 'Explainable & quantized AI',
    desc: 'Local quantized LLM deployment (Phi-3-Mini via llama.cpp), SHAP feature attribution, and compliance-first clinical NLP.',
  },
  {
    title: 'Agentic decision systems',
    desc: 'Dual-model real-time scoring (XGBoost + LSTM) coupled with rule-based agentic workflows and automated CRM actions.',
  },
  {
    title: 'Resilient microservices',
    desc: 'Containerized offline architectures (FastAPI, Redis, Docker), OCR processing pipelines, and FHIR-standard integrations.',
  },
];

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="mx-auto max-w-[68rem] px-6 py-16 md:py-24"
    >
      <SectionHeader eyebrow="About" id="about-heading" className="mb-14">
        Engineering practical AI pipelines with a build-first mindset
      </SectionHeader>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
        <div className="flex flex-col gap-5 text-base leading-relaxed text-[var(--text-secondary)]">
          <FadeContent>
            <p>
              I&apos;m a{' '}
              <strong className="font-medium text-[var(--text-primary)]">B.Tech Computer Science &amp; Engineering student specializing in AI &amp; ML</strong>{' '}
              at SRM Institute of Science and Technology, Chennai (2023–2027, CGPA 8.45/10.0).
            </p>
          </FadeContent>
          <FadeContent delay={0.05}>
            <p>
              I&apos;m a{' '}
              <strong className="font-medium text-[var(--text-primary)]">build-first developer</strong> who
              enjoys turning ideas into working products. I build across AI/ML, full-stack
              development, and intelligent applications — combining models, APIs, databases, and
              interfaces into complete, end-to-end systems.
            </p>
          </FadeContent>
          <FadeContent delay={0.1}>
            <p>
              I&apos;m curious about how technology can solve real-world problems, and I&apos;m
              always experimenting, learning, and building something new — from explainable AI and
              agentic decision systems to quantized edge / offline NLP, localized medical
              summarization pipelines, and multi-layered CRM intelligence systems.
            </p>
          </FadeContent>
          <FadeContent delay={0.15}>
            <p className="font-medium text-[var(--text-primary)]">
              I like learning by building — and building things that matter.
            </p>
          </FadeContent>

          <FadeContent delay={0.2} className="mt-4 flex flex-col divide-y divide-[var(--border-subtle)] border-y border-[var(--border-subtle)]">
            {focusAreas.map((area) => (
              <div key={area.title} className="py-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">{area.title}</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{area.desc}</p>
              </div>
            ))}
          </FadeContent>
        </div>

        <FadeContent delay={0.1} className="flex justify-center lg:justify-end">
          <ProfileCard
            avatarUrl="/avatar.png"
            name={SITE_NAME}
            title={SITE_ROLE}
            handle={CONTACT.github.split('/').pop()}
            status="Open to work"
            contactText="Get in touch"
            showUserInfo
            showDetails={false}
            enableTilt
            enableMobileTilt={false}
            behindGlowEnabled={false}
            // holo shine + cursor glare, back on. Grayscale sweep (not the
            // component's default rainbow) to match the card's black-and-
            // white theme — a range of lightness values, not one flat grey,
            // so the sweep still reads as a moving metallic sheen rather
            // than a static tint. (A grayscale version was tried once
            // before and pulled for reading as an ugly grey cast — that was
            // compounded by the innerGradient white-sheen bug fixed above;
            // with that gone, this reads as a clean silver holographic
            // sweep instead.)
            shineEnabled
            holoColors={['hsl(0,0%,88%)', 'hsl(0,0%,60%)', 'hsl(0,0%,92%)', 'hsl(0,0%,50%)', 'hsl(0,0%,78%)', 'hsl(0,0%,40%)']}
            // the previous faint white sheen (rgba(255,255,255,0.05) at a
            // 145deg angle) read as a visible lighter grey-blue patch across
            // the top of the card against the pure black background/photo
            // — "none" drops the overlay entirely so the card is one flat
            // solid black, matching the colour behind the portrait exactly.
            innerGradient="none"
            onContactClick={() =>
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          />
        </FadeContent>
      </div>

      <FadeContent delay={0.2} className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {facts.map((fact) => (
          <SpotlightCard key={fact.label} className="glass-card p-5">
            <span className="text-xs text-[var(--text-secondary)]">{fact.label}</span>
            <div className="mt-1.5 font-display text-lg font-semibold text-[var(--text-primary)]">
              {fact.value}
            </div>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{fact.sub}</p>
          </SpotlightCard>
        ))}
      </FadeContent>
    </section>
  );
}
