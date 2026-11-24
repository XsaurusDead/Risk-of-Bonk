// Coins, XP gems, health orbs and item drops (+ rarity rolling).
import * as THREE from 'three';
import { G } from '../core/state.js';
import { ITEMS, ITEM_LIST } from '../data/items.js';
import { isItemUnlocked, track } from '../core/save.js';
import { buildPickupGeo, litMaterial, glowMaterial } from './models.js';
import { particles } from './fx.js';
import { sfx } from '../core/audio.js';
import { weightedPick, RARITY, RARITY_ORDER } from '../core/util.js';

const MAX = { coin: 350, xp: 450, heal: 40 };
const list = { coin: [], xp: [], heal: [] };
const meshes = {};
let items = [];
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3(1, 1, 1);
const UP = new THREE.Vector3(0, 1, 0);
let geos;
let onItemCollected = null;

export function initPickups(scene, itemCallback) {
  geos = buildPickupGeo();
  onItemCollected = itemCallback;
  const mats = {
    coin: litMaterial({ color: 0xffcc22, emissive: 0x553300, roughness: 0.25, metalness: 0.85 }),
    xp: glowMaterial({ color: 0x55ffcc }),
    heal: glowMaterial({ color: 0xff4466 }),
  };
  for (const k of ['coin', 'xp', 'heal']) {
    const m = new THREE.InstancedMesh(geos[k], mats[k], MAX[k]);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.count = 0;
    m.frustumCulled = false;
    scene.add(m);
    meshes[k] = m;
  }
}

export function clearPickups() {
  for (const k in list) list[k].length = 0;
  for (const it of items) G.scene.remove(it.group);
  items = [];
}

function spawn(kind, pos, value) {
  const arr = list[kind];
  if (arr.length >= MAX[kind]) {
    // merge into a random existing one instead of dropping value
    arr[Math.floor(Math.random() * arr.length)].value += value;
    return;
  }
  const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 4;
  arr.push({
    x: pos.x, y: pos.y + 1, z: pos.z, vx: Math.cos(a) * sp, vy: 6 + Math.random() * 4, vz: Math.sin(a) * sp,
    value, grounded: false, magnet: false, t: Math.random() * 6, age: 0,
  });
}

export function dropCoins(pos, amount) {
  const n = Math.min(5, Math.max(1, Math.round(amount / 4)));
  for (let i = 0; i < n; i++) spawn('coin', pos, amount / n);
}
export function dropXp(pos, amount) {
  const n = Math.min(3, Math.max(1, Math.round(amount / 6)));
  for (let i = 0; i < n; i++) spawn('xp', pos, amount / n);
}
export function dropHeal(pos) {
  spawn('heal', pos, 1);
}

// ---------------- rarity & items ----------------
export const CHEST_ODDS = {
  small: { common: 70, rare: 23, epic: 6, legendary: 1 },
  large: { common: 15, rare: 55, epic: 24, legendary: 6 },
  boss: { common: 0, rare: 55, epic: 33, legendary: 12 },
  epic: { common: 0, rare: 0, epic: 100, legendary: 0 },
  legendary: { common: 0, rare: 0, epic: 0, legendary: 100 },
};

export function rollRarity(kind = 'small') {
  const base = CHEST_ODDS[kind];
  const luck = G.player?.stats.luck || 0;
  const w = {};
  for (const r of RARITY_ORDER) {
    const o = RARITY[r].order;
    w[r] = base[r] * (o === 0 ? 1 : Math.pow(1 + 0.35 * luck, o));
  }
  return weightedPick(w);
}

export function rollItem(rarity) {
  let idx = RARITY_ORDER.indexOf(rarity);
  while (idx >= 0) {
    const pool = ITEM_LIST.filter((it) => it.rarity === RARITY_ORDER[idx] && isItemUnlocked(it.id));
    if (pool.length) return pool[Math.floor(Math.random() * pool.length)].id;
    idx--; // fall back to a lower rarity if a pool is empty (never bricks)
  }
  return 'sharp_pebble';
}

const beamGeo = new THREE.CylinderGeometry(0.25, 0.25, 14, 8, 1, true);
export function dropItem(pos, itemId) {
  const it = ITEMS[itemId];
  const col = RARITY[it.rarity].hex;
  const group = new THREE.Group();
  const orb = new THREE.Mesh(geos.item, glowMaterial({ color: col }));
  const shell = new THREE.Mesh(geos.item, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.5 }));
  shell.scale.setScalar(1.35);
  const beamM = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
  beamM.position.y = 7;
  group.add(orb, shell, beamM);
  group.position.copy(pos);
  G.scene.add(group);
  const a = Math.random() * Math.PI * 2;
  items.push({ id: itemId, group, orb, shell, pos: group.position, vel: new THREE.Vector3(Math.cos(a) * 3, 9, Math.sin(a) * 3), age: 0, grounded: false });
}

export function updatePickups(dt) {
  const p = G.player;
  const w = G.world;
  if (!p || !w) return;
  const range = p.stats.pickup;
  const px = p.pos.x, py = p.pos.y + 1, pz = p.pos.z;
  let coinSfx = false, xpSfx = false;
  for (const kind of ['coin', 'xp', 'heal']) {
    const arr = list[kind];
    const mesh = meshes[kind];
    let n = 0;
    for (let i = arr.length - 1; i >= 0; i--) {
      const c = arr[i];
      c.t += dt;
      c.age += dt;
      const dx = px - c.x, dy = py - c.y, dz = pz - c.z;
      const d2 = dx * dx + dy * dy + dz * dz;
      const r = kind === 'heal' ? Math.min(range, 6) : range;
      if (!c.magnet && c.age > 0.35 && d2 < r * r && !p.dead) c.magnet = true;
      if (c.magnet) {
        const d = Math.sqrt(d2) || 1;
        const sp = 18 + c.age * 6;
        c.x += (dx / d) * sp * dt;
        c.y += (dy / d) * sp * dt;
        c.z += (dz / d) * sp * dt;
        if (d < 1.1) {
          collect(kind, c.value);
          if (kind === 'coin') coinSfx = true;
          if (kind === 'xp') xpSfx = true;
          arr[i] = arr[arr.length - 1];
          arr.pop();
          continue;
        }
      } else if (!c.grounded) {
        c.vy -= 25 * dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.z += c.vz * dt;
        const h = w.groundAt(c.x, c.z, c.y) + 0.35;
        if (c.y <= h) {
          c.y = h;
          // bounce a couple of times before settling
          if (c.vy < -3) {
            c.vy = -c.vy * 0.45;
            c.vx *= 0.6;
            c.vz *= 0.6;
            if (kind === 'coin' && Math.random() < 0.3) sfx('coin', 0.08);
          } else c.grounded = true;
        }
      }
    }
    for (const c of arr) {
      if (n >= MAX[kind]) break;
      _q.setFromAxisAngle(UP, c.t * 3);
      const bob = c.grounded && !c.magnet ? Math.sin(c.t * 3) * 0.12 : 0;
      _m.compose(_v.set(c.x, c.y + bob, c.z), _q, _s);
      mesh.setMatrixAt(n++, _m);
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
  }
  if (coinSfx) sfx('coin', 0.06);
  if (xpSfx) sfx('xp', 0.05);

  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    it.age += dt;
    if (!it.grounded) {
      it.vel.y -= 20 * dt;
      it.pos.addScaledVector(it.vel, dt);
      const h = w.groundAt(it.pos.x, it.pos.z, it.pos.y) + 1;
      if (it.pos.y <= h) {
        it.pos.y = h;
        if (it.vel.y < -3) {
          it.vel.y = -it.vel.y * 0.4;
          it.vel.x *= 0.5;
          it.vel.z *= 0.5;
        } else it.grounded = true;
      }
    }
    it.orb.rotation.y += dt * 2;
    it.shell.rotation.y -= dt * 1.5;
    it.orb.position.y = it.grounded ? Math.sin(it.age * 3) * 0.2 : 0;
    it.shell.position.y = it.orb.position.y;
    if (it.age > 0.6 && !p.dead && Math.hypot(it.pos.x - p.pos.x, it.pos.z - p.pos.z) < 2 && Math.abs(it.pos.y - p.pos.y - 1) < 3) {
      G.scene.remove(it.group);
      it.group.traverse((m) => m.material && m.material.dispose());
      items.splice(i, 1);
      particles(it.pos, RARITY[ITEMS[it.id].rarity].hex, 20, 6, 0.6);
      if (onItemCollected) onItemCollected(it.id);
    }
  }
}

function collect(kind, value) {
  const p = G.player;
  if (kind === 'coin') {
    const v = value * p.stats.coinMult;
    G.run.coins += v;
    G.run.coinsRunAcc = (G.run.coinsRunAcc || 0) + v;
    if (G.run.coinsRunAcc >= 10) {
      track('coinsRun', Math.floor(G.run.coinsRunAcc));
      G.run.coinsRunAcc -= Math.floor(G.run.coinsRunAcc);
    }
  }
  else if (kind === 'xp') p.addXp(value * p.stats.xpMult);
  else if (kind === 'heal') {
    p.heal(p.stats.maxHp * 0.15 + 10);
    particles(p.pos, 0xff4466, 8, 3, 0.5);
  }
}

/** Vacuum all remaining coins/xp to the player (used on stage exit). */
export function collectAll() {
  for (const kind of ['coin', 'xp']) {
    for (const c of list[kind]) collect(kind, c.value);
    list[kind].length = 0;
  }
}
