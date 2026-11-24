// Coins, XP gems, health orbs and item drops (+ rarity rolling).
import * as THREE from 'three';
import { G } from '../core/state.js';
import { ITEMS, ITEM_LIST } from '../data/items.js';
import { isItemUnlocked, track } from '../core/save.js';
import { buildPickupGeo, litMaterial, glowMaterial } from './models.js';
import { particles, floatText } from './fx.js';
import { sfx } from '../core/audio.js';
import { weightedPick, RARITY, RARITY_ORDER } from '../core/util.js';
import { createLootFx, updateLootFx } from './lootfx.js';
import { ITEM_ICONS, iconSrc } from '../data/icons.js';

// the item's pixel-art icon floats inside its loot glow
const iconTextures = new Map();
const texLoader = new THREE.TextureLoader();
function itemIconTexture(id) {
  if (!iconTextures.has(id)) {
    const t = texLoader.load(iconSrc(ITEM_ICONS[id] ?? 12));
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    iconTextures.set(id, t);
  }
  return iconTextures.get(id);
}

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
  for (const pw of powers) G.scene.remove(pw.group);
  powers = [];
}

// ---------------- power-ups (temporary buffs dropped by enemies) ----------------
// magnet: every coin and XP orb on the map flies to you; slowmo: enemies, their shots
// and their attacks move in slow motion (the clock, spawns and you stay at full speed)
export const POWERUPS = {
  magnet: { name: 'Magnet', icon: 117, color: 0xff5566, css: '#ff6677', dur: 15, desc: 'All gold & XP fly to you' },
  slowmo: { name: 'Time Warp', icon: 1089, color: 0x66ccff, css: '#7fd6ff', dur: 15, desc: 'Enemies in slow motion' },
};
export const SLOWMO_FACTOR = 0.35;
let powers = [];

/** Drop a power-up pickup (it floats and glows until you walk into it). */
export function dropPowerup(pos, type) {
  const P = POWERUPS[type];
  if (!P) return;
  const group = new THREE.Group();
  const icon = new THREE.Sprite(new THREE.SpriteMaterial({ map: powerIconTexture(type), transparent: true, depthWrite: false }));
  icon.scale.setScalar(1.3);
  icon.renderOrder = 8;
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture(), color: P.color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.setScalar(3);
  halo.renderOrder = 7;
  const ringM = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.06, 6, 32), new THREE.MeshBasicMaterial({ color: P.color, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  ringM.rotation.x = Math.PI / 2;
  group.add(halo, icon, ringM);
  group.position.copy(pos);
  G.scene.add(group);
  const a = Math.random() * Math.PI * 2;
  powers.push({ type, group, icon, halo, ring: ringM, pos: group.position, vel: new THREE.Vector3(Math.cos(a) * 2, 8, Math.sin(a) * 2), age: 0, grounded: false });
}

const powerTex = {};
function powerIconTexture(type) {
  if (!powerTex[type]) {
    const t = texLoader.load(iconSrc(POWERUPS[type].icon));
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    powerTex[type] = t;
  }
  return powerTex[type];
}

/** Start (or extend) a timed power-up. */
export function activatePower(type, dur) {
  const run = G.run;
  if (!run) return;
  run.powers ||= {};
  run.powers[type] = Math.max(run.powers[type] || 0, dur ?? POWERUPS[type].dur);
  const P = POWERUPS[type];
  sfx(type === 'slowmo' ? 'freeze' : 'item');
  if (G.player) {
    particles(G.player.pos, P.color, 30, 7, 0.8, 0.4);
    floatText(G.player.pos.clone().setY(G.player.pos.y + 2.6), P.name.toUpperCase() + '!', P.css, true);
  }
}

/** Enemy time scale (slow motion power-up). */
export function enemyTimeScale() {
  return G.run?.powers?.slowmo > 0 ? SLOWMO_FACTOR : 1;
}

function updatePowers(dt) {
  const run = G.run, p = G.player, w = G.world;
  if (run?.powers) for (const k in run.powers) run.powers[k] = Math.max(0, run.powers[k] - dt);
  for (let i = powers.length - 1; i >= 0; i--) {
    const pw = powers[i];
    pw.age += dt;
    if (!pw.grounded) {
      pw.vel.y -= 20 * dt;
      pw.pos.addScaledVector(pw.vel, dt);
      const h = w.groundAt(pw.pos.x, pw.pos.z, pw.pos.y) + 1;
      if (pw.pos.y <= h) {
        pw.pos.y = h;
        if (pw.vel.y < -3) pw.vel.set(pw.vel.x * 0.5, -pw.vel.y * 0.35, pw.vel.z * 0.5);
        else pw.grounded = true;
      }
    }
    const bob = pw.grounded ? Math.sin(pw.age * 3) * 0.2 : 0;
    pw.icon.position.y = bob;
    pw.halo.position.y = bob;
    pw.halo.material.opacity = 0.7 + Math.sin(pw.age * 5) * 0.25;
    pw.ring.rotation.z += dt * 2;
    pw.ring.position.y = -0.6 + Math.sin(pw.age * 2) * 0.1;
    // despawn after a minute (blink for the last 5 s)
    if (pw.age > 55) pw.group.visible = Math.sin(pw.age * 20) > 0;
    const range = Math.max(2.4, Math.min(p ? p.stats.pickup : 3, 6));
    if (p && !p.dead && pw.age > 0.5 && Math.hypot(pw.pos.x - p.pos.x, pw.pos.z - p.pos.z) < range && Math.abs(pw.pos.y - p.pos.y - 1) < 3) {
      activatePower(pw.type);
    } else if (pw.age < 60) continue;
    G.scene.remove(pw.group);
    pw.group.traverse((o) => o.material && o.material.dispose());
    powers.splice(i, 1);
  }
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
let haloTex = null;
function haloTexture() {
  if (haloTex) return haloTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,0.9)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.35)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  haloTex = new THREE.CanvasTexture(c);
  return haloTex;
}

export function dropItem(pos, itemId) {
  const it = ITEMS[itemId];
  const col = RARITY[it.rarity].hex;
  const group = new THREE.Group();
  // floating icon + a soft halo behind it
  const orb = new THREE.Sprite(new THREE.SpriteMaterial({ map: itemIconTexture(itemId), transparent: true, depthWrite: false }));
  orb.scale.setScalar(1.15);
  orb.renderOrder = 8;
  const shell = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTexture(), color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 }));
  shell.scale.setScalar(2.2);
  shell.renderOrder = 7;
  // ground glow ported from the GodotLootVFX pack (rings, pillars, flare, stars per rarity)
  const fx = createLootFx(it.rarity);
  fx.position.y = -1;
  fx.visible = false;
  group.add(fx, shell, orb);
  // a tall faint beam so good loot can be spotted from far away
  if (it.rarity !== 'common') {
    const beamM = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending }));
    beamM.position.y = 7;
    group.add(beamM);
  }
  group.position.copy(pos);
  G.scene.add(group);
  const a = Math.random() * Math.PI * 2;
  const rec = { id: itemId, group, orb, shell, fx, pos: group.position, vel: new THREE.Vector3(Math.cos(a) * 3, 9, Math.sin(a) * 3), age: 0, grounded: false };
  items.push(rec);
  return rec;
}

export function updatePickups(dt) {
  const p = G.player;
  const w = G.world;
  if (!p || !w) return;
  const range = p.stats.pickup;
  const px = p.pos.x, py = p.pos.y + 1, pz = p.pos.z;
  updatePowers(dt);
  const globalMagnet = G.run?.powers?.magnet > 0;
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
      if (!c.magnet && c.age > 0.35 && !p.dead && (d2 < r * r || (globalMagnet && kind !== 'heal'))) {
        c.magnet = true;
        c.age = Math.min(c.age, 1);
      }
      if (c.magnet) {
        const d = Math.sqrt(d2) || 1;
        const sp = 18 + c.age * 6 + (globalMagnet ? d * 1.2 : 0);
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

  if (items.length) updateLootFx(dt);
  for (let i = items.length - 1; i >= 0; i--) {
    const it = items[i];
    it.age += dt;
    if (it.fx) {
      it.fx.visible = it.grounded;
      if (it.grounded) it.fx.userData.tick(dt);
    }
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
    it.orb.position.y = it.grounded ? 0.1 + Math.sin(it.age * 3) * 0.18 : 0;
    it.shell.position.y = it.orb.position.y;
    it.shell.material.rotation += dt * 0.6;
    it.shell.material.opacity = 0.65 + Math.sin(it.age * 4) * 0.15;
    if (it.age > 0.6 && !p.dead && Math.hypot(it.pos.x - p.pos.x, it.pos.z - p.pos.z) < 2 && Math.abs(it.pos.y - p.pos.y - 1) < 3) {
      G.scene.remove(it.group);
      it.group.traverse((m) => m.material && m.material.dispose());
      particles(it.pos, RARITY[ITEMS[it.id].rarity].hex, 12, 3, 0.6, 0.3, -6);
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
