import { useEffect, useState } from 'react';

export type DeviceTier = 'mobile' | 'tablet' | 'laptop' | 'desktop';

const TIERS: { tier: DeviceTier; min: number }[] = [
  { tier: 'desktop', min: 1601 },
  { tier: 'laptop', min: 1025 },
  { tier: 'tablet', min: 768 },
  { tier: 'mobile', min: 0 },
];

/**
 * 4-tier device classification matching the platform breakpoint contract:
 * mobile 0-767, tablet 768-1024, laptop 1025-1600, desktop 1601+.
 * Components use this to pick device-native layouts (bottom sheets, icon
 * rails, multi-pane command centers) instead of guessing from CSS alone.
 */
export function useDeviceTier(): DeviceTier {
  const read = (): DeviceTier => {
    const w = typeof window === 'undefined' ? 1280 : window.innerWidth;
    return (TIERS.find((t) => w >= t.min) ?? TIERS[TIERS.length - 1]).tier;
  };
  const [tier, setTier] = useState<DeviceTier>(read);

  useEffect(() => {
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setTier(read()));
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return tier;
}
