// Ground loot glow, ported from the BinbunVFX "GodotLootVFX" pack (Godot shaders ->
// three.js ShaderMaterials). Per rarity: scrolling light pillars, glowing rings,
// a radial ground flare, a soft glow dome and rising stars.
//   common:    1 ring, 1 flare, 1 pillar, 8 stars
//   rare:      2 rings, 2 flares, 2 pillars, 8 stars
//   epic:      + floating sparkle shapes
//   legendary: + twice the stars and shapes
import * as THREE from 'three';

export const LOOT_COLORS = {
  // primary (core) / secondary (edge) colours, from the pack's rarity presets (rare/epic tinted to the game's UI colours)
  common: [0xc8e6ee, 0x4f8290],
  rare: [0x7cc8ff, 0x1460d0],
  epic: [0xd890ff, 0x6a10c0],
  legendary: [0xffd970, 0xd87a00],
};
const TIER = { common: 0, rare: 1, epic: 2, legendary: 3 };

// shared time uniform: one update drives every loot effect
const time = { value: 0 };
export function updateLootFx(dt) {
  time.value += dt;
}

let noiseTex = null;
function noise() {
  if (noiseTex) return noiseTex;
  // small tileable value noise (the pack uses a FastNoiseLite texture)
  const N = 64, data = new Uint8Array(N * N * 4);
  const grid = 8, rnd = [];
  for (let i = 0; i < grid * grid; i++) rnd.push(Math.random());
  const at = (x, y) => rnd[((y + grid) % grid) * grid + ((x + grid) % grid)];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const fx = (x / N) * grid, fy = (y / N) * grid;
      const x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
      const sx = tx * tx * (3 - 2 * tx), sy = ty * ty * (3 - 2 * ty);
      const v = (at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx) * (1 - sy) + (at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx) * sy;
      data.set([v * 255, v * 255, v * 255, 255], (y * N + x) * 4);
    }
  }
  noiseTex = new THREE.DataTexture(data, N, N);
  noiseTex.wrapS = noiseTex.wrapT = THREE.RepeatWrapping;
  noiseTex.needsUpdate = true;
  return noiseTex;
}

const COMMON_GLSL = /* glsl */ `
  uniform vec3 uPrimary; uniform vec3 uSecondary; uniform float uTime; uniform float uEmission; uniform sampler2D uNoise;
  vec3 shiftHue(vec3 c, float h) {
    const vec3 k = vec3(0.57735);
    float a = h * 6.2831853, ca = cos(a), sa = sin(a);
    return c * ca + cross(k, c) * sa + k * dot(k, c) * (1.0 - ca);
  }
  float overlay(float a, float b) { return a < 0.5 ? 2.0 * a * b : 1.0 - 2.0 * (1.0 - a) * (1.0 - b); }
`;
const VERT = /* glsl */ `
  uniform float uTime; uniform float uBob;
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.y += sin(uTime * 2.0) * uBob;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

/** glow_tube.gdshader: scrolling bands + streaks, brightest where the surface faces you. */
function glowTube(pri, sec, o = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uPrimary: { value: new THREE.Color(pri) }, uSecondary: { value: new THREE.Color(sec) }, uTime: time, uEmission: { value: 1.5 },
      uNoise: { value: noise() }, uBob: { value: 0.05 }, uDir: { value: new THREE.Vector2(...(o.dir || [1, 0])) },
      uDetailDir: { value: new THREE.Vector2(0, 1.5) }, uDensity: { value: 0.6 }, uStreaks: { value: 8 }, uScroll: { value: o.scroll ?? 1 },
      uScale: { value: 2 }, uAlign: { value: o.align ? 1 : 0 },
    },
    vertexShader: VERT,
    fragmentShader: COMMON_GLSL + /* glsl */ `
      uniform vec2 uDir; uniform vec2 uDetailDir; uniform float uDensity; uniform float uStreaks; uniform float uScroll; uniform float uScale; uniform float uAlign;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        float dir = dot(vUv, uDir);
        float grad = 1.0 - abs(mod(((dir - 0.5) * uScale * 2.0) + uTime * uScroll, 2.0) - 1.0);
        grad *= grad;
        float fres = abs(dot(vV, vN)); fres = fres * fres * fres;
        float glow = grad * fres;
        vec2 duv = uAlign > 0.5 ? vUv.yx : vUv;
        float detail = abs(mod((dot(duv, uDetailDir) - 0.5) * uStreaks + uTime, 2.0) - 1.0);
        detail = sqrt(detail) * 2.0 - (2.0 - uDensity);
        glow *= detail;
        glow = smoothstep(0.0, 0.4, glow);
        float n = texture2D(uNoise, vUv).r;
        glow = overlay(glow, n);
        vec3 col = shiftHue(mix(uSecondary, uPrimary, fres), (n * 2.0 - 1.0) * 0.05);
        gl_FragColor = vec4(col * (uEmission / 2.0) * clamp(glow, 0.0, 1.0), 1.0);
      }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
}

/** billboard_flare.gdshader: radial streaks + ring, lying on the ground. */
function flare(pri, sec, amount = 0.5) {
  return new THREE.ShaderMaterial({
    uniforms: { uPrimary: { value: new THREE.Color(pri) }, uSecondary: { value: new THREE.Color(sec) }, uTime: time, uEmission: { value: 1.4 }, uNoise: { value: noise() }, uBob: { value: 0 }, uAmount: { value: amount } },
    vertexShader: VERT,
    fragmentShader: COMMON_GLSL + /* glsl */ `
      uniform float uAmount;
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        vec2 d = vUv * 2.0 - 1.0;
        float ang = atan(d.y, d.x) / 6.2831853 + 0.5;
        float r = length(d);
        float g1 = sin(ang * 3.14159 * 8.0 + uTime);
        float g2 = -sin(ang * 3.14159 * 20.0 - uTime);
        float v = clamp(g1 * g2, 0.0, 1.0);
        float mask = pow(max(sin(r * 3.14159), 0.0), 8.0);
        v = pow(v, r * 2.0);
        v = smoothstep(0.0, 1.0, v) * mask;
        float ring = max(1.0 - abs(r * 2.0 - 1.0), 0.0); ring = ring * ring * ring * ring;
        v += ring * 0.6;
        v *= uAmount;
        if (r > 1.0) v = 0.0;
        vec3 col = mix(uSecondary, uPrimary, v) * uEmission;
        gl_FragColor = vec4(col, clamp(v * 0.35, 0.0, 1.0));
      }`,
    transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  });
}

/** glow_core.gdshader: soft dome, bright in the middle, fading at its silhouette. */
function glowCore(pri, sec) {
  return new THREE.ShaderMaterial({
    uniforms: { uPrimary: { value: new THREE.Color(pri) }, uSecondary: { value: new THREE.Color(sec) }, uTime: time, uEmission: { value: 0.9 }, uNoise: { value: noise() }, uBob: { value: 0 } },
    vertexShader: VERT,
    fragmentShader: COMMON_GLSL + /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(abs(dot(vV, vN)), 4.0);
        f = smoothstep(0.0, 1.0, f);
        vec3 col = mix(uSecondary, uPrimary, f) * uEmission;
        gl_FragColor = vec4(col * f, 1.0);
      }`,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
}

let starTex = null;
function star() {
  if (starTex) return starTex;
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.25, 'rgba(255,255,255,0.8)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 32, 32);
  // four-point sparkle
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.fillRect(15, 2, 2, 28);
  g.fillRect(2, 15, 28, 2);
  starTex = new THREE.CanvasTexture(c);
  return starTex;
}

const GEO = {};
function geo() {
  if (GEO.ring) return GEO;
  GEO.ring = new THREE.TorusGeometry(0.45, 0.1, 8, 32); // inner .35 / outer .55 like the pack's TorusMesh
  GEO.flare = new THREE.PlaneGeometry(1.6, 1.6);
  GEO.core = new THREE.SphereGeometry(0.5, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  GEO.pillar1 = new THREE.CylinderGeometry(0.15, 0.15, 2, 24, 1, true);
  GEO.pillar2 = new THREE.CylinderGeometry(0.3, 0.3, 1.2, 24, 1, true);
  return GEO;
}

/**
 * Build the ground glow for an item of `rarity`. The group stands on the ground;
 * call `fx.userData.tick(dt)` every frame for the stars.
 */
export function createLootFx(rarity = 'common', scale = 1.6) {
  const [pri, sec] = LOOT_COLORS[rarity] || LOOT_COLORS.common;
  const tier = TIER[rarity] ?? 0;
  const g = geo();
  const root = new THREE.Group();
  root.scale.setScalar(scale);
  const add = (m) => { m.renderOrder = 6; root.add(m); return m; };

  const ring1 = add(new THREE.Mesh(g.ring, glowTube(pri, sec, { scroll: 1 })));
  ring1.rotation.x = Math.PI / 2;
  ring1.position.y = 0.1;
  const fl1 = add(new THREE.Mesh(g.flare, flare(pri, sec)));
  fl1.rotation.x = -Math.PI / 2;
  fl1.position.y = 0.05;
  add(new THREE.Mesh(g.core, glowCore(pri, sec)));
  const p1 = add(new THREE.Mesh(g.pillar1, glowTube(pri, sec, { align: true, dir: [0, 1], scroll: 0 })));
  p1.position.y = 1.0;
  let ring2 = null;
  if (tier >= 1) {
    ring2 = add(new THREE.Mesh(g.ring, glowTube(pri, sec, { scroll: 1 })));
    ring2.scale.setScalar(0.9);
    ring2.position.y = 0.3;
    const fl2 = add(new THREE.Mesh(g.flare, flare(pri, sec)));
    fl2.rotation.set(-Math.PI / 2, 0, Math.PI / 4);
    fl2.scale.setScalar(1.2);
    fl2.position.y = 0.05;
    const p2 = add(new THREE.Mesh(g.pillar2, glowTube(pri, sec, { align: true, dir: [0, 1], scroll: 0 })));
    p2.rotation.y = Math.PI / 4;
    p2.position.y = 0.6;
  }

  // rising stars (+ bigger floating sparkles from epic up)
  const nStars = tier >= 3 ? 16 : 8;
  const nShapes = tier >= 2 ? (tier >= 3 ? 16 : 8) : 0;
  const parts = [];
  const mk = (size, color) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: star(), color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.userData.size = size;
    s.renderOrder = 7;
    root.add(s);
    return s;
  };
  for (let i = 0; i < nStars; i++) parts.push({ s: mk(0.12, pri), life: 1.5, t: Math.random() * 1.5 });
  for (let i = 0; i < nShapes; i++) parts.push({ s: mk(0.3, sec), life: 1.5, t: Math.random() * 1.5 });
  const respawn = (p) => {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.4;
    p.x = Math.cos(a) * r;
    p.z = Math.sin(a) * r;
    p.vy = 0.25 + Math.random() * 0.35;
    p.t = 0;
  };
  parts.forEach((p) => { respawn(p); p.t = Math.random() * p.life; });

  let spin = Math.random() * 6;
  root.userData.tick = (dt) => {
    spin += dt;
    ring1.rotation.z = spin * 0.6;
    if (ring2) ring2.rotation.y = spin * 0.8;
    for (const p of parts) {
      p.t += dt;
      if (p.t >= p.life) respawn(p);
      const k = p.t / p.life;
      // scale curve from the pack: 0 -> 1 at 20% -> 0
      const sc = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8;
      p.s.position.set(p.x, 0.1 + p.vy * p.t + 0.15 * p.t * p.t, p.z);
      p.s.scale.setScalar(p.s.userData.size * Math.max(0.001, sc));
    }
  };
  root.userData.dispose = () => root.traverse((o) => { if (o.material) o.material.dispose(); });
  return root;
}
