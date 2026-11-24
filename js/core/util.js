// Small math / random / noise / spatial helpers shared by the whole game.

export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a = 0, b = 1) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const chance = (p) => Math.random() < p;
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const dist2D = (ax, az, bx, bz) => Math.hypot(ax - bx, az - bz);

export function angleDiff(a, b) {
  let d = b - a;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
export function lerpAngle(a, b, t) {
  return a + angleDiff(a, b) * t;
}

/** Weighted random pick. weights: {key: weight} */
export function weightedPick(weights) {
  let total = 0;
  for (const k in weights) total += Math.max(0, weights[k]);
  let r = Math.random() * total;
  for (const k in weights) {
    r -= Math.max(0, weights[k]);
    if (r <= 0) return k;
  }
  return Object.keys(weights)[0];
}

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Seeded 2D gradient (Perlin-style) noise, returns roughly -1..1 */
export function makeNoise2D(seed) {
  const rng = mulberry32(seed);
  const perm = new Uint8Array(512);
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const grads = [
    [1, 0], [-1, 0], [0, 1], [0, -1],
    [0.7071, 0.7071], [-0.7071, 0.7071], [0.7071, -0.7071], [-0.7071, -0.7071],
  ];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  return function (x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const X = xi & 255, Y = yi & 255;
    const g = (hx, hy, dx, dy) => {
      const gr = grads[perm[hx + perm[hy]] & 7];
      return gr[0] * dx + gr[1] * dy;
    };
    const n00 = g(X, Y, xf, yf);
    const n10 = g(X + 1, Y, xf - 1, yf);
    const n01 = g(X, Y + 1, xf, yf - 1);
    const n11 = g(X + 1, Y + 1, xf - 1, yf - 1);
    const u = fade(xf), v = fade(yf);
    return lerp(lerp(n00, n10, u), lerp(n01, n11, u), v) * 1.4;
  };
}

export function fbm(noise, x, y, octaves = 4, lac = 2, gain = 0.5) {
  let amp = 1, freq = 1, sum = 0, norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += noise(x * freq, y * freq) * amp;
    norm += amp;
    amp *= gain;
    freq *= lac;
  }
  return sum / norm;
}

/** Uniform-grid spatial hash on the XZ plane. Rebuilt every frame. */
export class SpatialHash {
  constructor(cell = 6) {
    this.cell = cell;
    this.map = new Map();
    this.pool = [];
  }
  key(ix, iz) {
    return (ix + 1000) * 4096 + (iz + 1000);
  }
  clear() {
    for (const arr of this.map.values()) {
      arr.length = 0;
      this.pool.push(arr);
    }
    this.map.clear();
  }
  insert(obj, x, z) {
    const k = this.key(Math.floor(x / this.cell), Math.floor(z / this.cell));
    let arr = this.map.get(k);
    if (!arr) {
      arr = this.pool.pop() || [];
      this.map.set(k, arr);
    }
    arr.push(obj);
  }
  query(x, z, r, out = []) {
    out.length = 0;
    const c = this.cell;
    const x0 = Math.floor((x - r) / c), x1 = Math.floor((x + r) / c);
    const z0 = Math.floor((z - r) / c), z1 = Math.floor((z + r) / c);
    for (let ix = x0; ix <= x1; ix++) {
      for (let iz = z0; iz <= z1; iz++) {
        const arr = this.map.get(this.key(ix, iz));
        if (arr) for (let i = 0; i < arr.length; i++) out.push(arr[i]);
      }
    }
    return out;
  }
}

export function formatTime(sec) {
  sec = Math.max(0, Math.floor(sec));
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e4) return (n / 1e3).toFixed(1) + 'k';
  return Math.round(n).toString();
}

export const RARITY = {
  common: { name: 'Common', color: '#e8e8e8', hex: 0xe8e8e8, order: 0 },
  rare: { name: 'Rare', color: '#4fb3ff', hex: 0x4fb3ff, order: 1 },
  epic: { name: 'Epic', color: '#c461ff', hex: 0xc461ff, order: 2 },
  legendary: { name: 'Legendary', color: '#ffb22e', hex: 0xffb22e, order: 3 },
};
export const RARITY_ORDER = ['common', 'rare', 'epic', 'legendary'];
