// Enemy entities, AI behaviours (melee, ranged, flyer, swooper, charger,
// exploder, hopper, blinker, turret, tank, boss) and death/reward handling.
import * as THREE from 'three';
import { G } from '../core/state.js';
import { ENEMIES, BOSSES, ELITES } from '../data/enemies.js';
import { ITEMS } from '../data/items.js';
import { enemyGeometry, MAT } from './models.js';
import { skinTexture } from './textures.js';
import { spawnProjectile, damagePlayer, dealDamage, spawnZone, findTargets } from './combat.js';
import { particles, ring, telegraph, shake, floatText, gibs } from './fx.js';
import { addRimLight } from './models.js';
import { buildEnemyModel, playAnim } from './enemymodels.js';
import { dropCoins, dropXp, dropHeal, dropItem, rollItem, rollRarity, dropPowerup, enemyTimeScale } from './pickups.js';

// power-up drop chances per kill (elites x8, champions/bosses always drop one)
const POWERUP_DROP = { magnet: 0.006, slowmo: 0.004 };
import { attachGlyph } from './glyphs.js';

export const ELITE_ITEM_CHANCE = 0.05; // random item, rarity rolled like a small chest (legendary rarest, luck helps)
export const ELITE_CHEST_CHANCE = 0.01; // a free chest of a random tier
import { sfx } from '../core/audio.js';
import { track } from '../core/save.js';
import { SpatialHash, rand, pick, shuffle, angleDiff, clamp } from '../core/util.js';

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const near = [];
const FROZEN = new THREE.Color(0x88ddff);
const FLASH = new THREE.Color(0xffffff);
const BURN = new THREE.Color(0xff5511);
const JELLY = new Set(['slime', 'snow_slime', 'sporeling', 'void_bomber', 'spore_mother']);

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
  const champ = !!opts.champion;
  const ot = opts.otMult || 1; // overtime scaling (after the 10 minute mark)
  // Normal play: time-based difficulty with a gentle nudge from the player's build.
  // Overtime (ot > 1) uses the old, brutal curve that follows the player's DPS and HP.
  const hard = ot > 1;
  const d = hard ? run.diffHard || diff : diff;
  const hpScale = (hard ? run.hpScaleHard : run.hpScale) || 1, dmgScale = (hard ? run.dmgScaleHard : run.dmgScale) || 1;
  const bossHp = opts.boss ? (hard ? Math.pow(d, 0.08) : 1.5) : 1; // portal bosses: a real fight, not a wall
  const champHp = champ ? (hard ? 32 : 10) : 1;
  const hpMult = d * bossHp * loopMult * (elite ? elite.hpMult : 1) * champHp * ot * hpScale;
  // the first minutes of a run (stage 1, first loop) hit softer: 45% -> 100% over 5 minutes
  const warmup = hard || run.stagesCleared || run.loop ? 1 : 0.45 + 0.55 * Math.min(1, run.time / 300);
  const dmgMult = warmup * Math.pow(d, hard ? 0.8 : 0.7) * (1 + run.loop * 0.25) * (elite ? elite.dmgMult : 1) * (champ ? (hard ? 2.4 : 1.8) : 1) * Math.pow(ot, 0.9) * dmgScale;

  // animated GLB model if there is one (and it's loaded), else the procedural model
  const glb = def.glb ? buildEnemyModel(def.glb, def.height) : null;
  const { geo, glow, roles } = glb ? { geo: null, glow: null, roles: [] } : enemyGeometry(id, def);
  const mat = glb ? glb.mat : MAT.vc.clone();
  if (def.skin && !glb) {
    mat.map = skinTexture(def.skin);
    if (MAT.high) {
      mat.bumpMap = mat.map;
      mat.bumpScale = 1.2;
    }
    mat.needsUpdate = true;
  }
  // rim light makes enemies pop off the background; colour hints at elites/champions
  const rimCol = elite ? elite.color : champ ? 0xffcc55 : opts.boss ? 0xff5577 : 0xfff1dd;
  // textured (GLB) models keep their own look: just a faint rim
  addRimLight(mat, rimCol, glb ? 0.3 : elite || champ || opts.boss ? 0.9 : 0.45);
  // a little individual variety in tint
  if (!opts.boss) mat.color.setRGB(0.9 + Math.random() * 0.2, 0.9 + Math.random() * 0.2, 0.9 + Math.random() * 0.2);
  const group = new THREE.Group();
  // fully-glowing models (e.g. wisps) use their glow geometry as the body
  const body = glb ? glb.group : new THREE.Mesh(geo || glow, mat);
  body.castShadow = G.quality !== 'low' && (opts.boss || Math.random() < 0.5);
  group.add(body);
  if (glow && geo) group.add(new THREE.Mesh(glow, MAT.glow));
  if (!geo && !glb) mat.emissiveIntensity = 1;
  // animatable rig parts, each hinged at its pivot
  const rig = {};
  for (const r of roles) {
    const node = new THREE.Group();
    node.position.set(r.pivot[0], r.pivot[1], r.pivot[2]);
    node.rotation.order = 'YXZ';
    if (r.geo) {
      const m = new THREE.Mesh(r.geo, mat);
      m.castShadow = body.castShadow;
      node.add(m);
    }
    if (r.glow) node.add(new THREE.Mesh(r.glow, MAT.glow));
    group.add(node);
    rig[r.role] = node;
  }
  const scale = (elite && !champ ? 1.5 : elite ? 1.15 : 1) * (champ ? 2.1 : 1) * (opts.boss ? 1 : 0.92 + Math.random() * 0.16);
  group.scale.setScalar(scale);
  group.rotation.order = 'YXZ';
  if (elite) mat.emissive = new THREE.Color(elite.color).multiplyScalar(0.35);
  if (champ) mat.emissive = new THREE.Color(0xffaa22).multiplyScalar(0.3);
  G.scene.add(group);

  const e = {
    id, def, isBoss: !!opts.boss, elite, eliteId: opts.elite || null,
    pos: new THREE.Vector3(pos.x, 0, pos.z), vy: 0, knock: new THREE.Vector3(), yaw: Math.random() * 6.28,
    maxHp: def.hp * hpMult, hp: def.hp * hpMult, dmg: def.dmg * dmgMult,
    speed: def.speed * (elite ? 1.1 : 1), radius: def.radius, height: def.height, scale,
    mass: opts.boss ? 99 : Math.max(1, def.radius * def.radius * (elite ? 1.6 : 1)),
    flying: def.ai === 'flyer' || def.ai === 'swooper' || !!def.flying, hover: def.hover || 0,
    ai: def.ai, state: 'chase', t: 0, atkCd: rand(0.5, 2), aux: 0, auxDir: new THREE.Vector3(),
    status: { burnDps: 0, burnT: 0, burnAcc: 0, slow: 0, slowT: 0, chill: 0, freeze: 0, stun: 0, poison: 0, poisonT: 0, poisonAcc: 0 },
    flash: 0, shieldHp: 0, spawnT: opts.instant ? 0 : 0.6, dead: false, vulnT: 0, lastHitT: 99,
    mesh: group, mat, bob: Math.random() * 6.28, trailT: 0, patternQueue: [], enraged: false, hitPlayer: false,
    // spring-driven squash/stretch and flinch tilt (see updateSprings)
    sq: 0, sqv: 0, tilt: 0, tiltv: 0, walkPh: Math.random() * 6, lastX: pos.x, lastZ: pos.z, bank: 0, pitch: 0,
    jelly: JELLY.has(id) || def.ai === 'hopper', bodyColor: def.model[0][1],
    rig: roles.length ? rig : null, animT: Math.random() * 10, armX: 0, champion: champ, overtime: ot > 1,
    anim: glb ? glb.anim : null, introT: glb && opts.boss ? 2.4 : 0,
    mv: new THREE.Vector3(), wantX: 0, wantZ: 0, breathe: Math.random() * 6,
  };
  if (champ) {
    e.mass = 40;
    e.speed *= 0.9;
  }
  if (elite?.shield) e.shieldHp = e.maxHp * elite.shield;
  if (elite && !champ && !opts.boss) {
    // small animated rune floating above the head marks an elite
    e.marker = attachGlyph(group, elite.glyph || 'A', 17, 1.3, def.height + 0.3, { owner: e });
  }
  const h = G.world.heightAt(e.pos.x, e.pos.z);
  e.pos.y = e.flying ? h + e.hover : h;
  if (opts.boss) {
    e.spawnT = 1.5;
    e.atkCd = 2.5;
  }
  if (e.anim) {
    playAnim(e.anim, 'idle', { fade: 0 }); // never show the rig's T-pose
    e.anim.mixer.update(0);
  }
  group.position.copy(e.pos);
  G.enemies.push(e);
  particles(e.pos, elite ? elite.color : 0x553366, opts.boss ? 50 : 10, opts.boss ? 12 : 4, 0.8, opts.boss ? 0.8 : 0.35);
  // summoning circle so close spawns are readable
  if (!opts.instant) telegraph(e.pos.clone().setY(G.world.heightAt(e.pos.x, e.pos.z)), e.radius * e.scale * 1.8, elite ? elite.color : opts.boss ? 0xff3355 : 0x9a5aff, e.spawnT);
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
/** Elite drops: 5% a random item, 1% a free chest. */
function eliteLoot(e) {
  if (Math.random() < ELITE_ITEM_CHANCE) {
    const it = rollItem(rollRarity('small'));
    if (it) dropItem(e.pos.clone().setY(e.pos.y + 1.5), it);
  }
  if (Math.random() < ELITE_CHEST_CHANCE && G.world?.spawnChest) {
    const c = G.world.spawnChest(e.pos.clone(), G.world.rollChestTier(1), true);
    if (c) {
      ring(c.pos, 3, 0xffd27a, 0.6);
      particles(c.pos.clone().setY(c.pos.y + 1), 0xffd27a, 30, 7, 0.9, 0.4);
      floatText(c.pos.clone().setY(c.pos.y + 2.5), 'FREE CHEST!', '#ffd27a', true);
      sfx('chest');
    }
  }
}

export function killEnemy(e, o = {}) {
  if (e.dead) return;
  e.dead = true;
  e.hp = 0;
  const p = G.player;
  const run = G.run;
  const mult = e.elite ? 4 : 1;
  particles(_v.copy(e.pos).setY(e.pos.y + e.height * 0.4), e.elite ? e.elite.color : 0xffffff, e.isBoss ? 60 : 10, e.isBoss ? 14 : 6, 0.7, e.isBoss ? 0.8 : 0.4);
  if (!o.noReward) {
    dropCoins(e.pos, e.def.coins * 0.6 * run.coinScale * mult * (e.champion ? 6 : 1) * (1 + Math.random() * 0.3));
    dropXp(e.pos, e.def.xp * run.xpScale * mult);
    if (Math.random() < (e.elite ? 0.25 : 0.03)) dropHeal(e.pos);
    track('kills');
    track(e.isBoss ? 'boss_' + e.id : 'kill_' + e.id);
    if (p) {
      p.stageKills++;
      p.lastKillT = 0;
    }
    if (e.status.burnT > 0) track('burnKills');
    if (e.status.poisonT > 0) track('poisonKills');
    if (o.source === 'deploy') track('deployKills');
    if (e.elite) {
      track('eliteKills');
      if (!e.isBoss && !e.champion) eliteLoot(e);
    }
    // power-ups
    const up = e.isBoss || e.champion ? 1 : e.elite ? 8 : 1;
    if (e.isBoss || e.champion) dropPowerup(e.pos.clone().setY(e.pos.y + 1.5), Math.random() < 0.6 ? 'magnet' : 'slowmo');
    else if (Math.random() < POWERUP_DROP.magnet * up) dropPowerup(e.pos.clone().setY(e.pos.y + 1.2), 'magnet');
    else if (Math.random() < POWERUP_DROP.slowmo * up) dropPowerup(e.pos.clone().setY(e.pos.y + 1.2), 'slowmo');
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
  if (e.champion && run.onChampionKilled) run.onChampionKilled(e);

  // death physics: get flung away from the player, tumble, bounce, then shrink away
  const away = _v2.copy(e.pos).sub(p ? p.pos : e.pos).setY(0);
  if (away.lengthSq() < 0.01) away.set(Math.random() - 0.5, 0, Math.random() - 0.5);
  away.normalize();
  const heavy = Math.pow(e.mass, 0.35);
  e.deathMax = e.isBoss ? 1.8 : o.noReward ? 0.18 : 0.9;
  e.deathT = e.deathMax;
  e.dvel = e.isBoss || o.noReward ? new THREE.Vector3(0, e.isBoss ? 2 : 0, 0) : away.multiplyScalar(7 / heavy).setY((6 + Math.random() * 3) / heavy);
  e.dspin = (e.isBoss ? 0.8 : 5 + Math.random() * 6) * (Math.random() < 0.5 ? -1 : 1);
  e.drot = 0;
  e.flash = 0.15;
  if (!o.noReward) {
    const n = Math.min(16, Math.round(5 + e.radius * e.scale * 3 + (e.isBoss ? 20 : 0)));
    gibs(e.pos, e.bodyColor, n, e.isBoss ? 12 : 7, Math.min(0.7, 0.22 + e.radius * 0.12));
    if (e.jelly) particles(_v.copy(e.pos).setY(e.pos.y + 0.4), e.bodyColor, 12, 6, 0.7, 0.3, 20);
  }
}

/** Skeletal (GLB) animation: pick the clip from what the enemy is doing. */
function animateModel(e, dt, moved, held) {
  const a = e.anim;
  if (held) return; // frozen / stunned: keep the pose
  let st, o = {};
  if (e.introT > 0) {
    e.introT -= dt;
    st = 'roar';
    o = { once: true };
  } else if (e.state === 'attack') {
    switch (e.pattern) {
      case 'slam': // leap: the landing (2.2 s into the clip) lines up with the impact
        st = 'leap';
        o = { once: true, timeScale: 2.2 / (e.def.slamT || 1.1), fade: 0.1 };
        break;
      case 'charge':
        st = e.t < 0.8 ? 'idle' : 'run';
        o = { timeScale: e.t < 0.8 ? 2.5 : 1.8, fade: 0.12 };
        break;
      default: // roars for rock rain, shockwaves, volleys and summons
        st = 'roar';
        o = { once: true, timeScale: 1.1 };
    }
  } else {
    const sp = moved / Math.max(dt, 1e-4);
    st = sp > 6.5 ? 'run' : sp > 0.4 ? 'walk' : 'idle';
    if (st === 'walk') o.timeScale = Math.max(0.6, sp / 4.5);
    if (st === 'run') o.timeScale = Math.max(0.8, sp / 9);
  }
  playAnim(a, st, o);
  a.mixer.update(dt);
}

/** Procedural limb animation: walk cycles, arm swings & attacks, wing flaps, tails, heads. */
function animateRig(e, dt, amt, held) {
  if (held) return; // frozen/stunned enemies keep their pose
  const r = e.rig;
  e.animT += dt;
  const t = e.animT;
  const ph = e.walkPh;
  const walk = Math.sin(ph) * 0.7 * amt;
  const k = Math.min(1, dt * 12);
  if (r.legL) r.legL.rotation.x = walk;
  if (r.legR) r.legR.rotation.x = -walk;
  if (r.legFL) r.legFL.rotation.x = walk;
  if (r.legBR) r.legBR.rotation.x = walk;
  if (r.legFR) r.legFR.rotation.x = -walk;
  if (r.legBL) r.legBL.rotation.x = -walk;
  if (r.legs) r.legs.rotation.z = Math.sin(ph * 2) * 0.12 * amt;
  // arms: swing while walking, raise on wind-up, slam on release
  let armTarget = -walk * 0.7;
  if (e.state === 'windup' || (e.state === 'attack' && e.t < 0.6)) armTarget = -2.2;
  else if (e.state === 'recover' || e.state === 'attack') armTarget = 0.5;
  e.armX += (armTarget - e.armX) * k;
  if (r.armL) r.armL.rotation.x = e.armX + (amt > 0.1 ? walk * 0.3 : Math.sin(t * 1.6) * 0.05);
  if (r.armR) r.armR.rotation.x = e.state === 'chase' ? -e.armX * 0.6 + (e.ai === 'ranged' ? -0.3 : 0) : e.armX;
  if (r.wingL) r.wingL.rotation.z = Math.sin(t * (e.isBoss ? 4 : 14)) * 0.55 + 0.1;
  if (r.wingR) r.wingR.rotation.z = -Math.sin(t * (e.isBoss ? 4 : 14)) * 0.55 - 0.1;
  if (r.tail) {
    r.tail.rotation.y = Math.sin(t * 3) * 0.3;
    r.tail.rotation.x = e.state === 'windup' || e.state === 'attack' ? -0.5 : Math.sin(t * 2) * 0.08;
  }
  const snap = e.state === 'windup' || e.state === 'attack' ? 1 : 0.25;
  if (r.clawL) r.clawL.rotation.y = Math.sin(t * 7) * 0.25 * snap + 0.1;
  if (r.clawR) r.clawR.rotation.y = -Math.sin(t * 7) * 0.25 * snap - 0.1;
  if (r.neck) r.neck.rotation.z = Math.sin(t * 2.5) * 0.15;
  if (r.head) {
    r.head.rotation.x = Math.sin(t * 2.2) * 0.06 + (e.state === 'windup' ? -0.25 : 0);
    r.head.rotation.y = Math.sin(t * 0.9) * 0.15;
    if (e.jelly) r.head.rotation.z = Math.sin(t * 5) * 0.08;
  }
}

/** Called by dealDamage: squish + flinch the enemy a bit. */
export function hitReact(e, frac, strong) {
  const j = e.jelly ? 2 : 1;
  e.sqv -= (1.5 + Math.min(6, frac * 30)) * j * (e.isBoss ? 0.4 : 1);
  e.tiltv -= (2 + Math.min(6, frac * 25)) * (e.isBoss ? 0.25 : 1);
  if (strong && !e.isBoss && !e.flying && e.pos.y <= groundY(e) + 0.1) e.vy = Math.max(e.vy, 4.5 / Math.sqrt(e.mass));
}

function updateSprings(e, dt) {
  const k = e.jelly ? 120 : 260, c = e.jelly ? 5 : 16;
  e.sqv += (-k * e.sq - c * e.sqv) * dt;
  e.sq = Math.max(-0.5, Math.min(0.6, e.sq + e.sqv * dt));
  e.tiltv += (-140 * e.tilt - 12 * e.tiltv) * dt;
  e.tilt = Math.max(-0.7, Math.min(0.7, e.tilt + e.tiltv * dt));
}

// ------------------------------------------------------------------ update
export function updateEnemies(dt) {
  const hash = G.enemyHash;
  hash.clear();
  for (const e of G.enemies) if (!e.dead) hash.insert(e, e.pos.x, e.pos.z);

  const p = G.player;
  const timeScale = enemyTimeScale(); // Time Warp power-up: enemies in slow motion
  for (let i = G.enemies.length - 1; i >= 0; i--) {
    const e = G.enemies[i];
    if (e.dead) {
      e.deathT -= dt;
      const dv = e.dvel;
      dv.y -= 30 * dt;
      e.pos.addScaledVector(dv, dt);
      const gy = G.world.heightAt(e.pos.x, e.pos.z);
      if (e.pos.y < gy) {
        e.pos.y = gy;
        if (dv.y < -3) {
          dv.y *= -0.3;
          dv.x *= 0.55;
          dv.z *= 0.55;
          e.dspin *= 0.5;
          particles(e.pos, 0xbbaa99, 3, 2, 0.3, 0.25, 8);
        } else dv.set(dv.x * 0.8, 0, dv.z * 0.8);
      }
      e.drot += e.dspin * dt;
      const m = e.mesh;
      m.position.copy(e.pos);
      if (e.isBoss) m.position.y -= (1 - e.deathT / e.deathMax) * e.height * 0.5;
      m.rotation.x = -e.drot;
      m.rotation.z = e.drot * 0.35;
      const k = Math.min(1, e.deathT / (e.deathMax * 0.35));
      const pop = e.deathMax - e.deathT < 0.08 ? 1.15 : 1;
      m.scale.setScalar(Math.max(0, e.scale * k * pop));
      e.flash -= dt;
      e.mat.emissive.setScalar(e.flash > 0 ? 0.9 : 0);
      if (e.deathT <= 0) {
        G.scene.remove(e.mesh);
        e.mat.dispose();
        G.enemies.splice(i, 1);
      }
      continue;
    }
    updateEnemy(e, dt * timeScale, p, dt);
  }
}

function groundY(e) {
  return G.world.heightAt(e.pos.x, e.pos.z);
}

function updateEnemy(e, dt, p, rdt = dt) {
  // dt = enemy time (slowed by Time Warp), rdt = real time for your burns, poisons, freezes and stuns
  const s = e.status;
  e.lastHitT += dt;
  // spawn-in
  if (e.spawnT > 0) {
    e.spawnT -= dt;
    const k = 1 - Math.max(0, e.spawnT) / (e.isBoss ? 1.5 : 0.6);
    e.mesh.position.set(e.pos.x, e.pos.y - (1 - k) * e.height * e.scale, e.pos.z);
    e.mesh.scale.setScalar(e.scale * (0.3 + 0.7 * k));
    if (e.isBoss && Math.random() < 0.5) particles(e.pos, 0xff3355, 2, 8, 0.6, 0.6);
    if (e.anim) {
      playAnim(e.anim, 'crouch'); // rises out of the summoning circle crouched, then roars
      e.anim.mixer.update(dt);
    }
    return;
  }
  // statuses
  if (s.burnT > 0) {
    s.burnT -= rdt;
    s.burnAcc += rdt;
    if (s.burnAcc >= 0.5) {
      s.burnAcc -= 0.5;
      dealDamage(e, s.burnDps * 0.5, { procCoef: 0, canCrit: false, color: '#ff8a3a', noHooks: true });
      if (e.dead) return;
      if (Math.random() < 0.7) particles(e.pos, 0xff6622, 2, 2, 0.4, 0.25, -3);
    }
  }
  if (s.poisonT > 0) {
    s.poisonT -= rdt;
    s.poisonAcc += rdt;
    if (s.poisonAcc >= 0.5) {
      s.poisonAcc -= 0.5;
      dealDamage(e, s.poison * G.player.stats.damage * 0.15 * 0.5, { procCoef: 0, canCrit: false, color: '#9dff5a', noHooks: true });
      if (e.dead) return;
      if (Math.random() < 0.6) particles(e.pos, 0x88ff44, 1, 1.5, 0.5, 0.22, -2);
    }
    if (s.poisonT <= 0) s.poison = 0;
  }
  if (s.slowT > 0) s.slowT -= rdt;
  if (s.slowT <= 0) s.slow = 0;
  if (e.vulnT > 0) e.vulnT -= rdt;
  const frozen = s.freeze > 0, stunned = s.stun > 0;
  if (frozen) s.freeze -= rdt;
  if (stunned) s.stun -= rdt;
  if (s.slowT <= 0) s.chill = 0;

  // knockback integration
  if (e.knock.lengthSq() > 0.01) {
    e.pos.addScaledVector(e.knock, dt * 6);
    e.knock.multiplyScalar(Math.max(0, 1 - dt * 6));
  }

  const homing = e.ai === 'homing';
  if (homing) {
    if (p) updateHoming(e, frozen || stunned ? 0 : dt, p);
  } else if (!frozen && !stunned && p) runAI(e, dt, p);
  if (!homing) integrateSteering(e, frozen ? 0 : dt);
  if (frozen || stunned) e.mv.multiplyScalar(0.8);
  if ((frozen || stunned) && e.state !== 'chase' && e.state !== 'hover') {
    // attacks are interrupted by freezes and stuns
    e.state = 'chase';
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
  // obstacles / bounds (homing ghosts phase through everything)
  if (!homing) G.world.collide(e.pos, e.radius * e.scale * 0.8);
  G.world.clampBounds(e.pos);

  // vertical
  const gy = groundY(e);
  if (homing) {
    if (e.pos.y < gy + 0.4) e.pos.y = gy + 0.4;
  } else if (e.flying) {
    const target = gy + e.hover + Math.sin(e.bob += dt * 2) * 0.5;
    if (e.state !== 'dive') e.pos.y += (target - e.pos.y) * Math.min(1, dt * 2.5);
    if (e.pos.y < gy + 0.3) e.pos.y = gy + 0.3;
  } else {
    if (e.vy !== 0 || e.pos.y > gy + 0.05) {
      e.vy -= 30 * dt;
      e.pos.y += e.vy * dt;
      if (e.pos.y <= gy) {
        e.pos.y = gy;
        if (e.vy < -2) e.sqv -= Math.min(9, -e.vy * (e.jelly ? 0.7 : 0.3)); // landing squish
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
  updateSprings(e, dt);
  const moved = Math.hypot(e.pos.x - e.lastX, e.pos.z - e.lastZ);
  const vx = (e.pos.x - e.lastX) / Math.max(dt, 1e-4), vz = (e.pos.z - e.lastZ) / Math.max(dt, 1e-4);
  e.lastX = e.pos.x;
  e.lastZ = e.pos.z;
  m.position.copy(e.pos);
  m.rotation.y = e.yaw;
  let sq = e.sq;
  let roll = 0, pitch = e.tilt;
  if (e.flying) {
    // bank into turns and lean into the direction of travel
    const fx = Math.sin(e.yaw), fz = Math.cos(e.yaw);
    const fwd = vx * fx + vz * fz, side = vx * fz - vz * fx;
    e.bank += (Math.max(-0.5, Math.min(0.5, -side * 0.06)) - e.bank) * Math.min(1, dt * 5);
    e.pitch += (Math.max(-0.3, Math.min(0.4, fwd * 0.04)) - e.pitch) * Math.min(1, dt * 5);
    roll = e.bank;
    pitch += e.pitch;
  } else if (e.ai !== 'hopper' && !e.isBoss && e.pos.y <= gy + 0.05) {
    // waddle while walking
    e.walkPh += moved * (2.6 / Math.max(0.6, e.radius));
    const amt = Math.min(1, moved / Math.max(dt, 1e-4) / 4);
    m.position.y += Math.abs(Math.sin(e.walkPh)) * 0.14 * e.scale * amt;
    roll = Math.sin(e.walkPh) * 0.07 * amt;
  } else if (e.isBoss && moved > 0.001 && !e.anim) {
    e.walkPh += moved * 0.7;
    roll = Math.sin(e.walkPh) * 0.04;
  } else e.walkPh += moved * 1.5;
  if (e.state === 'windup' || e.state === 'fuse') sq += Math.sin(e.t * 40) * 0.06;
  if (e.ai === 'hopper' && e.pos.y <= gy + 0.05 && e.aux < 0.22) sq -= (0.22 - e.aux) * 1.2; // crouch before a hop
  m.rotation.x = pitch;
  m.rotation.z = roll;
  e.breathe += dt * 2.2;
  sq += Math.sin(e.breathe) * 0.018;
  m.scale.set(e.scale * (1 - sq * 0.45), e.scale * (1 + sq), e.scale * (1 - sq * 0.45));
  if (e.rig) animateRig(e, dt, Math.min(1, moved / Math.max(dt, 1e-4) / 4), frozen || stunned);
  if (e.anim) animateModel(e, dt, moved, frozen || stunned);
  if (e.flash > 0) e.flash -= dt;
  const em = e.mat.emissive;
  if (e.flash > 0) em.copy(FLASH).multiplyScalar(0.8);
  else if (frozen) em.copy(FROZEN).multiplyScalar(0.6);
  else if (e.state === 'fuse') em.copy(FLASH).multiplyScalar(Math.sin(e.t * 30) > 0 ? 0.8 : 0);
  else if (s.burnT > 0) em.copy(BURN).multiplyScalar(0.25 + Math.random() * 0.15);
  else if (s.poisonT > 0) em.setRGB(0.12, 0.35, 0.05);
  else if (e.elite) em.set(e.elite.color).multiplyScalar(0.35);
  else em.setRGB(0, 0, 0);
  if (stunned && Math.random() < 0.1) particles(_v.copy(e.pos).setY(e.pos.y + e.height * e.scale), 0xffff66, 1, 1, 0.4, 0.15, 0);
}

// ------------------------------------------------------------------ AI
/**
 * Overtime ghosts: steer in 3D straight at the player (curving pursuit, no pathing,
 * through walls and terrain) and hurt on contact, then bounce off and come again.
 */
function updateHoming(e, dt, p) {
  if (!e.hv) e.hv = new THREE.Vector3();
  const tx = p.pos.x, ty = p.pos.y + 1.1, tz = p.pos.z;
  _v.set(tx - e.pos.x, ty - (e.pos.y + e.height * e.scale * 0.4), tz - e.pos.z);
  const dist = _v.length();
  const speed = e.speed * speedMult(e) * (e.otSpeed || 1);
  _v.multiplyScalar(speed / (dist || 1));
  // turn rate: tight enough to chase, loose enough that strafing makes them overshoot
  e.hv.lerp(_v, Math.min(1, dt * (2.2 + (e.otSpeed || 1) * 0.6)));
  e.pos.addScaledVector(e.hv, dt);
  faceDir(e, e.hv.x, e.hv.z, dt, 12);
  e.mv.set(0, 0, 0);
  e.atkCd -= dt;
  if (dist < e.radius * e.scale + 1.0 && e.atkCd <= 0 && !p.dead) {
    damagePlayer(e.dmg, e, enemyStatus(e));
    e.atkCd = 0.8;
    e.hv.multiplyScalar(-0.6); // recoil, then swoop back in
  }
  e.state = 'chase';
}

function speedMult(e) {
  return (1 - e.status.slow) * (e.enraged ? 1.25 : 1);
}

/** Steering: request movement toward a point; the actual velocity accelerates/brakes smoothly. */
function moveToward(e, tx, tz, dt, mult = 1) {
  const dx = tx - e.pos.x, dz = tz - e.pos.z;
  const d = Math.hypot(dx, dz);
  if (d < 0.01) return d;
  // slow down when arriving instead of jittering on the spot
  const arrive = Math.min(1, d / 1.5);
  const sp = e.speed * speedMult(e) * mult * arrive;
  e.wantX += (dx / d) * sp;
  e.wantZ += (dz / d) * sp;
  return d;
}

function integrateSteering(e, dt) {
  const accel = e.isBoss || e.champion ? 5 : e.flying ? 6 : 9;
  const k = Math.min(1, dt * accel);
  e.mv.x += (e.wantX - e.mv.x) * k;
  e.mv.z += (e.wantZ - e.mv.z) * k;
  e.pos.x += e.mv.x * dt;
  e.pos.z += e.mv.z * dt;
  const sp = Math.hypot(e.mv.x, e.mv.z);
  if (sp > 0.4 && (e.state === 'chase' || e.state === 'wander')) faceDir(e, e.mv.x, e.mv.z, dt, 7);
  e.wantX = e.wantZ = 0;
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
          e.sqv += 6; // stretch on take-off
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
  particles(e.pos, e.bodyColor, 6, 3, 0.4, 0.22, 18);
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
  if (e.def.final && !e.phase3 && e.hp < e.maxHp * 0.25) {
    // final form: faster, angrier, calls reinforcements
    e.phase3 = true;
    e.speed *= 1.3;
    floatText(e.pos.clone().setY(e.pos.y + e.height), 'FINAL FORM', '#ffd27a', true);
    ring(e.pos, 20, 0xffd27a, 1);
    shake(0.8);
    sfx('roar');
    e.atkCd = 0;
    e.patternQueue = ['summon'];
  }
  const cdMult = e.phase3 ? 0.45 : e.enraged ? 0.65 : 1;
  if (e.introT > 0) {
    facePlayer(e, p, dt);
    return;
  }
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
      if (def.leapSlam) {
        // leap onto the player's position (at most 22 m away)
        e.leapFrom = e.pos.clone();
        const to = _v.set(p.pos.x - e.pos.x, 0, p.pos.z - e.pos.z);
        const d = to.length();
        if (d > 22) to.multiplyScalar(22 / d);
        e.leapTo = e.pos.clone().add(to);
        G.world.clampBounds(e.leapTo);
        e.leapTo.y = G.world.heightAt(e.leapTo.x, e.leapTo.z);
        e.slamR = 8;
        telegraph(e.leapTo.clone(), e.slamR, 0xff3333, def.slamT || 1.1);
        sfx('roar', 0.5);
      } else telegraph(e.pos.clone(), e.slamR, 0xff3333, def.slamT || 1.1);
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
    case 'slam': {
      const T = def.slamT || 1.1;
      if (e.leapTo && e.t < T) {
        // airborne between 30% and 100% of the wind-up: arc over to the target
        const f = Math.max(0, Math.min(1, (e.t / T - 0.3) / 0.7));
        const s = f * f * (3 - 2 * f);
        e.pos.x = e.leapFrom.x + (e.leapTo.x - e.leapFrom.x) * s;
        e.pos.z = e.leapFrom.z + (e.leapTo.z - e.leapFrom.z) * s;
        const gy = G.world.heightAt(e.pos.x, e.pos.z);
        e.pos.y = Math.max(gy, e.leapFrom.y + (e.leapTo.y - e.leapFrom.y) * s + Math.sin(Math.PI * f) * 7);
        e.vy = 0;
        faceDir(e, e.leapTo.x - e.leapFrom.x, e.leapTo.z - e.leapFrom.z, dt, 10);
      }
      if (e.t >= T) {
        if (e.leapTo) {
          e.pos.x = e.leapTo.x;
          e.pos.z = e.leapTo.z;
          e.leapTo = null;
        }
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
    }
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
          spawnEnemy(def.summonPool ? pick(def.summonPool) : def.summon, pos, {});
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
