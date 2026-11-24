// Player allies: turrets & mines (Tinker), skeletons (Morrow), drones and ghosts (items).
import * as THREE from 'three';
import { G } from '../core/state.js';
import { buildMerged, MAT } from './models.js';
import { findTargets, hitscan, explode, spawnProjectile, dealDamage, nearestEnemy } from './combat.js';
import { particles, ring } from './fx.js';
import { sfx } from '../core/audio.js';

const _v = new THREE.Vector3();
const MODELS = {
  turret: [
    ['cyl', 0x555a60, [0, 0.3, 0], [1.2, 0.6, 1.2]], ['cyl', 0x777d85, [0, 0.9, 0], [0.5, 0.8, 0.5]],
    ['box', 0xf0b820, [0, 1.45, 0], [0.9, 0.5, 0.9]], ['cyl', 0x333333, [0, 1.45, 0.7], [0.18, 0.9, 0.18], [Math.PI / 2, 0, 0]],
    ['sphere', 0x33ddff, [0, 1.75, 0], [0.25, 0.25, 0.25], null, true],
  ],
  mine: [['cyl', 0x333a44, [0, 0.12, 0], [0.9, 0.24, 0.9]], ['sphere', 0x33aaff, [0, 0.3, 0], [0.35, 0.3, 0.35], null, true]],
  skeleton: [
    ['box', 0xf0ead6, [0, 1.1, 0], [0.5, 0.7, 0.3]], ['sphere', 0xf0ead6, [0, 1.75, 0], [0.5, 0.5, 0.5]],
    ['box', 0x111111, [-0.1, 1.78, 0.22], [0.1, 0.1, 0.06]], ['box', 0x111111, [0.1, 1.78, 0.22], [0.1, 0.1, 0.06]],
    ['box', 0xe0dac6, [-0.15, 0.4, 0], [0.12, 0.8, 0.12]], ['box', 0xe0dac6, [0.15, 0.4, 0], [0.12, 0.8, 0.12]],
    ['box', 0xe0dac6, [-0.38, 1.1, 0], [0.12, 0.7, 0.12]], ['box', 0xe0dac6, [0.38, 1.1, 0.2], [0.12, 0.12, 0.7]],
    ['box', 0x9a9a9a, [0.38, 1.1, 0.8], [0.08, 0.15, 0.9]],
  ],
  skeleton_warrior: [
    ['box', 0xf0ead6, [0, 1.2, 0], [0.6, 0.8, 0.35]], ['sphere', 0xf0ead6, [0, 1.9, 0], [0.55, 0.55, 0.55]],
    ['cone', 0x445566, [0, 2.25, 0], [0.6, 0.5, 0.6]], ['sphere', 0x7dff9a, [-0.11, 1.93, 0.24], [0.1, 0.1, 0.05], null, true], ['sphere', 0x7dff9a, [0.11, 1.93, 0.24], [0.1, 0.1, 0.05], null, true],
    ['box', 0xe0dac6, [-0.18, 0.45, 0], [0.14, 0.9, 0.14]], ['box', 0xe0dac6, [0.18, 0.45, 0], [0.14, 0.9, 0.14]],
    ['box', 0x556677, [-0.55, 1.2, 0.1], [0.12, 1.0, 0.8]], ['box', 0xbbbbcc, [0.45, 1.4, 0.6], [0.1, 0.15, 1.5]],
  ],
  drone: [['box', 0x99a0aa, [0, 0, 0], [0.8, 0.25, 0.8]], ['cyl', 0x33ddff, [0, -0.1, 0.2], [0.25, 0.1, 0.25], null, true], ['box', 0x555a60, [0, 0.15, 0], [1.4, 0.06, 0.12]], ['box', 0x555a60, [0, 0.15, 0], [0.12, 0.06, 1.4]]],
  wisp: [['ico', 0xaaffee, [0, 0, 0], [0.6, 0.6, 0.6], null, true], ['torus', 0x55ddcc, [0, 0, 0], [0.9, 0.9, 0.9], [1.57, 0, 0], true]],
  shade: [['sphere', 0x2a1a3a, [0, 1.0, 0], [0.9, 1.2, 0.8]], ['cone', 0x1a1024, [0, 0.4, 0], [0.9, 1.0, 0.9], [Math.PI, 0, 0]], ['sphere', 0xd080ff, [-0.15, 1.2, 0.35], [0.12, 0.08, 0.06], null, true], ['sphere', 0xd080ff, [0.15, 1.2, 0.35], [0.12, 0.08, 0.06], null, true]],
  wolf: [
    ['box', 0x8a8f98, [0, 0.85, 0], [0.7, 0.65, 1.5]], ['box', 0x9aa0aa, [0, 1.05, 0.9], [0.55, 0.5, 0.6]], ['box', 0x6a6f78, [0, 0.95, 1.25], [0.3, 0.25, 0.35]],
    ['cone', 0x8a8f98, [-0.18, 1.4, 0.85], [0.14, 0.3, 0.14]], ['cone', 0x8a8f98, [0.18, 1.4, 0.85], [0.14, 0.3, 0.14]],
    ['box', 0x5a5f68, [-0.25, 0.3, 0.5], [0.18, 0.6, 0.18]], ['box', 0x5a5f68, [0.25, 0.3, 0.5], [0.18, 0.6, 0.18]],
    ['box', 0x5a5f68, [-0.25, 0.3, -0.5], [0.18, 0.6, 0.18]], ['box', 0x5a5f68, [0.25, 0.3, -0.5], [0.18, 0.6, 0.18]],
    ['cone', 0x9aa0aa, [0, 1.0, -0.95], [0.18, 0.7, 0.18], [-1.1, 0, 0]], ['sphere', 0xffdd55, [-0.13, 1.12, 1.15], [0.08, 0.08, 0.05], null, true], ['sphere', 0xffdd55, [0.13, 1.12, 1.15], [0.08, 0.08, 0.05], null, true],
  ],
  ghost: [['sphere', 0xbfffe0, [0, 1.0, 0], [0.9, 1.1, 0.9], null, true], ['cone', 0xbfffe0, [0, 0.4, 0], [0.8, 0.9, 0.8], [Math.PI, 0, 0], true], ['sphere', 0x113322, [-0.15, 1.15, 0.38], [0.14, 0.2, 0.1]], ['sphere', 0x113322, [0.15, 1.15, 0.38], [0.14, 0.2, 0.1]]],
};
const geoCache = {};
function makeMesh(kind) {
  if (!geoCache[kind]) geoCache[kind] = buildMerged(MODELS[kind]);
  const { geo, glow } = geoCache[kind];
  const g = new THREE.Group();
  if (geo) g.add(new THREE.Mesh(geo, MAT.vc));
  if (glow) g.add(new THREE.Mesh(glow, MAT.glow));
  return g;
}

class Minion {
  constructor(type, pos, opts) {
    this.type = type;
    this.opts = opts;
    this.pos = new THREE.Vector3().copy(pos);
    this.pos.y = G.world.heightAt(pos.x, pos.z);
    this.dead = false;
    this.t = 0;
    this.atk = 0.3;
    this.yaw = 0;
    const modelKind = type === 'skeleton' && opts.warrior ? 'skeleton_warrior' : type;
    this.mesh = makeMesh(modelKind);
    this.mesh.position.copy(this.pos);
    G.scene.add(this.mesh);
    this.life = { turret: 35, mine: 30, skeleton: opts.life || 20, drone: Infinity, wisp: Infinity, ghost: 15, shade: Infinity, wolf: Infinity }[type] ?? 20;
    particles(this.pos, type === 'skeleton' || type === 'ghost' ? 0x7dff9a : 0x33ddff, 12, 4, 0.5);
  }
  kill() {
    if (this.dead) return;
    this.dead = true;
    G.scene.remove(this.mesh);
    particles(this.pos, 0xaaaaaa, 8, 3, 0.4);
  }
  update(dt) {
    const p = G.player;
    this.t += dt;
    this.life -= dt;
    if (this.life <= 0) return this.kill();
    const dmg = p.stats.damage;
    switch (this.type) {
      case 'turret': {
        this.atk -= dt;
        const e = nearestEnemy(this.pos, 32);
        if (e) {
          this.yaw = Math.atan2(e.pos.x - this.pos.x, e.pos.z - this.pos.z);
          if (this.atk <= 0) {
            this.atk = 0.25 / p.stats.attackSpeed;
            const from = this.pos.clone().add(_v.set(Math.sin(this.yaw) * 0.9, 1.45, Math.cos(this.yaw) * 0.9));
            hitscan(from, e.pos.clone().setY(e.pos.y + e.height * e.scale * 0.5), 40, dmg * 0.7, { color: 0x33ddff, width: 0.05, procCoef: 0.6, source: 'deploy' });
            sfx('shoot', 0.06);
          }
        }
        this.mesh.rotation.y = this.yaw;
        break;
      }
      case 'mine': {
        this.mesh.children[1] && (this.mesh.children[1].visible = Math.sin(this.t * 10) > 0);
        if (this.t > 0.5 && findTargets(this.pos, 3.5, 1).length) {
          explode(this.pos, 6, dmg * 3.5, { stun: 2, color: 0x33aaff, procCoef: 1, big: true, source: 'deploy' });
          sfx('boom');
          this.kill();
        }
        break;
      }
      case 'skeleton':
      case 'ghost':
      case 'shade':
      case 'wolf': {
        const floaty = this.type === 'ghost' || this.type === 'shade';
        const speed = this.type === 'wolf' ? 14 : floaty ? 11 : 9;
        // allies that wandered too far teleport back to the player
        if (this.pos.distanceTo(p.pos) > 60) this.pos.copy(p.pos);
        if (this.type === 'wolf' && this.opts.sicTarget && !this.opts.sicTarget.dead) {
          this.forceTarget = this.opts.sicTarget;
        } else this.forceTarget = null;
        const e = this.forceTarget || nearestEnemy(this.pos, 30);
        let tx, tz;
        if (e) {
          tx = e.pos.x;
          tz = e.pos.z;
        } else {
          // idle: wait beside/in front of the player, never between player and camera
          const fx = -Math.sin(p.camYaw), fz = -Math.cos(p.camYaw);
          const slot = (G.minions.indexOf(this) % 6) - 2.5;
          tx = p.pos.x + fx * 3 + fz * slot * 1.6;
          tz = p.pos.z + fz * 3 - fx * slot * 1.6;
        }
        const dx = tx - this.pos.x, dz = tz - this.pos.z;
        const d = Math.hypot(dx, dz);
        const reach = e ? e.radius * e.scale + 1.4 : 2.5;
        if (d > reach) {
          this.pos.x += (dx / d) * speed * dt;
          this.pos.z += (dz / d) * speed * dt;
        }
        this.yaw = Math.atan2(dx, dz);
        this.atk -= dt;
        if (e && d <= reach + 0.3 && this.atk <= 0) {
          this.atk = this.type === 'ghost' ? 0.5 : this.type === 'wolf' ? 0.6 / p.stats.attackSpeed : 0.8;
          const mult = this.type === 'ghost' ? 1.0 : this.type === 'shade' ? 1.6 : this.type === 'wolf' ? 2.0 * (this.opts.frenzy > G.time ? 1.5 : 1) : this.opts.warrior ? 2.2 : 1.5;
          if (this.type === 'wolf' && this.opts.sicTarget === e) {
            dealDamage(e, dmg * 6, { procCoef: 1, color: '#ffdd88', knockback: 6 });
            this.opts.sicTarget = null;
          }
          dealDamage(e, dmg * mult, { procCoef: 0.5, color: '#b8ffcc', knockback: 2 });
          particles(e.pos, 0x7dff9a, 3, 3, 0.3);
        }
        const gy = G.world.heightAt(this.pos.x, this.pos.z);
        this.pos.y = floaty ? gy + 1 + Math.sin(this.t * 3) * 0.3 : gy;
        this.mesh.position.copy(this.pos);
        if (this.type === 'wolf') this.mesh.position.y += Math.abs(Math.sin(this.t * 14)) * 0.15;
        this.mesh.rotation.y = this.yaw;
        if (this.type === 'skeleton') this.mesh.rotation.z = Math.sin(this.t * 12) * 0.08;
        if (this.life < 2) this.mesh.visible = Math.sin(this.t * 20) > 0;
        break;
      }
      case 'wisp':
      case 'drone': {
        const idx = (this.opts.index || 0) + (this.type === 'wisp' ? 3 : 0);
        const a = this.t * 1.5 + idx * 2.1;
        const target = _v.set(p.pos.x + Math.cos(a) * 2.6, p.pos.y + 3.2 + Math.sin(this.t * 2 + idx) * 0.3, p.pos.z + Math.sin(a) * 2.6);
        this.pos.lerp(target, Math.min(1, dt * 6));
        this.mesh.position.copy(this.pos);
        this.mesh.rotation.y += dt * 6;
        this.atk -= dt;
        if (this.atk <= 0) {
          const e = nearestEnemy(this.pos, 30);
          if (e) {
            this.atk = 0.5 / p.stats.attackSpeed;
            const to = e.pos.clone().setY(e.pos.y + e.height * e.scale * 0.5);
            spawnProjectile({ pos: this.pos, dir: to.sub(this.pos), speed: 55, damage: dmg * 0.8, color: 0x66ddff, size: 0.18, procCoef: 0.4, source: 'deploy' });
          } else this.atk = 0.3;
        }
        break;
      }
    }
    if (this.type === 'turret' || this.type === 'mine') this.mesh.position.copy(this.pos);
  }
}

export function spawnMinion(type, pos, opts = {}) {
  const m = new Minion(type, pos, opts);
  G.minions.push(m);
  return m;
}

export function updateMinions(dt) {
  for (let i = G.minions.length - 1; i >= 0; i--) {
    const m = G.minions[i];
    if (!m.dead) m.update(dt);
    if (m.dead) G.minions.splice(i, 1);
  }
}

export function clearMinions(keepDrones = false) {
  for (const m of G.minions) {
    if (keepDrones && m.type === 'drone') continue;
    m.kill();
  }
  G.minions = G.minions.filter((m) => !m.dead);
}
