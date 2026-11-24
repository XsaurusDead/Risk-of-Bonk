// Enemy entities, AI behaviours (melee, ranged, flyer, swooper, charger,
// exploder, hopper, blinker, turret, tank, boss) and death/reward handling.
import * as THREE from 'three';
import { G } from '../core/state.js';
import { ENEMIES, BOSSES, ELITES } from '../data/enemies.js';
import { ITEMS } from '../data/items.js';
import { enemyGeometry, MAT } from './models.js';
import { spawnProjectile, damagePlayer, dealDamage, spawnZone, findTargets } from './combat.js';
import { particles, ring, telegraph, shake, floatText } from './fx.js';
import { dropCoins, dropXp, dropHeal } from './pickups.js';
import { sfx } from '../core/audio.js';
import { track } from '../core/save.js';
import { SpatialHash, rand, pick, shuffle, angleDiff, clamp } from '../core/util.js';

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const near = [];
const FROZEN = new THREE.Color(0x88ddff);
const FLASH = new THREE.Color(0xffffff);
const BURN = new THREE.Color(0xff5511);

export function initEnemies() {
  G.enemies = [];
  G.enemyHash = new SpatialHash(8);
}

export function spawnEnemy(id, pos, opts = {}) {
  const def = opts.boss ? BOSSES[id] : ENEMIES[id];
  if (!def) return null;
  const run = G.run;
  const diff = run.diff;
  const elite = opts.elite ? ELITES[opts.elite] : null;
  const loopMult = 1 + run.loop * 0.5;
  const hpMult = (opts.boss ? Math.pow(diff, 1.05) : diff) * loopMult * (elite ? elite.hpMult : 1);
  const dmgMult = Math.pow(diff, 0.72) * (1 + run.loop * 0.2) * (elite ? elite.dmgMult : 1);

  const { geo, glow } = enemyGeometry(id, def);
  const mat = MAT.vc.clone();
  const group = new THREE.Group();
  // fully-glowing models (e.g. wisps) use their glow geometry as the body
  const body = new THREE.Mesh(geo || glow, mat);
  body.castShadow = G.quality !== 'low' && (opts.boss || Math.random() < 0.5);
  group.add(body);
  if (glow && geo) group.add(new THREE.Mesh(glow, MAT.glow));
  if (!geo) mat.emissiveIntensity = 1;
  const scale = elite ? 1.25 : 1;
  group.scale.setScalar(scale);
  if (elite) mat.emissive = new THREE.Color(elite.color).multiplyScalar(0.35);
  G.scene.add(group);

  const e = {
    id, def, isBoss: !!opts.boss, elite, eliteId: opts.elite || null,
    pos: new THREE.Vector3(pos.x, 0, pos.z), vy: 0, knock: new THREE.Vector3(), yaw: Math.random() * 6.28,
    maxHp: def.hp * hpMult, hp: def.hp * hpMult, dmg: def.dmg * dmgMult,
    speed: def.speed * (elite ? 1.1 : 1), radius: def.radius, height: def.height, scale,
    mass: opts.boss ? 99 : Math.max(1, def.radius * def.radius * (elite ? 1.6 : 1)),
    flying: def.ai === 'flyer' || def.ai === 'swooper' || !!def.flying, hover: def.hover || 0,
    ai: def.ai, state: 'chase', t: 0, atkCd: rand(0.5, 2), aux: 0, auxDir: new THREE.Vector3(),
    status: { burnDps: 0, burnT: 0, burnAcc: 0, slow: 0, slowT: 0, chill: 0, freeze: 0, stun: 0 },
    flash: 0, shieldHp: 0, spawnT: opts.instant ? 0 : 0.6, dead: false, vulnT: 0, lastHitT: 99,
    mesh: group, mat, bob: Math.random() * 6.28, trailT: 0, patternQueue: [], enraged: false, hitPlayer: false,
  };
  if (elite?.shield) e.shieldHp = e.maxHp * elite.shield;
  const h = G.world.heightAt(e.pos.x, e.pos.z);
  e.pos.y = e.flying ? h + e.hover : h;
  if (opts.boss) {
    e.spawnT = 1.5;
    e.atkCd = 2.5;
  }
  group.position.copy(e.pos);
  G.enemies.push(e);
  particles(e.pos, elite ? elite.color : 0x553366, opts.boss ? 50 : 10, opts.boss ? 12 : 4, 0.8, opts.boss ? 0.8 : 0.35);
  return e;
}

export function clearEnemies() {
  for (const e of G.enemies) {
    G.scene.remove(e.mesh);
    e.mat.dispose();
  }
  G.enemies.length = 0;
}

// ------------------------------------------------------------------ death
export function killEnemy(e, o = {}) {
  if (e.dead) return;
  e.dead = true;
  e.hp = 0;
  const p = G.player;
  const run = G.run;
  const mult = e.elite ? 3 : 1;
  particles(_v.copy(e.pos).setY(e.pos.y + e.height * 0.4), e.elite ? e.elite.color : 0xffffff, e.isBoss ? 60 : 10, e.isBoss ? 14 : 6, 0.7, e.isBoss ? 0.8 : 0.4);
  if (!o.noReward) {
    dropCoins(e.pos, e.def.coins * run.coinScale * mult * (1 + Math.random() * 0.3));
    dropXp(e.pos, e.def.xp * run.xpScale * mult);
    if (Math.random() < (e.elite ? 0.25 : 0.03)) dropHeal(e.pos);
    track('kills');
    if (e.status.burnT > 0) track('burnKills');
    if (o.source === 'deploy') track('deployKills');
    if (e.elite) track('eliteKills');
    if (p && !p.dead) {
      try {
        if (p.char.passive.onKill) p.char.passive.onKill(e, p);
        for (const id in p.items) {
          const it = ITEMS[id];
          if (it.onKill) it.onKill(p.items[id], e);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }
  if (e.isBoss && run.onBossKilled) run.onBossKilled(e);
  e.deathT = 0.25;
}

// ------------------------------------------------------------------ update
export function updateEnemies(dt) {
  const hash = G.enemyHash;
  hash.clear();
  for (const e of G.enemies) if (!e.dead) hash.insert(e, e.pos.x, e.pos.z);

  const p = G.player;
  for (let i = G.enemies.length - 1; i >= 0; i--) {
    const e = G.enemies[i];
    if (e.dead) {
      e.deathT -= dt;
      const k = Math.max(0, e.deathT / 0.25);
      e.mesh.scale.setScalar(e.scale * k);
      if (e.deathT <= 0) {
        G.scene.remove(e.mesh);
        e.mat.dispose();
        G.enemies.splice(i, 1);
      }
      continue;
    }
    updateEnemy(e, dt, p);
  }
}

function groundY(e) {
  return G.world.heightAt(e.pos.x, e.pos.z);
}

function updateEnemy(e, dt, p) {
  const s = e.status;
  e.lastHitT += dt;
  // spawn-in
  if (e.spawnT > 0) {
    e.spawnT -= dt;
    const k = 1 - Math.max(0, e.spawnT) / (e.isBoss ? 1.5 : 0.6);
    e.mesh.position.set(e.pos.x, e.pos.y - (1 - k) * e.height * e.scale, e.pos.z);
    e.mesh.scale.setScalar(e.scale * (0.3 + 0.7 * k));
    if (e.isBoss && Math.random() < 0.5) particles(e.pos, 0xff3355, 2, 8, 0.6, 0.6);
    return;
  }
  // statuses
  if (s.burnT > 0) {
    s.burnT -= dt;
    s.burnAcc += dt;
    if (s.burnAcc >= 0.5) {
      s.burnAcc -= 0.5;
      dealDamage(e, s.burnDps * 0.5, { procCoef: 0, canCrit: false, color: '#ff8a3a', noHooks: true });
      if (e.dead) return;
      if (Math.random() < 0.7) particles(e.pos, 0xff6622, 2, 2, 0.4, 0.25, -3);
    }
  }
  if (s.slowT > 0) s.slowT -= dt;
  if (s.slowT <= 0) s.slow = 0;
  if (e.vulnT > 0) e.vulnT -= dt;
  const frozen = s.freeze > 0, stunned = s.stun > 0;
  if (frozen) s.freeze -= dt;
  if (stunned) s.stun -= dt;
  if (s.slowT <= 0) s.chill = 0;

  // knockback integration
  if (e.knock.lengthSq() > 0.01) {
    e.pos.addScaledVector(e.knock, dt * 6);
    e.knock.multiplyScalar(Math.max(0, 1 - dt * 6));
  }

  if (!frozen && !stunned && p) runAI(e, dt, p);
  else if (e.state !== 'chase' && e.state !== 'hover') {
    // interrupted
    e.state = e.flying ? 'chase' : 'chase';
    e.t = 0;
  }

  // separation
  G.enemyHash.query(e.pos.x, e.pos.z, e.radius * 2 + 2, near);
  for (const o of near) {
    if (o === e || o.dead) continue;
    const dx = e.pos.x - o.pos.x, dz = e.pos.z - o.pos.z;
    const min = (e.radius * e.scale + o.radius * o.scale) * 0.9;
    const d2 = dx * dx + dz * dz;
    if (d2 < min * min && d2 > 0.0001) {
      const d = Math.sqrt(d2);
      const push = ((min - d) / d) * 0.5 * (e.isBoss ? 0.1 : 1);
      e.pos.x += dx * push;
      e.pos.z += dz * push;
    }
  }
  // obstacles / bounds
  G.world.collide(e.pos, e.radius * e.scale * 0.8);
  G.world.clampBounds(e.pos);

  // vertical
  const gy = groundY(e);
  if (e.flying) {
    const target = gy + e.hover + Math.sin(e.bob += dt * 2) * 0.5;
    if (e.state !== 'dive') e.pos.y += (target - e.pos.y) * Math.min(1, dt * 2.5);
    if (e.pos.y < gy + 0.3) e.pos.y = gy + 0.3;
  } else {
    if (e.vy !== 0 || e.pos.y > gy + 0.05) {
      e.vy -= 30 * dt;
      e.pos.y += e.vy * dt;
      if (e.pos.y <= gy) {
        e.pos.y = gy;
        if (e.ai === 'hopper' && e.vy < -1) onHopLand(e, p);
        e.vy = 0;
      }
    } else e.pos.y = gy;
  }

  // elite trails
  if (e.elite?.trail === 'fire') {
    e.trailT -= dt;
    if (e.trailT <= 0 && !e.flying) {
      e.trailT = 1;
      const dmg = e.dmg * 0.25;
      spawnZone({
        pos: e.pos.clone(), radius: 2, duration: 3, tick: 0.5, color: 0xff5522, kind: 'fire', hostile: true,
        onTick: (z) => { if (G.player && G.player.pos.distanceTo(z.pos) < z.radius + 0.4 && G.player.pos.y - z.pos.y < 1.5) damagePlayer(dmg, null, { noThorns: true }); },
      });
    }
  }

  // visuals
  const m = e.mesh;
  m.position.copy(e.pos);
  m.rotation.y = e.yaw;
  let squash = 1;
  if (e.ai === 'hopper') squash = e.pos.y > gy + 0.1 ? 1.12 : 0.9 + 0.1 * Math.abs(Math.sin(e.bob));
  if (e.state === 'windup' || e.state === 'fuse') squash = 1 + Math.sin(e.t * 40) * 0.06;
  m.scale.set(e.scale, e.scale * squash, e.scale);
  if (e.flash > 0) e.flash -= dt;
  const em = e.mat.emissive;
  if (e.flash > 0) em.copy(FLASH).multiplyScalar(0.8);
  else if (frozen) em.copy(FROZEN).multiplyScalar(0.6);
  else if (e.state === 'fuse') em.copy(FLASH).multiplyScalar(Math.sin(e.t * 30) > 0 ? 0.8 : 0);
  else if (s.burnT > 0) em.copy(BURN).multiplyScalar(0.25 + Math.random() * 0.15);
  else if (e.elite) em.set(e.elite.color).multiplyScalar(0.35);
  else em.setRGB(0, 0, 0);
  if (stunned && Math.random() < 0.1) particles(_v.copy(e.pos).setY(e.pos.y + e.height * e.scale), 0xffff66, 1, 1, 0.4, 0.15, 0);
}

// ------------------------------------------------------------------ AI
function speedMult(e) {
  return (1 - e.status.slow) * (e.enraged ? 1.25 : 1);
}

function moveToward(e, tx, tz, dt, mult = 1) {
  const dx = tx - e.pos.x, dz = tz - e.pos.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.01) return d;
  const sp = e.speed * speedMult(e) * mult * dt;
  const step = Math.min(sp, d);
  e.pos.x += (dx / d) * step;
  e.pos.z += (dz / d) * step;
  faceDir(e, dx, dz, dt);
  return d;
}
function faceDir(e, dx, dz, dt, rate = 8) {
  const target = Math.atan2(dx, dz);
  e.yaw += angleDiff(e.yaw, target) * Math.min(1, dt * rate);
}
function facePlayer(e, p, dt) {
  faceDir(e, p.pos.x - e.pos.x, p.pos.z - e.pos.z, dt, 10);
}

function hitPlayerMelee(e, p, range, mult = 1) {
  const d = Math.hypot(p.pos.x - e.pos.x, p.pos.z - e.pos.z);
  if (d < range && Math.abs(p.pos.y - e.pos.y) < 2.5 + e.height * e.scale * 0.5) {
    damagePlayer(e.dmg * mult, e, enemyStatus(e));
    return true;
  }
  return false;
}
function enemyStatus(e) {
  const st = {};
  if (e.def.burnOnHit) st.burn = e.dmg * 0.1;
  if (e.def.slowOnHit || e.elite?.slowOnHit) st.slow = 0.4;
  if (e.elite?.leech) st.leech = e;
  return { status: st };
}

function fireAt(e, p, opts = {}) {
  const from = _v.set(e.pos.x, e.pos.y + e.height * e.scale * 0.6, e.pos.z).clone();
  const target = _v2.set(p.pos.x, p.pos.y + 1, p.pos.z);
  const speed = opts.speed || e.def.projSpeed || 22;
  // lead the target a little
  const t = from.distanceTo(target) / speed;
  target.x += p.vel.x * t * 0.5;
  target.z += p.vel.z * t * 0.5;
  const dir = target.clone().sub(from).normalize();
  const count = opts.count || e.def.projCount || 1;
  for (let i = 0; i < count; i++) {
    const d = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), (i - (count - 1) / 2) * (opts.spread ?? 0.18));
    spawnProjectile({
      pos: from, dir: d, speed, damage: e.dmg * (opts.mult || 1), owner: 'enemy', color: e.def.projColor || 0xff5555,
      size: opts.size || (e.isBoss ? 0.7 : 0.4), life: 5, attacker: e, homing: opts.homing || 0, ...enemyStatus(e),
    });
  }
}

function runAI(e, dt, p) {
  const dx = p.pos.x - e.pos.x, dz = p.pos.z - e.pos.z;
  const dist = Math.hypot(dx, dz);
  e.t += dt;
  e.atkCd -= dt;
  const reach = e.radius * e.scale + 0.6;
  const hidden = p.stealthT > 0 || p.dead;

  if (hidden && !e.isBoss) {
    // lost track of the player: wander
    if (e.t > 2 || e.state !== 'wander') {
      e.state = 'wander';
      e.t = 0;
      e.auxDir.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
    }
    moveToward(e, e.pos.x + e.auxDir.x * 5, e.pos.z + e.auxDir.z * 5, dt, 0.4);
    return;
  }
  if (e.state === 'wander') e.state = 'chase';

  switch (e.ai) {
    case 'melee':
    case 'tank':
    case 'blinker': {
      const range = (e.def.attackRange || 1.8) + reach;
      if (e.state === 'chase') {
        if (dist > range * 0.8) moveToward(e, p.pos.x, p.pos.z, dt);
        else facePlayer(e, p, dt);
        if (e.ai === 'blinker' && e.atkCd <= 0 && dist > 9) {
          // teleport near the player
          particles(e.pos, 0x8844aa, 10, 4, 0.5);
          const a = Math.random() * Math.PI * 2;
          e.pos.set(p.pos.x + Math.cos(a) * 3.5, 0, p.pos.z + Math.sin(a) * 3.5);
          e.pos.y = groundY(e);
          particles(e.pos, 0x8844aa, 10, 4, 0.5);
          e.state = 'windup';
          e.t = 0;
          e.atkCd = e.def.blinkCd || 4;
          break;
        }
        if (dist < range && e.atkCd <= 0) {
          e.state = 'windup';
          e.t = 0;
          if (e.ai === 'tank') telegraph(e.pos.clone().add(_v.set(Math.sin(e.yaw), 0, Math.cos(e.yaw)).multiplyScalar(2)), e.def.slamRadius, 0xff4433, 0.9);
        }
      } else if (e.state === 'windup') {
        facePlayer(e, p, dt * 0.5);
        const wind = e.ai === 'tank' ? 0.9 : 0.45;
        if (e.t >= wind) {
          if (e.ai === 'tank') {
            const c = e.pos.clone().add(_v.set(Math.sin(e.yaw), 0, Math.cos(e.yaw)).multiplyScalar(2));
            ring(c, e.def.slamRadius, 0xffaa66, 0.3);
            particles(c, 0x998877, 14, 6, 0.5, 0.5);
            if (p.pos.distanceTo(c) < e.def.slamRadius + 0.5) damagePlayer(e.dmg, e, enemyStatus(e));
            shake(0.15);
            sfx('boom', 0.1);
          } else hitPlayerMelee(e, p, range + 0.6);
          e.state = 'recover';
          e.t = 0;
          e.atkCd = e.ai === 'tank' ? 2.2 : 1.3;
        }
      } else if (e.state === 'recover') {
        if (e.t > 0.35) { e.state = 'chase'; e.t = 0; }
      }
      break;
    }
    case 'ranged':
    case 'flyer':
    case 'turret': {
      const range = e.def.range || 22;
      if (e.state === 'chase') {
        if (e.ai === 'turret') {
          if (dist > range * 0.9) moveToward(e, p.pos.x, p.pos.z, dt);
          else facePlayer(e, p, dt);
        } else if (dist > range * 0.85) moveToward(e, p.pos.x, p.pos.z, dt);
        else if (dist < range * 0.35) moveToward(e, e.pos.x - dx, e.pos.z - dz, dt, 0.8);
        else {
          // strafe
          e.aux += dt;
          const side = Math.sin(e.aux * 0.7 + e.bob) > 0 ? 1 : -1;
          moveToward(e, e.pos.x - dz * side, e.pos.z + dx * side, dt, 0.5);
          facePlayer(e, p, dt);
        }
        if (dist < range && e.atkCd <= 0) {
          e.state = 'windup';
          e.t = 0;
          e.aux2 = e.def.burst || 1;
        }
      } else if (e.state === 'windup') {
        facePlayer(e, p, dt);
        if (e.t >= 0.55) {
          fireAt(e, p);
          e.aux2--;
          if (e.aux2 > 0) e.t = 0.4;
          else {
            e.state = 'chase';
            e.t = 0;
            e.atkCd = rand(2, 3);
          }
        }
      }
      break;
    }
    case 'swooper': {
      if (e.state === 'chase') {
        if (dist > 10) moveToward(e, p.pos.x, p.pos.z, dt);
        else {
          e.aux += dt;
          moveToward(e, e.pos.x - dz, e.pos.z + dx, dt, 0.6);
        }
        if (dist < 16 && e.atkCd <= 0) {
          e.state = 'dive';
          e.t = 0;
          e.hitPlayer = false;
          e.auxDir.set(p.pos.x - e.pos.x, p.pos.y + 1 - e.pos.y, p.pos.z - e.pos.z).normalize();
        }
      } else if (e.state === 'dive') {
        const sp = 22 * speedMult(e) * dt;
        e.pos.addScaledVector(e.auxDir, sp);
        faceDir(e, e.auxDir.x, e.auxDir.z, dt, 20);
        if (!e.hitPlayer && e.pos.distanceTo(_v.copy(p.pos).setY(p.pos.y + 1)) < 1.6) {
          damagePlayer(e.dmg, e, enemyStatus(e));
          e.hitPlayer = true;
        }
        if (e.t > 0.9) {
          e.state = 'chase';
          e.t = 0;
          e.atkCd = rand(2, 3.5);
        }
      }
      break;
    }
    case 'charger': {
      if (e.state === 'chase') {
        moveToward(e, p.pos.x, p.pos.z, dt);
        if (dist < (e.def.chargeRange || 16) && dist > 4 && e.atkCd <= 0) {
          e.state = 'windup';
          e.t = 0;
        } else if (dist < 3 && e.atkCd <= 0) {
          hitPlayerMelee(e, p, reach + 2);
          e.atkCd = 1.5;
        }
      } else if (e.state === 'windup') {
        facePlayer(e, p, dt);
        if (Math.random() < 0.3) particles(e.pos, 0xbbaa88, 1, 3, 0.4, 0.3);
        if (e.t > 0.7) {
          e.state = 'charge';
          e.t = 0;
          e.hitPlayer = false;
          e.auxDir.set(Math.sin(e.yaw), 0, Math.cos(e.yaw));
        }
      } else if (e.state === 'charge') {
        e.pos.addScaledVector(e.auxDir, (e.def.chargeSpeed || 24) * speedMult(e) * dt);
        if (!e.hitPlayer && hitPlayerMelee(e, p, reach + 0.8, 1.3)) {
          e.hitPlayer = true;
          p.knockback(e.auxDir, 14);
        }
        if (e.t > 0.85) {
          e.state = 'recover';
          e.t = 0;
          e.atkCd = 3;
        }
      } else if (e.state === 'recover' && e.t > 0.8) e.state = 'chase';
      break;
    }
    case 'exploder': {
      if (e.state === 'chase') {
        moveToward(e, p.pos.x, p.pos.z, dt);
        if (dist < 2.6 + reach) {
          e.state = 'fuse';
          e.t = 0;
          telegraph(e.pos.clone(), e.def.blastRadius, 0xff3333, 0.75);
        }
      } else if (e.state === 'fuse') {
        if (e.t > 0.75) {
          ring(e.pos, e.def.blastRadius, 0xff7733, 0.4);
          particles(e.pos, e.def.model[1]?.[1] || 0xff7733, 24, 9, 0.6, 0.5);
          sfx('boom', 0.08);
          if (p.pos.distanceTo(e.pos) < e.def.blastRadius + 0.5) damagePlayer(e.dmg, e, enemyStatus(e));
          killEnemy(e, { noReward: true });
        }
      }
      break;
    }
    case 'hopper': {
      if (e.pos.y <= groundY(e) + 0.05) {
        e.aux -= dt;
        if (e.aux <= 0) {
          e.vy = rand(9, 12);
          e.pos.y += 0.1;
          e.auxDir.set(dx, 0, dz).normalize();
          e.aux = rand(0.9, 1.4);
        }
        facePlayer(e, p, dt);
      } else {
        e.pos.addScaledVector(e.auxDir, e.speed * 1.6 * speedMult(e) * dt);
      }
      break;
    }
    case 'boss':
      bossAI(e, dt, p, dist, dx, dz);
      break;
  }
}

function onHopLand(e, p) {
  particles(e.pos, 0xffffff, 4, 3, 0.3, 0.25);
  if (!p || p.dead) return;
  const range = (e.def.attackRange || 1.8) + e.radius * e.scale;
  if (e.atkCd <= 0 && hitPlayerMelee(e, p, range + 0.5)) e.atkCd = 1.0;
}

// ------------------------------------------------------------------ bosses
function bossAI(e, dt, p, dist, dx, dz) {
  if (!e.enraged && e.hp < e.maxHp * 0.5) {
    e.enraged = true;
    floatText(e.pos.clone().setY(e.pos.y + e.height), 'ENRAGED!', '#ff3355', true);
    sfx('roar');
  }
  const cdMult = e.enraged ? 0.65 : 1;
  if (e.state === 'chase') {
    const want = e.flying ? 14 : 7;
    if (dist > want) moveToward(e, p.pos.x, p.pos.z, dt);
    else facePlayer(e, p, dt);
    if (e.atkCd <= 0) {
      if (!e.patternQueue.length) e.patternQueue = shuffle([...e.def.patterns]);
      e.pattern = e.patternQueue.pop();
      e.state = 'attack';
      e.t = 0;
      e.aux = 0;
      e.aux2 = 0;
      startPattern(e, p);
    }
    return;
  }
  // attack in progress
  const done = runPattern(e, dt, p, dist);
  if (done) {
    e.state = 'chase';
    e.t = 0;
    e.atkCd = rand(1.2, 2.2) * cdMult;
  }
}

function startPattern(e, p) {
  const def = e.def;
  switch (e.pattern) {
    case 'slam':
      e.slamR = 10;
      telegraph(e.pos.clone(), e.slamR, 0xff3333, 1.1);
      break;
    case 'charge':
      e.auxDir.set(p.pos.x - e.pos.x, 0, p.pos.z - e.pos.z).normalize();
      e.hitPlayer = false;
      for (let i = 1; i <= 6; i++) telegraph(e.pos.clone().addScaledVector(e.auxDir, i * 4.5), e.radius, 0xff3333, 0.8);
      break;
    case 'rain':
      e.rainPts = [];
      for (let i = 0; i < (e.enraged ? 9 : 6); i++) {
        const pt = p.pos.clone().add(_v.set(rand(-7, 7), 0, rand(-7, 7)));
        if (i === 0) pt.copy(p.pos);
        pt.y = G.world.heightAt(pt.x, pt.z);
        e.rainPts.push(pt);
        telegraph(pt, 4, 0xff3333, 1.2);
      }
      break;
    case 'summon':
      ring(e.pos, 8, 0xff3355, 0.6);
      sfx('roar');
      break;
  }
}

function runPattern(e, dt, p, dist) {
  const def = e.def;
  switch (e.pattern) {
    case 'slam':
      if (e.t >= 1.1) {
        ring(e.pos, e.slamR, 0xffaa66, 0.5);
        particles(e.pos, 0x998877, 40, 12, 0.8, 0.7);
        shake(0.6);
        sfx('bigboom');
        if (Math.hypot(p.pos.x - e.pos.x, p.pos.z - e.pos.z) < e.slamR && p.pos.y - e.pos.y < 3) {
          damagePlayer(e.dmg * 1.6, e, enemyStatus(e));
          p.knockback(_v.set(p.pos.x - e.pos.x, 0, p.pos.z - e.pos.z).normalize(), 16);
        }
        return true;
      }
      return false;
    case 'burst': {
      const waves = e.enraged ? 4 : 3;
      e.aux -= dt;
      if (e.aux <= 0 && e.aux2 < waves) {
        e.aux = 0.45;
        const n = 16;
        const from = e.pos.clone().setY(e.pos.y + e.height * 0.45);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + e.aux2 * 0.2;
          spawnProjectile({ pos: from, dir: { x: Math.cos(a), y: 0, z: Math.sin(a) }, speed: 15, damage: e.dmg * 0.7, owner: 'enemy', color: def.projColor, size: 0.6, life: 6, attacker: e, ...enemyStatus(e) });
        }
        e.aux2++;
        sfx('shoot');
      }
      return e.aux2 >= waves && e.t > 0.3;
    }
    case 'spin': {
      e.aux -= dt;
      if (e.aux <= 0) {
        e.aux = 0.08;
        const from = e.pos.clone().setY(e.pos.y + e.height * 0.45);
        for (let k = 0; k < 3; k++) {
          const a = e.t * 3 + (k * Math.PI * 2) / 3;
          spawnProjectile({ pos: from, dir: { x: Math.cos(a), y: 0, z: Math.sin(a) }, speed: 16, damage: e.dmg * 0.5, owner: 'enemy', color: def.projColor, size: 0.5, life: 5, attacker: e });
        }
      }
      return e.t > 2.5;
    }
    case 'volley': {
      e.aux -= dt;
      if (e.aux <= 0 && e.aux2 < 3) {
        e.aux = 0.5;
        fireAt(e, p, { count: e.enraged ? 7 : 5, spread: 0.14, mult: 0.8, speed: 26 });
        e.aux2++;
        sfx('shoot');
      }
      facePlayer(e, p, dt);
      return e.aux2 >= 3 && e.t > 1.2;
    }
    case 'summon': {
      if (e.t > 0.6 && !e.aux2) {
        e.aux2 = 1;
        const n = 3 + Math.min(4, G.run.loop * 2 + (e.enraged ? 2 : 0));
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const pos = e.pos.clone().add(_v.set(Math.cos(a) * 6, 0, Math.sin(a) * 6));
          spawnEnemy(def.summon, pos, {});
        }
      }
      return e.t > 1.2;
    }
    case 'charge': {
      if (e.t < 0.8) {
        faceDir(e, e.auxDir.x, e.auxDir.z, dt, 20);
        return false;
      }
      e.pos.addScaledVector(e.auxDir, 30 * dt);
      if (Math.random() < 0.5) particles(e.pos, 0xaa9977, 2, 4, 0.4, 0.5);
      if (!e.hitPlayer && Math.hypot(p.pos.x - e.pos.x, p.pos.z - e.pos.z) < e.radius + 1.2 && Math.abs(p.pos.y - e.pos.y) < e.height) {
        e.hitPlayer = true;
        damagePlayer(e.dmg * 1.4, e, enemyStatus(e));
        p.knockback(e.auxDir, 20);
      }
      return e.t > 1.75;
    }
    case 'rain': {
      if (e.t >= 1.2 && !e.aux2) {
        e.aux2 = 1;
        for (const pt of e.rainPts) {
          particles(pt, def.projColor, 14, 8, 0.6, 0.45);
          ring(pt, 4, def.projColor, 0.35);
          if (Math.hypot(p.pos.x - pt.x, p.pos.z - pt.z) < 4 && p.pos.y - pt.y < 3) damagePlayer(e.dmg * 1.1, e, enemyStatus(e));
        }
        sfx('boom');
        shake(0.25);
      }
      return e.t > 1.5;
    }
  }
  return true;
}

export function aliveCount() {
  let n = 0;
  for (const e of G.enemies) if (!e.dead) n++;
  return n;
}
