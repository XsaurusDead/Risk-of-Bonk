// Enemy roster. Stats are base values at difficulty 1.0 and get multiplied by
// the director's exponential difficulty curve.
//
// Model parts: [shape, color, [x,y,z], [sx,sy,sz], [rx,ry,rz]?, emissive?]
// shapes: box | sphere | cyl | cone | ico | tetra | torus | oct
// Models face +Z, feet at y = 0.

const eyes = (y, z, spread = 0.18, s = 0.14, col = 0x111111) => [
  ['sphere', 0xffffff, [-spread, y, z], [s * 1.5, s * 1.5, s]],
  ['sphere', 0xffffff, [spread, y, z], [s * 1.5, s * 1.5, s]],
  ['sphere', col, [-spread, y, z + s * 0.45], [s * 0.8, s * 0.8, s * 0.4]],
  ['sphere', col, [spread, y, z + s * 0.45], [s * 0.8, s * 0.8, s * 0.4]],
];
const glowEyes = (y, z, spread, s, col) => [
  ['sphere', col, [-spread, y, z], [s, s, s * 0.6], null, true],
  ['sphere', col, [spread, y, z], [s, s, s * 0.6], null, true],
];

export const ENEMIES = {
  // ================= Verdant Meadows =================
  slime: {
    name: 'Bouncy Slime', hp: 55, dmg: 9, speed: 5, radius: 0.9, height: 1.2, ai: 'hopper', attackRange: 1.8, xp: 3, coins: 2, cost: 5,
    model: [['sphere', 0x5fd35f, [0, 0.55, 0], [1.6, 1.1, 1.6]], ['sphere', 0x8ff08f, [0.3, 0.85, 0.3], [0.4, 0.25, 0.4]], ...eyes(0.7, 0.72, 0.25, 0.16)],
  },
  goblin_archer: {
    name: 'Goblin Archer', hp: 45, dmg: 8, speed: 5.5, radius: 0.6, height: 1.6, ai: 'ranged', range: 24, projSpeed: 26, projColor: 0xc8a060, xp: 4, coins: 3, cost: 7,
    model: [
      ['box', 0x5a7d2a, [0, 0.75, 0], [0.7, 0.8, 0.45]], ['sphere', 0x7fb33a, [0, 1.35, 0], [0.6, 0.55, 0.55]],
      ['cone', 0x7fb33a, [-0.38, 1.45, 0], [0.15, 0.45, 0.15], [0, 0, 1.3]], ['cone', 0x7fb33a, [0.38, 1.45, 0], [0.15, 0.45, 0.15], [0, 0, -1.3]],
      ['box', 0x3b2a1a, [-0.18, 0.2, 0], [0.2, 0.4, 0.2]], ['box', 0x3b2a1a, [0.18, 0.2, 0], [0.2, 0.4, 0.2]],
      ['torus', 0x8a5a2b, [0.45, 0.9, 0.2], [0.5, 0.7, 0.3], [0, 1.57, 0]], ...glowEyes(1.4, 0.26, 0.12, 0.09, 0xffee55),
    ],
  },
  wisp: {
    name: 'Lesser Wisp', hp: 35, dmg: 7, speed: 6, radius: 0.6, height: 1.0, ai: 'flyer', range: 22, projSpeed: 20, projColor: 0xffcc33, hover: 5, xp: 4, coins: 3, cost: 7,
    model: [['ico', 0xfff1a8, [0, 0.5, 0], [0.8, 0.8, 0.8], null, true], ['cone', 0xffaa22, [0, 1.1, 0], [0.6, 0.9, 0.6], null, true], ['box', 0x333333, [0, 0.5, 0.38], [0.5, 0.12, 0.1]]],
  },
  stone_golem: {
    name: 'Stone Golem', hp: 260, dmg: 22, speed: 3.4, radius: 1.4, height: 3.2, ai: 'tank', attackRange: 3.5, slamRadius: 4.5, xp: 14, coins: 10, cost: 24,
    model: [
      ['box', 0x8b8f96, [0, 1.6, 0], [1.9, 1.6, 1.3]], ['box', 0x7a7e85, [0, 2.75, 0.1], [1.1, 0.8, 1.0]],
      ['box', 0x6e7279, [-1.25, 1.5, 0], [0.6, 1.8, 0.6]], ['box', 0x6e7279, [1.25, 1.5, 0], [0.6, 1.8, 0.6]],
      ['box', 0x6e7279, [-0.5, 0.4, 0], [0.6, 0.8, 0.6]], ['box', 0x6e7279, [0.5, 0.4, 0], [0.6, 0.8, 0.6]],
      ['box', 0x7cff9a, [0, 1.7, 0.66], [0.5, 0.5, 0.05], null, true], ...glowEyes(2.8, 0.6, 0.25, 0.14, 0x7cff9a),
    ],
  },

  // ================= Scorched Dunes =================
  scarab: {
    name: 'Scarab', hp: 40, dmg: 8, speed: 8.5, radius: 0.7, height: 0.8, ai: 'melee', attackRange: 1.6, xp: 3, coins: 2, cost: 5,
    model: [
      ['sphere', 0x2a3b8f, [0, 0.45, -0.1], [1.0, 0.6, 1.3]], ['sphere', 0x1c2766, [0, 0.4, 0.55], [0.55, 0.45, 0.45]],
      ['box', 0x0d0d1a, [0, 0.3, 0], [1.4, 0.06, 0.1]], ['box', 0x0d0d1a, [0, 0.3, 0.3], [1.4, 0.06, 0.1]], ['box', 0x0d0d1a, [0, 0.3, -0.3], [1.4, 0.06, 0.1]],
      ['cone', 0xd4af37, [0, 0.6, 0.85], [0.12, 0.4, 0.12], [1.3, 0, 0]], ...glowEyes(0.5, 0.75, 0.15, 0.08, 0xff4444),
    ],
  },
  dune_ram: {
    name: 'Dune Ram', hp: 140, dmg: 18, speed: 5, radius: 1.1, height: 1.8, ai: 'charger', chargeSpeed: 28, chargeRange: 18, xp: 9, coins: 6, cost: 15,
    model: [
      ['box', 0xc9a26b, [0, 1.0, 0], [1.1, 0.9, 1.8]], ['box', 0xa8834f, [0, 1.35, 1.0], [0.7, 0.6, 0.6]],
      ['torus', 0x5a4632, [-0.4, 1.6, 1.0], [0.35, 0.35, 0.35], [0, 1.57, 0]], ['torus', 0x5a4632, [0.4, 1.6, 1.0], [0.35, 0.35, 0.35], [0, 1.57, 0]],
      ['box', 0x7a5c3a, [-0.35, 0.3, 0.6], [0.25, 0.6, 0.25]], ['box', 0x7a5c3a, [0.35, 0.3, 0.6], [0.25, 0.6, 0.25]],
      ['box', 0x7a5c3a, [-0.35, 0.3, -0.6], [0.25, 0.6, 0.25]], ['box', 0x7a5c3a, [0.35, 0.3, -0.6], [0.25, 0.6, 0.25]],
      ...eyes(1.45, 1.31, 0.2, 0.1),
    ],
  },
  cactus_spitter: {
    name: 'Cactus Spitter', hp: 90, dmg: 10, speed: 1.6, radius: 0.8, height: 2.4, ai: 'turret', range: 30, projSpeed: 24, projColor: 0x88ff44, burst: 3, xp: 6, coins: 5, cost: 10,
    model: [
      ['cyl', 0x3f8f3a, [0, 1.1, 0], [0.9, 2.2, 0.9]], ['sphere', 0x3f8f3a, [0, 2.2, 0], [0.9, 0.6, 0.9]],
      ['cyl', 0x3f8f3a, [-0.7, 1.4, 0], [0.4, 0.9, 0.4]], ['cyl', 0x3f8f3a, [0.7, 1.6, 0], [0.4, 0.9, 0.4]],
      ['sphere', 0xff5599, [0, 2.6, 0], [0.4, 0.3, 0.4]], ['cyl', 0x1a1a1a, [0, 1.7, 0.42], [0.3, 0.2, 0.3], [1.57, 0, 0]], ...eyes(2.05, 0.45, 0.2, 0.1),
    ],
  },
  sand_wurm: {
    name: 'Sand Wurm', hp: 110, dmg: 15, speed: 4, radius: 0.9, height: 2.0, ai: 'blinker', attackRange: 2.4, blinkCd: 4.5, xp: 8, coins: 6, cost: 13,
    model: [
      ['cyl', 0xb08a55, [0, 0.5, -0.2], [1.0, 1.0, 1.0]], ['cyl', 0xc59d64, [0, 1.25, 0], [0.9, 0.7, 0.9]], ['cyl', 0xd6ae74, [0, 1.85, 0.15], [0.8, 0.6, 0.8]],
      ['cone', 0xeeeeee, [0, 2.1, 0.55], [0.5, 0.4, 0.5], [1.57, 0, 0]], ...glowEyes(2.1, 0.45, 0.22, 0.1, 0xff7733),
    ],
  },

  // ================= Frostfang Peaks =================
  snow_slime: {
    name: 'Snowball Slime', hp: 70, dmg: 11, speed: 5, radius: 1.0, height: 1.3, ai: 'hopper', attackRange: 2, xp: 4, coins: 3, cost: 6,
    model: [['sphere', 0xeaf6ff, [0, 0.6, 0], [1.8, 1.2, 1.8]], ['cone', 0xff8c3a, [0, 0.75, 0.9], [0.15, 0.4, 0.15], [1.57, 0, 0]], ...eyes(0.95, 0.75, 0.25, 0.12)],
  },
  ice_imp: {
    name: 'Ice Imp', hp: 60, dmg: 12, speed: 6.5, radius: 0.6, height: 1.6, ai: 'blinker', attackRange: 1.8, blinkCd: 3.5, xp: 5, coins: 4, cost: 9,
    model: [
      ['oct', 0x7fd8ff, [0, 0.9, 0], [0.8, 1.2, 0.6]], ['sphere', 0x5ab8e6, [0, 1.6, 0], [0.55, 0.5, 0.5]],
      ['cone', 0xd8f4ff, [-0.2, 1.95, 0], [0.12, 0.4, 0.12], [0, 0, 0.3]], ['cone', 0xd8f4ff, [0.2, 1.95, 0], [0.12, 0.4, 0.12], [0, 0, -0.3]],
      ...glowEyes(1.62, 0.24, 0.12, 0.08, 0xffffff),
    ],
  },
  yeti: {
    name: 'Yeti', hp: 300, dmg: 24, speed: 4.2, radius: 1.4, height: 3.0, ai: 'charger', chargeSpeed: 24, chargeRange: 16, xp: 15, coins: 11, cost: 26,
    model: [
      ['sphere', 0xf2f2f2, [0, 1.6, 0], [2.0, 2.0, 1.6]], ['sphere', 0xe6e6e6, [0, 2.8, 0.15], [1.1, 1.0, 1.0]], ['box', 0x8fa3b8, [0, 2.7, 0.62], [0.6, 0.45, 0.1]],
      ['cyl', 0xe6e6e6, [-1.1, 1.5, 0.2], [0.55, 1.6, 0.55]], ['cyl', 0xe6e6e6, [1.1, 1.5, 0.2], [0.55, 1.6, 0.55]],
      ['cyl', 0xdddddd, [-0.5, 0.35, 0], [0.6, 0.7, 0.6]], ['cyl', 0xdddddd, [0.5, 0.35, 0], [0.6, 0.7, 0.6]], ...eyes(2.85, 0.6, 0.2, 0.1),
    ],
  },
  frost_wisp: {
    name: 'Frost Wisp', hp: 45, dmg: 9, speed: 6, radius: 0.6, height: 1, ai: 'flyer', range: 24, projSpeed: 22, projColor: 0x99eeff, hover: 6, xp: 5, coins: 4, cost: 8, slowOnHit: true,
    model: [['oct', 0xbff3ff, [0, 0.5, 0], [0.9, 1.2, 0.9], null, true], ['torus', 0x7fd8ff, [0, 0.5, 0], [0.8, 0.8, 0.8], [1.57, 0, 0], true]],
  },

  // ================= Fungal Hollow =================
  sporeling: {
    name: 'Sporeling', hp: 45, dmg: 26, speed: 7.5, radius: 0.7, height: 1.3, ai: 'exploder', blastRadius: 4.2, xp: 4, coins: 3, cost: 6,
    model: [
      ['cyl', 0xf0e6d0, [0, 0.4, 0], [0.5, 0.8, 0.5]], ['sphere', 0xd84a8a, [0, 0.95, 0], [1.2, 0.7, 1.2]],
      ['sphere', 0xffffff, [0.3, 1.15, 0.2], [0.2, 0.15, 0.2]], ['sphere', 0xffffff, [-0.25, 1.1, -0.25], [0.2, 0.15, 0.2]], ...eyes(0.55, 0.25, 0.1, 0.07),
    ],
  },
  shroom_shaman: {
    name: 'Shroom Shaman', hp: 80, dmg: 11, speed: 4, radius: 0.8, height: 2.2, ai: 'ranged', range: 26, projSpeed: 18, projColor: 0xb46cff, xp: 6, coins: 5, cost: 10, projCount: 3,
    model: [
      ['cone', 0x4a2f6e, [0, 0.8, 0], [1.1, 1.6, 1.1]], ['sphere', 0x2fc6b5, [0, 1.9, 0], [1.5, 0.7, 1.5], null, true],
      ['cyl', 0x6b4a2b, [0.6, 1.1, 0.2], [0.1, 2.0, 0.1]], ['ico', 0xb46cff, [0.6, 2.15, 0.2], [0.35, 0.35, 0.35], null, true], ...glowEyes(1.5, 0.35, 0.13, 0.09, 0x2fffe0),
    ],
  },
  cave_bat: {
    name: 'Cave Bat', hp: 40, dmg: 10, speed: 9, radius: 0.6, height: 0.8, ai: 'swooper', hover: 6, xp: 4, coins: 3, cost: 6,
    model: [
      ['sphere', 0x3a2d4a, [0, 0.4, 0], [0.6, 0.6, 0.7]], ['tetra', 0x2a1f38, [-0.7, 0.45, 0], [1.0, 0.1, 0.6]], ['tetra', 0x2a1f38, [0.7, 0.45, 0], [1.0, 0.1, 0.6]],
      ['cone', 0x3a2d4a, [-0.18, 0.78, 0], [0.12, 0.3, 0.12]], ['cone', 0x3a2d4a, [0.18, 0.78, 0], [0.12, 0.3, 0.12]], ...glowEyes(0.48, 0.3, 0.1, 0.07, 0xff3355),
    ],
  },
  glow_beetle: {
    name: 'Glow Beetle', hp: 120, dmg: 14, speed: 5.2, radius: 1.0, height: 1.3, ai: 'melee', attackRange: 2.2, xp: 7, coins: 5, cost: 11,
    model: [
      ['sphere', 0x1a4a3a, [0, 0.7, -0.15], [1.4, 0.9, 1.8]], ['sphere', 0x46ffc0, [0, 0.75, -0.7], [0.7, 0.5, 0.6], null, true], ['sphere', 0x12302a, [0, 0.6, 0.85], [0.8, 0.6, 0.6]],
      ['cone', 0x0c1f1a, [-0.25, 0.6, 1.25], [0.12, 0.5, 0.12], [1.57, 0, 0.3]], ['cone', 0x0c1f1a, [0.25, 0.6, 1.25], [0.12, 0.5, 0.12], [1.57, 0, -0.3]],
      ...glowEyes(0.75, 1.1, 0.2, 0.08, 0x46ffc0),
    ],
  },

  // ================= Molten Caldera =================
  magma_hound: {
    name: 'Magma Hound', hp: 70, dmg: 13, speed: 9.5, radius: 0.9, height: 1.3, ai: 'melee', attackRange: 2, xp: 5, coins: 4, cost: 8, burnOnHit: true,
    model: [
      ['box', 0x2a1a17, [0, 0.85, 0], [0.8, 0.7, 1.6]], ['box', 0x3a2520, [0, 1.1, 0.95], [0.6, 0.55, 0.6]], ['box', 0xff5a1f, [0, 1.2, 0], [0.3, 0.2, 1.5], null, true],
      ['box', 0x1a100e, [-0.3, 0.3, 0.55], [0.2, 0.6, 0.2]], ['box', 0x1a100e, [0.3, 0.3, 0.55], [0.2, 0.6, 0.2]],
      ['box', 0x1a100e, [-0.3, 0.3, -0.55], [0.2, 0.6, 0.2]], ['box', 0x1a100e, [0.3, 0.3, -0.55], [0.2, 0.6, 0.2]],
      ['cone', 0xff8c3a, [0, 1.0, -1.0], [0.2, 0.6, 0.2], [-1.2, 0, 0], true], ...glowEyes(1.2, 1.26, 0.17, 0.08, 0xffdd33),
    ],
  },
  fire_imp: {
    name: 'Fire Imp', hp: 60, dmg: 12, speed: 6, radius: 0.6, height: 1.6, ai: 'ranged', range: 24, projSpeed: 28, projColor: 0xff6622, xp: 5, coins: 4, cost: 9, burnOnHit: true,
    model: [
      ['oct', 0xc4301b, [0, 0.9, 0], [0.8, 1.2, 0.6]], ['sphere', 0xa82513, [0, 1.6, 0], [0.55, 0.5, 0.5]],
      ['cone', 0x2a1a17, [-0.22, 1.95, 0], [0.12, 0.45, 0.12], [0, 0, 0.4]], ['cone', 0x2a1a17, [0.22, 1.95, 0], [0.12, 0.45, 0.12], [0, 0, -0.4]],
      ['ico', 0xffaa33, [0.45, 1.1, 0.3], [0.3, 0.3, 0.3], null, true], ...glowEyes(1.62, 0.24, 0.12, 0.08, 0xffee55),
    ],
  },
  obsidian_brute: {
    name: 'Obsidian Brute', hp: 360, dmg: 28, speed: 3.6, radius: 1.5, height: 3.2, ai: 'tank', attackRange: 3.6, slamRadius: 5, xp: 16, coins: 12, cost: 28,
    model: [
      ['ico', 0x1d1a24, [0, 1.8, 0], [2.2, 2.2, 1.8]], ['ico', 0x26222f, [0, 3.0, 0.2], [1.0, 0.9, 0.9]],
      ['oct', 0x1d1a24, [-1.3, 1.6, 0.2], [0.8, 1.8, 0.8]], ['oct', 0x1d1a24, [1.3, 1.6, 0.2], [0.8, 1.8, 0.8]],
      ['box', 0xff4d1a, [0, 1.8, 0.85], [0.3, 1.2, 0.05], null, true], ['box', 0xff4d1a, [0, 1.8, 0.85], [1.0, 0.2, 0.05], null, true], ...glowEyes(3.05, 0.6, 0.22, 0.12, 0xff4d1a),
    ],
  },
  ember_wisp: {
    name: 'Ember Wisp', hp: 50, dmg: 10, speed: 6.5, radius: 0.6, height: 1, ai: 'flyer', range: 22, projSpeed: 24, projColor: 0xff5522, hover: 5, xp: 5, coins: 4, cost: 8, burnOnHit: true,
    model: [['ico', 0xff7a33, [0, 0.5, 0], [0.8, 0.8, 0.8], null, true], ['cone', 0xff3311, [0, 1.15, 0], [0.7, 1.0, 0.7], null, true], ['box', 0x1a0a05, [0, 0.5, 0.38], [0.5, 0.12, 0.1]]],
  },

  // ================= Void Sanctum =================
  void_reaver: {
    name: 'Void Reaver', hp: 150, dmg: 18, speed: 6, radius: 1.0, height: 2.4, ai: 'melee', attackRange: 2.8, xp: 9, coins: 7, cost: 14,
    model: [
      ['cone', 0x1c1030, [0, 1.2, 0], [1.2, 2.4, 1.2], [3.14, 0, 0]], ['sphere', 0x2c1a4a, [0, 2.3, 0], [0.8, 0.7, 0.8]],
      ['cone', 0xb455ff, [-0.8, 1.6, 0.4], [0.15, 1.4, 0.15], [1.2, 0, 0.3], true], ['cone', 0xb455ff, [0.8, 1.6, 0.4], [0.15, 1.4, 0.15], [1.2, 0, -0.3], true],
      ['sphere', 0xe08cff, [0, 2.35, 0.36], [0.35, 0.35, 0.15], null, true],
    ],
  },
  eye_stalker: {
    name: 'Eye Stalker', hp: 70, dmg: 12, speed: 5.5, radius: 0.9, height: 1.4, ai: 'flyer', range: 28, projSpeed: 30, projColor: 0xd266ff, hover: 7, xp: 7, coins: 5, cost: 11,
    model: [
      ['sphere', 0xf2e8ff, [0, 0.7, 0], [1.4, 1.4, 1.4]], ['sphere', 0x8a2be2, [0, 0.7, 0.55], [0.7, 0.7, 0.4], null, true], ['sphere', 0x000000, [0, 0.7, 0.72], [0.3, 0.3, 0.15]],
      ['cone', 0x3a1a5a, [0, 0.1, 0], [0.3, 0.8, 0.3], [3.14, 0, 0]], ['torus', 0x3a1a5a, [0, 0.7, 0], [1.1, 1.1, 1.1], [0, 0, 0]],
    ],
  },
  null_shade: {
    name: 'Null Shade', hp: 85, dmg: 15, speed: 5.5, radius: 0.7, height: 2.0, ai: 'blinker', attackRange: 2.2, blinkCd: 3, xp: 7, coins: 5, cost: 11,
    model: [['cone', 0x0a0614, [0, 1.0, 0], [1.0, 2.0, 1.0], [3.14, 0, 0]], ['sphere', 0x0a0614, [0, 1.9, 0], [0.6, 0.6, 0.6]], ...glowEyes(1.95, 0.27, 0.12, 0.1, 0xff33cc)],
  },
  void_bomber: {
    name: 'Void Bomber', hp: 60, dmg: 34, speed: 7, radius: 0.8, height: 1.2, ai: 'exploder', blastRadius: 5, xp: 6, coins: 4, cost: 9,
    model: [['ico', 0x5a1a8a, [0, 0.7, 0], [1.3, 1.3, 1.3], null, true], ['oct', 0x1a0a2a, [0, 0.7, 0], [1.6, 0.4, 1.6]], ...glowEyes(0.8, 0.62, 0.18, 0.1, 0xffffff)],
  },

  // ================= Minions summoned by bosses (not in stage pools) =================
};

// ================= BOSSES =================
// patterns: slam | burst | volley | summon | charge | rain | spin
export const BOSSES = {
  stone_colossus: {
    name: 'Stone Colossus', title: 'Warden of the Meadow', hp: 2600, dmg: 26, speed: 4.2, radius: 2.6, height: 6.5, ai: 'boss', xp: 120, coins: 120,
    patterns: ['slam', 'volley', 'charge', 'rain'], projColor: 0x7cff9a, summon: 'stone_golem',
    model: [
      ['box', 0x8b8f96, [0, 3.4, 0], [3.6, 3.0, 2.4]], ['box', 0x7a7e85, [0, 5.6, 0.2], [2.0, 1.5, 1.8]],
      ['box', 0x6e7279, [-2.4, 3.2, 0], [1.2, 3.6, 1.2]], ['box', 0x6e7279, [2.4, 3.2, 0], [1.2, 3.6, 1.2]],
      ['box', 0x5f6369, [-1.0, 0.9, 0], [1.2, 1.8, 1.2]], ['box', 0x5f6369, [1.0, 0.9, 0], [1.2, 1.8, 1.2]],
      ['ico', 0x7cff9a, [0, 3.6, 1.2], [1.0, 1.0, 0.6], null, true], ['cone', 0x4f8f3a, [0, 6.6, 0], [1.2, 0.8, 1.2]], ...glowEyes(5.7, 1.1, 0.45, 0.25, 0x7cff9a),
    ],
  },
  scorpion_king: {
    name: 'Scorpion King', title: 'Tyrant of the Dunes', hp: 2900, dmg: 28, speed: 6, radius: 3, height: 4, ai: 'boss', xp: 140, coins: 140,
    patterns: ['charge', 'volley', 'burst', 'summon'], projColor: 0x99ff33, summon: 'scarab',
    model: [
      ['sphere', 0x8a4b1c, [0, 1.6, 0], [3.0, 1.6, 4.4]], ['sphere', 0x6e3a14, [0, 1.8, 2.4], [2.0, 1.3, 1.6]],
      ['sphere', 0x8a4b1c, [0, 2.4, -2.6], [1.3, 1.2, 1.3]], ['sphere', 0x8a4b1c, [0, 3.6, -3.1], [1.1, 1.1, 1.1]], ['sphere', 0x8a4b1c, [0, 4.8, -2.6], [1.0, 1.0, 1.0]],
      ['cone', 0x99ff33, [0, 5.3, -1.6], [0.5, 1.4, 0.5], [2.2, 0, 0], true],
      ['box', 0x6e3a14, [-2.2, 1.6, 3.3], [0.8, 0.8, 2.2], [0, 0.4, 0]], ['box', 0x6e3a14, [2.2, 1.6, 3.3], [0.8, 0.8, 2.2], [0, -0.4, 0]],
      ['cone', 0x4a2a10, [-2.0, 1.6, 4.8], [0.6, 1.2, 0.6], [1.57, 0, 0]], ['cone', 0x4a2a10, [2.0, 1.6, 4.8], [0.6, 1.2, 0.6], [1.57, 0, 0]],
      ['cone', 0xd4af37, [0, 3.2, 2.4], [1.4, 1.0, 1.0], null], ...glowEyes(2.2, 3.15, 0.4, 0.18, 0xff2222),
    ],
  },
  frost_titan: {
    name: 'Frost Titan', title: 'Heart of the Glacier', hp: 3300, dmg: 30, speed: 4, radius: 2.8, height: 7, ai: 'boss', xp: 160, coins: 160,
    patterns: ['slam', 'burst', 'rain', 'summon'], projColor: 0x99eeff, summon: 'ice_imp', freezes: true,
    model: [
      ['oct', 0xbfeaff, [0, 3.6, 0], [3.6, 4.0, 2.6]], ['ico', 0xdff6ff, [0, 6.2, 0], [1.8, 1.8, 1.8]],
      ['oct', 0x8fd3ff, [-2.6, 3.6, 0], [1.2, 3.8, 1.2]], ['oct', 0x8fd3ff, [2.6, 3.6, 0], [1.2, 3.8, 1.2]],
      ['cone', 0xffffff, [-0.8, 7.4, 0], [0.4, 1.4, 0.4], null, true], ['cone', 0xffffff, [0.8, 7.4, 0], [0.4, 1.4, 0.4], null, true], ['cone', 0xffffff, [0, 7.7, 0], [0.4, 1.6, 0.4], null, true],
      ['cyl', 0x8fd3ff, [-1.0, 1.0, 0], [1.2, 2.0, 1.2]], ['cyl', 0x8fd3ff, [1.0, 1.0, 0], [1.2, 2.0, 1.2]], ...glowEyes(6.3, 0.85, 0.4, 0.22, 0x33ccff),
    ],
  },
  spore_mother: {
    name: 'Spore Mother', title: 'Queen of the Hollow', hp: 3600, dmg: 30, speed: 3, radius: 3.2, height: 6.5, ai: 'boss', xp: 180, coins: 180,
    patterns: ['burst', 'summon', 'rain', 'volley'], projColor: 0xd84a8a, summon: 'sporeling',
    model: [
      ['cyl', 0xf0e6d0, [0, 2.0, 0], [2.0, 4.0, 2.0]], ['sphere', 0xd84a8a, [0, 4.8, 0], [7.0, 3.0, 7.0]],
      ['sphere', 0xffffff, [1.6, 5.8, 1.0], [0.8, 0.5, 0.8]], ['sphere', 0xffffff, [-1.8, 5.6, -0.8], [0.9, 0.5, 0.9]], ['sphere', 0xffffff, [0.2, 6.2, -1.8], [0.7, 0.4, 0.7]],
      ['sphere', 0x2fc6b5, [0, 3.4, 0], [6.4, 0.5, 6.4], null, true], ...glowEyes(2.8, 1.0, 0.5, 0.28, 0x2fffe0),
    ],
  },
  inferno_drake: {
    name: 'Inferno Drake', title: 'Lord of the Caldera', hp: 3900, dmg: 34, speed: 7, radius: 3, height: 4, ai: 'boss', flying: true, hover: 7, xp: 200, coins: 200,
    patterns: ['burst', 'rain', 'volley', 'charge'], projColor: 0xff5522, summon: 'ember_wisp', burnOnHit: true,
    model: [
      ['sphere', 0x8a1c10, [0, 2, 0], [2.4, 2.0, 4.6]], ['sphere', 0xa82513, [0, 2.8, 2.8], [1.4, 1.2, 1.8]], ['cone', 0x2a1a17, [0, 2.4, -3.4], [0.8, 3.0, 0.8], [-1.57, 0, 0]],
      ['tetra', 0x5a1008, [-3.4, 2.6, 0], [5.0, 0.2, 3.0]], ['tetra', 0x5a1008, [3.4, 2.6, 0], [5.0, 0.2, 3.0]],
      ['cone', 0x2a1a17, [-0.5, 3.8, 2.6], [0.3, 1.0, 0.3], [-0.6, 0, 0]], ['cone', 0x2a1a17, [0.5, 3.8, 2.6], [0.3, 1.0, 0.3], [-0.6, 0, 0]],
      ['box', 0xff8c3a, [0, 1.3, 0], [1.0, 0.3, 3.6], null, true], ...glowEyes(3.0, 3.6, 0.45, 0.2, 0xffdd33),
    ],
  },
  void_herald: {
    name: 'Void Herald', title: 'Voice of Nothing', hp: 4400, dmg: 36, speed: 5, radius: 2.6, height: 7, ai: 'boss', flying: true, hover: 3, xp: 240, coins: 240,
    patterns: ['burst', 'spin', 'rain', 'summon', 'volley'], projColor: 0xd266ff, summon: 'null_shade',
    model: [
      ['cone', 0x140a24, [0, 3.0, 0], [3.4, 6.0, 3.4], [3.14, 0, 0]], ['sphere', 0x2c1a4a, [0, 6.4, 0], [1.6, 1.6, 1.6]],
      ['torus', 0xb455ff, [0, 7.6, 0], [1.6, 1.6, 1.6], [1.57, 0, 0], true], ['oct', 0xe08cff, [0, 6.4, 0.75], [0.6, 0.9, 0.3], null, true],
      ['oct', 0xb455ff, [-3.2, 4.5, 0], [0.8, 1.6, 0.8], null, true], ['oct', 0xb455ff, [3.2, 4.5, 0], [0.8, 1.6, 0.8], null, true],
    ],
  },
};

// The final boss: its HP and damage are re-scaled to the player's power when it spawns.
BOSSES.apex_sovereign = {
  name: 'Apex Sovereign', title: 'The Last Risk', hp: 6000, dmg: 40, speed: 5.5, radius: 3, height: 8, ai: 'boss', flying: true, hover: 2, xp: 400, coins: 400, final: true,
  patterns: ['slam', 'burst', 'spin', 'rain', 'volley', 'summon', 'charge'], projColor: 0xffd27a,
  summon: 'void_reaver', summonPool: ['void_reaver', 'null_shade', 'eye_stalker', 'magma_hound', 'ice_imp', 'glow_beetle'],
  model: [
    ['cone', 0xf2e6c0, [0, 3.2, 0], [3.6, 6.4, 3.6], [Math.PI, 0, 0]], ['cone', 0xffd27a, [0, 1.0, 0], [3.8, 0.6, 3.8], [Math.PI, 0, 0]],
    ['box', 0xe8dcc0, [0, 5.6, 0], [2.6, 1.6, 1.6]], ['sphere', 0xf6efe0, [0, 7.0, 0], [1.6, 1.7, 1.6]],
    ['box', 0x111122, [0, 7.05, 0.72], [1.0, 0.25, 0.2]], ['sphere', 0xffe08a, [-0.28, 7.08, 0.8], [0.18, 0.12, 0.08], null, true], ['sphere', 0xffe08a, [0.28, 7.08, 0.8], [0.18, 0.12, 0.08], null, true],
    ['cone', 0xffcc33, [0, 8.3, 0], [0.35, 1.0, 0.35]], ['cone', 0xffcc33, [-0.55, 8.1, 0], [0.3, 0.8, 0.3], [0, 0, 0.25]], ['cone', 0xffcc33, [0.55, 8.1, 0], [0.3, 0.8, 0.3], [0, 0, -0.25]],
    ['cyl', 0xffcc33, [0, 7.75, 0], [1.4, 0.3, 1.4]],
    ['torus', 0xfff2b0, [0, 7.2, -0.8], [2.6, 2.6, 2.6], null, true],
    ['tetra', 0xfff6e0, [-3.4, 5.2, -0.6], [4.4, 0.25, 2.6], null, true], ['tetra', 0xfff6e0, [3.4, 5.2, -0.6], [4.4, 0.25, 2.6], null, true],
    ['box', 0xe8dcc0, [-1.9, 5.0, 0.3], [0.7, 2.4, 0.7]], ['box', 0xe8dcc0, [1.9, 5.0, 0.3], [0.7, 2.4, 0.7]],
    ['oct', 0xffd27a, [-2.0, 3.6, 0.8], [0.7, 1.2, 0.7], null, true], ['oct', 0xffd27a, [2.0, 3.6, 0.8], [0.7, 1.2, 0.7], null, true],
  ],
};

export const ELITES = {
  blazing: { name: 'Blazing', color: 0xff5522, hpMult: 3.5, dmgMult: 1.8, trail: 'fire' },
  glacial: { name: 'Glacial', color: 0x66ddff, hpMult: 3.5, dmgMult: 1.6, slowOnHit: true },
  overloading: { name: 'Overloading', color: 0x4488ff, hpMult: 3.0, dmgMult: 1.6, shield: 0.5 },
  vampiric: { name: 'Vampiric', color: 0xff1a55, hpMult: 3.0, dmgMult: 2.0, leech: true },
};
