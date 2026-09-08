'use client';

import React from 'react';
import { ArrowUpRight, Download, Mail, Send, Sparkles } from 'lucide-react';
import SectionHeader from '@/components/ui/SectionHeader';
import AnimatedContent from '@/components/reactbits/AnimatedContent';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import StarBorder from '@/components/reactbits/StarBorder';
import GlareHover from '@/components/reactbits/GlareHover';
import { GithubGlyph, InstagramGlyph, LinkedinGlyph } from '@/components/ui/brand-icons';
import { CONTACT, RESUME_DOWNLOAD_NAME, RESUME_PATH } from '@/lib/constants';

// Redesigned per a reference screenshot the user shared: a two-column
// layout (a "get in touch" card on the left, individual contact-method
// cards on the right) instead of the previous flat divided list. Also
// swaps Phone for Instagram per that request — unlike this codebase's
// usual "keep unused things defined" precedent, `CONTACT.phone` itself
// was removed outright (not just unlinked) during a security pass: it's a
// real personal number, and unlike the résumé PDF (which got the number
// genuinely redacted before this repo went public) a plain string
// constant has no equivalent redaction — it would sit in plaintext in the
// public GitHub history for as long as it stayed defined, used or not.
const links = [
  { label: 'Email', value: CONTACT.email, href: `mailto:${CONTACT.email}`, icon: <Mail size={18} strokeWidth={1.75} /> },
  { label: 'Instagram', value: 'instagram.com/ashriwad_behera', href: CONTACT.instagram, external: true, icon: <InstagramGlyph /> },
  { label: 'GitHub', value: 'github.com/Ashbruh22', href: CONTACT.github, external: true, icon: <GithubGlyph /> },
  { label: 'LinkedIn', value: 'linkedin.com/in/ashriwad-behera', href: CONTACT.linkedin, external: true, icon: <LinkedinGlyph /> },
];

function IconBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)]">
      <span className="flex h-[18px] w-[18px] items-center justify-center">{children}</span>
    </span>
  );
}

export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="mx-auto max-w-[68rem] px-6 py-16 md:py-24"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div className="flex flex-col">
          <SectionHeader
            eyebrow="Contact"
            id="contact-heading"
            description="Open to full-time roles and opportunities."
          >
            Let&apos;s work together
          </SectionHeader>

          <AnimatedContent delay={0.1} distance={20} className="mt-8 flex-1">
            <SpotlightCard className="glass-card flex h-full flex-col p-6">
              <div className="flex items-start gap-4">
                <IconBadge>
                  <Send size={18} strokeWidth={1.75} />
                </IconBadge>
                <div>
                  <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                    Have a project in mind?
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                    I&apos;m always excited to work on meaningful problems and build impactful
                    solutions.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--border-subtle)] pt-6">
                <StarBorder>
                  <a
                    href={`mailto:${CONTACT.email}?subject=Opportunity`}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--text-primary)] px-5 py-2.5 text-sm font-medium text-[var(--bg-base)] transition-opacity hover:opacity-90"
                  >
                    Send a message
                    <ArrowUpRight size={15} />
                  </a>
                </StarBorder>
                <GlareHover>
                  <a
                    href={RESUME_PATH}
                    download={RESUME_DOWNLOAD_NAME}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] px-5 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--text-secondary)]"
                  >
                    <Download size={15} />
                    Download résumé
                  </a>
                </GlareHover>
              </div>
            </SpotlightCard>
          </AnimatedContent>
        </div>

        <div className="flex flex-col gap-4">
          {links.map((link, index) => (
            <AnimatedContent key={link.label} delay={index * 0.05} distance={20}>
              <SpotlightCard className="glass-card p-5">
                <a
                  href={link.href}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="group flex items-center gap-4"
                >
                  <IconBadge>{link.icon}</IconBadge>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-sm font-semibold text-[var(--text-primary)]">
                      {link.label}
                    </span>
                    <span className="block truncate text-sm text-[var(--text-secondary)]">
                      {link.value}
                    </span>
                  </span>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors group-hover:text-[var(--text-primary)]">
                    <ArrowUpRight
                      size={15}
                      className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </span>
                </a>
              </SpotlightCard>
            </AnimatedContent>
          ))}
        </div>
      </div>

      <AnimatedContent delay={0.3} distance={20} className="mt-6">
        <SpotlightCard className="glass-card p-6">
          <div className="flex items-start gap-4">
            <IconBadge>
              <Sparkles size={18} strokeWidth={1.75} />
            </IconBadge>
            <div>
              <h4 className="font-display text-sm font-semibold text-[var(--text-primary)]">
                Prefer email?
              </h4>
              <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                Drop me a message at{' '}
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="text-[var(--text-primary)] underline-offset-4 hover:underline"
                >
                  {CONTACT.email}
                </a>
                . I&apos;ll get back to you as soon as possible.
              </p>
            </div>
          </div>
        </SpotlightCard>
      </AnimatedContent>
    </section>
  );
}
