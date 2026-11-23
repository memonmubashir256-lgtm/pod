import React, { useEffect, useState } from 'react';
import { ArrowUp, RefreshCw, WifiOff, X } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAUpdate } from '../hooks/usePWAUpdate';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl border border-amber-400/40 bg-[#181209] px-3.5 py-2 text-xs font-medium text-amber-200 shadow-lg"
    >
      <WifiOff className="h-3.5 w-3.5 text-amber-400 shrink-0" aria-hidden="true" />
      <span>Offline Mode · Cached showcase active</span>
    </div>
  );
};

export const PWAUpdateBanner: React.FC = () => {
  const { needRefresh, applyUpdate, dismissRefresh } = usePWAUpdate();

  if (!needRefresh) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-xl border border-[#51F4E8]/40 bg-[#101018] px-4 py-3 text-xs text-white shadow-xl"
    >
      <span>A new version of VALENCE is ready.</span>
      <button
        type="button"
        onClick={applyUpdate}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#51F4E8] px-3 py-1.5 font-semibold text-[#050505] hover:brightness-110 cursor-pointer"
      >
        <RefreshCw className="h-3 w-3" aria-hidden="true" />
        <span>Update</span>
      </button>
      <button
        type="button"
        onClick={dismissRefresh}
        aria-label="Dismiss update notification"
        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white/60 hover:text-white cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};

export const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed bottom-5 right-5 z-30 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-[#101014]/95 text-white shadow-lg hover:border-[#B44CFF]/70 hover:text-[#51F4E8] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#51F4E8]"
    >
      <ArrowUp className="h-4 w-4" aria-hidden="true" />
    </button>
  );
};
