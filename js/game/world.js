// Procedural stage: heightmap terrain, liquid, instanced decorations,
// obstacle colliders, chests and the boss portal.
import * as THREE from 'three';
import { G } from '../core/state.js';
import { makeNoise2D, fbm, smoothstep, mulberry32, SpatialHash, lerp, clamp } from '../core/util.js';
import { buildMerged, decorParts, MAT, buildChest, buildPortal, litMaterial, swayMaterial, setGlowColor } from './models.js';

const SIZE = 260;
// wind sway strength per vegetation type (0 = static)
const SWAY = { grass: 0.32, dry_grass: 0.32, flower: 0.25, tree: 0.0035, pine: 0.003, dead_tree: 0.004, giant_mushroom: 0.002, glow_shroom: 0.08, cactus: 0.0008 };
const SEGS = 130;

export class World {
  constructor(stage, seed, loop = 0) {
    this.stage = stage;
    this.seed = seed;
    this.loop = loop;
    this.half = SIZE / 2 - 6;
    this.group = new THREE.Group();
    this.colliders = [];
    this.colHash = new SpatialHash(8);
    this.chests = [];
    this.disposables = [];
    this.rng = mulberry32(seed);
    this.liquidLevel = stage.liquid ? stage.liquid.level : -999;
    this.t = 0;
    this.buildHeights();
    this.buildTerrain();
    this.buildLiquid();
    this.placePortal();
    this.flatten(0, 0, 10);
    this.flatten(this.portalPos.x, this.portalPos.z, 11);
    this.rebuildTerrainGeometry();
    this.placeChests();
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
    // gentle large-scale hills
    h += n(x * 0.004 + 7, z * 0.004 - 3) * s.amp * 0.8;
    // edge mountains form the arena wall
    const d = Math.max(Math.abs(x), Math.abs(z));
    h += smoothstep(SIZE / 2 - s.edge - 10, SIZE / 2, d) * 38;
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

  /** Smoothly flatten a circular area (spawn / portal) above the liquid. */
  flatten(cx, cz, r) {
    const target = Math.max(this.heightAt(cx, cz), this.liquidLevel + 1.2);
    const N = this.N;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const x = -SIZE / 2 + i * this.cell, z = -SIZE / 2 + j * this.cell;
        const d = Math.hypot(x - cx, z - cz);
        if (d < r * 2) {
          const k = 1 - smoothstep(r, r * 2, d);
          const idx = j * N + i;
          this.grid[idx] = lerp(this.grid[idx], target, k);
        }
      }
    }
  }

  heightAt(x, z) {
    const N = this.N;
    const fx = clamp((x + SIZE / 2) / this.cell, 0, SEGS - 0.0001);
    const fz = clamp((z + SIZE / 2) / this.cell, 0, SEGS - 0.0001);
    const i = Math.floor(fx), j = Math.floor(fz);
    const u = fx - i, v = fz - j;
    const g = this.grid;
    const h00 = g[j * N + i], h10 = g[j * N + i + 1], h01 = g[(j + 1) * N + i], h11 = g[(j + 1) * N + i + 1];
    // match the triangle split used by the mesh
    if (u + v < 1) return h00 + (h10 - h00) * u + (h01 - h00) * v;
    return h11 + (h01 - h11) * (1 - u) + (h10 - h11) * (1 - v);
  }

  /** Ground height including liquid surface (for things that float). */
  surfaceAt(x, z) {
    return Math.max(this.heightAt(x, z), this.liquidLevel);
  }

  slopeAt(x, z) {
    const e = 1.5;
    return Math.hypot(this.heightAt(x + e, z) - this.heightAt(x - e, z), this.heightAt(x, z + e) - this.heightAt(x, z - e)) / (2 * e);
  }

  // ---------------------------------------------------------------- terrain mesh
  buildTerrain() {
    // Smooth-shaded indexed mesh; the triangle split matches heightAt().
    const N = this.N;
    this.terrainGeo = new THREE.BufferGeometry();
    this.terrainGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * N * 3), 3));
    this.terrainGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * N * 3), 3));
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
    this.terrainMat = litMaterial({ vertexColors: true, roughness: 0.96 });
    this.terrain = new THREE.Mesh(this.terrainGeo, this.terrainMat);
    this.terrain.receiveShadow = true;
    this.group.add(this.terrain);
    this.disposables.push(this.terrainGeo, this.terrainMat);
  }

  rebuildTerrainGeometry() {
    const N = this.N, g = this.grid, c = this.cell, H = SIZE / 2;
    const pos = this.terrainGeo.attributes.position.array;
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const k = (j * N + i) * 3;
        pos[k] = -H + i * c;
        pos[k + 1] = g[j * N + i];
        pos[k + 2] = -H + j * c;
      }
    }
    this.terrainGeo.attributes.position.needsUpdate = true;
    this.terrainGeo.computeVertexNormals();
    this.terrainGeo.computeBoundingSphere();

    // colours: height bands + slope rock + large/small noise patches for variety
    const col = this.terrainGeo.attributes.color.array;
    const nor = this.terrainGeo.attributes.normal.array;
    const gc = this.stage.ground;
    const cLow = new THREE.Color(gc.low), cMid = new THREE.Color(gc.mid), cHigh = new THREE.Color(gc.high);
    const cSlope = new THREE.Color(gc.slope), cPeak = new THREE.Color(gc.peak);
    const tmp = new THREE.Color();
    const amp = this.stage.terrain.amp;
    const n = this.noise;
    for (let v = 0; v < N * N; v++) {
      const x = pos[v * 3], h = pos[v * 3 + 1], z = pos[v * 3 + 2];
      const ny = nor[v * 3 + 1];
      const patch = n(x * 0.035 + 31, z * 0.035 - 17) * 0.5 + 0.5;
      const t = clamp((h + amp) / (amp * 2.2) + (patch - 0.5) * 0.35, 0, 1);
      if (t < 0.5) tmp.copy(cLow).lerp(cMid, t * 2);
      else tmp.copy(cMid).lerp(cHigh, (t - 0.5) * 2);
      tmp.lerp(cSlope, smoothstep(0.86, 0.66, ny));
      if (h > 18) tmp.lerp(cPeak, smoothstep(18, 30, h));
      // darker damp ground near liquid
      if (this.liquidLevel > -900) tmp.multiplyScalar(lerp(0.72, 1, smoothstep(this.liquidLevel, this.liquidLevel + 2.5, h)));
      const fine = 0.9 + (n(x * 0.45, z * 0.45) * 0.5 + 0.5) * 0.18;
      col[v * 3] = tmp.r * fine;
      col[v * 3 + 1] = tmp.g * fine;
      col[v * 3 + 2] = tmp.b * fine;
    }
    this.terrainGeo.attributes.color.needsUpdate = true;
  }

  buildLiquid() {
    const L = this.stage.liquid;
    if (!L) return;
    const segs = MAT.high ? 72 : 1;
    const geo = new THREE.PlaneGeometry(SIZE + 80, SIZE + 80, segs, segs).rotateX(-Math.PI / 2);
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

  // ---------------------------------------------------------------- placement
  randomSpot(minDistCenter = 0, margin = 14, tries = 60, maxSlope = 0.55) {
    for (let k = 0; k < tries; k++) {
      const x = (this.rng() * 2 - 1) * (this.half - margin - 20);
      const z = (this.rng() * 2 - 1) * (this.half - margin - 20);
      if (Math.hypot(x, z) < minDistCenter) continue;
      const h = this.heightAt(x, z);
      if (h < this.liquidLevel + 0.4) continue;
      if (this.slopeAt(x, z) > maxSlope) continue;
      if (h > 22) continue;
      return new THREE.Vector3(x, h, z);
    }
    return null;
  }

  placePortal() {
    let best = null;
    for (let k = 0; k < 200 && !best; k++) best = this.randomSpot(75 - Math.floor(k / 40) * 10, 20, 1, 0.35);
    this.portalPos = best || new THREE.Vector3(60, 0, 60);
  }

  placeChests() {
    const counts = { small: 20 + this.loop * 3, large: 4 + this.loop };
    for (const kind of ['large', 'small']) {
      for (let i = 0; i < counts[kind]; i++) {
        let spot = null;
        for (let k = 0; k < 30 && !spot; k++) {
          const s = this.randomSpot(14, 10, 1, 0.45);
          if (!s) continue;
          if (s.distanceTo(this.portalPos) < 14) continue;
          if (this.chests.some((c) => c.pos.distanceTo(s) < 12)) continue;
          spot = s;
        }
        if (!spot) continue;
        const large = kind === 'large';
        const { group, lid, glow } = buildChest(large);
        group.position.copy(spot);
        group.rotation.y = this.rng() * Math.PI * 2;
        this.group.add(group);
        const chest = { pos: spot, large, opened: false, group, lid, glow, openT: 0, baseCost: large ? 50 : 25 };
        this.chests.push(chest);
        this.addCollider(spot.x, spot.z, large ? 1.3 : 0.9);
      }
    }
  }

  addCollider(x, z, r) {
    const c = { x, z, r };
    this.colliders.push(c);
    this.colHash.insert(c, x, z);
  }

  buildDecor() {
    const density = G.quality === 'low' ? 0.6 : 1;
    const dummy = new THREE.Object3D();
    const col = new THREE.Color();
    const avoid = [{ x: 0, z: 0, r: 10 }, { x: this.portalPos.x, z: this.portalPos.z, r: 12 }];
    for (const c of this.chests) avoid.push({ x: c.pos.x, z: c.pos.z, r: 3 });
    for (const d of this.stage.decor) {
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
      for (let k = 0; k < count * 3 && n < count; k++) {
        const x = (this.rng() * 2 - 1) * (this.half - 4);
        const z = (this.rng() * 2 - 1) * (this.half - 4);
        const h = this.heightAt(x, z);
        const floating = d.type === 'floating_rock';
        if (!floating && h < this.liquidLevel + 0.2) continue;
        if (!floating && this.slopeAt(x, z) > 0.9) continue;
        if (avoid.some((a) => Math.hypot(a.x - x, a.z - z) < a.r)) continue;
        const s = lerp(d.scale[0], d.scale[1], this.rng());
        dummy.position.set(x, h - 0.1 + (floating ? this.rng() * 10 : 0), z);
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

  buildPortalMesh() {
    const p = buildPortal();
    p.group.position.copy(this.portalPos);
    this.group.add(p.group);
    this.portal = { pos: this.portalPos, state: 'idle', charge: 0, ...p };
    this.addCollider(this.portalPos.x + 2.9, this.portalPos.z, 0.6);
    this.addCollider(this.portalPos.x - 2.9, this.portalPos.z, 0.6);
    // charge zone ring
    const geo = new THREE.RingGeometry(0.97, 1, 64).rotateX(-Math.PI / 2);
    const mat = new THREE.MeshBasicMaterial({ color: 0xff3355, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide });
    const zone = new THREE.Mesh(geo, mat);
    zone.position.copy(this.portalPos).setY(this.portalPos.y + 0.5);
    zone.scale.setScalar(this.chargeRadius);
    zone.visible = false;
    this.group.add(zone);
    this.portal.zone = zone;
    this.disposables.push(geo, mat);
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
    for (const c of this.chests) {
      if (c.opened) continue;
      const d = Math.hypot(c.pos.x - pos.x, c.pos.z - pos.z);
      if (d < 3.4 && d < bd && Math.abs(c.pos.y - pos.y) < 3) {
        bd = d;
        best = { kind: 'chest', obj: c };
      }
    }
    const P = this.portal;
    const dp = Math.hypot(P.pos.x - pos.x, P.pos.z - pos.z);
    if (dp < 7 && (P.state === 'idle' || P.state === 'ready') && dp < bd) best = { kind: 'portal', obj: P };
    return best;
  }

  update(dt) {
    this.t += dt;
    for (const c of this.chests) {
      if (c.opened && c.openT < 3) {
        // springy lid: flips open, overshoots, wobbles to rest
        c.openT += dt;
        c.lidV = (c.lidV || 0) + (-120 * ((c.lidA || 0) + 1.9) - 7 * (c.lidV || 0)) * dt;
        c.lidA = (c.lidA || 0) + c.lidV * dt;
        c.lid.rotation.x = c.lidA;
        c.glow.visible = false;
      } else if (!c.opened) {
        c.glow.scale.y = 1 + Math.sin(this.t * 3 + c.pos.x) * 0.5;
      }
    }
    const P = this.portal;
    if (P) {
      P.core.rotation.z += dt * 0.5;
      const pulse = 0.45 + Math.sin(this.t * 3) * 0.15;
      P.core.material.opacity = pulse;
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
      // gentle rolling waves (high quality only)
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
