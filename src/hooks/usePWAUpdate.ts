import { useEffect, useState } from 'react';
import { registerSW } from 'virtual:pwa-register';

export function usePWAUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [updateFn, setUpdateFn] = useState<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    try {
      const updateSW = registerSW({
        onNeedRefresh() {
          setNeedRefresh(true);
        },
        onOfflineReady() {
          setOfflineReady(true);
        },
      });
      setUpdateFn(() => updateSW);
    } catch {
      // Service worker registration skipped if unsupported
    }
  }, []);

  const applyUpdate = async () => {
    if (updateFn) {
      await updateFn(true);
    }
    setNeedRefresh(false);
  };

  return {
    needRefresh,
    offlineReady,
    dismissOfflineReady: () => setOfflineReady(false),
    dismissRefresh: () => setNeedRefresh(false),
    applyUpdate,
  };
}
