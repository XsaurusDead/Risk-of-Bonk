// Persistent save + achievement progress tracking.
//
// Anti-brick design:
//  * The save only stores *completed achievements* and *lifetime counters*.
//    Unlocked characters/items are always DERIVED (defaults + rewards), so a
//    save can never end up with "nothing unlocked" or stale unlock flags.
//  * validateUnlockGraph() simulates progression from a fresh save and proves
//    every achievement is completable using only content unlocked before it.
//    Anything found unreachable is auto-granted at boot (never happens with the
//    shipped data, but protects against future data edits).
//  * Every counter is cumulative, so progress is never lost by dying.
import { G } from './state.js';
import { ACHIEVEMENTS, DEFAULT_CHARACTERS, buildAchievements } from '../data/achievements.js';
import { CHARACTERS, CHARACTER_ORDER } from '../data/characters.js';
import { ITEMS, ITEM_LIST } from '../data/items.js';
import { ENEMIES, BOSSES } from '../data/enemies.js';
import { STAGES } from '../data/stages.js';
import { RARITY_ORDER } from './util.js';

const KEY = 'riskofbonk_save_v1';

export const DEFAULT_SETTINGS = {
  sensitivity: 1,
  padSensitivity: 1,
  touchSensitivity: 1,
  invertY: false,
  volume: 0.6,
  musicVolume: 0.5,
  quality: 'auto', // auto | low | high
  autoFire: 'touch', // off | touch | always
  aimAssist: true,
  damageNumbers: true,
  screenShake: true,
  showFps: false,
};

function freshSave() {
  return {
    version: 1,
    achievements: {},
    stats: {},
    charStats: {},
    discovered: {},
    costumes: {},
    settings: { ...DEFAULT_SETTINGS },
    lastChar: 'vanguard',
  };
}

/** Generate the full achievement list and the lookup tables (once). */
export function initAchievements() {
  if (achIndex) return;
  const charNames = {};
  for (const id of CHARACTER_ORDER) charNames[id] = CHARACTERS[id].name;
  buildAchievements({ items: ITEM_LIST, characters: CHARACTER_ORDER, charNames, enemies: ENEMIES, bosses: BOSSES, stages: STAGES });
  achIndex = new Map();
  for (const a of ACHIEVEMENTS) {
    if (a.reward.item) rewardedItems.add(a.reward.item);
    if (a.reward.character) rewardedChars.add(a.reward.character);
    if (!achIndex.has(a.cond.stat)) achIndex.set(a.cond.stat, []);
    achIndex.get(a.cond.stat).push(a);
  }
}

export function loadSave() {
  initAchievements();
  let s = null;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) s = JSON.parse(raw);
  } catch (_) {
    s = null;
  }
  if (!s || typeof s !== 'object') s = freshSave();
  // repair / migrate defensively
  const base = freshSave();
  for (const k in base) if (s[k] === undefined || s[k] === null) s[k] = base[k];
  s.settings = { ...DEFAULT_SETTINGS, ...(s.settings || {}) };
  for (const k of ['achievements', 'stats', 'charStats', 'discovered', 'costumes']) {
    if (typeof s[k] !== 'object' || Array.isArray(s[k])) s[k] = {};
  }
  // drop unknown achievement ids
  const known = new Set(ACHIEVEMENTS.map((a) => a.id));
  for (const id in s.achievements) if (!known.has(id)) delete s.achievements[id];
  G.save = s;

  // Safety net: auto-grant anything the unlock graph says is unreachable.
  const unreachable = validateUnlockGraph();
  if (unreachable.length) {
    console.warn('[save] unreachable achievements auto-granted:', unreachable.map((a) => a.id));
    for (const a of unreachable) s.achievements[a.id] = s.achievements[a.id] || Date.now();
  }
  // Re-evaluate everything against the current requirements (quietly, no popups).
  silent = true;
  try { checkAchievements(); } finally { silent = false; }
  if (!isCharacterUnlocked(s.lastChar)) s.lastChar = DEFAULT_CHARACTERS[0];
  persist();
  return s;
}

let persistTimer = null;
export function persist(immediate = true) {
  if (!G.save) return;
  if (!immediate) {
    if (persistTimer) return;
    persistTimer = setTimeout(() => {
      persistTimer = null;
      persist(true);
    }, 4000);
    return;
  }
  try {
    localStorage.setItem(KEY, JSON.stringify(G.save));
  } catch (_) {}
}

export function resetSave() {
  const settings = G.save?.settings;
  G.save = freshSave();
  if (settings) G.save.settings = settings;
  persist();
}

// ---------- derived unlocks ----------
const rewardedItems = new Set();
const rewardedChars = new Set();
let achIndex = null;
const itemUnlockedBy = new Map();
const charUnlockedBy = new Map();
const costumeUnlockedBy = new Map();

function sourceMap(kind) {
  const m = kind === 'item' ? itemUnlockedBy : kind === 'costume' ? costumeUnlockedBy : charUnlockedBy;
  if (!m.size) for (const a of ACHIEVEMENTS) if (a.reward[kind]) m.set(a.reward[kind], a);
  return m;
}
export function isCharacterUnlocked(id) {
  if (DEFAULT_CHARACTERS.includes(id)) return true;
  const a = sourceMap('character').get(id);
  return !!(a && G.save?.achievements[a.id]);
}
export function isCostumeUnlocked(charId, idx) {
  if (!idx) return true;
  const a = sourceMap('costume').get(`${charId}:${idx}`);
  return !!(a && G.save?.achievements[a.id]);
}
export function selectedCostume(charId) {
  const i = G.save?.costumes?.[charId] || 0;
  return isCostumeUnlocked(charId, i) ? i : 0;
}
export function isItemUnlocked(id) {
  if (!rewardedItems.has(id)) return true;
  const a = sourceMap('item').get(id);
  return !!(a && G.save?.achievements[a.id]);
}
export function unlockSourceFor(kind, id) {
  return ACHIEVEMENTS.find((a) => a.reward[kind] === id) || null;
}

/**
 * Simulates progression from a brand new save. Returns achievements that can
 * never be completed (their requirement is locked behind itself or missing).
 */
export function validateUnlockGraph() {
  const chars = new Set(DEFAULT_CHARACTERS);
  const items = new Set(Object.keys(ITEMS).filter((id) => !rewardedItems.has(id)));
  const done = new Set();
  let changed = true;
  while (changed) {
    changed = false;
    for (const a of ACHIEVEMENTS) {
      if (done.has(a.id)) continue;
      const needChar = a.cond.char;
      const needItem = a.cond.item;
      if (needChar && !chars.has(needChar)) continue;
      if (needItem && !items.has(needItem)) continue;
      // achievements requiring "unlock N characters" are satisfiable once enough exist
      if (a.cond.stat === 'charactersUnlocked' && chars.size < a.cond.value) continue;
      done.add(a.id);
      if (a.reward.character) chars.add(a.reward.character);
      if (a.reward.item) items.add(a.reward.item);
      changed = true;
    }
  }
  const problems = ACHIEVEMENTS.filter((a) => !done.has(a.id));
  // every character must be reachable
  for (const c of Object.keys(CHARACTERS)) {
    if (!chars.has(c)) console.warn('[save] character has no unlock path:', c);
  }
  // every rarity must always have at least one default item (so chests never roll empty)
  for (const r of RARITY_ORDER) {
    const any = Object.values(ITEMS).some((it) => it.rarity === r && !rewardedItems.has(it.id));
    if (!any) console.warn('[save] rarity has no default items:', r);
  }
  return problems;
}

// ---------- progress tracking ----------
function charBucket(charId) {
  if (!charId) return null;
  if (!G.save.charStats[charId]) G.save.charStats[charId] = {};
  return G.save.charStats[charId];
}

export let onAchievement = null;
let silent = false;
export function setAchievementHandler(fn) {
  onAchievement = fn;
}

/** Additive stat (kills, chests opened, ...). */
export function track(stat, amount = 1) {
  if (!G.save) return;
  const s = G.save.stats;
  s[stat] = (s[stat] || 0) + amount;
  const charId = G.run?.charId;
  const cb = charBucket(charId);
  if (cb) cb[stat] = (cb[stat] || 0) + amount;
  if (G.run) G.run.stats[stat] = (G.run.stats[stat] || 0) + amount;
  checkAchievements(stat);
  persist(false);
}

/** Max-style stat (highest stage, longest survival, ...). */
export function trackMax(stat, value) {
  if (!G.save) return;
  const s = G.save.stats;
  if (!(s[stat] >= value)) s[stat] = value;
  const cb = charBucket(G.run?.charId);
  if (cb && !(cb[stat] >= value)) cb[stat] = value;
  if (G.run && !(G.run.stats[stat] >= value)) G.run.stats[stat] = value;
  checkAchievements(stat);
  persist(false);
}

export function achievementProgress(a) {
  const c = a.cond;
  let v = 0;
  if (c.stat === 'charactersUnlocked') {
    v = Object.keys(CHARACTERS).filter(isCharacterUnlocked).length;
  } else if (c.scope === 'run') {
    // best-ever value in a single run is stored as a lifetime max
    const bucket = c.char ? G.save.charStats[c.char] || {} : G.save.stats;
    v = bucket['best_' + c.stat] || 0;
    if (G.run && (!c.char || G.run.charId === c.char)) v = Math.max(v, G.run.stats[c.stat] || 0);
  } else {
    const bucket = c.char ? G.save.charStats[c.char] || {} : G.save.stats;
    v = bucket[c.stat] || 0;
  }
  return Math.min(v, c.value);
}

export function checkAchievements(stat) {
  const list = stat && achIndex ? achIndex.get(stat) || [] : ACHIEVEMENTS;
  for (const a of list) {
    if (G.save.achievements[a.id]) continue;
    if (a.cond.char && a.cond.scope === 'run' && G.run?.charId !== a.cond.char) continue;
    if (achievementProgress(a) >= a.cond.value) grant(a);
  }
}

function grant(a) {
  G.save.achievements[a.id] = Date.now();
  if (G.run) G.run.newAchievements.push(a.id);
  persist();
  if (onAchievement && !silent) onAchievement(a);
  // chained achievements (like "unlock N characters")
  if (a.reward.character) checkAchievements('charactersUnlocked');
}

/** At end of a run, roll run-scoped stats into "best_" lifetime maxima. */
export function commitRunBests() {
  if (!G.run) return;
  const r = G.run.stats;
  const cb = charBucket(G.run.charId);
  for (const k in r) {
    const key = 'best_' + k;
    if (!(G.save.stats[key] >= r[k])) G.save.stats[key] = r[k];
    if (cb && !(cb[key] >= r[k])) cb[key] = r[k];
  }
  persist();
}

export function discover(itemId) {
  if (!G.save.discovered[itemId]) {
    G.save.discovered[itemId] = 1;
    persist(false);
  }
}
