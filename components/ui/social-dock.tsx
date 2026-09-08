'use client';

import { Mail } from 'lucide-react';
import { FloatingDock, type DockItem } from '@/components/ui/floating-dock';
import { GithubGlyph, InstagramGlyph, LinkedinGlyph } from '@/components/ui/brand-icons';
import { CONTACT } from '@/lib/constants';

const items: DockItem[] = [
  { title: 'GitHub', href: CONTACT.github, external: true, icon: <GithubGlyph /> },
  { title: 'LinkedIn', href: CONTACT.linkedin, external: true, icon: <LinkedinGlyph /> },
  { title: 'Email', href: `mailto:${CONTACT.email}`, icon: <Mail strokeWidth={1.75} className="h-full w-full" /> },
  { title: 'Instagram', href: CONTACT.instagram, external: true, icon: <InstagramGlyph /> },
];

/**
 * Fixed vertical social rail, bottom-left. Desktop only — the Footer carries the
 * same links on mobile. Decorative-adjacent but real navigation, so it is a
 * labelled landmark.
 */
export default function SocialDock() {
  return (
    <nav aria-label="Social links" className="fixed bottom-16 left-6 z-40 hidden md:block">
      <FloatingDock items={items} />
    </nav>
  );
}
