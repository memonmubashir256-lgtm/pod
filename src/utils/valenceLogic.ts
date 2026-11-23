import {
  FINISH_OPTIONS,
  HOTSPOTS,
  PRODUCTS,
  type FinishOption,
  type HotspotSpec,
  type ProductItem,
} from '../data/catalog';

export interface NewsletterValidationResult {
  valid: boolean;
  normalizedEmail: string;
  error: string | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateNewsletterEmail(
  rawEmail: string,
  alreadySubscribed: string[] = []
): NewsletterValidationResult {
  const normalized = rawEmail.trim().toLowerCase();
  if (!normalized) {
    return {
      valid: false,
      normalizedEmail: '',
      error: 'Please enter an email address.',
    };
  }
  if (!EMAIL_REGEX.test(normalized)) {
    return {
      valid: false,
      normalizedEmail: normalized,
      error: 'Enter a valid email format (e.g. name@domain.com).',
    };
  }
  if (alreadySubscribed.some((item) => item.toLowerCase() === normalized)) {
    return {
      valid: false,
      normalizedEmail: normalized,
      error: 'This address is already on the private dispatch list.',
    };
  }
  return {
    valid: true,
    normalizedEmail: normalized,
    error: null,
  };
}

export function formatUsd(amount: number): string {
  return `$${Math.round(amount).toLocaleString('en-US')}`;
}

export function resolveProductConfiguration(
  productId: string,
  finishId: FinishOption['id']
): {
  product: ProductItem;
  finish: FinishOption;
  totalPrice: number;
  formattedPrice: string;
} {
  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];
  const finish = FINISH_OPTIONS[finishId] ?? FINISH_OPTIONS[product.defaultFinishId];
  const totalPrice = product.basePrice + finish.priceDelta;
  return {
    product,
    finish,
    totalPrice,
    formattedPrice: formatUsd(totalPrice),
  };
}

export function cycleIndex(current: number, delta: 1 | -1, total: number): number {
  if (total <= 0) return 0;
  return ((current + delta) % total + total) % total;
}

export function clampExplodedAmount(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

export function getHotspotCameraPreset(hotspotId: HotspotSpec['id']): {
  yaw: number;
  pitch: number;
  zoom: number;
  spec: HotspotSpec;
} {
  const spec = HOTSPOTS.find((h) => h.id === hotspotId) ?? HOTSPOTS[0];
  return {
    yaw: spec.cameraYaw,
    pitch: spec.cameraPitch,
    zoom: spec.cameraZoom,
    spec,
  };
}
