import React from 'react';
import { Accessibility, Mail, MapPin } from 'lucide-react';

interface FooterSectionProps {
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onOpenLegal: (doc: 'privacy' | 'terms') => void;
  onOpenInstallGuide: () => void;
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  reducedMotion,
  onToggleReducedMotion,
  onOpenLegal,
  onOpenInstallGuide,
}) => {
  return (
    <footer className="border-t border-white/10 bg-[#050505] py-14">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <a
              href="#hero"
              className="font-display text-xl font-bold tracking-[0.22em] text-white"
            >
              VALENCE
            </a>
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/60">
              Precision-machined hermetic preservation capsules engineered in Zurich for pure
              aromatic retention.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onOpenInstallGuide}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/85 hover:border-[#51F4E8]/60 hover:text-white transition cursor-pointer"
              >
                Install PWA
              </button>
              <button
                type="button"
                onClick={onToggleReducedMotion}
                aria-pressed={reducedMotion}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/85 hover:border-[#B44CFF]/60 hover:text-white transition cursor-pointer"
              >
                <Accessibility className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{reducedMotion ? 'Motion: Reduced' : 'Motion: Full'}</span>
              </button>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-mono tracking-wider text-white/50">NAVIGATION</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              <li>
                <a href="#showcase" className="hover:text-white transition-colors">
                  3D Showcase
                </a>
              </li>
              <li>
                <a href="#collection" className="hover:text-white transition-colors">
                  Collection
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Special Features
                </a>
              </li>
              <li>
                <a href="#gallery" className="hover:text-white transition-colors">
                  Studio Gallery
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-mono tracking-wider text-white/50">STUDIO CONTACT</h3>
            <ul className="mt-3 space-y-2.5 text-sm text-white/75">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#51F4E8] shrink-0" aria-hidden="true" />
                <a
                  href="mailto:studio@valence-vault.example"
                  className="hover:text-white transition-colors"
                >
                  studio@valence-vault.example
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#B44CFF] shrink-0" aria-hidden="true" />
                <span>Hardturmstrasse 161, Zurich</span>
              </li>
            </ul>
          </div>

          {/* Legal & Social */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-mono tracking-wider text-white/50">LEGAL</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} VALENCE Atelier. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <a href="#hero" className="hover:text-white transition-colors">
              Instagram
            </a>
            <a href="#showcase" className="hover:text-white transition-colors">
              YouTube
            </a>
            <a href="#newsletter" className="hover:text-white transition-colors">
              Dispatch
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
