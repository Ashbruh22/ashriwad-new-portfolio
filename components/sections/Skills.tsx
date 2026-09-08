'use client';

import React from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import SkillsGrid from '@/components/ui/SkillsGrid';
import { skillGroups } from '@/lib/skills';

export default function Skills() {
  return (
    <section
      id="skills"
      aria-labelledby="skills-heading"
      className="mx-auto max-w-[68rem] px-6 py-16 md:py-24"
    >
      <SectionHeader
        eyebrow="Skills"
        id="skills-heading"
        className="mb-14"
        description="Full-stack architectures, machine-learning frameworks, data pipelines, and security practices."
      >
        Technical proficiency
      </SectionHeader>

      <SkillsGrid groups={skillGroups} />
    </section>
  );
}
