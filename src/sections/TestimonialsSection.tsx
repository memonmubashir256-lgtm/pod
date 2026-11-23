import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { PLACEHOLDER_TESTIMONIALS } from '../data/catalog';
import { cycleIndex } from '../utils/valenceLogic';

export const TestimonialsSection: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const prev = () => setActiveIdx((i) => cycleIndex(i, -1, PLACEHOLDER_TESTIMONIALS.length));
  const next = () => setActiveIdx((i) => cycleIndex(i, 1, PLACEHOLDER_TESTIMONIALS.length));

  const current = PLACEHOLDER_TESTIMONIALS[activeIdx] ?? PLACEHOLDER_TESTIMONIALS[0];

  return (
    <section id="testimonials" className="relative py-20 sm:py-24 bg-[#050505]">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-mono tracking-[0.2em] text-[#FF4DD8]">
              08 · COLLECTOR IMPRESSIONS
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white [text-wrap:balance]">
              Field Reports from Early Stewards
            </h2>
            <p className="mt-2 text-xs text-white/55">
              Placeholder collector testimonials shown for preview until verified customer reviews
              are published.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-[#101014] text-white hover:border-[#51F4E8] transition cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-[#101014] text-white hover:border-[#51F4E8] transition cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Active Highlight Card + Selector Grid */}
        <div className="grid gap-6 lg:grid-cols-12 items-stretch">
          <article className="lg:col-span-7 glass-panel rounded-2xl p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1" aria-label={`${current.rating} out of 5 stars`}>
                  {Array.from({ length: current.rating }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="h-4 w-4 fill-[#51F4E8] text-[#51F4E8]"
                      aria-hidden="true"
                    />
                  ))}
                  <span className="ml-2 font-mono text-xs tabular-nums text-white/70">
                    {current.rating.toFixed(1)} / 5.0
                  </span>
                </div>
                <span className="text-xs font-mono text-[#B44CFF]">{current.productUsed}</span>
              </div>

              <blockquote className="mt-6 text-lg sm:text-xl leading-relaxed text-white/90 font-medium">
                &ldquo;{current.quote}&rdquo;
              </blockquote>
            </div>

            <div className="mt-8 flex items-center gap-4 pt-6 border-t border-white/10">
              <img
                src={current.avatar}
                alt={`Avatar portrait of ${current.name}`}
                className="h-12 w-12 rounded-full border border-white/20 object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="font-display text-base font-semibold text-white">
                  {current.name}
                </div>
                <div className="text-xs text-white/60">
                  {current.role} · {current.location}
                </div>
              </div>
            </div>
          </article>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {PLACEHOLDER_TESTIMONIALS.map((item, idx) => {
              const selected = idx === activeIdx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  aria-pressed={selected}
                  className={`flex items-center gap-3.5 rounded-xl border p-3.5 text-left transition cursor-pointer ${
                    selected
                      ? 'border-[#51F4E8]/70 bg-[#51F4E8]/10'
                      : 'border-white/10 bg-[#101014] hover:border-white/25'
                  }`}
                >
                  <img
                    src={item.avatar}
                    alt=""
                    aria-hidden="true"
                    className="h-10 w-10 rounded-full border border-white/15 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-sm font-semibold text-white truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-white/60 truncate">
                      {item.role} · {item.productUsed}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
