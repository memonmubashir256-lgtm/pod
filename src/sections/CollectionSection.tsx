import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  FINISH_LIST,
  PRODUCTS,
  type FinishOption,
  type ProductItem,
} from '../data/catalog';
import { resolveProductConfiguration } from '../utils/valenceLogic';

interface CollectionSectionProps {
  onExploreProduct: (product: ProductItem, finishId: FinishOption['id']) => void;
  onSync3DFinish: (finishId: FinishOption['id']) => void;
}

export const CollectionSection: React.FC<CollectionSectionProps> = ({
  onExploreProduct,
  onSync3DFinish,
}) => {
  const [cardFinishes, setCardFinishes] = useState<Record<string, FinishOption['id']>>(() =>
    Object.fromEntries(PRODUCTS.map((p) => [p.id, p.defaultFinishId]))
  );

  const handleSelectColor = (productId: string, finishId: FinishOption['id']) => {
    setCardFinishes((prev) => ({ ...prev, [productId]: finishId }));
    onSync3DFinish(finishId);
  };

  return (
    <section id="collection" className="relative py-20 sm:py-24 bg-[#050505]">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-mono tracking-[0.2em] text-[#51F4E8]">
              03 · SIGNATURE VAULT LINEUP
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-white [text-wrap:balance]">
              What&apos;s Your Finish?
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-white/70">
            Select any PVD anodized hue on a capsule card to preview the finish and inspect full
            specifications.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product) => {
            const activeFinishId = cardFinishes[product.id] ?? product.defaultFinishId;
            const config = resolveProductConfiguration(product.id, activeFinishId);

            return (
              <article
                key={product.id}
                className="glass-panel glass-panel-hover flex flex-col justify-between rounded-2xl p-5"
              >
                <div>
                  {/* Image Slot */}
                  <div
                    className="relative aspect-[4/3] w-full rounded-xl bg-[#0c0c12] border border-white/10 overflow-hidden"
                    style={{
                      boxShadow: `inset 0 0 42px ${config.finish.hex}18`,
                    }}
                  >
                    <img
                      src={config.finish.image}
                      alt={`${product.name} in ${config.finish.name}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Metadata & Name */}
                  <div className="mt-4 flex items-center justify-between text-xs font-mono text-white/55">
                    <span>Edition {product.code}</span>
                    <span>{product.capacityMl} ml</span>
                  </div>

                  <h3 className="mt-1.5 font-display text-lg font-semibold text-white">
                    {product.name}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/65">
                    {product.description}
                  </p>
                </div>

                {/* Color Selector + Price + Explore CTA */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-2"
                      role="group"
                      aria-label={`Color options for ${product.name}`}
                    >
                      {FINISH_LIST.map((finish) => {
                        const selected = finish.id === activeFinishId;
                        return (
                          <button
                            key={finish.id}
                            type="button"
                            onClick={() => handleSelectColor(product.id, finish.id)}
                            aria-label={`${product.name} in ${finish.name}`}
                            aria-pressed={selected}
                            className={`h-6 w-6 rounded-full border-2 transition-transform cursor-pointer ${
                              selected
                                ? 'scale-110 border-white'
                                : 'border-white/20 hover:scale-105'
                            }`}
                            style={{ backgroundColor: finish.hex }}
                          />
                        );
                      })}
                    </div>

                    <span className="font-mono text-base font-semibold tabular-nums text-white">
                      {config.formattedPrice}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-xs text-white/60 truncate">{config.finish.name}</span>
                    <button
                      type="button"
                      onClick={() => onExploreProduct(product, activeFinishId)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white hover:border-[#51F4E8]/60 hover:bg-white/10 transition cursor-pointer whitespace-nowrap shrink-0"
                    >
                      <span>Explore</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
