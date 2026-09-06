import About from '@/components/sections/About';
import Experience from '@/components/sections/Experience';
import Hero from '@/components/sections/Hero';

export default function Home() {
  return (
    <div className="site-flow">
      <Hero />
      <About />
      <Experience />
    </div>
  );
}
