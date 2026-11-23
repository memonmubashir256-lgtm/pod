export interface FinishOption {
  id: 'obsidian' | 'magenta' | 'prism' | 'aurora';
  name: string;
  hex: string;
  accentHex: string;
  metalColor: number;
  sealColor: number;
  image: string;
  priceDelta: number;
}

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  subtitle: string;
  description: string;
  basePrice: number;
  capacityMl: number;
  pressureRatingBar: number;
  weightGrams: number;
  defaultFinishId: FinishOption['id'];
  specs: string[];
}

export interface HotspotSpec {
  id: 'seal' | 'cap' | 'valve' | 'hull';
  indexLabel: string;
  title: string;
  shortLabel: string;
  summary: string;
  metric: string;
  accentHex: string;
  cameraYaw: number;
  cameraPitch: number;
  cameraZoom: number;
  localAnchor: [number, number, number];
  diagramPos: { x: number; y: number };
}

export interface FeatureSpec {
  number: string;
  title: string;
  description: string;
  iconName: 'shield' | 'volume' | 'layers' | 'compass';
  accent: string;
}

export interface GalleryFrame {
  id: string;
  title: string;
  caption: string;
  aspect: string;
  image: string;
  tag: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  location: string;
  rating: number;
  avatar: string;
  quote: string;
  productUsed: string;
}

export const FINISH_OPTIONS: Record<FinishOption['id'], FinishOption> = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Violet',
    hex: '#B44CFF',
    accentHex: '#51F4E8',
    metalColor: 0x3b2466,
    sealColor: 0x51f4e8,
    image: '/images/capsule-obsidian.png',
    priceDelta: 0,
  },
  magenta: {
    id: 'magenta',
    name: 'Cyber Magenta',
    hex: '#FF4DD8',
    accentHex: '#B44CFF',
    metalColor: 0xb82b8f,
    sealColor: 0xffb35c,
    image: '/images/capsule-magenta.png',
    priceDelta: 15,
  },
  prism: {
    id: 'prism',
    name: 'Solar Prism',
    hex: '#FF8A4C',
    accentHex: '#B44CFF',
    metalColor: 0xc25b47,
    sealColor: 0x51f4e8,
    image: '/images/capsule-prism.png',
    priceDelta: 25,
  },
  aurora: {
    id: 'aurora',
    name: 'Aurora Cyan',
    hex: '#51F4E8',
    accentHex: '#426BFF',
    metalColor: 0x268f9c,
    sealColor: 0xff4dd8,
    image: '/images/capsule-aurora.png',
    priceDelta: 20,
  },
};

export const FINISH_LIST: FinishOption[] = [
  FINISH_OPTIONS.obsidian,
  FINISH_OPTIONS.magenta,
  FINISH_OPTIONS.prism,
  FINISH_OPTIONS.aurora,
];

export const PRODUCTS: ProductItem[] = [
  {
    id: 'valence-s1',
    code: '01',
    name: 'Valence S1 Cylinder',
    subtitle: 'Compact Hermetic Capsule',
    description:
      'CNC-machined 6061-T6 aerospace aluminum shell with dual medical-grade silicone seals for zero-odor travel preservation.',
    basePrice: 189,
    capacityMl: 48,
    pressureRatingBar: 2.4,
    weightGrams: 112,
    defaultFinishId: 'obsidian',
    specs: ['48 ml interior chamber', '2.4 bar pressure lock', 'IP68 water & vapor proof'],
  },
  {
    id: 'valence-m2',
    code: '02',
    name: 'Valence M2 Prism',
    subtitle: 'PVD Iridescent Edition',
    description:
      'Vapor-deposited iridescent coating over micro-bead-blasted alloy, tuned for crisp 4.2 kHz acoustic release feedback.',
    basePrice: 229,
    capacityMl: 75,
    pressureRatingBar: 3.1,
    weightGrams: 138,
    defaultFinishId: 'magenta',
    specs: ['75 ml borosilicate liner', '4.2 kHz acoustic pop lid', 'Scratch-resistant PVD coat'],
  },
  {
    id: 'valence-x4',
    code: '03',
    name: 'Valence X4 Atelier',
    subtitle: 'Dual-Chamber Micro Vault',
    description:
      'Isolated twin-zone inner core with humidity buffer channel and calibrated spring-latch hinge for daily studio carry.',
    basePrice: 279,
    capacityMl: 110,
    pressureRatingBar: 3.6,
    weightGrams: 164,
    defaultFinishId: 'prism',
    specs: ['110 ml dual-zone core', '3.6 bar hermetic seal', 'Zero-static inner sleeve'],
  },
  {
    id: 'valence-r9',
    code: '04',
    name: 'Valence R9 Titan',
    subtitle: 'Grade-5 Titanium Flagship',
    description:
      'Flagship titanium monolith milled from solid billet with sapphire inspection window and cryogenic-grade elastomer O-ring.',
    basePrice: 349,
    capacityMl: 140,
    pressureRatingBar: 4.5,
    weightGrams: 196,
    defaultFinishId: 'aurora',
    specs: ['Grade-5 Ti-6Al-4V hull', '4.5 bar laboratory seal', 'Lifetime seal replacement'],
  },
];

export const HOTSPOTS: HotspotSpec[] = [
  {
    id: 'seal',
    indexLabel: '01',
    title: 'Silicone Seal Pad',
    shortLabel: 'Silicone Pad',
    summary:
      'Platinum-cured compression gasket forms a 360-degree gas barrier that locks internal humidity within +/- 1.5% RH.',
    metric: '1.5% RH Drift',
    accentHex: '#51F4E8',
    cameraYaw: 0.4,
    cameraPitch: 0.42,
    cameraZoom: 3.9,
    localAnchor: [-0.46, 1.12, 0.25],
    diagramPos: { x: 24, y: 16 },
  },
  {
    id: 'cap',
    indexLabel: '02',
    title: 'Acoustic Pop Cap',
    shortLabel: 'Acoustic Pop Lid',
    summary:
      'Precision-balanced hinge dome releases negative pressure with a signature clean snap when unlatched by thumb.',
    metric: '4.2 kHz Snap',
    accentHex: '#FF8A4C',
    cameraYaw: -0.55,
    cameraPitch: 0.52,
    cameraZoom: 3.8,
    localAnchor: [0.35, 1.56, 0.08],
    diagramPos: { x: 76, y: 18 },
  },
  {
    id: 'valve',
    indexLabel: '03',
    title: 'Micro-Air Valve',
    shortLabel: 'Air Valve',
    summary:
      'One-way micro-diaphragm equalizes altitude pressure shifts on flights without permitting ambient aroma leakage.',
    metric: '2.4–4.5 Bar',
    accentHex: '#51F4E8',
    cameraYaw: 1.1,
    cameraPitch: 0.18,
    cameraZoom: 4.0,
    localAnchor: [0.54, 0.72, 0.22],
    diagramPos: { x: 86, y: 58 },
  },
  {
    id: 'hull',
    indexLabel: '04',
    title: 'PVD Anodized Hull',
    shortLabel: 'Anodized Alloy',
    summary:
      'Seamless lathe-turned barrel finished with multi-layer physical vapor deposition and fine tactile knurling.',
    metric: '6061-T6 / Ti5',
    accentHex: '#B44CFF',
    cameraYaw: -0.25,
    cameraPitch: -0.05,
    cameraZoom: 4.35,
    localAnchor: [-0.48, -0.35, 0.28],
    diagramPos: { x: 18, y: 66 },
  },
];

export const SPECIAL_FEATURES: FeatureSpec[] = [
  {
    number: '01',
    title: 'Airtight Hermetic Seal',
    description:
      'Dual-lip platinum silicone compression stops oxygen ingress and locks delicate botanical aromatics at peak potency.',
    iconName: 'shield',
    accent: '#51F4E8',
  },
  {
    number: '02',
    title: 'Discreet Acoustic Design',
    description:
      'Pocket-contoured silhouette eliminates rattle and conceals scent molecules inside a zero-permeability metal shell.',
    iconName: 'volume',
    accent: '#B44CFF',
  },
  {
    number: '03',
    title: 'Aerospace Construction',
    description:
      'Impact-tested 2.2 mm wall thickness shields contents against drops, moisture, UV degradation, and altitude pressure.',
    iconName: 'layers',
    accent: '#426BFF',
  },
  {
    number: '04',
    title: 'Modular Interior Core',
    description:
      'Swappable borosilicate sleeves adapt effortlessly from single-origin espresso doses to delicate botanicals.',
    iconName: 'compass',
    accent: '#FF4DD8',
  },
];

export const GALLERY_FRAMES: GalleryFrame[] = [
  {
    id: 'gal-1',
    title: 'Dual Valve Cutaway Study',
    caption: 'Precision-milled twin collars showing open acoustic lid and compressed silicone gasket.',
    aspect: '4:3',
    image: '/images/gallery-macro-valve.png',
    tag: 'Studio Macro',
  },
  {
    id: 'gal-2',
    title: 'Full PVD Spectrum Lineup',
    caption: 'Obsidian Violet, Cyber Magenta, Solar Prism, and Aurora Cyan anodized production run.',
    aspect: '4:3',
    image: '/images/gallery-iridescent-lineup.png',
    tag: 'Collection',
  },
  {
    id: 'gal-3',
    title: 'Atmospheric Vapor Containment',
    caption: 'Zero-leak chamber testing inside an illuminated darkroom mist chamber.',
    aspect: '4:3',
    image: '/images/gallery-night-vapor.png',
    tag: 'Lab Test',
  },
  {
    id: 'gal-4',
    title: 'Atelier Calibration Bench',
    caption: 'Optical concentricity inspection on Grade-5 machined shells prior to PVD bath.',
    aspect: '4:3',
    image: '/images/gallery-atelier-bench.png',
    tag: 'Engineering',
  },
];

export const PLACEHOLDER_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'rev-1',
    name: 'Elena Vance',
    role: 'Industrial Designer',
    location: 'Zurich · Sample Review',
    rating: 5,
    avatar: '/images/avatar-1.png',
    quote:
      'Switching from glass jars to the Valence M2 completely eliminated pocket rattle and preserved aroma notes across a three-week alpine trip.',
    productUsed: 'Valence M2 Prism',
  },
  {
    id: 'rev-2',
    name: 'Marcus Sterling',
    role: 'Specialty Coffee Roaster',
    location: 'Portland · Sample Review',
    rating: 5,
    avatar: '/images/avatar-2.png',
    quote:
      'We tested single-dose espresso beans inside the X4 Atelier for 18 days—aroma retention matched vacuum-sealed foil with zero oxidation.',
    productUsed: 'Valence X4 Atelier',
  },
  {
    id: 'rev-3',
    name: 'Sora Takahashi',
    role: 'Acoustic Hardware Lead',
    location: 'Tokyo · Sample Review',
    rating: 5,
    avatar: '/images/avatar-3.png',
    quote:
      'The mechanical pop when the silicone pad breaks vacuum is remarkably crisp. Every tolerance feels like precision camera optics.',
    productUsed: 'Valence R9 Titan',
  },
  {
    id: 'rev-4',
    name: 'Camille Laurent',
    role: 'Botanical Perfumer',
    location: 'Paris · Sample Review',
    rating: 5,
    avatar: '/images/avatar-4.png',
    quote:
      'Transporting volatile raw resins used to stain travel cases. With the S1 Cylinder in Obsidian Violet, containment is effortless.',
    productUsed: 'Valence S1 Cylinder',
  },
];
