// Megabonk-style level-up choices. Each roll gets a rarity that multiplies its value.
export const UPGRADE_RARITY = {
  common: { weight: 62, mult: 1 },
  rare: { weight: 26, mult: 1.6 },
  epic: { weight: 9, mult: 2.4 },
  legendary: { weight: 3, mult: 4 },
};

export const UPGRADES = [
  { id: 'damage', name: 'Power', icon: '⚔️', base: 0.08, fmt: (v) => `+${Math.round(v * 100)}% damage`, apply: (m, v) => (m.damage += v) },
  { id: 'attackSpeed', name: 'Haste', icon: '🏹', base: 0.08, fmt: (v) => `+${Math.round(v * 100)}% attack speed`, apply: (m, v) => (m.attackSpeed += v) },
  { id: 'maxHp', name: 'Vitality', icon: '❤️', base: 0.1, fmt: (v) => `+${Math.round(v * 100)}% max HP`, apply: (m, v) => (m.maxHpPct += v) },
  { id: 'moveSpeed', name: 'Swiftness', icon: '👟', base: 0.06, fmt: (v) => `+${Math.round(v * 100)}% move speed`, apply: (m, v) => (m.moveSpeed += v) },
  { id: 'crit', name: 'Precision', icon: '🎯', base: 0.04, fmt: (v) => `+${Math.round(v * 100)}% crit chance`, apply: (m, v) => (m.crit += v) },
  { id: 'armor', name: 'Toughness', icon: '🛡️', base: 7, fmt: (v) => `+${Math.round(v)} armor`, apply: (m, v) => (m.armor += v) },
  { id: 'regen', name: 'Recovery', icon: '💚', base: 0.8, fmt: (v) => `+${v.toFixed(1)} HP/s regen`, apply: (m, v) => (m.regen += v) },
  { id: 'cdr', name: 'Focus', icon: '⏱️', base: 0.05, fmt: (v) => `-${Math.round(v * 100)}% cooldowns`, apply: (m, v) => (m.cdr *= 1 - v) },
  { id: 'area', name: 'Magnitude', icon: '💫', base: 0.08, fmt: (v) => `+${Math.round(v * 100)}% area size`, apply: (m, v) => (m.area += v) },
  { id: 'pickup', name: 'Attraction', icon: '🧲', base: 1.5, fmt: (v) => `+${v.toFixed(1)}m pickup range`, apply: (m, v) => (m.pickup += v) },
  { id: 'luck', name: 'Fortune', icon: '🍀', base: 0.15, fmt: (v) => `+${v.toFixed(2)} luck (better chest odds)`, apply: (m, v) => (m.luck += v) },
  { id: 'xp', name: 'Wisdom', icon: '📘', base: 0.08, fmt: (v) => `+${Math.round(v * 100)}% XP gain`, apply: (m, v) => (m.xp += v) },
  { id: 'coins', name: 'Greed', icon: '💰', base: 0.1, fmt: (v) => `+${Math.round(v * 100)}% coins`, apply: (m, v) => (m.coins += v) },
  { id: 'critMult', name: 'Brutality', icon: '🩸', base: 0.12, fmt: (v) => `+${Math.round(v * 100)}% crit damage`, apply: (m, v) => (m.critMult += v) },
];
