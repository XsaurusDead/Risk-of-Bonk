// 2D pixel-art sprites -> animated 3D voxel models.
//
// Every opaque pixel of a sprite frame becomes a voxel column. Its thickness grows with the
// distance to the sprite's outline (sqrt falloff), so shapes come out rounded ("inflated")
// instead of flat cut-outs; equal neighbours are merged into larger faces. Each animation
// frame becomes its own small geometry and enemies flip through them like a flipbook, on top
// of the game's usual squash/lean/bob animation.
//
// The source art (assets/models/Enemies, assets/models/Normal enemies) is copied to
// assets/sprites/ by tools/ (see README) so the game only ships what it uses.
import * as THREE from 'three';

const S = 'assets/sprites/';

/**
 * src:    image url (a sheet; `cell` = frame size) or an array of image urls (one per frame)
 * row/n:  which row of the sheet, and how many frames (or `frames`: explicit indices)
 * fps:    playback speed; `loop: false` holds the last frame (attacks, deaths)
 * height: model height in metres (measured on the first idle frame)
 * px:     resample factor for big sprites (0.5 = every other pixel)
 * depth:  thickness multiplier (1 = default rounding)
 */
const range = (n, step = 1, from = 0) => Array.from({ length: Math.ceil((n - from) / step) }, (_, i) => from + i * step);
const files = (dir, name, n, from = 1) => range(n + from, 1, from).map((i) => `${S}${dir}/${name}${i}.png`);

export const VOX_MODELS = {
  // ---------------------------------------------------------------- bosses
  kingslime: {
    height: 5.5, depth: 1.25,
    anims: {
      idle: { src: files('kingslime', 'idle', 4), fps: 6 },
      walk: { src: files('kingslime', 'move', 3), fps: 7 },
      attack: { src: files('kingslime', 'attack', 5), fps: 9, loop: false },
    },
  },
  rockboss: {
    height: 6, depth: 1.0,
    // top-down sheets: 4 rows = facing up / left / right / down; the "down" row faces the camera
    anims: {
      idle: { src: S + 'rockboss/idle.png', cell: [64, 64], row: 3, n: 7, fps: 7 },
      walk: { src: S + 'rockboss/walk.png', cell: [64, 64], row: 3, n: 10, fps: 10 },
      stomp: { src: S + 'rockboss/stomp.png', cell: [64, 64], row: 3, n: 13, fps: 11, loop: false },
      swipe: { src: S + 'rockboss/swipe.png', cell: [64, 64], row: 3, n: 10, fps: 12, loop: false },
    },
  },
  demon: {
    height: 7, depth: 0.9, px: 0.5,
    anims: {
      idle: { src: S + 'demon/sheet.png', cell: [288, 160], row: 0, n: 6, fps: 8 },
      walk: { src: S + 'demon/sheet.png', cell: [288, 160], row: 1, frames: range(12, 2), fps: 7 },
      cleave: { src: S + 'demon/sheet.png', cell: [288, 160], row: 2, frames: range(15), fps: 13, loop: false },
      hit: { src: S + 'demon/sheet.png', cell: [288, 160], row: 3, n: 5, fps: 12, loop: false },
      death: { src: S + 'demon/sheet.png', cell: [288, 160], row: 4, frames: range(22, 2), fps: 9, loop: false },
    },
  },
  // ---------------------------------------------------------------- normal enemies
  pumpkin: {
    height: 1.9, depth: 1.1,
    anims: {
      idle: { src: S + 'fantasy/pumpkin.png', cell: [112, 112], row: 0, n: 4, fps: 6 },
      walk: { src: S + 'fantasy/pumpkin.png', cell: [112, 112], row: 1, n: 4, fps: 8 },
      attack: { src: S + 'fantasy/pumpkin.png', cell: [112, 112], row: 2, n: 6, fps: 10, loop: false },
      death: { src: S + 'fantasy/pumpkin.png', cell: [112, 112], row: 5, n: 7, fps: 10, loop: false },
    },
  },
  cloud: {
    height: 1.5, depth: 1.4,
    anims: {
      idle: { src: S + 'fantasy/cloud.png', cell: [112, 112], row: 0, n: 4, fps: 6 },
      walk: { src: S + 'fantasy/cloud.png', cell: [112, 112], row: 2, n: 5, fps: 8 },
      attack: { src: S + 'fantasy/cloud.png', cell: [112, 112], row: 1, frames: range(12, 2), fps: 9, loop: false },
      death: { src: S + 'fantasy/cloud.png', cell: [112, 112], row: 6, n: 6, fps: 9, loop: false },
    },
  },
  spirit: {
    height: 2.4, depth: 1.0,
    anims: {
      idle: { src: S + 'fantasy/spirit.png', cell: [112, 112], row: 0, frames: range(14, 2), fps: 7 },
      attack: { src: S + 'fantasy/spirit.png', cell: [112, 112], row: 1, frames: range(14, 2), fps: 10, loop: false },
      death: { src: S + 'fantasy/spirit.png', cell: [112, 112], row: 4, n: 9, fps: 10, loop: false },
    },
  },
  // overtime ghosts: the Cursed Spirit recoloured into a pale, spectral cyan
  ghost: {
    height: 2.6, depth: 1.1, recolor: 'ghost',
    anims: {
      idle: { src: S + 'fantasy/spirit.png', cell: [112, 112], row: 0, frames: range(14, 2), fps: 10 },
      attack: { src: S + 'fantasy/spirit.png', cell: [112, 112], row: 1, frames: range(14, 2), fps: 12, loop: false },
    },
  },
  // one pose each in three colours: animated by the game (waddle, bob, lean, squash)
  skeleton_teal: { height: 2.1, depth: 1.0, anims: { idle: { src: [S + 'monsters/skeleton1.png'] } } },
  skeleton_gold: { height: 2.1, depth: 1.0, anims: { idle: { src: [S + 'monsters/skeleton2.png'] } } },
  skeleton_dark: { height: 2.1, depth: 1.0, anims: { idle: { src: [S + 'monsters/skeleton3.png'] } } },
  fish_teal: { height: 1.7, depth: 1.2, anims: { idle: { src: [S + 'monsters/fish1.png'] } } },
  fish_grey: { height: 1.7, depth: 1.2, anims: { idle: { src: [S + 'monsters/fish2.png'] } } },
  fish_blue: { height: 1.7, depth: 1.2, anims: { idle: { src: [S + 'monsters/fish3.png'] } } },
};

/** Which way side-view sprites look in the source art (front-facing ones aren't listed). */
export const VOX_FACING = {
  demon: 'left', pumpkin: 'right', skeleton_teal: 'right', skeleton_gold: 'right', skeleton_dark: 'right',
  fish_teal: 'right', fish_grey: 'right', fish_blue: 'right',
};

// ------------------------------------------------------------------ loading
const images = new Map(); // url -> Promise<ImageData>
function loadImageData(url) {
  if (!images.has(url)) {
    images.set(url, new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(img, 0, 0);
        res(g.getImageData(0, 0, img.width, img.height));
      };
      img.onerror = () => rej(new Error('image failed: ' + url));
      img.src = url;
    }));
  }
  return images.get(url);
}

/** Cut frame `i` out of an anim spec: { w, h, px: Uint8ClampedArray RGBA }. */
const RECOLOR = {
  // greyscale lifted into icy cyan, brightest parts nearly white
  ghost: (r, g, b) => {
    const l = 0.3 * r + 0.59 * g + 0.11 * b;
    return [Math.min(255, l * 0.55 + 40), Math.min(255, l * 0.95 + 70), Math.min(255, l * 1.05 + 95)];
  },
};

async function frameData(spec, i, px, recolor) {
  let data, x0 = 0, y0 = 0, w, h;
  if (Array.isArray(spec.src)) {
    data = await loadImageData(spec.src[i]);
    w = data.width;
    h = data.height;
  } else {
    data = await loadImageData(spec.src);
    [w, h] = spec.cell;
    x0 = i * w;
    y0 = (spec.row || 0) * h;
  }
  const step = px < 1 ? Math.round(1 / px) : 1;
  const ow = Math.floor(w / step), oh = Math.floor(h / step);
  const out = new Uint8ClampedArray(ow * oh * 4);
  for (let y = 0; y < oh; y++) {
    for (let x = 0; x < ow; x++) {
      // when downsampling, take the most opaque pixel of the block (keeps thin outlines)
      let best = -1, bi = 0;
      for (let dy = 0; dy < step; dy++) {
        for (let dx = 0; dx < step; dx++) {
          const si = ((y0 + y * step + dy) * data.width + (x0 + x * step + dx)) * 4;
          if (data.data[si + 3] > best) { best = data.data[si + 3]; bi = si; }
        }
      }
      const o = (y * ow + x) * 4;
      out.set(data.data.subarray(bi, bi + 4), o);
      if (recolor) {
        const [r, g, b] = recolor(out[o], out[o + 1], out[o + 2]);
        out[o] = r;
        out[o + 1] = g;
        out[o + 2] = b;
      }
    }
  }
  return { w: ow, h: oh, px: out };
}

const frameList = (spec) => spec.frames || (Array.isArray(spec.src) ? range(spec.src.length) : range(spec.n || 1));

/** Opaque bounding box of a frame. */
function bbox(f) {
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) {
    if (f.px[(y * f.w + x) * 4 + 3] < 110) continue;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  return x1 < 0 ? null : { x0, y0, x1, y1 };
}

const _c = new THREE.Color();

/**
 * Build the voxel geometry of one frame. Pivot: bottom-centre of the model (cx, bottom),
 * `s` metres per pixel. Faces: +Z is the front.
 */
function buildFrameGeometry(f, cx, bottom, s, depthMul) {
  const { w, h, px } = f;
  const N = w * h;
  // chamfer distance to the outline (in pixels)
  const INF = 1e6;
  const dist = new Float32Array(N);
  for (let i = 0; i < N; i++) dist[i] = px[i * 4 + 3] >= 110 ? INF : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (!dist[i]) continue;
    let d = dist[i];
    d = Math.min(d, x > 0 ? dist[i - 1] + 1 : 1, y > 0 ? dist[i - w] + 1 : 1);
    if (x > 0 && y > 0) d = Math.min(d, dist[i - w - 1] + 1.414);
    if (x < w - 1 && y > 0) d = Math.min(d, dist[i - w + 1] + 1.414);
    dist[i] = d;
  }
  for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
    const i = y * w + x;
    if (!dist[i]) continue;
    let d = dist[i];
    d = Math.min(d, x < w - 1 ? dist[i + 1] + 1 : 1, y < h - 1 ? dist[i + w] + 1 : 1);
    if (x < w - 1 && y < h - 1) d = Math.min(d, dist[i + w + 1] + 1.414);
    if (x > 0 && y < h - 1) d = Math.min(d, dist[i + w - 1] + 1.414);
    dist[i] = d;
  }
  // half-thickness per pixel, in whole pixels (terraces merge better than smooth depths)
  const half = new Int16Array(N);
  for (let i = 0; i < N; i++) if (dist[i]) half[i] = Math.max(1, Math.round(Math.sqrt(dist[i]) * 1.35 * depthMul));
  const col = (i) => (px[i * 4] << 16) | (px[i * 4 + 1] << 8) | px[i * 4 + 2];

  const pos = [], nor = [], colr = [], idx = [];
  const quad = (ax, ay, az, bx, by, bz, cx2, cy2, cz2, dx, dy, dz, nx, ny, nz, rgb, shade) => {
    const v = pos.length / 3;
    pos.push(ax, ay, az, bx, by, bz, cx2, cy2, cz2, dx, dy, dz);
    for (let k = 0; k < 4; k++) nor.push(nx, ny, nz);
    _c.setRGB(((rgb >> 16) & 255) / 255, ((rgb >> 8) & 255) / 255, (rgb & 255) / 255, THREE.SRGBColorSpace);
    for (let k = 0; k < 4; k++) colr.push(_c.r * shade, _c.g * shade, _c.b * shade);
    idx.push(v, v + 1, v + 2, v, v + 2, v + 3);
  };
  const X = (x) => (x - cx) * s, Y = (y) => (bottom - y) * s, Z = (z) => z * s;
  // front/back faces: merge horizontal runs with the same colour and depth
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      const i = y * w + x;
      if (!half[i]) { x++; continue; }
      const c = col(i), hz = half[i];
      let e = x + 1;
      while (e < w && half[y * w + e] === hz && col(y * w + e) === c) e++;
      const x0 = X(x), x1 = X(e), yt = Y(y), yb = Y(y + 1), z = Z(hz);
      quad(x0, yb, z, x1, yb, z, x1, yt, z, x0, yt, z, 0, 0, 1, c, 1);
      quad(x1, yb, -z, x0, yb, -z, x0, yt, -z, x1, yt, -z, 0, 0, -1, c, 1);
      x = e;
    }
  }
  // side walls: wherever a neighbour is thinner (or empty), expose the step. Walls with the
  // same colour and the same step are merged along runs (vertical runs for left/right walls,
  // horizontal runs for top/bottom walls).
  const hAt = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : half[y * w + x]);
  const bandsOf = (hn, hz) => (hn ? [[Z(hn), Z(hz)], [Z(-hz), Z(-hn)]] : [[Z(-hz), Z(hz)]]);
  // left (-x) and right (+x) walls: runs down each column
  for (const nx of [-1, 1]) {
    for (let x = 0; x < w; x++) {
      let y = 0;
      while (y < h) {
        const i = y * w + x, hz = half[i], hn = hAt(x + nx, y);
        if (!hz || hn >= hz) { y++; continue; }
        const c = col(i);
        let e = y + 1;
        while (e < h && half[e * w + x] === hz && hAt(x + nx, e) === hn && col(e * w + x) === c) e++;
        const xx = nx < 0 ? X(x) : X(x + 1), yt = Y(y), yb = Y(e);
        for (const [za, zb] of bandsOf(hn, hz)) {
          if (nx < 0) quad(xx, yb, za, xx, yb, zb, xx, yt, zb, xx, yt, za, -1, 0, 0, c, 0.88);
          else quad(xx, yb, zb, xx, yb, za, xx, yt, za, xx, yt, zb, 1, 0, 0, c, 0.88);
        }
        y = e;
      }
    }
  }
  // top (pixel above) and bottom (pixel below) walls: runs along each row
  for (const dy of [-1, 1]) {
    for (let y = 0; y < h; y++) {
      let x = 0;
      while (x < w) {
        const i = y * w + x, hz = half[i], hn = hAt(x, y + dy);
        if (!hz || hn >= hz) { x++; continue; }
        const c = col(i);
        let e = x + 1;
        while (e < w && half[y * w + e] === hz && hAt(e, y + dy) === hn && col(y * w + e) === c) e++;
        const x0 = X(x), x1 = X(e);
        for (const [za, zb] of bandsOf(hn, hz)) {
          if (dy < 0) { const yt = Y(y); quad(x0, yt, zb, x1, yt, zb, x1, yt, za, x0, yt, za, 0, 1, 0, c, 1.05); }
          else { const yb = Y(y + 1); quad(x0, yb, za, x1, yb, za, x1, yb, zb, x0, yb, zb, 0, -1, 0, c, 0.7); }
        }
        x = e;
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colr, 3));
  g.setIndex(pos.length / 3 > 65535 ? new THREE.Uint32BufferAttribute(idx, 1) : new THREE.Uint16BufferAttribute(idx, 1));
  g.computeBoundingSphere();
  return g;
}

const models = {}; // key -> { anims: { name: { geos, fps, loop } }, height }
const loading = {};

/** Load and build a voxel model (once). Resolves true when ready. */
export function loadVoxModel(key) {
  const def = VOX_MODELS[key];
  if (!def) return Promise.resolve(false);
  if (models[key]) return Promise.resolve(true);
  loading[key] ||= (async () => {
    const pxs = def.px || 1;
    const raw = {};
    for (const [name, spec] of Object.entries(def.anims)) {
      raw[name] = await Promise.all(frameList(spec).map((i) => frameData(spec, i, pxs, RECOLOR[def.recolor])));
    }
    // pivot and scale from the idle frames: centred, feet at the bottom of the art
    let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
    for (const f of raw.idle) {
      const b = bbox(f);
      if (!b) continue;
      x0 = Math.min(x0, b.x0); x1 = Math.max(x1, b.x1); y0 = Math.min(y0, b.y0); y1 = Math.max(y1, b.y1);
    }
    const cx = (x0 + x1 + 1) / 2, bottom = y1 + 1;
    const s = def.height / Math.max(1, y1 + 1 - y0);
    const anims = {};
    for (const [name, frames] of Object.entries(raw)) {
      const spec = def.anims[name];
      anims[name] = { geos: frames.map((f) => buildFrameGeometry(f, cx, bottom, s, def.depth || 1)), fps: spec.fps || 8, loop: spec.loop !== false };
    }
    models[key] = { anims, height: def.height };
    return true;
  })().catch((e) => {
    console.warn('[voxelsprites] could not build', key, e?.message);
    return false;
  });
  return loading[key];
}

export const hasVoxModel = (key) => !!models[key];

/** A new animated instance: { mesh, vox }. `mat` is the enemy's own material (vertex colours). */
export function buildVoxModel(key, mat) {
  const m = models[key];
  if (!m) return null;
  mat.vertexColors = true;
  mat.color.setRGB(1, 1, 1);
  mat.map = null;
  mat.needsUpdate = true;
  const mesh = new THREE.Mesh(m.anims.idle.geos[0], mat);
  mesh.castShadow = true;
  return { mesh, vox: { model: m, name: 'idle', t: 0, frame: 0, done: false } };
}

/** Switch animation (restarts it unless it's already playing). */
export function setVoxAnim(v, name, restart = false) {
  if (!v.model.anims[name]) name = v.model.anims.walk && name === 'run' ? 'walk' : 'idle';
  if (v.name === name && !restart) return;
  v.name = name;
  v.t = 0;
  v.done = false;
}

export const voxAnimLength = (v, name) => {
  const a = v.model.anims[name];
  return a ? a.geos.length / a.fps : 0;
};
export const hasVoxAnim = (v, name) => !!v.model.anims[name];

/** Advance the flipbook and put the current frame on the mesh. */
export function updateVox(v, mesh, dt, speed = 1) {
  const a = v.model.anims[v.name];
  v.t += dt * speed;
  let f = Math.floor(v.t * a.fps);
  if (a.loop) f %= a.geos.length;
  else if (f >= a.geos.length) {
    f = a.geos.length - 1;
    v.done = true;
  }
  if (mesh.geometry !== a.geos[f]) mesh.geometry = a.geos[f];
}
