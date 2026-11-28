// Mythic items (red): only sold in the Red Market (the shop behind the red portal).
// Each has a strong upside and a real downside. All 20 are unlocked by achievements
// (see ACHIEVEMENTS in achievements.js: reward { item: '<id>' }).
//
// `up` / `down` are the two lines shown on the card; `statMods` use the same keys as
// every other item (applyModsObj): negative numbers are penalties, dmgTaken < 0 means
// you take MORE damage, difficulty > 0 makes the run harder.
const M = (id, name, icon, up, down, statMods, extra = {}) => ({
  id, name, rarity: 'mythic', icon, mythic: true, up, down,
  desc: `✚ ${up}  ✖ ${down}`,
  statMods,
  ...extra,
});

export const MYTHIC_ITEMS = [
  M('blood_pact', 'Blood Pact', '🩸', '+60% damage, +15% life steal', '-40% max HP', { damage: 0.6, lifesteal: 0.15, maxHpPct: -0.4 }),
  M('glass_crown', 'Glass Crown', '👑', '+25% crit chance, +100% crit damage', 'You take 40% more damage', { crit: 0.25, critMult: 1.0, dmgTaken: -0.4 }),
  M('chaos_engine', 'Chaos Engine', '⚙️', '+2 projectiles', '+25% difficulty', { projectiles: 2, difficulty: 0.25 }),
  M('leaden_heart', 'Leaden Heart', '🫀', '+250 max HP, +40 armor', '-25% movement speed, -1 jump', { maxHpFlat: 250, armor: 40, moveSpeed: -0.25, jumps: -1 }),
  M('hourglass_of_haste', 'Hourglass of Haste', '⏳', '+60% attack speed, -30% cooldowns', 'No health regeneration', { attackSpeed: 0.6, cdr: 0.3, regen: -99 }),
  M('idol_of_avarice', 'Idol of Avarice', '💰', '+100% gold, +50% XP', '+20% difficulty', { coins: 1.0, xp: 0.5, difficulty: 0.2 }),
  M('berserker_mask', 'Berserker Mask', '👹', '+45% damage, +30% attack speed', '-30% max HP, -20 armor', { damage: 0.45, attackSpeed: 0.3, maxHpPct: -0.3, armor: -20 }),
  M('phantom_veil', 'Phantom Veil', '👻', '+35% dodge, +20% movement speed', '-30% max HP', { dodge: 0.35, moveSpeed: 0.2, maxHpPct: -0.3 }),
  M('titan_grip', "Titan's Grip", '🦾', '+50% size, +40% damage', '-25% attack speed', { area: 0.5, damage: 0.4, attackSpeed: -0.25 }),
  M('cursed_clover', 'Cursed Clover', '☘️', '+2 luck (rarer rolls everywhere)', '-35% gold', { luck: 2, coins: -0.35 }),
  M('vampiric_crown', 'Vampiric Crown', '🧛', '+25% life steal, +4 HP on hit', 'No health regeneration, -15% max HP', { lifesteal: 0.25, lifeOnHit: 4, regen: -99, maxHpPct: -0.15 }),
  M('storm_core', 'Storm Core', '🌩️', '+40% attack speed, +20% movement speed', 'You take 25% more damage', { attackSpeed: 0.4, moveSpeed: 0.2, dmgTaken: -0.25 }),
  M('iron_maiden', 'Iron Maiden', '⚔️', '+80 armor, +40% shield', '-30% damage', { armor: 80, shield: 0.4, damage: -0.3 }),
  M('hunters_trophy', "Hunter's Trophy", '🦴', 'Execute non-boss enemies below 25% HP, +15% crit', '-25% max HP', { execute: 0.25, crit: 0.15, maxHpPct: -0.25 }),
  M('soul_pyre', 'Soul Pyre', '🔥', '+2 ability charges, -25% cooldowns', '-25% damage', { extraCharges: 2, cdr: 0.25, damage: -0.25 }),
  M('star_map', 'Star Map', '🗺️', '+3 jumps, +6 m pickup range, +30% movement speed', '-20% damage', { jumps: 3, pickup: 6, moveSpeed: 0.3, damage: -0.2 }),
  M('demon_horn', 'Demon Horn', '😈', '+2 projectiles, +30% crit chance', '+35% difficulty', { projectiles: 2, crit: 0.3, difficulty: 0.35 }),
  M('soul_battery', 'Soul Battery', '🔋', '-50% cooldowns, +1 ability charge', '-35% max HP', { cdr: 0.5, extraCharges: 1, maxHpPct: -0.35 }),
  M('golden_shackles', 'Golden Shackles', '⛓️', 'Chests cost 40% less, +50% gold', '-25% movement speed', { chestDiscount: 0.4, coins: 0.5, moveSpeed: -0.25 }),
  M('abyssal_core', 'Abyssal Core', '🕳️', '+100% damage', '-50% max HP, no health regeneration', { damage: 1.0, maxHpPct: -0.5, regen: -99 }),
];

/** Raven Fantasy icons for the mythics (red set). */
export const MYTHIC_ICONS = {
  blood_pact: 1209, glass_crown: 1213, chaos_engine: 1221, leaden_heart: 1188, hourglass_of_haste: 1197, idol_of_avarice: 1181,
  berserker_mask: 1219, phantom_veil: 1196, titan_grip: 1210, cursed_clover: 1183, vampiric_crown: 1231, storm_core: 1199,
  iron_maiden: 1222, hunters_trophy: 1232, soul_pyre: 1179, star_map: 1185, demon_horn: 1228, soul_battery: 1235,
  golden_shackles: 1239, abyssal_core: 1241,
};

/** Unlock achievements for the mythics: [achievement id, name, description, condition, item]. */
export const MYTHIC_UNLOCKS = [
  ['myth_blood_pact', 'Blood Money', "Take a Devil's Trademark.", { scope: 'life', stat: 'devilMarks', value: 1 }, 'blood_pact'],
  ['myth_glass_crown', 'Window Shopping', 'Enter the Red Market.', { scope: 'life', stat: 'shopVisits', value: 1 }, 'glass_crown'],
  ['myth_chaos_engine', 'Customer', 'Buy 3 items in the Red Market (all runs).', { scope: 'life', stat: 'shopBuys', value: 3 }, 'chaos_engine'],
  ['myth_leaden_heart', 'Pillar of Strength', 'Charge 10 pillars (all runs).', { scope: 'life', stat: 'pillarsCharged', value: 10 }, 'leaden_heart'],
  ['myth_hourglass', 'Regular', 'Enter the Red Market 3 times (all runs).', { scope: 'life', stat: 'shopVisits', value: 3 }, 'hourglass_of_haste'],
  ['myth_avarice', 'Big Spender II', 'Spend 20,000 coins on chests (all runs).', { scope: 'life', stat: 'coinsSpent', value: 20000 }, 'idol_of_avarice'],
  ['myth_berserker', 'Massacre', 'Defeat 15,000 enemies (all runs).', { scope: 'life', stat: 'kills', value: 15000 }, 'berserker_mask'],
  ['myth_phantom_veil', 'Deal Maker', "Take 5 Devil's Trademarks (all runs).", { scope: 'life', stat: 'devilMarks', value: 5 }, 'phantom_veil'],
  ['myth_titan_grip', 'Champion Crusher', 'Defeat 10 Champions (all runs).', { scope: 'life', stat: 'championKills', value: 10 }, 'titan_grip'],
  ['myth_cursed_clover', 'Midas Touch', 'Charge a golden pillar.', { scope: 'life', stat: 'goldenPillars', value: 1 }, 'cursed_clover'],
  ['myth_vampiric_crown', 'Kingslayer', 'Defeat 10 stage bosses (all runs).', { scope: 'life', stat: 'bossKills', value: 10 }, 'vampiric_crown'],
  ['myth_storm_core', 'Globetrotter', 'Clear 15 stages (all runs).', { scope: 'life', stat: 'stagesCleared', value: 15 }, 'storm_core'],
  ['myth_iron_maiden', 'Collector of Curses', 'Buy 3 Mythic items (all runs).', { scope: 'life', stat: 'mythicsBought', value: 3 }, 'iron_maiden'],
  ['myth_hunters_trophy', 'Elite Hunter', 'Defeat 300 elite enemies (all runs).', { scope: 'life', stat: 'eliteKills', value: 300 }, 'hunters_trophy'],
  ['myth_soul_pyre', 'Loyal Customer', 'Buy 15 items in the Red Market (all runs).', { scope: 'life', stat: 'shopBuys', value: 15 }, 'soul_pyre'],
  ['myth_star_map', 'Far Traveller', 'Reach stage 5 in a single run.', { scope: 'run', stat: 'stageReached', value: 5 }, 'star_map'],
  ['myth_demon_horn', 'Cursed Collection', 'Buy 8 Mythic items (all runs).', { scope: 'life', stat: 'mythicsBought', value: 8 }, 'demon_horn'],
  ['myth_soul_battery', 'Power Grid', 'Charge 40 pillars (all runs).', { scope: 'life', stat: 'pillarsCharged', value: 40 }, 'soul_battery'],
  ['myth_golden_shackles', 'Hoarder', 'Open 300 chests (all runs).', { scope: 'life', stat: 'chests', value: 300 }, 'golden_shackles'],
  ['myth_abyssal_core', 'Beyond the Apex', 'Defeat the Apex Sovereign.', { scope: 'life', stat: 'finalBossKills', value: 1 }, 'abyssal_core'],
];
