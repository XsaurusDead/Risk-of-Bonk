// Achievements unlock characters and items.
//
// cond.scope: 'life' = cumulative across all runs, 'run' = within one run.
// cond.char:  progress only counts while playing that character. A condition
//             may only reference a character that is unlocked EARLIER in the
//             graph (checked by validateUnlockGraph in save.js), so the chain
//             can never deadlock.
export const DEFAULT_CHARACTERS = ['vanguard', 'bonker'];

export const ACHIEVEMENTS = [
  // ---------- Character unlocks (all completable with the two starters) ----------
  { id: 'kindling', name: 'Kindling', desc: 'Defeat 150 enemies (all runs).', cond: { scope: 'life', stat: 'kills', value: 150 }, reward: { character: 'pyra' } },
  { id: 'pathfinder', name: 'Pathfinder', desc: 'Clear a stage by escaping through a portal.', cond: { scope: 'life', stat: 'stagesCleared', value: 1 }, reward: { character: 'kestrel' } },
  { id: 'packrat', name: 'Packrat', desc: 'Hold 12 items in a single run.', cond: { scope: 'run', stat: 'itemsHeld', value: 12 }, reward: { character: 'tinker' } },
  { id: 'cold_reception', name: 'Cold Reception', desc: 'Reach stage 3 (Frostfang Peaks).', cond: { scope: 'run', stat: 'stageReached', value: 3 }, reward: { character: 'glacia' } },
  { id: 'survivor', name: 'Survivor', desc: 'Survive for 15 minutes in a single run.', cond: { scope: 'run', stat: 'runTime', value: 900 }, reward: { character: 'kaze' } },
  { id: 'grave_matters', name: 'Grave Matters', desc: 'Defeat 1500 enemies (all runs).', cond: { scope: 'life', stat: 'kills', value: 1500 }, reward: { character: 'morrow' } },
  { id: 'giant_slayer', name: 'Giant Slayer', desc: 'Defeat 4 stage bosses (all runs).', cond: { scope: 'life', stat: 'bossKills', value: 4 }, reward: { character: 'bulwark' } },
  { id: 'into_the_void', name: 'Into the Void', desc: 'Reach stage 6 (Void Sanctum).', cond: { scope: 'run', stat: 'stageReached', value: 6 }, reward: { character: 'nyx' } },

  // ---------- Generic item unlocks ----------
  { id: 'big_spender', name: 'Big Spender', desc: 'Spend 2500 coins on chests (all runs).', cond: { scope: 'life', stat: 'coinsSpent', value: 2500 }, reward: { item: 'piggy_bank' } },
  { id: 'treasure_hunter', name: 'Treasure Hunter', desc: 'Open 40 chests (all runs).', cond: { scope: 'life', stat: 'chests', value: 40 }, reward: { item: 'golden_idol' } },
  { id: 'first_boss', name: 'Bigger They Are', desc: 'Defeat your first stage boss.', cond: { scope: 'life', stat: 'bossKills', value: 1 }, reward: { item: 'phoenix_feather' } },
  { id: 'scholar', name: 'Scholar', desc: 'Reach level 15 in a single run.', cond: { scope: 'run', stat: 'level', value: 15 }, reward: { item: 'chrono_crown' } },
  { id: 'heavy_hitter', name: 'Heavy Hitter', desc: 'Deal 2,500 damage with a single hit.', cond: { scope: 'life', stat: 'maxHit', value: 2500 }, reward: { item: 'godslayer' } },
  { id: 'marathon', name: 'Marathon', desc: 'Survive for 30 minutes in a single run.', cond: { scope: 'run', stat: 'runTime', value: 1800 }, reward: { item: 'celestial_wings' } },
  { id: 'collector', name: 'Collector', desc: 'Unlock 6 different characters.', cond: { scope: 'life', stat: 'charactersUnlocked', value: 6 }, reward: { item: 'adrenal_gland' } },

  // ---------- Character mastery (each needs only that character) ----------
  { id: 'vanguard_mastery', name: 'Sharpshooter', desc: 'As Vanguard: land 400 critical hits (all runs).', cond: { scope: 'life', char: 'vanguard', stat: 'crits', value: 400 }, reward: { item: 'hunters_scope' } },
  { id: 'bonker_mastery', name: 'BONK!', desc: 'As Bonker: defeat 400 enemies (all runs).', cond: { scope: 'life', char: 'bonker', stat: 'kills', value: 400 }, reward: { item: 'bonk_bat' } },
  { id: 'pyra_mastery', name: 'Pyromaniac', desc: 'As Pyra: defeat 150 burning enemies (all runs).', cond: { scope: 'life', char: 'pyra', stat: 'burnKills', value: 150 }, reward: { item: 'magma_heart' } },
  { id: 'glacia_mastery', name: 'Ice Age', desc: 'As Glacia: freeze 100 enemies (all runs).', cond: { scope: 'life', char: 'glacia', stat: 'freezes', value: 100 }, reward: { item: 'frozen_tear' } },
  { id: 'kestrel_mastery', name: 'Long Shot', desc: 'As Kestrel: clear 2 stages in a single run.', cond: { scope: 'run', char: 'kestrel', stat: 'stagesCleared', value: 2 }, reward: { item: 'wind_sigil' } },
  { id: 'tinker_mastery', name: 'Automation', desc: 'As Tinker: deployables defeat 150 enemies (all runs).', cond: { scope: 'life', char: 'tinker', stat: 'deployKills', value: 150 }, reward: { item: 'drone_swarm' } },
  { id: 'kaze_mastery', name: 'Untouchable', desc: 'As Kaze: clear a stage.', cond: { scope: 'life', char: 'kaze', stat: 'stagesCleared', value: 1 }, reward: { item: 'monk_beads' } },
  { id: 'morrow_mastery', name: 'Necromancy', desc: 'As Morrow: raise 60 undead (all runs).', cond: { scope: 'life', char: 'morrow', stat: 'raised', value: 60 }, reward: { item: 'soul_lantern' } },
  { id: 'bulwark_mastery', name: 'Unstoppable', desc: 'As Bulwark: defeat a stage boss.', cond: { scope: 'life', char: 'bulwark', stat: 'bossKills', value: 1 }, reward: { item: 'titan_plating' } },
  { id: 'nyx_mastery', name: 'Assassinate', desc: 'As Nyx: execute 60 enemies (all runs).', cond: { scope: 'life', char: 'nyx', stat: 'executes', value: 60 }, reward: { item: 'reapers_edge' } },
];
