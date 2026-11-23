import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');

fs.mkdirSync(ICONS_DIR, { recursive: true });
fs.mkdirSync(IMAGES_DIR, { recursive: true });

// --- Pure Node PNG Encoder (RGBA 8-bit) ---
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const combined = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(combined), 0);
  return Buffer.concat([len, combined, crcBuf]);
}

function encodePNG(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const stride = width * 4 + 1;
  const raw = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * stride;
    raw[rowStart] = 0; // filter None
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(raw, { level: 6 });
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function clamp(v, min = 0, max = 1) {
  return v < min ? min : v > max ? max : v;
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

// Fast 2D value noise + FBM for volumetric studio vapor
function hash2(x, y) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function noise2(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  return mix(mix(a, b, ux), mix(c, d, ux), uy);
}

function fbm(x, y) {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  for (let i = 0; i < 4; i++) {
    v += amp * noise2(x * freq, y * freq);
    freq *= 2.03;
    amp *= 0.5;
  }
  return v;
}

function setPixel(buf, idx, r, g, b, a = 255) {
  buf[idx] = clamp(Math.round(r), 0, 255);
  buf[idx + 1] = clamp(Math.round(g), 0, 255);
  buf[idx + 2] = clamp(Math.round(b), 0, 255);
  buf[idx + 3] = clamp(Math.round(a), 0, 255);
}

function renderCanvas(width, height, fn) {
  const buf = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const [r, g, b, a] = fn(nx, ny, x, y);
      setPixel(buf, (y * width + x) * 4, r, g, b, a ?? 255);
    }
  }
  return encodePNG(width, height, buf);
}

// Signed distance to rotated 3D-perspective capsule/cylinder with elliptical end-caps and hinge lug
function drawCylinder(
  u,
  v,
  cx,
  cy,
  angle,
  halfLen,
  radius,
  palTop,
  palBot,
  rimColor,
  sealColor,
  openCap = false
) {
  const dx = u - cx;
  const dy = v - cy;
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const lx = dx * cosA + dy * sinA;
  const ly = -dx * sinA + dy * cosA;

  const tiltY = radius * 0.24; // 3D perspective ellipse foreshortening
  const inRad = Math.abs(lx) <= radius;
  const nxNorm = clamp(lx / radius, -1, 1);
  const ellipseOffset = Math.sqrt(Math.max(0, 1 - nxNorm * nxNorm)) * tiltY;
  const topBound = -halfLen - ellipseOffset * 0.35;
  const botBound = halfLen + ellipseOffset * 0.95;

  let r = 0,
    g = 0,
    b = 0,
    alpha = 0;

  if (inRad && ly >= topBound && ly <= botBound) {
    const nx = nxNorm;
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx));
    const tY = clamp((ly + halfLen) / (2 * halfLen));

    const baseR = mix(palTop[0], palBot[0], tY);
    const baseG = mix(palTop[1], palBot[1], tY);
    const baseB = mix(palTop[2], palBot[2], tY);

    const keyDot = Math.max(0, -0.58 * nx + 0.78 * nz);
    const specSoftbox = Math.pow(Math.max(0, -0.32 * nx + 0.94 * nz), 26);
    const specSharp = Math.pow(Math.max(0, 0.44 * nx + 0.89 * nz), 56);
    const fresnel = Math.pow(1 - nz, 2.4);

    // Subtle machined collar & base grooves
    const groove =
      Math.abs(ly - (halfLen - 0.032)) < 0.004 || Math.abs(ly + (halfLen - 0.032)) < 0.004
        ? 0.68
        : 1.0;

    r = baseR * (0.28 + 0.72 * keyDot) * groove + specSoftbox * 175 + specSharp * 95 + rimColor[0] * fresnel * 0.9;
    g = baseG * (0.28 + 0.72 * keyDot) * groove + specSoftbox * 185 + specSharp * 105 + rimColor[1] * fresnel * 0.9;
    b = baseB * (0.28 + 0.72 * keyDot) * groove + specSoftbox * 200 + specSharp * 115 + rimColor[2] * fresnel * 0.9;

    const edgeAA = smoothstep(radius, radius - 0.0035, Math.abs(lx));
    const capAA = Math.min(smoothstep(topBound, topBound + 0.003, ly), smoothstep(botBound, botBound - 0.003, ly));
    alpha = Math.min(edgeAA, capAA);
  }

  // Dark metallic hinge lug connecting top-right rim to open cap
  if (openCap) {
    const hx = lx - radius * 0.86;
    const hy = ly + halfLen + 0.015;
    if (Math.abs(hx) < radius * 0.22 && Math.abs(hy) < 0.024) {
      r = 46;
      g = 48;
      b = 58;
      alpha = 1;
    }
  }

  // Glowing inner silicone seal pad at mouth of cylinder
  const mouthDist = Math.hypot(lx / (radius * 0.88), (ly + halfLen) / (tiltY * 0.95));
  if (mouthDist <= 1.0) {
    const glow = smoothstep(1.0, 0.65, mouthDist);
    const rimHighlight = smoothstep(0.5, 0.95, mouthDist) * 0.35;
    r = mix(r, sealColor[0] * (0.85 + rimHighlight), 0.92 * glow);
    g = mix(g, sealColor[1] * (0.85 + rimHighlight), 0.92 * glow);
    b = mix(b, sealColor[2] * (0.85 + rimHighlight), 0.92 * glow);
    alpha = Math.max(alpha, glow);
  }

  // Acoustic Pop-Cap & beveled dome
  const capOffsetY = openCap ? -halfLen - 0.058 : -halfLen - 0.012;
  const capCenterX = openCap ? radius * 0.62 : 0;
  const capDx = lx - capCenterX;
  const capDy = ly - capOffsetY;
  const capAngle = openCap ? 0.58 : 0;
  const cX = capDx * Math.cos(capAngle) + capDy * Math.sin(capAngle);
  const cY = -capDx * Math.sin(capAngle) + capDy * Math.cos(capAngle);

  if (Math.abs(cX) <= radius * 1.04 && Math.abs(cY) <= 0.022) {
    const nx = cX / (radius * 1.04);
    const nz = Math.sqrt(Math.max(0, 1 - nx * nx));
    const spec = Math.pow(Math.max(0, -0.3 * nx + 0.94 * nz), 20);
    r = 32 + spec * 165 + rimColor[0] * (1 - nz) * 0.65;
    g = 34 + spec * 170 + rimColor[1] * (1 - nz) * 0.65;
    b = 42 + spec * 190 + rimColor[2] * (1 - nz) * 0.65;
    alpha = 1;
  }

  const clY = clamp(ly, -halfLen, halfLen);
  const dCapsule = Math.hypot(lx, ly - clY) - radius;
  const aura = Math.exp(-Math.max(0, dCapsule) * 16) * 0.55;

  return { r, g, b, alpha, aura };
}

// 1. Generate PWA Icons
function generateIcon(size, maskable = false) {
  const padScale = maskable ? 0.66 : 0.84;
  return renderCanvas(size, size, (nx, ny) => {
    const x = (nx - 0.5) * 2;
    const y = (ny - 0.5) * 2;
    const rad = Math.hypot(x, y);

    // Obsidian background with subtle radial violet-blue core
    let r = 7 + Math.exp(-rad * 2.1) * 26;
    let g = 7 + Math.exp(-rad * 2.4) * 18;
    let b = 12 + Math.exp(-rad * 1.9) * 44;

    if (!maskable) {
      // Rounded square clip aesthetic subtly darkened at corners
      const cornerDist = Math.max(Math.abs(x), Math.abs(y));
      if (cornerDist > 0.94) {
        const k = smoothstep(1.0, 0.94, cornerDist);
        r *= 0.6 + 0.4 * k;
        g *= 0.6 + 0.4 * k;
        b *= 0.6 + 0.4 * k;
      }
    }

    // Outer hexagonal/circular ring
    const sx = x / padScale;
    const sy = y / padScale;
    const sr = Math.hypot(sx, sy);

    const ringDist = Math.abs(sr - 0.72);
    if (ringDist < 0.055) {
      const t = 1 - ringDist / 0.055;
      const gradT = clamp((sx + sy + 1.4) / 2.8);
      const ringR = mix(81, 255, gradT);
      const ringG = mix(244, 77, gradT);
      const ringB = mix(232, 216, gradT);
      r = mix(r, ringR, t * 0.92);
      g = mix(g, ringG, t * 0.92);
      b = mix(b, ringB, t * 0.92);
    }

    // Geometric 'V' vault prism mark inside
    const vLeft = Math.abs(sy - (Math.abs(sx) * 1.55 - 0.36));
    const inV = Math.abs(sx) < 0.38 && sy > -0.38 && sy < 0.42;
    if (inV && vLeft < 0.085) {
      const t = smoothstep(0.085, 0.045, vLeft);
      r = mix(r, 255, t);
      g = mix(g, 255, t);
      b = mix(b, 255, t);
    }

    // Top hermetic seal dot accent inside V
    const dotDist = Math.hypot(sx, sy + 0.16);
    if (dotDist < 0.11) {
      const t = smoothstep(0.11, 0.07, dotDist);
      r = mix(r, 81, t);
      g = mix(g, 244, t);
      b = mix(b, 232, t);
    }

    return [r, g, b, 255];
  });
}

console.log('Generating PWA icons...');
fs.writeFileSync(path.join(PUBLIC_DIR, 'pwa-192x192.png'), generateIcon(192, false));
fs.writeFileSync(path.join(PUBLIC_DIR, 'pwa-512x512.png'), generateIcon(512, false));
fs.writeFileSync(path.join(PUBLIC_DIR, 'pwa-maskable-512x512.png'), generateIcon(512, true));
fs.writeFileSync(path.join(PUBLIC_DIR, 'apple-touch-icon.png'), generateIcon(180, false));
fs.writeFileSync(path.join(ICONS_DIR, 'icon-192.png'), generateIcon(192, false));
fs.writeFileSync(path.join(ICONS_DIR, 'icon-512.png'), generateIcon(512, false));

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#51F4E8"/>
      <stop offset="50%" stop-color="#B44CFF"/>
      <stop offset="100%" stop-color="#FF4DD8"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="112" fill="#050505"/>
  <circle cx="256" cy="256" r="172" fill="none" stroke="url(#g)" stroke-width="18"/>
  <path d="M168 176 L256 352 L344 176" fill="none" stroke="#FFFFFF" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="256" cy="204" r="22" fill="#51F4E8"/>
</svg>`;
fs.writeFileSync(path.join(PUBLIC_DIR, 'icon.svg'), iconSvg);

// 2. Hero Atmosphere (1280x720 -> rendered at 960x540 for crisp fast gen)
console.log('Generating studio visuals...');
fs.writeFileSync(
  path.join(IMAGES_DIR, 'hero-atmosphere.png'),
  renderCanvas(960, 540, (nx, ny) => {
    const aspect = 960 / 540;
    const u = (nx - 0.5) * aspect;
    const v = ny - 0.5;

    // Deep obsidian canvas #050505
    let r = 5,
      g = 5,
      b = 8;

    // Volumetric vapor plumes (fbm)
    const warp = fbm(nx * 3.2, ny * 3.2);
    const plume1 = fbm(nx * 2.5 + warp * 0.9, ny * 2.5 - warp * 0.6);
    const plume2 = fbm(nx * 4.1 - warp * 0.7, ny * 3.4 + warp * 0.8);

    // Warm/Magenta glow upper-left studio rim (like the warm/neon portrait aura in reference)
    const dMagenta = Math.hypot(u + 0.55, v + 0.12);
    const magGlow = Math.exp(-dMagenta * 2.4) * (0.55 + 0.7 * plume1);
    r += magGlow * 235;
    g += magGlow * 55;
    b += magGlow * 165;

    // Electric Purple core wave
    const dPurple = Math.hypot(u + 0.1, v - 0.05);
    const purpGlow = Math.exp(-dPurple * 2.6) * (0.4 + 0.65 * plume2);
    r += purpGlow * 140;
    g += purpGlow * 55;
    b += purpGlow * 230;

    // Cyan / Electric Blue mist sweeping from right
    const dCyan = Math.hypot(u - 0.55, v + 0.05);
    const cyanGlow = Math.exp(-dCyan * 2.1) * (0.45 + 0.75 * plume1);
    r += cyanGlow * 50;
    g += cyanGlow * 195;
    b += cyanGlow * 235;

    // Sculptural diagonal volumetric light ribbon
    const beam1 = Math.exp(-Math.pow((u * 0.7 + v * 1.1 + 0.12) * 5.2, 2)) * (0.28 + 0.45 * plume2);
    const beam2 = Math.exp(-Math.pow((u * 0.85 - v * 0.9 - 0.18) * 6.0, 2)) * (0.22 + 0.35 * plume1);
    r += beam1 * 180 + beam2 * 60;
    g += beam1 * 70 + beam2 * 165;
    b += beam1 * 255 + beam2 * 245;

    // Vignette down to pure #050505 at edges so it melts seamlessly into the page
    const edgeFade = smoothstep(1.05, 0.2, Math.hypot(u * 0.78, v * 1.15));
    r = mix(5, r, edgeFade);
    g = mix(5, g, edgeFade);
    b = mix(5, b, edgeFade);

    return [r, g, b, 255];
  })
);

// 3. Features Dramatic Rim-Lit Atmosphere (for Section 04 right flank)
fs.writeFileSync(
  path.join(IMAGES_DIR, 'features-silhouette.png'),
  renderCanvas(800, 600, (nx, ny) => {
    const aspect = 800 / 600;
    const u = (nx - 0.5) * aspect;
    const v = ny - 0.5;

    let r = 5,
      g = 5,
      b = 8;

    const w = fbm(nx * 3.5, ny * 3.5);
    const smoke = fbm(nx * 5.0 + w * 1.1, ny * 4.0 - w * 0.8);

    // Electric blue + violet cloud center-left
    const c1 = Math.exp(-Math.hypot(u + 0.25, v - 0.05) * 2.5) * (0.45 + 0.75 * smoke);
    r += c1 * 72;
    g += c1 * 115;
    b += c1 * 255;

    // Amber-gold + magenta highlight plume right
    const c2 = Math.exp(-Math.hypot(u - 0.22, v - 0.02) * 2.7) * (0.4 + 0.75 * w);
    r += c2 * 245;
    g += c2 * 105;
    b += c2 * 155;

    // Center hero capsule silhouette rim-lit in cyan & pink
    const cap = drawCylinder(
      u,
      v,
      0.06,
      0.02,
      -0.38,
      0.27,
      0.068,
      [81, 244, 232],
      [180, 76, 255],
      [255, 77, 216],
      [81, 244, 232],
      true
    );
    r += cap.aura * 110;
    g += cap.aura * 190;
    b += cap.aura * 255;
    if (cap.alpha > 0) {
      r = mix(r, cap.r, cap.alpha);
      g = mix(g, cap.g, cap.alpha);
      b = mix(b, cap.b, cap.alpha);
    }

    const fade = smoothstep(0.95, 0.15, Math.hypot(u * 0.85, v * 1.05));
    return [mix(5, r, fade), mix(5, g, fade), mix(5, b, fade), 255];
  })
);

// 4. About Section Dual Translucent Glowing Capsules
fs.writeFileSync(
  path.join(IMAGES_DIR, 'about-dual-capsules.png'),
  renderCanvas(800, 600, (nx, ny) => {
    const aspect = 800 / 600;
    const u = (nx - 0.5) * aspect;
    const v = ny - 0.5;

    let r = 5,
      g = 5,
      b = 8;

    const w = fbm(nx * 3.8, ny * 3.8);
    const smoke = fbm(nx * 6.0 - w, ny * 5.0 + w);
    const mist = Math.pow(smoke, 1.8) * smoothstep(0.9, 0.1, Math.hypot(u, v));
    r += mist * 85;
    g += mist * 95;
    b += mist * 125;

    // Background blurred second capsule
    const bgCap = drawCylinder(
      u,
      v,
      0.26,
      -0.02,
      0.24,
      0.22,
      0.06,
      [180, 76, 255],
      [81, 244, 232],
      [255, 77, 216],
      [81, 244, 232],
      false
    );
    r += bgCap.aura * 160;
    g += bgCap.aura * 75;
    b += bgCap.aura * 210;
    if (bgCap.alpha > 0) {
      r = mix(r, bgCap.r * 0.7, bgCap.alpha * 0.8);
      g = mix(g, bgCap.g * 0.7, bgCap.alpha * 0.8);
      b = mix(b, bgCap.b * 0.7, bgCap.alpha * 0.8);
    }

    // Foreground hero prism capsule
    const fgCap = drawCylinder(
      u,
      v,
      -0.06,
      0.03,
      -0.44,
      0.29,
      0.078,
      [81, 244, 232],
      [180, 76, 255],
      [66, 107, 255],
      [255, 190, 90],
      true
    );
    r += fgCap.aura * 90;
    g += fgCap.aura * 210;
    b += fgCap.aura * 240;
    if (fgCap.alpha > 0) {
      r = mix(r, fgCap.r, fgCap.alpha);
      g = mix(g, fgCap.g, fgCap.alpha);
      b = mix(b, fgCap.b, fgCap.alpha);
    }

    return [r, g, b, 255];
  })
);

// 5. Product Finish Capsules (for Collection cards & Hero switcher)
const finishes = [
  {
    name: 'capsule-obsidian.png',
    top: [92, 52, 165],
    bot: [34, 28, 64],
    rim: [180, 76, 255],
    seal: [81, 244, 232],
    angle: 0.42,
  },
  {
    name: 'capsule-magenta.png',
    top: [255, 77, 216],
    bot: [110, 48, 215],
    rim: [255, 120, 235],
    seal: [255, 180, 90],
    angle: 0.42,
  },
  {
    name: 'capsule-prism.png',
    top: [255, 130, 82],
    bot: [180, 76, 255],
    rim: [81, 244, 232],
    seal: [81, 244, 232],
    angle: 0.42,
  },
  {
    name: 'capsule-aurora.png',
    top: [81, 244, 232],
    bot: [66, 107, 255],
    rim: [180, 76, 255],
    seal: [255, 77, 216],
    angle: 0.42,
  },
];

for (const f of finishes) {
  fs.writeFileSync(
    path.join(IMAGES_DIR, f.name),
    renderCanvas(640, 480, (nx, ny) => {
      const aspect = 640 / 480;
      const u = (nx - 0.5) * aspect;
      const v = ny - 0.5;
      let r = 12,
        g = 12,
        b = 18;

      const bgGlow = Math.exp(-Math.hypot(u, v) * 2.8) * 0.42;
      r += bgGlow * f.rim[0];
      g += bgGlow * f.rim[1];
      b += bgGlow * f.rim[2];

      const cap = drawCylinder(u, v, 0, 0.02, f.angle, 0.26, 0.072, f.top, f.bot, f.rim, f.seal, true);
      r += cap.aura * f.rim[0] * 0.7;
      g += cap.aura * f.rim[1] * 0.7;
      b += cap.aura * f.rim[2] * 0.7;
      if (cap.alpha > 0) {
        r = mix(r, cap.r, cap.alpha);
        g = mix(g, cap.g, cap.alpha);
        b = mix(b, cap.b, cap.alpha);
      }
      return [r, g, b, 255];
    })
  );
}

// 6. Gallery Studio Shots (4 distinct compositions)
const gallerySpecs = [
  {
    file: 'gallery-macro-valve.png',
    render: (u, v, nx, ny) => {
      const smoke = fbm(nx * 4.5, ny * 4.5);
      let r = 8 + smoke * 22,
        g = 8 + smoke * 28,
        b = 14 + smoke * 45;
      const c1 = drawCylinder(u, v, -0.18, 0.02, -0.35, 0.34, 0.095, [225, 228, 238], [135, 145, 165], [81, 244, 232], [81, 244, 232], false);
      const c2 = drawCylinder(u, v, 0.22, -0.02, 0.35, 0.34, 0.095, [225, 228, 238], [135, 145, 165], [255, 77, 216], [255, 160, 75], true);
      for (const c of [c1, c2]) {
        r += c.aura * 95;
        g += c.aura * 135;
        b += c.aura * 210;
        if (c.alpha > 0) {
          r = mix(r, c.r, c.alpha);
          g = mix(g, c.g, c.alpha);
          b = mix(b, c.b, c.alpha);
        }
      }
      return [r, g, b, 255];
    },
  },
  {
    file: 'gallery-iridescent-lineup.png',
    render: (u, v, nx, ny) => {
      let r = 7,
        g = 7,
        b = 12;
      const items = [
        { x: -0.36, t: [92, 52, 165], bt: [34, 28, 64], rim: [180, 76, 255] },
        { x: -0.12, t: [255, 77, 216], bt: [110, 48, 215], rim: [255, 120, 235] },
        { x: 0.12, t: [255, 130, 82], bt: [180, 76, 255], rim: [81, 244, 232] },
        { x: 0.36, t: [81, 244, 232], bt: [66, 107, 255], rim: [81, 244, 232] },
      ];
      const floorGlow = Math.exp(-Math.abs(v - 0.26) * 14) * 0.35;
      r += floorGlow * 66;
      g += floorGlow * 107;
      b += floorGlow * 255;
      for (const it of items) {
        const c = drawCylinder(u, v, it.x, 0.0, 0.0, 0.24, 0.062, it.t, it.bt, it.rim, [81, 244, 232], false);
        r += c.aura * it.rim[0] * 0.5;
        g += c.aura * it.rim[1] * 0.5;
        b += c.aura * it.rim[2] * 0.5;
        if (c.alpha > 0) {
          r = mix(r, c.r, c.alpha);
          g = mix(g, c.g, c.alpha);
          b = mix(b, c.b, c.alpha);
        }
      }
      return [r, g, b, 255];
    },
  },
  {
    file: 'gallery-night-vapor.png',
    render: (u, v, nx, ny) => {
      const w = fbm(nx * 3.0, ny * 3.0);
      const s = fbm(nx * 5.0 + w, ny * 4.0 - w);
      let r = 5 + s * 75,
        g = 5 + s * 35,
        b = 10 + s * 115;
      const c = drawCylinder(u, v, 0.0, 0.02, -0.52, 0.31, 0.088, [180, 76, 255], [66, 107, 255], [255, 77, 216], [81, 244, 232], true);
      r += c.aura * 190;
      g += c.aura * 75;
      b += c.aura * 225;
      if (c.alpha > 0) {
        r = mix(r, c.r, c.alpha);
        g = mix(g, c.g, c.alpha);
        b = mix(b, c.b, c.alpha);
      }
      return [r, g, b, 255];
    },
  },
  {
    file: 'gallery-atelier-bench.png',
    render: (u, v, nx, ny) => {
      let r = 8,
        g = 9,
        b = 14;
      // Precision grid horizon
      if (v > 0.14) {
        const gx = Math.abs(((u * 8) % 1 + 1) % 1 - 0.5);
        const gy = Math.abs(((v * 10) % 1 + 1) % 1 - 0.5);
        if (gx > 0.47 || gy > 0.47) {
          const fade = smoothstep(0.14, 0.45, v);
          r += fade * 24;
          g += fade * 62;
          b += fade * 95;
        }
      }
      const c = drawCylinder(u, v, 0.0, -0.04, 0.78, 0.34, 0.078, [81, 244, 232], [66, 107, 255], [81, 244, 232], [255, 77, 216], false);
      r += c.aura * 81;
      g += c.aura * 200;
      b += c.aura * 235;
      if (c.alpha > 0) {
        r = mix(r, c.r, c.alpha);
        g = mix(g, c.g, c.alpha);
        b = mix(b, c.b, c.alpha);
      }
      return [r, g, b, 255];
    },
  },
];

for (const gs of gallerySpecs) {
  fs.writeFileSync(
    path.join(IMAGES_DIR, gs.file),
    renderCanvas(800, 600, (nx, ny) => {
      const u = (nx - 0.5) * (800 / 600);
      const v = ny - 0.5;
      return gs.render(u, v, nx, ny);
    })
  );
}

// 7. Customer Portrait Avatars (Stylized lit studio avatars)
const avatarColors = [
  [180, 76, 255],
  [81, 244, 232],
  [66, 107, 255],
  [255, 77, 216],
];
avatarColors.forEach((col, i) => {
  fs.writeFileSync(
    path.join(IMAGES_DIR, `avatar-${i + 1}.png`),
    renderCanvas(128, 128, (nx, ny) => {
      const u = (nx - 0.5) * 2;
      const v = (ny - 0.5) * 2;
      let r = 14 + (1 - ny) * 18,
        g = 14 + (1 - ny) * 16,
        b = 22 + (1 - ny) * 26;
      const rim = Math.exp(-Math.hypot(u - 0.35, v + 0.35) * 1.8) * 0.45;
      r += rim * col[0];
      g += rim * col[1];
      b += rim * col[2];

      // Stylized studio head & shoulders silhouette
      const head = Math.hypot(u, v + 0.22) - 0.34;
      const shoulders = Math.hypot(u * 0.72, v - 0.78) - 0.62;
      const d = Math.min(head, shoulders);
      if (d < 0) {
        const edgeRim = smoothstep(-0.14, 0.0, d);
        r = mix(24, col[0], edgeRim * 0.75);
        g = mix(24, col[1], edgeRim * 0.75);
        b = mix(32, col[2], edgeRim * 0.75);
      }
      return [r, g, b, 255];
    })
  );
});

console.log('All PNG & SVG assets generated successfully.');
