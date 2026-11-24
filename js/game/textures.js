// Procedural, tileable detail textures generated on canvases at startup.
// They are mostly greyscale so they multiply nicely with vertex colours:
// one texture adds surface detail (and bump on high quality) to many parts.
import * as THREE from 'three';
import { mulberry32 } from '../core/util.js';

const cache = new Map();

/** Periodic value noise (tiles seamlessly) on a size x size grid. */
function tileNoise(size, period, seed) {
  const rng = mulberry32(seed);
  const g = new Float32Array(period * period);
  for (let i = 0; i < g.length; i++) g[i] = rng();
  const out = new Float32Array(size * size);
  const s = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * period, fy = (y / size) * period;
      const x0 = Math.floor(fx), y0 = Math.floor(fy);
      const u = s(fx - x0), v = s(fy - y0);
      const x1 = (x0 + 1) % period, y1 = (y0 + 1) % period;
      const a = g[y0 * period + x0], b = g[y0 * period + x1], c = g[y1 * period + x0], d = g[y1 * period + x1];
      out[y * size + x] = (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v;
    }
  }
  return out;
}
function fbmTile(size, seed, periods = [4, 8, 16, 32], gains = [0.5, 0.25, 0.15, 0.1]) {
  const out = new Float32Array(size * size);
  periods.forEach((p, i) => {
    const n = tileNoise(size, p, seed + i * 101);
    for (let k = 0; k < out.length; k++) out[k] += n[k] * gains[i];
  });
  const tot = gains.reduce((a, b) => a + b, 0);
  for (let k = 0; k < out.length; k++) out[k] /= tot;
  return out;
}
/** Tileable Worley-ish cells: returns distance to nearest feature point (0..~1). */
function cellTile(size, cells, seed) {
  const rng = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < cells; i++) pts.push([rng() * size, rng() * size]);
  const out = new Float32Array(size * size);
  const norm = size / Math.sqrt(cells);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let d1 = 1e9, d2 = 1e9;
      for (const [px, py] of pts) {
        let dx = Math.abs(x - px), dy = Math.abs(y - py);
        if (dx > size / 2) dx = size - dx;
        if (dy > size / 2) dy = size - dy;
        const d = dx * dx + dy * dy;
        if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
      }
      out[y * size + x] = Math.min(1, (Math.sqrt(d2) - Math.sqrt(d1)) / norm); // edge distance
    }
  }
  return out;
}

function toTexture(size, valueFn, tint = null) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i++) {
    let v = valueFn(i);
    v = Math.max(0, Math.min(1, v));
    const r = tint ? tint[0] * v : v, g = tint ? tint[1] * v : v, b = tint ? tint[2] * v : v;
    img.data[i * 4] = r * 255;
    img.data[i * 4 + 1] = g * 255;
    img.data[i * 4 + 2] = b * 255;
    img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// ------------------------------------------------------------------ terrain
const TERRAIN = {
  meadows: (S) => { const n = fbmTile(S, 11), b = tileNoise(S, 64, 12); return (i) => 0.78 + n[i] * 0.22 + (b[i] > 0.72 ? 0.06 : 0) - (b[i] < 0.18 ? 0.08 : 0); },
  dunes: (S) => { const n = fbmTile(S, 21); return (i) => { const y = Math.floor(i / S), x = i % S; return 0.84 + Math.sin((y + n[i] * 40) * 0.25 + x * 0.02) * 0.07 + n[i] * 0.1; }; },
  peaks: (S) => { const n = fbmTile(S, 31, [4, 8, 16]); const sp = tileNoise(S, 96, 32); return (i) => 0.86 + n[i] * 0.12 + (sp[i] > 0.85 ? 0.08 : 0); },
  hollow: (S) => { const c = cellTile(S, 40, 41), n = fbmTile(S, 42); return (i) => 0.7 + c[i] * 0.25 + n[i] * 0.1; },
  caldera: (S) => { const c = cellTile(S, 26, 51), n = fbmTile(S, 52); return (i) => (c[i] < 0.08 ? 0.45 : 0.78) + n[i] * 0.2; },
  void: (S) => { const c = cellTile(S, 18, 61), n = fbmTile(S, 62); return (i) => (c[i] < 0.05 ? 1.0 : 0.72) + n[i] * 0.18; },
  throne: (S) => { const n = fbmTile(S, 71, [2, 4, 8]); return (i) => { const v = Math.abs(Math.sin(n[i] * 18)); return 0.82 + v * 0.14; }; },
};
export function terrainDetailTexture(stageId) {
  const key = 'terrain_' + stageId;
  if (!cache.has(key)) {
    const S = 256;
    const fn = (TERRAIN[stageId] || TERRAIN.meadows)(S);
    cache.set(key, toTexture(S, fn));
  }
  return cache.get(key);
}

// ------------------------------------------------------------------ creatures
// Each pattern is a distinct "skin": slime gloss, scales, cracked stone, chitin
// bands, fur, crystal facets, lava cracks, void veins, bark, metal plates…
const SKINS = {
  slime: (S) => { const n = fbmTile(S, 101, [2, 4]), sp = tileNoise(S, 24, 102); return (i) => 0.82 + n[i] * 0.15 + (sp[i] > 0.8 ? 0.12 : 0); },
  scales: (S) => { const c = cellTile(S, 90, 111); return (i) => 0.6 + Math.min(1, c[i] * 4) * 0.4; },
  stone: (S) => { const c = cellTile(S, 22, 121), n = fbmTile(S, 122); return (i) => (c[i] < 0.06 ? 0.45 : 0.75) + n[i] * 0.25; },
  chitin: (S) => { const n = fbmTile(S, 131, [4, 8]); return (i) => { const y = Math.floor(i / S); return 0.72 + (Math.sin(y * 0.3 + n[i] * 3) > 0.6 ? 0.2 : 0) + n[i] * 0.1; }; },
  fur: (S) => { const n = tileNoise(S, 128, 141), m = fbmTile(S, 142, [4, 8]); return (i) => 0.65 + n[i] * 0.25 + m[i] * 0.12; },
  crystal: (S) => { const c = cellTile(S, 16, 151); return (i) => 0.7 + c[i] * 0.45; },
  lava: (S) => { const c = cellTile(S, 30, 161), n = fbmTile(S, 162); return (i) => (c[i] < 0.07 ? 1.15 : 0.55) + n[i] * 0.2; },
  void: (S) => { const n = fbmTile(S, 171, [2, 4, 8, 16]); return (i) => 0.6 + Math.pow(Math.abs(Math.sin(n[i] * 24)), 8) * 0.5 + n[i] * 0.1; },
  bark: (S) => { const n = fbmTile(S, 181, [8, 16, 32]); return (i) => { const x = i % S; return 0.7 + Math.sin(x * 0.35 + n[i] * 8) * 0.12 + n[i] * 0.12; }; },
  metal: (S) => { const n = fbmTile(S, 191, [8, 32]); return (i) => { const x = i % S, y = Math.floor(i / S); return (x % 64 < 2 || y % 64 < 2 ? 0.55 : 0.88) + n[i] * 0.1 + ((x % 64 === 8 && y % 64 === 8) ? 0.2 : 0); }; },
  spots: (S) => { const c = cellTile(S, 14, 201), n = fbmTile(S, 202); return (i) => (c[i] > 0.4 ? 0.65 : 0.92) + n[i] * 0.08; },
  feather: (S) => { const n = fbmTile(S, 211, [8, 16]); return (i) => { const x = i % S, y = Math.floor(i / S); return 0.72 + Math.abs(Math.sin((x + y * 0.5) * 0.2)) * 0.2 + n[i] * 0.1; }; },
  bone: (S) => { const n = fbmTile(S, 221, [4, 16, 32]); return (i) => 0.85 + n[i] * 0.15 - (n[i] > 0.7 ? 0.1 : 0); },
  mushroom: (S) => { const c = cellTile(S, 20, 231), n = fbmTile(S, 232); return (i) => (c[i] > 0.5 ? 1.0 : 0.82) + n[i] * 0.08; },
  ice: (S) => { const c = cellTile(S, 24, 241), n = fbmTile(S, 242, [2, 4]); return (i) => 0.85 + (c[i] < 0.04 ? 0.15 : 0) + n[i] * 0.12; },
  royal: (S) => { const n = fbmTile(S, 251, [2, 4, 8]); return (i) => { const x = i % S, y = Math.floor(i / S); return 0.85 + (((x + y) % 32) < 2 ? 0.15 : 0) + n[i] * 0.08; }; },
};
export const SKIN_NAMES = Object.keys(SKINS);

export function skinTexture(name) {
  const key = 'skin_' + name;
  if (!cache.has(key)) {
    const S = 128;
    const fn = (SKINS[name] || SKINS.stone)(S);
    cache.set(key, toTexture(S, fn));
  }
  return cache.get(key);
}
