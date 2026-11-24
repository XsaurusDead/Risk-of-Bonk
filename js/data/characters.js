// The 10 playable survivors. Each has a passive, a primary attack (held) and
// three abilities: Ability 1, Ability 2 and an Ultimate.
//
// Damage numbers are coefficients of the player's damage stat (p.stats.damage).
// Cooldowns are in seconds and reduced by cooldown-reduction items/upgrades.
import * as THREE from 'three';
import {
  hitscan, meleeArc, explode, spawnProjectile, spawnZone, after, findTargets, nearestEnemy,
  applyBurn, applyChill, applyFreeze, applySlow, applyStun, dealDamage, targetNearAim, applyPoison, chainLightning,
} from '../game/combat.js';
import { spawnMinion } from '../game/minions.js';
import { particles, ring, telegraph, beam, shake, floatText } from '../game/fx.js';
import { sfx } from '../core/audio.js';
import { G } from '../core/state.js';
import { track } from '../core/save.js';

const V = () => new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const _a = new THREE.Vector3();

/** Horizontal unit vector the player is aiming at. */
function aimFlat(p) {
  return V().set(-Math.sin(p.aimYaw), 0, -Math.cos(p.aimYaw));
}
/** Movement direction if moving, otherwise aim direction. */
function moveOrAim(p) {
  return p.moveDir.lengthSq() > 0.01 ? p.moveDir.clone().normalize() : aimFlat(p);
}
function spread(dir, yawOffset, pitchOffset = 0) {
  const d = dir.clone();
  d.applyAxisAngle(UP, yawOffset);
  if (pitchOffset) {
    const right = V().crossVectors(d, UP).normalize();
    d.applyAxisAngle(right, pitchOffset);
  }
  return d;
}

export const CHARACTERS = {
  // =====================================================================
  vanguard: {
    name: 'Vanguard', title: 'The Reliable Gunner', color: '#4fa3ff', difficulty: 1,
    lore: 'A veteran soldier with twin blasters. Easy to learn, strong at every range.',
    base: { hp: 110, damage: 12, speed: 8.6, armor: 0, regen: 1.0, jumps: 2 },
    ratings: { hp: 3, dmg: 3, speed: 3, range: 4 },
    passive: {
      name: 'Tactical Focus', icon: '🎯',
      desc: '+10% critical chance. Critical hits reduce all ability cooldowns by 0.2s.',
      mods: (m) => (m.crit += 0.1),
      onHit: (h, p) => { if (h.crit && h.procCoef > 0) p.reduceCooldowns(0.2, ['ability1', 'ability2', 'ultimate']); },
    },
    primary: {
      name: 'Twin Blasters', icon: '🔫', rate: 5, desc: 'Rapid hitscan shots for 100% damage.',
      fire(p, aim) {
        p.cs.side = -(p.cs.side || 1);
        hitscan(p.muzzle(p.cs.side * 0.35), aim.point, 140, p.stats.damage * 1.0, { color: 0x7fd0ff, width: 0.06 });
        sfx('shoot');
        p.anim('shoot');
      },
    },
    abilities: [
      {
        name: 'Piercing Rail', icon: '⚡', cd: 4, desc: 'Fire a rail shot that pierces everything for 500% damage.',
        cast(p, aim) {
          hitscan(p.muzzle(0), aim.point, 160, p.stats.damage * 5, { pierce: true, color: 0x66ccff, width: 0.4, knockback: 6, life: 0.25 });
          sfx('laser');
          shake(0.15);
          p.anim('shoot');
        },
      },
      {
        name: 'Tactical Roll', icon: '🌀', cd: 5, desc: 'Roll a short distance, becoming briefly invulnerable. Reduces Piercing Rail cooldown by 2s.',
        cast(p) {
          p.dash(moveOrAim(p), 11, 0.25, { invuln: 0.35 });
          p.reduceCooldowns(2, ['ability1']);
          sfx('dash');
        },
      },
      {
        name: 'Bullet Storm', icon: '🌪️', cd: 40, ult: true, desc: 'For 3s, auto-fire 14 shots per second at nearby enemies for 120% damage each.',
        cast(p) {
          p.channel(3, 1 / 14, () => {
            const targets = findTargets(p.pos, 45, 6);
            const t = targets.length ? targets[Math.floor(Math.random() * targets.length)] : null;
            p.cs.side = -(p.cs.side || 1);
            const from = p.muzzle(p.cs.side * 0.35);
            const to = t ? t.pos.clone().setY(t.pos.y + t.height * 0.5) : p.aim.point;
            hitscan(from, to, 140, p.stats.damage * 1.2, { color: 0xffdd55, width: 0.07 });
            sfx('shoot');
            p.anim('shoot');
          });
        },
      },
    ],
  },

  // =====================================================================
  bonker: {
    name: 'Bonker', title: 'The Megabonk Brute', color: '#ff9a3c', difficulty: 1,
    lore: 'Carries a club the size of a door. Solves every problem the same way.',
    base: { hp: 165, damage: 14, speed: 8.2, armor: 20, regen: 1.5, jumps: 2 },
    ratings: { hp: 5, dmg: 4, speed: 2, range: 1 },
    passive: {
      name: 'Rage', icon: '😤',
      desc: '+20 armor. Taking damage builds Rage: +5% damage per stack (max 10) for 6s. Bonks knock enemies back.',
      onDamaged: (amt, p) => p.addStackBuff('rage', 6, 10, { damage: 0.05 }),
    },
    primary: {
      name: 'Bonk', icon: '🏏', rate: 1.8, desc: 'Swing your club in a wide arc for 230% damage with knockback.',
      fire(p) {
        meleeArc(p.pos, p.aimYaw, 5, 140, p.stats.damage * 2.3, { knockback: 9, color: 0xffc070 });
        sfx('swing');
        p.anim('swing');
      },
    },
    abilities: [
      {
        name: 'Ground Pound', icon: '💥', cd: 6, desc: 'Leap into the air and crash down, dealing 450% damage around you and stunning.',
        cast(p) {
          const f = moveOrAim(p).multiplyScalar(9);
          p.leap(15, f, () => {
            explode(p.pos, 7, p.stats.damage * 4.5, { stun: 1.2, knockback: 10, color: 0xffb060, big: true });
            shake(0.5);
            sfx('boom');
          });
          sfx('jump');
        },
      },
      {
        name: 'War Cry', icon: '📢', cd: 12, desc: 'Heal 15% max HP, gain +80 armor and +25% speed for 5s, and stun nearby enemies.',
        cast(p) {
          p.heal(p.stats.maxHp * 0.15);
          p.addBuff('warcry', 5, { armor: 80, moveSpeed: 0.25 });
          for (const e of findTargets(p.pos, 12, 50)) applyStun(e, 1);
          ring(p.pos, 12, 0xffaa33, 0.5);
          sfx('roar');
        },
      },
      {
        name: 'MEGA BONK', icon: '🔨', cd: 45, ult: true, desc: 'Wind up and slam a gigantic club for 2200% damage in a huge area, stunning for 3s.',
        cast(p) {
          p.addBuff('megabonk_windup', 0.6, { armor: 100 });
          p.anim('windup');
          const center = p.pos.clone().add(aimFlat(p).multiplyScalar(5));
          telegraph(center, 9 * p.stats.area, 0xffaa33, 0.55);
          after(0.55, () => {
            const c = p.pos.clone().add(aimFlat(p).multiplyScalar(5));
            explode(c, 9, p.stats.damage * 22, { stun: 3, knockback: 18, color: 0xffcc55, big: true });
            ring(c, 14 * p.stats.area, 0xffffff, 0.6);
            p.anim('slam');
            shake(1.2);
            sfx('bigboom');
          });
        },
      },
    ],
  },

  // =====================================================================
  pyra: {
    name: 'Pyra', title: 'The Pyromancer', color: '#ff4a2a', difficulty: 2,
    lore: 'Burned down three academies before graduating. Graduated anyway.',
    base: { hp: 95, damage: 13, speed: 8.6, armor: 0, regen: 1.0, jumps: 2 },
    ratings: { hp: 2, dmg: 5, speed: 3, range: 4 },
    passive: {
      name: 'Ignition', icon: '🔥',
      desc: 'All your damage sets enemies ablaze, burning for an extra 30% of the hit over 3s.',
      onHit: (h, p) => { if (h.procCoef > 0) applyBurn(h.enemy, (h.damage * 0.3) / 3, 3); },
    },
    primary: {
      name: 'Fireball', icon: '☄️', rate: 2.4, desc: 'Hurl a fireball that explodes for 140% damage.',
      fire(p, aim) {
        spawnProjectile({ pos: p.muzzle(0.3), dir: aim.dirFrom(p.muzzle(0.3)), speed: 50, damage: p.stats.damage * 1.4, explodeRadius: 2.5, color: 0xff6a22, size: 0.35, trail: 0xffaa44, procCoef: 1 });
        sfx('shoot');
        p.anim('cast');
      },
    },
    abilities: [
      {
        name: 'Flame Wave', icon: '🌊', cd: 5, desc: 'Unleash a cone of fire for 450% damage.',
        cast(p) {
          meleeArc(p.pos, p.aimYaw, 13, 70, p.stats.damage * 4.5, { color: 0xff7733, knockback: 4 });
          const d = aimFlat(p);
          for (let i = 0; i < 6; i++) {
            const dd = spread(d, (Math.random() - 0.5) * 1.1);
            particles(p.pos.clone().addScaledVector(dd, 3 + i * 1.6).setY(p.pos.y + 1), 0xff6622, 6, 5, 0.5, 0.5);
          }
          sfx('boom');
          p.anim('cast');
        },
      },
      {
        name: 'Blink', icon: '✨', cd: 6, desc: 'Teleport forward, leaving an explosion for 250% damage where you stood.',
        cast(p) {
          explode(p.pos.clone(), 5, p.stats.damage * 2.5, { color: 0xff5522 });
          p.teleport(moveOrAim(p), 13);
          p.invulnT = Math.max(p.invulnT, 0.25);
          sfx('dash');
        },
      },
      {
        name: 'Meteor Shower', icon: '🌠', cd: 50, ult: true, desc: 'Call down 16 meteors around your aim point over 3s, each dealing 380% damage.',
        cast(p, aim) {
          const center = aim.groundPoint.clone();
          for (let i = 0; i < 16; i++) {
            after(i * 0.18, () => {
              const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 10;
              const pos = center.clone().add(_a.set(Math.cos(a) * r, 0, Math.sin(a) * r));
              pos.y = G.world.heightAt(pos.x, pos.z);
              telegraph(pos, 4.5 * p.stats.area, 0xff5522, 0.6);
              after(0.6, () => {
                beam(pos.clone().setY(pos.y + 30), pos, 0xff7733, 0.9, 0.2);
                explode(pos, 4.5, p.stats.damage * 3.8, { color: 0xff5522, big: true });
                shake(0.15);
                sfx('boom', 0.06);
              });
            });
          }
          p.anim('cast');
        },
      },
    ],
  },

  // =====================================================================
  glacia: {
    name: 'Glacia', title: 'The Frost Warden', color: '#7fe3ff', difficulty: 2,
    lore: 'Keeper of the eternal winter. Patient, precise, and very, very cold.',
    base: { hp: 105, damage: 12, speed: 8.4, armor: 10, regen: 1.0, jumps: 2 },
    ratings: { hp: 3, dmg: 3, speed: 3, range: 4 },
    passive: {
      name: 'Permafrost', icon: '❄️',
      desc: 'Hits Chill enemies (-30% speed). 4 Chill stacks Freeze them. Frozen enemies take +40% damage.',
      onHit: (h) => { if (h.procCoef > 0) applyChill(h.enemy, 1); },
      modifyDamage: (e, dmg) => (e.status.freeze > 0 ? dmg * 1.4 : dmg),
    },
    primary: {
      name: 'Ice Shards', icon: '🔹', rate: 2, desc: 'Fire 3 ice shards in a spread, 75% damage each.',
      fire(p, aim) {
        const from = p.muzzle(0.3);
        const d = aim.dirFrom(from);
        for (const o of [-0.09, 0, 0.09]) {
          spawnProjectile({ pos: from, dir: spread(d, o), speed: 58, damage: p.stats.damage * 0.75, color: 0xaaf0ff, size: 0.22, shape: 'shard', procCoef: 0.8 });
        }
        sfx('shoot');
        p.anim('cast');
      },
    },
    abilities: [
      {
        name: 'Frost Nova', icon: '💠', cd: 7, desc: 'Blast frost around you for 320% damage, freezing enemies for 2s.',
        cast(p) {
          explode(p.pos, 8, p.stats.damage * 3.2, { freeze: 2, color: 0x99eeff, big: true });
          sfx('freeze');
        },
      },
      {
        name: 'Glacial Armor', icon: '🧊', cd: 12, desc: 'Gain a barrier of 35% max HP and +30 armor for 5s. Attackers are frozen.',
        cast(p) {
          p.addBarrier(p.stats.maxHp * 0.35);
          p.addBuff('glacial_armor', 5, { armor: 30 });
          ring(p.pos, 4, 0x99eeff, 0.4);
          sfx('freeze');
        },
      },
      {
        name: 'Blizzard', icon: '🌨️', cd: 45, ult: true, desc: 'Summon a blizzard for 8s that deals 120% damage every 0.5s and chills heavily.',
        cast(p, aim) {
          spawnZone({
            pos: aim.groundPoint.clone(), radius: 12, duration: 8, tick: 0.5, color: 0xaaeeff, kind: 'blizzard',
            onTick: (z) => {
              for (const e of findTargets(z.pos, z.radius, 60)) {
                dealDamage(e, p.stats.damage * 1.2, { procCoef: 0.5, color: '#aaeeff' });
                applyChill(e, 1);
              }
            },
          });
          sfx('freeze');
        },
      },
    ],
  },

  // =====================================================================
  kestrel: {
    name: 'Kestrel', title: 'The Wind Ranger', color: '#5fd46a', difficulty: 2,
    lore: 'Never misses, never stays still. Her arrows find their own way home.',
    base: { hp: 95, damage: 12, speed: 9.6, armor: 0, regen: 1.0, jumps: 3 },
    ratings: { hp: 2, dmg: 3, speed: 5, range: 5 },
    passive: {
      name: 'Hawkeye', icon: '🦅',
      desc: 'Deal up to +50% damage to distant enemies (scales from 8m to 35m). Triple jump.',
      modifyDamage: (e, dmg, o, p) => {
        const d = e.pos.distanceTo(p.pos);
        return dmg * (1 + 0.5 * Math.min(1, Math.max(0, (d - 8) / 27)));
      },
    },
    primary: {
      name: 'Seeking Arrow', icon: '🏹', rate: 2.2, desc: 'Fire an arrow that homes in on the target nearest your crosshair for 170% damage.',
      fire(p, aim) {
        const target = aim.target || targetNearAim(60, 25);
        const crit = p.cs.critShots > 0 ? true : undefined;
        if (p.cs.critShots > 0) p.cs.critShots--;
        const from = p.muzzle(0.3);
        spawnProjectile({ pos: from, dir: aim.dirFrom(from), speed: 62, damage: p.stats.damage * 1.7, homing: 10, target, color: 0xd8ffb0, size: 0.18, shape: 'arrow', procCoef: 1, crit });
        sfx('shoot');
        p.anim('shoot');
      },
    },
    abilities: [
      {
        name: 'Arrow Fan', icon: '🎐', cd: 4, desc: 'Loose 7 piercing arrows in a fan for 150% damage each.',
        cast(p, aim) {
          const from = p.muzzle(0.3);
          const d = aim.dirFrom(from);
          for (let i = 0; i < 7; i++) {
            spawnProjectile({ pos: from, dir: spread(d, (i - 3) * 0.13), speed: 60, damage: p.stats.damage * 1.5, pierce: 1, color: 0xb0ff9a, size: 0.18, shape: 'arrow', procCoef: 0.7 });
          }
          sfx('shoot');
          p.anim('shoot');
        },
      },
      {
        name: 'Disengage', icon: '🍃', cd: 6, desc: 'Backflip away, slowing nearby enemies by 50%. Your next 3 arrows are critical hits.',
        cast(p) {
          for (const e of findTargets(p.pos, 7, 40)) applySlow(e, 0.5, 3);
          ring(p.pos, 7, 0x88ff88, 0.35);
          p.leap(12, aimFlat(p).multiplyScalar(-13), null);
          p.invulnT = Math.max(p.invulnT, 0.3);
          p.cs.critShots = 3;
          sfx('dash');
        },
      },
      {
        name: 'Arrow Rain', icon: '🌧️', cd: 40, ult: true, desc: 'Rain arrows on an area for 4s, dealing 90% damage to all enemies inside 5 times per second.',
        cast(p, aim) {
          spawnZone({
            pos: aim.groundPoint.clone(), radius: 10, duration: 4, tick: 0.2, color: 0x88ff88, kind: 'arrows',
            onTick: (z) => {
              for (const e of findTargets(z.pos, z.radius, 60)) dealDamage(e, p.stats.damage * 0.9, { procCoef: 0.25, color: '#c8ffb0' });
            },
          });
          sfx('shoot');
        },
      },
    ],
  },

  // =====================================================================
  tinker: {
    name: 'Tinker', title: 'The Engineer', color: '#ffd23c', difficulty: 3,
    lore: 'Why fight when your inventions can do it for you?',
    base: { hp: 120, damage: 11, speed: 8.2, armor: 5, regen: 1.0, jumps: 2 },
    ratings: { hp: 3, dmg: 3, speed: 2, range: 4 },
    passive: {
      name: 'Overclocked Tech', icon: '🔧',
      desc: 'Turrets and mines inherit your items and on-hit effects. +1 max turret for every 10 items held.',
    },
    primary: {
      name: 'Bounce Grenade', icon: '💣', rate: 1.5, desc: 'Lob a grenade that explodes for 190% damage.',
      fire(p, aim) {
        const from = p.muzzle(0.3);
        const d = aim.dirFrom(from);
        d.y += 0.12;
        spawnProjectile({ pos: from, dir: d, speed: 38, gravity: 22, damage: p.stats.damage * 1.9, explodeRadius: 3.2, color: 0x556633, size: 0.3, procCoef: 1 });
        sfx('shoot');
        p.anim('shoot');
      },
    },
    abilities: [
      {
        name: 'Deploy Turret', icon: '🗼', cd: 10, charges: 2, desc: 'Build a turret that fires 4 shots per second for 70% damage. Lasts 35s. Holds 2 charges.',
        cast(p) {
          const pos = p.pos.clone().add(aimFlat(p).multiplyScalar(2.5));
          const max = 2 + Math.floor(p.itemCount / 10);
          const turrets = G.minions.filter((m) => m.type === 'turret' && !m.dead);
          while (turrets.length >= max) turrets.shift().kill();
          spawnMinion('turret', pos, {});
          sfx('chest');
        },
      },
      {
        name: 'Shock Mine', icon: '🧨', cd: 8, desc: 'Throw a mine that detonates near enemies for 350% damage and stuns for 2s.',
        cast(p, aim) {
          const from = p.muzzle(0.3);
          const d = aim.dirFrom(from);
          d.y += 0.25;
          spawnProjectile({
            pos: from, dir: d, speed: 24, gravity: 25, damage: 0, color: 0x33aaff, size: 0.35, life: 3, hitsEnemies: false,
            onGround: (pos) => spawnMinion('mine', pos, {}),
          });
          sfx('shoot');
        },
      },
      {
        name: 'Orbital Strike', icon: '🛰️', cd: 60, ult: true, desc: 'After 1.5s, a satellite laser scorches the target area for 3s, dealing 200% damage 7 times per second.',
        cast(p, aim) {
          const pos = aim.groundPoint.clone();
          telegraph(pos, 9 * p.stats.area, 0x55ccff, 1.5);
          after(1.5, () => {
            sfx('laser');
            spawnZone({
              pos, radius: 9, duration: 3, tick: 0.15, color: 0x55ccff, kind: 'orbital',
              onTick: (z) => {
                for (const e of findTargets(z.pos, z.radius, 60)) dealDamage(e, p.stats.damage * 2, { procCoef: 0.3, color: '#88ddff', source: 'deploy' });
                shake(0.05);
              },
            });
          });
        },
      },
    ],
  },

  // =====================================================================
  kaze: {
    name: 'Kaze', title: 'The Wind Monk', color: '#e8e8ff', difficulty: 3,
    lore: 'Moves like the wind, hits like a hurricane. Has never touched the ground for long.',
    base: { hp: 110, damage: 13, speed: 10, armor: 5, regen: 1.2, jumps: 3 },
    ratings: { hp: 3, dmg: 4, speed: 5, range: 1 },
    passive: {
      name: 'Flow State', icon: '☯️',
      desc: 'Every 3rd primary strike deals triple damage and heals 2% max HP. Triple jump.',
    },
    primary: {
      name: 'Swift Palm', icon: '👊', rate: 3.2, desc: 'Fast palm strikes for 125% damage. Every 3rd strike is empowered.',
      fire(p) {
        p.cs.combo = ((p.cs.combo || 0) + 1) % 3;
        const empowered = p.cs.combo === 0;
        const hits = meleeArc(p.pos, p.aimYaw, empowered ? 5.5 : 4.3, empowered ? 140 : 100, p.stats.damage * 1.25 * (empowered ? 3 : 1), { knockback: empowered ? 8 : 2, color: empowered ? 0xccccff : 0xffffff });
        if (empowered) {
          if (hits) p.heal(p.stats.maxHp * 0.02);
          ring(p.pos.clone().add(aimFlat(p).multiplyScalar(2)), 3, 0xccccff, 0.25);
        }
        sfx('swing');
        p.anim(empowered ? 'swing' : 'punch');
      },
    },
    abilities: [
      {
        name: 'Rising Dragon', icon: '🐉', cd: 4, desc: 'An uppercut that deals 420% damage and launches you into the air.',
        cast(p) {
          meleeArc(p.pos, p.aimYaw, 5.5, 160, p.stats.damage * 4.2, { knockback: 6, knockup: 10, color: 0xaaaaff });
          p.leap(14, aimFlat(p).multiplyScalar(3), null);
          particles(p.pos, 0xccccff, 16, 8, 0.5);
          sfx('swing');
          p.anim('swing');
        },
      },
      {
        name: 'Gale Dash', icon: '💨', cd: 5, desc: 'Dash through enemies, dealing 320% damage to everything in your path. Invulnerable during the dash.',
        cast(p) {
          p.dash(moveOrAim(p), 15, 0.22, { invuln: 0.3, damageAlong: { radius: 2.6, damage: p.stats.damage * 3.2 } });
          sfx('dash');
        },
      },
      {
        name: 'Hundred Fists', icon: '🙏', cd: 40, ult: true, desc: 'Become invulnerable and blink between up to 12 enemies, striking each for 600% damage.',
        cast(p) {
          if (!findTargets(p.pos, 30, 1).length) return false;
          p.invulnT = Math.max(p.invulnT, 2.6);
          p.channel(2.4, 0.2, () => {
            const ts = findTargets(p.pos, 30, 8);
            if (!ts.length) return;
            const e = ts[Math.floor(Math.random() * Math.min(3, ts.length))];
            const dir = _a.copy(e.pos).sub(p.pos).setY(0).normalize();
            p.pos.copy(e.pos).addScaledVector(dir, -(e.radius + 1.2));
            p.pos.y = Math.max(p.pos.y, G.world.heightAt(p.pos.x, p.pos.z));
            p.vel.set(0, 0, 0);
            p.aimYaw = Math.atan2(-dir.x, -dir.z);
            explode(e.pos, 3, p.stats.damage * 6, { color: 0xccccff, procCoef: 0.6 });
            sfx('swing');
            p.anim('punch');
          });
        },
      },
    ],
  },

  // =====================================================================
  morrow: {
    name: 'Morrow', title: 'The Necromancer', color: '#7dff9a', difficulty: 3,
    lore: 'Death is not the end. It is a recruitment opportunity.',
    base: { hp: 100, damage: 12, speed: 8.4, armor: 0, regen: 1.0, jumps: 2 },
    ratings: { hp: 2, dmg: 3, speed: 3, range: 4 },
    passive: {
      name: 'Soul Harvest', icon: '💀',
      desc: 'Kills heal 1% max HP and have an 18% chance to raise a Skeleton ally (max 5) for 20s.',
      onKill: (e, p) => {
        p.heal(p.stats.maxHp * 0.01);
        if (Math.random() < 0.18 && G.minions.filter((m) => m.type === 'skeleton' && !m.dead).length < 5) {
          spawnMinion('skeleton', e.pos, { life: 20 });
          track('raised');
        }
      },
    },
    primary: {
      name: 'Soul Bolt', icon: '👻', rate: 2, desc: 'Fire a homing soul bolt for 150% damage.',
      fire(p, aim) {
        const from = p.muzzle(0.3);
        spawnProjectile({ pos: from, dir: aim.dirFrom(from), speed: 34, damage: p.stats.damage * 1.5, homing: 5, target: aim.target, color: 0x7dff9a, size: 0.3, trail: 0x3a8a4a, procCoef: 1 });
        sfx('shoot');
        p.anim('cast');
      },
    },
    abilities: [
      {
        name: 'Bone Spikes', icon: '🦴', cd: 6, desc: 'Erupt a line of 7 bone spikes, each dealing 280% damage.',
        cast(p) {
          const d = aimFlat(p);
          const start = p.pos.clone();
          for (let i = 1; i <= 7; i++) {
            after(i * 0.05, () => {
              const pos = start.clone().addScaledVector(d, i * 2.3);
              pos.y = G.world.heightAt(pos.x, pos.z);
              explode(pos, 2.4, p.stats.damage * 2.8, { color: 0xf0ead6, knockup: 6, procCoef: 0.7, spikes: true });
            });
          }
          sfx('boom');
          p.anim('cast');
        },
      },
      {
        name: 'Life Drain', icon: '🩸', cd: 8, desc: 'For 2s, drain up to 3 nearby enemies for 60% damage 5 times per second, healing for 25% of damage dealt.',
        cast(p) {
          if (!findTargets(p.pos, 16, 1).length) return false;
          p.channel(2, 0.2, () => {
            for (const e of findTargets(p.pos, 16, 3)) {
              beam(p.pos.clone().setY(p.pos.y + 1.4), e.pos.clone().setY(e.pos.y + e.height * 0.5), 0xff3355, 0.15, 0.2);
              const dealt = dealDamage(e, p.stats.damage * 0.6, { procCoef: 0.3, color: '#ff6688' });
              p.heal(dealt * 0.25);
            }
          });
        },
      },
      {
        name: 'Army of the Dead', icon: '⚰️', cd: 60, ult: true, desc: 'Raise 6 Skeleton Warriors that fight for you for 25s.',
        cast(p) {
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            spawnMinion('skeleton', p.pos.clone().add(_a.set(Math.cos(a) * 3, 0, Math.sin(a) * 3)), { life: 25, warrior: true });
          }
          track('raised', 6);
          ring(p.pos, 6, 0x7dff9a, 0.6);
          sfx('roar');
        },
      },
    ],
  },

  // =====================================================================
  bulwark: {
    name: 'Bulwark', title: 'The Heavy Gunner', color: '#a8b0bc', difficulty: 2,
    lore: 'Walking fortress. Walking slowly, but a fortress nonetheless.',
    base: { hp: 185, damage: 11, speed: 7.2, armor: 25, regen: 1.5, jumps: 1 },
    ratings: { hp: 5, dmg: 4, speed: 1, range: 3 },
    passive: {
      name: 'Spin Up', icon: '🌀',
      desc: 'Minigun fire rate ramps from 4 to 13 shots/s while firing. +20 armor while firing. Immune to knockback.',
      mods: (m, p) => {
        m.kbImmune = true;
        if (p.cs.spin > 0.2) m.armor += 20;
      },
    },
    primary: {
      name: 'Minigun', icon: '🔫', rate: 4, desc: 'Hitscan bullets for 65% damage. Fire rate ramps up while held.',
      rateFn: (p) => 4 + 9 * Math.min(1, (p.cs.spin || 0) / 2.5),
      fire(p, aim) {
        const from = p.muzzle(0.45);
        const d = aim.dirFrom(from);
        const s = spread(d, (Math.random() - 0.5) * 0.06, (Math.random() - 0.5) * 0.04);
        hitscan(from, from.clone().addScaledVector(s, 120), 120, p.stats.damage * 0.65, { color: 0xffee88, width: 0.05 });
        sfx('shoot', 0.05);
        p.anim('shoot');
      },
    },
    abilities: [
      {
        name: 'Rocket Barrage', icon: '🚀', cd: 7, desc: 'Fire 6 homing rockets, each exploding for 260% damage.',
        cast(p, aim) {
          const targets = findTargets(aim.groundPoint, 18, 6);
          for (let i = 0; i < 6; i++) {
            after(i * 0.07, () => {
              const from = p.muzzle(-0.4).add(_a.set(0, 0.6, 0));
              spawnProjectile({
                pos: from, dir: { x: (Math.random() - 0.5) * 0.6, y: 1, z: (Math.random() - 0.5) * 0.6 }, speed: 32, damage: p.stats.damage * 2.6,
                homing: 7, target: targets[i % Math.max(1, targets.length)] || null, homingPoint: aim.groundPoint.clone(), explodeRadius: 3.2, color: 0xff8844, size: 0.3, trail: 0xffbb66, life: 4, procCoef: 0.8,
              });
              sfx('shoot');
            });
          }
        },
      },
      {
        name: 'Fortify', icon: '🏰', cd: 12, desc: 'Gain a barrier of 40% max HP and +50 armor for 4s.',
        cast(p) {
          p.addBarrier(p.stats.maxHp * 0.4);
          p.addBuff('fortify', 4, { armor: 50 });
          ring(p.pos, 4, 0xccccdd, 0.4);
          sfx('chest');
        },
      },
      {
        name: 'Tactical Nuke', icon: '☢️', cd: 70, ult: true, desc: 'Call in a nuke on your aim point. After 2s it detonates for 3500% damage in a massive radius.',
        cast(p, aim) {
          const pos = aim.groundPoint.clone();
          telegraph(pos, 20 * p.stats.area, 0xff3322, 2);
          after(1.6, () => beam(pos.clone().setY(pos.y + 60), pos, 0xffffff, 1.2, 0.4));
          after(2, () => {
            explode(pos, 20, p.stats.damage * 35, { color: 0xffaa33, big: true, knockback: 20 });
            ring(pos, 30, 0xffffff, 1);
            particles(pos, 0xff7722, 80, 22, 1.5, 1.2);
            shake(1.6);
            sfx('bigboom');
          });
        },
      },
    ],
  },

  // =====================================================================
  nyx: {
    name: 'Nyx', title: 'The Shadow Assassin', color: '#b06bff', difficulty: 3,
    lore: 'You will not see her coming. You will barely see her leaving.',
    base: { hp: 88, damage: 14, speed: 10, armor: 0, regen: 1.0, jumps: 2 },
    ratings: { hp: 1, dmg: 5, speed: 5, range: 3 },
    passive: {
      name: 'Executioner', icon: '🗡️',
      desc: '+20% critical chance. Your hits execute non-boss enemies below 12% HP.',
      mods: (m) => { m.crit += 0.2; m.execute = Math.max(m.execute, 0.12); },
    },
    primary: {
      name: 'Throwing Knives', icon: '🔪', rate: 3, desc: 'Throw fast knives for 110% damage.',
      fire(p, aim) {
        const from = p.muzzle(0.3);
        spawnProjectile({ pos: from, dir: aim.dirFrom(from), speed: 70, damage: p.stats.damage * 1.1, color: 0xe0d0ff, size: 0.2, shape: 'blade', procCoef: 1 });
        sfx('swing', 0.05);
        p.anim('shoot');
      },
    },
    abilities: [
      {
        name: 'Shadow Strike', icon: '🌑', cd: 5, desc: 'Teleport behind the targeted enemy and strike for 600% guaranteed critical damage. Kills reset the cooldown.',
        cast(p, aim) {
          const e = aim.target || targetNearAim(30, 30) || nearestEnemy(p.pos, 18);
          if (!e) return false;
          const back = _a.copy(e.pos).sub(p.pos).setY(0).normalize();
          particles(p.pos, 0x6a2aaa, 14, 4, 0.5);
          p.pos.copy(e.pos).addScaledVector(back, e.radius + 1.2);
          p.pos.y = Math.max(e.pos.y, G.world.heightAt(p.pos.x, p.pos.z));
          p.vel.set(0, 0, 0);
          p.aimYaw = Math.atan2(back.x, back.z);
          p.invulnT = Math.max(p.invulnT, 0.3);
          dealDamage(e, p.stats.damage * 6, { crit: true, procCoef: 1, color: '#d9a0ff' });
          particles(e.pos, 0xb06bff, 18, 6, 0.5);
          if (e.dead) after(0.05, () => p.resetCooldown('ability1'));
          sfx('swing');
          p.anim('swing');
        },
      },
      {
        name: 'Smoke Bomb', icon: '💨', cd: 9, desc: 'Explode in smoke for 250% damage, stunning enemies. Become invisible with +35% speed for 3s.',
        cast(p) {
          explode(p.pos, 6, p.stats.damage * 2.5, { stun: 1.2, color: 0x554466 });
          particles(p.pos, 0x333344, 40, 6, 1.2, 1);
          p.stealthT = 3;
          p.addBuff('smoke', 3, { moveSpeed: 0.35 });
          sfx('dash');
        },
      },
      {
        name: 'Death Lotus', icon: '🪷', cd: 45, ult: true, desc: 'Spin for 2s, shredding everything nearby for 150% damage 5 times per second and releasing 32 knives.',
        cast(p) {
          const knives = () => {
            for (let i = 0; i < 16; i++) {
              const a = (i / 16) * Math.PI * 2;
              spawnProjectile({ pos: p.pos.clone().setY(p.pos.y + 1.2), dir: { x: Math.cos(a), y: 0, z: Math.sin(a) }, speed: 50, damage: p.stats.damage * 1.5, color: 0xe0d0ff, size: 0.2, shape: 'blade', pierce: 2, procCoef: 0.5 });
            }
          };
          knives();
          after(2, knives);
          p.channel(2, 0.2, () => {
            explode(p.pos, 8, p.stats.damage * 1.5, { color: 0xb06bff, procCoef: 0.4, small: true });
            p.anim('spin');
          });
          sfx('swing');
        },
      },
    ],
  },
};

// =====================================================================
// Expansion survivors
// =====================================================================
Object.assign(CHARACTERS, {
  sol: {
    name: 'Sol', title: 'The Sun Paladin', color: '#ffd45a', difficulty: 2,
    lore: 'A holy knight who carries the dawn on her shield. Stands in the thick of it and outlasts everyone.',
    base: { hp: 150, damage: 13, speed: 8.2, armor: 20, regen: 2, jumps: 2 },
    ratings: { hp: 4, dmg: 3, speed: 2, range: 2 },
    passive: {
      name: 'Radiance', icon: '☀️',
      desc: 'Holy light burns enemies within 6m for 30% damage per second. Kills inside it heal 1% max HP.',
      onTick: (dt, p) => {
        p.cs.rad = (p.cs.rad || 0) - dt;
        if (p.cs.rad > 0) return;
        p.cs.rad = 0.5;
        for (const e of findTargets(p.pos, 6 * p.stats.area, 30)) dealDamage(e, p.stats.damage * 0.15, { procCoef: 0, canCrit: false, color: '#ffe9a0' });
      },
      onKill: (e, p) => { if (e.pos.distanceTo(p.pos) < 6 * p.stats.area) p.heal(p.stats.maxHp * 0.01); },
    },
    primary: {
      name: 'Judgment Hammer', icon: '🔨', rate: 1.6, desc: 'Smash in a wide arc for 210% damage.',
      fire(p) {
        meleeArc(p.pos, p.aimYaw, 5, 120, p.stats.damage * 2.1, { knockback: 6, color: 0xffe08a });
        sfx('swing');
        p.anim('swing');
      },
    },
    abilities: [
      {
        name: 'Shield Bash', icon: '🛡️', cd: 5, desc: 'Charge forward with your shield, dealing 300% damage and stunning everything in your path.',
        cast(p) {
          p.dash(moveOrAim(p), 9, 0.25, { invuln: 0.2, damageAlong: { radius: 2.6, damage: p.stats.damage * 3, stun: 1.2 } });
          sfx('dash');
        },
      },
      {
        name: 'Consecrate', icon: '✨', cd: 10, desc: 'Bless the ground for 6s: enemies inside take 120% damage per second, you heal 3% max HP per second while standing in it.',
        cast(p) {
          const pos = p.pos.clone();
          spawnZone({
            pos, radius: 8, duration: 6, tick: 0.5, color: 0xffe08a, kind: 'holy',
            onTick: (z) => {
              for (const e of findTargets(z.pos, z.radius, 40)) dealDamage(e, p.stats.damage * 0.6, { procCoef: 0.3, color: '#ffe9a0' });
              if (p.pos.distanceTo(z.pos) < z.radius) p.heal(p.stats.maxHp * 0.015);
            },
          });
          sfx('item');
        },
      },
      {
        name: 'Solar Flare', icon: '🌞', cd: 50, ult: true, desc: 'Erupt with the power of the sun, dealing 1500% damage around you and stunning for 2s.',
        cast(p) {
          explode(p.pos, 14, p.stats.damage * 15, { stun: 2, knockback: 14, color: 0xffd45a, big: true });
          ring(p.pos, 20, 0xffffff, 0.8);
          particles(p.pos, 0xffe08a, 50, 16, 1.2, 0.6);
          shake(1);
          sfx('bigboom');
          p.anim('slam');
        },
      },
    ],
  },

  rook: {
    name: 'Rook', title: 'The Marksman', color: '#9bbf6a', difficulty: 3,
    lore: 'One shot, one kill. Two shots if you are a boss. Three if you are lucky.',
    base: { hp: 100, damage: 14, speed: 8.6, armor: 0, regen: 1, jumps: 2 },
    ratings: { hp: 2, dmg: 5, speed: 3, range: 5 },
    passive: {
      name: 'Steady Aim', icon: '🎯',
      desc: 'Standing still for a moment grants +40% damage and +20% critical chance.',
      mods: (m, p) => { if (p.cond?.still) { m.damage += 0.4; m.crit += 0.2; } },
    },
    primary: {
      name: 'Longshot Rifle', icon: '🔫', rate: 1.3, desc: 'A piercing rifle shot for 260% damage.',
      fire(p, aim) {
        hitscan(p.muzzle(0.3), aim.point, 180, p.stats.damage * 2.6, { pierce: true, color: 0xeaffc0, width: 0.1, knockback: 3 });
        sfx('laser', 0.05);
        shake(0.05);
        p.anim('shoot');
      },
    },
    abilities: [
      {
        name: 'Concussion Grenade', icon: '💣', cd: 6, desc: 'Lob a grenade that explodes for 250% damage and stuns for 2s.',
        cast(p, aim) {
          const from = p.muzzle(0.3);
          const d = aim.dirFrom(from);
          d.y += 0.2;
          spawnProjectile({ pos: from, dir: d, speed: 32, gravity: 22, damage: p.stats.damage * 2.5, explodeRadius: 5, color: 0x88aa66, size: 0.35, procCoef: 1, status: { stun: 2 } });
          sfx('shoot');
        },
      },
      {
        name: 'Grapple Hook', icon: '🪝', cd: 7, desc: 'Fire a hook and zip toward where you are aiming (up to 28m).',
        cast(p, aim) {
          const to = aim.groundPoint.clone();
          const d = to.clone().sub(p.pos).setY(0);
          const dist = Math.min(28, d.length());
          if (dist < 2) return false;
          beam(p.pos.clone().setY(p.pos.y + 1.4), to.clone().setY(to.y + 0.5), 0xcccccc, 0.05, 0.35);
          p.dash(d.normalize(), dist, 0.35, { invuln: 0.2 });
          p.vel.y = 7;
          sfx('dash');
        },
      },
      {
        name: 'Execution Round', icon: '🎖️', cd: 45, ult: true, desc: 'A guaranteed-critical shot that pierces everything for 4000% damage.',
        cast(p, aim) {
          hitscan(p.muzzle(0.3), aim.point, 220, p.stats.damage * 40, { pierce: true, crit: true, color: 0xff4444, width: 0.6, knockback: 12, life: 0.4 });
          shake(0.6);
          sfx('bigboom');
          p.anim('shoot');
        },
      },
    ],
  },

  vex: {
    name: 'Vex', title: 'The Plague Doctor', color: '#8bd450', difficulty: 3,
    lore: 'A doctor who discovered that the most effective cure is making the problem dissolve.',
    base: { hp: 105, damage: 12, speed: 8.6, armor: 5, regen: 1, jumps: 2 },
    ratings: { hp: 3, dmg: 4, speed: 3, range: 3 },
    passive: {
      name: 'Toxicology', icon: '☣️',
      desc: 'Your direct hits apply a poison stack (15% damage per second per stack, up to 10 stacks).',
      onHit: (h) => { if (h.procCoef >= 0.5) applyPoison(h.enemy, 1); },
    },
    primary: {
      name: 'Toxic Flask', icon: '🧪', rate: 1.4, desc: 'Lob a flask that shatters for 140% damage and leaves a poison puddle for 2s.',
      fire(p, aim) {
        const from = p.muzzle(0.3);
        const d = aim.dirFrom(from);
        d.y += 0.12;
        spawnProjectile({
          pos: from, dir: d, speed: 36, gravity: 20, damage: p.stats.damage * 1.4, explodeRadius: 3, color: 0x8bd450, size: 0.3, procCoef: 1,
          onGround: (pos) => spawnZone({
            pos, radius: 3, duration: 2, tick: 0.5, color: 0x6aff3a, kind: 'fire',
            onTick: (z) => { for (const e of findTargets(z.pos, z.radius, 20)) { dealDamage(e, p.stats.damage * 0.3, { procCoef: 0, canCrit: false, color: '#9dff5a' }); applyPoison(e, 1); } },
          }),
        });
        sfx('shoot');
        p.anim('cast');
      },
    },
    abilities: [
      {
        name: 'Miasma', icon: '🌫️', cd: 7, desc: 'Release a toxic cloud for 5s that poisons and slows enemies by 30%.',
        cast(p, aim) {
          spawnZone({
            pos: aim.groundPoint.clone(), radius: 8, duration: 5, tick: 0.5, color: 0x6aff3a, kind: 'blizzard',
            onTick: (z) => { for (const e of findTargets(z.pos, z.radius, 60)) { applyPoison(e, 1); applySlow(e, 0.3, 1); } },
          });
          sfx('dash');
        },
      },
      {
        name: 'Purge', icon: '💉', cd: 9, desc: 'Detonate all poison within 20m: each stack deals 60% damage instantly. Heal 1% max HP per enemy purged.',
        cast(p) {
          let n = 0;
          for (const e of findTargets(p.pos, 20, 80)) {
            if (e.status.poison <= 0) continue;
            const st = e.status.poison;
            e.status.poison = 0;
            e.status.poisonT = 0;
            particles(e.pos, 0x8bd450, 8, 6, 0.5);
            dealDamage(e, p.stats.damage * 0.6 * st, { procCoef: 0.5, color: '#b6ff7a' });
            n++;
          }
          if (!n) return false;
          p.heal(p.stats.maxHp * 0.01 * n);
          ring(p.pos, 20, 0x8bd450, 0.5);
          sfx('boom');
        },
      },
      {
        name: 'Pandemic', icon: '🦠', cd: 50, ult: true, desc: 'Every enemy within 30m gets its poison doubled (at least 8 stacks) for 8s, ignoring the stack limit.',
        cast(p) {
          for (const e of findTargets(p.pos, 30, 120)) {
            e.status.poison = Math.max(8, e.status.poison * 2);
            e.status.poisonT = 8;
            particles(e.pos, 0x6aff3a, 4, 3, 0.6);
          }
          ring(p.pos, 30, 0x6aff3a, 0.8);
          sfx('roar');
        },
      },
    ],
  },

  echo: {
    name: 'Echo', title: 'The Chronomancer', color: '#5fe0d0', difficulty: 3,
    lore: 'Has already seen how this fight ends. Is mildly disappointed.',
    base: { hp: 95, damage: 13, speed: 8.8, armor: 0, regen: 1, jumps: 2 },
    ratings: { hp: 2, dmg: 3, speed: 3, range: 4 },
    passive: {
      name: 'Temporal Echo', icon: '⏳',
      desc: 'Abilities have a 20% chance not to use a charge.',
      onCast: () => (Math.random() < 0.2 ? 'refund' : null),
    },
    primary: {
      name: 'Time Bolt', icon: '🕓', rate: 2.2, desc: 'Fire a bolt for 140% damage that slows enemies by 20%.',
      fire(p, aim) {
        const from = p.muzzle(0.3);
        spawnProjectile({ pos: from, dir: aim.dirFrom(from), speed: 50, damage: p.stats.damage * 1.4, color: 0x7ff5e6, size: 0.28, trail: 0x3aa89a, procCoef: 1, status: { slow: 0.2 } });
        sfx('shoot');
        p.anim('cast');
      },
    },
    abilities: [
      {
        name: 'Stasis Field', icon: '🔵', cd: 8, desc: 'Freeze enemies in an area for 2.5s and deal 160% damage per second to them.',
        cast(p, aim) {
          const pos = aim.groundPoint.clone();
          for (const e of findTargets(pos, 7 * p.stats.area, 60)) applyFreeze(e, 2.5);
          spawnZone({
            pos, radius: 7, duration: 3, tick: 0.5, color: 0x5fe0d0, kind: 'blizzard',
            onTick: (z) => { for (const e of findTargets(z.pos, z.radius, 60)) dealDamage(e, p.stats.damage * 0.8, { procCoef: 0.4, color: '#9ffff0' }); },
          });
          sfx('freeze');
        },
      },
      {
        name: 'Rewind', icon: '⏪', cd: 10, desc: 'Return to where you were 3 seconds ago and restore the health you had then (plus 10%).',
        cast(p) {
          const h = p.posHistory[Math.max(0, p.posHistory.length - 30)];
          if (!h) return false;
          particles(p.pos, 0x5fe0d0, 16, 5, 0.6);
          p.pos.copy(h.p);
          p.vel.set(0, 0, 0);
          p.hp = Math.min(p.stats.maxHp, Math.max(p.hp, h.hp) + p.stats.maxHp * 0.1);
          p.invulnT = Math.max(p.invulnT, 0.4);
          ring(p.pos, 4, 0x5fe0d0, 0.5);
          particles(p.pos, 0x5fe0d0, 16, 5, 0.6);
          sfx('portal');
        },
      },
      {
        name: 'Time Stop', icon: '⏸️', cd: 60, ult: true, desc: 'Stop time for everything within 40m: enemies freeze for 4s and take +25% damage.',
        cast(p) {
          for (const e of findTargets(p.pos, 40, 200)) {
            applyFreeze(e, 4);
            e.vulnT = Math.max(e.vulnT, 4);
          }
          ring(p.pos, 40, 0x9ffff0, 1);
          shake(0.4);
          sfx('freeze');
        },
      },
    ],
  },

  grizzle: {
    name: 'Grizzle', title: 'The Beast Tamer', color: '#c08a4a', difficulty: 2,
    lore: 'Raised by wolves. Then raised some wolves. Now the wolves raise hell.',
    base: { hp: 130, damage: 12, speed: 8.8, armor: 10, regen: 1.5, jumps: 2 },
    ratings: { hp: 4, dmg: 3, speed: 3, range: 3 },
    passive: {
      name: 'Pack Leader', icon: '🐺',
      desc: 'A loyal wolf always fights beside you, biting for 200% damage. It inherits your attack speed.',
      onTick: (dt, p) => {
        p.cs.wolfT = (p.cs.wolfT || 0) - dt;
        if (p.cs.wolfT > 0) return;
        p.cs.wolfT = 1;
        if (!G.minions.some((m) => m.type === 'wolf' && !m.dead)) spawnMinion('wolf', p.pos, {});
      },
    },
    primary: {
      name: 'Hunting Spear', icon: '🔱', rate: 1.6, desc: 'Throw a spear that pierces one enemy for 170% damage.',
      fire(p, aim) {
        const from = p.muzzle(0.3);
        spawnProjectile({ pos: from, dir: aim.dirFrom(from), speed: 52, damage: p.stats.damage * 1.7, pierce: 1, color: 0xd8c8a8, size: 0.25, shape: 'arrow', procCoef: 1 });
        sfx('swing', 0.05);
        p.anim('shoot');
      },
    },
    abilities: [
      {
        name: "Sic 'Em", icon: '🐾', cd: 5, desc: 'Send your wolves leaping at the target. Their next bite deals 600% damage.',
        cast(p, aim) {
          const e = aim.target || targetNearAim(40, 30) || nearestEnemy(p.pos, 25);
          if (!e) return false;
          for (const w of G.minions) {
            if (w.type !== 'wolf' || w.dead) continue;
            particles(w.pos, 0xc08a4a, 8, 4, 0.4);
            w.pos.copy(e.pos).add(_a.set(Math.random() - 0.5, 0, Math.random() - 0.5).normalize().multiplyScalar(e.radius + 1));
            w.opts.sicTarget = e;
            w.atk = 0;
          }
          sfx('roar');
        },
      },
      {
        name: 'Feral Roar', icon: '🦁', cd: 10, desc: 'You gain +40% attack speed and +20% move speed for 5s. Your wolves go into a frenzy (+50% damage).',
        cast(p) {
          p.addBuff('feral', 5, { attackSpeed: 0.4, moveSpeed: 0.2 });
          for (const w of G.minions) if (w.type === 'wolf') w.opts.frenzy = G.time + 5;
          ring(p.pos, 6, 0xc08a4a, 0.4);
          sfx('roar');
        },
      },
      {
        name: 'Stampede', icon: '🐗', cd: 50, ult: true, desc: 'Summon 6 spirit boars that charge forward, trampling everything for 500% damage.',
        cast(p) {
          const d = aimFlat(p);
          const right = V().set(-d.z, 0, d.x);
          for (let i = 0; i < 6; i++) {
            after(i * 0.08, () => {
              const pos = p.pos.clone().addScaledVector(right, (i - 2.5) * 2.2).setY(p.pos.y + 1);
              spawnProjectile({ pos, dir: d, speed: 26, damage: p.stats.damage * 5, pierce: 99, color: 0xffcc88, size: 1.1, life: 2.2, procCoef: 0.6, trail: 0xffaa66, status: { knockback: 10 } });
            });
          }
          shake(0.5);
          sfx('roar');
        },
      },
    ],
  },

  spark: {
    name: 'Spark', title: 'The Storm Caller', color: '#ffe04a', difficulty: 2,
    lore: 'Hair permanently standing on end. Fingers permanently tingling. Enemies permanently fried.',
    base: { hp: 100, damage: 12, speed: 9, armor: 0, regen: 1, jumps: 2 },
    ratings: { hp: 2, dmg: 4, speed: 4, range: 4 },
    passive: {
      name: 'Overcharge', icon: '⚡',
      desc: 'Every 5th direct hit discharges lightning through 4 enemies for 100% damage.',
      onHit: (h, p) => {
        if (h.procCoef < 0.5) return;
        p.cs.oc = (p.cs.oc || 0) + 1;
        if (p.cs.oc >= 5) {
          p.cs.oc = 0;
          chainLightning(h.enemy, 4, 18, p.stats.damage, { procCoef: 0.2 });
        }
      },
    },
    primary: {
      name: 'Arc Bolt', icon: '🌩️', rate: 2.5, desc: 'Hitscan lightning for 90% damage that arcs to one more enemy.',
      fire(p, aim) {
        const n = hitscan(p.muzzle(0.3), aim.point, 90, p.stats.damage * 0.9, { color: 0xfff08a, width: 0.08 });
        if (n && aim.target && !aim.target.dead) chainLightning(aim.target, 1, 12, p.stats.damage * 0.45, { procCoef: 0.3 });
        sfx('zap', 0.05);
        p.anim('cast');
      },
    },
    abilities: [
      {
        name: 'Ball Lightning', icon: '🔮', cd: 6, desc: 'Conjure a crackling orb at the target spot for 3s that zaps enemies inside for 280% damage per second.',
        cast(p, aim) {
          spawnZone({
            pos: aim.groundPoint.clone(), radius: 6, duration: 3, tick: 0.25, color: 0xfff08a, kind: 'storm',
            onTick: (z) => {
              const ts = findTargets(z.pos, z.radius, 4);
              for (const e of ts) {
                beam(z.pos.clone().setY(z.pos.y + 2), e.pos.clone().setY(e.pos.y + e.height * 0.5), 0xfff08a, 0.08, 0.1);
                dealDamage(e, p.stats.damage * 0.7, { procCoef: 0.25, color: '#fff08a' });
              }
            },
          });
          sfx('zap');
        },
      },
      {
        name: 'Static Dash', icon: '💨', cd: 6, desc: 'Dash as a bolt of lightning, dealing 250% damage to everything you pass through and stunning briefly.',
        cast(p) {
          p.dash(moveOrAim(p), 14, 0.2, { invuln: 0.25, damageAlong: { radius: 2.4, damage: p.stats.damage * 2.5, stun: 0.5 } });
          sfx('zap');
        },
      },
      {
        name: 'Thunderstorm', icon: '⛈️', cd: 45, ult: true, desc: 'Call a storm for 6s: lightning strikes enemies in a huge area 10 times per second for 250% damage.',
        cast(p, aim) {
          spawnZone({
            pos: aim.groundPoint.clone(), radius: 14, duration: 6, tick: 0.1, color: 0x8899ff, kind: 'storm',
            onTick: (z) => {
              const ts = findTargets(z.pos, z.radius, 30);
              if (!ts.length) return;
              const e = ts[Math.floor(Math.random() * ts.length)];
              beam(e.pos.clone().setY(e.pos.y + 25), e.pos.clone().setY(e.pos.y + e.height * 0.5), 0xdde6ff, 0.35, 0.12);
              dealDamage(e, p.stats.damage * 2.5, { procCoef: 0.3, color: '#dde6ff' });
              sfx('zap', 0.05);
            },
          });
          shake(0.3);
        },
      },
    ],
  },

  mimic: {
    name: 'Mimic', title: 'The Gambler', color: '#c46bff', difficulty: 2,
    lore: 'Used to be a treasure chest. Got tired of being opened. Now opens enemies instead.',
    base: { hp: 100, damage: 12, speed: 9, armor: 5, regen: 1, jumps: 2 },
    ratings: { hp: 2, dmg: 3, speed: 4, range: 3 },
    passive: {
      name: 'Jackpot', icon: '🎰',
      desc: '+0.5 luck, +25% coins and chests cost 15% less. Critical coins bounce to another enemy.',
      mods: (m) => { m.luck += 0.5; m.coins += 0.25; m.chestDiscount = 1 - (1 - m.chestDiscount) * 0.85; },
      onHit: (h, p) => {
        if (!h.crit || h.procCoef < 0.9) return;
        const o = nearestEnemy(h.enemy.pos, 15, new Set([h.enemy]));
        if (o) spawnProjectile({ pos: h.pos, dir: o.pos.clone().sub(h.pos), speed: 40, damage: p.stats.damage * 1.2, homing: 10, target: o, color: 0xffd23c, size: 0.22, procCoef: 0.5 });
      },
    },
    primary: {
      name: 'Coin Toss', icon: '🪙', rate: 2.6, desc: 'Flick coins for 120% damage.',
      fire(p, aim) {
        const from = p.muzzle(0.3);
        spawnProjectile({ pos: from, dir: aim.dirFrom(from), speed: 55, damage: p.stats.damage * 1.2, color: 0xffd23c, size: 0.22, procCoef: 1 });
        sfx('coin', 0.05);
        p.anim('shoot');
      },
    },
    abilities: [
      {
        name: 'Double or Nothing', icon: '🃏', cd: 6, desc: 'A piercing gamble shot: deals 0%, 250%, 600% or 1500% damage at random.',
        cast(p, aim) {
          const r = Math.random();
          const mult = r < 0.25 ? 0 : r < 0.65 ? 2.5 : r < 0.92 ? 6 : 15;
          const label = mult === 0 ? 'BUST!' : mult === 15 ? 'JACKPOT!' : `x${mult}`;
          floatText(p.pos.clone().setY(p.pos.y + 2.4), label, mult === 0 ? '#888888' : mult === 15 ? '#ffd23c' : '#ffffff', mult >= 6);
          if (mult > 0) hitscan(p.muzzle(0.3), aim.point, 160, p.stats.damage * mult, { pierce: true, color: 0xffd23c, width: 0.15 + mult * 0.02, crit: mult === 15 ? true : undefined });
          sfx(mult === 15 ? 'legendary' : mult ? 'laser' : 'deny');
        },
      },
      {
        name: 'Lucky Dodge', icon: '🍀', cd: 8, desc: 'Dash away and become untouchable for 1.5s.',
        cast(p) {
          p.dash(moveOrAim(p), 10, 0.22, { invuln: 1.5 });
          floatText(p.pos.clone().setY(p.pos.y + 2.2), 'LUCKY!', '#88ff88');
          sfx('dash');
        },
      },
      {
        name: 'Jackpot', icon: '💎', cd: 60, ult: true, desc: 'Pull the lever! Gold Rain (12 meteors of 400% + coins), Healing Fountain (full heal + 50% barrier) or Triple Seven (2500% around you).',
        cast(p) {
          const roll = Math.floor(Math.random() * 3);
          if (roll === 0) {
            floatText(p.pos.clone().setY(p.pos.y + 3), 'GOLD RAIN', '#ffd23c', true);
            const ts = findTargets(p.pos, 30, 12);
            for (let i = 0; i < 12; i++) {
              after(i * 0.12, () => {
                const t = ts[i % Math.max(1, ts.length)];
                const pos = t ? t.pos.clone() : p.pos.clone().add(_a.set((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20));
                pos.y = G.world.heightAt(pos.x, pos.z);
                telegraph(pos, 4, 0xffd23c, 0.45);
                after(0.45, () => explode(pos, 4, p.stats.damage * 4, { color: 0xffd23c, big: true }));
              });
            }
            G.run.coins += 20 * G.run.coinScale;
          } else if (roll === 1) {
            floatText(p.pos.clone().setY(p.pos.y + 3), 'HEALING FOUNTAIN', '#88ff88', true);
            p.heal(p.stats.maxHp);
            p.addBarrier(p.stats.maxHp * 0.5);
            ring(p.pos, 6, 0x88ff88, 0.6);
          } else {
            floatText(p.pos.clone().setY(p.pos.y + 3), '7 7 7', '#ff4466', true);
            explode(p.pos, 15, p.stats.damage * 25, { color: 0xff4466, big: true, knockback: 15 });
            shake(1);
          }
          sfx('legendary');
        },
      },
    ],
  },
});

export const CHARACTER_ORDER = ['vanguard', 'bonker', 'pyra', 'kestrel', 'tinker', 'glacia', 'kaze', 'morrow', 'bulwark', 'nyx', 'sol', 'rook', 'vex', 'echo', 'grizzle', 'spark', 'mimic'];
for (const id in CHARACTERS) CHARACTERS[id].id = id;
