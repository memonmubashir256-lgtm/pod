import React, { useState } from 'react';
import { Expand } from 'lucide-react';
import { LightboxModal } from '../components/Modals';
import { GALLERY_FRAMES } from '../data/catalog';

export const GallerySection: React.FC = () => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <section id="gallery" className="relative py-20 sm:py-24 bg-[#050505]">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-mono tracking-[0.2em] text-[#51F4E8]">
              07 · VISUAL ARCHIVE
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white [text-wrap:balance]">
              Studio & Laboratory Studies
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/70">
            Select any frame to open the full-resolution lightbox viewer with keyboard navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GALLERY_FRAMES.map((frame, index) => (
            <button
              key={frame.id}
              type="button"
              onClick={() => setLightboxIndex(index)}
              aria-label={`Open ${frame.title} in lightbox`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10] text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51F4E8]"
            >
              <div className="aspect-[16/10] w-full overflow-hidden">
                <img
                  src={frame.image}
                  alt={frame.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div
                className="absolute inset-0 flex flex-col justify-end p-6"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(5,5,5,0.05) 30%, rgba(5,5,5,0.88) 100%)',
                }}
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-xs font-mono text-[#51F4E8]">{frame.tag}</div>
                    <h3 className="mt-1 font-display text-lg font-semibold text-white">
                      {frame.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/70 line-clamp-2">{frame.caption}</p>
                  </div>

                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-black/60 text-white group-hover:border-[#51F4E8] group-hover:text-[#51F4E8] transition-colors">
                    <Expand className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <LightboxModal
        frames={GALLERY_FRAMES}
        activeIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onChangeIndex={setLightboxIndex}
      />
    </section>
  );
};
