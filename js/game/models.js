// Procedural low-poly models built from primitives. Enemies/props are merged
// into a single vertex-coloured geometry (1-2 draw calls each); characters are
// kept as a hierarchy so limbs can animate.
import * as THREE from 'three';
import { addTriplanar } from './stone.js';
import { G } from '../core/state.js';

const PRIMS = {};
export function prim(shape) {
  if (PRIMS[shape]) return PRIMS[shape];
  let g;
  switch (shape) {
    case 'box': g = new THREE.BoxGeometry(1, 1, 1); break;
    case 'sphere': g = new THREE.SphereGeometry(0.5, 16, 11); break;
    case 'cyl': g = new THREE.CylinderGeometry(0.5, 0.5, 1, 14); break;
    case 'cone': g = new THREE.ConeGeometry(0.5, 1, 12); break;
    case 'blade': g = new THREE.ConeGeometry(0.5, 1, 3); break;
    case 'ico': g = new THREE.IcosahedronGeometry(0.5, 0); break;
    case 'tetra': g = new THREE.TetrahedronGeometry(0.5); break;
    case 'oct': g = new THREE.OctahedronGeometry(0.5); break;
    case 'torus': g = new THREE.TorusGeometry(0.5, 0.12, 6, 14); break;
    case 'dodeca': g = new THREE.DodecahedronGeometry(0.5); break;
    default: g = new THREE.BoxGeometry(1, 1, 1);
  }
  if (g.index) g = g.toNonIndexed();
  g.deleteAttribute('uv');
  PRIMS[shape] = g;
  return g;
}

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();

/** parts: [shape, color, pos, scale, rot?, glow?] -> {geo, glow} merged geometries */
export function buildMerged(parts, scaleAll = 1) {
  const normal = [], glow = [];
  for (const part of parts) {
    const [shape, color, pos, scale, rot, isGlow] = part;
    const g = prim(shape).clone();
    _e.set(rot ? rot[0] : 0, rot ? rot[1] : 0, rot ? rot[2] : 0);
    _q.setFromEuler(_e);
    _p.set(pos[0] * scaleAll, pos[1] * scaleAll, pos[2] * scaleAll);
    _s.set(scale[0] * scaleAll, scale[1] * scaleAll, scale[2] * scaleAll);
    _m.compose(_p, _q, _s);
    g.applyMatrix4(_m);
    addTriplanarUV(g);
    _c.set(color);
    const n = g.attributes.position.count;
    const col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      // slight per-face shade variation for a hand-painted look
      const v = 0.92 + ((i / 3) % 3) * 0.04;
      col[i * 3] = _c.r * v;
      col[i * 3 + 1] = _c.g * v;
      col[i * 3 + 2] = _c.b * v;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    (isGlow ? glow : normal).push(g);
  }
  return { geo: mergeList(normal), glow: mergeList(glow) };
}

/** UVs projected along each face's dominant axis, so skins have even texel density on every part. */
function addTriplanarUV(g, scale = 1 / 1.6) {
  const p = g.attributes.position.array, n = g.attributes.normal.array;
  const uv = new Float32Array((p.length / 3) * 2);
  for (let i = 0, v = 0; i < p.length; i += 3, v += 2) {
    const ax = Math.abs(n[i]), ay = Math.abs(n[i + 1]), az = Math.abs(n[i + 2]);
    if (ax >= ay && ax >= az) { uv[v] = p[i + 2] * scale; uv[v + 1] = p[i + 1] * scale; }
    else if (ay >= az) { uv[v] = p[i] * scale; uv[v + 1] = p[i + 2] * scale; }
    else { uv[v] = p[i] * scale; uv[v + 1] = p[i + 1] * scale; }
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}

export function mergeList(list) {
  if (!list.length) return null;
  let total = 0;
  for (const g of list) total += g.attributes.position.count;
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3), uvs = new Float32Array(total * 2);
  let o = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    col.set(g.attributes.color.array, o * 3);
    if (g.attributes.uv) uvs.set(g.attributes.uv.array, o * 2);
    o += g.attributes.position.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  out.computeBoundingSphere();
  return out;
}

// Glowing parts are pushed above 1.0 (HDR) on high quality so the bloom pass
// picks them up; on low quality there is no bloom and they stay at 1.0.
export const GLOW_BOOST = 2.2;
export const MAT = {};
export function initMaterials() {
  const high = G.quality === 'high';
  MAT.high = high;
  MAT.vc = litMaterial({ vertexColors: true });
  MAT.glow = glowMaterial({ vertexColors: true });
  // vertex-coloured stone with the nature pack's rock texture (ruins, caves) — see stone.js
  MAT.stone = addTriplanar(litMaterial({ vertexColors: true, roughness: 0.92 }), { tex: 'rock', scale: 0.32, strength: 0.9 });
  MAT.stoneDesert = addTriplanar(litMaterial({ vertexColors: true, roughness: 0.92 }), { tex: 'desert', scale: 0.32, strength: 0.9 });
}
/** PBR material on high quality, cheap Lambert on phones. */
export function litMaterial(params = {}) {
  if (MAT.high) return new THREE.MeshStandardMaterial({ roughness: 0.8, metalness: 0.02, ...params });
  const { roughness, metalness, ...rest } = params;
  return new THREE.MeshLambertMaterial(rest);
}
const stoneCache = new Map();
/** A plain-coloured material turned into textured stone (shrines, Moai, pillars, portal). */
export function stoneColorMaterial(color, tex = 'rock') {
  const k = color.getHex() + tex;
  if (!stoneCache.has(k)) stoneCache.set(k, addTriplanar(litMaterial({ color: color.clone(), roughness: 0.9 }), { tex, scale: 0.45, strength: 0.85 }));
  return stoneCache.get(k);
}
/** Swap the grey/brown (low-saturation) parts of a built group to textured stone. */
export function stoneify(group, tex = 'rock') {
  const hsl = {};
  group.traverse((o) => {
    if (!o.isMesh || !o.material || Array.isArray(o.material) || o.material.map || o.material.vertexColors) return;
    const m = o.material;
    if (!(m.isMeshStandardMaterial || m.isMeshLambertMaterial) || m.transparent || m.metalness > 0.3) return;
    m.color.getHSL(hsl);
    if (hsl.s > 0.38 || hsl.l > 0.85) return; // coloured / glowing bits stay as they are
    o.material = stoneColorMaterial(m.color, tex);
  });
  return group;
}
export function glowMaterial(params = {}) {
  const m = new THREE.MeshBasicMaterial(params);
  if (MAT.high) m.color.multiplyScalar(GLOW_BOOST);
  return m;
}
/** Set a glow material's colour, keeping the HDR boost for bloom. */
export function setGlowColor(m, hex) {
  m.color.set(hex);
  if (MAT.high) m.color.multiplyScalar(GLOW_BOOST);
}

/** Fresnel rim light (per-material colour/strength) — makes creatures read clearly against any background. */
export function addRimLight(mat, color, strength = 0.5) {
  const uRim = { value: new THREE.Color(color).multiplyScalar(strength) };
  mat.userData.rim = uRim;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uRim = uRim;
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uRim;')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        {
          float rimF = 1.0 - abs(dot(normalize(normal), normalize(vViewPosition)));
          totalEmissiveRadiance += uRim * pow(rimF, 2.6);
        }`
      );
  };
  mat.customProgramCacheKey = () => 'rim';
}

// Wind sway for instanced vegetation: bends vertices by their height.
export const windUniform = { value: 0 };
export function swayMaterial(amp) {
  return addSway(MAT.vc.clone(), amp);
}
/** Add height-based wind sway to any (instanced) material. */
export function addSway(m, amp) {
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = windUniform;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uTime;')
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 ip = vec3(instanceMatrix[3][0], 0.0, instanceMatrix[3][2]);
        #else
          vec3 ip = vec3(0.0);
        #endif
        float hgt = max(position.y, 0.0);
        float ph = uTime * 1.6 + ip.x * 0.21 + ip.z * 0.17;
        float gust = 0.6 + 0.4 * sin(uTime * 0.37 + ip.x * 0.02);
        transformed.x += sin(ph) * hgt * hgt * ${amp.toFixed(4)} * gust;
        transformed.z += cos(ph * 0.8) * hgt * hgt * ${(amp * 0.6).toFixed(4)} * gust;`
      );
  };
  m.customProgramCacheKey = () => 'sway' + amp + m.type;
  return m;
}

const geoCache = new Map();
/**
 * Cached model for an enemy/boss: a static body plus animatable rig parts.
 * def.rig maps a role (legL, armR, wingL, tail, head, claw…) to part indices;
 * each role is merged separately around a pivot so it can rotate.
 */
export function enemyGeometry(id, def) {
  if (geoCache.has(id)) return geoCache.get(id);
  const rig = def.rig || {};
  const used = new Set();
  const roles = [];
  for (const role in rig) {
    const parts = rig[role].map((i) => def.model[i]).filter(Boolean);
    rig[role].forEach((i) => used.add(i));
    if (!parts.length) continue;
    // bounding box of the role's parts (approximate from position ± scale/2)
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (const [, , pos, sc] of parts) for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], pos[k] - sc[k] / 2); max[k] = Math.max(max[k], pos[k] + sc[k] / 2); }
    const c = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
    let pivot;
    if (/^(leg|arm|neck)/.test(role)) pivot = [c[0], max[1], c[2]]; // hip / shoulder
    else if (role === 'head') pivot = [c[0], min[1], c[2]];
    else {
      // wings, tails, claws: hinge at the point of the box closest to the body axis
      const bodyY = def.height * 0.5;
      pivot = [Math.max(min[0], Math.min(max[0], 0)), Math.max(min[1], Math.min(max[1], bodyY)), Math.max(min[2], Math.min(max[2], 0))];
    }
    const local = parts.map(([sh, col, pos, sc, rot, glow]) => [sh, col, [pos[0] - pivot[0], pos[1] - pivot[1], pos[2] - pivot[2]], sc, rot, glow]);
    roles.push({ role, pivot, ...buildMerged(local) });
  }
  const body = buildMerged(def.model.filter((_, i) => !used.has(i)));
  const out = { geo: body.geo, glow: body.glow, roles };
  geoCache.set(id, out);
  return out;
}

// ------------------------------------------------------------------
// Characters
// ------------------------------------------------------------------
const matCache = new Map();
function mat(color, glow = false) {
  const k = color + (glow ? 'g' : '');
  if (!matCache.has(k)) {
    matCache.set(k, glow ? glowMaterial({ color }) : litMaterial({ color, roughness: 0.65 }));
  }
  return matCache.get(k);
}
function mesh(shape, color, pos, scale, rot, glow) {
  const m = new THREE.Mesh(prim(shape), mat(color, glow));
  m.position.set(pos[0], pos[1], pos[2]);
  m.scale.set(scale[0], scale[1], scale[2]);
  if (rot) m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = true;
  return m;
}
function group(x = 0, y = 0, z = 0, ...children) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  for (const c of children) g.add(c);
  return g;
}

const CHAR_DESIGN = {
  vanguard: { skin: 0xf1c27d, body: 0x2f6fd6, trim: 0x1a3a7a, legs: 0x22304a, shape: 'box' },
  bonker: { skin: 0xe0a070, body: 0xb5651d, trim: 0x6b3a12, legs: 0x4a3020, shape: 'box', bulk: 1.35 },
  pyra: { skin: 0xf6d0b0, body: 0xc4301b, trim: 0xffaa33, legs: 0x5a1008, shape: 'robe' },
  glacia: { skin: 0xdff4ff, body: 0x7fd3ff, trim: 0xffffff, legs: 0x3a7aa8, shape: 'robe' },
  kestrel: { skin: 0xe8b888, body: 0x3f8f3a, trim: 0x8a5a2b, legs: 0x2a4a2a, shape: 'box', slim: true },
  tinker: { skin: 0xf1c27d, body: 0xf0b820, trim: 0x3a5a8a, legs: 0x3a5a8a, shape: 'box' },
  kaze: { skin: 0xe8b888, body: 0xf4f4ff, trim: 0x6a3aaa, legs: 0xf4f4ff, shape: 'box', slim: true },
  morrow: { skin: 0xf0ead6, body: 0x1e2a22, trim: 0x7dff9a, legs: 0x141a16, shape: 'robe' },
  bulwark: { skin: 0xd09060, body: 0x7a8290, trim: 0xb03030, legs: 0x4a505a, shape: 'box', bulk: 1.45 },
  nyx: { skin: 0xc8b0e0, body: 0x2a1a3a, trim: 0xb06bff, legs: 0x1a1024, shape: 'box', slim: true },
  sol: { skin: 0xf1c27d, body: 0xe8dcc0, trim: 0xffcc33, legs: 0xb8a878, shape: 'box', bulk: 1.2 },
  rook: { skin: 0xe0b088, body: 0x5a6a3a, trim: 0x6a4a2a, legs: 0x3a3a2a, shape: 'box', slim: true },
  vex: { skin: 0xf0ead6, body: 0x1a1a1a, trim: 0x8bd450, legs: 0x111111, shape: 'robe' },
  echo: { skin: 0xe8d0b8, body: 0x2a6a72, trim: 0x9ffff0, legs: 0x1a3a40, shape: 'robe' },
  grizzle: { skin: 0xd09060, body: 0x7a4e2a, trim: 0x4a2e18, legs: 0x3a2a1a, shape: 'box', bulk: 1.15 },
  spark: { skin: 0xf1c27d, body: 0x2a3a8a, trim: 0xffe04a, legs: 0x1a2250, shape: 'box', slim: true },
  mimic: { skin: 0x7ac46a, body: 0x6a2a8a, trim: 0xffd23c, legs: 0x3a1a4a, shape: 'box' },
};

/** Build an animatable character. Returns { root, rig } where rig holds limb groups. */
// Costumes: index 0 is the classic look; 1-5 are unlocked by character-level achievements.
export const COSTUMES = [
  { name: 'Classic', swatch: null },
  { name: 'Rival', swatch: '#5a8fd0', hue: 0.5 },
  { name: 'Arctic', swatch: '#dff4ff', body: 0xe8f4ff, trim: 0x7fd3ff, legs: 0xb8d8ee, flair: 'frost' },
  { name: 'Inferno', swatch: '#ff5522', body: 0x2a0e08, trim: 0xff5522, legs: 0x1a0805, flair: 'flame' },
  { name: 'Shadow', swatch: '#8a4aff', body: 0x15101e, trim: 0xb06bff, legs: 0x0c0812, flair: 'shadow' },
  { name: 'Golden', swatch: '#ffd23c', body: 0xe8c25a, trim: 0xfff2b0, legs: 0xb8902a, flair: 'crown' },
];
export const COSTUME_LEVELS = [0, 3, 6, 10, 15, 20];

function hueShift(hex, amt) {
  const c = new THREE.Color(hex);
  const hsl = {};
  c.getHSL(hsl);
  c.setHSL((hsl.h + amt) % 1, Math.min(1, hsl.s * 1.1), hsl.l);
  return c.getHex();
}

export function buildCharacter(id, costume = 0) {
  const base = CHAR_DESIGN[id] || CHAR_DESIGN.vanguard;
  const C = COSTUMES[costume] || COSTUMES[0];
  const d = { ...base };
  if (C.hue) {
    d.body = hueShift(base.body, C.hue);
    d.trim = hueShift(base.trim, C.hue);
    d.legs = hueShift(base.legs, C.hue);
  } else if (C.body) {
    d.body = C.body;
    d.trim = C.trim;
    d.legs = C.legs;
  }
  const bulk = d.bulk || 1;
  const slim = d.slim ? 0.85 : 1;
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  // torso
  const torsoW = 0.85 * bulk * slim;
  if (d.shape === 'robe') {
    body.add(mesh('cone', d.body, [0, 1.05, 0], [1.1, 1.6, 0.9]));
    body.add(mesh('cyl', d.trim, [0, 0.3, 0], [1.05, 0.1, 0.85]));
  } else {
    body.add(mesh('box', d.body, [0, 1.35, 0], [torsoW, 0.85, 0.5 * bulk]));
    body.add(mesh('box', d.trim, [0, 0.98, 0], [torsoW * 1.02, 0.14, 0.52 * bulk]));
  }
  // head
  const head = group(0, 2.0, 0, mesh('sphere', d.skin, [0, 0, 0], [0.55, 0.58, 0.55]));
  body.add(head);
  // limbs
  const armOff = 0.5 * bulk * slim + 0.08;
  const armL = group(-armOff, 1.65, 0, mesh('box', d.body, [0, -0.3, 0], [0.24 * bulk, 0.62, 0.24 * bulk]), mesh('sphere', d.skin, [0, -0.66, 0], [0.22, 0.22, 0.22]));
  const armR = group(armOff, 1.65, 0, mesh('box', d.body, [0, -0.3, 0], [0.24 * bulk, 0.62, 0.24 * bulk]), mesh('sphere', d.skin, [0, -0.66, 0], [0.22, 0.22, 0.22]));
  body.add(armL, armR);
  const legL = group(-0.2 * bulk, 0.9, 0, mesh('box', d.legs, [0, -0.42, 0], [0.28 * bulk, 0.85, 0.3]));
  const legR = group(0.2 * bulk, 0.9, 0, mesh('box', d.legs, [0, -0.42, 0], [0.28 * bulk, 0.85, 0.3]));
  if (d.shape === 'robe') {
    legL.visible = legR.visible = false;
  }
  body.add(legL, legR);
  const handR = group(0, -0.68, 0.05);
  const handL = group(0, -0.68, 0.05);
  armR.add(handR);
  armL.add(handL);

  // ---- signature details ----
  switch (id) {
    case 'vanguard':
      head.add(mesh('sphere', d.body, [0, 0.08, 0], [0.62, 0.55, 0.62]));
      head.add(mesh('box', 0x66e0ff, [0, 0.02, 0.27], [0.45, 0.14, 0.1], null, true));
      body.add(mesh('box', d.trim, [-0.55, 1.75, 0], [0.32, 0.18, 0.4]), mesh('box', d.trim, [0.55, 1.75, 0], [0.32, 0.18, 0.4]));
      handR.add(mesh('box', 0x333a44, [0, 0, 0.2], [0.14, 0.18, 0.5]));
      handL.add(mesh('box', 0x333a44, [0, 0, 0.2], [0.14, 0.18, 0.5]));
      break;
    case 'bonker':
      for (let i = -1; i <= 1; i++) head.add(mesh('cone', 0x3a2010, [i * 0.16, 0.36, -0.02], [0.14, 0.3, 0.14], [0, 0, -i * 0.3]));
      head.add(mesh('box', 0xd63030, [0, 0.12, 0], [0.6, 0.1, 0.6]));
      head.add(mesh('box', 0x111111, [0, 0.0, 0.26], [0.34, 0.06, 0.06]));
      handR.add(group(0, 0, 0.1,
        mesh('cyl', 0x7a4a22, [0, 0, 0.55], [0.16, 1.2, 0.16], [Math.PI / 2, 0, 0]),
        mesh('cyl', 0x8a5a2b, [0, 0, 1.35], [0.55, 0.8, 0.55], [Math.PI / 2, 0, 0]),
        mesh('cone', 0xcccccc, [0.3, 0, 1.4], [0.12, 0.25, 0.12], [0, 0, -Math.PI / 2]),
        mesh('cone', 0xcccccc, [-0.3, 0, 1.4], [0.12, 0.25, 0.12], [0, 0, Math.PI / 2]),
        mesh('cone', 0xcccccc, [0, 0.3, 1.5], [0.12, 0.25, 0.12])));
      break;
    case 'pyra':
      head.add(mesh('cyl', 0x5a1008, [0, 0.22, 0], [1.0, 0.06, 1.0]));
      head.add(mesh('cone', 0x8a1c10, [0, 0.62, -0.05], [0.55, 0.85, 0.55], [-0.2, 0, 0]));
      head.add(mesh('box', 0xffaa33, [0, 0.3, 0], [0.56, 0.08, 0.56]));
      head.add(mesh('sphere', 0xff6622, [0, -0.1, -0.25], [0.6, 0.5, 0.35]));
      handR.add(mesh('ico', 0xff8833, [0, 0.05, 0.15], [0.32, 0.32, 0.32], null, true));
      break;
    case 'glacia':
      for (let i = -2; i <= 2; i++) head.add(mesh('cone', 0xbff3ff, [i * 0.12, 0.38 + (2 - Math.abs(i)) * 0.06, 0.05], [0.08, 0.25 + (2 - Math.abs(i)) * 0.08, 0.08], null, true));
      head.add(mesh('sphere', 0xffffff, [0, -0.05, -0.2], [0.62, 0.6, 0.4]));
      handR.add(group(0, 0, 0, mesh('cyl', 0x9ad0ee, [0, 0.3, 0.1], [0.08, 1.8, 0.08]), mesh('oct', 0x99eeff, [0, 1.3, 0.1], [0.3, 0.5, 0.3], null, true)));
      break;
    case 'kestrel':
      head.add(mesh('cone', d.body, [0, 0.25, -0.05], [0.72, 0.8, 0.72]));
      head.add(mesh('box', 0x111111, [0, 0, 0.24], [0.4, 0.15, 0.08]));
      body.add(mesh('box', 0x2a6a28, [0, 1.15, -0.32], [0.75, 1.3, 0.06], [0.15, 0, 0]));
      body.add(mesh('cyl', 0x8a5a2b, [0.25, 1.55, -0.32], [0.22, 0.8, 0.22], [0.3, 0, -0.3]));
      handL.add(mesh('torus', 0x8a5a2b, [0, 0, 0.15], [1.2, 1.4, 0.8], [0, Math.PI / 2, 0]));
      break;
    case 'tinker':
      head.add(mesh('cyl', 0x3a5a8a, [-0.12, 0.08, 0.24], [0.16, 0.12, 0.16], [Math.PI / 2, 0, 0]));
      head.add(mesh('cyl', 0x3a5a8a, [0.12, 0.08, 0.24], [0.16, 0.12, 0.16], [Math.PI / 2, 0, 0]));
      head.add(mesh('cyl', 0x99eeff, [-0.12, 0.08, 0.31], [0.11, 0.02, 0.11], [Math.PI / 2, 0, 0], true));
      head.add(mesh('cyl', 0x99eeff, [0.12, 0.08, 0.31], [0.11, 0.02, 0.11], [Math.PI / 2, 0, 0], true));
      head.add(mesh('sphere', 0xf0b820, [0, 0.18, 0], [0.6, 0.35, 0.6]));
      body.add(mesh('box', 0x555a60, [0, 1.4, -0.42], [0.7, 0.8, 0.4]));
      body.add(mesh('cyl', 0x888888, [0.2, 2.1, -0.42], [0.04, 0.6, 0.04]));
      body.add(mesh('sphere', 0xff3333, [0.2, 2.42, -0.42], [0.1, 0.1, 0.1], null, true));
      handR.add(mesh('box', 0x888888, [0, 0, 0.3], [0.1, 0.1, 0.6]));
      break;
    case 'kaze':
      head.add(mesh('box', d.trim, [0, 0.1, 0], [0.58, 0.1, 0.58]));
      head.add(mesh('box', d.trim, [0.05, 0.05, -0.38], [0.08, 0.06, 0.4], [0.5, 0.3, 0]));
      head.add(mesh('box', d.trim, [-0.05, 0.05, -0.38], [0.08, 0.06, 0.4], [0.6, -0.3, 0]));
      head.add(mesh('sphere', 0x222222, [0, 0.3, 0], [0.3, 0.25, 0.3]));
      handR.add(mesh('box', 0xffffff, [0, 0, 0], [0.26, 0.15, 0.26]));
      handL.add(mesh('box', 0xffffff, [0, 0, 0], [0.26, 0.15, 0.26]));
      break;
    case 'morrow':
      head.add(mesh('box', 0x111111, [-0.12, 0.05, 0.24], [0.12, 0.12, 0.08]));
      head.add(mesh('box', 0x111111, [0.12, 0.05, 0.24], [0.12, 0.12, 0.08]));
      head.add(mesh('sphere', 0x7dff9a, [-0.12, 0.05, 0.27], [0.06, 0.06, 0.03], null, true));
      head.add(mesh('sphere', 0x7dff9a, [0.12, 0.05, 0.27], [0.06, 0.06, 0.03], null, true));
      head.add(mesh('cone', d.body, [0, 0.2, -0.08], [0.8, 0.9, 0.8]));
      handR.add(group(0, 0, 0,
        mesh('cyl', 0x3a2a1a, [0, 0.4, 0.1], [0.07, 2.2, 0.07]),
        mesh('box', 0xcccccc, [0, 1.5, 0.45], [0.06, 0.18, 0.8], [0.3, 0, 0]),
        mesh('ico', 0x7dff9a, [0, 1.45, 0.1], [0.2, 0.2, 0.2], null, true)));
      break;
    case 'bulwark':
      head.add(mesh('box', 0x5a606a, [0, 0.05, 0], [0.66, 0.66, 0.66]));
      head.add(mesh('box', 0xff4444, [0, 0.05, 0.33], [0.45, 0.1, 0.04], null, true));
      body.add(mesh('box', d.trim, [-0.7, 1.8, 0], [0.45, 0.3, 0.6]), mesh('box', d.trim, [0.7, 1.8, 0], [0.45, 0.3, 0.6]));
      handR.add(group(0, 0, 0.2,
        mesh('box', 0x3a3e44, [-0.2, 0, 0.2], [0.5, 0.45, 0.8]),
        mesh('cyl', 0x22262a, [-0.2, 0, 1.0], [0.42, 1.0, 0.42], [Math.PI / 2, 0, 0]),
        mesh('cyl', 0x111111, [-0.2, 0, 1.55], [0.2, 0.1, 0.2], [Math.PI / 2, 0, 0])));
      break;
    case 'nyx':
      head.add(mesh('box', 0x111111, [0, -0.05, 0.22], [0.5, 0.3, 0.14]));
      head.add(mesh('box', 0xd080ff, [-0.11, 0.07, 0.29], [0.13, 0.05, 0.03], null, true));
      head.add(mesh('box', 0xd080ff, [0.11, 0.07, 0.29], [0.13, 0.05, 0.03], null, true));
      head.add(mesh('sphere', 0x1a1024, [0, 0.15, -0.05], [0.62, 0.55, 0.62]));
      body.add(mesh('box', d.trim, [0, 1.72, -0.1], [0.75, 0.16, 0.55]));
      body.add(mesh('box', d.trim, [0.15, 1.3, -0.4], [0.18, 0.9, 0.05], [0.25, 0, 0.1]));
      handR.add(mesh('cone', 0xd0d0e0, [0, 0, 0.35], [0.1, 0.6, 0.06], [Math.PI / 2, 0, 0]));
      handL.add(mesh('cone', 0xd0d0e0, [0, 0, 0.35], [0.1, 0.6, 0.06], [Math.PI / 2, 0, 0]));
      break;
    case 'sol':
      head.add(mesh('sphere', 0xe8dcc0, [0, 0.06, 0], [0.62, 0.58, 0.62]));
      head.add(mesh('box', 0x222222, [0, 0.02, 0.29], [0.4, 0.07, 0.05]));
      head.add(mesh('torus', 0xffe08a, [0, 0.55, 0], [0.55, 0.55, 0.55], [Math.PI / 2, 0, 0], true));
      body.add(mesh('box', d.trim, [-0.62, 1.78, 0], [0.38, 0.2, 0.45]), mesh('box', d.trim, [0.62, 1.78, 0], [0.38, 0.2, 0.45]));
      handL.add(group(0, 0, 0.2, mesh('cyl', 0xd8c890, [0, 0, 0.1], [0.9, 0.12, 0.9], [Math.PI / 2, 0, 0]), mesh('sphere', 0xffcc33, [0, 0, 0.2], [0.3, 0.3, 0.12], null, true)));
      handR.add(group(0, 0, 0.1, mesh('cyl', 0x8a6a3a, [0, 0, 0.5], [0.12, 1.0, 0.12], [Math.PI / 2, 0, 0]), mesh('box', 0xd8d0b8, [0, 0, 1.05], [0.55, 0.42, 0.42])));
      break;
    case 'rook':
      head.add(mesh('cyl', 0x4a3a22, [0, 0.24, 0], [1.0, 0.06, 1.0]));
      head.add(mesh('cyl', 0x4a3a22, [0, 0.38, 0], [0.55, 0.28, 0.55]));
      head.add(mesh('box', 0x3a3a3a, [0, -0.12, 0.24], [0.42, 0.18, 0.08]));
      body.add(mesh('box', d.trim, [0, 1.0, -0.15], [0.82, 1.0, 0.45], [0.05, 0, 0]));
      handR.add(group(0, 0, 0.1, mesh('box', 0x3a2a1a, [0, 0, 0.3], [0.14, 0.2, 0.7]), mesh('cyl', 0x222222, [0, 0.05, 1.1], [0.08, 1.2, 0.08], [Math.PI / 2, 0, 0]), mesh('cyl', 0x111111, [0, 0.2, 0.6], [0.09, 0.45, 0.09], [Math.PI / 2, 0, 0])));
      break;
    case 'vex':
      head.add(mesh('sphere', 0x111111, [0, 0.05, 0], [0.62, 0.6, 0.62]));
      head.add(mesh('cone', 0xe8e0c8, [0, -0.05, 0.45], [0.22, 0.6, 0.22], [Math.PI / 2, 0, 0]));
      head.add(mesh('sphere', 0x8bd450, [-0.13, 0.1, 0.27], [0.12, 0.12, 0.05], null, true));
      head.add(mesh('sphere', 0x8bd450, [0.13, 0.1, 0.27], [0.12, 0.12, 0.05], null, true));
      head.add(mesh('cyl', 0x111111, [0, 0.35, 0], [0.75, 0.06, 0.75]), mesh('cyl', 0x111111, [0, 0.5, 0], [0.45, 0.3, 0.45]));
      handR.add(mesh('sphere', 0x8bd450, [0, 0, 0.18], [0.3, 0.34, 0.3], null, true));
      break;
    case 'echo':
      head.add(mesh('cone', d.body, [0, 0.22, -0.05], [0.75, 0.8, 0.75]));
      head.add(mesh('torus', 0x9ffff0, [0, 0.15, -0.45], [0.7, 0.7, 0.7], null, true));
      body.add(mesh('torus', 0x9ffff0, [0, 1.2, 0], [1.3, 1.3, 1.3], [Math.PI / 2, 0, 0], true));
      handR.add(group(0, 0, 0, mesh('cone', 0xd8c890, [0, 0.15, 0.15], [0.25, 0.3, 0.25]), mesh('cone', 0xd8c890, [0, -0.15, 0.15], [0.25, 0.3, 0.25], [Math.PI, 0, 0]), mesh('sphere', 0x9ffff0, [0, 0, 0.15], [0.1, 0.1, 0.1], null, true)));
      break;
    case 'grizzle':
      head.add(mesh('sphere', 0x6a4426, [0, 0.12, -0.05], [0.7, 0.55, 0.7]));
      head.add(mesh('sphere', 0x6a4426, [-0.28, 0.42, -0.05], [0.2, 0.2, 0.14]), mesh('sphere', 0x6a4426, [0.28, 0.42, -0.05], [0.2, 0.2, 0.14]));
      head.add(mesh('box', 0x553318, [0, -0.15, 0.25], [0.35, 0.18, 0.1]));
      body.add(mesh('box', 0x6a4426, [0, 1.25, -0.35], [0.9, 1.1, 0.12]));
      handR.add(group(0, 0, 0.1, mesh('cyl', 0x8a6a3a, [0, 0, 0.6], [0.08, 1.6, 0.08], [Math.PI / 2, 0, 0]), mesh('cone', 0xcccccc, [0, 0, 1.5], [0.14, 0.35, 0.14], [Math.PI / 2, 0, 0])));
      break;
    case 'spark':
      for (let i = -2; i <= 2; i++) head.add(mesh('cone', 0xffe04a, [i * 0.13, 0.34, -0.05 - Math.abs(i) * 0.04], [0.12, 0.42, 0.12], [-0.3, 0, -i * 0.3], true));
      head.add(mesh('box', 0x111111, [0, 0.03, 0.27], [0.42, 0.12, 0.05]));
      handR.add(group(0, 0, 0, mesh('cyl', 0x555a66, [0, 0.4, 0.1], [0.07, 1.6, 0.07]), mesh('oct', 0xffe04a, [0, 1.25, 0.1], [0.25, 0.4, 0.25], null, true)));
      break;
    case 'mimic':
      head.add(mesh('cyl', 0x1a1a1a, [0, 0.3, 0], [0.75, 0.06, 0.75]), mesh('cyl', 0x1a1a1a, [0, 0.55, 0], [0.48, 0.5, 0.48]), mesh('cyl', 0xffd23c, [0, 0.38, 0], [0.5, 0.08, 0.5]));
      head.add(mesh('cone', d.skin, [-0.35, 0.05, 0], [0.12, 0.35, 0.12], [0, 0, 1.4]), mesh('cone', d.skin, [0.35, 0.05, 0], [0.12, 0.35, 0.12], [0, 0, -1.4]));
      head.add(mesh('box', 0xffffff, [0, -0.15, 0.25], [0.3, 0.06, 0.05]));
      body.add(mesh('sphere', 0xc9a050, [0.3, 0.9, -0.35], [0.55, 0.6, 0.45]), mesh('box', 0xffd23c, [0.3, 1.15, -0.35], [0.2, 0.08, 0.2], null, true));
      handR.add(mesh('cyl', 0xffd23c, [0, 0, 0.12], [0.22, 0.05, 0.22], [Math.PI / 2, 0, 0], true));
      break;
  }
  // costume flair
  if (C.flair === 'frost') {
    for (const sx of [-1, 1]) body.add(mesh('oct', 0xbff3ff, [sx * (armOff + 0.05), 1.95, 0], [0.18, 0.4, 0.18], [0, 0, sx * 0.4], true), mesh('oct', 0xbff3ff, [sx * (armOff - 0.12), 2.0, -0.08], [0.12, 0.28, 0.12], [0, 0, sx * 0.8], true));
  } else if (C.flair === 'flame') {
    head.add(mesh('cone', 0xff6a22, [0, 0.55, -0.05], [0.35, 0.7, 0.35], null, true), mesh('cone', 0xffcc33, [0, 0.5, 0], [0.2, 0.45, 0.2], null, true));
    head.add(mesh('box', 0xff8833, [0, 0.03, 0.29], [0.4, 0.06, 0.03], null, true));
  } else if (C.flair === 'shadow') {
    head.add(mesh('sphere', 0xd080ff, [-0.12, 0.05, 0.27], [0.09, 0.06, 0.04], null, true), mesh('sphere', 0xd080ff, [0.12, 0.05, 0.27], [0.09, 0.06, 0.04], null, true));
    root.add(mesh('torus', 0x8a4aff, [0, 0.08, 0], [1.4, 1.4, 1.4], [Math.PI / 2, 0, 0], true));
  } else if (C.flair === 'crown') {
    const crown = group(0, id === 'bonker' || id === 'spark' ? 0.55 : 0.42, 0);
    crown.add(mesh('cyl', 0xffcc33, [0, 0, 0], [0.5, 0.14, 0.5]));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      crown.add(mesh('cone', 0xffcc33, [Math.cos(a) * 0.2, 0.14, Math.sin(a) * 0.2], [0.1, 0.18, 0.1]));
    }
    crown.add(mesh('oct', 0xff3355, [0, 0.05, 0.25], [0.08, 0.1, 0.05], null, true));
    head.add(crown);
  }
  root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { root, rig: { body, head, armL, armR, legL, legR, handR, handL } };
}

// ------------------------------------------------------------------
// Decorations (instanced) — returns parts list for buildMerged
// ------------------------------------------------------------------
function shade(hex, k) {
  const c = new THREE.Color(hex).multiplyScalar(k);
  return c.getHex();
}

export function decorParts(type, tint) {
  const t = tint;
  switch (type) {
    case 'tree': return [
      ['cyl', 0x6b4a2b, [0, 1.2, 0], [0.5, 2.4, 0.5]],
      ['ico', 0x3f9a3a, [0, 3.2, 0], [2.8, 2.4, 2.8]], ['ico', 0x4fb34a, [0.6, 4.0, 0.3], [1.8, 1.6, 1.8]], ['ico', 0x37882f, [-0.6, 3.6, -0.4], [1.8, 1.6, 1.8]],
    ];
    case 'pine': return [
      ['cyl', 0x5a3a20, [0, 0.8, 0], [0.45, 1.6, 0.45]],
      ['cone', 0x2a5a3a, [0, 2.4, 0], [2.6, 2.4, 2.6]], ['cone', 0x2f6a42, [0, 3.6, 0], [2.0, 2.0, 2.0]], ['cone', 0xf0f6ff, [0, 4.6, 0], [1.3, 1.4, 1.3]],
    ];
    case 'rock': return [['dodeca', t || 0x8a8a8a, [0, 0.5, 0], [2, 1.5, 1.8]], ['dodeca', t || 0x9a9a9a, [0.7, 0.3, 0.5], [1, 0.8, 1]]];
    case 'grass': {
      // a tuft of thin blades; colour comes from the stage's ground palette
      const c = t || 0x5fae3f;
      const parts = [];
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + i;
        const r = 0.12 + (i % 3) * 0.1;
        const h = 0.55 + ((i * 37) % 10) / 22;
        parts.push(['blade', i % 2 ? c : shade(c, 1.18), [Math.cos(a) * r, h / 2, Math.sin(a) * r], [0.09, h, 0.05], [Math.sin(a) * 0.35, a, Math.cos(a) * 0.35]]);
      }
      return parts;
    }
    case 'flower': return [['cyl', 0x3a8a2a, [0, 0.25, 0], [0.06, 0.5, 0.06]], ['sphere', 0xffffff, [0, 0.55, 0], [0.3, 0.15, 0.3]], ['sphere', 0xffdd33, [0, 0.6, 0], [0.12, 0.08, 0.12]]];
    case 'ruin_pillar': return [
      ['box', t || 0xcfc8b8, [0, 0.2, 0], [1.6, 0.4, 1.6]], ['cyl', t || 0xd8d2c4, [0, 2.4, 0], [1.0, 4.2, 1.0]], ['box', t || 0xcfc8b8, [0, 4.6, 0], [1.4, 0.35, 1.4]],
    ];
    case 'cactus': return [
      ['cyl', 0x3f8f3a, [0, 1.6, 0], [0.8, 3.2, 0.8]], ['sphere', 0x3f8f3a, [0, 3.2, 0], [0.8, 0.6, 0.8]],
      ['cyl', 0x3f8f3a, [-0.75, 1.9, 0], [0.45, 1.1, 0.45]], ['cyl', 0x3f8f3a, [0.75, 2.2, 0], [0.45, 1.2, 0.45]],
      ['box', 0x3f8f3a, [-0.5, 1.4, 0], [0.6, 0.3, 0.3]], ['box', 0x3f8f3a, [0.5, 1.65, 0], [0.6, 0.3, 0.3]],
    ];
    case 'bones': return [
      ['cyl', 0xf0ead6, [0, 0.3, 0], [0.3, 3, 0.3], [0, 0, Math.PI / 2]], ['sphere', 0xf0ead6, [1.6, 0.5, 0], [1.2, 1.0, 1.0]],
      ['torus', 0xe8e0c8, [-0.4, 0.8, 0], [1.4, 1.4, 1.4], [0, Math.PI / 2, 0]], ['torus', 0xe8e0c8, [0.4, 0.8, 0], [1.3, 1.3, 1.3], [0, Math.PI / 2, 0]],
    ];
    case 'sandstone': return [['box', 0xc9935a, [0, 1, 0], [2.6, 2, 2.2]], ['box', 0xd9a86a, [0.3, 2.4, 0.2], [1.8, 0.9, 1.6]], ['box', 0xb07a48, [-0.4, 3.1, -0.1], [1.0, 0.6, 1.0]]];
    case 'obelisk': return [['box', 0x8a6a4a, [0, 0.3, 0], [2, 0.6, 2]], ['box', 0xb08a5a, [0, 3.5, 0], [1, 6, 1]], ['oct', 0x33ddff, [0, 7, 0], [0.9, 1.4, 0.9], null, true]];
    case 'ice_spike': return [['cone', 0xaee6ff, [0, 1.6, 0], [1.2, 3.2, 1.2]], ['cone', 0xd8f4ff, [0.6, 0.9, 0.3], [0.6, 1.8, 0.6], [0, 0, -0.3]], ['cone', 0x8fd3ff, [-0.5, 0.8, -0.2], [0.5, 1.6, 0.5], [0.2, 0, 0.3]]];
    case 'giant_mushroom': return [
      ['cyl', 0xe8dcc0, [0, 1.6, 0], [0.8, 3.2, 0.8]], ['sphere', 0x8a3ac4, [0, 3.4, 0], [4.2, 1.6, 4.2]],
      ['sphere', 0x2fffe0, [0, 3.0, 0], [3.8, 0.3, 3.8], null, true], ['sphere', 0xffffff, [1.0, 3.9, 0.6], [0.5, 0.3, 0.5]], ['sphere', 0xffffff, [-0.8, 4.0, -0.5], [0.6, 0.3, 0.6]],
    ];
    case 'glow_shroom': return [['cyl', 0xe8dcc0, [0, 0.25, 0], [0.12, 0.5, 0.12]], ['sphere', 0x2fffe0, [0, 0.55, 0], [0.5, 0.25, 0.5], null, true]];
    case 'crystal': return [['oct', t || 0x2fffe0, [0, 1.0, 0], [0.8, 2.2, 0.8], null, true], ['oct', t || 0x2fffe0, [0.5, 0.6, 0.2], [0.5, 1.3, 0.5], [0, 0, -0.4], true], ['dodeca', 0x2a2238, [0, 0.1, 0], [1.4, 0.5, 1.4]]];
    case 'obsidian_spike': return [['cone', 0x1d1a24, [0, 2, 0], [1.6, 4, 1.6]], ['cone', 0x26222f, [0.8, 1.1, 0.3], [0.8, 2.2, 0.8], [0, 0, -0.3]], ['box', 0xff4d1a, [0, 1.5, 0.55], [0.1, 2, 0.05], [0.2, 0, 0], true]];
    case 'lava_rock': return [['dodeca', 0x2a2224, [0, 0.6, 0], [2.4, 1.6, 2.2]], ['dodeca', 0xff5a1f, [0, 0.4, 0], [2.0, 0.5, 1.9], null, true]];
    case 'dead_tree': return [
      ['cyl', 0x2a1a14, [0, 1.6, 0], [0.4, 3.2, 0.4]], ['cyl', 0x2a1a14, [0.6, 2.8, 0], [0.2, 1.6, 0.2], [0, 0, -0.8]], ['cyl', 0x2a1a14, [-0.5, 2.4, 0.2], [0.2, 1.4, 0.2], [0.3, 0, 0.9]],
    ];
    case 'void_crystal': return [['oct', 0xb455ff, [0, 1.6, 0], [1.2, 3.4, 1.2], null, true], ['oct', 0x6a2aaa, [0.7, 0.8, 0.2], [0.7, 1.8, 0.7], [0, 0, -0.5]], ['oct', 0xe08cff, [-0.6, 0.7, -0.3], [0.5, 1.4, 0.5], [0.3, 0, 0.5], true]];
    case 'floating_rock': return [['dodeca', 0x3a2a5a, [0, 8, 0], [2.5, 1.6, 2.5]], ['cone', 0x2a1a4a, [0, 6.8, 0], [2.2, 1.8, 2.2], [Math.PI, 0, 0]], ['oct', 0xb455ff, [0, 9, 0], [0.5, 0.9, 0.5], null, true]];
    default: return [['box', 0xff00ff, [0, 0.5, 0], [1, 1, 1]]];
  }
}

// ------------------------------------------------------------------
// Props
// ------------------------------------------------------------------
const CHEST_LOOK = {
  normal: { s: 1, base: 0x8a5a2b, trim: 0xd4af37, glow: 0xffe680 },
  large: { s: 1.45, base: 0x6a3a98, trim: 0xffcc33, glow: 0xffe680 },
  epic: { s: 1.3, base: 0x3a1a5a, trim: 0xc461ff, glow: 0xd890ff },
  legendary: { s: 1.55, base: 0x5a3a08, trim: 0xffb22e, glow: 0xffd27a },
};
// ------------------------------------------------------------------ chests
// Pixel-art textures (drawn once per tier, nearest-filtered like the sprite enemies):
// wooden planks with grain and knots, riveted metal bands and a lock plate.
const CHEST_STYLE = {
  normal: { wood: ['#8a5a32', '#6e4424', '#a26c3c', '#4a2c16'], metal: ['#8d939c', '#5c616a', '#c4cad2'], gem: null, rarity: 'common', size: 1 },
  large: { wood: ['#6a3e22', '#52301a', '#86512c', '#341c0e'], metal: ['#d8a838', '#9a7020', '#ffe28a'], gem: null, rarity: 'rare', size: 1.25 },
  epic: { wood: ['#4a2e6a', '#382254', '#603c86', '#22133a'], metal: ['#c8d2e2', '#7c8aa4', '#ffffff'], gem: '#c070ff', rarity: 'epic', size: 1.4 },
  legendary: { wood: ['#7a1e22', '#5e1418', '#9a2a2c', '#3a0a0c'], metal: ['#ffcc3a', '#c08a10', '#fff2a0'], gem: '#ffe066', rarity: 'legendary', size: 1.6 },
};
const chestTex = {};
function pixelTexture(draw, w = 32, h = 32) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  return t;
}
function chestTextures(tier) {
  if (chestTex[tier]) return chestTex[tier];
  const L = CHEST_STYLE[tier];
  let seed = tier.length * 97 + 13;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const [wBase, wDark, wLight, wGap] = L.wood;
  // planks: 4 boards with grain streaks, knots and dark gaps
  const wood = pixelTexture((g, w, h) => {
    for (let y = 0; y < h; y++) {
      const board = Math.floor(y / 8), row = y % 8;
      for (let x = 0; x < w; x++) {
        let col = row === 0 ? wGap : row === 1 ? wLight : row === 7 ? wDark : wBase;
        if (row > 1 && row < 7 && rnd() < 0.18) col = rnd() < 0.5 ? wDark : wLight; // grain
        if ((x + board * 11) % 19 === 0 && row > 1 && row < 7) col = wGap; // board joints
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
      if (row === 4 && rnd() < 0.7) { // a knot
        const kx = Math.floor(rnd() * (w - 3));
        g.fillStyle = wGap;
        g.fillRect(kx, y - 1, 2, 2);
      }
    }
  });
  wood.wrapS = wood.wrapT = THREE.RepeatWrapping;
  const [mBase, mDark, mLight] = L.metal;
  // metal band: highlight on top, shadow below, rivets
  const metal = pixelTexture((g, w, h) => {
    g.fillStyle = mBase;
    g.fillRect(0, 0, w, h);
    g.fillStyle = mLight;
    g.fillRect(0, 0, w, 2);
    g.fillStyle = mDark;
    g.fillRect(0, h - 2, w, 2);
    for (let x = 3; x < w; x += 8) {
      g.fillStyle = mDark;
      g.fillRect(x, 5, 3, 3);
      g.fillStyle = mLight;
      g.fillRect(x, 5, 1, 1);
    }
  }, 32, 12);
  metal.wrapS = THREE.RepeatWrapping;
  // lock plate with a keyhole (and a gem on epic / legendary chests)
  const lock = pixelTexture((g, w, h) => {
    g.fillStyle = mDark;
    g.fillRect(0, 0, w, h);
    g.fillStyle = mBase;
    g.fillRect(1, 1, w - 2, h - 2);
    g.fillStyle = mLight;
    g.fillRect(1, 1, w - 2, 1);
    g.fillRect(1, 1, 1, h - 2);
    if (L.gem) {
      g.fillStyle = L.gem;
      g.fillRect(5, 2, 6, 5);
      g.fillStyle = '#ffffff';
      g.fillRect(6, 3, 2, 1);
    }
    g.fillStyle = '#1a1008';
    g.fillRect(7, 8, 2, 2);
    g.fillRect(7.5, 10, 1, 4);
  }, 16, 16);
  return (chestTex[tier] = { wood, metal, lock });
}
const chestMats = {};
function chestMat(tier, part) {
  const key = tier + part;
  if (!chestMats[key]) {
    const t = chestTextures(tier);
    chestMats[key] = new THREE.MeshStandardMaterial({ map: t[part], roughness: part === 'wood' ? 0.85 : 0.45, metalness: part === 'wood' ? 0 : 0.55 });
  }
  return chestMats[key];
}
function texBox(w, h, d, mat, x, y, z, repX = 1, repY = 1) {
  const geo = new THREE.BoxGeometry(w, h, d);
  if (repX !== 1 || repY !== 1) {
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * repX, uv.getY(i) * repY);
  }
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}
/** Half-cylinder along X (a classic rounded chest lid), centred on its axis. */
function halfTube(r, len, mat, repX = 1, repY = 1, open = false) {
  // theta 0..PI is the +X half; rotating about Z by 90 deg turns it into the upper half
  const geo = new THREE.CylinderGeometry(r, r, len, 16, 1, open, 0, Math.PI);
  if (repX !== 1 || repY !== 1) {
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * repX, uv.getY(i) * repY);
  }
  const m = new THREE.Mesh(geo, mat);
  m.rotation.z = Math.PI / 2; // axis along X, the round side up
  m.castShadow = true;
  return m;
}

/**
 * Wooden treasure chest with a rounded lid. Returns { group, lid, glow, rarity }:
 * `lid` hinges at the back (rotate .x to open), `glow` is the light leaking from the seam.
 */
export function buildChest(tier = 'normal') {
  if (tier === true) tier = 'large';
  if (tier === false) tier = 'normal';
  if (!CHEST_STYLE[tier]) tier = 'normal';
  const L = CHEST_STYLE[tier], CL = CHEST_LOOK[tier] || CHEST_LOOK.normal;
  const s = L.size;
  const W = 1.5 * s, H = 0.8 * s, D = 0.95 * s, R = D / 2;
  const wood = chestMat(tier, 'wood'), metal = chestMat(tier, 'metal'), lockM = chestMat(tier, 'lock');
  const g = new THREE.Group();
  // body + metal bands (two vertical straps, a rim and corner posts)
  g.add(texBox(W, H, D, wood, 0, H / 2, 0, 1.5 * s, 0.9));
  const band = 0.1 * s;
  for (const x of [-W * 0.3, W * 0.3]) g.add(texBox(band, H + 0.02, D + 0.04, metal, x, H / 2, 0, 0.3, 1));
  g.add(texBox(W + 0.04, band * 0.8, D + 0.04, metal, 0, H - band * 0.4, 0, 1.6 * s, 1));
  g.add(texBox(W + 0.04, band * 0.8, D + 0.04, metal, 0, band * 0.4, 0, 1.6 * s, 1));
  for (const x of [-W / 2, W / 2]) for (const z of [-D / 2, D / 2]) g.add(texBox(band * 0.9, H + 0.03, band * 0.9, metal, x, H / 2, z, 0.25, 1));
  // lid: hinge at the back edge; the half-tube sits on top of the body
  const lid = new THREE.Group();
  lid.position.set(0, H, -D / 2);
  const tube = halfTube(R, W, wood, 1.5 * s, 1.2);
  tube.position.set(0, 0, R);
  lid.add(tube);
  for (const x of [-W * 0.3, W * 0.3]) {
    const strap = halfTube(R * 1.04, band, metal, 0.3, 1);
    strap.position.set(x, 0, R);
    lid.add(strap);
  }
  for (const x of [-W / 2, W / 2]) {
    const cap = halfTube(R * 1.02, band * 0.6, metal, 0.2, 1);
    cap.position.set(x, 0, R);
    lid.add(cap);
  }
  // lock plate on the front, half on the lid, half on the body
  const lock = texBox(0.32 * s, 0.36 * s, 0.06 * s, lockM, 0, 0.02 * s, D + 0.02, 1, 1);
  lid.add(lock);
  g.add(lid);
  // light leaking out of the seam: a thin glowing line along the front edge under the lid
  const glow = mesh('box', CL.glow, [0, H, D / 2 + 0.015], [W * 0.82, 0.035 * s, 0.02], null, true);
  g.add(glow);
  if (L.gem) {
    // a floating gem marks the rare chests from afar
    const gem = mesh('oct', CL.glow, [0, H + R + 0.9 * s, 0], [0.3 * s, 0.5 * s, 0.3 * s], null, true);
    gem.userData.spin = true;
    g.add(gem);
  }
  if (tier === 'epic' || tier === 'legendary') {
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 30, 8, 1, true), new THREE.MeshBasicMaterial({ color: CL.glow, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }));
    beam.position.y = 15;
    g.add(beam);
  }
  return { group: g, lid, glow, rarity: L.rarity, height: H + R, width: W };
}

const SHRINE_LOOK = {
  heal: { col: 0x55ff88, icon: 'cross', name: 'Shrine of Healing' },
  combat: { col: 0xff4433, icon: 'swords', name: 'Shrine of Combat' },
  boss: { col: 0xb455ff, icon: 'skull', name: 'Shrine of the Mountain' },
  xp: { col: 0x55e6ff, icon: 'orb', name: 'Shrine of Wisdom' },
};
/** Stone shrine with a floating, glowing emblem. Returns { group, emblem }. */
export function buildShrine(kind) {
  const L = SHRINE_LOOK[kind];
  const g = new THREE.Group();
  g.add(mesh('cyl', 0x6a6a72, [0, 0.2, 0], [3.2, 0.4, 3.2]));
  g.add(mesh('cyl', 0x7a7a84, [0, 0.5, 0], [2.4, 0.3, 2.4]));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    g.add(mesh('box', 0x6a6a72, [Math.cos(a) * 1.25, 1.4, Math.sin(a) * 1.25], [0.35, 2.2, 0.35]));
    g.add(mesh('oct', L.col, [Math.cos(a) * 1.25, 2.7, Math.sin(a) * 1.25], [0.25, 0.4, 0.25], null, true));
  }
  g.add(mesh('box', 0x8a8a94, [0, 0.95, 0], [1.2, 0.6, 1.2]));
  const emblem = new THREE.Group();
  emblem.position.y = 2.4;
  if (L.icon === 'cross') emblem.add(mesh('box', L.col, [0, 0, 0], [0.35, 1.2, 0.35], null, true), mesh('box', L.col, [0, 0.15, 0], [1.0, 0.35, 0.35], null, true));
  else if (L.icon === 'swords') emblem.add(mesh('box', 0xdddddd, [0, 0, 0], [0.12, 1.5, 0.06], [0, 0, 0.7]), mesh('box', 0xdddddd, [0, 0, 0], [0.12, 1.5, 0.06], [0, 0, -0.7]), mesh('sphere', L.col, [0, 0, 0], [0.45, 0.45, 0.45], null, true));
  else if (L.icon === 'skull') emblem.add(mesh('sphere', 0xf0ead6, [0, 0.1, 0], [0.9, 0.85, 0.85]), mesh('box', 0xf0ead6, [0, -0.35, 0.1], [0.55, 0.3, 0.5]), mesh('sphere', L.col, [-0.2, 0.15, 0.38], [0.22, 0.22, 0.1], null, true), mesh('sphere', L.col, [0.2, 0.15, 0.38], [0.22, 0.22, 0.1], null, true));
  else emblem.add(mesh('ico', L.col, [0, 0, 0], [0.9, 0.9, 0.9], null, true), mesh('torus', 0xffffff, [0, 0, 0], [1.2, 1.2, 1.2], [Math.PI / 2, 0, 0], true));
  g.add(emblem);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, emblem, color: L.col, name: L.name };
}

/** A weathered Moai-style stone head. */
export function buildMoai() {
  const g = new THREE.Group();
  const stone = 0x8a8478, dark = 0x5a554c;
  g.add(mesh('box', dark, [0, 0.35, 0], [2.4, 0.7, 2.0]));
  g.add(mesh('box', stone, [0, 2.4, 0], [1.7, 3.6, 1.4]));
  g.add(mesh('box', stone, [0, 4.0, 0.15], [1.8, 1.4, 1.5]));
  g.add(mesh('box', dark, [0, 4.55, 0.72], [1.7, 0.35, 0.3]));
  g.add(mesh('box', stone, [0, 3.7, 0.85], [0.42, 1.2, 0.35]));
  g.add(mesh('box', dark, [0, 2.95, 0.75], [1.1, 0.18, 0.15]));
  g.add(mesh('box', stone, [-0.98, 3.8, 0], [0.22, 1.4, 0.5]), mesh('box', stone, [0.98, 3.8, 0], [0.22, 1.4, 0.5]));
  g.add(mesh('box', 0xb03030, [0, 5.0, 0], [1.6, 0.5, 1.3]));
  const eyes = new THREE.Group();
  eyes.add(mesh('box', 0xff3355, [-0.42, 4.2, 0.78], [0.35, 0.12, 0.05], null, true), mesh('box', 0xff3355, [0.42, 4.2, 0.78], [0.35, 0.12, 0.05], null, true));
  g.add(eyes);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, emblem: eyes };
}

/**
 * Charge pillar: a tall stone obelisk ringed with four rune stones, a floating crystal on top,
 * and a ground zone that fills while you stand in it.
 */
export function buildPillar(golden = false) {
  const g = new THREE.Group();
  const stone = golden ? 0xe0b040 : 0x8c8a96, dark = golden ? 0xa07818 : 0x5c5a66;
  g.add(mesh('cyl', dark, [0, 0.25, 0], [3.4, 0.5, 3.4]));
  g.add(mesh('cyl', stone, [0, 0.65, 0], [2.6, 0.4, 2.6]));
  g.add(mesh('box', stone, [0, 2.6, 0], [1.1, 3.8, 1.1], [0, Math.PI / 4, 0]));
  g.add(mesh('cone', dark, [0, 4.9, 0], [1.0, 0.9, 1.0], [0, Math.PI / 4, 0]));
  const runes = [];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    g.add(mesh('box', dark, [Math.cos(a) * 2.3, 0.9, Math.sin(a) * 2.3], [0.5, 1.0, 0.5]));
    const r = new THREE.Mesh(new THREE.OctahedronGeometry(0.28), new THREE.MeshBasicMaterial({ color: 0x335577 }));
    r.position.set(Math.cos(a) * 2.3, 1.75, Math.sin(a) * 2.3);
    g.add(r);
    runes.push(r);
  }
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(golden ? 0.8 : 0.55), new THREE.MeshBasicMaterial({ color: golden ? 0xffd700 : 0x7fd6ff }));
  crystal.scale.set(1, 1.6, 1);
  crystal.position.y = 6.3;
  g.add(crystal);
  // charge zone: an outline ring and a disc that grows with the charge (scaled to the radius in world.js)
  const zone = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffc040, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }));
  zone.position.y = 0.15;
  zone.visible = false;
  const fill = new THREE.Mesh(new THREE.CircleGeometry(1, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffc040, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending }));
  fill.position.y = 0.12;
  fill.visible = false;
  g.add(zone, fill);
  g.traverse((o) => { if (o.isMesh && o !== zone && o !== fill) o.castShadow = true; });
  if (golden) {
    // a golden beacon so the rare golden pillar can be spotted from far away
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 40, 8, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending }));
    beam.position.y = 20;
    g.add(beam);
  }
  return { group: g, crystal, crystalY: crystal.position.y, runes, zone, fill, state: 'idle', charge: 0 };
}

/** Magnet statue: stone plinth holding a big red horseshoe magnet. */
export function buildMagnetStatue() {
  const g = new THREE.Group();
  const stone = 0x8a8478, dark = 0x5a554c;
  g.add(mesh('box', dark, [0, 0.3, 0], [2.4, 0.6, 2.4]));
  g.add(mesh('box', stone, [0, 1.4, 0], [1.4, 1.6, 1.4]));
  g.add(mesh('box', dark, [0, 2.3, 0], [1.8, 0.3, 1.8]));
  const magnet = new THREE.Group();
  magnet.position.y = 3.6;
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.32, 10, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0xd8283a, roughness: 0.4, metalness: 0.3 }));
  arc.rotation.z = 0; // opening points down
  magnet.add(arc);
  for (const sx of [-1, 1]) {
    magnet.add(mesh('box', 0xd8283a, [sx * 0.9, -0.45, 0], [0.62, 0.9, 0.62]));
    magnet.add(mesh('box', 0xe8eef8, [sx * 0.9, -1.05, 0], [0.64, 0.35, 0.64], null, true));
  }
  g.add(magnet);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, emblem: magnet };
}

export function buildJumpPad() {
  const g = new THREE.Group();
  g.add(mesh('cyl', 0x4a4a55, [0, 0.15, 0], [2.6, 0.3, 2.6]));
  const ring = mesh('torus', 0x55ffdd, [0, 0.35, 0], [1.6, 1.6, 1.6], [Math.PI / 2, 0, 0], true);
  g.add(ring);
  g.add(mesh('cone', 0x55ffdd, [0, 0.6, 0], [0.6, 0.5, 0.6], null, true));
  return { group: g, ring };
}

/** Parts for ruins, cave rocks and floating islands (merged geometry). */
export function structureParts(kind, tint, rng = Math.random) {
  const stone = tint || 0xbdb4a2;
  const darker = shade(stone, 0.8);
  const parts = [];
  switch (kind) {
    case 'ruin_wall': {
      for (let i = 0; i < 5; i++) {
        const h = 2 + rng() * 3.5;
        if (rng() < 0.2) continue;
        parts.push(['box', i % 2 ? stone : darker, [i * 2.2 - 4.4, h / 2, 0], [2.2, h, 1.1]]);
      }
      parts.push(['box', darker, [0, 0.15, 0], [11.5, 0.3, 1.6]]);
      break;
    }
    case 'ruin_arch':
      parts.push(['box', stone, [-2.6, 2.6, 0], [1.2, 5.2, 1.2]], ['box', stone, [2.6, 2.6, 0], [1.2, 5.2, 1.2]], ['box', darker, [0, 5.6, 0], [6.6, 1.0, 1.4]]);
      parts.push(['box', darker, [-2.6, 0.2, 0], [1.6, 0.4, 1.6]], ['box', darker, [2.6, 0.2, 0], [1.6, 0.4, 1.6]]);
      break;
    case 'ruin_floor':
      for (let i = 0; i < 9; i++) parts.push(['box', i % 2 ? stone : darker, [(i % 3) * 3 - 3, 0.1 + rng() * 0.15, Math.floor(i / 3) * 3 - 3], [2.9, 0.3, 2.9], [0, rng() * 0.1, 0]]);
      parts.push(['cyl', stone, [-4.5, 1.5, -4.5], [1, 3, 1]], ['cyl', stone, [4.5, 0.8, 4.5], [1, 1.6, 1]], ['box', darker, [4.2, 0.4, -4.2], [1.4, 0.8, 3.0], [0, 0, 1.4]]);
      break;
    case 'island':
      parts.push(['cyl', tint || 0x5fae3f, [0, -0.3, 0], [1, 0.6, 1]]);
      parts.push(['cone', 0x6a5a48, [0, -2.2, 0], [1, 3.4, 1], [Math.PI, 0, 0]]);
      parts.push(['dodeca', 0x5a4a38, [0, -1.0, 0], [0.95, 0.8, 0.95]]);
      break;
    case 'boulder':
      parts.push(['dodeca', stone, [0, 0, 0], [1, 1, 1]]);
      break;
  }
  return parts;
}

export function buildPortal() {
  const g = new THREE.Group();
  g.add(mesh('cyl', 0x3a3a4a, [0, 0.25, 0], [7, 0.5, 7]));
  g.add(mesh('cyl', 0x55556a, [0, 0.55, 0], [5.5, 0.2, 5.5]));
  const ringM = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.35, 12, 40), litMaterial({ color: 0x55556a, roughness: 0.35, metalness: 0.6 }));
  ringM.position.y = 3.4;
  g.add(ringM);
  for (const sx of [-1, 1]) g.add(mesh('box', 0x44445a, [sx * 2.9, 1.6, 0], [0.7, 3.2, 0.9]));
  const coreMat = new THREE.MeshBasicMaterial({ color: 0xff3355, transparent: true, opacity: 0.55, side: THREE.DoubleSide });
  const core = new THREE.Mesh(new THREE.CircleGeometry(2.3, 28), coreMat);
  core.position.y = 3.4;
  g.add(core);
  const runes = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const r = mesh('oct', 0xff3355, [Math.cos(a) * 3.2, 0.9, Math.sin(a) * 3.2], [0.35, 0.6, 0.35], null, true);
    r.material = r.material.clone();
    g.add(r);
    runes.push(r);
  }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { group: g, core, ring: ringM, runes };
}

export function buildPickupGeo() {
  return {
    coin: new THREE.CylinderGeometry(0.28, 0.28, 0.08, 10).rotateX(Math.PI / 2),
    xp: new THREE.OctahedronGeometry(0.22),
    heal: new THREE.SphereGeometry(0.3, 8, 6),
    item: new THREE.IcosahedronGeometry(0.45, 0),
  };
}
