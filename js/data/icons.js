// Pixel-art icons from the Raven Fantasy icon pack (assets/textures/raven-fantasy/faN.png, 16x16).
// Every item, ability, upgrade, achievement and UI marker maps to an icon number here.
// applyIcons() swaps the emoji `icon` fields of the game data for <img> tags (the emoji
// stays available as `emoji`), so every screen that shows an icon picks them up.
import { ITEMS } from './items.js';
import { CHARACTERS } from './characters.js';
import { UPGRADES } from './upgrades.js';

export const ICON_DIR = 'assets/textures/raven-fantasy/';
/** n: Raven Fantasy icon number, or a path under assets/textures/ like 'weapons/e_0_3'. */
export const iconSrc = (n) => (typeof n === 'string' ? `assets/textures/${n}.png` : `${ICON_DIR}fa${n}.png`);
/** HTML for one icon. `cls` adds classes (e.g. 'big'). */
export const icon = (n, cls = '') => (n ? `<img class="pxi ${cls}" src="${iconSrc(n)}" alt="" draggable="false">` : '');

export const ITEM_ICONS = {
  // ---- common
  sharp_pebble: 174, energy_drink: 123, feather: 1645, glass_lens: 159, bandage: 1073, iron_plate: 135,
  hearty_snack: 1129, caffeine: 122, piggy_bank: 130, vampire_fang: 1064, study_notes: 103, magnet: 117,
  sand_timer: 1296, matchbox: 1008, bonk_bat: 'weapons/n_2_2', medkit: 1241, rusty_nail: 1444, running_shoes: 1376,
  warm_scarf: 1315, tin_helmet: 137, sugar_cube: 1046, lucky_chalk: 12, map_fragment: 108, copper_coin: 129,
  spring_coil: 1158, leather_gloves: 'weapons/n_2_8', herbal_tea: 1065, whetstone: 'weapons/n_0_0', focus_crystal: 170, bubble_wrap: 1082,
  old_compass: 132, wax_candle: 1039, pirate_patch: 1229, protein_bar: 146, ankle_weights: 153, stopwatch: 1164,
  bellows: 1289, four_leaf: 114, rollerblades: 1170, knit_mittens: 1648, cookie: 1261, thermos: 1,
  slingshot: 1499, ski_goggles: 1024, scholar_cap: 101, paper_kite: 105, static_glove: 1025, firecracker: 1238,
  frost_mint: 1009, tack_bag: 1154, leech_jar: 1066, coin_pouch: 158, adrenaline_shot: 1220, spiked_collar: 128,
  first_aid: 1307, war_paint: 1063, tortoise_shell: 'weapons/n_2_9', jump_rope: 1474, pocket_sand: 1075, venom_vial: 121,
  charcoal: 109, dowsing_rod: 1494, trophy_tooth: 1165, iron_skillet: 'weapons/n_3_2', alarm_clock: 1186, cushion: 1285,
  snack_bag: 1195,
  // ---- rare
  ukulele: 1029, frozen_tear: 172, missile_pack: 1171, berserk_mask: 1160, clockwork: 127, thorn_mail: 1071,
  scythe: 'weapons/n_2_6', volatile_core: 1152, wind_sigil: 1155, shield_gen: 1043, hunters_scope: 1173, greedy_gauntlet: 160,
  adrenal_gland: 1182, chain_vest: 134, falcon_feather: 1485, spyglass: 1295, flywheel: 1370, war_horn: 1128,
  sage_robe: 1084, heart_locket: 169, smoke_cloak: 1079, treasure_scroll: 106, wisdom_tome: 100, growth_serum: 1095,
  battle_standard: 1140, warm_heart: 1042, energy_cell: 1032, sprinter_band: 1236, evil_eye: 1369, hiking_boots: 1099,
  gamblers_dice: 13, thunder_bracer: 1027, grenade_belt: 1172, frost_brooch: 165, vampire_goblet: 142, hunter_trap: 1106,
  doom_mark: 1049, acid_flask: 1113, inferno_charm: 1004, executioner_axe: 'weapons/n_4_1', soul_jar: 1166, bounty_poster: 107,
  ghost_pepper: 1002, gravity_stone: 1351, regen_moss: 1115, berserk_brew: 138, sharpshooter_hat: 1134, brawler_tape: 1139,
  giant_slayer_ring: 1146, mirror_shield: 'weapons/n_4_9', storm_cloud: 1031, wisp_jar: 1041, barrier_charm: 1153, second_wind: 1159,
  cleaver: 'weapons/n_0_1', spark_plug: 1026, shockwave_boots: 1137, heavy_rounds: 124, mana_crystal: 161, frostbite_edge: 'weapons/n_1_0',
  blood_hound: 1156, treasure_sense: 151, guardian_angel: 1091, meteor_shard: 1001, echo_bell: 1131, orbit_blades: 'weapons/n_1_3',
  rabbit_foot: 1288,
  // ---- epic
  ritual_dagger: 'weapons/e_4_3', behemoth: 1174, clock_of_ages: 1230, titan_heart: 163, static_coil: 1028, infusion: 1093,
  magma_heart: 1007, drone_swarm: 1132, monk_beads: 1078, titan_plating: 133, colossus_fist: 'weapons/e_3_8', arcane_battery: 1719,
  chrono_watch: 1277, dragon_scale: 1068, storm_crown: 1030, plague_mask: 1086, frost_core: 1014, void_shard: 166,
  golden_goose: 131, warlord_banner: 1206, clone_mask: 1077, blood_moon: 1057, thunder_hammer: 'weapons/e_1_2', phase_boots: 1302,
  mountain_heart: 17, hydra_fang: 1067, atom_core: 1130, grave_tome: 1108, aegis: 'weapons/e_0_9', sunfire_cape: 1047,
  blood_quill: 1062, swarm_hive: 1069, parachute: 1503, blade_dancer: 'weapons/e_1_0', golden_trophy: 15, overclock_chip: 1081,
  brimstone: 1000, spectral_links: 1162, last_stand: 1097, momentum_engine: 1092, crystal_heart: 1089, rift_edge: 'weapons/e_4_0',
  harvest_moon: 1035, star_chart: 1263, war_drum: 1190,
  // ---- legendary
  phoenix_feather: 1003, chrono_crown: 1040, godslayer: 'weapons/e_0_0', singularity: 1053, golden_idol: 140, celestial_wings: 1565,
  omega_laser: 1149, soul_lantern: 1725, reapers_edge: 'weapons/e_4_6', infinity_loop: 1211, world_eater: 1052, dragon_heart: 1227,
  divine_wrath: 1045, time_crystal: 173, ragnarok_horn: 1194, gods_eye: 1163, hand_of_midas: 1568, eternal_flame: 1696,
  tidal_core: 1738, necronomicon: 104, thunder_anvil: 125, fate_dice: 14, celestial_armor: 136, ouroboros: 1161,
  void_heart: 1050, starfall: 1033, giant_growth: 1110, prism: 168, hourglass_ages: 1145, war_avatar: 'weapons/e_3_0',
};

/** [passive, primary, ability 1, ability 2, ultimate] */
export const SKILL_ICONS = {
  vanguard: [1173, 1171, 1010, 1092, 1011],
  bonker: [1160, 'weapons/n_2_2', 1137, 1124, 'weapons/e_3_2'],
  pyra: [1080, 1001, 1000, 1151, 1033],
  glacia: [1083, 1011, 1021, 1089, 1015],
  kestrel: [1100, 'weapons/n_2_4', 1134, 1170, 1012],
  tinker: [127, 1152, 1149, 1032, 1039],
  kaze: [1155, 'weapons/n_0_8', 1161, 1144, 'weapons/e_0_8'],
  morrow: [1166, 1147, 1165, 1060, 1108],
  bulwark: [1164, 1237, 1172, 1153, 1358],
  nyx: [1049, 'weapons/n_4_3', 1055, 1053, 1054],
  sol: [1047, 'weapons/n_0_2', 'weapons/n_0_9', 1045, 1040],
  rook: [1229, 'weapons/n_3_4', 1238, 1162, 1233],
  vex: [1095, 121, 1086, 1113, 1066],
  echo: [1077, 1018, 1082, 1164, 1145],
  grizzle: [1156, 'weapons/n_3_5', 1222, 1226, 1190],
  spark: [1081, 1025, 1028, 1026, 1031],
  mimic: [131, 130, 13, 114, 160],
};

export const UPGRADE_ICONS = {
  damage: 1098, attackSpeed: 1100, maxHp: 1042, moveSpeed: 1092, crit: 1173, armor: 1099, regen: 1073,
  cdr: 1164, area: 1047, pickup: 117, luck: 114, xp: 101, coins: 131, critMult: 1064,
};

export const UI_ICONS = {
  trophy: 15, coin: 131, devil: 1226, portal: 1145, inventory: 158, logbook: 100, settings: 127, help: 13,
  save: 10, continueRun: 11, crown: 15, moai: 17, info: 1131, star: 12, chest: 1270, largeChest: 1138,
  epicChest: 1204, legendaryChest: 1344, newRun: 1123, retry: 1164, victoryContinue: 1145, endRun: 1108,
};

// minimap markers (also used in the big map legend)
export const MAP_ICONS = {
  chest_normal: 1270, chest_large: 1138, chest_epic: 1204, chest_legendary: 1344, heal: 1073, combat: 1005,
  boss: 1049, xp: 101, moai: 17, portal: 1145, pad: 1039, cave: 16, magnet: 117,
};

const STAGE_ICONS = { meadows: 1110, dunes: 17, peaks: 1014, hollow: 1069, caldera: 1000, void: 1050, throne: 1040 };
const STAT_ICONS = {
  charLevel: 12, kills: 1165, bossKills: 1160, finalBossKills: 15, stageReached: 107, stagesCleared: 1151, chests: 1138,
  itemsHeld: 14, runTime: 1164, coinsSpent: 131, level: 1131, eliteKills: 1124, maxHit: 1152, charactersUnlocked: 1077,
  crits: 1173, burnKills: 1080, freezes: 1083, largeChests: 1204, runs: 1170, ultsUsed: 1172, damageDealt: 1136,
  items_common: 168, items_rare: 161, items_epic: 166, items_legendary: 164, executes: 1682, poisonKills: 1066,
  abilitiesUsed: 1132, levelUps: 1263, deaths: 1108, coinsRun: 158, shrinesUsed: 1039, championKills: 1190, jumps: 1077,
  runsWon: 140, loopsCompleted: 1145, legendaryHeld: 1740, stagesCleared_run: 1217, deployKills: 127, raised: 1166,
  overtimes: 1186,
};

/** Icon number for an achievement, from what it tracks. */
export function achievementIconId(a) {
  const s = a.cond.stat;
  if (s === 'kills' && a.cond.scope === 'run') return 1061;
  if (s === 'stagesCleared' && a.cond.scope === 'run') return STAT_ICONS.stagesCleared_run;
  if (STAT_ICONS[s]) return STAT_ICONS[s];
  if (s.startsWith('clear_')) return STAGE_ICONS[s.slice(6)] || 1151;
  if (s.startsWith('boss_')) return s === 'boss_apex_sovereign' ? 1226 : 1160;
  if (s.startsWith('kill_')) return 1061;
  return 12;
}
export const achievementIcon = (a, cls = '') => icon(achievementIconId(a), cls);
export const characterIcon = (id, cls = '') => icon(SKILL_ICONS[id]?.[1], cls);

let applied = false;
/** Replace emoji icons in the game data with pixel-art <img> tags. */
export function applyIcons() {
  if (applied) return;
  applied = true;
  for (const it of Object.values(ITEMS)) {
    it.emoji = it.icon;
    if (ITEM_ICONS[it.id]) it.icon = icon(ITEM_ICONS[it.id]);
  }
  for (const c of Object.values(CHARACTERS)) {
    const ids = SKILL_ICONS[c.id];
    if (!ids) continue;
    [c.passive, c.primary, ...c.abilities].forEach((s, i) => {
      s.emoji = s.icon;
      s.icon = icon(ids[i]);
    });
  }
  for (const u of UPGRADES) {
    u.emoji = u.icon;
    if (UPGRADE_ICONS[u.id]) u.icon = icon(UPGRADE_ICONS[u.id]);
  }
}

/** Warm the browser cache so icons never pop in mid-animation (roulette, popups). */
export function preloadIcons() {
  const all = new Set([
    ...Object.values(ITEM_ICONS), ...Object.values(SKILL_ICONS).flat(), ...Object.values(UPGRADE_ICONS),
    ...Object.values(UI_ICONS), ...Object.values(MAP_ICONS), ...Object.values(STAT_ICONS), ...Object.values(STAGE_ICONS), 1061, 1226, 1263,
    // weapons + tomes
    1504, 1179, 1656, 1712, 1011, 1701, 1016, 121, 1149, 1004, 1052, 1171, 1098, 1173, 1078, 1099, 160, 1134, 1100, 1144, 114, 101, 1064, 1043, 1047, 117, 1042, 1170,
  ]);
  return Promise.all([...all].map((n) => new Promise((res) => {
    const img = new Image();
    img.onload = img.onerror = res;
    img.src = iconSrc(n);
  })));
}

/** Loaded Image objects for drawing map markers on a canvas. */
const imgCache = new Map();
export function iconImage(n) {
  if (!imgCache.has(n)) {
    const img = new Image();
    img.src = iconSrc(n);
    imgCache.set(n, img);
  }
  return imgCache.get(n);
}
