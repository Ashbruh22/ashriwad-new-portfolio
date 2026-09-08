'use client';

import React from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import AnimatedContent from '@/components/reactbits/AnimatedContent';
import SpotlightCard from '@/components/reactbits/SpotlightCard';
import { gridProjects } from '@/lib/projects';
import { ArrowUpRight } from 'lucide-react';

export default function ProjectGrid() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-grid-heading"
      className="mx-auto max-w-[68rem] px-6 py-16 md:py-24"
    >
      <SectionHeader
        eyebrow="More work"
        id="projects-grid-heading"
        className="mb-14"
        description="Cloud cost intelligence, deep-learning NLP, and embedded computer vision."
      >
        Selected systems &amp; prototypes
      </SectionHeader>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gridProjects.map((project, index) => (
          <AnimatedContent key={project.id} delay={index * 0.05} distance={30} className="h-full">
            <SpotlightCard className="glass-card flex h-full flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-base font-semibold text-[var(--text-primary)]">
                  {project.title}
                </h3>
                {project.links.github && (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View the GitHub repository for ${project.title}`}
                    className="shrink-0 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                  >
                    <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
              <p className="mt-1 text-xs text-[var(--text-secondary)]">{project.tagline}</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                {project.description}
              </p>

              <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </SpotlightCard>
          </AnimatedContent>
        ))}
      </div>
    </section>
  );
}
