// Combat core: damage resolution, status effects, projectiles, area zones,
// hitscan/melee/explosion helpers and delayed callbacks.
import * as THREE from 'three';
import { G } from '../core/state.js';
const slowmo = () => (G.run?.powers?.slowmo > 0 ? 0.35 : 1); // Time Warp power-up
import { ITEMS } from '../data/items.js';
import { particles, ring, beam, damageNumber, floatText } from './fx.js';
import { sfx } from '../core/audio.js';
import { track, trackMax } from '../core/save.js';
import { killEnemy, hitReact } from './enemies.js';
import { glowMaterial } from './models.js';

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _q = new THREE.Quaternion();
const FWD = new THREE.Vector3(0, 0, 1);
const tmp = [];

// ------------------------------------------------------------------ queries
export function findTargets(pos, r, max = 99) {
  const out = [];
  if (!G.enemyHash) return out;
  G.enemyHash.query(pos.x, pos.z, r + 4, tmp);
  for (const e of tmp) {
    if (e.dead || e.spawnT > 0) continue;
    const d = Math.hypot(e.pos.x - pos.x, e.pos.z - pos.z) - e.radius * e.scale;
    if (d <= r && Math.abs(e.pos.y - pos.y) < r + e.height * e.scale + 4) out.push({ e, d });
  }
  out.sort((a, b) => a.d - b.d);
  const res = [];
  for (let i = 0; i < out.length && i < max; i++) res.push(out[i].e);
  return res;
}
export function nearestEnemy(pos, r, exclude) {
  const list = findTargets(pos, r, 6);
  for (const e of list) if (!exclude || !exclude.has(e)) return e;
  return null;
}
export function strongestEnemy(pos, r) {
  let best = null;
  for (const e of findTargets(pos, r)) if (!best || e.hp > best.hp) best = e;
  return best;
}
/** Enemy closest (by angle) to the camera crosshair ray. */
export function targetNearAim(maxDist = 60, coneDeg = 20) {
  const p = G.player;
  if (!p) return null;
  const o = p.camRayOrigin, d = p.camRayDir;
  let best = null, bestAng = (coneDeg * Math.PI) / 180;
  for (const e of G.enemies) {
    if (e.dead || e.spawnT > 0) continue;
    _v.set(e.pos.x, e.pos.y + e.height * e.scale * 0.5, e.pos.z).sub(o);
    const dist = _v.length();
    if (dist > maxDist + 8 || e.pos.distanceTo(p.pos) > maxDist) continue;
    const ang = _v.angleTo(d);
    if (ang < bestAng) {
      bestAng = ang;
      best = e;
    }
  }
  return best;
}

// ------------------------------------------------------------------ damage
let hookDepth = 0;
// damage dealt is batched into the lifetime stat once per second (cheap)
let dmgAcc = 0, dmgFlushT = 0;
export function flushDamageStat(dt) {
  dmgFlushT += dt;
  if (dmgFlushT >= 1 && dmgAcc > 0) {
    dmgFlushT = 0;
    track('damageDealt', Math.round(dmgAcc));
    if (G.run) G.run.dps = dmgAcc;
    dmgAcc = 0;
  }
}
export function dealDamage(e, amount, o = {}) {
  if (!e || e.dead || !(amount > 0)) return 0;
  const p = G.player;
  const procCoef = o.procCoef ?? 1;
  let dmg = amount;
  let crit = o.crit;
  if (crit === undefined) crit = o.canCrit !== false && Math.random() < p.stats.crit;
  if (crit) dmg *= p.stats.critMult;
  const mod = p.char.passive.modifyDamage;
  if (mod) dmg = mod(e, dmg, o, p);
  for (const [it, n] of p.dmgModItems) dmg = it.dmgMod(n, e, dmg, p);
  if (e.status.burnT > 0 && p.stats.burnVuln) dmg *= 1 + p.stats.burnVuln;
  if (e.vulnT > 0) dmg *= 1.25;

  let shown = dmg;
  if (e.shieldHp > 0) {
    const absorbed = Math.min(e.shieldHp, dmg);
    e.shieldHp -= absorbed;
    dmg -= absorbed;
  }
  e.hp -= dmg;
  e.flash = 0.1;
  e.lastHitT = 0;
  hitReact(e, shown / e.maxHp, (o.knockback || 0) >= 8);
  damageNumber(_v.set(e.pos.x, e.pos.y + e.height * e.scale * 0.7, e.pos.z), shown, crit, typeof o.color === 'string' && !crit ? o.color : null);
  if (G.save && shown > (G.save.stats.maxHit || 0)) trackMax('maxHit', Math.floor(shown));
  if (crit && procCoef > 0) track('crits');
  dmgAcc += shown;

  if (o.knockback && !e.isBoss) {
    const dir = o.dir ? _v2.copy(o.dir) : _v2.copy(e.pos).sub(p.pos);
    dir.y = 0;
    if (dir.lengthSq() > 0) dir.normalize();
    e.knock.addScaledVector(dir, o.knockback / e.mass);
  }
  if (o.knockup && !e.isBoss && !e.flying) e.vy = Math.max(e.vy, o.knockup / e.mass);
  if (o.stun) applyStun(e, o.stun);
  if (o.freeze) applyFreeze(e, o.freeze);
  if (o.slow) applySlow(e, o.slow, 2);

  if (procCoef > 0 && p.stats.lifeOnHit > 0) p.heal(p.stats.lifeOnHit * procCoef);
  if (procCoef > 0 && p.stats.lifesteal > 0) p.heal(Math.min(shown, e.maxHp) * p.stats.lifesteal * procCoef);

  // execute
  if (!e.isBoss && p.stats.execute > 0 && e.hp > 0 && e.hp / e.maxHp < p.stats.execute) {
    e.hp = 0;
    track('executes');
    floatText(e.pos, 'EXECUTE', '#d9a0ff');
  }

  if (procCoef > 0 && !o.noHooks && hookDepth < 3) {
    hookDepth++;
    const hit = { enemy: e, damage: shown, crit, procCoef, pos: _v.set(e.pos.x, e.pos.y + e.height * e.scale * 0.5, e.pos.z).clone(), source: o.source };
    try {
      if (p.char.passive.onHit) p.char.passive.onHit(hit, p);
      for (const id in p.items) {
        const it = ITEMS[id];
        if (it.onHit) it.onHit(p.items[id], hit);
      }
    } finally {
      hookDepth--;
    }
  }
  if (e.hp <= 0 && !e.dead) killEnemy(e, o);
  return shown;
}

export function damagePlayer(amount, attacker = null, o = {}) {
  if (G.player) G.player.takeDamage(amount, attacker, o);
}

// ------------------------------------------------------------------ status effects
export function applyBurn(e, dps, dur) {
  if (!e || e.dead) return;
  const s = e.status;
  const cap = G.player.stats.damage * 4 + dps;
  s.burnDps = Math.min(cap, (s.burnT > 0 ? s.burnDps : 0) + dps);
  s.burnT = Math.max(s.burnT, dur);
}
export function applyPoison(e, stacks = 1) {
  if (!e || e.dead) return;
  const s = e.status;
  const capN = G.player?.stats.poisonCap || 10;
  s.poison = Math.min(capN, (s.poisonT > 0 ? s.poison : 0) + stacks);
  s.poisonT = 4;
}
export function applySlow(e, amt, dur) {
  if (!e || e.dead) return;
  e.status.slow = Math.max(e.status.slowT > 0 ? e.status.slow : 0, amt);
  e.status.slowT = Math.max(e.status.slowT, dur);
}
export function applyChill(e, stacks = 1) {
  if (!e || e.dead) return;
  e.status.chill += stacks;
  applySlow(e, 0.3, 3);
  if (e.status.chill >= 4) {
    e.status.chill = 0;
    applyFreeze(e, 1.5);
  }
}
export function applyFreeze(e, dur) {
  if (!e || e.dead) return;
  if (e.isBoss) dur *= 0.3;
  if (e.status.freeze <= 0) {
    track('freezes');
    particles(e.pos, 0xbff3ff, 8, 4, 0.5);
    sfx('freeze', 0.1);
  }
  e.status.freeze = Math.max(e.status.freeze, dur);
}
export function applyStun(e, dur) {
  if (!e || e.dead) return;
  if (e.isBoss) dur *= 0.3;
  e.status.stun = Math.max(e.status.stun, dur);
}
export function pullEnemies(pos, r, strength) {
  for (const e of findTargets(pos, r, 60)) {
    if (e.isBoss) continue;
    _v.copy(pos).sub(e.pos).setY(0);
    const d = _v.length();
    if (d > 0.5) e.pos.addScaledVector(_v.normalize(), Math.min(d, strength));
  }
}

// ------------------------------------------------------------------ attack shapes
function areaMult() {
  return G.player?.stats.area || 1;
}

export function explode(pos, radius, damage, o = {}) {
  const r = radius * (o.noArea ? 1 : areaMult());
  const hits = findTargets(pos, r, 200);
  for (const e of hits) {
    if (o.exclude && o.exclude === e) continue;
    _v2.copy(e.pos).sub(pos).setY(0);
    if (_v2.lengthSq() < 0.01) _v2.set(Math.random() - 0.5, 0, Math.random() - 0.5);
    dealDamage(e, damage, { ...o, dir: _v2.normalize().clone(), procCoef: o.procCoef ?? 1 });
  }
  if (o.big && hits.length >= 3) G.hitStop = Math.max(G.hitStop || 0, 0.05);
  const col = o.color ?? 0xffaa33;
  if (o.small) {
    if (Math.random() < 0.4) particles(pos, col, 4, 4, 0.3, 0.25);
  } else {
    ring(pos, r, col, o.big ? 0.5 : 0.3);
    particles(pos, col, o.big ? 26 : 12, o.big ? 10 : 6, 0.6, o.big ? 0.5 : 0.35);
    if (o.spikes) for (let i = 0; i < 3; i++) particles(pos, 0xf0ead6, 2, 10, 0.4, 0.4, 30);
  }
  return hits.length;
}

const _ray = new THREE.Ray();
const _sph = new THREE.Sphere();
const _hitP = new THREE.Vector3();
/** Instant ray attack. Returns number of enemies hit. */
export function hitscan(from, to, range, damage, o = {}) {
  const dir = _v.copy(to).sub(from);
  if (dir.lengthSq() < 0.0001) dir.set(0, 0, -1);
  dir.normalize();
  const dirC = dir.clone();
  _ray.set(from, dirC);
  // terrain occlusion
  let maxT = range;
  const w = G.world;
  if (w) {
    for (let t = 1; t < range; t += 1.5) {
      _v2.copy(from).addScaledVector(dirC, t);
      if (_v2.y < w.heightAt(_v2.x, _v2.z)) {
        maxT = t;
        break;
      }
    }
  }
  const hits = [];
  for (const e of G.enemies) {
    if (e.dead || e.spawnT > 0) continue;
    const r = Math.max(e.radius, e.height * 0.45) * e.scale + (o.thick || 0.15);
    _sph.center.set(e.pos.x, e.pos.y + e.height * e.scale * 0.5, e.pos.z);
    _sph.radius = r;
    if (_ray.intersectSphere(_sph, _hitP)) {
      const t = _hitP.distanceTo(from);
      if (t <= maxT) hits.push({ e, t });
    }
  }
  hits.sort((a, b) => a.t - b.t);
  let endT = maxT;
  const list = o.pierce ? hits : hits.slice(0, 1);
  if (!o.pierce && list.length) endT = list[0].t;
  for (const h of list) {
    dealDamage(h.e, damage, { ...o, dir: dirC, procCoef: o.procCoef ?? 1 });
  }
  const end = from.clone().addScaledVector(dirC, endT);
  beam(from, end, o.color ?? 0xffffaa, o.width ?? 0.06, o.life ?? 0.08);
  if (list.length) particles(end, o.color ?? 0xffffaa, 3, 3, 0.25, 0.2);
  return list.length;
}

/** Melee cone in front of `pos` facing `yaw`. Returns hit count. */
export function meleeArc(pos, yaw, range, arcDeg, damage, o = {}) {
  const fx = -Math.sin(yaw), fz = -Math.cos(yaw);
  const rr = range * (1 + (areaMult() - 1) * 0.5);
  const half = ((arcDeg / 2) * Math.PI) / 180;
  let n = 0;
  for (const e of findTargets(pos, rr, 100)) {
    const dx = e.pos.x - pos.x, dz = e.pos.z - pos.z;
    const d = Math.hypot(dx, dz);
    if (e.pos.y - pos.y > 3.5 + e.height * e.scale || pos.y - e.pos.y > 3.5) continue;
    const ang = Math.acos(Math.max(-1, Math.min(1, (dx * fx + dz * fz) / (d || 1))));
    if (ang > half && d > e.radius * e.scale + 1) continue;
    dealDamage(e, damage, { ...o, dir: _v2.set(dx, 0, dz).normalize().clone(), procCoef: o.procCoef ?? 1 });
    n++;
  }
  // swoosh visual
  const col = o.color ?? 0xffffff;
  for (let i = 0; i < 6; i++) {
    const a = yaw + (Math.random() - 0.5) * half * 2;
    const r = rr * (0.5 + Math.random() * 0.5);
    _v.set(pos.x - Math.sin(a) * r, pos.y + 0.6, pos.z - Math.cos(a) * r);
    particles(_v, col, 1, 2, 0.25, 0.3, 0);
  }
  if (n) sfx('hit');
  return n;
}

export function chainLightning(from, count, range, damage, o = {}) {
  const hit = new Set([from]);
  let cur = from;
  for (let i = 0; i < count; i++) {
    const next = nearestEnemy(cur.pos, range, hit);
    if (!next) break;
    hit.add(next);
    beam(cur.pos.clone().setY(cur.pos.y + cur.height * 0.5), next.pos.clone().setY(next.pos.y + next.height * 0.5), 0x88ccff, 0.12, 0.18);
    dealDamage(next, damage, { ...o, color: '#9fd8ff' });
    cur = next;
  }
  sfx('zap', 0.08);
}

// ------------------------------------------------------------------ projectiles
const projectiles = [];
const projPool = {};
const geoms = {
  sphere: new THREE.IcosahedronGeometry(1, 1),
  arrow: new THREE.BoxGeometry(0.25, 0.25, 4),
  blade: new THREE.ConeGeometry(0.6, 2.6, 4).rotateX(Math.PI / 2),
  shard: new THREE.OctahedronGeometry(1).scale(0.6, 0.6, 2.2),
};
const projMats = new Map();
function projMat(color) {
  if (!projMats.has(color)) projMats.set(color, glowMaterial({ color }));
  return projMats.get(color);
}

/**
 * o: pos, dir|vel, speed, damage, size, color, shape, life, pierce, homing, target,
 *    gravity, explodeRadius, procCoef, crit, owner('player'|'enemy'), onGround(pos),
 *    hitsEnemies(true), trail(color), status:{burn,slow,freeze}, attacker
 */
export function spawnProjectile(o) {
  const shape = o.shape || 'sphere';
  const key = shape;
  let mesh = projPool[key]?.pop();
  if (!mesh) mesh = new THREE.Mesh(geoms[shape], projMat(o.color ?? 0xffffff));
  mesh.material = projMat(o.color ?? 0xffffff);
  const size = o.size ?? 0.3;
  mesh.scale.setScalar(size);
  mesh.visible = true;
  G.scene.add(mesh);
  const vel = new THREE.Vector3();
  if (o.vel) vel.copy(o.vel);
  else {
    vel.set(o.dir.x, o.dir.y, o.dir.z).normalize().multiplyScalar(o.speed ?? 40);
  }
  const pr = {
    pos: new THREE.Vector3().copy(o.pos), vel, speed: vel.length(), size, damage: o.damage ?? 0,
    life: o.life ?? 3, pierce: o.pierce ?? 0, homing: o.homing ?? 0, target: o.target || null, homingPoint: o.homingPoint || null,
    gravity: o.gravity ?? 0, explodeRadius: o.explodeRadius ?? 0, procCoef: o.procCoef ?? 1, crit: o.crit,
    owner: o.owner || 'player', onGround: o.onGround, hitsEnemies: o.hitsEnemies !== false, trail: o.trail,
    status: o.status, attacker: o.attacker || null, color: o.color ?? 0xffffff, mesh, shape, hit: null, age: 0, source: o.source,
  };
  projectiles.push(pr);
  return pr;
}

function killProjectile(i) {
  const pr = projectiles[i];
  pr.mesh.visible = false;
  G.scene.remove(pr.mesh);
  (projPool[pr.shape] ||= []).push(pr.mesh);
  projectiles[i] = projectiles[projectiles.length - 1];
  projectiles.pop();
}

function projectileImpact(pr, enemy) {
  if (pr.explodeRadius > 0) {
    explode(pr.pos, pr.explodeRadius, pr.damage, { procCoef: pr.procCoef, crit: pr.crit, color: pr.color, source: pr.source });
    sfx('boom', 0.08);
    return true;
  }
  if (enemy) {
    dealDamage(enemy, pr.damage, { procCoef: pr.procCoef, crit: pr.crit, dir: pr.vel.clone().normalize(), color: null, source: pr.source, ...(pr.status || {}) });
    particles(pr.pos, pr.color, 3, 3, 0.25, 0.2);
  }
  return false;
}

function updateProjectiles(dt0) {
  const enemyScale = slowmo();
  const w = G.world;
  const p = G.player;
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const pr = projectiles[i];
    const dt = pr.owner === 'enemy' ? dt0 * enemyScale : dt0;
    pr.life -= dt;
    pr.age += dt;
    // homing
    if (pr.homing > 0 && pr.owner === 'player') {
      if (pr.target && (pr.target.dead || pr.target.spawnT > 0)) pr.target = null;
      if (!pr.target && pr.age > 0.1) pr.target = nearestEnemy(pr.pos, 30, pr.hit);
      let tx = null;
      if (pr.target) tx = _v.set(pr.target.pos.x, pr.target.pos.y + pr.target.height * pr.target.scale * 0.5, pr.target.pos.z);
      else if (pr.homingPoint) tx = _v.copy(pr.homingPoint);
      if (tx) {
        tx.sub(pr.pos).normalize().multiplyScalar(pr.speed);
        const k = Math.min(1, pr.homing * dt * (pr.age < 0.25 ? 0.5 : 1));
        pr.vel.lerp(tx, k).setLength(pr.speed);
      }
    } else if (pr.homing > 0 && pr.owner === 'enemy' && p) {
      _v.copy(p.pos).setY(p.pos.y + 1).sub(pr.pos).normalize().multiplyScalar(pr.speed);
      pr.vel.lerp(_v, Math.min(1, pr.homing * dt)).setLength(pr.speed);
    }
    pr.vel.y -= pr.gravity * dt;
    pr.pos.addScaledVector(pr.vel, dt);
    pr.mesh.position.copy(pr.pos);
    if (pr.shape !== 'sphere') {
      _v2.copy(pr.vel).normalize();
      pr.mesh.quaternion.setFromUnitVectors(FWD, _v2);
    } else pr.mesh.rotation.y += dt * 8;
    if (pr.trail && Math.random() < 0.5) particles(pr.pos, pr.trail, 1, 1, 0.3, pr.size * 0.8, 0);

    let dead = pr.life <= 0;
    // collisions
    if (!dead && pr.owner === 'player' && pr.hitsEnemies) {
      G.enemyHash.query(pr.pos.x, pr.pos.z, pr.size + 5, tmp);
      for (const e of tmp) {
        if (e.dead || e.spawnT > 0 || (pr.hit && pr.hit.has(e))) continue;
        const r = Math.max(e.radius, e.height * 0.45) * e.scale + pr.size;
        const cy = e.pos.y + e.height * e.scale * 0.5;
        const dx = e.pos.x - pr.pos.x, dy = cy - pr.pos.y, dz = e.pos.z - pr.pos.z;
        const vertOk = Math.abs(dy) < e.height * e.scale * 0.5 + pr.size + 0.4;
        if (dx * dx + dz * dz < r * r && vertOk) {
          if (projectileImpact(pr, e)) { dead = true; break; }
          (pr.hit ||= new Set()).add(e);
          if (pr.pierce-- <= 0) { dead = true; break; }
        }
      }
    } else if (!dead && pr.owner === 'enemy' && p && !p.dead) {
      const dx = p.pos.x - pr.pos.x, dy = p.pos.y + 1 - pr.pos.y, dz = p.pos.z - pr.pos.z;
      const r = 0.7 + pr.size;
      if (dx * dx + dy * dy + dz * dz < r * r) {
        damagePlayer(pr.damage, pr.attacker, { status: pr.status });
        particles(pr.pos, pr.color, 5, 4, 0.3, 0.25);
        dead = true;
      }
    }
    // terrain
    if (!dead && w) {
      const h = w.heightAt(pr.pos.x, pr.pos.z);
      if (pr.pos.y < h) {
        pr.pos.y = h;
        if (pr.onGround) pr.onGround(pr.pos.clone());
        if (pr.owner === 'player') projectileImpact(pr, null);
        else particles(pr.pos, pr.color, 4, 3, 0.3, 0.2);
        dead = true;
      }
      if (Math.abs(pr.pos.x) > w.half + 20 || Math.abs(pr.pos.z) > w.half + 20 || pr.pos.y > 150) dead = true;
    }
    if (dead) killProjectile(i);
  }
}

// ------------------------------------------------------------------ zones
const zones = [];
const zoneDisc = new THREE.CircleGeometry(1, 40);
const zoneCol = new THREE.CylinderGeometry(1, 1, 1, 20, 1, true);
/** o: pos, radius, duration, tick, onTick(zone), color, kind, hostile */
export function spawnZone(o) {
  const r = o.radius * (o.hostile ? 1 : areaMult());
  const g = new THREE.Group();
  const disc = new THREE.Mesh(zoneDisc, new THREE.MeshBasicMaterial({ color: o.color ?? 0xffffff, transparent: true, opacity: 0.22, depthTest: false, depthWrite: false, side: THREE.DoubleSide }));
  disc.rotation.x = -Math.PI / 2;
  disc.renderOrder = 4;
  g.add(disc);
  if (o.kind === 'orbital') {
    const col = new THREE.Mesh(zoneCol, new THREE.MeshBasicMaterial({ color: 0xaaf0ff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
    col.scale.set(0.9, 120, 0.9);
    col.position.y = 60;
    g.add(col);
  } else if (o.kind === 'blackhole') {
    const s = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    s.scale.setScalar(1.8 / r);
    s.position.y = 1.8;
    g.add(s);
    g.userData.ownGeo = s.geometry;
  }
  // zones always sit on the ground, even if triggered by a hit in mid-air
  o.pos = o.pos.clone();
  if (G.world) o.pos.y = G.world.heightAt(o.pos.x, o.pos.z);
  g.position.copy(o.pos);
  g.position.y += 0.2;
  g.scale.set(r, 1, r);
  if (o.kind === 'blackhole') g.children[1].scale.set(2 / r, 2, 2 / r);
  G.scene.add(g);
  const z = { ...o, radius: r, t: 0, acc: 0, mesh: g, wslot: o.hostile ? null : G.weaponSlot };
  zones.push(z);
  return z;
}

function updateZones(dt0) {
  const enemyScale = slowmo();
  for (let i = zones.length - 1; i >= 0; i--) {
    const z = zones[i];
    const dt = z.hostile ? dt0 * enemyScale : dt0;
    z.t += dt;
    z.acc += dt;
    while (z.acc >= z.tick && z.t <= z.duration) {
      z.acc -= z.tick;
      try {
        if (z.onTick) z.wslot && G.player ? G.player.withWeapon(z.wslot, () => z.onTick(z)) : z.onTick(z);
      } catch (err) { console.error(err); }
    }
    // ambient visuals
    const r = z.radius;
    if (z.kind === 'blizzard' && Math.random() < 0.8) {
      const a = Math.random() * 6.28, d = Math.random() * r;
      particles(_v.set(z.pos.x + Math.cos(a) * d, z.pos.y + 6, z.pos.z + Math.sin(a) * d), 0xffffff, 2, 2, 0.8, 0.2, 10);
    } else if (z.kind === 'arrows') {
      for (let k = 0; k < 2; k++) {
        const a = Math.random() * 6.28, d = Math.random() * r;
        const x = z.pos.x + Math.cos(a) * d, zz = z.pos.z + Math.sin(a) * d, y = G.world.heightAt(x, zz);
        beam(_v.set(x, y + 10, zz), _v2.set(x, y, zz), 0xd8ffb0, 0.08, 0.12);
      }
    } else if (z.kind === 'blackhole') {
      const a = Math.random() * 6.28;
      particles(_v.set(z.pos.x + Math.cos(a) * r, z.pos.y + 1, z.pos.z + Math.sin(a) * r), 0xaa66ff, 1, 1, 0.5, 0.25, 0);
      z.mesh.children[1].rotation.y += dt * 4;
    } else if (z.kind === 'fire' && Math.random() < 0.3) {
      particles(_v.set(z.pos.x + (Math.random() - 0.5) * r, z.pos.y, z.pos.z + (Math.random() - 0.5) * r), 0xff6622, 1, 2, 0.5, 0.3, -2);
    } else if (z.kind === 'holy' && Math.random() < 0.5) {
      const a = Math.random() * 6.28, d = Math.random() * r;
      particles(_v.set(z.pos.x + Math.cos(a) * d, z.pos.y, z.pos.z + Math.sin(a) * d), 0xffe9a0, 1, 1.5, 0.8, 0.2, -3);
    } else if (z.kind === 'storm' && Math.random() < 0.4) {
      const a = Math.random() * 6.28, d = Math.random() * r;
      particles(_v.set(z.pos.x + Math.cos(a) * d, z.pos.y + 1 + Math.random() * 3, z.pos.z + Math.sin(a) * d), 0xfff08a, 1, 4, 0.2, 0.18, 0);
    } else if (z.kind === 'orbital') {
      z.mesh.children[1].material.opacity = 0.35 + Math.random() * 0.3;
      if (Math.random() < 0.6) particles(_v.set(z.pos.x + (Math.random() - 0.5) * r, z.pos.y, z.pos.z + (Math.random() - 0.5) * r), 0x88ddff, 2, 8, 0.4, 0.3);
    }
    const fade = Math.min(1, (z.duration - z.t) * 2);
    z.mesh.children[0].material.opacity = 0.22 * fade;
    if (z.t >= z.duration) {
      G.scene.remove(z.mesh);
      z.mesh.traverse((m) => m.material && m.material.dispose());
      if (z.mesh.userData.ownGeo) z.mesh.userData.ownGeo.dispose();
      zones.splice(i, 1);
    }
  }
}

// ------------------------------------------------------------------ timers
const timers = [];
export function after(delay, fn) {
  const slot = G.weaponSlot; // keep the weapon's bonuses for delayed hits
  timers.push({ t: delay, fn: slot ? () => (G.player ? G.player.withWeapon(slot, fn) : fn()) : fn });
}
function updateTimers(dt) {
  for (let i = timers.length - 1; i >= 0; i--) {
    const t = timers[i];
    t.t -= dt;
    if (t.t <= 0) {
      timers.splice(i, 1);
      try { t.fn(); } catch (err) { console.error(err); }
    }
  }
}

export function updateCombat(dt) {
  flushDamageStat(dt);
  updateTimers(dt);
  updateProjectiles(dt);
  updateZones(dt);
}

export function clearCombat() {
  while (projectiles.length) killProjectile(projectiles.length - 1);
  for (const z of zones) G.scene.remove(z.mesh);
  zones.length = 0;
  timers.length = 0;
}

export function projectileCount() {
  return projectiles.length;
}
