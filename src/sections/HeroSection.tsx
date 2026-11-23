import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { FINISH_LIST, FINISH_OPTIONS, PRODUCTS, type FinishOption, type ProductItem } from '../data/catalog';
import { cycleIndex, resolveProductConfiguration } from '../utils/valenceLogic';

interface HeroSectionProps {
  onExploreProduct: (product: ProductItem, finishId: FinishOption['id']) => void;
  reducedMotion: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExploreProduct, reducedMotion }) => {
  const [slideIdx, setSlideIdx] = useState(0);

  const currentProduct = PRODUCTS[slideIdx] ?? PRODUCTS[0];
  const currentFinish = FINISH_LIST[slideIdx] ?? FINISH_OPTIONS.obsidian;
  const config = resolveProductConfiguration(currentProduct.id, currentFinish.id);

  const handlePrev = () => setSlideIdx((i) => cycleIndex(i, -1, PRODUCTS.length));
  const handleNext = () => setSlideIdx((i) => cycleIndex(i, 1, PRODUCTS.length));

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col justify-between pt-24 pb-10 overflow-hidden bg-[#050505]"
    >
      {/* Cinematic Layered Background Visual + Scrim */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <img
          src="/images/hero-atmosphere.png"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover opacity-85"
          referrerPolicy="no-referrer"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 25% 30%, rgba(180,76,255,0.16), transparent 55%), linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.35) 45%, #050505 100%)',
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 mx-auto my-auto w-full max-w-[1280px] px-6 py-10">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          {/* Left Column: Headline, Description, Primary CTA */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            <p className="text-xs font-mono tracking-[0.22em] text-[#51F4E8]">
              01 · HERMETIC ACOUSTIC PRESERVATION
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,5vw,4.5rem)] font-bold leading-[1.04] tracking-tight text-white [text-wrap:balance]">
              Ultimate Hermetic Precision
            </h1>
            <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-white/75">
              Preserve rare aromatics in aerospace-grade billet cylinders engineered with
              calibrated silicone seals, micro-pressure valves, and PVD iridescent finishes.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#collection"
                className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#426BFF] via-[#B44CFF] to-[#FF4DD8] px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:brightness-110 transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51F4E8]"
              >
                <span>Explore Collection</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>

              <a
                href="#showcase"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:border-[#51F4E8]/60 hover:bg-white/10 transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51F4E8]"
              >
                <span>Inspect 3D Model</span>
              </a>
            </div>

            {/* Slide Progress Indicators */}
            <div className="mt-10 flex items-center gap-3" role="tablist" aria-label="Featured capsule slides">
              {PRODUCTS.map((p, idx) => {
                const active = idx === slideIdx;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`Show ${p.name}`}
                    onClick={() => setSlideIdx(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      active ? 'w-8 bg-[#51F4E8]' : 'w-2 bg-white/30 hover:bg-white/60'
                    }`}
                  />
                );
              })}
              <span className="ml-2 font-mono text-xs tabular-nums text-white/55">
                {currentProduct.code} / 0{PRODUCTS.length}
              </span>
            </div>
          </motion.div>

          {/* Right Column: Floating Glassmorphic Featured Showcase Card */}
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <div className="glass-panel relative w-full max-w-sm rounded-2xl p-6">
              <div className="flex items-center justify-between text-xs font-mono text-white/60">
                <span>Featured {currentProduct.code}</span>
                <span className="tabular-nums text-[#51F4E8]">{config.formattedPrice}</span>
              </div>

              <div className="relative my-4 aspect-[4/3] w-full rounded-xl bg-[#0c0c12] overflow-hidden border border-white/10">
                <img
                  src={currentFinish.image}
                  alt={`${currentProduct.name} in ${currentFinish.name}`}
                  className="h-full w-full object-cover transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous featured capsule"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/80 hover:text-white hover:border-[#51F4E8] cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next featured capsule"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white/80 hover:text-white hover:border-[#51F4E8] cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="text-center">
                <h2 className="font-display text-lg font-semibold text-white">
                  {currentProduct.name}
                </h2>
                <p className="mt-1 text-xs text-white/65">
                  {currentFinish.name} · {currentProduct.capacityMl} ml · {currentProduct.pressureRatingBar} bar
                </p>
                <button
                  type="button"
                  onClick={() => onExploreProduct(currentProduct, currentFinish.id)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/8 px-4 py-2.5 text-xs font-semibold text-white hover:border-[#B44CFF]/70 hover:bg-white/12 transition cursor-pointer"
                >
                  <span>Discover Capsule</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Animated Scroll Indicator */}
      <div className="relative z-10 flex justify-center">
        <a
          href="#showcase"
          aria-label="Scroll to 3D product showcase"
          className="inline-flex flex-col items-center gap-1.5 text-xs font-mono text-white/55 hover:text-[#51F4E8] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51F4E8] rounded px-2 py-1"
        >
          <span>Scroll to Inspect</span>
          <ArrowDown
            className={`h-4 w-4 ${reducedMotion ? '' : 'animate-bounce'}`}
            aria-hidden="true"
          />
        </a>
      </div>
    </section>
  );
};
