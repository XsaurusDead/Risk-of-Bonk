// Megabonk-style weapons.
//
// You carry up to 4 weapons. Slot 1 is always your survivor's main weapon
// (their primary attack, e.g. Kestrel's bow); the other 3 are picked from
// level-ups. Every weapon levels to 50. They all fire automatically.
//
// Damage numbers are coefficients of your damage stat; the weapon's own levels
// (damage / fire rate / size / projectiles / crit) are applied on top by
// Player.withWeapon(), and tomes / items apply to every weapon.
import * as THREE from 'three';
import { G } from '../core/state.js';
import {
  findTargets, nearestEnemy, strongestEnemy, dealDamage, explode, hitscan, meleeArc, spawnProjectile, spawnZone,
  applyBurn, applyChill, applyPoison, pullEnemies, after,
} from '../game/combat.js';
import { particles, ring, telegraph, beam } from '../game/fx.js';
import { glowMaterial } from '../game/models.js';
import { sfx } from '../core/audio.js';

export const WEAPON_SLOTS_MAX = 4;
const RANGE = 28;
const V = () => new THREE.Vector3();

function chest(p) {
  return p.pos.clone().setY(p.pos.y + 1.2);
}
function aimAt(e) {
  return V().set(e.pos.x, e.pos.y + e.height * e.scale * 0.5, e.pos.z);
}
/** `n` distinct targets near the player (repeats the closest if there are fewer). */
function targets(p, n, range = RANGE) {
  const list = findTargets(p.pos, range, 40);
  if (!list.length) return [];
  const out = [];
  for (let i = 0; i < n; i++) out.push(list[i % list.length]);
  return out;
}
function randomTargets(p, n, range = RANGE) {
  const list = findTargets(p.pos, range, 40);
  if (!list.length) return [];
  const out = [];
  for (let i = 0; i < n; i++) out.push(list[Math.floor(Math.random() * list.length)]);
  return out;
}

// --------------------------------------------------------------------- weapons
// cd: seconds between attacks (fire rate & attack speed shorten it)
// proj: base projectile count (Multishot tome and Projectile levels add to it)
// ups: which stats a level-up can improve
export const WEAPONS = {
  orbit: {
    name: 'Orbiting Blades', icon: 'weapons/e_0_3', cd: 0.1, proj: 2, ups: ['dmg', 'rate', 'area', 'proj', 'crit'],
    desc: 'Blades circle around you and cut through everything they touch (50% damage).',
    always: true,
    fire() {}, // damage is dealt continuously in update()
    update(p, s, dt) {
      const n = Math.min(12, s.count);
      const rad = 3.2 * s.area;
      s.state.angle = (s.state.angle || 0) + dt * 2.6 * s.rate;
      s.state.meshes ||= [];
      while (s.state.meshes.length < n) {
        const m = new THREE.Mesh(BLADE_GEO, glowMaterial({ color: 0xbfe8ff }));
        G.scene.add(m);
        s.state.meshes.push(m);
      }
      while (s.state.meshes.length > n) G.scene.remove(s.state.meshes.pop());
      s.state.hitT ||= new WeakMap();
      const now = G.run?.time || 0;
      s.state.meshes.forEach((m, i) => {
        const a = s.state.angle + (i / n) * Math.PI * 2;
        m.position.set(p.pos.x + Math.cos(a) * rad, p.pos.y + 1.1, p.pos.z + Math.sin(a) * rad);
        m.rotation.set(Math.PI / 2, 0, -a);
        m.scale.setScalar(0.5 + 0.25 * s.area);
        for (const e of findTargets(m.position, 0.9 + 0.3 * s.area, 8)) {
          if ((s.state.hitT.get(e) || -9) > now - 0.45 / s.rate) continue;
          s.state.hitT.set(e, now);
          p.withWeapon(s.id, () => dealDamage(e, p.stats.damage * 0.5, { procCoef: 0.5, knockback: 3, dir: V().set(Math.cos(a + 1.57), 0, Math.sin(a + 1.57)) }));
          particles(m.position, 0xbfe8ff, 2, 3, 0.2, 0.2);
        }
      });
    },
    dispose(s) {
      for (const m of s.state.meshes || []) G.scene.remove(m);
      s.state.meshes = [];
    },
  },
  aura: {
    name: 'Burning Aura', icon: 'weapons/e_3_9', cd: 0.5, proj: 0, ups: ['dmg', 'rate', 'area', 'crit'],
    desc: 'Scorches every enemy around you for 60% damage twice a second and sets them on fire.',
    always: true,
    fire(p) {
      const r = 3.6;
      explode(p.pos, r, p.stats.damage * 0.6, { procCoef: 0.35, small: true, color: 0xff7a2a, canCrit: true });
      for (const e of findTargets(p.pos, r * p.stats.area, 40)) applyBurn(e, p.stats.damage * 0.2, 1.5);
    },
    update(p, s) {
      if (!s.state.ring) {
        s.state.ring = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 48), new THREE.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
        s.state.ring.rotation.x = -Math.PI / 2;
        G.scene.add(s.state.ring);
      }
      const r = 3.6 * p.stats.area * s.area;
      s.state.ring.scale.setScalar(r * (1 + Math.sin((G.run?.time || 0) * 6) * 0.03));
      s.state.ring.position.set(p.pos.x, p.pos.y + 0.15, p.pos.z);
      if (Math.random() < 0.3) particles(V().set(p.pos.x + (Math.random() - 0.5) * r * 1.6, p.pos.y + 0.3, p.pos.z + (Math.random() - 0.5) * r * 1.6), 0xff9a3c, 1, 1.5, 0.5, 0.25, -3);
    },
    dispose(s) {
      if (s.state.ring) G.scene.remove(s.state.ring);
      s.state.ring = null;
    },
  },
  thunder: {
    name: 'Thunder Staff', icon: 'weapons/e_1_7', cd: 1.4, proj: 2, ups: ['dmg', 'rate', 'area', 'proj', 'crit'],
    desc: 'Calls lightning down on random enemies for 220% damage in a small area.',
    fire(p, s) {
      const ts = randomTargets(p, s.count);
      ts.forEach((e, i) => after(i * 0.06, () => {
        if (e.dead) return;
        const at = e.pos.clone();
        beam(at.clone().setY(at.y + 30), at.clone().setY(at.y + 0.5), 0xaee8ff, 0.35, 0.15);
        explode(at, 2, p.stats.damage * 2.2, { color: 0x9fe0ff, procCoef: 0.8 });
      }));
      if (ts.length) sfx('zap', 0.1);
      return ts.length > 0;
    },
  },
  firestaff: {
    name: 'Fire Staff', icon: 'weapons/e_0_5', cd: 1.1, proj: 1, ups: ['dmg', 'rate', 'area', 'proj', 'crit'],
    desc: 'Hurls fireballs at the nearest enemies that explode for 200% damage and burn.',
    fire(p, s) {
      const ts = targets(p, s.count);
      ts.forEach((e, i) => {
        const from = chest(p);
        spawnProjectile({ pos: from, dir: aimAt(e).sub(from).normalize().add(V().set(0, 0, 0)), speed: 26, size: 0.45, color: 0xff6a22, trail: 0xffaa33, damage: p.stats.damage * 2.0, explodeRadius: 2.5, homing: 6, target: e, life: 2.5 });
        if (i === 0) sfx('swing', 0.1);
      });
      return ts.length > 0;
    },
  },
  frost: {
    name: 'Frost Shards', icon: 'weapons/e_1_9', cd: 1.5, proj: 5, ups: ['dmg', 'rate', 'proj', 'crit'],
    desc: 'Fires a ring of piercing ice shards for 110% damage that chill enemies.',
    fire(p, s) {
      if (!findTargets(p.pos, RANGE, 1).length) return false;
      const n = Math.min(24, s.count);
      const off = Math.random() * Math.PI * 2;
      for (let i = 0; i < n; i++) {
        const a = off + (i / n) * Math.PI * 2;
        spawnProjectile({ pos: chest(p), dir: V().set(Math.cos(a), 0, Math.sin(a)), speed: 30, shape: 'shard', size: 0.35, color: 0x9fe8ff, damage: p.stats.damage * 1.1, pierce: 2, life: 1.0, status: { slow: 0.3 } });
      }
      sfx('freeze', 0.1);
      return true;
    },
  },
  axe: {
    name: 'Throwing Axe', icon: 'weapons/e_2_1', cd: 1.5, proj: 1, ups: ['dmg', 'rate', 'area', 'proj', 'crit'],
    desc: 'Lobs heavy axes in an arc that cleave through 4 enemies for 320% damage.',
    fire(p, s) {
      const ts = targets(p, s.count, 22);
      if (!ts.length) return false;
      ts.forEach((e, i) => {
        const to = aimAt(e);
        const from = chest(p);
        const d = Math.hypot(to.x - from.x, to.z - from.z);
        const t = Math.max(0.35, d / 18);
        const vel = V().set((to.x - from.x) / t, (to.y - from.y) / t + 0.5 * 22 * t, (to.z - from.z) / t);
        after(i * 0.08, () => spawnProjectile({ pos: from, vel, gravity: 22, shape: 'blade', size: 0.5 * s.area, color: 0xd0d6e0, damage: p.stats.damage * 3.2, pierce: 4, life: 3 }));
      });
      sfx('swing', 0.1);
      return true;
    },
  },
  spikes: {
    name: 'Earth Spikes', icon: 'weapons/e_2_5', cd: 1.8, proj: 3, ups: ['dmg', 'rate', 'area', 'proj', 'crit'],
    desc: 'Spikes erupt under random enemies for 240% damage and toss them into the air.',
    fire(p, s) {
      const ts = randomTargets(p, s.count);
      ts.forEach((e) => {
        const at = e.pos.clone();
        telegraph(at.clone().setY(G.world.heightAt(at.x, at.z) + 0.05), 1.8 * p.stats.area, 0xc8a070, 0.35);
        after(0.35, () => explode(at, 1.8, p.stats.damage * 2.4, { color: 0xc8a070, knockup: 9, spikes: true, procCoef: 0.8 }));
      });
      return ts.length > 0;
    },
  },
  poison: {
    name: 'Poison Flask', icon: 'weapons/e_2_7', cd: 2.8, proj: 1, ups: ['dmg', 'rate', 'area', 'proj', 'crit'],
    desc: 'Throws flasks that leave a toxic pool for 4s (60% damage per tick + poison).',
    fire(p, s) {
      const ts = randomTargets(p, s.count, 24);
      ts.forEach((e) => {
        const at = e.pos.clone();
        const from = chest(p);
        spawnProjectile({ pos: from, dir: at.clone().sub(from).normalize(), speed: 24, size: 0.3, color: 0x8bd450, damage: 0, life: 1.2, homing: 8, target: e });
        after(Math.min(1, from.distanceTo(at) / 24), () => spawnZone({
          pos: at, radius: 3.4, duration: 4, tick: 0.5, color: 0x6ad040,
          onTick: (z) => {
            for (const t of findTargets(z.pos, z.radius, 40)) {
              dealDamage(t, p.stats.damage * 0.6, { procCoef: 0.25, canCrit: true });
              applyPoison(t, 1);
            }
          },
        }));
      });
      return ts.length > 0;
    },
  },
  laser: {
    name: 'Prism Laser', icon: 'weapons/e_1_5', cd: 2.0, proj: 1, ups: ['dmg', 'rate', 'proj', 'crit'],
    desc: 'Fires a piercing laser at the toughest enemy for 500% damage to everything in its path.',
    fire(p, s) {
      const strongest = strongestEnemy(p.pos, RANGE + 6);
      if (!strongest) return false;
      const ts = [strongest, ...targets(p, s.count - 1, RANGE + 6)];
      ts.forEach((e, i) => after(i * 0.1, () => {
        if (e.dead) return;
        hitscan(chest(p), aimAt(e), 60, p.stats.damage * 5, { pierce: true, color: 0xff7ae0, width: 0.3, life: 0.2, knockback: 4 });
      }));
      sfx('laser', 0.1);
      return true;
    },
  },
  dragon: {
    name: 'Dragon Breath', icon: 'weapons/e_3_6', cd: 0.3, proj: 0, ups: ['dmg', 'rate', 'area', 'crit'],
    desc: 'Breathes fire at nearby enemies in a cone for 45% damage several times a second and burns them.',
    fire(p) {
      const e = nearestEnemy(p.pos, 8 * p.stats.area);
      if (!e) return false;
      const yaw = Math.atan2(-(e.pos.x - p.pos.x), -(e.pos.z - p.pos.z));
      meleeArc(p.pos, yaw, 7, 70, p.stats.damage * 0.45, { color: 0xff6a22, procCoef: 0.3 });
      for (const t of findTargets(p.pos, 7 * p.stats.area, 30)) applyBurn(t, p.stats.damage * 0.25, 2);
      const dir = V().set(-Math.sin(yaw), 0, -Math.cos(yaw));
      for (let i = 0; i < 4; i++) particles(chest(p).addScaledVector(dir, 1 + i * 1.4), i % 2 ? 0xffaa33 : 0xff5522, 1, 3, 0.35, 0.45, -2);
      return true;
    },
  },
  void: {
    name: 'Void Orb', icon: 'weapons/e_4_7', cd: 5.5, proj: 1, ups: ['dmg', 'rate', 'area', 'proj', 'crit'],
    desc: 'Opens a black hole in a crowd that pulls enemies in and crushes them (50% damage, 10x per second-ish).',
    fire(p, s) {
      const ts = randomTargets(p, s.count, 24);
      ts.forEach((e) => spawnZone({
        pos: e.pos.clone(), radius: 4, duration: 3, tick: 0.25, color: 0x6a10ff, kind: 'blackhole',
        onTick: (z) => {
          pullEnemies(z.pos, z.radius + 2, 0.6);
          for (const t of findTargets(z.pos, z.radius, 40)) dealDamage(t, p.stats.damage * 0.5, { procCoef: 0.2, canCrit: true });
        },
      }));
      if (ts.length) sfx('zap', 0.1);
      return ts.length > 0;
    },
  },
  revolver: {
    name: 'Repeater Crossbow', icon: 'weapons/e_0_4', cd: 0.6, proj: 1, crit: 0.15, ups: ['dmg', 'rate', 'proj', 'crit'],
    desc: 'Rapid, precise bolts at the nearest enemies for 160% damage. +15% crit chance.',
    fire(p, s) {
      const ts = targets(p, s.count, 32);
      ts.forEach((e, i) => after(i * 0.05, () => {
        if (!e.dead) hitscan(chest(p), aimAt(e), 40, p.stats.damage * 1.6, { color: 0xffe9a0, width: 0.07 });
      }));
      if (ts.length) sfx('shoot', 0.08);
      return ts.length > 0;
    },
  },
};
export const WEAPON_IDS = Object.keys(WEAPONS);

const BLADE_GEO = new THREE.ConeGeometry(0.35, 1.6, 4);
