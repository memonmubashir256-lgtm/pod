/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { InstallGuideModal, LegalModal, ProductDetailModal } from './components/Modals';
import { Navbar } from './components/Navbar';
import { BackToTopButton, OfflineIndicator, PWAUpdateBanner } from './components/PWAControls';
import { type FinishOption, type ProductItem } from './data/catalog';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useReducedMotionPreference } from './hooks/useReducedMotion';
import { AboutSection } from './sections/AboutSection';
import { CollectionSection } from './sections/CollectionSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { FooterSection } from './sections/FooterSection';
import { GallerySection } from './sections/GallerySection';
import { HeroSection } from './sections/HeroSection';
import { NewsletterSection } from './sections/NewsletterSection';
import { Showcase3DSection } from './sections/Showcase3DSection';
import { TestimonialsSection } from './sections/TestimonialsSection';

export default function App() {
  const { reducedMotion, toggleReducedMotion } = useReducedMotionPreference();
  const { isInstallable, isIOS, install } = usePWAInstall();

  const [active3DFinish, setActive3DFinish] = useState<FinishOption['id']>('obsidian');
  const [modalProduct, setModalProduct] = useState<{
    product: ProductItem;
    finishId: FinishOption['id'];
  } | null>(null);
  const [installGuideOpen, setInstallGuideOpen] = useState(false);
  const [legalDoc, setLegalDoc] = useState<'privacy' | 'terms' | null>(null);

  const handleOpenProduct = (product: ProductItem, finishId: FinishOption['id']) => {
    setModalProduct({ product, finishId });
  };

  const handleInspectIn3D = (finishId: FinishOption['id']) => {
    setActive3DFinish(finishId);
    const el = document.getElementById('showcase');
    el?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar onOpenInstallGuide={() => setInstallGuideOpen(true)} />

      <main>
        <HeroSection
          onExploreProduct={handleOpenProduct}
          reducedMotion={reducedMotion}
        />

        <Showcase3DSection
          selectedFinishId={active3DFinish}
          onChangeFinish={setActive3DFinish}
          onDiscoverProduct={handleOpenProduct}
          reducedMotion={reducedMotion}
        />

        <CollectionSection
          onExploreProduct={handleOpenProduct}
          onSync3DFinish={setActive3DFinish}
        />

        <FeaturesSection />

        <ExperienceSection reducedMotion={reducedMotion} />

        <AboutSection />

        <GallerySection />

        <TestimonialsSection />

        <NewsletterSection />
      </main>

      <FooterSection
        reducedMotion={reducedMotion}
        onToggleReducedMotion={toggleReducedMotion}
        onOpenLegal={setLegalDoc}
        onOpenInstallGuide={() => setInstallGuideOpen(true)}
      />

      {/* Interactive Dialogs & PWA Overlays */}
      <ProductDetailModal
        product={modalProduct?.product ?? null}
        initialFinishId={modalProduct?.finishId ?? 'obsidian'}
        onClose={() => setModalProduct(null)}
        onInspect3D={handleInspectIn3D}
      />

      <InstallGuideModal
        open={installGuideOpen}
        isIOS={isIOS}
        isInstallable={isInstallable}
        onTriggerNativeInstall={async () => {
          await install();
          setInstallGuideOpen(false);
        }}
        onClose={() => setInstallGuideOpen(false)}
      />

      <LegalModal docType={legalDoc} onClose={() => setLegalDoc(null)} />

      <OfflineIndicator />
      <PWAUpdateBanner />
      <BackToTopButton />
    </div>
  );
}
