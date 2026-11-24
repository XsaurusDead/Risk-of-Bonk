// Procedural low-poly models built from primitives. Enemies/props are merged
// into a single vertex-coloured geometry (1-2 draw calls each); characters are
// kept as a hierarchy so limbs can animate.
import * as THREE from 'three';

const PRIMS = {};
function prim(shape) {
  if (PRIMS[shape]) return PRIMS[shape];
  let g;
  switch (shape) {
    case 'box': g = new THREE.BoxGeometry(1, 1, 1); break;
    case 'sphere': g = new THREE.SphereGeometry(0.5, 10, 7); break;
    case 'cyl': g = new THREE.CylinderGeometry(0.5, 0.5, 1, 10); break;
    case 'cone': g = new THREE.ConeGeometry(0.5, 1, 10); break;
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

export function mergeList(list) {
  if (!list.length) return null;
  let total = 0;
  for (const g of list) total += g.attributes.position.count;
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3);
  let o = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    col.set(g.attributes.color.array, o * 3);
    o += g.attributes.position.count;
    g.dispose();
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('color', new THREE.BufferAttribute(col, 3));
  out.computeBoundingSphere();
  return out;
}

export const MAT = {
  vc: new THREE.MeshLambertMaterial({ vertexColors: true }),
  glow: new THREE.MeshBasicMaterial({ vertexColors: true }),
};

const geoCache = new Map();
/** Cached merged model for an enemy/boss definition. */
export function enemyGeometry(id, def) {
  if (!geoCache.has(id)) geoCache.set(id, buildMerged(def.model));
  return geoCache.get(id);
}

// ------------------------------------------------------------------
// Characters
// ------------------------------------------------------------------
const matCache = new Map();
function mat(color, glow = false) {
  const k = color + (glow ? 'g' : '');
  if (!matCache.has(k)) {
    matCache.set(k, glow ? new THREE.MeshBasicMaterial({ color }) : new THREE.MeshLambertMaterial({ color }));
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
};

/** Build an animatable character. Returns { root, rig } where rig holds limb groups. */
export function buildCharacter(id) {
  const d = CHAR_DESIGN[id] || CHAR_DESIGN.vanguard;
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
  }
  root.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return { root, rig: { body, head, armL, armR, legL, legR, handR, handL } };
}

// ------------------------------------------------------------------
// Decorations (instanced) — returns parts list for buildMerged
// ------------------------------------------------------------------
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
export function buildChest(large) {
  const s = large ? 1.5 : 1;
  const g = new THREE.Group();
  const baseCol = large ? 0x7a3aa8 : 0x8a5a2b;
  const trim = large ? 0xffcc33 : 0xd4af37;
  g.add(mesh('box', baseCol, [0, 0.4 * s, 0], [1.4 * s, 0.8 * s, 0.9 * s]));
  g.add(mesh('box', trim, [0, 0.4 * s, 0], [1.45 * s, 0.12 * s, 0.95 * s]));
  const lid = new THREE.Group();
  lid.position.set(0, 0.8 * s, -0.45 * s);
  lid.add(mesh('box', baseCol, [0, 0.18 * s, 0.45 * s], [1.4 * s, 0.36 * s, 0.9 * s]));
  lid.add(mesh('box', trim, [0, 0.18 * s, 0.9 * s], [0.25 * s, 0.3 * s, 0.06 * s]));
  g.add(lid);
  const glow = mesh('box', 0xffe680, [0, 0.82 * s, 0], [1.2 * s, 0.05 * s, 0.75 * s], null, true);
  g.add(glow);
  return { group: g, lid, glow };
}

export function buildPortal() {
  const g = new THREE.Group();
  g.add(mesh('cyl', 0x3a3a4a, [0, 0.25, 0], [7, 0.5, 7]));
  g.add(mesh('cyl', 0x55556a, [0, 0.55, 0], [5.5, 0.2, 5.5]));
  const ringM = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.35, 8, 28), new THREE.MeshLambertMaterial({ color: 0x55556a }));
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
