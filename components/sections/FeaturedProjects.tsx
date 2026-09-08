'use client';

import React from 'react';
import SectionHeader from '@/components/ui/SectionHeader';
import AnimatedContent from '@/components/reactbits/AnimatedContent';
import { ProjectCarousel } from '@/components/ui/project-carousel';
import { featuredProjects } from '@/lib/projects';

export default function FeaturedProjects() {
  return (
    <section
      id="featured-projects"
      aria-labelledby="featured-projects-heading"
      className="mx-auto max-w-[68rem] px-6 py-16 md:py-24"
    >
      <SectionHeader
        eyebrow="Featured projects"
        id="featured-projects-heading"
        className="mb-14"
        description="Production-grade machine learning pipelines, peer-reviewed architectures, and offline-capable edge systems."
      >
        Two systems, built end to end
      </SectionHeader>

      <AnimatedContent distance={32}>
        <ProjectCarousel projects={featuredProjects} />
      </AnimatedContent>
    </section>
  );
}
