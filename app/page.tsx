import About from '@/components/sections/About';
import Certifications from '@/components/sections/Certifications';
import Contact from '@/components/sections/Contact';
import Experience from '@/components/sections/Experience';
import FeaturedProjects from '@/components/sections/FeaturedProjects';
import Hero from '@/components/sections/Hero';
import ProjectGrid from '@/components/sections/ProjectGrid';
import Skills from '@/components/sections/Skills';

export default function Home() {
  return (
    <div className="site-flow">
      <Hero />
      <About />
      <Experience />
      <FeaturedProjects />
      <ProjectGrid />
      <Skills />
      <Certifications />
      <Contact />
    </div>
  );
}
