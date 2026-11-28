// Procedural stage: heightmap terrain with terraces/cliffs, liquid, instanced
// decorations, ruins, caves, floating islands with jump pads, colliders,
// chests, shrines, Moai statues and the boss portal.
import * as THREE from 'three';
import { G } from '../core/state.js';
import { makeNoise2D, fbm, smoothstep, mulberry32, SpatialHash, lerp, clamp } from '../core/util.js';
import {
  buildMerged, decorParts, MAT, buildChest, buildPortal, litMaterial, swayMaterial, setGlowColor,
  buildShrine, buildMoai, buildMagnetStatue, buildPillar, stoneify, prim, buildJumpPad, structureParts,
} from './models.js';
import { terrainDetailTexture } from './textures.js';
import { assetsReady, getModel, desertRockTexture } from './assets.js';
import { attachGlyph, recolorGlyph } from './glyphs.js';
import { createLootFx, updateLootFx } from './lootfx.js';
import { addTriplanar, rockTexFor } from './stone.js';

// animated rune pillars (spell pack) floating above shrines: colour + design per kind
const SHRINE_GLYPH = { heal: ['D', 17], combat: ['H', 24], boss: ['K', 29], moai: ['E', 10], magnet: ['H', 20] };

export const SIZE = 520;
const SEGS = 220;
const AREA_MULT = 3.2; // decor density scale vs. the old 260m maps
// collision heights (at scale 1) of the procedural decoration, and which tops you can stand on
const PROC_HEIGHT = {
  tree: 5, pine: 5.3, rock: 1.3, ruin_pillar: 4.8, cactus: 3.6, bones: 1.2, sandstone: 3.4, obelisk: 7.6, ice_spike: 3.2,
  giant_mushroom: 4.2, crystal: 2.2, obsidian_spike: 4, lava_rock: 1.4, dead_tree: 4, void_crystal: 3.4,
};
const WALKABLE = new Set(['rock', 'ruin_pillar', 'sandstone', 'lava_rock', 'bones']);
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
const COUNTS = { chest: [15, 20], heal: [1, 2], combat: [1, 3], boss: [1, 3], pillar: [2, 4], moai: [3, 7], magnet: [0, 3] };
/** Charge pillars: radius of the zone you stand in, and seconds of standing to fill it. */
export const PILLAR_RADIUS = 9;
export const PILLAR_TIME = 18;
// chest tier odds
const CHEST_TIERS = { normal: 82, large: 13, epic: 4, legendary: 1 };

/** Add the GodotLootVFX ground glow (light version) and find the floating gem of a chest. */
function withChestGlow(built) {
  // the ring (radius 0.45) should circle the chest, a little wider than its body
  const fx = createLootFx(built.rarity || 'common', ((built.width || 1.5) * 0.8) / 0.45, { lite: true });
  fx.position.y = 0.03;
  built.group.add(fx);
  built.fx = fx;
  built.fxScale = fx.scale.x;
  built.group.traverse((o) => { if (o.userData.spin) { built.gem = o; built.gemY = o.position.y; } });
  return built;
}

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
    // tops of rocks, pillars and ruin walls you can stand on
    if (y !== Infinity && this.colHash) {
      for (const c of this.colHash.query(x, z, 3)) {
        if (!c.walk || c.y1 <= h || y < c.y1 - 0.8) continue;
        const dx = x - c.x, dz = z - c.z;
        if (dx * dx + dz * dz < c.r * c.r * 0.85) h = c.y1;
      }
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
    // cliffs and steep slopes get the nature pack's rock texture (triplanar, so no stretching)
    addTriplanar(this.terrainMat, { tex: rockTexFor(this.stage.id), scale: 0.11, strength: 0.95, slopeOnly: true });
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

  /**
   * Solid round obstacle from height y0 to y1. Above its top you can jump over it (or,
   * if `walk`, stand on it); below its bottom (e.g. under an arch) you pass freely.
   */
  addCollider(x, z, r, y0 = -Infinity, y1 = Infinity, walk = false) {
    const c = { x, z, r, y0, y1, walk };
    this.colliders.push(c);
    this.colHash.insert(c, x, z);
    return c;
  }

  // ---------------------------------------------------------------- structures
  rangeRoll([a, b]) {
    return a + Math.floor(this.rng() * (b - a + 1));
  }

  /** Decide where ruins and caves go and flatten the ground for them (before the mesh is built). */
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
    // (floating islands with jump pads were removed: they were hard to reach and blocked the view)
  }

  buildStructures() {
    const tint = this.stage.ruinTint;
    this.stoneMat = this.stage.id === 'dunes' ? MAT.stoneDesert : MAT.stone;
    const geoCache = {};
    const addMerged = (kind, x, y, z, rot, scale = 1, tintOverride) => {
      const key = kind + (tintOverride || tint || '');
      if (!geoCache[key]) {
        const parts = structureParts(kind, tintOverride || tint, this.rng);
        geoCache[key] = buildMerged(parts);
        geoCache[key].parts = parts;
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
        this.buildRuin(s, tint);      } else if (s.type === 'cave') {
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

  /**
   * One ruin, picked from six layouts with random broken heights, so no two look alike.
   * Every solid stone becomes a walkable collider (you can climb broken walls and steps).
   */
  buildRuin(s, tint) {
    const rng = this.rng;
    const stone = new THREE.Color(tint || 0xbdb4a2);
    const parts = [], cols = [];
    const shadeHex = (k) => {
      const c = stone.clone().multiplyScalar(k * (0.92 + rng() * 0.16));
      return c.getHex();
    };
    const col = () => shadeHex(0.85 + rng() * 0.3);
    // a box block: [x, z] centre, w (x) / d (z) footprint, h height, y bottom, yaw
    const block = (x, z, w, d, h, y = 0, yaw = 0, solid = true) => {
      parts.push(['box', col(), [x, y + h / 2, z], [w, h, d], [0, yaw, 0]]);
      if (!solid || h < 0.5) return;
      // colliders: circles along the long side
      const long = Math.max(w, d), short = Math.min(w, d);
      const along = w >= d ? 0 : Math.PI / 2;
      const n = Math.max(1, Math.round(long / 1.1));
      const r = Math.max(0.55, short / 2 + 0.15);
      for (let i = 0; i < n; i++) {
        const t = (i + 0.5) / n - 0.5;
        const a = yaw + along;
        cols.push([x + Math.cos(a) * t * long, z - Math.sin(a) * t * long, r, y + h]);
      }
    };
    const column = (x, z, h, rad = 0.55, y = 0) => {
      parts.push(['cyl', col(), [x, y + h / 2, z], [rad * 2, h, rad * 2]]);
      if (h > 3.5) parts.push(['box', col(), [x, y + h + 0.2, z], [rad * 2.6, 0.4, rad * 2.6]]); // capital
      cols.push([x, z, rad + 0.1, y + h + (h > 3.5 ? 0.4 : 0)]);
    };
    const fallen = (x, z, len, rad, yaw) => {
      parts.push(['cyl', col(), [x, rad, z], [rad * 2, len, rad * 2], [Math.PI / 2, yaw, 0]]);
      for (let i = -1; i <= 1; i++) cols.push([x + Math.sin(yaw) * i * len / 3, z + Math.cos(yaw) * i * len / 3, rad + 0.1, rad * 2]);
    };
    const rubble = (x, z, n = 4) => {
      for (let i = 0; i < n; i++) {
        const k = 0.4 + rng() * 0.7;
        parts.push(['dodeca', col(), [x + (rng() - 0.5) * 3, k * 0.5, z + (rng() - 0.5) * 3], [k, k * 0.8, k], [rng() * 3, rng() * 3, 0]]);
      }
    };
    const tiles = (w, d, size = 2.9) => {
      for (let x = -w / 2 + size / 2; x < w / 2; x += size) {
        for (let z = -d / 2 + size / 2; z < d / 2; z += size) {
          if (rng() < 0.15) continue;
          parts.push(['box', col(), [x, 0.12 + rng() * 0.08, z], [size - 0.1, 0.25, size - 0.1], [0, (rng() - 0.5) * 0.08, 0]]);
        }
      }
    };
    let loot = [0, 0, 0];
    const type = Math.floor(rng() * 6);
    s.layout = ['gate', 'colonnade', 'hall', 'tower', 'altar', 'court'][type];
    switch (s.layout) {
      case 'gate': { // arch gate with two broken walls in an L
        tiles(9, 9);
        for (let i = 0; i < 5; i++) if (rng() > 0.2) block(i * 2.2 - 4.4, -6.5, 2.2, 1.1, 1.5 + rng() * 3.5);
        for (let i = 0; i < 4; i++) if (rng() > 0.2) block(-6.5, i * 2.2 - 3.3, 1.1, 2.2, 1.2 + rng() * 3);
        block(4.4, 4.4, 1.2, 1.2, 5.2, 0, Math.PI / 4);
        block(1.3, 7.1, 1.2, 1.2, 5.2, 0, Math.PI / 4);
        parts.push(['box', col(), [2.85, 5.7, 5.75], [5.4, 1.0, 1.3], [0, Math.PI / 4, 0]]);
        fallen(-2, 2.5, 3.5, 0.5, rng() * 3);
        rubble(5, -3);
        break;
      }
      case 'colonnade': { // ring of columns around a round floor, some fallen
        parts.push(['cyl', col(), [0, 0.15, 0], [15, 0.3, 15]]);
        cols.push([0, 0, 0.1, 0.3]);
        const n = 8;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const x = Math.cos(a) * 6.2, z = Math.sin(a) * 6.2;
          const r = rng();
          if (r < 0.15) continue;
          if (r < 0.3) fallen(x * 0.8, z * 0.8, 4, 0.5, a + Math.PI / 2 + (rng() - 0.5));
          else column(x, z, r > 0.7 ? 5.2 : 1 + rng() * 3.2, 0.55, 0.3);
        }
        block(0, 0, 2.2, 1.4, 1.1, 0.3); // altar
        loot = [0, 0.3, 2.2];
        break;
      }
      case 'hall': { // rectangular hall: broken walls with gaps and windows
        tiles(12, 8);
        const wall = (x0, z0, x1, z1) => {
          const len = Math.hypot(x1 - x0, z1 - z0), n = Math.round(len / 2.2);
          const yaw = -Math.atan2(z1 - z0, x1 - x0);
          for (let i = 0; i < n; i++) {
            if (rng() < 0.22) continue; // gaps / doors
            const t = (i + 0.5) / n;
            const h = 1 + rng() * 4;
            const x = x0 + (x1 - x0) * t, z = z0 + (z1 - z0) * t;
            block(x, z, 2.15, 0.9, h, 0, yaw);
            if (h > 3.6 && rng() < 0.5) parts.push(['box', col(), [x, h + 0.15, z], [2.3, 0.3, 1.1], [0, yaw, 0]]); // lintel
          }
        };
        wall(-7, -4.5, 7, -4.5);
        wall(-7, 4.5, 7, 4.5);
        wall(-7, -4.5, -7, 4.5);
        rubble(4, 0, 6);
        loot = [-3, 0, 0];
        break;
      }
      case 'tower': { // collapsed round tower: the wall gets lower on one side, door gap
        parts.push(['cyl', col(), [0, 0.15, 0], [9.5, 0.3, 9.5]]);
        const n = 14, fall = rng() * Math.PI * 2;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          if (Math.abs(Math.sin((a - fall) / 2)) < 0.12) continue; // the doorway
          const h = 0.8 + (1 + Math.cos(a - fall)) * 3.2 + rng() * 0.8;
          block(Math.cos(a) * 4.6, Math.sin(a) * 4.6, 2.2, 0.9, h, 0, -a + Math.PI / 2);
        }
        rubble(Math.cos(fall + Math.PI) * 7, Math.sin(fall + Math.PI) * 7, 8);
        break;
      }
      case 'altar': { // stepped platform with an obelisk and corner posts (climb the steps)
        block(0, 0, 10, 10, 0.7);
        block(0, 0, 7, 7, 0.7, 0.7);
        block(0, 0, 4, 4, 0.7, 1.4);
        parts.push(['box', col(), [0, 4.6, -1], [1.1, 5, 1.1]], ['cone', col(), [0, 7.6, -1], [1.0, 1.0, 1.0], [0, Math.PI / 4, 0]]);
        cols.push([0, -1, 0.75, 7.1]);
        for (const [x, z] of [[-4.6, -4.6], [4.6, -4.6], [-4.6, 4.6], [4.6, 4.6]]) column(x, z, 1.5 + rng() * 2.5, 0.45, 0.7);
        loot = [0, 2.1, 1];
        break;
      }
      default: { // statue court: plinths with broken statues, a toppled head, low hedge walls
        tiles(9, 9);
        for (const [x, z] of [[-4, -3], [4, -3], [0, 4]]) {
          block(x, z, 1.8, 1.8, 1.2);
          const legs = rng() < 0.5;
          parts.push(['box', col(), [x - 0.35, 1.2 + 0.8, z], [0.45, 1.6, 0.5]], ['box', col(), [x + 0.35, 1.2 + (legs ? 0.8 : 0.4), z], [0.45, legs ? 1.6 : 0.8, 0.5]]);
          if (rng() < 0.5) parts.push(['box', col(), [x, 3.6, z], [1.4, 1.6, 0.8]]);
          cols.push([x, z, 1.1, rng() < 0.5 ? 3.6 : 2.8]);
        }
        parts.push(['sphere', col(), [2.5, 0.8, 1.5], [1.7, 1.6, 1.7]]);
        cols.push([2.5, 1.5, 0.9, 1.6]);
        for (let i = 0; i < 6; i++) if (rng() > 0.35) block(-6.6, i * 2.2 - 5.5, 0.8, 2.1, 0.9 + rng() * 0.7);
        loot = [-1, 0, -0.5];
      }
    }
    const merged = buildMerged(parts);
    if (merged.geo) {
      this.disposables.push(merged.geo);
      const mesh = new THREE.Mesh(merged.geo, this.stoneMat);
      mesh.position.set(s.x, s.y, s.z);
      mesh.rotation.y = s.rot;
      mesh.castShadow = MAT.high;
      mesh.receiveShadow = true;
      this.group.add(mesh);
    }
    // colliders, rotated with the ruin (mesh rotation convention: x' = x c + z s, z' = -x s + z c)
    const c = Math.cos(s.rot), sn = Math.sin(s.rot);
    for (const [lx, lz, r, top] of cols) this.addCollider(s.x + lx * c + lz * sn, s.z - lx * sn + lz * c, r, s.y - 1, s.y + top, true);
    s.loot = new THREE.Vector3(s.x + loot[0] * c + loot[2] * sn, s.y + loot[1], s.z - loot[0] * sn + loot[2] * c);
  }

  buildCave(s) {
    const dx = Math.cos(s.rot), dz = Math.sin(s.rot);
    const px = -dz, pz = dx; // perpendicular
    const rockCol = this.stage.ground.slope;
    const rockGeo = buildMerged(structureParts('boulder', rockCol)).geo;
    this.disposables.push(rockGeo);
    const half = s.len / 2;
    const rocks = new THREE.InstancedMesh(rockGeo, this.stoneMat || MAT.vc, 80);
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
        // the wall rocks are solid from the side and you can stand on their tops
        this.addCollider(x, z, 2.2, s.y - 2, s.y + 7, true);
      }
    }
    // smaller step rocks outside the walls: hop up step -> wall -> roof with a double jump
    for (let t = -half + 1.3; t <= half; t += 5.2) {
      for (const side of [-1, 1]) {
        const off = s.w / 2 + 5.2 + this.rng() * 0.6;
        const x = s.x + dx * t + px * side * off, z = s.z + dz * t + pz * side * off;
        const base = Math.max(s.y, this.heightAt(x, z));
        const k = 2.5 + this.rng() * 0.4;
        dummy.position.set(x, base + 1.0, z);
        dummy.rotation.set(this.rng() * 3, this.rng() * 3, 0);
        dummy.scale.set(k, k * 1.1, k);
        dummy.updateMatrix();
        rocks.setMatrixAt(n++, dummy.matrix);
        this.addCollider(x, z, 1.9, base - 1, base + 3.6, true);
      }
    }
    // the roof is walkable too: its arch is approximated by a centre row and two side rows of
    // colliders that start high above the tunnel floor, so walking through underneath stays free
    for (let t = -half - 1; t <= half + 1; t += 2.4) {
      const cx = s.x + dx * t, cz = s.z + dz * t;
      this.addCollider(cx, cz, 2.6, s.y + 6.5, s.y + 9.4, true);
      for (const side of [-1, 1]) this.addCollider(cx + px * side * 4.2, cz + pz * side * 4.2, 1.8, s.y + 6, s.y + 7.9, true);
    }
    rocks.count = n;
    rocks.castShadow = MAT.high;
    rocks.receiveShadow = true;
    this.group.add(rocks);
    // the roof: a craggy half-tube of textured rock with moss on top; it fades while you're inside
    const roofGeo = new THREE.CylinderGeometry(s.w / 2 + 2.4, s.w / 2 + 2.4, s.len + 4, 22, 10, true, 0, Math.PI);
    {
      const pos = roofGeo.attributes.position, colors = new Float32Array(pos.count * 3);
      const rock = new THREE.Color(rockCol), moss = new THREE.Color(this.stage.ground.mid);
      const tmp = new THREE.Color();
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
        // bumpy, uneven surface (not on the open ends so the tunnel mouth stays round)
        const endFade = Math.min(1, (s.len / 2 + 2 - Math.abs(y)) / 2);
        const bump = 1 + (this.noise(x * 0.4 + s.x, y * 0.35 + z * 0.4) * 0.16 + this.noise(y * 1.3, z * 1.3 + x) * 0.05) * endFade;
        pos.setXYZ(i, x * bump, y, z * bump);
        // moss where the surface faces up (the top of the arch: large x before the rotation)
        const up = Math.max(0, x / (s.w / 2 + 2.4));
        tmp.copy(rock).lerp(moss, Math.max(0, up - 0.55) * 1.8 * (0.7 + this.noise(y * 0.5, z * 0.5) * 0.3));
        colors.set([tmp.r, tmp.g, tmp.b], i * 3);
      }
      roofGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      roofGeo.computeVertexNormals();
    }
    roofGeo.rotateZ(Math.PI / 2);
    roofGeo.rotateY(-s.rot);
    const roofMat = addTriplanar(litMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide, transparent: true, opacity: 1 }), { tex: rockTexFor(this.stage.id), scale: 0.3, strength: 0.9 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(s.x, s.y + 4.2, s.z);
    roof.scale.y = 0.9;
    roof.castShadow = MAT.high;
    this.group.add(roof);
    this.disposables.push(roofGeo, roofMat);
    // stalactites hanging from the roof (hidden with it while you're inside)
    for (let i = 0; i < 7; i++) {
      const t = (this.rng() - 0.5) * (s.len - 4), side = (this.rng() - 0.5) * (s.w - 2);
      const st = new THREE.Mesh(prim('cone'), roofMat);
      const k = 0.4 + this.rng() * 0.5;
      st.scale.set(k, 1.2 + this.rng() * 1.4, k);
      st.rotation.x = Math.PI;
      st.position.set(s.x + dx * t + px * side, s.y + 7 - st.scale.y * 0.5, s.z + dz * t + pz * side);
      roof.add(st);
      st.position.sub(roof.position);
      st.position.y /= roof.scale.y;
    }
    // big textured rocks from the nature pack framing both mouths of the tunnel
    for (const name of ['Rock_Medium_1', 'Rock_Medium_2', 'Rock_Medium_3']) {
      const model = getModel(name);
      if (!model) continue;
      for (const end of [-1, 1]) {
        if (this.rng() < 0.35) continue;
        const side = this.rng() < 0.5 ? -1 : 1;
        const t = end * (half + 1.5), off = side * (s.w / 2 + 3.5);
        const g = new THREE.Group();
        for (const part of model.parts) {
          const desert = this.stage.id === 'dunes' && desertRockTexture();
          const m = new THREE.Mesh(part.geometry, desert ? desertVariant(part.material) : part.material);
          m.castShadow = MAT.high;
          g.add(m);
        }
        const k = 5.5 / Math.max(model.height, 0.1);
        g.scale.set(k, k * (0.8 + this.rng() * 0.4), k);
        g.rotation.y = this.rng() * Math.PI * 2;
        const x = s.x + dx * t + px * off, z = s.z + dz * t + pz * off;
        g.position.set(x, Math.max(s.y, this.heightAt(x, z)) - 0.4, z);
        this.group.add(g);
        this.addCollider(x, z, 2.4, g.position.y - 1, g.position.y + 4.5, true);
      }
    }
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
      if (kind === 'chest') built = withChestGlow(buildChest(extra.tier));
      else if (kind === 'moai') built = buildMoai();
      else if (kind === 'magnet') built = buildMagnetStatue();
      else if (kind === 'pillar') {
        built = buildPillar();
        built.zone.scale.setScalar(PILLAR_RADIUS);
      }
      else built = buildShrine(kind);
      if (kind !== 'chest') stoneify(built.group, rockTexFor(this.stage.id));
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
      built.group.updateMatrixWorld(true);
      // chests: just the box (not the floating gem, glow pillar or beam) is solid
      const topY = built.height ? pos.y + built.height : new THREE.Box3().setFromObject(built.group).max.y;
      this.addCollider(pos.x, pos.z, kind === 'chest' ? 1 : kind === 'moai' ? 1.2 : 1.5, pos.y - 1, Math.min(topY, pos.y + 6), kind === 'chest');
      return it;
    };
    const spot = (minSep = 14) => this.randomSpot(16, 24, 50, 0.45, this.occupied(), minSep);
    // rewards in special places first: inside caves
    for (const c of this.caves) c.chest = add('chest', new THREE.Vector3(c.x, c.y, c.z), { tier: this.rng() < 0.5 ? 'large' : 'normal' });
    for (const s of this.structures) if (s.type === 'ruins' && this.rng() < 0.6) add('chest', s.loot ? s.loot.clone() : new THREE.Vector3(s.x, s.y, s.z), { tier: this.rollChestTier(1.5) });
    const total = (k) => this.rangeRoll(COUNTS[k]) + (k === 'chest' ? Math.min(4, this.loop) : 0);
    const chestsWanted = total('chest') - this.interactables.filter((i) => i.kind === 'chest').length;
    for (let i = 0; i < chestsWanted; i++) {
      const p = spot();
      if (p) add('chest', p, { tier: this.rollChestTier(1) });
    }
    for (const kind of ['heal', 'magnet', 'pillar', 'combat', 'boss', 'moai']) {
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
    const built = withChestGlow(buildChest(tier));
    built.group.position.copy(p);
    built.group.rotation.y = Math.random() * Math.PI * 2;
    this.group.add(built.group);
    const it = { kind: 'chest', pos: p, used: false, ...built, tier, free };
    this.interactables.push(it);
    this.addCollider(p.x, p.z, 1, p.y - 1, p.y + (built.height || 1.3), true);
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
        if (d.collide > 0) {
          const ht = (PROC_HEIGHT[d.type] ?? 3) * s;
          const by = dummy.position.y;
          this.addCollider(x, z, d.collide * s, by - 1, by + ht, WALKABLE.has(d.type));
        }
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
      if (d.collide > 0) {
        const by = h - 0.15 * s;
        this.addCollider(x, z, d.collide * s, by - 1, by + variants[vi].height * s * 0.95, /Rock/.test(d.models[0]));
      }
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
    stoneify(p.group, rockTexFor(this.stage.id));
    p.group.position.copy(this.portalPos);
    this.group.add(p.group);
    this.portal = { pos: this.portalPos, state: 'idle', charge: 0, ...p };
    this.addCollider(this.portalPos.x + 2.9, this.portalPos.z, 0.6, this.portalPos.y - 1, this.portalPos.y + 5.5);
    this.addCollider(this.portalPos.x - 2.9, this.portalPos.z, 0.6, this.portalPos.y - 1, this.portalPos.y + 5.5);
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
  collide(pos, r, h = 1.8) {
    const near = this.colHash.query(pos.x, pos.z, r + 4);
    for (const c of near) {
      // above the top (jumping over / standing on it) or below the bottom: no push
      if (pos.y >= c.y1 - (c.walk ? 0.6 : 0.25) || pos.y + h <= c.y0) continue;
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
    updateLootFx(dt); // shared clock of every loot glow (chests and dropped items)
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
        } else if (!c.used) {
          // the seam light pulses (relative to its built size: the mesh's scale *is* its size)
          c.glowSY ??= c.glow.scale.y;
          c.glow.scale.y = c.glowSY * (1 + Math.sin(this.t * 3 + c.pos.x) * 0.5);
        }
        // the item-style ground glow: on while closed and near enough to see, fades out when opened
        if (c.fx) {
          const near = !G.player || Math.hypot(G.player.pos.x - c.pos.x, G.player.pos.z - c.pos.z) < 90;
          if (c.used) {
            c.fxFade = Math.max(0, (c.fxFade ?? 1) - dt * 1.5);
            c.fx.scale.setScalar(c.fxScale * (0.4 + 0.6 * c.fxFade));
            if (c.fxFade <= 0) {
              c.group.remove(c.fx);
              c.fx.userData.dispose();
              c.fx = null;
            }
          }
          if (c.fx) {
            c.fx.visible = near;
            if (near) c.fx.userData.tick(dt);
          }
        }
        if (c.gem) {
          c.gem.visible = !c.used;
          c.gem.rotation.y += dt * 1.5;
          c.gem.position.y = c.gemY + Math.sin(this.t * 2 + c.pos.x) * 0.15;
        }
      } else if (c.kind === 'pillar') {
        // the runes light up one by one as it charges; the zone fills from the middle
        c.crystal.rotation.y += dt * (c.used ? 0.3 : 1.4 + (c.charge || 0) * 4);
        c.crystal.position.y = c.crystalY + Math.sin(this.t * 2 + c.pos.x) * 0.2;
        c.crystal.material.color.set(c.used ? 0x55ff99 : c.state === 'charging' ? 0xffc040 : 0x7fd6ff);
        c.runes.forEach((r, i) => {
          const lit = c.used || (c.charge || 0) >= (i + 1) / c.runes.length;
          r.material.color.set(lit ? 0xffd060 : 0x335577);
        });
        c.zone.visible = c.state === 'charging';
        c.fill.visible = c.state === 'charging';
        if (c.state === 'charging') {
          c.fill.scale.setScalar(Math.max(0.01, c.charge) * PILLAR_RADIUS);
          c.zone.material.opacity = 0.45 + Math.sin(this.t * 5) * 0.2;
        }
        if (c.glyph) c.glyph.visible = !c.used;
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
      // only fade the roof when you're inside the tunnel, not when you're standing on top of it
      const inside = pl && pl.pos.y < c.y + 5.5 && this.inCave(pl.pos.x, pl.pos.z) === c;
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
