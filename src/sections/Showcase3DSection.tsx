import React, { useState } from 'react';
import { Capsule3DCanvas } from '../components/Capsule3DCanvas';
import { FINISH_OPTIONS, PRODUCTS, type FinishOption, type HotspotSpec, type ProductItem } from '../data/catalog';
import { resolveProductConfiguration } from '../utils/valenceLogic';

interface Showcase3DSectionProps {
  selectedFinishId: FinishOption['id'];
  onChangeFinish: (id: FinishOption['id']) => void;
  onDiscoverProduct: (product: ProductItem, finishId: FinishOption['id']) => void;
  reducedMotion: boolean;
}

export const Showcase3DSection: React.FC<Showcase3DSectionProps> = ({
  selectedFinishId,
  onChangeFinish,
  onDiscoverProduct,
  reducedMotion,
}) => {
  const [activeHotspotId, setActiveHotspotId] = useState<HotspotSpec['id']>('seal');

  const flagship = PRODUCTS[1];
  const config = resolveProductConfiguration(flagship.id, selectedFinishId);
  const finish = FINISH_OPTIONS[selectedFinishId];

  return (
    <section id="showcase" className="relative py-20 sm:py-24 bg-[#050505]">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-mono tracking-[0.2em] text-[#B44CFF]">
              02 · INTERACTIVE 3D INSPECTION
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white [text-wrap:balance]">
              Engineered From Every Angle
            </h2>
          </div>

          <p className="max-w-md text-sm leading-relaxed text-white/70">
            Drag to orbit 360°, expand the internal assembly with the explode slider, or select any
            engineered hotspot to inspect tolerances.
          </p>
        </div>

        {/* Full-Width 3D WebGL Viewport */}
        <Capsule3DCanvas
          finishId={selectedFinishId}
          onChangeFinish={onChangeFinish}
          activeHotspotId={activeHotspotId}
          onSelectHotspot={setActiveHotspotId}
          reducedMotion={reducedMotion}
          onDiscoverProduct={() => onDiscoverProduct(flagship, selectedFinishId)}
        />

        {/* Spec Strip Below 3D Stage */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel rounded-xl p-4">
            <div className="text-xs text-white/55">Active Finish</div>
            <div className="mt-1 font-display text-base font-semibold text-white">
              {finish.name}
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-xs text-white/55">Hermetic Pressure</div>
            <div className="mt-1 font-mono text-base font-semibold tabular-nums text-[#51F4E8]">
              {flagship.pressureRatingBar} Bar Lock
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4">
            <div className="text-xs text-white/55">Machined Tolerance</div>
            <div className="mt-1 font-mono text-base font-semibold tabular-nums text-white">
              +/- 0.02 mm
            </div>
          </div>
          <div className="glass-panel rounded-xl p-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-white/55">Studio Price</div>
              <div className="mt-1 font-mono text-base font-semibold tabular-nums text-white">
                {config.formattedPrice}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onDiscoverProduct(flagship, selectedFinishId)}
              className="rounded-lg bg-gradient-to-r from-[#426BFF] to-[#B44CFF] px-3.5 py-2 text-xs font-semibold text-white hover:brightness-110 transition cursor-pointer whitespace-nowrap"
            >
              Discover
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
