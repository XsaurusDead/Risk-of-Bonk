// The player: third-person movement + camera, aiming, abilities, stats,
// items, buffs, damage intake and animation.
import * as THREE from 'three';
import { G } from '../core/state.js';
import { Input } from '../core/input.js';
import { CHARACTERS } from '../data/characters.js';
import { ITEMS } from '../data/items.js';
import { applyModsObj } from '../data/modutil.js';
import { UPGRADES } from '../data/upgrades.js';
import { applyTomes, newWeapon, weaponMods, WEAPON_SLOTS, TOME_MAX, WEAPON_MAX } from '../data/tomes.js';
import { buildCharacter } from './models.js';
import { targetNearAim, nearestEnemy, applyFreeze, dealDamage, findTargets, explode, after } from './combat.js';
import { particles, shake, floatText, ring } from './fx.js';
import { sfx } from '../core/audio.js';
import { track, trackMax, discover, selectedCostume } from '../core/save.js';
import { charLevelFromXp, charXp } from '../core/charlevel.js';
import { clamp, lerpAngle, angleDiff } from '../core/util.js';

const SLOTS = ['ability1', 'ability2', 'ultimate'];
const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _ray = new THREE.Ray();
const _sph = new THREE.Sphere();
const _hit = new THREE.Vector3();

export class Player {
  constructor(charId) {
    this.charId = charId;
    this.char = CHARACTERS[charId];
    const { root, rig } = buildCharacter(charId, selectedCostume(charId));
    this.model = root;
    this.rig = rig;
    G.scene.add(root);

    this.pos = new THREE.Vector3();
    this.vel = new THREE.Vector3();
    this.knock = new THREE.Vector3();
    this.moveDir = new THREE.Vector3();
    this.yaw = 0; // model facing
    this.camYaw = 0;
    this.camPitch = -0.15;
    this.aimYaw = 0;
    this.grounded = true;
    this.coyote = 0;
    this.jumpsLeft = 0;

    this.level = 1;
    this.xp = 0;
    this.xpNext = xpFor(1);
    this.pendingLevelUps = 0;
    this.items = {};
    this.itemCount = 0;
    this.itemOrder = [];
    this.upgrades = []; // legacy level-up picks (old saves)
    this.tomes = {}; // id -> { level, value }
    this.weapons = {}; // slot -> weapon levels/stats
    for (const s of WEAPON_SLOTS) this.weapons[s] = newWeapon();
    this.buffs = {};
    this.cs = {}; // per-character scratch state
    this.itemTimers = {};
    this.medkitQueue = [];
    this.infusionHp = 0;

    this.cd = { ability1: 0, ability2: 0, ultimate: 0 };
    this.cdMax = { ability1: 1, ability2: 1, ultimate: 1 };
    this.charges = {};
    SLOTS.forEach((s, i) => (this.charges[s] = this.char.abilities[i].charges || 1));
    this.posHistory = [];
    this.primaryT = 0;
    this.lastAttackT = 9;

    this.invulnT = 0;
    this.stealthT = 0;
    this.dashS = null;
    this.leapS = null;
    this.channelS = null;
    this.hurtT = 0;
    this.slowT = 0;
    this.burnT = 0;
    this.burnDps = 0;
    this.shieldDelay = 0;
    this.dead = false;
    this.animT = 0;
    this.animType = null;
    this.walkPhase = 0;
    this.sq = 0; // squash spring
    this.sqv = 0;
    this.lean = 0;
    this.leanF = 0;
    this.camDip = 0;
    this.camDipV = 0;
    this.fov = 70;

    this.camRayOrigin = new THREE.Vector3();
    this.camRayDir = new THREE.Vector3(0, 0, -1);
    this.aim = {
      point: new THREE.Vector3(),
      groundPoint: new THREE.Vector3(),
      target: null,
      dirFrom: (from) => _v2.copy(this.aim.point).sub(from).normalize().clone(),
    };

    this.stats = {};
    this.cond = {};
    this.condKey = '';
    this.lastKillT = 99;
    this.lastHurtT = 99;
    this.lastCastT = 99;
    this.stillT = 0;
    this.stageKills = 0;
    this.nearCount = 0;
    this.nearT = 0;
    this.dmgModItems = [];
    this.dirty = true;
    this.recalcStats();
    this.hp = this.stats.maxHp;
    this.barrier = 0;
    this.shield = this.stats.maxShield;
  }

  markDirty() {
    this.dirty = true;
  }

  // ------------------------------------------------------------ stats
  recalcStats() {
    const b = this.char.base;
    const lvl = this.level - 1;
    const m = {
      damage: 0, attackSpeed: 0, moveSpeed: 0, maxHpFlat: 0, maxHpPct: 0, regen: 0, armor: 0, crit: 0, critMult: 0,
      cdr: 1, ultCdr: 1, jumps: 0, jumpPower: 0, pickup: 0, luck: 0, xp: 0, coins: 0, area: 0, lifeOnHit: 0, dodge: 0,
      shield: 0, chestDiscount: 0, execute: 0, kbImmune: false, glide: false, burnVuln: 0,
      dmgTakenMult: 1, procMult: 0, extraCharges: 0, burnImmune: false, poisonCap: 0,
      tomeDodge: 0, projectiles: 0, lifesteal: 0,
    };
    m.damage += this.eaterDmg || 0;
    if (this.char.passive.mods) this.char.passive.mods(m, this);
    this.dmgModItems = [];
    for (const id in this.items) {
      const it = ITEMS[id];
      const n = this.items[id];
      if (it.mods) it.mods(m, n);
      if (it.cond && this.cond[it.cond.when]) applyModsObj(m, it.cond.mods, n);
      if (it.dmgMod) this.dmgModItems.push([it, n]);
    }
    for (const u of this.upgrades) {
      const def = UPGRADES.find((x) => x.id === u.id);
      if (def) def.apply(m, u.value);
    }
    applyTomes(m, this.tomes);
    for (const id in this.buffs) {
      const bf = this.buffs[id];
      for (const k in bf.mods) m[k] += bf.mods[k] * bf.stacks;
    }
    const s = this.stats;
    const oldMax = s.maxHp || 0;
    s.maxHp = (b.hp * (1 + 0.11 * lvl) + m.maxHpFlat + this.infusionHp) * (1 + m.maxHpPct);
    s.damage = b.damage * (1 + 0.07 * lvl) * (1 + m.damage);
    s.attackSpeed = 1 + m.attackSpeed;
    s.moveSpeed = b.speed * (1 + m.moveSpeed);
    s.armor = b.armor + m.armor;
    s.regen = (b.regen + m.regen) * (1 + 0.1 * lvl);
    const rawCrit = 0.05 + m.crit;
    s.crit = Math.min(1, rawCrit);
    s.critMult = 2 + m.critMult + Math.max(0, rawCrit - 1); // overflow crit chance becomes crit damage
    s.cdMult = m.cdr;
    s.ultCdMult = m.cdr * m.ultCdr;
    s.jumps = b.jumps + m.jumps;
    s.jumpPower = 12.5 * (1 + m.jumpPower);
    s.pickup = 4.5 + m.pickup;
    s.luck = m.luck;
    s.xpMult = 1 + m.xp;
    s.coinMult = 1 + m.coins;
    s.area = 1 + m.area;
    s.lifeOnHit = m.lifeOnHit;
    // item dodge and tome evasion stack with diminishing returns
    s.dodge = Math.min(0.8, 1 - (1 - Math.min(0.9, m.dodge)) / (1 + m.tomeDodge));
    s.projectiles = m.projectiles;
    s.lifesteal = Math.min(0.3, m.lifesteal);
    s.maxShield = s.maxHp * m.shield;
    s.chestDiscount = m.chestDiscount;
    s.execute = m.execute;
    s.kbImmune = m.kbImmune;
    s.glide = m.glide;
    s.burnVuln = m.burnVuln;
    s.dmgTakenMult = m.dmgTakenMult;
    s.procMult = 1 + m.procMult;
    s.extraCharges = m.extraCharges;
    s.burnImmune = m.burnImmune;
    s.poisonCap = 10 + m.poisonCap;
    if (oldMax > 0 && s.maxHp > oldMax) this.hp += s.maxHp - oldMax;
    if (this.hp > s.maxHp) this.hp = s.maxHp;
    if (this.shield > s.maxShield) this.shield = s.maxShield;
    this.dirty = false;
  }

  addItem(id) {
    this.items[id] = (this.items[id] || 0) + 1;
    this.itemCount++;
    if (!this.itemOrder.includes(id)) this.itemOrder.push(id);
    discover(id);
    trackMax('itemsHeld', this.itemCount);
    const rar = ITEMS[id].rarity;
    track('items_' + rar);
    if (rar === 'legendary') trackMax('legendaryHeld', this.itemOrder.filter((x) => ITEMS[x].rarity === 'legendary').reduce((a, x) => a + this.items[x], 0));
    this.dirty = true;
  }

  applyUpgrade(id, value) {
    this.upgrades.push({ id, value });
    this.dirty = true;
  }

  /** +1 tome level, adding `value` of its effect. */
  addTome(id, value) {
    const t = this.tomes[id] || (this.tomes[id] = { level: 0, value: 0 });
    if (t.level >= TOME_MAX) return;
    t.level++;
    t.value += value;
    this.dirty = true;
  }

  /** +1 weapon level, improving one stat by `value`. */
  levelWeapon(slot, stat, value) {
    const w = this.weapons[slot];
    if (!w || w.level >= WEAPON_MAX) return;
    const before = weaponMods(w, slot).charges;
    w.level++;
    w[stat] = (w[stat] || 0) + value;
    const gained = weaponMods(w, slot).charges - before;
    if (gained > 0) this.charges[slot] = (this.charges[slot] || 0) + gained;
    this.dirty = true;
  }

  weaponMods(slot) {
    return weaponMods(this.weapons[slot], slot);
  }

  /**
   * Run `fn` with this weapon's damage / size / crit applied to the player's stats.
   * Delayed effects started inside (timers, zones, channels) remember the weapon.
   */
  withWeapon(slot, fn) {
    if (G.weaponSlot) return fn();
    const s = this.stats, w = this.weaponMods(slot);
    const d = s.damage, a = s.area, c = s.crit;
    s.damage = d * w.dmg;
    s.area = a * w.area;
    s.crit = Math.min(1, c + w.crit);
    G.weaponSlot = slot;
    try {
      return fn();
    } finally {
      G.weaponSlot = null;
      s.damage = d;
      s.area = a;
      s.crit = c;
    }
  }

  addXp(v) {
    this.xp += v;
    // the survivor's own (cosmetic) level
    track('charXp', v);
    const cl = charLevelFromXp(charXp(this.charId));
    if (cl > (this.charLevel || 0)) {
      if (this.charLevel) G.ui?.charLevelUp?.(this.charId, cl);
      this.charLevel = cl;
      trackMax('charLevel', cl);
    }
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      this.xpNext = xpFor(this.level);
      this.pendingLevelUps++;
      this.dirty = true;
      this.recalcStats();
      this.hp = Math.min(this.stats.maxHp, this.hp + this.stats.maxHp * 0.1);
      trackMax('level', this.level);
      track('levelUps');
      ring(this.pos, 5, 0x55ffcc, 0.6);
      particles(this.pos, 0x55ffcc, 24, 6, 0.8);
      sfx('levelup');
    }
  }

  addBuff(id, dur, mods) {
    this.buffs[id] = { t: dur, mods, stacks: 1, max: 1 };
    this.dirty = true;
  }
  addStackBuff(id, dur, max, perStack) {
    const b = this.buffs[id];
    if (b) {
      b.stacks = Math.min(max, b.stacks + 1);
      b.t = dur;
      b.max = max;
    } else this.buffs[id] = { t: dur, mods: perStack, stacks: 1, max };
    this.dirty = true;
  }
  addBarrier(v) {
    this.barrier = Math.min(this.stats.maxHp, this.barrier + v);
  }
  heal(v) {
    if (this.dead || !(v > 0)) return;
    this.hp = Math.min(this.stats.maxHp, this.hp + v);
  }
  knockback(dir, force) {
    if (this.stats.kbImmune) return;
    this.knock.addScaledVector(_v.copy(dir).setY(0).normalize(), force);
    this.vel.y = Math.max(this.vel.y, 5);
    this.grounded = false;
  }

  // ------------------------------------------------------------ ability helpers
  muzzle(side = 0) {
    const fx = -Math.sin(this.aimYaw), fz = -Math.cos(this.aimYaw);
    const rx = Math.cos(this.aimYaw), rz = -Math.sin(this.aimYaw);
    return new THREE.Vector3(this.pos.x + fx * 0.6 + rx * side, this.pos.y + 1.45, this.pos.z + fz * 0.6 + rz * side);
  }
  cooldownFor(slot) {
    const i = SLOTS.indexOf(slot);
    const base = this.char.abilities[i].cd;
    return base * (slot === 'ultimate' ? this.stats.ultCdMult : this.stats.cdMult) * this.weaponMods(slot).cd;
  }
  reduceCooldowns(amount, slots = SLOTS) {
    for (const s of slots) if (this.cd[s] > 0) this.cd[s] = Math.max(0.001, this.cd[s] - amount);
  }
  maxCharges(i) {
    return (this.char.abilities[i].charges || 1) + (this.stats.extraCharges || 0) + this.weaponMods(SLOTS[i]).charges;
  }
  resetCooldown(slot) {
    const i = SLOTS.indexOf(slot);
    this.charges[slot] = this.maxCharges(i);
    this.cd[slot] = 0;
  }
  dash(dir, dist, dur, o = {}) {
    this.dashS = { dir: dir.clone().setY(0).normalize(), speed: dist / dur, t: dur, along: o.damageAlong || null, hit: new Set() };
    if (o.invuln) this.invulnT = Math.max(this.invulnT, o.invuln);
    this.leapS = null;
  }
  leap(vy, horiz, onLand) {
    this.vel.y = vy;
    this.grounded = false;
    this.coyote = 0;
    this.pos.y += 0.05;
    this.leapS = { h: horiz.clone().setY(0).multiplyScalar(1 / 1.0), onLand, t: 0 };
  }
  teleport(dir, dist) {
    particles(this.pos, this.char.color, 14, 4, 0.5);
    this.pos.addScaledVector(_v.copy(dir).setY(0).normalize(), dist);
    G.world.clampBounds(this.pos);
    G.world.collide(this.pos, 0.6);
    this.pos.y = Math.max(this.pos.y, G.world.heightAt(this.pos.x, this.pos.z));
    particles(this.pos, this.char.color, 14, 4, 0.5);
  }
  channel(dur, tick, fn) {
    this.channelS = { t: dur, tick, acc: tick, fn };
  }
  anim(type) {
    this.animType = type;
    this.animT = 0;
    this.lastAttackT = 0;
  }

  // ------------------------------------------------------------ damage intake
  takeDamage(amount, attacker, o = {}) {
    if (this.dead || this.invulnT > 0 || G.mode !== 'playing') return;
    for (const id in this.items) {
      const it = ITEMS[id];
      if (it.onBlock && it.onBlock(this.items[id], this)) return;
    }
    if (this.stats.dodge > 0 && Math.random() < this.stats.dodge) {
      floatText(this.pos.clone().setY(this.pos.y + 1), 'DODGE', '#ccccff');
      return;
    }
    const a = this.stats.armor;
    const red = a >= 0 ? 100 / (100 + a) : 2 - 100 / (100 - a);
    let dmg = amount * red * this.stats.dmgTakenMult;
    this.lastHurtT = 0;
    const total = dmg;
    if (this.barrier > 0) {
      const t = Math.min(this.barrier, dmg);
      this.barrier -= t;
      dmg -= t;
    }
    if (this.shield > 0 && dmg > 0) {
      const t = Math.min(this.shield, dmg);
      this.shield -= t;
      dmg -= t;
    }
    this.hp -= dmg;
    this.shieldDelay = 4;
    this.hurtT = 0.25;
    if (total > this.stats.maxHp * 0.25) G.hitStop = Math.max(G.hitStop || 0, 0.07);
    this.sqv -= 2;
    if (G.ui) G.ui.hurt(total / this.stats.maxHp);
    sfx('hurt', 0.12);
    shake(Math.min(0.4, (total / this.stats.maxHp) * 2));
    const st = o.status;
    if (st) {
      if (st.slow) this.slowT = Math.max(this.slowT, 1.5);
      if (st.burn && !this.stats.burnImmune) {
        this.burnDps = Math.max(this.burnDps, st.burn);
        this.burnT = 3;
      }
      if (st.leech && !st.leech.dead) st.leech.hp = Math.min(st.leech.maxHp, st.leech.hp + total * 2);
    }
    if (!o.noThorns) {
      if (this.char.passive.onDamaged) this.char.passive.onDamaged(total, this);
      if (this.buffs.glacial_armor && attacker && !attacker.dead) applyFreeze(attacker, 1.5);
      for (const id in this.items) {
        const it = ITEMS[id];
        if (it.onDamaged) it.onDamaged(this.items[id], total, attacker);
      }
    }
    if (this.hp <= 0) this.die();
  }

  die() {
    for (const id in this.items) {
      const it = ITEMS[id];
      if (it.onLethal && it.onLethal(this.items[id], this)) return;
    }
    if (this.items.phoenix_feather > 0) {
      this.items.phoenix_feather--;
      this.itemCount--;
      if (!this.items.phoenix_feather) {
        delete this.items.phoenix_feather;
        this.itemOrder = this.itemOrder.filter((x) => x !== 'phoenix_feather');
      }
      this.dirty = true;
      this.recalcStats();
      this.hp = this.stats.maxHp;
      this.invulnT = 2.5;
      explode(this.pos, 12, this.stats.damage * 10, { color: 0xffaa33, big: true, knockback: 15 });
      floatText(this.pos.clone().setY(this.pos.y + 2), 'REBORN!', '#ffb22e', true);
      sfx('legendary');
      return;
    }
    this.hp = 0;
    this.dead = true;
    this.model.rotation.x = -Math.PI / 2;
    particles(this.pos, 0xff3333, 40, 8, 1);
    sfx('death');
    if (G.run?.onPlayerDeath) G.run.onPlayerDeath();
  }

  // ------------------------------------------------------------ per-frame
  update(dt) {
    if (this.dead) {
      this.updateCamera(dt);
      return;
    }
    const s = this.stats;
    // timers
    this.invulnT = Math.max(0, this.invulnT - dt);
    this.stealthT = Math.max(0, this.stealthT - dt);
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.slowT = Math.max(0, this.slowT - dt);
    this.lastAttackT += dt;
    for (const id in this.buffs) {
      const b = this.buffs[id];
      b.t -= dt;
      if (b.t <= 0) {
        delete this.buffs[id];
        this.dirty = true;
      }
    }
    // passive-driven stat changes (e.g. Bulwark spin armor) need a refresh
    if (this.charId === 'bulwark') {
      const was = (this.cs.spinPrev || 0) > 0.2, now = (this.cs.spin || 0) > 0.2;
      if (was !== now) this.dirty = true;
      this.cs.spinPrev = this.cs.spin;
    }
    this.updateConditions(dt);
    if (this.dirty) this.recalcStats();

    // regen / shield / barrier / burn
    this.heal(s.regen * dt);
    this.shieldDelay -= dt;
    if (this.shieldDelay <= 0 && this.shield < s.maxShield) this.shield = Math.min(s.maxShield, this.shield + s.maxShield * 0.5 * dt);
    if (this.barrier > 0) this.barrier = Math.max(0, this.barrier - s.maxHp * 0.03 * dt);
    if (this.burnT > 0) {
      this.burnT -= dt;
      this.hp -= this.burnDps * dt * 0.5;
      if (Math.random() < 0.2) particles(this.pos, 0xff6622, 1, 2, 0.4, 0.25, -3);
      if (this.hp <= 0) return this.die();
    }
    for (let i = this.medkitQueue.length - 1; i >= 0; i--) {
      const q = this.medkitQueue[i];
      q.t -= dt;
      if (q.t <= 0) {
        this.heal(q.amt);
        this.medkitQueue.splice(i, 1);
      }
    }

    this.updateCamera(dt);
    this.updateAim();
    this.updateMovement(dt);
    this.updateCombat(dt);

    // item & passive ticks
    if (this.char.passive.onTick) this.char.passive.onTick(dt, this);
    for (const id in this.items) {
      const it = ITEMS[id];
      if (it.onTick) it.onTick(this.items[id], dt, this);
    }
    this.updateModel(dt);
  }

  /** Flags used by conditional items (e.g. "+20 armor while standing still"). */
  updateConditions(dt) {
    this.lastKillT += dt;
    this.lastHurtT += dt;
    this.lastCastT += dt;
    const spd = Math.hypot(this.vel.x, this.vel.z);
    this.stillT = spd < 0.6 ? this.stillT + dt : 0;
    this.nearT -= dt;
    if (this.nearT <= 0) {
      this.nearT = 0.25;
      this.nearCount = findTargets(this.pos, 8, 5).length;
    }
    // position history (Echo's rewind)
    this.histT = (this.histT || 0) - dt;
    if (this.histT <= 0) {
      this.histT = 0.1;
      this.posHistory.push({ p: this.pos.clone(), hp: this.hp });
      if (this.posHistory.length > 40) this.posHistory.shift();
    }
    const hpF = this.hp / (this.stats.maxHp || 1);
    const c = this.cond;
    c.lowHp = hpF < 0.35;
    c.fullHp = hpF >= 0.9;
    c.moving = spd > 1;
    c.still = this.stillT > 0.4;
    c.airborne = !this.grounded;
    c.notHurt = this.lastHurtT > 3;
    c.crowded = this.nearCount >= 3;
    c.recentKill = this.lastKillT < 3;
    c.shielded = this.shield > 0 || this.barrier > 0;
    c.ability = this.lastCastT < 3;
    let key = '';
    for (const k in c) key += c[k] ? '1' : '0';
    if (key !== this.condKey) {
      this.condKey = key;
      this.dirty = true;
    }
  }

  updateCamera(dt) {
    this.camYaw += Input.look.x;
    this.camPitch = clamp(this.camPitch + Input.look.y, -1.25, 0.95);
    const cam = G.camera;
    const cp = Math.cos(this.camPitch), sp = Math.sin(this.camPitch);
    const fx = -Math.sin(this.camYaw) * cp, fy = sp, fz = -Math.cos(this.camYaw) * cp;
    const rx = Math.cos(this.camYaw), rz = -Math.sin(this.camYaw);
    const maxDist = G.isTouch ? 8 : 7;
    const shoulder = 1.1;
    const pivotY = this.pos.y + 2.2;
    // pull the camera in when a tree/rock/pillar blocks the view to the player
    let want = maxDist;
    const w0 = G.world;
    if (w0) {
      const ex = this.pos.x - fx * maxDist + rx * shoulder, ez = this.pos.z - fz * maxDist + rz * shoulder;
      const sx0 = this.pos.x, sz0 = this.pos.z;
      const dx = ex - sx0, dz = ez - sz0;
      const len2 = dx * dx + dz * dz || 1;
      for (const c of w0.colHash.query((sx0 + ex) / 2, (sz0 + ez) / 2, maxDist / 2 + 4)) {
        if (c.r < 0.45) continue;
        const t = ((c.x - sx0) * dx + (c.z - sz0) * dz) / len2;
        if (t <= 0.05 || t >= 1.05) continue;
        const px = sx0 + dx * t - c.x, pz = sz0 + dz * t - c.z;
        const block = c.r * 1.9 + 0.4;
        if (px * px + pz * pz < block * block) want = Math.min(want, Math.max(2.2, t * maxDist - block * 0.8));
      }
    }
    this.camDist = this.camDist ?? maxDist;
    // snap in fast, ease back out slowly
    this.camDist += (want - this.camDist) * Math.min(1, dt * (want < this.camDist ? 14 : 3));
    const dist = this.camDist;
    let cx = this.pos.x - fx * dist + rx * shoulder;
    let cy = pivotY - fy * dist + 0.3;
    let cz = this.pos.z - fz * dist + rz * shoulder;
    // keep camera above terrain (pull closer on slopes)
    const w = G.world;
    if (w) {
      const gh = w.heightAt(cx, cz) + 0.6;
      if (cy < gh) cy = gh;
    }
    let sx = 0, sy = 0;
    if (G.shake > 0) {
      sx = (Math.random() - 0.5) * G.shake * 0.6;
      sy = (Math.random() - 0.5) * G.shake * 0.6;
      G.shake = Math.max(0, G.shake - dt * 2.5);
    }
    // landing dip spring + FOV kick when dashing / moving fast
    this.camDipV += (-90 * this.camDip - 11 * this.camDipV) * dt;
    this.camDip += this.camDipV * dt;
    const spd = Math.hypot(this.vel.x, this.vel.z);
    const targetFov = 70 + (this.dashS ? 12 : 0) + Math.min(6, Math.max(0, spd - 9) * 0.8);
    this.fov += (targetFov - this.fov) * Math.min(1, dt * 8);
    if (Math.abs(cam.fov - this.fov) > 0.05) {
      cam.fov = this.fov;
      cam.updateProjectionMatrix();
    }
    cam.position.set(cx + sx, cy + sy + this.camDip, cz);
    cam.rotation.set(this.camPitch, this.camYaw, 0, 'YXZ');
    cam.updateMatrixWorld();
    this.camRayOrigin.copy(cam.position);
    this.camRayDir.set(fx, fy, fz).normalize();
  }

  updateAim() {
    const o = this.camRayOrigin, d = this.camRayDir;
    const settings = G.save.settings;
    this.updateAutoAim();
    let target = null;
    if (settings.aimAssist && Input.device !== 'kbm') target = targetNearAim(70, Input.device === 'touch' ? 12 : 7);
    // ray vs enemies
    _ray.set(o, d);
    let best = Infinity;
    let rayHit = null;
    if (!target) {
      for (const e of G.enemies) {
        if (e.dead || e.spawnT > 0) continue;
        _sph.center.set(e.pos.x, e.pos.y + e.height * e.scale * 0.5, e.pos.z);
        _sph.radius = Math.max(e.radius, e.height * 0.45) * e.scale;
        if (_ray.intersectSphere(_sph, _hit)) {
          const t = _hit.distanceTo(o);
          if (t < best && t < 160) {
            best = t;
            rayHit = e;
          }
        }
      }
    }
    // ray vs terrain
    let groundT = Infinity;
    const w = G.world;
    for (let t = 2; t < 160; t += 1.5) {
      const y = o.y + d.y * t;
      if (y < w.heightAt(o.x + d.x * t, o.z + d.z * t)) {
        groundT = t;
        break;
      }
    }
    if (target) {
      this.aim.target = target;
      this.aim.point.set(target.pos.x, target.pos.y + target.height * target.scale * 0.5, target.pos.z);
      this.aim.groundPoint.set(target.pos.x, w.heightAt(target.pos.x, target.pos.z), target.pos.z);
      this.aimYaw = Math.atan2(-(target.pos.x - this.pos.x), -(target.pos.z - this.pos.z));
    } else {
      this.aim.target = rayHit && best < groundT ? rayHit : null;
      const t = Math.min(best, groundT, 140);
      this.aim.point.copy(o).addScaledVector(d, t);
      if (groundT < 60) this.aim.groundPoint.copy(o).addScaledVector(d, groundT);
      else {
        // looking at the sky: project 30m ahead on the ground
        const fx = -Math.sin(this.camYaw), fz = -Math.cos(this.camYaw);
        const gx = this.pos.x + fx * 30, gz = this.pos.z + fz * 30;
        this.aim.groundPoint.set(gx, w.heightAt(gx, gz), gz);
      }
      if (this.aim.target) this.aim.groundPoint.set(this.aim.target.pos.x, w.heightAt(this.aim.target.pos.x, this.aim.target.pos.z), this.aim.target.pos.z);
      this.aimYaw = this.camYaw;
    }
  }

  /**
   * The primary attack always aims and fires on its own: it picks the enemy
   * closest to your crosshair (within a wide cone), or failing that the nearest
   * one. Melee survivors only swing at enemies within reach.
   */
  updateAutoAim() {
    const range = this.char.primary.range || 45;
    let t = targetNearAim(range, 55);
    if (!t) t = nearestEnemy(this.pos, Math.min(range, 30));
    if (t && t.pos.distanceTo(this.pos) > range + t.radius * t.scale) t = null;
    this.autoTarget = t;
    if (!this.autoAim) {
      this.autoAim = { point: new THREE.Vector3(), groundPoint: new THREE.Vector3(), target: null, dirFrom: (from) => _v2.copy(this.autoAim.point).sub(from).normalize().clone() };
    }
    const a = this.autoAim;
    a.target = t;
    if (t) {
      a.point.set(t.pos.x, t.pos.y + t.height * t.scale * 0.5, t.pos.z);
      a.groundPoint.set(t.pos.x, G.world.heightAt(t.pos.x, t.pos.z), t.pos.z);
    }
  }

  autoFireActive() {
    const mode = G.save.settings.autoFire;
    return mode === 'always' || (mode === 'touch' && Input.device === 'touch');
  }

  /**
   * Horizontal move that respects cliffs: on the ground you can step up at
   * most ~1.1m; in the air you can't pass through terrain above your feet.
   */
  moveH(dx, dz) {
    const w = G.world;
    const tryAxis = (ax, az) => {
      const nx = this.pos.x + ax, nz = this.pos.z + az;
      const th = w.heightAt(nx, nz);
      const limit = this.grounded ? this.pos.y + 1.1 : this.pos.y + 0.35;
      if (th > limit && th > w.heightAt(this.pos.x, this.pos.z) + 0.05) return false;
      this.pos.x = nx;
      this.pos.z = nz;
      return true;
    };
    if (!tryAxis(dx, dz)) {
      // slide along the cliff
      const okX = tryAxis(dx, 0);
      const okZ = tryAxis(0, dz);
      if (!okX && !okZ) return false;
    }
    return true;
  }

  updateMovement(dt) {
    const s = this.stats;
    const w = G.world;
    const fx = -Math.sin(this.camYaw), fz = -Math.cos(this.camYaw);
    const rx = Math.cos(this.camYaw), rz = -Math.sin(this.camYaw);
    this.moveDir.set(rx * Input.move.x + fx * Input.move.y, 0, rz * Input.move.x + fz * Input.move.y);
    const inLiquid = w.stage.liquid && this.pos.y < w.liquidLevel - 0.25;
    let speed = s.moveSpeed * (this.slowT > 0 ? 0.6 : 1) * (inLiquid ? 1 - w.stage.liquid.slow : 1);
    if (this.charId === 'bulwark' && this.cs.spin > 0.3) speed *= 0.8;

    // ---- bunny hop: jumping right as you land keeps and builds speed
    this.bhop = this.bhop || 1;
    this.landT = this.grounded ? (this.landT || 0) + dt : 0;
    this.jumpBuf = Input.pressed.jump ? 0.15 : Math.max(0, (this.jumpBuf || 0) - dt);
    if (this.grounded && this.landT > 0.22) this.bhop += (1 - this.bhop) * Math.min(1, dt * 6);
    speed *= this.bhop;

    // jumping
    if (this.grounded) {
      this.coyote = 0.12;
      this.jumpsLeft = s.jumps;
    } else this.coyote -= dt;
    const wantJump = Input.pressed.jump || (this.grounded && this.jumpBuf > 0 && this.landT < 0.05);
    if (wantJump && !this.dashS) {
      if (this.grounded || this.coyote > 0) {
        // perfect timing (within ~0.12s of landing, or buffered just before) = hop
        if (this.grounded && this.landT < 0.12 && this.hopReady && Math.hypot(this.vel.x, this.vel.z) > 3) {
          this.bhop = Math.min(1.9, this.bhop + 0.12);
          this.hops = (this.hops || 0) + 1;
          if (this.hops % 5 === 0) track('bhops', 5);
          particles(this.pos, 0x9ff5ff, 6, 4, 0.3, 0.22);
          sfx('dash', 0.08);
        } else this.hops = 0;
        this.vel.y = s.jumpPower;
        this.sqv += 4;
        track('jumps');
        this.jumpsLeft = s.jumps - 1;
        this.grounded = false;
        this.coyote = 0;
        this.jumpBuf = 0;
        this.hopReady = false;
        sfx('jump');
      } else if (this.jumpsLeft > 0 && Input.pressed.jump && !(this.vel.y < 0 && this.pos.y - w.groundAt(this.pos.x, this.pos.z, this.pos.y) < 0.9)) {
        // (a press just before touching down is buffered as a bunny hop instead)
        this.jumpsLeft--;
        this.vel.y = s.jumpPower * 0.95;
        this.sqv += 3;
        particles(this.pos, 0xffffff, 6, 3, 0.3, 0.25);
        sfx('jump');
      }
      this.leapS = null;
    }

    if (this.dashS) {
      const ds = this.dashS;
      ds.t -= dt;
      if (!this.moveH(ds.dir.x * ds.speed * dt, ds.dir.z * ds.speed * dt)) ds.t = 0;
      this.vel.y = Math.max(this.vel.y, 0);
      if (Math.random() < 0.8) particles(this.pos, this.char.color, 2, 1, 0.3, 0.3, 0);
      if (ds.along) {
        for (const e of findTargets(this.pos, ds.along.radius, 30)) {
          if (ds.hit.has(e)) continue;
          ds.hit.add(e);
          dealDamage(e, ds.along.damage, { procCoef: 1, knockback: 5, stun: ds.along.stun });
        }
      }
      if (ds.t <= 0) {
        this.dashS = null;
        this.vel.x = ds.dir.x * speed * 0.6;
        this.vel.z = ds.dir.z * speed * 0.6;
      }
    } else if (this.leapS && !this.grounded) {
      const ls = this.leapS;
      this.vel.x = ls.h.x + this.moveDir.x * speed * 0.3;
      this.vel.z = ls.h.z + this.moveDir.z * speed * 0.3;
    } else {
      // in the air you keep your momentum (that's what makes hopping fast)
      const accel = this.grounded ? 70 : 22;
      const tx = this.moveDir.x * speed, tz = this.moveDir.z * speed;
      const k = Math.min(1, accel * dt / Math.max(1, speed));
      const keep = !this.grounded && this.moveDir.lengthSq() < 0.01 ? 0.15 : 1;
      this.vel.x += (tx - this.vel.x) * Math.min(1, k * 4 * keep);
      this.vel.z += (tz - this.vel.z) * Math.min(1, k * 4 * keep);
    }

    // gravity & glide
    const g = 32;
    this.vel.y -= g * dt;
    if (s.glide && Input.held.jump && this.vel.y < -2.5 && !this.grounded) this.vel.y = -2.5;

    // knockback
    if (this.knock.lengthSq() > 0.01) {
      this.moveH(this.knock.x * dt, this.knock.z * dt);
      this.knock.multiplyScalar(Math.max(0, 1 - dt * 5));
    }
    if (!this.moveH(this.vel.x * dt, this.vel.z * dt) && !this.grounded) {
      this.vel.x *= 0.5;
      this.vel.z *= 0.5;
    }
    this.pos.y += this.vel.y * dt;
    w.collide(this.pos, 0.55);
    w.clampBounds(this.pos);
    const gh = w.groundAt(this.pos.x, this.pos.z, this.pos.y - this.vel.y * dt);
    if (this.pos.y <= gh) {
      const landing = !this.grounded && this.vel.y < -1;
      if (landing) {
        const impact = -this.vel.y;
        this.sqv -= Math.min(7, impact * 0.28);
        this.hopReady = true;
        for (const id in this.items) {
          const it = ITEMS[id];
          if (it.onLand) it.onLand(this.items[id], impact, this);
        }
        if (impact > 14) {
          this.camDipV -= Math.min(6, impact * 0.18);
          particles(this.pos, 0xddddcc, 8, 4, 0.4, 0.3, 14);
        }
      }
      this.pos.y = gh;
      if (this.vel.y < 0) this.vel.y = 0;
      if (landing) {
        if (this.leapS?.onLand) {
          const cb = this.leapS.onLand;
          this.leapS = null;
          cb();
        }
        this.leapS = null;
        this.landT = 0;
        particles(this.pos, 0xddddcc, 3, 2, 0.3, 0.25);
      }
      this.grounded = true;
    } else if (this.pos.y > gh + 0.15) {
      this.grounded = false;
    } else if (this.vel.y <= 0) {
      this.pos.y = gh;
      this.grounded = true;
    }

    // jump pads launch you up to the floating islands
    this.padCd = Math.max(0, (this.padCd || 0) - dt);
    if (this.grounded && this.padCd <= 0) {
      for (const pad of w.jumpPads) {
        if (Math.hypot(pad.x - this.pos.x, pad.z - this.pos.z) < 1.8 && Math.abs(pad.y - this.pos.y) < 1) {
          this.vel.y = pad.power;
          this.grounded = false;
          this.padCd = 0.6;
          this.pos.y += 0.1;
          particles(this.pos, 0x55ffdd, 20, 6, 0.5);
          sfx('jump');
          sfx('dash');
          track('jumpPads');
        }
      }
    }

    // liquid damage
    if (inLiquid && w.stage.liquid.dps > 0) {
      this.liquidT = (this.liquidT || 0) - dt;
      if (this.liquidT <= 0) {
        this.liquidT = 0.5;
        this.takeDamage(this.stats.maxHp * w.stage.liquid.dps * 0.5, null, { noThorns: true });
        particles(this.pos, w.stage.liquid.color, 6, 3, 0.4);
      }
    }
  }

  updateCombat(dt) {
    // abilities
    for (let i = 0; i < 3; i++) {
      const slot = SLOTS[i];
      const ab = this.char.abilities[i];
      const maxC = this.maxCharges(i);
      const full = this.cooldownFor(slot);
      this.cdMax[slot] = full;
      if (this.charges[slot] < maxC) {
        if (this.cd[slot] <= 0) this.cd[slot] = full;
        this.cd[slot] -= dt;
        if (this.cd[slot] <= 0) {
          this.charges[slot]++;
          this.cd[slot] = this.charges[slot] < maxC ? full : 0;
        }
      } else this.cd[slot] = 0;
      if (Input.pressed[slot] || (Input.held[slot] && slot !== 'ultimate' && Input.device !== 'touch')) this.tryCast(slot, i);
    }

    // channel
    if (this.channelS) {
      const c = this.channelS;
      c.t -= dt;
      c.acc += dt;
      while (c.acc >= c.tick && c.t > -0.001) {
        c.acc -= c.tick;
        c.fn();
      }
      if (c.t <= 0) this.channelS = null;
    }

    // primary
    this.primaryT -= dt;
    const prim = this.char.primary;
    const auto = this.autoTarget && !this.autoTarget.dead ? this.autoTarget : null;
    const firing = (auto || Input.held.primary) && !this.channelS && !this.dashS;
    if (this.charId === 'bulwark') this.cs.spin = firing ? Math.min(3, (this.cs.spin || 0) + dt) : Math.max(0, (this.cs.spin || 0) - dt * 2);
    if (firing && this.primaryT <= 0) {
      const wm = this.weaponMods('primary');
      const rate = (prim.rateFn ? prim.rateFn(this) : prim.rate) * this.stats.attackSpeed * wm.rate;
      this.primaryT = 1 / rate;
      if (auto) {
        // face the auto-target for this attack (melee arcs and muzzles use aimYaw)
        this.aimYaw = Math.atan2(-(auto.pos.x - this.pos.x), -(auto.pos.z - this.pos.z));
        this.withWeapon('primary', () => prim.fire(this, this.autoAim));
      } else this.withWeapon('primary', () => prim.fire(this, this.aim));
      this.fireExtraProjectiles(prim, auto, this.stats.projectiles + wm.proj);
      this.lastAttackT = 0;
    }
  }

  /**
   * Multishot: extra primary attacks (from tomes / weapon levels) at the next-closest
   * enemies, slightly staggered. A fractional count is a chance for one more.
   */
  fireExtraProjectiles(prim, auto, count) {
    if (!(count > 0)) return;
    let n = Math.floor(count) + (Math.random() < count % 1 ? 1 : 0);
    n = Math.min(n, 12);
    if (!n) return;
    const range = (prim.range || this.char.primary.range || 45) + 4;
    const targets = G.enemies
      .filter((e) => !e.dead && e.spawnT <= 0 && e !== auto && e.pos.distanceTo(this.pos) < range)
      .sort((a, b) => a.pos.distanceToSquared(this.pos) - b.pos.distanceToSquared(this.pos));
    for (let k = 0; k < n; k++) {
      const tgt = targets[k % Math.max(1, targets.length)] || auto;
      after(0.05 * (k + 1), () => {
        if (this.dead) return;
        const yaw = this.aimYaw;
        let aim = this.aim;
        if (tgt && !tgt.dead) {
          const pt = new THREE.Vector3(tgt.pos.x, tgt.pos.y + tgt.height * tgt.scale * 0.5, tgt.pos.z);
          aim = { point: pt, groundPoint: tgt.pos.clone(), target: tgt, dirFrom: (from) => pt.clone().sub(from).normalize() };
          this.aimYaw = Math.atan2(-(tgt.pos.x - this.pos.x), -(tgt.pos.z - this.pos.z));
        } else {
          // nothing else to hit: fan out around the current aim
          const off = (k % 2 ? 1 : -1) * (0.12 + 0.06 * k);
          const dir = new THREE.Vector3(-Math.sin(yaw + off), 0, -Math.cos(yaw + off));
          const pt = this.pos.clone().addScaledVector(dir, 30).setY(this.pos.y + 1.2);
          aim = { point: pt, groundPoint: pt.clone(), target: null, dirFrom: (from) => pt.clone().sub(from).normalize() };
          this.aimYaw = yaw + off;
        }
        this.withWeapon('primary', () => prim.fire(this, aim));
        this.aimYaw = yaw;
      });
    }
  }

  tryCast(slot, i) {
    if (this.charges[slot] <= 0) return false;
    const ab = this.char.abilities[i];
    this.aimYaw = this.aim.target ? this.aimYaw : this.camYaw;
    const chanBefore = this.channelS;
    const res = this.withWeapon(slot, () => ab.cast(this, this.aim));
    if (this.channelS && this.channelS !== chanBefore) {
      // channelled abilities keep the weapon's bonuses for every tick
      const c = this.channelS, fn = c.fn;
      c.fn = () => this.withWeapon(slot, fn);
    }
    if (res === false) return false;
    let refund = !!(this.char.passive.onCast && this.char.passive.onCast(slot, this) === 'refund');
    for (const id in this.items) {
      const it = ITEMS[id];
      if (it.onCast && it.onCast(this.items[id], slot, this) === 'refund') refund = true;
    }
    if (refund) floatText(this.pos.clone().setY(this.pos.y + 2.2), 'FREE CAST', '#9fe8ff');
    else {
      this.charges[slot]--;
      if (this.cd[slot] <= 0) this.cd[slot] = this.cooldownFor(slot);
    }
    this.lastAttackT = 0;
    this.lastCastT = 0;
    track('abilitiesUsed');
    if (slot === 'ultimate') track('ultsUsed');
    return true;
  }

  updateModel(dt) {
    const m = this.model;
    m.position.copy(this.pos);
    // facing
    const hs = Math.hypot(this.vel.x, this.vel.z);
    let targetYaw = this.yaw;
    if (this.lastAttackT < 1.0 || this.channelS) targetYaw = this.aimYaw;
    else if (hs > 0.5) targetYaw = Math.atan2(-this.vel.x, -this.vel.z);
    this.yaw = lerpAngle(this.yaw, targetYaw, Math.min(1, dt * 14));
    m.rotation.set(0, this.yaw + Math.PI, 0);
    m.visible = this.stealthT <= 0 || Math.sin(G.realTime * 30) > 0.85;
    if (this.stealthT > 0 && Math.random() < 0.5) particles(this.pos, 0x8a5aff, 1, 1, 0.5, 0.2, -1);
    if (this.invulnT > 0 && !this.dashS) m.visible = m.visible && Math.sin(G.realTime * 40) > -0.3;

    // walk cycle
    const r = this.rig;
    const moving = this.grounded && hs > 0.5;
    this.walkPhase += dt * (moving ? hs * 1.3 : 0);
    const k = moving ? Math.min(1, hs / 6) : 0;
    const sw = Math.sin(this.walkPhase) * 0.9 * k;
    if (!this.grounded) {
      r.legL.rotation.x = -0.6;
      r.legR.rotation.x = 0.3;
    } else {
      r.legL.rotation.x = sw;
      r.legR.rotation.x = -sw;
    }
    r.body.position.y = moving ? Math.abs(Math.cos(this.walkPhase)) * 0.08 : Math.sin(G.realTime * 2) * 0.03;
    let armL = -sw * 0.7, armR = sw * 0.7, twist = 0;
    // attack animations
    this.animT += dt;
    const t = this.animT;
    switch (this.animType) {
      case 'shoot':
        if (t < 0.35) { armR = -1.5; armL = this.charId === 'vanguard' ? -1.5 : armL; }
        break;
      case 'cast':
        if (t < 0.35) { armR = -1.6 + t; armL = -1.2 + t; }
        break;
      case 'swing':
        if (t < 0.3) {
          const a = t / 0.3;
          armR = -2.6 + a * 3.6;
          twist = (0.5 - a) * 1.0;
        }
        break;
      case 'punch':
        if (t < 0.18) { armR = -1.6; twist = -0.3; }
        else if (t < 0.36) { armL = -1.6; twist = 0.3; }
        break;
      case 'windup':
        if (t < 0.6) { armR = -3; armL = -3; twist = 0.4; }
        break;
      case 'slam':
        if (t < 0.4) { armR = 0.6; armL = 0.6; twist = 0; }
        break;
      case 'spin':
        twist = t * 25;
        armL = armR = -1.57;
        break;
    }
    r.armL.rotation.x = armL;
    r.armR.rotation.x = armR;
    r.body.rotation.y = twist;
    // squash & stretch spring
    this.sqv += (-200 * this.sq - 13 * this.sqv) * dt;
    this.sq = Math.max(-0.35, Math.min(0.35, this.sq + this.sqv * dt));
    m.scale.set(1 - this.sq * 0.4, 1 + this.sq, 1 - this.sq * 0.4);
    // lean into movement: forward with speed, sideways into turns
    const fyaw = this.yaw + Math.PI;
    const fwd = this.vel.x * Math.sin(fyaw) + this.vel.z * Math.cos(fyaw);
    const side = this.vel.x * Math.cos(fyaw) - this.vel.z * Math.sin(fyaw);
    this.leanF += (Math.max(-0.2, Math.min(0.25, fwd * 0.018)) - this.leanF) * Math.min(1, dt * 8);
    this.lean += (Math.max(-0.3, Math.min(0.3, side * 0.03)) - this.lean) * Math.min(1, dt * 8);
    m.rotation.order = 'YXZ';
    m.rotation.x = this.grounded ? this.leanF : 0;
    m.rotation.z = -this.lean;
    if (this.charId === 'bulwark' && this.cs.spin > 0.1) {
      r.armR.rotation.x = -1.4;
      r.armL.rotation.x = -1.4;
      r.handR.rotation.z += dt * this.cs.spin * 20;
    }
    if (this.dashS) r.body.rotation.x = 0.5;
    else r.body.rotation.x = 0;
  }

  dispose() {
    G.scene.remove(this.model);
  }
}

export function xpFor(level) {
  return Math.round(16 * Math.pow(1.2, level - 1) + 6 * level);
}
