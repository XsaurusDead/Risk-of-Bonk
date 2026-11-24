// Megabonk-style tomes and weapon levels.
//
// Level-ups offer tomes, weapons, or a mix of both (random each time).
// - Tomes: up to 4 different tomes per run, each up to level 99. Every pick is
//   +1 tome level; the roll's rarity decides how much of the effect you get.
// - Weapons: your survivor's Primary, Ability 1, Ability 2 and Ultimate, each up
//   to level 50. Every pick improves one stat of that weapon (rarity scales it),
//   and every 10th level adds a flat +10% damage bonus.

export const TOME_SLOTS = 4;
export const TOME_MAX = 99;
export const WEAPON_MAX = 50;

/** Same rarity table as items: luck shifts the odds towards the rarer rolls. */
export const ROLL_RARITY = {
  common: { weight: 62, mult: 1 },
  rare: { weight: 26, mult: 1.6 },
  epic: { weight: 9, mult: 2.4 },
  legendary: { weight: 3, mult: 4 },
};

const pct = (v) => `${Math.round(v * 1000) / 10}%`;

// base = value of a common roll. `total` formats the summed value for the HUD/inventory.
export const TOMES = [
  { id: 'power', name: 'Tome of Power', icon: 1098, base: 0.05, stat: 'damage', fmt: (v) => `+${pct(v)} damage` },
  { id: 'precision', name: 'Tome of Precision', icon: 1173, base: 0.02, stat: 'crit', fmt: (v) => `+${pct(v)} crit chance`, note: 'Crit chance above 100% turns into crit damage.' },
  { id: 'evasion', name: 'Tome of Evasion', icon: 1078, base: 0.03, stat: 'dodge', fmt: (v) => `+${pct(v)} evasion`, note: 'Evasion has diminishing returns (max 80% dodge).' },
  { id: 'bulwark', name: 'Tome of Defense', icon: 1099, base: 3, stat: 'armor', fmt: (v) => `+${Math.round(v * 10) / 10} armor` },
  { id: 'greed', name: 'Tome of Greed', icon: 160, base: 0.06, stat: 'gold', fmt: (v) => `+${pct(v)} gold` },
  { id: 'multishot', name: 'Tome of Multishot', icon: 1134, base: 0.1, stat: 'projectiles', fmt: (v) => `+${Math.round(v * 100) / 100} projectiles`, note: 'Fractions give a chance to fire one more.' },
  { id: 'fury', name: 'Tome of Fury', icon: 1100, base: 0.04, stat: 'attackSpeed', fmt: (v) => `+${pct(v)} attack speed` },
  { id: 'skies', name: 'Tome of the Skies', icon: 1144, base: 0.1, stat: 'jumps', fmt: (v) => `+${Math.round(v * 100) / 100} jumps`, note: 'Every full 1.0 is one more jump (max +10).' },
  { id: 'fortune', name: 'Tome of Fortune', icon: 114, base: 0.04, stat: 'luck', fmt: (v) => `+${Math.round(v * 100) / 100} luck`, note: 'Better chest, Moai, item and tome/weapon roll odds.' },
  { id: 'wisdom', name: 'Tome of Wisdom', icon: 101, base: 0.05, stat: 'xp', fmt: (v) => `+${pct(v)} experience` },
  { id: 'vampire', name: 'Tome of Blood', icon: 1064, base: 0.003, stat: 'lifesteal', fmt: (v) => `+${pct(v)} life steal`, note: 'Heals a share of the damage you deal (max 30%).' },
  { id: 'aegis', name: 'Tome of the Aegis', icon: 1043, base: 0.025, stat: 'shield', fmt: (v) => `+${pct(v)} max HP as shield` },
  { id: 'giant', name: 'Tome of the Giant', icon: 1047, base: 0.03, stat: 'area', fmt: (v) => `+${pct(v)} size` },
  { id: 'magnet', name: 'Tome of Attraction', icon: 117, base: 0.35, stat: 'pickup', fmt: (v) => `+${Math.round(v * 10) / 10}m pickup range` },
  { id: 'vitality', name: 'Tome of Vitality', icon: 1042, base: 0.05, stat: 'maxHp', fmt: (v) => `+${pct(v)} max HP` },
  { id: 'agility', name: 'Tome of Agility', icon: 1170, base: 0.025, stat: 'moveSpeed', fmt: (v) => `+${pct(v)} movement speed`, note: 'Diminishing returns past +100%.' },
];
export const TOME_BY_ID = Object.fromEntries(TOMES.map((t) => [t.id, t]));

/** Apply summed tome values to the stat modifier object used by Player.recalcStats. */
export function applyTomes(m, tomes) {
  for (const id in tomes) {
    const t = TOME_BY_ID[id];
    if (!t) continue;
    const v = tomes[id].value;
    switch (t.stat) {
      case 'damage': m.damage += v; break;
      case 'crit': m.crit += v; break;
      case 'dodge': m.tomeDodge += v; break;
      case 'armor': m.armor += v; break;
      case 'gold': m.coins += v; break;
      case 'projectiles': m.projectiles += v; break;
      case 'attackSpeed': m.attackSpeed += v; break;
      case 'jumps': m.jumps += Math.min(10, Math.floor(v + 1e-6)); break;
      case 'luck': m.luck += v; break;
      case 'xp': m.xp += v; break;
      case 'lifesteal': m.lifesteal += v; break;
      case 'shield': m.shield += v; break;
      case 'area': m.area += v; break;
      case 'pickup': m.pickup += v; break;
      case 'maxHp': m.maxHpPct += v; break;
      case 'moveSpeed': m.moveSpeed += v <= 1 ? v : 1 + (v - 1) / (1 + (v - 1)); break;
    }
  }
}

// ---------------------------------------------------------------- weapons
export const WEAPON_SLOTS = ['primary', 'ability1', 'ability2', 'ultimate'];

/** Stats a weapon level-up can improve. `slots` limits where a stat can roll. */
export const WEAPON_STATS = [
  { id: 'dmg', name: 'Damage', base: 0.08, weight: 4, fmt: (v) => `+${pct(v)} damage` },
  { id: 'rate', name: 'Fire rate', base: 0.06, weight: 3, slots: ['primary'], fmt: (v) => `+${pct(v)} attack speed` },
  { id: 'cd', name: 'Cooldown', base: 0.06, weight: 3, slots: ['ability1', 'ability2', 'ultimate'], fmt: (v) => `-${pct(1 - 1 / (1 + v))} cooldown` },
  { id: 'area', name: 'Size', base: 0.06, weight: 2, fmt: (v) => `+${pct(v)} size` },
  { id: 'proj', name: 'Projectiles', base: 0.2, weight: 1.2, slots: ['primary'], fmt: (v) => `+${Math.round(v * 100) / 100} projectiles` },
  { id: 'crit', name: 'Crit chance', base: 0.025, weight: 1.5, fmt: (v) => `+${pct(v)} crit chance` },
];

export const newWeapon = () => ({ level: 1, dmg: 0, rate: 0, cd: 0, area: 0, proj: 0, crit: 0 });

/** Derived multipliers for one weapon. */
export function weaponMods(w, slot) {
  if (!w) return { dmg: 1, area: 1, rate: 1, cd: 1, proj: 0, crit: 0, charges: 0 };
  const milestone = Math.floor(w.level / 10) * 0.1;
  return {
    dmg: (1 + w.dmg) * (1 + milestone),
    area: 1 + w.area,
    rate: 1 + w.rate,
    cd: 1 / (1 + w.cd),
    proj: w.proj,
    crit: w.crit,
    // Ability 1 and 2 get an extra charge at weapon level 25 and 50
    charges: slot === 'ability1' || slot === 'ability2' ? (w.level >= 50 ? 2 : w.level >= 25 ? 1 : 0) : 0,
  };
}
