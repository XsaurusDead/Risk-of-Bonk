// Expansion items (161). Together with items.js this gives
// 67 Common · 67 Rare · 45 Epic · 30 Legendary.
//
// Extra hook types understood by the player/combat code:
//   cond: { when, mods }        stat bonus only while a condition holds
//   dmgMod(n, enemy, dmg, p)    change outgoing damage (return new value)
//   onCast(n, slot, p)          after an ability is used (return 'refund' to keep the charge)
//   onLand(n, impact, p)        when landing from a jump/fall
//   onLethal(n, p)              return true to cancel a death
//   onBlock(n, p)               return true to fully block an incoming hit
import * as THREE from 'three';
import { G } from '../core/state.js';
import {
  dealDamage, explode, chainLightning, spawnProjectile, nearestEnemy, findTargets, applyBurn, applyFreeze,
  applySlow, applyStun, applyPoison, spawnZone, pullEnemies, after,
} from '../game/combat.js';
import { spawnMinion } from '../game/minions.js';
import { particles, ring, beam, telegraph, floatText } from '../game/fx.js';
import { dropCoins } from '../game/pickups.js';
import { sfx } from '../core/audio.js';

const D = () => G.player.stats.damage;
import { hyper, applyModsObj } from './modutil.js';
export { applyModsObj };
/** Proc roll that respects the hit's proc coefficient and the Fate Dice multiplier. */
export const roll = (c, h) => Math.random() < c * (h ? h.procCoef : 1) * (G.player?.stats.procMult || 1);
const mid = (e) => new THREE.Vector3(e.pos.x, e.pos.y + e.height * e.scale * 0.5, e.pos.z);
const _v = new THREE.Vector3();

function every(key, interval) {
  return (fn) => (n, dt, p) => {
    const t = (p.itemTimers[key] ?? interval) - dt;
    if (t <= 0) {
      p.itemTimers[key] = interval;
      fn(n, p);
    } else p.itemTimers[key] = t;
  };
}
function nova(pos, count, coef, color, shape = 'sphere', speed = 30) {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    spawnProjectile({ pos: _v.copy(pos).setY(pos.y + 1), dir: { x: Math.cos(a), y: 0.05, z: Math.sin(a) }, speed, damage: D() * coef, color, size: 0.25, life: 1.6, procCoef: 0.3, shape });
  }
}
function homers(pos, count, coef, color, target = null, shape = 'sphere') {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    spawnProjectile({ pos: _v.copy(pos).setY(pos.y + 1.2), dir: { x: Math.cos(a), y: 0.9, z: Math.sin(a) }, speed: 26, damage: D() * coef, homing: 8, target, color, size: 0.22, life: 3, procCoef: 0.3, shape });
  }
}
function meteor(pos, r, coef, color = 0xff7733) {
  const p = pos.clone();
  p.y = G.world.heightAt(p.x, p.z);
  telegraph(p, r * G.player.stats.area, color, 0.55);
  after(0.55, () => {
    beam(p.clone().setY(p.y + 25), p, color, 0.7, 0.18);
    explode(p, r, D() * coef, { color, procCoef: 0, big: true });
    sfx('boom', 0.06);
  });
}
function smite(e, coef, color = 0xfff2a0) {
  beam(mid(e).setY(e.pos.y + 18), mid(e), color, 0.45, 0.2);
  dealDamage(e, D() * coef, { procCoef: 0.3, color: '#fff2a0' });
}

// ---------- auto descriptions ----------
const pct = (v) => `${Math.round(v * 100)}%`;
const FMT = {
  damage: (v) => `+${pct(v)} damage`, attackSpeed: (v) => `+${pct(v)} attack speed`, moveSpeed: (v) => `${v < 0 ? '' : '+'}${pct(v)} move speed`,
  maxHpFlat: (v) => `+${v} max HP`, maxHpPct: (v) => `${v < 0 ? '' : '+'}${pct(v)} max HP`, regen: (v) => `+${v} HP/s regen`, armor: (v) => `+${v} armor`,
  crit: (v) => `+${pct(v)} crit chance`, critMult: (v) => `+${pct(v)} crit damage`, cdr: (v) => `-${pct(v)} cooldowns`, ultCdr: (v) => `-${pct(v)} Ultimate cooldown`,
  jumps: (v) => `+${v} jump${v > 1 ? 's' : ''}`, jumpPower: (v) => `+${pct(v)} jump height`, pickup: (v) => `+${v}m pickup range`, luck: (v) => `+${v} luck`,
  xp: (v) => `+${pct(v)} XP`, coins: (v) => `+${pct(v)} coins`, area: (v) => `+${pct(v)} area`, lifeOnHit: (v) => `heal ${v} HP on hit`,
  dodge: (v) => `${pct(v)} dodge chance`, shield: (v) => `+${pct(v)} max HP as shield`, chestDiscount: (v) => `chests ${pct(v)} cheaper`,
  kbImmune: () => 'immune to knockback', glide: () => 'hold jump to glide', burnVuln: (v) => `burning enemies take +${pct(v)} damage`,
  dmgTaken: (v) => `-${pct(v)} damage taken`, procMult: (v) => `+${pct(v)} item proc chance`, extraCharges: (v) => `+${v} charge on every ability`,
  burnImmune: () => 'immune to burning', poisonCap: (v) => `+${v} max poison stacks`,
};
export function describeMods(mods) {
  return Object.entries(mods).map(([k, v]) => (FMT[k] ? FMT[k](v) : `${k} ${v}`)).join(', ');
}
const WHEN = {
  lowHp: 'below 35% HP', fullHp: 'above 90% HP', moving: 'moving', still: 'standing still', airborne: 'airborne', notHurt: 'not hit for 3s',
  crowded: '3+ enemies are near you', recentKill: 'for 3s after a kill', shielded: 'you have shield or barrier', ability: 'for 3s after using an ability',
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- builders ----------
const S = (id, name, rarity, icon, mods, extra = '') => ({ ext: true, id, name, rarity, icon, desc: cap(describeMods(mods)) + '.' + (extra ? ' ' + extra : ''), statMods: mods });
const C = (id, name, rarity, icon, when, mods, base = null) => ({
  ext: true, id, name, rarity, icon, statMods: base || undefined, cond: { when, mods },
  desc: (base ? cap(describeMods(base)) + '. ' : '') + cap(describeMods(mods)) + ' while ' + WHEN[when] + '.',
});
const X = (id, name, rarity, icon, desc, hooks, mods) => ({ ext: true, id, name, rarity, icon, desc, ...hooks, statMods: mods || undefined });

export const EXT_ITEMS = [
  // =========================================================== COMMON (51)
  S('rusty_nail', 'Rusty Nail', 'common', '🔩', { damage: 0.06, crit: 0.03 }),
  S('running_shoes', 'Running Shoes', 'common', '👟', { moveSpeed: 0.08, attackSpeed: 0.05 }),
  S('warm_scarf', 'Warm Scarf', 'common', '🧣', { maxHpFlat: 20, regen: 0.5 }),
  S('tin_helmet', 'Tin Helmet', 'common', '⛑️', { armor: 8, maxHpFlat: 10 }),
  S('sugar_cube', 'Sugar Cube', 'common', '🍬', { attackSpeed: 0.1 }),
  S('lucky_chalk', 'Lucky Chalk', 'common', '🧂', { crit: 0.06 }),
  S('map_fragment', 'Map Fragment', 'common', '🗺️', { xp: 0.1, pickup: 1 }),
  S('copper_coin', 'Copper Coin', 'common', '🪙', { coins: 0.1, luck: 0.1 }),
  S('spring_coil', 'Spring Coil', 'common', '➰', { jumpPower: 0.15, moveSpeed: 0.05 }),
  S('leather_gloves', 'Leather Gloves', 'common', '🥊', { damage: 0.05, attackSpeed: 0.05 }),
  S('herbal_tea', 'Herbal Tea', 'common', '🍵', { regen: 1, maxHpFlat: 10 }),
  S('whetstone', 'Whetstone', 'common', '⚒️', { damage: 0.08, critMult: 0.1 }),
  S('focus_crystal', 'Focus Crystal', 'common', '🔮', { cdr: 0.04, damage: 0.04 }),
  S('bubble_wrap', 'Bubble Wrap', 'common', '🫧', { dodge: 0.04 }),
  S('old_compass', 'Old Compass', 'common', '🧭', { pickup: 2, moveSpeed: 0.05 }),
  S('wax_candle', 'Wax Candle', 'common', '🕯️', { area: 0.06 }),
  S('pirate_patch', 'Pirate Patch', 'common', '🏴‍☠️', { crit: 0.07 }),
  S('protein_bar', 'Protein Bar', 'common', '🍫', { maxHpFlat: 25 }),
  S('ankle_weights', 'Ankle Weights', 'common', '🏋️', { armor: 10 }),
  S('stopwatch', 'Stopwatch', 'common', '⏱️', { cdr: 0.05 }),
  S('bellows', 'Bellows', 'common', '💨', { area: 0.08, damage: 0.04 }),
  S('four_leaf', 'Four-Leaf Clover', 'common', '🍀', { luck: 0.2 }),
  S('rollerblades', 'Rollerblades', 'common', '🛼', { moveSpeed: 0.14 }),
  S('knit_mittens', 'Knit Mittens', 'common', '🧶', { armor: 5, regen: 1 }),
  S('cookie', 'Cookie', 'common', '🍪', { maxHpFlat: 15, regen: 0.5 }),
  S('thermos', 'Thermos', 'common', '☕', { regen: 2 }),
  S('slingshot', 'Slingshot', 'common', '🪃', { damage: 0.08 }),
  S('ski_goggles', 'Ski Goggles', 'common', '🥽', { crit: 0.05, attackSpeed: 0.05 }),
  S('scholar_cap', "Scholar's Cap", 'common', '🎓', { xp: 0.1, coins: 0.1 }),
  S('paper_kite', 'Paper Kite', 'common', '🪁', { moveSpeed: 0.08, jumpPower: 0.08 }),
  X('static_glove', 'Static Glove', 'common', '🌩️', '6% chance on hit to zap 2 enemies for 60% damage.', {
    onHit: (n, h) => { if (roll(0.06, h)) chainLightning(h.enemy, 1 + n, 15, D() * 0.6, { procCoef: 0.1 }); },
  }),
  X('firecracker', 'Firecracker', 'common', '🧨', '8% chance on hit to explode for 80% damage.', {
    onHit: (n, h) => { if (roll(0.08, h)) explode(h.pos, 2.5, D() * 0.8 * n, { color: 0xffaa33, procCoef: 0, small: true }); },
  }),
  X('frost_mint', 'Frost Mint', 'common', '🧊', '10% chance on hit to slow an enemy by 40% for 2s.', {
    onHit: (n, h) => { if (roll(0.1 * n, h)) applySlow(h.enemy, 0.4, 2); },
  }),
  X('tack_bag', 'Bag of Tacks', 'common', '📌', '10% chance on hit to make an enemy vulnerable (+25% damage taken) for 2s.', {
    onHit: (n, h) => { if (roll(0.1 * n, h)) h.enemy.vulnT = Math.max(h.enemy.vulnT, 2); },
  }),
  X('leech_jar', 'Leech Jar', 'common', '🐛', 'Kills heal 1% max HP.', { onKill: (n) => G.player.heal(G.player.stats.maxHp * 0.01 * n) }),
  X('coin_pouch', 'Coin Pouch', 'common', '👛', 'Kills have a 15% chance to drop extra coins.', {
    onKill: (n, e) => { if (Math.random() < 0.15 * n) dropCoins(e.pos, 3 * G.run.coinScale); },
  }),
  X('adrenaline_shot', 'Adrenaline Shot', 'common', '💉', 'Kills grant +15% move speed for 2s (max 3 stacks).', {
    onKill: (n) => G.player.addStackBuff('adr_shot', 2, 3, { moveSpeed: 0.15 * n }),
  }),
  X('spiked_collar', 'Spiked Collar', 'common', '⛓️', 'When hit, deal 100% damage back to the attacker.', {
    onDamaged: (n, amt, a) => { if (a && !a.dead) dealDamage(a, D() * n, { procCoef: 0, color: '#c8ff9a' }); },
  }),
  C('first_aid', 'First Aid Kit', 'common', '🧰', 'lowHp', { regen: 4 }),
  C('war_paint', 'War Paint', 'common', '🎨', 'fullHp', { damage: 0.12 }),
  C('tortoise_shell', 'Tortoise Shell', 'common', '🐢', 'still', { armor: 20 }),
  C('jump_rope', 'Jump Rope', 'common', '🪢', 'airborne', { damage: 0.1 }),
  X('pocket_sand', 'Pocket Sand', 'common', '🏜️', '8% chance on hit to stun an enemy for 0.7s.', {
    onHit: (n, h) => { if (roll(0.08 * n, h)) applyStun(h.enemy, 0.7); },
  }),
  X('venom_vial', 'Venom Vial', 'common', '🧪', '10% chance on hit to apply 2 poison stacks.', {
    onHit: (n, h) => { if (roll(0.1, h)) applyPoison(h.enemy, 2 * n); },
  }),
  S('charcoal', 'Charcoal', 'common', '⚫', { burnVuln: 0.1 }),
  S('dowsing_rod', 'Dowsing Rod', 'common', '🥢', { pickup: 3, xp: 0.1 }),
  X('trophy_tooth', 'Trophy Tooth', 'common', '🦴', 'Kills grant +1% damage for 10s (max 10 stacks).', {
    onKill: (n) => G.player.addStackBuff('tooth', 10, 10, { damage: 0.01 * n }),
  }),
  X('iron_skillet', 'Iron Skillet', 'common', '🍳', '6% chance on hit to BONK for +120% damage and knockback.', {
    onHit: (n, h) => { if (roll(0.06, h)) dealDamage(h.enemy, D() * 1.2 * n, { procCoef: 0, knockback: 9, color: '#dddddd' }); },
  }),
  X('alarm_clock', 'Alarm Clock', 'common', '⏰', 'Taking damage reduces ability cooldowns by 0.5s.', {
    onDamaged: (n) => G.player.reduceCooldowns(0.5 * n),
  }),
  X('cushion', 'Cushion', 'common', '🛋️', 'After taking damage, gain +30 armor for 2s.', {
    onDamaged: (n) => G.player.addBuff('cushion', 2, { armor: 30 * n }),
  }),
  X('snack_bag', 'Snack Bag', 'common', '🥨', 'Every 5s, heal 2% max HP.', {
    onTick: every('snack', 5)((n, p) => p.heal(p.stats.maxHp * 0.02 * n)),
  }),

  // =========================================================== RARE (54)
  S('chain_vest', 'Chain Vest', 'rare', '🥋', { armor: 20, maxHpFlat: 30 }),
  S('falcon_feather', 'Falcon Feather', 'rare', '🦅', { jumps: 1, moveSpeed: 0.15 }),
  S('spyglass', 'Spyglass', 'rare', '🔭', { crit: 0.12, critMult: 0.2 }),
  S('flywheel', 'Flywheel', 'rare', '🛞', { attackSpeed: 0.2 }),
  S('war_horn', 'War Horn', 'rare', '📯', { damage: 0.15, area: 0.1 }),
  S('sage_robe', 'Sage Robe', 'rare', '👘', { cdr: 0.15 }),
  S('heart_locket', 'Heart Locket', 'rare', '💝', { maxHpFlat: 60, regen: 1.5 }),
  S('smoke_cloak', 'Smoke Cloak', 'rare', '🌫️', { dodge: 0.12 }),
  S('treasure_scroll', 'Treasure Scroll', 'rare', '📜', { luck: 0.5, coins: 0.25 }),
  S('wisdom_tome', 'Wisdom Tome', 'rare', '📚', { xp: 0.3, damage: 0.05 }),
  S('growth_serum', 'Growth Serum', 'rare', '🧫', { area: 0.2 }),
  S('battle_standard', 'Battle Standard', 'rare', '🚩', { damage: 0.1, attackSpeed: 0.1, armor: 10 }),
  S('warm_heart', 'Warm Heart', 'rare', '❤️', { regen: 3, maxHpFlat: 20 }),
  S('energy_cell', 'Energy Cell', 'rare', '🔌', { shield: 0.1, cdr: 0.08 }),
  S('sprinter_band', "Sprinter's Band", 'rare', '🎽', { moveSpeed: 0.2, jumpPower: 0.1 }),
  S('evil_eye', 'Evil Eye', 'rare', '🧿', { crit: 0.1, critMult: 0.15 }),
  S('hiking_boots', 'Hiking Boots', 'rare', '🥾', { armor: 15, moveSpeed: 0.1 }),
  S('gamblers_dice', "Gambler's Dice", 'rare', '🎲', { luck: 0.6 }),
  X('thunder_bracer', 'Thunder Bracer', 'rare', '🔱', '15% chance on hit to chain lightning to 4 enemies for 120% damage.', {
    onHit: (n, h) => { if (roll(0.15, h)) chainLightning(h.enemy, 2 + 2 * n, 18, D() * 1.2, { procCoef: 0.2 }); },
  }),
  X('grenade_belt', 'Grenade Belt', 'rare', '🎆', '12% chance on hit to blast the area for 250% damage.', {
    onHit: (n, h) => { if (roll(0.12, h)) explode(h.pos, 4, D() * 2.5 * n, { color: 0xffbb44, procCoef: 0.2 }); },
  }),
  X('frost_brooch', 'Frost Brooch', 'rare', '💠', '10% chance on hit to freeze an enemy for 1.2s.', {
    onHit: (n, h) => { if (roll(hyper(0.1, n), h)) applyFreeze(h.enemy, 1.2); },
  }),
  X('vampire_goblet', 'Vampire Goblet', 'rare', '🍷', 'Heal for 3% of all damage you deal.', {
    onHit: (n, h) => G.player.heal(Math.min(h.damage * 0.03 * n * Math.max(0.3, h.procCoef), G.player.stats.maxHp * 0.05)),
  }),
  X('hunter_trap', "Hunter's Trap", 'rare', '🪤', '30% chance on hit to slow enemies by 25% for 2s.', {
    onHit: (n, h) => { if (roll(0.3 * n, h)) applySlow(h.enemy, 0.25, 2); },
  }),
  X('doom_mark', 'Mark of Doom', 'rare', '☠️', '15% chance on hit to mark an enemy: +25% damage taken for 4s.', {
    onHit: (n, h) => { if (roll(0.15 * n, h)) h.enemy.vulnT = Math.max(h.enemy.vulnT, 4); },
  }),
  X('acid_flask', 'Acid Flask', 'rare', '⚗️', '20% chance on hit to apply 3 poison stacks.', {
    onHit: (n, h) => { if (roll(0.2, h)) applyPoison(h.enemy, 3 * n); },
  }),
  X('inferno_charm', 'Inferno Charm', 'rare', '🎇', '15% chance on hit to ignite for 300% damage over 3s.', {
    onHit: (n, h) => { if (roll(0.15, h)) applyBurn(h.enemy, D() * n, 3); },
  }),
  S('executioner_axe', "Executioner's Axe", 'rare', '🪓', { execute: 0.08 }, 'Hits execute non-boss enemies below 8% HP.'),
  X('soul_jar', 'Soul Jar', 'rare', '⚱️', 'Kills reduce all ability cooldowns by 0.4s.', { onKill: (n) => G.player.reduceCooldowns(0.4 * n) }),
  X('bounty_poster', 'Bounty Poster', 'rare', '📃', 'Elites and bosses drop double coins.', {
    onKill: (n, e) => { if (e.elite || e.isBoss) dropCoins(e.pos, e.def.coins * G.run.coinScale * (e.elite ? 3 : 1) * n); },
  }),
  X('ghost_pepper', 'Ghost Pepper', 'rare', '🌶️', 'Kills release 6 fire bolts for 100% damage.', {
    onKill: (n, e) => nova(e.pos, 6 * n, 1, 0xff5522),
  }),
  X('gravity_stone', 'Gravity Stone', 'rare', '🕳️', '8% chance on hit to pull nearby enemies in and deal 150% damage.', {
    onHit: (n, h) => {
      if (!roll(0.08, h)) return;
      pullEnemies(h.pos, 8, 5);
      explode(h.pos, 4, D() * 1.5 * n, { color: 0x8866ff, procCoef: 0 });
    },
  }),
  C('regen_moss', 'Regen Moss', 'rare', '🌿', 'notHurt', { regen: 5 }),
  C('berserk_brew', 'Berserk Brew', 'rare', '🍺', 'lowHp', { attackSpeed: 0.3, damage: 0.1 }),
  X('sharpshooter_hat', "Sharpshooter's Hat", 'rare', '🎩', '+25% damage to enemies more than 20m away.', {
    dmgMod: (n, e, dmg, p) => (e.pos.distanceTo(p.pos) > 20 ? dmg * (1 + 0.25 * n) : dmg),
  }),
  X('brawler_tape', "Brawler's Tape", 'rare', '🎗️', '+25% damage to enemies within 6m.', {
    dmgMod: (n, e, dmg, p) => (e.pos.distanceTo(p.pos) < 6 ? dmg * (1 + 0.25 * n) : dmg),
  }),
  X('giant_slayer_ring', 'Giant Slayer Ring', 'rare', '💍', '+30% damage to bosses and elites.', {
    dmgMod: (n, e, dmg) => (e.isBoss || e.elite ? dmg * (1 + 0.3 * n) : dmg),
  }),
  X('mirror_shield', 'Mirror Shield', 'rare', '🪞', 'When hit, 25% chance to reflect 300% damage around you.', {
    onDamaged: (n) => { if (Math.random() < 0.25) explode(G.player.pos, 5, D() * 3 * n, { color: 0xccffff, procCoef: 0 }); },
  }),
  X('storm_cloud', 'Storm Cloud', 'rare', '☁️', 'Every 3s, lightning strikes a nearby enemy for 300% damage.', {
    onTick: every('cloud', 3)((n, p) => {
      const t = findTargets(p.pos, 25, 6);
      if (t.length) smite(t[Math.floor(Math.random() * t.length)], 3 * n, 0xbfe4ff), sfx('zap');
    }),
  }),
  X('wisp_jar', 'Wisp Jar', 'rare', '🫙', 'A friendly wisp orbits you and shoots enemies (+1 per stack).', {
    onTick: (n, dt, p) => {
      const have = G.minions.filter((m) => m.type === 'wisp' && !m.dead).length;
      if (have < n) spawnMinion('wisp', p.pos, { index: have });
    },
  }),
  X('barrier_charm', 'Barrier Charm', 'rare', '🔰', 'Kills grant a barrier of 3% max HP.', {
    onKill: (n) => G.player.addBarrier(G.player.stats.maxHp * 0.03 * n),
  }),
  X('second_wind', 'Second Wind', 'rare', '🌬️', 'When hit below 30% HP, gain a 30% max HP barrier (20s cooldown).', {
    onDamaged: (n) => {
      const p = G.player;
      if (p.hp / p.stats.maxHp < 0.3 && !(p.itemTimers.secondWind > G.time)) {
        p.itemTimers.secondWind = G.time + 20 / n;
        p.addBarrier(p.stats.maxHp * 0.3);
        ring(p.pos, 4, 0xbfefff, 0.5);
      }
    },
  }),
  X('cleaver', 'Cleaver', 'rare', '🔪', '15% chance on hit to bleed for 240% damage over 4s.', {
    onHit: (n, h) => { if (roll(0.15, h)) applyBurn(h.enemy, D() * 0.6 * n, 4); },
  }),
  X('spark_plug', 'Spark Plug', 'rare', '🪫', 'Every 2.5s, zap the nearest enemy for 250% damage.', {
    onTick: every('plug', 2.5)((n, p) => {
      const e = nearestEnemy(p.pos, 20);
      if (!e) return;
      beam(p.pos.clone().setY(p.pos.y + 1.4), mid(e), 0x9fe8ff, 0.12, 0.15);
      dealDamage(e, D() * 2.5 * n, { procCoef: 0.3, color: '#9fe8ff' });
    }),
  }),
  X('shockwave_boots', 'Shockwave Boots', 'rare', '👢', 'Landing from a jump sends a shockwave for 200% damage.', {
    onLand: (n, impact, p) => { if (impact > 9) explode(p.pos, 4, D() * 2 * n, { color: 0xddccaa, procCoef: 0.3 }); },
  }),
  S('heavy_rounds', 'Heavy Rounds', 'rare', '⚖️', { damage: 0.25, attackSpeed: -0.08 }),
  S('mana_crystal', 'Mana Crystal', 'rare', '💎', { cdr: 0.1, ultCdr: 0.15 }),
  X('frostbite_edge', 'Frostbite Edge', 'rare', '🥶', '+20% damage to slowed, chilled or frozen enemies.', {
    dmgMod: (n, e, dmg) => (e.status.slowT > 0 || e.status.freeze > 0 ? dmg * (1 + 0.2 * n) : dmg),
  }),
  X('blood_hound', 'Blood Hound', 'rare', '🐺', 'Kills grant +6% move speed and +6% damage for 4s (max 5 stacks).', {
    onKill: (n) => G.player.addStackBuff('hound', 4, 5, { moveSpeed: 0.06 * n, damage: 0.06 * n }),
  }),
  S('treasure_sense', 'Treasure Sense', 'rare', '💰', { chestDiscount: 0.1, coins: 0.1 }),
  X('guardian_angel', 'Guardian Angel', 'rare', '😇', 'Once per stage, survive a lethal hit with 1 HP and become invulnerable for 2s.', {
    onLethal: (n, p) => {
      if (p.itemTimers.angelStage === G.run.stageNum) return false;
      p.itemTimers.angelStage = G.run.stageNum;
      p.hp = 1;
      p.invulnT = 2;
      floatText(p.pos.clone().setY(p.pos.y + 2), 'SAVED!', '#fff6b0', true);
      return true;
    },
  }),
  X('meteor_shard', 'Meteor Shard', 'rare', '☄️', '5% chance on hit to call down a meteor for 400% damage.', {
    onHit: (n, h) => { if (roll(0.05 * n, h)) meteor(h.pos, 4, 4); },
  }),
  X('echo_bell', 'Echo Bell', 'rare', '🔔', 'Using an ability grants +20% attack speed for 3s (max 3 stacks).', {
    onCast: (n) => { G.player.addStackBuff('bell', 3, 3, { attackSpeed: 0.2 * n }); },
  }),
  X('orbit_blades', 'Orbiting Blades', 'rare', '🌙', 'Blades circle you, hitting nearby enemies for 100% damage every 0.5s.', {
    onTick: every('orbit', 0.5)((n, p) => {
      for (const e of findTargets(p.pos, 3.5 * p.stats.area, 20)) dealDamage(e, D() * n, { procCoef: 0.2, color: '#e0e0ff' });
      for (let i = 0; i < 3; i++) {
        const a = G.realTime * 6 + (i * Math.PI * 2) / 3;
        particles(_v.set(p.pos.x + Math.cos(a) * 3, p.pos.y + 1, p.pos.z + Math.sin(a) * 3), 0xe0e0ff, 1, 0.5, 0.3, 0.3, 0);
      }
    }),
  }),

  S('rabbit_foot', "Rabbit's Foot", 'rare', '🐇', { crit: 0.08, luck: 0.3, dodge: 0.05 }),

  // =========================================================== EPIC (35)
  X('colossus_fist', 'Colossus Fist', 'epic', '✊', '10% chance on hit to cause a shockwave for 400% damage.', {
    onHit: (n, h) => { if (roll(0.1, h)) explode(h.pos, 6, D() * 4 * n, { color: 0xffcc88, procCoef: 0.2, knockback: 8 }); },
  }),
  S('arcane_battery', 'Arcane Battery', 'epic', '🪄', { cdr: 0.2, shield: 0.15 }),
  X('chrono_watch', 'Chrono Watch', 'epic', '⌚', 'Abilities have a 20% chance not to use a charge.', {
    onCast: (n) => (Math.random() < hyper(0.2, n) ? 'refund' : null),
  }),
  S('dragon_scale', 'Dragon Scale', 'epic', '🐉', { armor: 40, maxHpFlat: 60 }),
  X('storm_crown', 'Storm Crown', 'epic', '🌩', 'Every 1.5s, lightning arcs from you through 5 enemies for 180% damage.', {
    onTick: every('scrown', 1.5)((n, p) => {
      const e = nearestEnemy(p.pos, 20);
      if (!e) return;
      beam(p.pos.clone().setY(p.pos.y + 1.4), mid(e), 0x9fd8ff, 0.14, 0.15);
      dealDamage(e, D() * 1.8 * n, { procCoef: 0.3, color: '#9fd8ff' });
      chainLightning(e, 4, 16, D() * 1.8 * n, { procCoef: 0.2 });
    }),
  }),
  X('plague_mask', 'Plague Mask', 'epic', '😷', '30% chance on hit to apply 2 poison stacks. +5 max poison stacks. Poisoned enemies spread their poison on death.', {
    onHit: (n, h) => { if (roll(0.3, h)) applyPoison(h.enemy, 2 * n); },
    onKill: (n, e) => { if (e.status.poison > 0) for (const o of findTargets(e.pos, 7, 5)) applyPoison(o, Math.ceil(e.status.poison / 2)); },
  }, { poisonCap: 5 }),
  X('frost_core', 'Frost Core', 'epic', '❄️', '15% chance on hit to freeze for 2s. Frozen enemies shatter on death for 300% damage.', {
    onHit: (n, h) => { if (roll(0.15, h)) applyFreeze(h.enemy, 2); },
    onKill: (n, e) => { if (e.status.freeze > 0) explode(e.pos, 5, D() * 3 * n, { color: 0xbff3ff, procCoef: 0, freeze: 1 }); },
  }),
  X('void_shard', 'Void Shard', 'epic', '🟣', '10% chance on hit to open a small rift that pulls enemies in for 2s.', {
    onHit: (n, h) => {
      if (!roll(0.1, h)) return;
      spawnZone({
        pos: h.pos, radius: 5, duration: 2, tick: 0.25, color: 0x330044, kind: 'blackhole',
        onTick: (z) => { pullEnemies(z.pos, z.radius, 2); for (const e of findTargets(z.pos, z.radius, 30)) dealDamage(e, D() * 0.25 * n, { procCoef: 0, canCrit: false, color: '#bb77ff' }); },
      });
    },
  }),
  X('golden_goose', 'Golden Goose', 'epic', '🪿', 'Every 30s, lay a pile of coins worth a chest.', {
    onTick: every('goose', 30)((n, p) => { dropCoins(p.pos, 30 * G.run.coinScale * n); sfx('coin'); }),
  }),
  X('warlord_banner', 'Warlord Banner', 'epic', '🏴', 'You and your allies deal +25% damage and attack 20% faster.', {}, { damage: 0.25, attackSpeed: 0.2 }),
  X('clone_mask', 'Clone Mask', 'epic', '🎭', 'A shadow clone fights beside you (+1 per stack).', {
    onTick: (n, dt, p) => {
      const have = G.minions.filter((m) => m.type === 'shade' && !m.dead).length;
      if (have < n) spawnMinion('shade', p.pos, {});
    },
  }),
  X('blood_moon', 'Blood Moon', 'epic', '🌕', '+1% damage for every 10 kills this stage (max +50%).', {
    dmgMod: (n, e, dmg, p) => dmg * (1 + Math.min(0.5 * n, Math.floor((p.stageKills || 0) / 10) * 0.01 * n)),
  }),
  X('thunder_hammer', 'Thunder Hammer', 'epic', '🔨', 'Critical hits have a 30% chance to call lightning for 300% damage.', {
    onHit: (n, h) => { if (h.crit && roll(0.3, h) && !h.enemy.dead) smite(h.enemy, 3 * n, 0xbfe4ff); },
  }),
  S('phase_boots', 'Phase Boots', 'epic', '👣', { moveSpeed: 0.25, dodge: 0.1, jumps: 1 }),
  S('mountain_heart', 'Heart of the Mountain', 'epic', '⛰️', { maxHpFlat: 100, armor: 30, moveSpeed: -0.1 }),
  X('hydra_fang', 'Hydra Fang', 'epic', '🐍', '20% chance on hit to launch 3 homing fangs for 120% damage each.', {
    onHit: (n, h) => { if (roll(0.2, h)) homers(h.pos, 3 * n, 1.2, 0x88ff66, h.enemy, 'blade'); },
  }),
  X('atom_core', 'Atom Core', 'epic', '⚛️', 'Every 4s, pulse energy around you for 350% damage.', {
    onTick: every('atom', 4)((n, p) => { explode(p.pos, 8, D() * 3.5 * n, { color: 0x66ffee, procCoef: 0.3 }); }),
  }),
  X('grave_tome', 'Grave Tome', 'epic', '📕', 'Kills have a 30% chance to raise a skeleton for 15s (max 4).', {
    onKill: (n, e) => {
      if (Math.random() < 0.3 && G.minions.filter((m) => m.type === 'skeleton' && !m.dead).length < 3 + n) spawnMinion('skeleton', e.pos, { life: 15 });
    },
  }),
  X('aegis', 'Aegis', 'epic', '⚜️', 'Every 8s, fully block the next hit.', {
    onBlock: (n, p) => {
      if ((p.itemTimers.aegis || 0) > G.time) return false;
      p.itemTimers.aegis = G.time + 8 / n;
      ring(p.pos, 2.5, 0xffe9a0, 0.4);
      floatText(p.pos.clone().setY(p.pos.y + 2), 'BLOCK', '#ffe9a0');
      return true;
    },
  }),
  X('sunfire_cape', 'Sunfire Cape', 'epic', '🌞', 'Burn enemies within 5m for 80% damage per second.', {
    onTick: every('sunfire', 0.5)((n, p) => {
      for (const e of findTargets(p.pos, 5 * p.stats.area, 30)) dealDamage(e, D() * 0.4 * n, { procCoef: 0, canCrit: false, color: '#ffb066' });
      particles(p.pos, 0xff8833, 2, 2, 0.4, 0.25, -2);
    }),
  }),
  X('blood_quill', 'Blood Quill', 'epic', '🖋️', '+30% crit chance. +25% damage against enemies below 50% HP.', {
    dmgMod: (n, e, dmg) => (e.hp / e.maxHp < 0.5 ? dmg * (1 + 0.25 * n) : dmg),
  }, { crit: 0.3 }),
  X('swarm_hive', 'Swarm Hive', 'epic', '🐝', '15% chance on hit to release 3 bees for 60% damage each.', {
    onHit: (n, h) => { if (roll(0.15, h)) homers(h.pos, 3 * n, 0.6, 0xffdd33); },
  }),
  S('parachute', 'Parachute', 'epic', '🪂', { glide: true, jumps: 2, moveSpeed: 0.15 }),
  X('blade_dancer', 'Blade Dancer', 'epic', '💃', 'Using an ability releases 8 blades for 150% damage.', {
    onCast: (n, slot, p) => { nova(p.pos, 8 * n, 1.5, 0xe0d0ff, 'blade', 40); },
  }),
  X('golden_trophy', 'Golden Trophy', 'epic', '🏆', '+30% coins. Kills have a 10% chance to drop 5x coins.', {
    onKill: (n, e) => { if (Math.random() < 0.1 * n) dropCoins(e.pos, e.def.coins * G.run.coinScale * 5); },
  }, { coins: 0.3 }),
  S('overclock_chip', 'Overclock Chip', 'epic', '💾', { attackSpeed: 0.35 }),
  X('brimstone', 'Brimstone Boots', 'epic', '♨️', 'While moving, leave a trail of fire that burns for 100% damage per second.', {
    onTick: every('brim', 0.35)((n, p) => {
      if (Math.hypot(p.vel.x, p.vel.z) < 2 || !p.grounded) return;
      spawnZone({
        pos: p.pos.clone(), radius: 1.8, duration: 2, tick: 0.5, color: 0xff5522, kind: 'fire',
        onTick: (z) => { for (const e of findTargets(z.pos, z.radius, 10)) dealDamage(e, D() * 0.5 * n, { procCoef: 0, canCrit: false, color: '#ff8a3a' }); },
      });
    }),
  }),
  X('spectral_links', 'Spectral Links', 'epic', '🔗', 'Direct hits echo 20% of their damage to 2 nearby enemies.', {
    onHit: (n, h) => {
      if (h.procCoef < 0.5) return;
      for (const o of findTargets(h.enemy.pos, 8, 3)) if (o !== h.enemy) dealDamage(o, h.damage * 0.2 * n, { procCoef: 0, canCrit: false, color: '#b8c8ff' });
    },
  }),
  C('last_stand', 'Last Stand', 'epic', '🪖', 'lowHp', { damage: 0.5, armor: 50 }),
  C('momentum_engine', 'Momentum Engine', 'epic', '🏎️', 'moving', { damage: 0.2, attackSpeed: 0.1 }),
  S('crystal_heart', 'Crystal Heart', 'epic', '🔷', { shield: 0.25 }),
  X('rift_edge', 'Rift Edge', 'epic', '🌌', '+100% damage against enemies at full health.', {
    dmgMod: (n, e, dmg) => (e.hp >= e.maxHp ? dmg * (1 + n) : dmg),
  }),
  X('harvest_moon', 'Harvest Moon', 'epic', '🌗', 'Kills heal 2% max HP. Elite and boss kills heal 15%.', {
    onKill: (n, e) => G.player.heal(G.player.stats.maxHp * (e.elite || e.isBoss ? 0.15 : 0.02) * n),
  }),
  S('star_chart', 'Star Chart', 'epic', '⭐', { luck: 1, xp: 0.2, coins: 0.2 }),
  X('war_drum', 'War Drum', 'epic', '🥁', 'Every 10s, gain +60% attack speed for 3s.', {
    onTick: every('drum', 10)((n, p) => { p.addBuff('drum', 3, { attackSpeed: 0.6 * n }); ring(p.pos, 4, 0xffaa55, 0.4); }),
  }),

  // =========================================================== LEGENDARY (21)
  S('infinity_loop', 'Infinity Loop', 'legendary', '♾️', { cdr: 0.3, extraCharges: 1 }),
  X('world_eater', 'World Eater', 'legendary', '🌍', 'Kills permanently grant +0.5% damage this run (max +100%).', {
    onKill: (n, e) => {
      const p = G.player;
      if ((p.eaterDmg || 0) < 1 * n) {
        p.eaterDmg = (p.eaterDmg || 0) + 0.005;
        p.markDirty();
      }
    },
  }),
  S('dragon_heart', 'Dragon Heart', 'legendary', '🐲', { maxHpFlat: 200, regen: 10, burnImmune: true }),
  X('divine_wrath', 'Divine Wrath', 'legendary', '🌟', 'Every 3s, smite 3 nearby enemies for 800% damage each.', {
    onTick: every('wrath', 3)((n, p) => {
      for (const e of findTargets(p.pos, 30, 3 * n)) smite(e, 8);
      sfx('laser');
    }),
  }),
  X('time_crystal', 'Time Crystal', 'legendary', '🕐', 'Abilities have a 35% chance not to use a charge. -15% cooldowns.', {
    onCast: (n) => (Math.random() < hyper(0.35, n) ? 'refund' : null),
  }, { cdr: 0.15 }),
  X('ragnarok_horn', 'Horn of Ragnarok', 'legendary', '🎺', 'Kills have a 20% chance to unleash an inferno for 600% damage.', {
    onKill: (n, e) => { if (Math.random() < 0.2 * n) meteor(e.pos, 8, 6, 0xff4411); },
  }),
  X('gods_eye', "God's Eye", 'legendary', '👁️', '+25% crit chance. Hits against enemies below 50% HP always crit.', {
    dmgMod: (n, e, dmg, p) => (e.hp / e.maxHp < 0.5 ? dmg * Math.max(1, p.stats.critMult * 0.5) : dmg),
  }, { crit: 0.25 }),
  S('hand_of_midas', 'Hand of Midas', 'legendary', '🤑', { coins: 1, chestDiscount: 0.15, luck: 1 }),
  X('eternal_flame', 'Eternal Flame', 'legendary', '🔆', 'All hits burn for 100% damage over 3s. Burning enemies take +30% damage.', {
    onHit: (n, h) => { if (h.procCoef > 0) applyBurn(h.enemy, (D() * n) / 3, 3); },
  }, { burnVuln: 0.3 }),
  X('tidal_core', 'Tidal Core', 'legendary', '🌊', 'Every 6s, send out a crashing wave for 600% damage that knocks enemies back.', {
    onTick: every('tide', 6)((n, p) => {
      explode(p.pos, 12, D() * 6 * n, { color: 0x55aaff, procCoef: 0.3, knockback: 16, big: true });
      ring(p.pos, 16, 0xaaddff, 0.7);
    }),
  }),
  X('necronomicon', 'Necronomicon', 'legendary', '📖', 'Three skeleton warriors always fight for you (+2 per stack).', {
    onTick: every('necro', 1)((n, p) => {
      const have = G.minions.filter((m) => m.type === 'skeleton' && m.opts.permanent && !m.dead).length;
      if (have < 1 + 2 * n) spawnMinion('skeleton', p.pos, { life: 99999, warrior: true, permanent: true });
    }),
  }),
  X('thunder_anvil', 'Thunder Anvil', 'legendary', '⛈️', '25% chance on hit to chain lightning through 6 enemies for 200% damage.', {
    onHit: (n, h) => { if (roll(0.25, h)) chainLightning(h.enemy, 4 + 2 * n, 20, D() * 2, { procCoef: 0.2 }); },
  }),
  S('fate_dice', 'Fate Dice', 'legendary', '🎰', { luck: 2, procMult: 0.5 }),
  S('celestial_armor', 'Celestial Armor', 'legendary', '🥇', { armor: 80, dmgTaken: 0.2 }),
  X('ouroboros', 'Ouroboros', 'legendary', '🔄', 'Once per stage, return from death with 50% HP.', {
    onLethal: (n, p) => {
      if (p.itemTimers.ouroStage === G.run.stageNum) return false;
      p.itemTimers.ouroStage = G.run.stageNum;
      p.hp = p.stats.maxHp * 0.5;
      p.invulnT = 2.5;
      explode(p.pos, 10, D() * 8, { color: 0x88ff88, big: true, knockback: 12 });
      floatText(p.pos.clone().setY(p.pos.y + 2), 'REBIRTH', '#88ff88', true);
      return true;
    },
  }),
  S('void_heart', 'Void Heart', 'legendary', '🖤', { damage: 0.35, attackSpeed: 0.35, maxHpPct: -0.2 }),
  X('starfall', 'Starfall', 'legendary', '💫', 'Every 4s, 5 meteors crash down around you for 400% damage.', {
    onTick: every('starfall', 4)((n, p) => {
      const ts = findTargets(p.pos, 30, 5 * n);
      for (let i = 0; i < 5 * n; i++) {
        const t = ts[i];
        const pos = t ? t.pos.clone() : p.pos.clone().add(_v.set((Math.random() - 0.5) * 20, 0, (Math.random() - 0.5) * 20));
        after(i * 0.12, () => meteor(pos, 4, 4, 0xffd27a));
      }
    }),
  }),
  S('giant_growth', 'Giant Growth', 'legendary', '🍄', { area: 0.5, damage: 0.3, maxHpFlat: 50 }),
  X('prism', 'Prism', 'legendary', '🔺', '30% chance on hit to fire 2 homing prism beams for 100% damage.', {
    onHit: (n, h) => { if (roll(0.3, h)) homers(G.player.pos, 2 * n, 1, 0xff88ff, null, 'shard'); },
  }),
  S('hourglass_ages', 'Hourglass of Ages', 'legendary', '⌛', { cdr: 0.4, ultCdr: 0.4 }),
  S('war_avatar', 'Avatar of War', 'legendary', '🦁', { damage: 0.5, crit: 0.25, attackSpeed: 0.25 }),
];
