import { useEffect, useState } from 'react';

export function useReducedMotionPreference() {
  const [systemPrefersReduced, setSystemPrefersReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  const [userOverride, setUserOverride] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setSystemPrefersReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const reducedMotion = userOverride !== null ? userOverride : systemPrefersReduced;

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
  }, [reducedMotion]);

  return {
    reducedMotion,
    toggleReducedMotion: () => setUserOverride((prev) => (prev !== null ? !prev : !systemPrefersReduced)),
  };
}
