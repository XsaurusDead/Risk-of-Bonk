// Item catalogue. Items stack: `n` = number held.
//
// mods(m, n)       -> modify the stat accumulator (see player.js recalcStats)
// onHit(n, hit)    -> hit = { enemy, damage, crit, procCoef, pos }
// onKill(n, enemy)
// onTick(n, dt, p) -> every frame
// onDamaged(n, amount, attacker)
//
// Drop odds by rarity live in game/pickups.js (rollRarity).
import {
  dealDamage, explode, chainLightning, spawnProjectile, nearestEnemy, strongestEnemy,
  applyBurn, applyFreeze, findTargets, spawnZone, pullEnemies,
} from '../game/combat.js';
import { spawnMinion } from '../game/minions.js';
import { G } from '../core/state.js';
import { chance } from '../core/util.js';
import { beam, ring, particles } from '../game/fx.js';
import { sfx } from '../core/audio.js';
import * as THREE from 'three';
import { EXT_ITEMS } from './items_ext.js';
import { MYTHIC_ITEMS } from './mythics.js';
import { applyModsObj } from './modutil.js';

const hyper = (x, n) => 1 - 1 / (1 + x * n); // hyperbolic stacking (never reaches 100%)
const _v = new THREE.Vector3();

const list = [
  // ======================= COMMON =======================
  { id: 'sharp_pebble', name: 'Sharp Pebble', rarity: 'common', icon: '🪨', desc: '+10% damage.', mods: (m, n) => (m.damage += 0.1 * n) },
  { id: 'energy_drink', name: 'Energy Drink', rarity: 'common', icon: '🥤', desc: '+12% movement speed.', mods: (m, n) => (m.moveSpeed += 0.12 * n) },
  { id: 'feather', name: 'Bonk Feather', rarity: 'common', icon: '🪶', desc: '+1 extra jump. +8% jump height.', mods: (m, n) => { m.jumps += n; m.jumpPower += 0.08 * n; } },
  { id: 'glass_lens', name: 'Glass Lens', rarity: 'common', icon: '🔍', desc: '+8% critical chance.', mods: (m, n) => (m.crit += 0.08 * n) },
  { id: 'bandage', name: 'Bandage Roll', rarity: 'common', icon: '🩹', desc: '+1.5 HP regeneration per second.', mods: (m, n) => (m.regen += 1.5 * n) },
  { id: 'iron_plate', name: 'Iron Plate', rarity: 'common', icon: '🛡️', desc: '+16 armor.', mods: (m, n) => (m.armor += 16 * n) },
  { id: 'hearty_snack', name: 'Hearty Snack', rarity: 'common', icon: '🍖', desc: '+30 max HP.', mods: (m, n) => (m.maxHpFlat += 30 * n) },
  { id: 'caffeine', name: 'Caffeine Pills', rarity: 'common', icon: '💊', desc: '+12% attack speed.', mods: (m, n) => (m.attackSpeed += 0.12 * n) },
  { id: 'piggy_bank', name: 'Piggy Bank', rarity: 'common', icon: '🐷', desc: '+20% coins gained.', mods: (m, n) => (m.coins += 0.2 * n) },
  { id: 'vampire_fang', name: 'Vampire Fang', rarity: 'common', icon: '🦷', desc: 'Heal 1.2 HP on hit.', mods: (m, n) => (m.lifeOnHit += 1.2 * n) },
  { id: 'study_notes', name: 'Study Notes', rarity: 'common', icon: '📓', desc: '+15% experience gained.', mods: (m, n) => (m.xp += 0.15 * n) },
  { id: 'magnet', name: 'Lucky Magnet', rarity: 'common', icon: '🧲', desc: '+3 pickup range. +0.1 luck.', mods: (m, n) => { m.pickup += 3 * n; m.luck += 0.1 * n; } },
  { id: 'sand_timer', name: 'Sand Timer', rarity: 'common', icon: '⏳', desc: '-6% ability cooldowns.', mods: (m, n) => (m.cdr *= Math.pow(0.94, n)) },
  {
    id: 'matchbox', name: 'Matchbox', rarity: 'common', icon: '🔥', desc: '10% chance on hit to burn for 150% damage over 3s.',
    onHit: (n, h) => { if (chance(0.1 * h.procCoef)) applyBurn(h.enemy, (G.player.stats.damage * 1.5 * n) / 3, 3); },
  },
  {
    id: 'bonk_bat', name: 'Bonk Bat', rarity: 'common', icon: '🏏', desc: '8% chance on hit to BONK for +250% damage and knockback.',
    onHit: (n, h) => {
      if (chance(0.08 * n * h.procCoef) && !h.enemy.dead) {
        _v.copy(h.enemy.pos).sub(G.player.pos).setY(0).normalize();
        dealDamage(h.enemy, G.player.stats.damage * 2.5, { procCoef: 0, knockback: 10, dir: _v, color: '#ffd84a' });
        sfx('hit');
      }
    },
  },
  {
    id: 'medkit', name: 'Med Kit', rarity: 'common', icon: '🩺', desc: '2s after taking damage, heal 20 HP.',
    onDamaged: (n) => { G.player.medkitQueue.push({ t: 2, amt: 20 * n }); },
  },

  // ======================= RARE =======================
  {
    id: 'ukulele', name: 'Storm Ukulele', rarity: 'rare', icon: '🎸', desc: '25% chance on hit to chain lightning to 3 enemies for 80% damage.',
    onHit: (n, h) => { if (chance(0.25 * h.procCoef)) chainLightning(h.enemy, 3 + (n - 1) * 2, 18, G.player.stats.damage * 0.8, { procCoef: 0.2 }); },
  },
  {
    id: 'frozen_tear', name: 'Frozen Tear', rarity: 'rare', icon: '💧', desc: '8% chance on hit to freeze an enemy for 1.5s.',
    onHit: (n, h) => { if (chance(hyper(0.08, n) * h.procCoef)) applyFreeze(h.enemy, 1.5); },
  },
  {
    id: 'missile_pack', name: 'Missile Pack', rarity: 'rare', icon: '🚀', desc: '10% chance on hit to fire a homing missile for 300% damage.',
    onHit: (n, h) => {
      if (!chance(0.1 * h.procCoef)) return;
      const p = G.player;
      spawnProjectile({
        pos: _v.copy(p.pos).add({ x: 0, y: 2.2, z: 0 }), dir: { x: (Math.random() - 0.5) * 0.4, y: 1, z: (Math.random() - 0.5) * 0.4 },
        speed: 35, damage: p.stats.damage * 3 * n, homing: 6, target: h.enemy, color: 0xff8844, size: 0.35, life: 4,
        explodeRadius: 3, procCoef: 0.5, trail: 0xffaa55,
      });
    },
  },
  {
    id: 'berserk_mask', name: 'Berserker Mask', rarity: 'rare', icon: '👹', desc: 'Kills grant +10% attack & move speed for 4s (max 5 stacks, +3 per stack).',
    onKill: (n) => G.player.addStackBuff('berserk', 4, 2 + 3 * n, { attackSpeed: 0.1, moveSpeed: 0.1 }),
  },
  { id: 'clockwork', name: 'Clockwork Gear', rarity: 'rare', icon: '⚙️', desc: '-12% ability cooldowns.', mods: (m, n) => (m.cdr *= Math.pow(0.88, n)) },
  {
    id: 'thorn_mail', name: 'Thorn Mail', rarity: 'rare', icon: '🌵', desc: 'When hit, deal 300% damage to the attacker and enemies nearby. +8 armor.',
    mods: (m, n) => (m.armor += 8 * n),
    onDamaged: (n, amt, attacker) => {
      if (attacker && !attacker.dead) explode(attacker.pos, 5, G.player.stats.damage * 3 * n, { color: 0x88cc44, procCoef: 0 });
    },
  },
  {
    id: 'scythe', name: "Harvester's Scythe", rarity: 'rare', icon: '🌾', desc: '+5% crit chance. Critical hits heal 6 HP.',
    mods: (m, n) => (m.crit += 0.05 * n),
    onHit: (n, h) => { if (h.crit) G.player.heal(6 * n * Math.max(0.3, h.procCoef)); },
  },
  {
    id: 'volatile_core', name: 'Volatile Core', rarity: 'rare', icon: '💥', desc: 'Enemies explode on death for 250% damage.',
    onKill: (n, e) => explode(e.pos, 3.5 + n * 0.8, G.player.stats.damage * 2.5, { color: 0xff7733, procCoef: 0 }),
  },
  { id: 'wind_sigil', name: 'Wind Sigil', rarity: 'rare', icon: '🌀', desc: '+1 jump, +10% movement speed, +10% jump height.', mods: (m, n) => { m.jumps += n; m.moveSpeed += 0.1 * n; m.jumpPower += 0.1 * n; } },
  { id: 'shield_gen', name: 'Shield Generator', rarity: 'rare', icon: '🔋', desc: 'Gain a shield equal to 12% max HP. Recharges after 4s without damage.', mods: (m, n) => (m.shield += 0.12 * n) },
  { id: 'hunters_scope', name: "Hunter's Scope", rarity: 'rare', icon: '🎯', desc: '+6% crit chance, +35% crit damage.', mods: (m, n) => { m.crit += 0.06 * n; m.critMult += 0.35 * n; } },
  { id: 'greedy_gauntlet', name: 'Greedy Gauntlet', rarity: 'rare', icon: '🧤', desc: '+35% coins, +0.3 luck.', mods: (m, n) => { m.coins += 0.35 * n; m.luck += 0.3 * n; } },
  {
    id: 'adrenal_gland', name: 'Adrenal Gland', rarity: 'rare', icon: '🫀', desc: 'Kills heal 2% max HP and grant +25% speed for 2s.',
    onKill: (n) => {
      G.player.heal(G.player.stats.maxHp * 0.02 * n);
      G.player.addStackBuff('adrenal', 2, 1, { moveSpeed: 0.25 });
    },
  },

  // ======================= EPIC =======================
  {
    id: 'ritual_dagger', name: 'Ritual Dagger', rarity: 'epic', icon: '🗡️', desc: 'Kills release 3 homing daggers for 150% damage each.',
    onKill: (n, e) => {
      for (let i = 0; i < 3 * n; i++) {
        const a = (i / (3 * n)) * Math.PI * 2;
        spawnProjectile({
          pos: _v.copy(e.pos).setY(e.pos.y + 1.2), dir: { x: Math.cos(a), y: 0.8, z: Math.sin(a) },
          speed: 26, damage: G.player.stats.damage * 1.5, homing: 8, color: 0xdddddd, size: 0.25, life: 3, procCoef: 0.5, shape: 'blade',
        });
      }
    },
  },
  {
    id: 'behemoth', name: 'Brilliant Behemoth', rarity: 'epic', icon: '💣', desc: 'All direct hits explode for 60% damage in a small area.',
    onHit: (n, h) => {
      if (h.procCoef < 0.5) return;
      explode(h.pos, 2.5 + 1.2 * n, h.damage * 0.6, { color: 0xffaa33, procCoef: 0, small: true, exclude: null });
    },
  },
  { id: 'clock_of_ages', name: 'Clock of Ages', rarity: 'epic', icon: '🕰️', desc: '-25% ability cooldowns.', mods: (m, n) => (m.cdr *= Math.pow(0.75, n)) },
  { id: 'titan_heart', name: 'Titan Heart', rarity: 'epic', icon: '💗', desc: '+40% max HP, +3 HP regeneration.', mods: (m, n) => { m.maxHpPct += 0.4 * n; m.regen += 3 * n; } },
  {
    id: 'static_coil', name: 'Static Coil', rarity: 'epic', icon: '⚡', desc: 'Every 1.5s, zap 3 nearby enemies for 200% damage.',
    onTick: (n, dt, p) => {
      p.itemTimers.coil = (p.itemTimers.coil || 0) - dt;
      if (p.itemTimers.coil > 0) return;
      p.itemTimers.coil = 1.5;
      const targets = findTargets(p.pos, 18, 2 + n);
      for (const e of targets) {
        beam(_v.copy(p.pos).setY(p.pos.y + 1.5), e.pos.clone().setY(e.pos.y + e.height * 0.5), 0x99ddff, 0.12, 0.15);
        dealDamage(e, p.stats.damage * 2, { procCoef: 0.3, color: '#99ddff' });
      }
      if (targets.length) sfx('zap');
    },
  },
  {
    id: 'infusion', name: 'Blood Infusion', rarity: 'epic', icon: '🩸', desc: 'Kills permanently grant +1 max HP this run (up to 120 per stack).',
    onKill: (n, e, p = G.player) => {
      if (p.infusionHp < 120 * n) {
        p.infusionHp += 1;
        p.markDirty();
      }
    },
  },
  {
    id: 'magma_heart', name: 'Magma Heart', rarity: 'epic', icon: '🌋', desc: '25% chance on hit to ignite for 400% damage over 4s. Burning enemies take +15% damage.',
    mods: (m) => (m.burnVuln = 0.15),
    onHit: (n, h) => { if (chance(0.25 * h.procCoef)) applyBurn(h.enemy, (G.player.stats.damage * 4 * n) / 4, 4); },
  },
  {
    id: 'drone_swarm', name: 'Drone Swarm', rarity: 'epic', icon: '🛸', desc: 'Gain 2 combat drones that fire at enemies (+1 per stack).',
    onTick: (n, dt, p) => {
      const want = 1 + n;
      const have = G.minions.filter((m) => m.type === 'drone' && !m.dead).length;
      if (have < want) spawnMinion('drone', p.pos, { index: have });
    },
  },
  { id: 'monk_beads', name: "Monk's Beads", rarity: 'epic', icon: '📿', desc: '15% chance to dodge incoming attacks (hyperbolic). +10% move speed.', mods: (m, n) => { m.dodge = 1 - (1 - m.dodge) * (1 - hyper(0.15, n)); m.moveSpeed += 0.1 * n; } },
  { id: 'titan_plating', name: 'Titan Plating', rarity: 'epic', icon: '🦾', desc: '+50 armor. Immune to knockback.', mods: (m, n) => { m.armor += 50 * n; m.kbImmune = true; } },

  // ======================= LEGENDARY =======================
  { id: 'phoenix_feather', name: 'Phoenix Feather', rarity: 'legendary', icon: '🐦', desc: 'Upon death, revive with full HP. Consumed on use.' },
  { id: 'chrono_crown', name: 'Chrono Crown', rarity: 'legendary', icon: '👑', desc: '-35% ability cooldowns. Your Ultimate recharges twice as fast.', mods: (m, n) => { m.cdr *= Math.pow(0.65, n); m.ultCdr *= Math.pow(0.5, n); } },
  { id: 'godslayer', name: 'Godslayer Blade', rarity: 'legendary', icon: '⚔️', desc: '+60% damage. Critical hits deal +100% more damage.', mods: (m, n) => { m.damage += 0.6 * n; m.critMult += 1 * n; } },
  {
    id: 'singularity', name: 'Singularity Core', rarity: 'legendary', icon: '🌑', desc: '5% chance on hit to open a black hole that pulls enemies in and deals 150% damage per second.',
    onHit: (n, h) => {
      if (!chance(0.05 * h.procCoef)) return;
      const pos = h.pos.clone();
      spawnZone({
        pos, radius: 9, duration: 3.5, tick: 0.25, color: 0x220033, kind: 'blackhole',
        onTick: (z) => {
          pullEnemies(z.pos, z.radius, 14 * 0.25);
          for (const e of findTargets(z.pos, z.radius, 40)) dealDamage(e, G.player.stats.damage * 1.5 * 0.25 * n, { procCoef: 0, color: '#bb77ff', canCrit: false });
        },
      });
    },
  },
  { id: 'golden_idol', name: 'Golden Idol', rarity: 'legendary', icon: '🗿', desc: 'Double coins. Chests cost 25% less.', mods: (m, n) => { m.coins += 1 * n; m.chestDiscount = 1 - (1 - m.chestDiscount) * Math.pow(0.75, n); } },
  { id: 'celestial_wings', name: 'Celestial Wings', rarity: 'legendary', icon: '🪽', desc: '+3 jumps, +30% movement speed. Hold jump to glide.', mods: (m, n) => { m.jumps += 3 * n; m.moveSpeed += 0.3 * n; m.glide = true; } },
  {
    id: 'omega_laser', name: 'Omega Laser', rarity: 'legendary', icon: '🔦', desc: 'Every 5s, fire a laser at the strongest nearby enemy for 2500% damage.',
    onTick: (n, dt, p) => {
      p.itemTimers.omega = (p.itemTimers.omega || 0) - dt;
      if (p.itemTimers.omega > 0) return;
      const e = strongestEnemy(p.pos, 45);
      if (!e) { p.itemTimers.omega = 0.5; return; }
      p.itemTimers.omega = 5 / (1 + 0.5 * (n - 1));
      const from = p.pos.clone().setY(p.pos.y + 8);
      beam(from, e.pos.clone().setY(e.pos.y + e.height * 0.5), 0xff3355, 0.6, 0.35);
      particles(e.pos, 0xff3355, 20, 8, 0.5);
      dealDamage(e, p.stats.damage * 25, { procCoef: 1, color: '#ff3355' });
      sfx('laser');
    },
  },
  {
    id: 'soul_lantern', name: 'Soul Lantern', rarity: 'legendary', icon: '🏮', desc: 'Kills have a 25% chance to summon a ghost ally for 15s (max 8).',
    onKill: (n, e) => {
      if (chance(Math.min(0.6, 0.25 * n)) && G.minions.filter((m) => m.type === 'ghost' && !m.dead).length < 8) spawnMinion('ghost', e.pos, {});
    },
  },
  { id: 'reapers_edge', name: "Reaper's Edge", rarity: 'legendary', icon: '💀', desc: '+20% crit chance. Hits execute non-boss enemies below 20% HP.', mods: (m, n) => { m.crit += 0.2 * n; m.execute = Math.max(m.execute, Math.min(0.4, 0.2 + 0.05 * (n - 1))); } },
];

list.push(...EXT_ITEMS);
list.push(...MYTHIC_ITEMS); // shop-only (rarity 'mythic' is never rolled by chests)
export const ITEMS = {};
for (const it of list) {
  if (it.statMods && !it.mods) {
    const sm = it.statMods;
    it.mods = (m, n) => applyModsObj(m, sm, n);
  }
  ITEMS[it.id] = it;
}
export const ITEM_LIST = list;
