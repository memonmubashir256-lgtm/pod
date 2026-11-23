import React, { useEffect, useState } from 'react';
import { Download, Menu, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  onOpenInstallGuide: () => void;
}

const NAV_LINKS = [
  { label: 'Showcase', href: '#showcase' },
  { label: 'Collection', href: '#collection' },
  { label: 'Features', href: '#features' },
  { label: 'Craft', href: '#about' },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenInstallGuide }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isInstallable, isInstalled, install } = usePWAInstall();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const handlePrimaryAction = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    onOpenInstallGuide();
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 h-16 transition-colors duration-200 ${
        scrolled
          ? 'bg-[#050505]/92 border-b border-white/10'
          : 'bg-gradient-to-b from-[#050505]/85 to-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between gap-8 px-6">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="#hero"
          className="font-display text-lg font-bold tracking-[0.22em] text-white whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51F4E8] rounded"
        >
          VALENCE
        </a>

        {/* Zone 2: 4 Concise Single-Line Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/75 hover:text-white transition-colors whitespace-nowrap shrink-0 relative py-1 after:absolute after:left-0 after:bottom-0 after:h-[1px] after:w-0 after:bg-[#51F4E8] hover:after:w-full after:transition-all after:duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51F4E8] rounded"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action (+ mobile menu trigger on small screens) */}
        <div className="flex items-center gap-3 shrink-0">
          {isInstalled ? (
            <a
              href="#collection"
              className="hidden md:inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51F4E8]"
            >
              Explore Vaults
            </a>
          ) : (
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="hidden md:inline-flex items-center gap-2 rounded-lg border border-[#B44CFF]/50 bg-gradient-to-r from-[#426BFF] to-[#B44CFF] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110 transition whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51F4E8]"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Install App</span>
            </button>
          )}

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex md:hidden h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-[#101014] text-white hover:border-[#B44CFF]/60 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51F4E8]"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-label="Mobile navigation"
          className="md:hidden fixed inset-x-0 top-16 bottom-0 z-40 bg-[#050505]/98 border-t border-white/10 px-6 py-8 flex flex-col justify-between"
        >
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[48px] items-center justify-between rounded-xl border border-white/10 bg-[#101014] px-4 text-base font-medium text-white hover:border-[#51F4E8]/50 transition-colors"
              >
                <span>{link.label}</span>
                <span className="text-xs text-white/45 font-mono">Go</span>
              </a>
            ))}
          </nav>

          <div className="pt-6 border-t border-white/10">
            {!isInstalled && (
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  handlePrimaryAction();
                }}
                className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#426BFF] to-[#B44CFF] px-5 py-3 text-sm font-semibold text-white cursor-pointer"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                <span>Install VALENCE App</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
