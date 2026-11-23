import React from 'react';
import { ArrowRight } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="relative py-20 sm:py-24 bg-[#050505] overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Editorial Philosophy & Vision/Promise Split */}
          <div className="lg:col-span-7">
            <p className="text-xs font-mono tracking-[0.2em] text-[#B44CFF]">
              06 · STUDIO PHILOSOPHY
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-bold leading-tight text-white [text-wrap:balance]">
              Designed for Pure Preservation
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75">
              We craft pocket-scale preservation vessels with the optical precision of mechanical
              timepieces—merging acoustic validation with museum-grade hermetic isolation.
            </p>

            <div className="mt-10 grid sm:grid-cols-2 gap-8 pt-8 border-t border-white/10">
              <div>
                <h3 className="font-display text-lg font-semibold text-white">Our Vision</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/70">
                  Replace disposable plastic containers with machined architectural vessels built to
                  preserve volatile botanical and roast aromatics indefinitely without odor bleed.
                </p>
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold text-white">Our Promise</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/70">
                  Every VALENCE cylinder undergoes pressure-decay testing in our Zurich workshop and
                  carries a lifetime guarantee on replaceable medical-grade silicone seals.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <a
                href="#gallery"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-semibold text-white hover:border-[#51F4E8]/60 hover:bg-white/10 transition"
              >
                <span>Explore Studio Craft</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Right Column: Dual Translucent Capsules Studio Visual */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#08080c]">
              <img
                src="/images/about-dual-capsules.png"
                alt="Dual iridescent translucent Valence capsules suspended in dark studio vapor"
                loading="lazy"
                className="h-[380px] sm:h-[440px] w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
