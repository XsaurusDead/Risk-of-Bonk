// Run checkpoint save: lets a run be continued later (from the title screen).
// The run is stored at every stage start, every 15s while playing, and on
// "Save & Quit". Resuming regenerates the current stage's map but keeps the
// character, level, items, upgrades, coins, timer and run stats.
import { G } from './state.js';
import { CHARACTERS } from '../data/characters.js';
import { ITEMS } from '../data/items.js';

const KEY = 'riskofbonk_run_v1';

export function saveRun() {
  const r = G.run, p = G.player;
  if (!r || !p || p.dead || r.ended) return;
  const data = {
    v: 1, savedAt: Date.now(), charId: r.charId, stageNum: r.stageNum, stagesCleared: r.stagesCleared, time: r.time, coins: r.coins,
    stats: r.stats, killsThisRun: (G.save.stats.kills || 0) - r.kills0,
    level: p.level, xp: p.xp, pendingLevelUps: p.pendingLevelUps, items: p.items, itemOrder: p.itemOrder, upgrades: p.upgrades,
    infusionHp: p.infusionHp, eaterDmg: p.eaterDmg || 0,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (_) {}
}

export function loadRunData() {
  let d = null;
  try {
    d = JSON.parse(localStorage.getItem(KEY) || 'null');
  } catch (_) {
    d = null;
  }
  if (!d || d.v !== 1 || !CHARACTERS[d.charId]) return null;
  // drop anything that no longer exists so an old save can't crash the game
  const items = {};
  for (const id in d.items || {}) if (ITEMS[id] && d.items[id] > 0) items[id] = d.items[id] | 0;
  d.items = items;
  d.itemOrder = (d.itemOrder || []).filter((id) => items[id]);
  d.upgrades = Array.isArray(d.upgrades) ? d.upgrades : [];
  return d;
}

export function clearRun() {
  try {
    localStorage.removeItem(KEY);
  } catch (_) {}
}
