import React from 'react';
import { Compass, Layers, ShieldCheck, Volume2 } from 'lucide-react';
import { SPECIAL_FEATURES, type FeatureSpec } from '../data/catalog';

function renderFeatureIcon(iconName: FeatureSpec['iconName'], accent: string) {
  const props = { className: 'h-5 w-5', style: { color: accent }, 'aria-hidden': true as const };
  switch (iconName) {
    case 'shield':
      return <ShieldCheck {...props} />;
    case 'volume':
      return <Volume2 {...props} />;
    case 'layers':
      return <Layers {...props} />;
    case 'compass':
      return <Compass {...props} />;
  }
}

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="relative py-20 sm:py-24 bg-[#050505] overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column: 2x2 Numbered Glassmorphism Feature Grid */}
          <div className="lg:col-span-7">
            <p className="text-xs font-mono tracking-[0.2em] text-[#FF4DD8]">
              04 · SPECIAL FEATURES
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white [text-wrap:balance]">
              Built for Zero Compromise
            </h2>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {SPECIAL_FEATURES.map((feat) => (
                <article
                  key={feat.number}
                  className="glass-panel glass-panel-hover rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-medium text-white/55">
                      {feat.number}
                    </span>
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"
                    >
                      {renderFeatureIcon(feat.iconName, feat.accent)}
                    </div>
                  </div>
                  <h3 className="mt-4 font-display text-lg font-semibold text-white">
                    {feat.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/70">
                    {feat.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* Right Column: Dramatic Rim-Lit Studio Visual */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#08080c]">
              <img
                src="/images/features-silhouette.png"
                alt="Rim-lit neon vapor study of the Valence capsule"
                loading="lazy"
                className="h-[380px] sm:h-[460px] w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div
                className="absolute inset-x-0 bottom-0 p-6"
                style={{
                  background:
                    'linear-gradient(180deg, transparent 0%, rgba(5,5,5,0.88) 70%, #050505 100%)',
                }}
              >
                <div className="font-mono text-xs text-[#51F4E8]">IP68 · 4.5 BAR RATED</div>
                <p className="mt-1 text-sm text-white/85">
                  Laboratory-tested vapor containment across extreme altitude and temperature shifts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
