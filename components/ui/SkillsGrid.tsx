'use client';

import React from 'react';
import { BrainCircuit, Cloud, Code2, Database, Layers, ShieldCheck } from 'lucide-react';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import AnimatedContent from '@/components/reactbits/AnimatedContent';
import type { SkillGroup } from '@/lib/skills';

/** Per-category icon, keyed by `lib/skills.ts`'s group ids — a presentation
 * concern, so it lives here rather than in the data file (same split as
 * Experience's violet hex living in the component, not lib/experience.ts). */
const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  languages: Code2,
  frameworks: Layers,
  'ai-ml': BrainCircuit,
  'backend-db': Database,
  'cloud-devops': Cloud,
  'security-practices': ShieldCheck,
};

interface SkillsGridProps {
  groups: SkillGroup[];
}

/**
 * Interactive replacement for the old auto-scrolling skill marquee: one
 * spotlight card per category (cursor-tracked glow via the shared
 * `SpotlightCard`, same component About/Certifications already use). Pills
 * are collapsed by default and fan in on hover/focus — but only on devices
 * that can genuinely hover (`@media (hover:hover) and (pointer:fine)` in
 * globals.css); touch devices and the site's reduced-motion toggle both
 * render every pill already open, no gesture required. See globals.css's
 * `.skill-card-trigger` / `.skill-pills-wrap` / `.skill-pill` rules.
 *
 * The card is a real `<button>`, not a `div` with a manual `tabIndex` — a
 * non-interactive element carrying a manual tabIndex trips
 * eslint-config-next's bundled jsx-a11y rules, and a button gives keyboard/
 * switch-access users the same reveal (via `:focus-visible`) that mouse
 * users get via `:hover`, for free, with no onClick needed.
 */
export default function SkillsGrid({ groups }: SkillsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {groups.map((group, index) => {
        const Icon = ICONS[group.id];
        return (
          <AnimatedContent key={group.id} delay={index * 0.05} distance={24}>
            <SpotlightCard className="skill-card glass-card">
              <button type="button" className="skill-card-trigger flex w-full flex-col text-left">
                <span className="flex w-full items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    {Icon && <Icon size={16} className="text-[var(--text-secondary)]" />}
                    <span className="font-display text-sm font-semibold text-[var(--text-primary)]">
                      {group.label}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-[var(--text-secondary)]">
                    {group.skills.length} skills
                  </span>
                </span>

                <span className="skill-pills-wrap mt-3 grid w-full">
                  <span className="flex flex-wrap gap-2 overflow-hidden">
                    {group.skills.map((skill, i) => (
                      <span
                        key={skill}
                        className="skill-pill whitespace-nowrap rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs text-[var(--text-primary)]"
                        style={{ transitionDelay: `${i * 25}ms` }}
                      >
                        {skill}
                      </span>
                    ))}
                  </span>
                </span>
              </button>
            </SpotlightCard>
          </AnimatedContent>
        );
      })}
    </div>
  );
}
