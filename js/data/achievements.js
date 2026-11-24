// Achievements unlock characters and items.
//
// cond.scope: 'life' = cumulative across all runs, 'run' = within one run.
// cond.char:  progress only counts while playing that character. A condition
//             may only reference a character that is unlocked EARLIER in the
//             graph (checked by validateUnlockGraph in save.js), so the chain
//             can never deadlock.
export const DEFAULT_CHARACTERS = ['vanguard', 'bonker'];

// Hand-written core achievements (ids are stable; saves reference them).
export const ACHIEVEMENTS = [
  // ---------- Character unlocks (all completable with the two starters) ----------
  { id: 'kindling', name: 'Kindling', desc: 'Defeat 400 enemies (all runs).', cond: { scope: 'life', stat: 'kills', value: 400 }, reward: { character: 'pyra' } },
  { id: 'pathfinder', name: 'Pathfinder', desc: 'Clear a stage by escaping through a portal.', cond: { scope: 'life', stat: 'stagesCleared', value: 1 }, reward: { character: 'kestrel' } },
  { id: 'packrat', name: 'Packrat', desc: 'Hold 18 items in a single run.', cond: { scope: 'run', stat: 'itemsHeld', value: 18 }, reward: { character: 'tinker' } },
  { id: 'cold_reception', name: 'Cold Reception', desc: 'Reach stage 3 (Frostfang Peaks).', cond: { scope: 'run', stat: 'stageReached', value: 3 }, reward: { character: 'glacia' } },
  { id: 'survivor', name: 'Survivor', desc: 'Survive for 25 minutes in a single run.', cond: { scope: 'run', stat: 'runTime', value: 1500 }, reward: { character: 'kaze' } },
  { id: 'grave_matters', name: 'Grave Matters', desc: 'Defeat 3000 enemies (all runs).', cond: { scope: 'life', stat: 'kills', value: 3000 }, reward: { character: 'morrow' } },
  { id: 'giant_slayer', name: 'Giant Slayer', desc: 'Defeat 4 stage bosses (all runs).', cond: { scope: 'life', stat: 'bossKills', value: 4 }, reward: { character: 'bulwark' } },
  { id: 'into_the_void', name: 'Into the Void', desc: 'Reach stage 6 (Void Sanctum).', cond: { scope: 'run', stat: 'stageReached', value: 6 }, reward: { character: 'nyx' } },

  // ---------- Generic item unlocks ----------
  { id: 'big_spender', name: 'Big Spender', desc: 'Spend 5000 coins on chests (all runs).', cond: { scope: 'life', stat: 'coinsSpent', value: 5000 }, reward: { item: 'piggy_bank' } },
  { id: 'treasure_hunter', name: 'Treasure Hunter', desc: 'Open 60 chests (all runs).', cond: { scope: 'life', stat: 'chests', value: 60 }, reward: { item: 'golden_idol' } },
  { id: 'first_boss', name: 'Bigger They Are', desc: 'Defeat your first stage boss.', cond: { scope: 'life', stat: 'bossKills', value: 1 }, reward: { item: 'phoenix_feather' } },
  { id: 'scholar', name: 'Scholar', desc: 'Reach level 25 in a single run.', cond: { scope: 'run', stat: 'level', value: 25 }, reward: { item: 'chrono_crown' } },
  { id: 'heavy_hitter', name: 'Heavy Hitter', desc: 'Deal 10,000 damage with a single hit.', cond: { scope: 'life', stat: 'maxHit', value: 10000 }, reward: { item: 'godslayer' } },
  { id: 'marathon', name: 'Marathon', desc: 'Survive for 60 minutes in a single run.', cond: { scope: 'run', stat: 'runTime', value: 3600 }, reward: { item: 'celestial_wings' } },
  { id: 'collector', name: 'Collector', desc: 'Unlock 6 different characters.', cond: { scope: 'life', stat: 'charactersUnlocked', value: 6 }, reward: { item: 'adrenal_gland' } },

  // ---------- Character mastery (each needs only that character) ----------
  { id: 'vanguard_mastery', name: 'Sharpshooter', desc: 'As Vanguard: land 1500 critical hits (all runs).', cond: { scope: 'life', char: 'vanguard', stat: 'crits', value: 1500 }, reward: { item: 'hunters_scope' } },
  { id: 'bonker_mastery', name: 'BONK!', desc: 'As Bonker: defeat 1000 enemies (all runs).', cond: { scope: 'life', char: 'bonker', stat: 'kills', value: 1000 }, reward: { item: 'bonk_bat' } },
  { id: 'pyra_mastery', name: 'Pyromaniac', desc: 'As Pyra: defeat 150 burning enemies (all runs).', cond: { scope: 'life', char: 'pyra', stat: 'burnKills', value: 150 }, reward: { item: 'magma_heart' } },
  { id: 'glacia_mastery', name: 'Ice Age', desc: 'As Glacia: freeze 100 enemies (all runs).', cond: { scope: 'life', char: 'glacia', stat: 'freezes', value: 100 }, reward: { item: 'frozen_tear' } },
  { id: 'kestrel_mastery', name: 'Long Shot', desc: 'As Kestrel: clear 2 stages in a single run.', cond: { scope: 'run', char: 'kestrel', stat: 'stagesCleared', value: 2 }, reward: { item: 'wind_sigil' } },
  { id: 'tinker_mastery', name: 'Automation', desc: 'As Tinker: deployables defeat 150 enemies (all runs).', cond: { scope: 'life', char: 'tinker', stat: 'deployKills', value: 150 }, reward: { item: 'drone_swarm' } },
  { id: 'kaze_mastery', name: 'Untouchable', desc: 'As Kaze: clear a stage.', cond: { scope: 'life', char: 'kaze', stat: 'stagesCleared', value: 1 }, reward: { item: 'monk_beads' } },
  { id: 'morrow_mastery', name: 'Necromancy', desc: 'As Morrow: raise 60 undead (all runs).', cond: { scope: 'life', char: 'morrow', stat: 'raised', value: 60 }, reward: { item: 'soul_lantern' } },
  { id: 'bulwark_mastery', name: 'Unstoppable', desc: 'As Bulwark: defeat a stage boss.', cond: { scope: 'life', char: 'bulwark', stat: 'bossKills', value: 1 }, reward: { item: 'titan_plating' } },
  { id: 'nyx_mastery', name: 'Assassinate', desc: 'As Nyx: execute 60 enemies (all runs).', cond: { scope: 'life', char: 'nyx', stat: 'executes', value: 60 }, reward: { item: 'reapers_edge' } },
];

// ---------------------------------------------------------------------------
// Generated achievements (404 in total).
//
// Rewards for the expansion content are handed out here. Every reward is
// placed on an achievement that can be completed with content unlocked earlier
// (characters are only ever rewarded by achievements that need no specific
// survivor), and validateUnlockGraph() in save.js re-checks the whole chain at
// boot, so the save can never get stuck.
// ---------------------------------------------------------------------------
export const TOTAL_ACHIEVEMENTS = 404;
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const fmtN = (v) => v.toLocaleString('en-US');
const LABEL = {
  kills: (v) => `Defeat ${fmtN(v)} enemies`, eliteKills: (v) => `Defeat ${fmtN(v)} elite enemies`, bossKills: (v) => `Defeat ${fmtN(v)} stage bosses`,
  chests: (v) => `Open ${fmtN(v)} chests`, largeChests: (v) => `Open ${fmtN(v)} large chests`, coinsSpent: (v) => `Spend ${fmtN(v)} coins on chests`,
  stagesCleared: (v) => `Clear ${fmtN(v)} stage${v > 1 ? 's' : ''}`, runs: (v) => `Start ${fmtN(v)} run${v > 1 ? 's' : ''}`, crits: (v) => `Land ${fmtN(v)} critical hits`,
  freezes: (v) => `Freeze ${fmtN(v)} enemies`, burnKills: (v) => `Defeat ${fmtN(v)} burning enemies`, poisonKills: (v) => `Defeat ${fmtN(v)} poisoned enemies`,
  executes: (v) => `Execute ${fmtN(v)} enemies`, ultsUsed: (v) => `Use your Ultimate ${fmtN(v)} times`, abilitiesUsed: (v) => `Use abilities ${fmtN(v)} times`,
  damageDealt: (v) => `Deal ${fmtN(v)} total damage`, jumps: (v) => `Jump ${fmtN(v)} times`, levelUps: (v) => `Level up ${fmtN(v)} times`,
  items_common: (v) => `Find ${fmtN(v)} Common items`, items_rare: (v) => `Find ${fmtN(v)} Rare items`, items_epic: (v) => `Find ${fmtN(v)} Epic items`,
  items_legendary: (v) => `Find ${fmtN(v)} Legendary item${v > 1 ? 's' : ''}`, finalBossKills: (v) => `Defeat the Apex Sovereign${v > 1 ? ` ${v} times` : ''}`,
  runsWon: (v) => `Win ${v > 1 ? fmtN(v) + ' runs' : 'a run'}`, loopsCompleted: (v) => `Continue a run past the final boss${v > 1 ? ` ${v} times` : ''}`,
  deaths: (v) => `Die ${fmtN(v)} time${v > 1 ? 's' : ''}`, maxHit: (v) => `Deal ${fmtN(v)} damage with a single hit`, charactersUnlocked: (v) => `Unlock ${v} survivors`,
  shrinesUsed: (v) => `Use ${fmtN(v)} shrines or Moai`, championKills: (v) => `Defeat ${fmtN(v)} Champions`, overtimes: (v) => `Survive into Overtime${v > 1 ? ` ${v} times` : ''}`,
  bhops: (v) => `Chain ${fmtN(v)} perfect bunny hops`, specialChests: (v) => `Open ${fmtN(v)} Epic or Legendary chests`, devilMarks: (v) => `Take ${fmtN(v)} Devil's Trademarks`,
  stageReached: (v) => `Reach stage ${v} in a single run`, runTime: (v) => `Survive ${Math.round(v / 60)} minutes in a single run`, level: (v) => `Reach level ${v} in a single run`,
  itemsHeld: (v) => `Hold ${v} items in a single run`, coinsRun: (v) => `Collect ${fmtN(v)} coins in a single run`, legendaryHeld: (v) => `Hold ${v} Legendary items in a single run`,
};
const RUN_LABEL = { kills: (v) => `Defeat ${fmtN(v)} enemies in a single run` };

export function buildAchievements({ items, characters, charNames, enemies, bosses, stages }) {
  if (ACHIEVEMENTS.length > 25) return ACHIEVEMENTS;
  const gen = [];
  const add = (id, name, cond, tier, descOverride) => {
    let d = descOverride || (cond.scope === 'run' && RUN_LABEL[cond.stat] ? RUN_LABEL[cond.stat](cond.value) : LABEL[cond.stat] ? LABEL[cond.stat](cond.value) : `${cond.stat} ${cond.value}`);
    if (cond.char && cond.stat !== 'charLevel') d = `As ${charNames[cond.char]}: ${d.charAt(0).toLowerCase()}${d.slice(1)}`;
    if (cond.scope === 'life' && !/single|Unlock|with a single/.test(d) && cond.value > 1 && !cond.char) d += ' (all runs)';
    gen.push({ id, name, desc: d + '.', cond, reward: {}, tier });
  };
  const tierOf = (i, n) => Math.min(3, Math.floor((i / Math.max(1, n)) * 4));
  const fam = (stat, scope, values, base) =>
    values.forEach((v, i) => add(`${stat}_${scope}_${v}`, `${base} ${ROMAN[i]}`, { scope, stat, value: v }, tierOf(i, values.length)));

  // --- global, all runs (tuned so a first run earns roughly a dozen) ---
  fam('kills', 'life', [600, 2000, 4000, 8000, 15000, 25000, 40000, 60000], 'Slayer');
  fam('eliteKills', 'life', [15, 40, 100, 200, 400, 800, 1500], 'Elite Hunter');
  fam('bossKills', 'life', [3, 6, 12, 20, 35, 55, 80], 'Boss Breaker');
  fam('chests', 'life', [15, 40, 80, 150, 250, 400, 600], 'Treasure Seeker');
  fam('largeChests', 'life', [5, 20, 60, 150], 'Big Box Energy');
  fam('coinsSpent', 'life', [2500, 10000, 30000, 80000, 200000, 500000], 'Big Spender');
  fam('stagesCleared', 'life', [4, 8, 15, 25, 40, 60], 'Pathfinder');
  fam('runs', 'life', [5, 15, 30, 60], 'Regular');
  fam('crits', 'life', [2000, 10000, 40000], 'Critical Thinker');
  fam('freezes', 'life', [200, 1000, 4000], 'Cold Snap');
  fam('burnKills', 'life', [300, 1500, 5000], 'Arsonist');
  fam('poisonKills', 'life', [200, 1000, 4000], 'Toxic');
  fam('executes', 'life', [150, 1000], 'Headsman');
  fam('ultsUsed', 'life', [40, 150, 400, 1000], 'Ultimate Power');
  fam('abilitiesUsed', 'life', [1000, 5000, 20000], 'Spellslinger');
  fam('damageDealt', 'life', [1000000, 10000000, 100000000, 1000000000], 'Devastator');
  fam('jumps', 'life', [1500, 8000], 'Bunny Hopper');
  fam('levelUps', 'life', [80, 250, 600], 'Ascendant');
  fam('items_common', 'life', [80, 300, 800], 'Collector of Trinkets');
  fam('items_rare', 'life', [40, 150, 400], 'Rare Finds');
  fam('items_epic', 'life', [15, 60, 150], 'Epic Hoard');
  fam('items_legendary', 'life', [3, 10, 25, 50], 'Legend Seeker');
  fam('finalBossKills', 'life', [1, 3, 6, 12], 'Sovereign Slayer');
  fam('runsWon', 'life', [1, 5], 'Champion');
  fam('loopsCompleted', 'life', [1, 3], 'Beyond the End');
  fam('deaths', 'life', [10, 50, 150], 'Try, Try Again');
  fam('maxHit', 'life', [5000, 50000, 500000, 5000000], 'Overkill');
  fam('charactersUnlocked', 'life', [4, 10, 14, 17], 'Full Roster');
  // --- single run ---
  fam('stageReached', 'run', [3, 4, 5, 7, 8, 10, 14], 'Deep Diver');
  fam('runTime', 'run', [1200, 2400, 3600, 4800, 6000], 'Endurance');
  fam('level', 'run', [18, 28, 38, 48, 60, 80], 'Power Spike');
  fam('itemsHeld', 'run', [25, 40, 60, 90, 130, 180], 'Pockets Full');
  fam('coinsRun', 'run', [3000, 15000, 60000], 'Gold Rush');
  fam('kills', 'run', [800, 2000, 4000, 8000], 'Rampage');
  fam('legendaryHeld', 'run', [3, 6], 'Living Legend');
  // --- per stage / boss / enemy ---
  for (const st of stages) [1, 5, 20].forEach((v, i) => add(`clear_${st.id}_${v}`, `${st.name} ${['Explorer', 'Veteran', 'Master'][i]}`, { scope: 'life', stat: 'clear_' + st.id, value: v }, i + (st.final ? 1 : 0), `Clear ${st.name}${v > 1 ? ` ${v} times` : ''}`));
  for (const id in bosses) {
    const b = bosses[id];
    [2, 8, 20].forEach((v, i) => add(`boss_${id}_${v}`, `${b.name} ${['Slayer', 'Bane', 'Nemesis'][i]}`, { scope: 'life', stat: 'boss_' + id, value: v }, Math.min(3, i + 1), `Defeat ${b.name} ${v} times`));
  }
  for (const id in enemies) {
    const e = enemies[id];
    [250, 1500].forEach((v, i) => add(`kill_${id}_${v}`, `${e.name} ${['Hunter', 'Exterminator'][i]}`, { scope: 'life', stat: 'kill_' + id, value: v }, i + 1, `Defeat ${v} ${e.name}${e.name.endsWith('s') ? '' : 's'}`));
  }
  // --- per survivor ---
  // 5 character-level milestones per survivor, each unlocking one of its costumes
  const COSTUME_LV = [[3, 'Rival'], [6, 'Arctic'], [10, 'Inferno'], [15, 'Shadow'], [20, 'Golden']];
  const CH = [['kills', 'life', 3000, 1, 'Veteran'], ['bossKills', 'life', 6, 1, 'Giant Killer'], ['finalBossKills', 'life', 1, 3, 'Crowned']];
  for (const c of characters) {
    COSTUME_LV.forEach(([lv, cos], i) => {
      add(`${c}_charLevel_${lv}`, `${charNames[c]}: Level ${lv}`, { scope: 'life', stat: 'charLevel', value: lv, char: c }, Math.min(3, i), `Reach character level ${lv} with ${charNames[c]}`);
      gen[gen.length - 1].reward.costume = `${c}:${i + 1}`;
      gen[gen.length - 1].costumeName = cos;
    });
    for (const [stat, scope, value, tier, title] of CH) add(`${c}_${stat}_${scope}_${value}`, `${charNames[c]}: ${title}`, { scope, stat, value, char: c }, tier);
  }

  // --- new mechanics ---
  fam('shrinesUsed', 'life', [10, 50, 200], 'Pilgrim');
  fam('championKills', 'life', [3, 15, 50], 'Champion Slayer');
  fam('overtimes', 'life', [1, 10], 'Overtime');
  fam('bhops', 'life', [100, 1000], 'Speedrunner');
  fam('specialChests', 'life', [3, 15], 'Rarity Hunter');
  fam('devilMarks', 'life', [5, 25], "Devil's Due");

  // pad / trim to exactly 404 total
  const pad = [['abilitiesUsed', 'life', 60000], ['jumps', 'life', 40000], ['kills', 'life', 90000], ['chests', 'life', 900], ['crits', 'life', 150000], ['damageDealt', 'life', 10000000000]];
  let k = 0;
  while (ACHIEVEMENTS.length + gen.length < TOTAL_ACHIEVEMENTS && k < pad.length) {
    const [stat, scope, v] = pad[k++];
    add(`${stat}_${scope}_${v}`, `${LABEL[stat] ? 'Mythic ' : ''}${stat === 'kills' ? 'Slayer' : stat === 'jumps' ? 'Bunny Hopper' : stat === 'chests' ? 'Treasure Seeker' : stat === 'crits' ? 'Critical Thinker' : stat === 'damageDealt' ? 'Devastator' : 'Spellslinger'} ∞`, { scope, stat, value: v }, 3);
  }
  while (ACHIEVEMENTS.length + gen.length > TOTAL_ACHIEVEMENTS) gen.pop();

  // --- rewards ---
  // New survivors: unlocked by achievements any survivor can complete.
  const charRewards = {
    kills_life_4000: 'sol', chests_life_80: 'mimic', eliteKills_life_100: 'grizzle', stagesCleared_life_25: 'spark',
    level_run_28: 'rook', poisonKills_life_1000: 'vex', finalBossKills_life_1: 'echo',
  };
  for (const a of gen) if (charRewards[a.id]) a.reward.character = charRewards[a.id];
  const special = (a) => a.reward.character || a.reward.costume;
  // Expansion items: rarity follows achievement difficulty (tier 0..3).
  const RAR = ['common', 'rare', 'epic', 'legendary'];
  const pools = RAR.map((r) => items.filter((it) => it.ext && it.rarity === r).map((it) => it.id));
  // Sort achievements by difficulty tier and items by rarity, then spread the
  // items evenly: easy achievements hand out commons, hard ones legendaries.
  const order = gen.filter((a) => !special(a)).map((a, i) => ({ a, i })).sort((x, y) => x.a.tier - y.a.tier || x.i - y.i).map((x) => x.a);
  const loot = pools.flat();
  const step = order.length / Math.max(1, loot.length);
  loot.forEach((id, i) => { order[Math.min(order.length - 1, Math.floor(i * step))].reward.item = id; });
  ACHIEVEMENTS.push(...gen);
  return ACHIEVEMENTS;
}
