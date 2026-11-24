// Procedural stage: heightmap terrain with terraces/cliffs, liquid, instanced
// decorations, ruins, caves, floating islands with jump pads, colliders,
// chests, shrines, Moai statues and the boss portal.
import * as THREE from 'three';
import { G } from '../core/state.js';
import { makeNoise2D, fbm, smoothstep, mulberry32, SpatialHash, lerp, clamp } from '../core/util.js';
import {
  buildMerged, decorParts, MAT, buildChest, buildPortal, litMaterial, swayMaterial, setGlowColor,
  buildShrine, buildMoai, buildJumpPad, structureParts,
} from './models.js';
import { terrainDetailTexture } from './textures.js';
import { assetsReady, getModel, desertRockTexture } from './assets.js';
import { attachGlyph, recolorGlyph } from './glyphs.js';

// animated rune pillars (spell pack) floating above shrines: colour + design per kind
const SHRINE_GLYPH = { heal: ['D', 17], combat: ['H', 24], boss: ['K', 29], xp: ['C', 20], moai: ['E', 10] };

export const SIZE = 520;
const SEGS = 220;
const AREA_MULT = 3.2; // decor density scale vs. the old 260m maps
// model decoration is bucketed into N x N map sections; sections out of range aren't drawn
const FAR_CHUNKS = 5; // trees, rocks: culled at the fog distance
const NEAR_CHUNKS = 8; // small ground cover: culled close to the camera
const NEAR_RANGE = 55;
const desertCache = new Map();
function desertVariant(mat) {
  if (!desertCache.has(mat.uuid)) {
    const m = mat.clone();
    m.map = desertRockTexture();
    m.needsUpdate = true;
    desertCache.set(mat.uuid, m);
  }
  return desertCache.get(mat.uuid);
}
// wind sway strength per vegetation type (0 = static)
const SWAY = { grass: 0.32, dry_grass: 0.32, flower: 0.25, tree: 0.0035, pine: 0.003, dead_tree: 0.004, giant_mushroom: 0.002, glow_shroom: 0.08, cactus: 0.0008 };

// how many of each interactable a stage rolls (min..max)
const COUNTS = { chest: [15, 20], heal: [1, 2], combat: [1, 3], boss: [1, 3], xp: [2, 5], moai: [3, 7] };
// chest tier odds
const CHEST_TIERS = { normal: 82, large: 13, epic: 4, legendary: 1 };

export class World {
  constructor(stage, seed, loop = 0) {
    this.stage = stage;
    this.seed = seed;
    this.loop = loop;
    this.half = SIZE / 2 - 8;
    this.group = new THREE.Group();
    this.colliders = [];
    this.colHash = new SpatialHash(10);
    this.interactables = [];
    this.platforms = [];
    this.jumpPads = [];
    this.caves = [];
    this.structures = [];
    this.disposables = [];
    this.rng = mulberry32(seed);
    this.liquidLevel = stage.liquid ? stage.liquid.level : -999;
    this.t = 0;
    this.buildHeights();
    this.buildTerrain();
    this.buildLiquid();
    this.placePortal();
    this.flatten(0, 0, 12);
    this.flatten(this.portalPos.x, this.portalPos.z, 12);
    this.planStructures();
    this.rebuildTerrainGeometry();
    this.buildStructures();
    this.placeInteractables();
    this.buildDecor();
    this.buildPortalMesh();
  }

  // ---------------------------------------------------------------- heights
  baseHeight(x, z) {
    const s = this.stage.terrain;
    const n = this.noise;
    let h = fbm(n, x * s.freq + 100, z * s.freq + 100, s.octaves) * s.amp;
    if (s.ridge) {
      const r = 1 - Math.abs(fbm(n, x * s.freq * 0.7 - 50, z * s.freq * 0.7 + 30, 3));
      h = lerp(h, (r * 2 - 1) * s.amp * 1.2, s.ridge * 0.5);
    }
    h += n(x * 0.004 + 7, z * 0.004 - 3) * s.amp * 0.8;
    // terraces: stepped plateaus with cliffs, softened into ramps in places
    if (s.terrace) {
      const T = s.terrace;
      const v = (fbm(n, x * T.freq + 300, z * T.freq - 200, 3) * 0.5 + 0.5) * T.levels;
      const f = Math.floor(v), fr = v - f;
      const ramp = n(x * 0.012 - 90, z * 0.012 + 40) * 0.5 + 0.5; // where cliffs turn into slopes
      const sharp = lerp(0.04, 0.42, smoothstep(0.45, 0.8, ramp));
      const step = f + smoothstep(0.5 - sharp, 0.5 + sharp, fr);
      h += (step - T.levels * 0.45) * T.height;
    }
    // edge mountains form the arena wall
    const d = Math.max(Math.abs(x), Math.abs(z));
    h += smoothstep(SIZE / 2 - s.edge - 14, SIZE / 2, d) * 55;
    return h;
  }

  buildHeights() {
    this.noise = makeNoise2D(this.seed);
    const N = SEGS + 1;
    this.N = N;
    this.cell = SIZE / SEGS;
    this.grid = new Float32Array(N * N);
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const x = -SIZE / 2 + i * this.cell, z = -SIZE / 2 + j * this.cell;
        this.grid[j * N + i] = this.baseHeight(x, z);
      }
    }
  }

  /** Smoothly flatten a circular area to a target height (default: current, above liquid). */
  flatten(cx, cz, r, target = null) {
    if (target === null) target = Math.max(this.heightAt(cx, cz), this.liquidLevel + 1.2);
    const N = this.N, c = this.cell, H = SIZE / 2;
    const i0 = Math.max(0, Math.floor((cx - r * 2 + H) / c)), i1 = Math.min(N - 1, Math.ceil((cx + r * 2 + H) / c));
    const j0 = Math.max(0, Math.floor((cz - r * 2 + H) / c)), j1 = Math.min(N - 1, Math.ceil((cz + r * 2 + H) / c));
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const x = -H + i * c, z = -H + j * c;
        const d = Math.hypot(x - cx, z - cz);
        if (d < r * 2) {
          const k = 1 - smoothstep(r, r * 2, d);
          const idx = j * N + i;
          this.grid[idx] = lerp(this.grid[idx], target, k);
        }
      }
    }
    return target;
  }

  heightAt(x, z) {
    const N = this.N;
    const fx = clamp((x + SIZE / 2) / this.cell, 0, SEGS - 0.0001);
    const fz = clamp((z + SIZE / 2) / this.cell, 0, SEGS - 0.0001);
    const i = Math.floor(fx), j = Math.floor(fz);
    const u = fx - i, v = fz - j;
    const g = this.grid;
    const h00 = g[j * N + i], h10 = g[j * N + i + 1], h01 = g[(j + 1) * N + i], h11 = g[(j + 1) * N + i + 1];
    if (u + v < 1) return h00 + (h10 - h00) * u + (h01 - h00) * v;
    return h11 + (h01 - h11) * (1 - u) + (h10 - h11) * (1 - v);
  }

  /** Walkable ground under (x, z) for something at height y: terrain or a floating island. */
  groundAt(x, z, y = Infinity) {
    let h = this.heightAt(x, z);
    for (const p of this.platforms) {
      const dx = x - p.x, dz = z - p.z;
      if (dx * dx + dz * dz < p.r * p.r && y >= p.top - 0.8 && p.top > h) h = p.top;
    }
    return h;
  }

  surfaceAt(x, z) {
    return Math.max(this.heightAt(x, z), this.liquidLevel);
  }

  slopeAt(x, z) {
    const e = 1.5;
    return Math.hypot(this.heightAt(x + e, z) - this.heightAt(x - e, z), this.heightAt(x, z + e) - this.heightAt(x, z - e)) / (2 * e);
  }

  // ---------------------------------------------------------------- terrain mesh
  buildTerrain() {
    const N = this.N;
    this.terrainGeo = new THREE.BufferGeometry();
    this.terrainGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * N * 3), 3));
    this.terrainGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * N * 3), 3));
    this.terrainGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(N * N * 2), 2));
    const idx = new Uint32Array(SEGS * SEGS * 6);
    let o = 0;
    for (let j = 0; j < SEGS; j++) {
      for (let i = 0; i < SEGS; i++) {
        const a = j * N + i, b = (j + 1) * N + i, c = j * N + i + 1, d = (j + 1) * N + i + 1;
        idx[o++] = a; idx[o++] = b; idx[o++] = c;
        idx[o++] = c; idx[o++] = b; idx[o++] = d;
      }
    }
    this.terrainGeo.setIndex(new THREE.BufferAttribute(idx, 1));
    const tex = terrainDetailTexture(this.stage.id);
    this.terrainMat = litMaterial({ vertexColors: true, roughness: 0.96, map: tex, bumpMap: MAT.high ? tex : null, bumpScale: 0.6 });
    this.terrain = new THREE.Mesh(this.terrainGeo, this.terrainMat);
    this.terrain.receiveShadow = true;
    this.group.add(this.terrain);
    this.disposables.push(this.terrainGeo, this.terrainMat);
  }

  rebuildTerrainGeometry() {
    const N = this.N, g = this.grid, c = this.cell, H = SIZE / 2;
    const pos = this.terrainGeo.attributes.position.array;
    const uv = this.terrainGeo.attributes.uv.array;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const v = j * N + i, k = v * 3;
        pos[k] = -H + i * c;
        pos[k + 1] = g[v];
        pos[k + 2] = -H + j * c;
        uv[v * 2] = pos[k] / 6; // detail texture repeats every 6m
        uv[v * 2 + 1] = pos[k + 2] / 6;
      }
    }
    this.terrainGeo.attributes.position.needsUpdate = true;
    this.terrainGeo.attributes.uv.needsUpdate = true;
    this.terrainGeo.computeVertexNormals();
    this.terrainGeo.computeBoundingSphere();

    const col = this.terrainGeo.attributes.color.array;
    const nor = this.terrainGeo.attributes.normal.array;
    const gc = this.stage.ground;
    const cLow = new THREE.Color(gc.low), cMid = new THREE.Color(gc.mid), cHigh = new THREE.Color(gc.high);
    const cSlope = new THREE.Color(gc.slope), cPeak = new THREE.Color(gc.peak);
    const tmp = new THREE.Color();
    const amp = this.stage.terrain.amp + (this.stage.terrain.terrace ? this.stage.terrain.terrace.height * 1.5 : 0);
    const n = this.noise;
    for (let v = 0; v < N * N; v++) {
      const x = pos[v * 3], h = pos[v * 3 + 1], z = pos[v * 3 + 2];
      const ny = nor[v * 3 + 1];
      const patch = n(x * 0.035 + 31, z * 0.035 - 17) * 0.5 + 0.5;
      const t = clamp((h + amp) / (amp * 2.2) + (patch - 0.5) * 0.35, 0, 1);
      if (t < 0.5) tmp.copy(cLow).lerp(cMid, t * 2);
      else tmp.copy(cMid).lerp(cHigh, (t - 0.5) * 2);
      tmp.lerp(cSlope, smoothstep(0.84, 0.6, ny)); // cliff faces turn to rock
      if (h > 26) tmp.lerp(cPeak, smoothstep(26, 40, h));
      if (this.liquidLevel > -900) tmp.multiplyScalar(lerp(0.72, 1, smoothstep(this.liquidLevel, this.liquidLevel + 2.5, h)));
      const fine = 0.92 + (n(x * 0.45, z * 0.45) * 0.5 + 0.5) * 0.16;
      // detail texture darkens slightly; compensate so overall brightness stays
      const k = fine * 1.12;
      col[v * 3] = tmp.r * k;
      col[v * 3 + 1] = tmp.g * k;
      col[v * 3 + 2] = tmp.b * k;
    }
    this.terrainGeo.attributes.color.needsUpdate = true;
  }

  buildLiquid() {
    const L = this.stage.liquid;
    if (!L) return;
    const segs = MAT.high ? 96 : 1;
    const geo = new THREE.PlaneGeometry(SIZE + 120, SIZE + 120, segs, segs).rotateX(-Math.PI / 2);
    const lava = L.dps >= 0.1;
    const mat = litMaterial({
      color: L.color, emissive: L.emissive, emissiveIntensity: lava ? 1.6 : 1, transparent: L.opacity < 1, opacity: L.opacity,
      roughness: lava ? 0.6 : 0.08, metalness: lava ? 0 : 0.25,
    });
    this.liquid = new THREE.Mesh(geo, mat);
    this.liquid.position.y = L.level;
    this.liquid.receiveShadow = true;
    this.group.add(this.liquid);
    this.liquidWaves = segs > 1;
    this.disposables.push(geo, mat);
  }

  // ---------------------------------------------------------------- placement helpers
  randomSpot(minDistCenter = 0, margin = 20, tries = 60, maxSlope = 0.5, avoid = null, minSep = 0) {
    for (let k = 0; k < tries; k++) {
      const x = (this.rng() * 2 - 1) * (this.half - margin);
      const z = (this.rng() * 2 - 1) * (this.half - margin);
      if (Math.hypot(x, z) < minDistCenter) continue;
      const h = this.heightAt(x, z);
      if (h < this.liquidLevel + 0.5) continue;
      if (this.slopeAt(x, z) > maxSlope) continue;
      if (avoid && avoid.some((a) => Math.hypot(a.x - x, a.z - z) < (a.r || 0) + minSep)) continue;
      return new THREE.Vector3(x, h, z);
    }
    return null;
  }

  occupied() {
    const list = [{ x: 0, z: 0, r: 14 }, { x: this.portalPos.x, z: this.portalPos.z, r: 14 }];
    for (const s of this.structures) list.push({ x: s.x, z: s.z, r: s.r });
    for (const it of this.interactables) list.push({ x: it.pos.x, z: it.pos.z, r: 4 });
    return list;
  }

  placePortal() {
    let best = null;
    for (let k = 0; k < 300 && !best; k++) best = this.randomSpot(140 - Math.floor(k / 50) * 20, 40, 1, 0.3);
    this.portalPos = best || new THREE.Vector3(120, 0, 120);
  }

  addCollider(x, z, r) {
    const c = { x, z, r };
    this.colliders.push(c);
    this.colHash.insert(c, x, z);
  }

  // ---------------------------------------------------------------- structures
  rangeRoll([a, b]) {
    return a + Math.floor(this.rng() * (b - a + 1));
  }

  /** Decide where ruins / caves / islands go and flatten the ground for them (before the mesh is built). */
  planStructures() {
    const st = this.stage.structures || {};
    const avoid = () => this.occupied();
    for (let i = 0; i < this.rangeRoll(st.ruins || [5, 8]); i++) {
      const p = this.randomSpot(30, 30, 40, 0.4, avoid(), 18);
      if (!p) continue;
      const y = this.flatten(p.x, p.z, 9);
      this.structures.push({ type: 'ruins', x: p.x, z: p.z, y, r: 14, rot: this.rng() * Math.PI });
    }
    for (let i = 0; i < this.rangeRoll(st.caves || [2, 3]); i++) {
      const p = this.randomSpot(40, 40, 40, 0.35, avoid(), 30);
      if (!p) continue;
      const rot = this.rng() * Math.PI;
      const y = Math.max(this.heightAt(p.x, p.z), this.liquidLevel + 1.5);
      // flatten a corridor so the tunnel floor is level
      const dx = Math.cos(rot), dz = Math.sin(rot);
      for (let s = -16; s <= 16; s += 4) this.flatten(p.x + dx * s, p.z + dz * s, 5, y);
      this.structures.push({ type: 'cave', x: p.x, z: p.z, y, r: 22, rot, len: 34, w: 7 });
    }
    for (let i = 0; i < this.rangeRoll(st.islands || [3, 5]); i++) {
      const p = this.randomSpot(30, 40, 40, 0.5, avoid(), 25);
      if (!p) continue;
      const y = this.flatten(p.x, p.z, 4);
      this.structures.push({ type: 'island', x: p.x, z: p.z, y, r: 10, top: y + 15 + this.rng() * 8, ir: 7 + this.rng() * 3 });
    }
  }

  buildStructures() {
    const tint = this.stage.ruinTint;
    const geoCache = {};
    const addMerged = (kind, x, y, z, rot, scale = 1, tintOverride) => {
      const key = kind + (tintOverride || tint || '');
      if (!geoCache[key]) {
        geoCache[key] = buildMerged(structureParts(kind, tintOverride || tint, this.rng));
        if (geoCache[key].geo) this.disposables.push(geoCache[key].geo);
      }
      const m = new THREE.Mesh(geoCache[key].geo, MAT.vc);
      m.position.set(x, y, z);
      m.rotation.y = rot;
      m.scale.setScalar(scale);
      m.castShadow = MAT.high;
      m.receiveShadow = true;
      this.group.add(m);
      return m;
    };
    for (const s of this.structures) {
      if (s.type === 'ruins') {
        const c = Math.cos(s.rot), sn = Math.sin(s.rot);
        const local = (lx, lz) => [s.x + lx * c - lz * sn, s.z + lx * sn + lz * c];
        addMerged('ruin_floor', s.x, s.y, s.z, s.rot);
        // two broken walls and an arch around a paved floor
        const [w1x, w1z] = local(0, -8);
        addMerged('ruin_wall', w1x, this.heightAt(w1x, w1z), w1z, s.rot);
        for (let k = -2; k <= 2; k++) { const [x, z] = local(k * 2.2, -8); this.addCollider(x, z, 1.1); }
        const [w2x, w2z] = local(-8, 0);
        addMerged('ruin_wall', w2x, this.heightAt(w2x, w2z), w2z, s.rot + Math.PI / 2);
        for (let k = -2; k <= 2; k++) { const [x, z] = local(-8, k * 2.2); this.addCollider(x, z, 1.1); }
        const [ax, az] = local(6, 6);
        addMerged('ruin_arch', ax, this.heightAt(ax, az), az, s.rot + Math.PI / 4);
        const ca = Math.cos(s.rot + Math.PI / 4), sa = Math.sin(s.rot + Math.PI / 4);
        this.addCollider(ax + ca * 2.6, az + sa * 2.6, 0.8);
        this.addCollider(ax - ca * 2.6, az - sa * 2.6, 0.8);
        this.addCollider(...local(-4.5, -4.5), 0.6);
      } else if (s.type === 'cave') {
        this.buildCave(s);
      } else if (s.type === 'island') {
        const m = addMerged('island', s.x, s.top, s.z, this.rng() * 6, 1, this.stage.ground.mid);
        m.scale.set(s.ir, s.ir * 0.9, s.ir);
        this.platforms.push({ x: s.x, z: s.z, r: s.ir * 0.95, top: s.top });
        const pad = buildJumpPad();
        pad.group.position.set(s.x, s.y, s.z);
        this.group.add(pad.group);
        this.jumpPads.push({ x: s.x, z: s.z, y: s.y, ring: pad.ring, power: Math.sqrt(2 * 32 * (s.top - s.y + 5)) });
      }
    }
  }

  buildCave(s) {
    const dx = Math.cos(s.rot), dz = Math.sin(s.rot);
    const px = -dz, pz = dx; // perpendicular
    const rockCol = this.stage.ground.slope;
    const rockGeo = buildMerged(structureParts('boulder', rockCol)).geo;
    this.disposables.push(rockGeo);
    const half = s.len / 2;
    const rocks = new THREE.InstancedMesh(rockGeo, MAT.vc, 80);
    const dummy = new THREE.Object3D();
    let n = 0;
    for (let t = -half; t <= half; t += 2.6) {
      for (const side of [-1, 1]) {
        const x = s.x + dx * t + px * side * (s.w / 2 + 1.6), z = s.z + dz * t + pz * side * (s.w / 2 + 1.6);
        dummy.position.set(x, s.y + 1.5, z);
        dummy.rotation.set(this.rng() * 3, this.rng() * 3, 0);
        dummy.scale.set(3.4 + this.rng(), 5 + this.rng() * 1.5, 3.4 + this.rng());
        dummy.updateMatrix();
        rocks.setMatrixAt(n++, dummy.matrix);
        this.addCollider(x, z, 2.2);
      }
    }
    rocks.count = n;
    rocks.castShadow = MAT.high;
    rocks.receiveShadow = true;
    this.group.add(rocks);
    // the roof: a half-tube of rock that hides itself when you walk inside
    const roofGeo = new THREE.CylinderGeometry(s.w / 2 + 2.4, s.w / 2 + 2.4, s.len + 4, 14, 1, true, 0, Math.PI);
    roofGeo.rotateZ(Math.PI / 2);
    roofGeo.rotateY(-s.rot);
    const roofMat = litMaterial({ color: rockCol, roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 1 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(s.x, s.y + 4.2, s.z);
    roof.scale.y = 0.9;
    roof.castShadow = MAT.high;
    this.group.add(roof);
    this.disposables.push(roofGeo, roofMat);
    // glowing crystals inside
    for (let i = 0; i < 4; i++) {
      const t = (i / 3 - 0.5) * (s.len - 6);
      const side = i % 2 ? 1 : -1;
      const g = new THREE.Mesh(new THREE.OctahedronGeometry(0.5), MAT.glow);
      g.scale.set(0.7, 1.6, 0.7);
      g.position.set(s.x + dx * t + px * side * (s.w / 2 - 0.3), s.y + 0.8, s.z + dz * t + pz * side * (s.w / 2 - 0.3));
      this.group.add(g);
      this.disposables.push(g.geometry);
    }
    const light = new THREE.PointLight(0x9fdcff, 25, 18, 2);
    light.position.set(s.x, s.y + 3, s.z);
    this.group.add(light);
    this.caves.push({ ...s, dx, dz, roof, roofMat });
  }

  /** Is (x, z) inside a cave tunnel? */
  inCave(x, z) {
    for (const c of this.caves) {
      const rx = x - c.x, rz = z - c.z;
      const along = rx * c.dx + rz * c.dz, across = rx * -c.dz + rz * c.dx;
      if (Math.abs(along) < c.len / 2 + 1 && Math.abs(across) < c.w / 2 + 2) return c;
    }
    return null;
  }

  // ---------------------------------------------------------------- interactables
  placeInteractables() {
    const add = (kind, pos, extra = {}) => {
      let built;
      if (kind === 'chest') built = buildChest(extra.tier);
      else if (kind === 'moai') built = buildMoai();
      else built = buildShrine(kind);
      built.group.position.copy(pos);
      built.group.rotation.y = this.rng() * Math.PI * 2;
      this.group.add(built.group);
      const it = { kind, pos: pos.clone(), used: false, ...built, ...extra };
      if (SHRINE_GLYPH[kind]) {
        built.group.updateMatrixWorld(true);
        const top = new THREE.Box3().setFromObject(built.group).max.y - pos.y;
        it.glyph = attachGlyph(built.group, SHRINE_GLYPH[kind][0], SHRINE_GLYPH[kind][1], 1.8, top + 0.2, { opacity: 0.9 });
      }
      this.interactables.push(it);
      this.addCollider(pos.x, pos.z, kind === 'chest' ? 1 : kind === 'moai' ? 1.2 : 1.5);
      return it;
    };
    const spot = (minSep = 14) => this.randomSpot(16, 24, 50, 0.45, this.occupied(), minSep);
    // rewards in special places first: inside caves and on top of islands
    for (const c of this.caves) add('chest', new THREE.Vector3(c.x, c.y, c.z), { tier: this.rng() < 0.5 ? 'large' : 'normal' });
    for (const s of this.structures) {
      if (s.type !== 'island') continue;
      const r = this.rng();
      const pos = new THREE.Vector3(s.x + 1.5, s.top, s.z);
      if (r < 0.5) add('chest', pos, { tier: this.rollChestTier(2) });
      else if (r < 0.75) add('moai', pos);
      else add('xp', pos);
    }
    for (const s of this.structures) if (s.type === 'ruins' && this.rng() < 0.6) add('chest', new THREE.Vector3(s.x, s.y, s.z), { tier: this.rollChestTier(1.5) });
    const total = (k) => this.rangeRoll(COUNTS[k]) + (k === 'chest' ? Math.min(4, this.loop) : 0);
    const chestsWanted = total('chest') - this.interactables.filter((i) => i.kind === 'chest').length;
    for (let i = 0; i < chestsWanted; i++) {
      const p = spot();
      if (p) add('chest', p, { tier: this.rollChestTier(1) });
    }
    for (const kind of ['heal', 'combat', 'boss', 'xp', 'moai']) {
      const have = this.interactables.filter((i) => i.kind === kind).length;
      for (let i = have; i < total(kind); i++) {
        const p = spot(18);
        if (p) add(kind, p);
      }
    }
  }

  /** A chest that appears during play (elite drop). `free` chests cost nothing to open. */
  spawnChest(pos, tier = 'normal', free = false) {
    const p = pos.clone();
    p.y = this.groundAt(p.x, p.z, p.y + 2);
    const built = buildChest(tier);
    built.group.position.copy(p);
    built.group.rotation.y = Math.random() * Math.PI * 2;
    this.group.add(built.group);
    const it = { kind: 'chest', pos: p, used: false, ...built, tier, free };
    this.interactables.push(it);
    this.addCollider(p.x, p.z, 1);
    return it;
  }

  rollChestTier(bonus = 1) {
    const w = { normal: CHEST_TIERS.normal, large: CHEST_TIERS.large * bonus, epic: CHEST_TIERS.epic * bonus, legendary: CHEST_TIERS.legendary * bonus };
    let tot = 0;
    for (const k in w) tot += w[k];
    let r = this.rng() * tot;
    for (const k in w) if ((r -= w[k]) <= 0) return k;
    return 'normal';
  }

  // ---------------------------------------------------------------- decor
  buildDecor() {
    const density = (G.quality === 'low' ? 0.5 : 1) * AREA_MULT;
    const dummy = new THREE.Object3D();
    const col = new THREE.Color();
    const avoid = this.occupied();
    for (const it of this.interactables) avoid.push({ x: it.pos.x, z: it.pos.z, r: 4 });
    for (const c of this.caves) avoid.push({ x: c.x, z: c.z, r: c.len / 2 + 4 });
    for (const d of this.stage.decor) {
      // real 3D models from the asset pack when available
      if (d.models && assetsReady() && this.buildModelDecor(d, density, avoid)) continue;
      if (d.proc === false) continue; // model-only decoration
      const count = Math.floor(d.count * density);
      const { geo, glow } = buildMerged(decorParts(d.type, d.tint));
      if (geo) this.disposables.push(geo);
      if (glow) this.disposables.push(glow);
      const sway = SWAY[d.type];
      const mat = sway && geo ? swayMaterial(sway) : MAT.vc;
      if (mat !== MAT.vc) this.disposables.push(mat);
      const inst = geo ? new THREE.InstancedMesh(geo, mat, count) : null;
      const instG = glow ? new THREE.InstancedMesh(glow, MAT.glow, count) : null;
      let n = 0;
      const grassy = d.collide === 0;
      for (let k = 0; k < count * 3 && n < count; k++) {
        const x = (this.rng() * 2 - 1) * (this.half - 4);
        const z = (this.rng() * 2 - 1) * (this.half - 4);
        const h = this.heightAt(x, z);
        const floating = d.type === 'floating_rock';
        if (!floating && h < this.liquidLevel + 0.2) continue;
        if (!floating && this.slopeAt(x, z) > (grassy ? 0.7 : 0.9)) continue;
        if (!grassy && avoid.some((a) => Math.hypot(a.x - x, a.z - z) < a.r)) continue;
        const s = lerp(d.scale[0], d.scale[1], this.rng());
        dummy.position.set(x, h - 0.1 + (floating ? 10 + this.rng() * 20 : 0), z);
        dummy.rotation.set(0, this.rng() * Math.PI * 2, 0);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        col.setScalar(0.85 + this.rng() * 0.25);
        if (inst) { inst.setMatrixAt(n, dummy.matrix); inst.setColorAt(n, col); }
        if (instG) instG.setMatrixAt(n, dummy.matrix);
        if (d.collide > 0) this.addCollider(x, z, d.collide * s);
        n++;
      }
      for (const m of [inst, instG]) {
        if (!m) continue;
        m.count = n;
        m.instanceMatrix.needsUpdate = true;
        m.castShadow = m === inst && d.collide > 0 && MAT.high;
        m.receiveShadow = false;
        m.computeBoundingSphere();
        this.group.add(m);
      }
    }
  }

  /** Instanced glTF decoration, bucketed into map chunks so far-away chunks can be skipped. */
  buildModelDecor(d, density, avoid) {
    let variants = d.models.map(getModel).filter(Boolean);
    if (!variants.length) return false;
    if (G.quality === 'low') variants = variants.slice(0, 2); // fewer draw calls on phones
    // small ground cover lives in a finer grid that is culled much closer to the camera
    const small = d.collide === 0 && d.scale[1] * Math.max(...variants.map((v) => v.height)) < 2.5;
    const CHUNKS = small ? NEAR_CHUNKS : FAR_CHUNKS;
    const count = Math.floor(d.count * density * (G.quality === 'low' && d.collide > 0 ? 0.75 : 1));
    const H = SIZE / 2, CH = SIZE / CHUNKS;
    const buckets = new Map();
    const dummy = new THREE.Object3D();
    const col = new THREE.Color();
    const tint = new THREE.Color(d.tint ?? 0xffffff);
    const ground = d.collide === 0;
    let placed = 0;
    for (let k = 0; k < count * 3 && placed < count; k++) {
      const x = (this.rng() * 2 - 1) * (this.half - 4);
      const z = (this.rng() * 2 - 1) * (this.half - 4);
      const h = this.heightAt(x, z);
      if (h < this.liquidLevel + 0.2) continue;
      if (this.slopeAt(x, z) > (ground ? 0.75 : 0.6)) continue;
      if (!ground && avoid.some((a) => Math.hypot(a.x - x, a.z - z) < a.r)) continue;
      const vi = Math.floor(this.rng() * variants.length);
      const s = lerp(d.scale[0], d.scale[1], this.rng());
      dummy.position.set(x, h - 0.15 * s, z);
      dummy.rotation.set(d.tilt ? (this.rng() - 0.5) * d.tilt : 0, this.rng() * Math.PI * 2, d.tilt ? (this.rng() - 0.5) * d.tilt : 0);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      const ci = Math.min(CHUNKS - 1, Math.floor((x + H) / CH)) + Math.min(CHUNKS - 1, Math.floor((z + H) / CH)) * CHUNKS;
      const key = vi + ':' + ci;
      if (!buckets.has(key)) buckets.set(key, { vi, ci, mats: [], cols: [] });
      const b = buckets.get(key);
      b.mats.push(dummy.matrix.clone());
      b.cols.push(col.copy(tint).multiplyScalar(0.85 + this.rng() * 0.25).clone());
      if (d.collide > 0) this.addCollider(x, z, d.collide * s);
      placed++;
    }
    for (const b of buckets.values()) {
      const chunk = this.chunk(b.ci, small);
      for (const part of variants[b.vi].parts) {
        let mat = part.material;
        if (d.tex === 'desertRock' && desertRockTexture()) mat = desertVariant(mat);
        const inst = new THREE.InstancedMesh(part.geometry, mat, b.mats.length);
        b.mats.forEach((m, i) => {
          inst.setMatrixAt(i, m);
          inst.setColorAt(i, b.cols[i]);
        });
        inst.instanceMatrix.needsUpdate = true;
        if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
        inst.castShadow = MAT.high && part.castShadow && d.collide > 0;
        inst.receiveShadow = MAT.high && !ground;
        inst.computeBoundingSphere();
        chunk.add(inst);
      }
    }
    return true;
  }

  chunk(ci, small) {
    this.chunkGroups = this.chunkGroups || [];
    this.chunkMap = this.chunkMap || {};
    const key = (small ? 'n' : 'f') + ci;
    if (!this.chunkMap[key]) {
      const n = small ? NEAR_CHUNKS : FAR_CHUNKS;
      const CH = SIZE / n;
      const g = new THREE.Group();
      g.userData.cx = -SIZE / 2 + ((ci % n) + 0.5) * CH;
      g.userData.cz = -SIZE / 2 + (Math.floor(ci / n) + 0.5) * CH;
      g.userData.range = (small ? NEAR_RANGE : (this.stage.fogFar || 160)) + CH * 0.75;
      this.group.add(g);
      this.chunkGroups.push(g);
      this.chunkMap[key] = g;
    }
    return this.chunkMap[key];
  }

  /** Skip whole chunks of models that are beyond the fog. */
  cullChunks() {
    if (!this.chunkGroups) return;
    const cam = G.camera.position;
    for (const g of this.chunkGroups) g.visible = Math.hypot(g.userData.cx - cam.x, g.userData.cz - cam.z) < g.userData.range;
  }

  buildPortalMesh() {
    const p = buildPortal();
    p.group.position.copy(this.portalPos);
    this.group.add(p.group);
    this.portal = { pos: this.portalPos, state: 'idle', charge: 0, ...p };
    this.addCollider(this.portalPos.x + 2.9, this.portalPos.z, 0.6);
    this.addCollider(this.portalPos.x - 2.9, this.portalPos.z, 0.6);
    const geo = new THREE.RingGeometry(0.97, 1, 64).rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff3355, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide });
    const zone = new THREE.Mesh(geo, mat);
    zone.position.copy(this.portalPos).setY(this.portalPos.y + 0.5);
    zone.scale.setScalar(this.chargeRadius);
    zone.visible = false;
    this.group.add(zone);
    this.portal.zone = zone;
    this.disposables.push(geo, mat);
    // four rune pillars around the portal: pink while idle, gold while charging, green when ready
    this.portal.glyphs = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const holder = new THREE.Group();
      const x = this.portalPos.x + Math.cos(a) * 4.2, z = this.portalPos.z + Math.sin(a) * 4.2;
      holder.position.set(x, this.groundAt(x, z, this.portalPos.y + 3), z);
      this.group.add(holder);
      this.portal.glyphs.push(attachGlyph(holder, 'B', 24, 3.2, 0));
    }
    this.portal.glyphState = 'idle';
  }

  get chargeRadius() {
    return 28;
  }

  // ---------------------------------------------------------------- physics
  collide(pos, r) {
    const near = this.colHash.query(pos.x, pos.z, r + 4);
    for (const c of near) {
      const dx = pos.x - c.x, dz = pos.z - c.z;
      const min = r + c.r;
      const d2 = dx * dx + dz * dz;
      if (d2 < min * min) {
        const d = Math.sqrt(d2) || 0.001;
        pos.x = c.x + (dx / d) * min;
        pos.z = c.z + (dz / d) * min;
      }
    }
  }
  clampBounds(pos) {
    const H = this.half;
    pos.x = clamp(pos.x, -H, H);
    pos.z = clamp(pos.z, -H, H);
  }

  // ---------------------------------------------------------------- interaction
  findInteractable(pos) {
    let best = null, bd = Infinity;
    for (const it of this.interactables) {
      if (it.used) continue;
      const d = Math.hypot(it.pos.x - pos.x, it.pos.z - pos.z);
      const reach = it.kind === 'chest' ? 3.6 : 4.2;
      if (d < reach && d < bd && Math.abs(it.pos.y - pos.y) < 3.5) {
        bd = d;
        best = { kind: it.kind, obj: it };
      }
    }
    const P = this.portal;
    const dp = Math.hypot(P.pos.x - pos.x, P.pos.z - pos.z);
    if (dp < 7 && (P.state === 'idle' || P.state === 'ready') && dp < bd) best = { kind: 'portal', obj: P };
    return best;
  }

  update(dt) {
    this.t += dt;
    const PG = this.portal;
    if (PG?.glyphs) {
      for (const g of PG.glyphs) g.visible = PG.state !== 'none' && PG.group.visible !== false;
      if (PG.glyphState !== PG.state) {
        PG.glyphState = PG.state;
        const col = PG.state === 'charging' ? 'A' : PG.state === 'ready' ? 'D' : 'B';
        for (const g of PG.glyphs) recolorGlyph(g, col, 24);
      }
    }
    for (const c of this.interactables) {
      if (c.kind === 'chest') {
        if (c.used && (c.openT || 0) < 3) {
          c.openT = (c.openT || 0) + dt;
          c.lidV = (c.lidV || 0) + (-120 * ((c.lidA || 0) + 1.9) - 7 * (c.lidV || 0)) * dt;
          c.lidA = (c.lidA || 0) + c.lidV * dt;
          c.lid.rotation.x = c.lidA;
          c.glow.visible = false;
        } else if (!c.used) c.glow.scale.y = 1 + Math.sin(this.t * 3 + c.pos.x) * 0.5;
      } else if (c.emblem) {
        c.emblem.rotation.y += dt * (c.used ? 0.2 : 1.2);
        if (c.glyph) c.glyph.visible = !c.used;
        if (c.kind !== 'moai') c.emblem.position.y = 2.4 + Math.sin(this.t * 2 + c.pos.x) * 0.15;
        c.emblem.visible = !c.used || c.kind === 'moai';
        if (c.kind === 'moai') c.emblem.visible = !c.used && Math.sin(this.t * 4) > -0.6;
      }
    }
    for (const p of this.jumpPads) p.ring.scale.setScalar(1.6 + Math.sin(this.t * 6) * 0.15);
    this.cullChunks();
    // hide cave roofs while the player is inside
    const pl = G.player;
    for (const c of this.caves) {
      const inside = pl && this.inCave(pl.pos.x, pl.pos.z) === c;
      const target = inside ? 0.12 : 1;
      c.roofMat.opacity += (target - c.roofMat.opacity) * Math.min(1, dt * 6);
      c.roofMat.depthWrite = c.roofMat.opacity > 0.9;
    }
    const P = this.portal;
    if (P) {
      P.core.rotation.z += dt * 0.5;
      P.core.material.opacity = 0.45 + Math.sin(this.t * 3) * 0.15;
      for (let i = 0; i < P.runes.length; i++) {
        const r = P.runes[i];
        r.position.y = 0.9 + Math.sin(this.t * 2 + i) * 0.25;
        r.rotation.y += dt;
        const lit = P.state === 'ready' || (P.state === 'charging' && P.charge >= (i + 1) / P.runes.length);
        setGlowColor(r.material, lit ? 0x55ddff : 0xff3355);
      }
      P.core.material.color.set(P.state === 'ready' ? 0x55ddff : P.state === 'charging' ? 0xffaa33 : 0xff3355);
      P.zone.visible = P.state === 'charging';
      if (P.zone.visible) P.zone.rotation.y += dt * 0.2;
    }
    if (this.liquid) {
      this.liquid.position.y = this.liquidLevel + Math.sin(this.t * 0.8) * 0.05;
      if (this.liquidWaves) {
        this.waveT = (this.waveT || 0) - dt;
        if (this.waveT <= 0) {
          this.waveT = 1 / 20;
          const a = this.liquid.geometry.attributes.position;
          const arr = a.array;
          const tt = this.t;
          for (let i = 0; i < a.count; i++) {
            const x = arr[i * 3], z = arr[i * 3 + 2];
            arr[i * 3 + 1] = Math.sin(x * 0.18 + tt * 1.3) * 0.12 + Math.cos(z * 0.23 + tt * 0.9) * 0.1;
          }
          a.needsUpdate = true;
          this.liquid.geometry.computeVertexNormals();
        }
      }
    }
  }

  dispose() {
    G.scene.remove(this.group);
    this.group.traverse((o) => {
      if (o.isInstancedMesh) o.dispose();
    });
    for (const d of this.disposables) d.dispose();
  }
}
