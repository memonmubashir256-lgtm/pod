import React, { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Share, Smartphone, X } from 'lucide-react';
import {
  FINISH_LIST,
  FINISH_OPTIONS,
  type FinishOption,
  type GalleryFrame,
  type ProductItem,
} from '../data/catalog';
import { resolveProductConfiguration } from '../utils/valenceLogic';

/* ---------------- Product Detail Modal ---------------- */
interface ProductModalProps {
  product: ProductItem | null;
  initialFinishId: FinishOption['id'];
  onClose: () => void;
  onInspect3D: (finishId: FinishOption['id']) => void;
}

export const ProductDetailModal: React.FC<ProductModalProps> = ({
  product,
  initialFinishId,
  onClose,
  onInspect3D,
}) => {
  const [selectedFinish, setSelectedFinish] = useState<FinishOption['id']>(initialFinishId);
  const [reserved, setReserved] = useState(false);

  useEffect(() => {
    setSelectedFinish(initialFinishId);
    setReserved(false);
  }, [product, initialFinishId]);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [product, onClose]);

  if (!product) return null;

  const config = resolveProductConfiguration(product.id, selectedFinish);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel relative w-full max-w-3xl overflow-hidden rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product specification dialog"
          className="absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-[#101014] text-white/80 hover:text-white cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid md:grid-cols-2">
          <div className="relative flex items-center justify-center bg-[#08080d] p-8">
            <img
              src={config.finish.image}
              alt={`${product.name} in ${config.finish.name}`}
              className="h-64 w-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              <div className="text-xs font-mono text-[#51F4E8]">
                Edition {product.code} · {product.capacityMl} ml · {product.pressureRatingBar} bar
              </div>
              <h3 id="pdp-modal-title" className="mt-2 font-display text-2xl font-bold text-white">
                {product.name}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{product.description}</p>

              <ul className="mt-4 space-y-1.5 text-xs text-white/80">
                {product.specs.map((spec) => (
                  <li key={spec} className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-[#51F4E8] shrink-0" aria-hidden="true" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                <div className="text-xs font-medium text-white/70">
                  Finish: <span className="text-white">{config.finish.name}</span>
                </div>
                <div className="mt-2.5 flex items-center gap-2.5">
                  {FINISH_LIST.map((f) => {
                    const active = f.id === selectedFinish;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => {
                          setSelectedFinish(f.id);
                          setReserved(false);
                        }}
                        aria-label={`Choose ${f.name}`}
                        aria-pressed={active}
                        className={`h-8 w-8 rounded-full border-2 transition-transform cursor-pointer ${
                          active ? 'scale-110 border-white' : 'border-white/20 hover:scale-105'
                        }`}
                        style={{ backgroundColor: f.hex }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-white/10">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs text-white/60">Studio Direct Price</span>
                <span className="font-mono text-2xl font-semibold tabular-nums text-white">
                  {config.formattedPrice}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setReserved(true)}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#426BFF] to-[#B44CFF] px-4 py-3 text-xs font-semibold text-white hover:brightness-110 transition cursor-pointer"
                >
                  {reserved ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden="true" />
                      <span>Added to Studio Queue</span>
                    </>
                  ) : (
                    <span>Reserve Allocation</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onInspect3D(selectedFinish);
                    onClose();
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-semibold text-white hover:border-[#51F4E8]/60 transition cursor-pointer"
                >
                  Inspect in 3D
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Lightbox Modal ---------------- */
interface LightboxModalProps {
  frames: GalleryFrame[];
  activeIndex: number | null;
  onClose: () => void;
  onChangeIndex: (idx: number) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  frames,
  activeIndex,
  onClose,
  onChangeIndex,
}) => {
  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onChangeIndex((activeIndex + 1) % frames.length);
      if (e.key === 'ArrowLeft') onChangeIndex((activeIndex - 1 + frames.length) % frames.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, frames.length, onChangeIndex, onClose]);

  if (activeIndex === null) return null;
  const frame = frames[activeIndex];
  if (!frame) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Gallery lightbox: ${frame.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl border border-white/15 bg-[#0c0c12] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
          <div className="text-xs font-mono text-white/70">
            {activeIndex + 1} / {frames.length} · {frame.tag}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lightbox viewer"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative bg-[#050505]">
          <img
            src={frame.image}
            alt={frame.title}
            className="max-h-[68vh] w-full object-contain"
            referrerPolicy="no-referrer"
          />
          <button
            type="button"
            aria-label="Previous gallery image"
            onClick={() => onChangeIndex((activeIndex - 1 + frames.length) % frames.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/75 text-white hover:border-[#51F4E8] cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next gallery image"
            onClick={() => onChangeIndex((activeIndex + 1) % frames.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/75 text-white hover:border-[#51F4E8] cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4">
          <h3 className="font-display text-lg font-semibold text-white">{frame.title}</h3>
          <p className="mt-1 text-sm text-white/70">{frame.caption}</p>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Install Guide Modal ---------------- */
interface InstallGuideModalProps {
  open: boolean;
  isIOS: boolean;
  isInstallable: boolean;
  onTriggerNativeInstall: () => void;
  onClose: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  open,
  isIOS,
  isInstallable,
  onTriggerNativeInstall,
  onClose,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-guide-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-md rounded-2xl p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#51F4E8]/40 bg-[#51F4E8]/10 text-[#51F4E8]">
              <Smartphone className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 id="install-guide-title" className="font-display text-lg font-bold text-white">
                Install VALENCE App
              </h3>
              <p className="text-xs text-white/60">Standalone Progressive Web App</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close install instructions"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/75 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 space-y-3 text-sm leading-relaxed text-white/75">
          {isInstallable ? (
            <p>
              Your browser supports one-click installation for offline showcase access and standalone
              launch.
            </p>
          ) : isIOS ? (
            <>
              <p className="flex items-start gap-2">
                <span className="font-mono text-xs text-[#51F4E8] mt-0.5">01.</span>
                <span>
                  Tap the <strong className="text-white inline-flex items-center gap-1">Share <Share className="h-3.5 w-3.5" aria-hidden="true" /></strong> button in Safari&apos;s toolbar.
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-mono text-xs text-[#51F4E8] mt-0.5">02.</span>
                <span>
                  Scroll down and tap <strong className="text-white">Add to Home Screen</strong>.
                </span>
              </p>
            </>
          ) : (
            <>
              <p>
                Install VALENCE directly from your browser address bar or menu to launch in a
                standalone window with offline asset caching:
              </p>
              <ul className="space-y-1.5 text-xs text-white/70 font-mono">
                <li>Desktop Chrome / Edge: Click the Install icon in the address bar</li>
                <li>Android Chrome: Open Menu -&gt; Install App</li>
                <li>iOS Safari: Share -&gt; Add to Home Screen</li>
              </ul>
            </>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {isInstallable && (
            <button
              type="button"
              onClick={onTriggerNativeInstall}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#426BFF] to-[#B44CFF] px-4 py-2.5 text-xs font-semibold text-white cursor-pointer"
            >
              Install Now
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- Legal Modal ---------------- */
interface LegalModalProps {
  docType: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ docType, onClose }) => {
  useEffect(() => {
    if (!docType) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [docType, onClose]);

  if (!docType) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-lg rounded-2xl p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <h3 id="legal-modal-title" className="font-display text-lg font-bold text-white">
            {docType === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close legal dialog"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-white/80 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-white/75">
          {docType === 'privacy' ? (
            <>
              <p>
                VALENCE stores newsletter preferences and cached PWA assets locally on your device.
                We do not sell personal contact records or run invasive third-party trackers.
              </p>
              <p>
                Service Worker storage is used strictly to preserve 3D assets, product imagery, and
                offline fallback views for uninterrupted standalone usage.
              </p>
            </>
          ) : (
            <>
              <p>
                All VALENCE precision capsules are engineered to laboratory tolerances and covered by
                our lifetime silicone seal replacement program.
              </p>
              <p>
                Product specifications, PVD finish tones, and allocation pricing reflect current
                studio production runs and may be updated via over-the-air PWA releases.
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 cursor-pointer"
        >
          Close
        </button>
      </div>
    </div>
  );
};
