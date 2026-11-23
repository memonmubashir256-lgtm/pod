import React, { useState } from 'react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { HOTSPOTS, type HotspotSpec } from '../data/catalog';

interface ExperienceSectionProps {
  reducedMotion: boolean;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ reducedMotion }) => {
  const [selectedId, setSelectedId] = useState<HotspotSpec['id']>('cap');
  const [pulseActive, setPulseActive] = useState(!reducedMotion);

  const active = HOTSPOTS.find((h) => h.id === selectedId) ?? HOTSPOTS[0];

  return (
    <section id="experience" className="relative py-20 sm:py-24 bg-[#050505] overflow-hidden">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-mono tracking-[0.2em] text-[#426BFF]">
            05 · THE GAME CHANGER
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white [text-wrap:balance]">
            Interactive Acoustic Architecture
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Select any orbital callout node around the cutaway twin assembly to examine seal
            mechanics and acoustic release tolerances.
          </p>
        </div>

        {/* Orbital Interactive Cutaway Stage */}
        <div className="mt-12 grid items-center gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-2xl rounded-2xl border border-white/10 bg-[#08080c] overflow-hidden">
              <img
                src="/images/gallery-macro-valve.png"
                alt="Twin Valence precision capsules with open pop lid and sealed rim"
                loading="lazy"
                className={`h-full w-full object-cover transition-transform duration-700 ${
                  pulseActive && !reducedMotion ? 'scale-[1.03]' : 'scale-100'
                }`}
                referrerPolicy="no-referrer"
              />

              {/* Subtle Orbital Ring SVG */}
              <svg
                viewBox="0 0 100 100"
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  fill="none"
                  stroke="rgba(255,255,255,0.22)"
                  strokeWidth="0.3"
                  strokeDasharray="1.2 1.2"
                />
              </svg>

              {/* Central Acoustic Resonance Play/Pause Button */}
              <button
                type="button"
                onClick={() => setPulseActive((v) => !v)}
                aria-label={pulseActive ? 'Pause resonance preview' : 'Play resonance preview'}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-black/75 text-white shadow-xl hover:border-[#51F4E8] hover:scale-105 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51F4E8]"
              >
                {pulseActive ? (
                  <Pause className="h-6 w-6 text-[#51F4E8]" aria-hidden="true" />
                ) : (
                  <Play className="h-6 w-6 text-[#51F4E8] ml-0.5" aria-hidden="true" />
                )}
              </button>

              {/* 4 Orbital Hotspot Nodes */}
              {HOTSPOTS.map((hs) => {
                const isSelected = hs.id === selectedId;
                return (
                  <button
                    key={hs.id}
                    type="button"
                    onClick={() => setSelectedId(hs.id)}
                    aria-pressed={isSelected}
                    style={{
                      left: `${hs.diagramPos.x}%`,
                      top: `${hs.diagramPos.y}%`,
                      borderColor: hs.accentHex,
                      backgroundColor: isSelected ? hs.accentHex : 'rgba(10,10,16,0.92)',
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer whitespace-nowrap shadow-lg ${
                      isSelected ? 'text-[#050505] font-semibold' : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <span className="font-mono text-[11px]">{hs.indexLabel}</span>
                    <span>{hs.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Side Component Readout & Selector */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-panel rounded-2xl p-6">
              <div className="text-xs font-mono" style={{ color: active.accentHex }}>
                Component {active.indexLabel} · {active.metric}
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold text-white">{active.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{active.summary}</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {HOTSPOTS.map((hs) => {
                const isSelected = hs.id === selectedId;
                return (
                  <button
                    key={hs.id}
                    type="button"
                    onClick={() => setSelectedId(hs.id)}
                    className={`rounded-xl border px-3.5 py-2.5 text-left text-xs transition cursor-pointer ${
                      isSelected
                        ? 'border-[#51F4E8] bg-[#51F4E8]/10 text-white'
                        : 'border-white/10 bg-[#101014] text-white/70 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    <div className="font-mono text-[11px] opacity-70">{hs.indexLabel}</div>
                    <div className="mt-0.5 font-medium truncate">{hs.shortLabel}</div>
                  </button>
                );
              })}
            </div>

            <a
              href="#collection"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-semibold text-white hover:border-[#B44CFF]/60 hover:bg-white/10 transition"
            >
              <span>View Collection</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
