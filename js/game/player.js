// The player: third-person movement + camera, aiming, abilities, stats,
// items, buffs, damage intake and animation.
import * as THREE from 'three';
import { G } from '../core/state.js';
import { Input } from '../core/input.js';
import { CHARACTERS } from '../data/characters.js';
import { ITEMS } from '../data/items.js';
import { UPGRADES } from '../data/upgrades.js';
import { buildCharacter } from './models.js';
import { targetNearAim, nearestEnemy, applyFreeze, dealDamage, findTargets, explode } from './combat.js';
import { particles, shake, floatText, ring } from './fx.js';
import { sfx } from '../core/audio.js';
import { track, trackMax, discover } from '../core/save.js';
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
    const { root, rig } = buildCharacter(charId);
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
    this.upgrades = [];
    this.buffs = {};
    this.cs = {}; // per-character scratch state
    this.itemTimers = {};
    this.medkitQueue = [];
    this.infusionHp = 0;

    this.cd = { ability1: 0, ability2: 0, ultimate: 0 };
    this.cdMax = { ability1: 1, ability2: 1, ultimate: 1 };
    this.charges = {};
    SLOTS.forEach((s, i) => (this.charges[s] = this.char.abilities[i].charges || 1));
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

    this.camRayOrigin = new THREE.Vector3();
    this.camRayDir = new THREE.Vector3(0, 0, -1);
    this.aim = {
      point: new THREE.Vector3(),
      groundPoint: new THREE.Vector3(),
      target: null,
      dirFrom: (from) => _v2.copy(this.aim.point).sub(from).normalize().clone(),
    };

    this.stats = {};
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
    };
    if (this.char.passive.mods) this.char.passive.mods(m, this);
    for (const id in this.items) {
      const it = ITEMS[id];
      if (it.mods) it.mods(m, this.items[id]);
    }
    for (const u of this.upgrades) {
      const def = UPGRADES.find((x) => x.id === u.id);
      if (def) def.apply(m, u.value);
    }
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
    s.crit = Math.min(1, 0.05 + m.crit);
    s.critMult = 2 + m.critMult;
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
    s.dodge = m.dodge;
    s.maxShield = s.maxHp * m.shield;
    s.chestDiscount = m.chestDiscount;
    s.execute = m.execute;
    s.kbImmune = m.kbImmune;
    s.glide = m.glide;
    s.burnVuln = m.burnVuln;
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
    this.dirty = true;
  }

  applyUpgrade(id, value) {
    this.upgrades.push({ id, value });
    this.dirty = true;
  }

  addXp(v) {
    this.xp += v;
    while (this.xp >= this.xpNext) {
      this.xp -= this.xpNext;
      this.level++;
      this.xpNext = xpFor(this.level);
      this.pendingLevelUps++;
      this.dirty = true;
      this.recalcStats();
      this.hp = Math.min(this.stats.maxHp, this.hp + this.stats.maxHp * 0.1);
      trackMax('level', this.level);
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
    return base * (slot === 'ultimate' ? this.stats.ultCdMult : this.stats.cdMult);
  }
  reduceCooldowns(amount, slots = SLOTS) {
    for (const s of slots) if (this.cd[s] > 0) this.cd[s] = Math.max(0.001, this.cd[s] - amount);
  }
  resetCooldown(slot) {
    const i = SLOTS.indexOf(slot);
    this.charges[slot] = this.char.abilities[i].charges || 1;
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
    if (this.stats.dodge > 0 && Math.random() < this.stats.dodge) {
      floatText(this.pos.clone().setY(this.pos.y + 1), 'DODGE', '#ccccff');
      return;
    }
    const a = this.stats.armor;
    const red = a >= 0 ? 100 / (100 + a) : 2 - 100 / (100 - a);
    let dmg = amount * red;
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
    if (G.ui) G.ui.hurt(total / this.stats.maxHp);
    sfx('hurt', 0.12);
    shake(Math.min(0.4, (total / this.stats.maxHp) * 2));
    const st = o.status;
    if (st) {
      if (st.slow) this.slowT = Math.max(this.slowT, 1.5);
      if (st.burn) {
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

  updateCamera(dt) {
    this.camYaw += Input.look.x;
    this.camPitch = clamp(this.camPitch + Input.look.y, -1.25, 0.95);
    const cam = G.camera;
    const cp = Math.cos(this.camPitch), sp = Math.sin(this.camPitch);
    const fx = -Math.sin(this.camYaw) * cp, fy = sp, fz = -Math.cos(this.camYaw) * cp;
    const rx = Math.cos(this.camYaw), rz = -Math.sin(this.camYaw);
    const dist = G.isTouch ? 8 : 7;
    const shoulder = 1.1;
    const pivotY = this.pos.y + 2.2;
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
    cam.position.set(cx + sx, cy + sy, cz);
    cam.rotation.set(this.camPitch, this.camYaw, 0, 'YXZ');
    cam.updateMatrixWorld();
    this.camRayOrigin.copy(cam.position);
    this.camRayDir.set(fx, fy, fz).normalize();
  }

  updateAim() {
    const o = this.camRayOrigin, d = this.camRayDir;
    const settings = G.save.settings;
    const auto = this.autoFireActive();
    let target = null;
    if (auto) target = targetNearAim(55, 40) || nearestEnemy(this.pos, 26);
    else if (settings.aimAssist && Input.device !== 'kbm') target = targetNearAim(70, Input.device === 'touch' ? 12 : 7);
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

  autoFireActive() {
    const mode = G.save.settings.autoFire;
    return mode === 'always' || (mode === 'touch' && Input.device === 'touch');
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

    // jumping
    if (this.grounded) {
      this.coyote = 0.12;
      this.jumpsLeft = s.jumps;
    } else this.coyote -= dt;
    if (Input.pressed.jump && !this.dashS) {
      if (this.grounded || this.coyote > 0) {
        this.vel.y = s.jumpPower;
        this.jumpsLeft = s.jumps - 1;
        this.grounded = false;
        this.coyote = 0;
        sfx('jump');
      } else if (this.jumpsLeft > 0) {
        this.jumpsLeft--;
        this.vel.y = s.jumpPower * 0.95;
        particles(this.pos, 0xffffff, 6, 3, 0.3, 0.25);
        sfx('jump');
      }
      this.leapS = null;
    }

    if (this.dashS) {
      const ds = this.dashS;
      ds.t -= dt;
      this.pos.addScaledVector(ds.dir, ds.speed * dt);
      this.vel.y = Math.max(this.vel.y, 0);
      if (Math.random() < 0.8) particles(this.pos, this.char.color, 2, 1, 0.3, 0.3, 0);
      if (ds.along) {
        for (const e of findTargets(this.pos, ds.along.radius, 30)) {
          if (ds.hit.has(e)) continue;
          ds.hit.add(e);
          dealDamage(e, ds.along.damage, { procCoef: 1, knockback: 5 });
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
      const accel = this.grounded ? 70 : 28;
      const tx = this.moveDir.x * speed, tz = this.moveDir.z * speed;
      const k = Math.min(1, accel * dt / Math.max(1, speed));
      this.vel.x += (tx - this.vel.x) * Math.min(1, k * 4);
      this.vel.z += (tz - this.vel.z) * Math.min(1, k * 4);
    }

    // gravity & glide
    const g = 32;
    this.vel.y -= g * dt;
    if (s.glide && Input.held.jump && this.vel.y < -2.5 && !this.grounded) this.vel.y = -2.5;

    // knockback
    if (this.knock.lengthSq() > 0.01) {
      this.pos.addScaledVector(this.knock, dt);
      this.knock.multiplyScalar(Math.max(0, 1 - dt * 5));
    }
    this.pos.x += this.vel.x * dt;
    this.pos.z += this.vel.z * dt;
    this.pos.y += this.vel.y * dt;
    w.collide(this.pos, 0.55);
    w.clampBounds(this.pos);
    const gh = w.heightAt(this.pos.x, this.pos.z);
    if (this.pos.y <= gh) {
      const landing = !this.grounded && this.vel.y < -1;
      this.pos.y = gh;
      if (this.vel.y < 0) this.vel.y = 0;
      if (landing) {
        if (this.leapS?.onLand) {
          const cb = this.leapS.onLand;
          this.leapS = null;
          cb();
        }
        this.leapS = null;
        particles(this.pos, 0xddddcc, 3, 2, 0.3, 0.25);
      }
      this.grounded = true;
    } else if (this.pos.y > gh + 0.15) {
      this.grounded = false;
    } else if (this.vel.y <= 0) {
      // snap down small steps when walking downhill
      this.pos.y = gh;
      this.grounded = true;
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
      const maxC = ab.charges || 1;
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
    const auto = this.autoFireActive() && this.aim.target;
    const firing = (Input.held.primary || auto) && !this.channelS && !this.dashS;
    if (this.charId === 'bulwark') this.cs.spin = firing ? Math.min(3, (this.cs.spin || 0) + dt) : Math.max(0, (this.cs.spin || 0) - dt * 2);
    if (firing && this.primaryT <= 0) {
      const rate = (prim.rateFn ? prim.rateFn(this) : prim.rate) * this.stats.attackSpeed;
      this.primaryT = 1 / rate;
      prim.fire(this, this.aim);
      this.lastAttackT = 0;
    }
  }

  tryCast(slot, i) {
    if (this.charges[slot] <= 0) return false;
    const ab = this.char.abilities[i];
    this.aimYaw = this.aim.target ? this.aimYaw : this.camYaw;
    const res = ab.cast(this, this.aim);
    if (res === false) return false;
    this.charges[slot]--;
    if (this.cd[slot] <= 0) this.cd[slot] = this.cooldownFor(slot);
    this.lastAttackT = 0;
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
