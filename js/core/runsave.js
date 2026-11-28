// Run checkpoint save: lets a run be continued later (from the title screen).
// The run is stored at every stage start, every 3s while playing, on "Save & Quit"
// and when the tab is hidden, reloaded or closed. Resuming rebuilds the SAME stage map (same seed)
// and restores it exactly as it was: stage timer + wave schedule, portal and boss
// state, which chests / shrines / pillars / Moai were used, HP and position — so
// quitting and resuming can never reset the stage clock.
import { G } from './state.js';
import { CHARACTERS } from '../data/characters.js';
import { ITEMS } from '../data/items.js';
import { TOME_BY_ID } from '../data/tomes.js';

const KEY = 'riskofbonk_run_v1';

export function saveRun() {
  const r = G.run, p = G.player;
  if (!r || !p || p.dead || r.ended) return;
  const data = {
    v: 1, savedAt: Date.now(), charId: r.charId, stageNum: r.stageNum, stagesCleared: r.stagesCleared, time: r.time, coins: r.coins,
    stats: r.stats, killsThisRun: (G.save.stats.kills || 0) - r.kills0,
    level: p.level, xp: p.xp, pendingLevelUps: p.pendingLevelUps, items: p.items, itemOrder: p.itemOrder, upgrades: p.upgrades,
    tomes: p.tomes, weapons: p.weapons, weaponOrder: p.weaponOrder,
    infusionHp: p.infusionHp, eaterDmg: p.eaterDmg || 0, chestsOpened: r.chestsOpened || 0, devilMarks: r.devilMarks || 0,
    stage: captureStage(),
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (_) {}
}

/** Everything about the current stage needed to put it back exactly as it is now. */
function captureStage() {
  const r = G.run, p = G.player, w = G.world, d = G.director;
  if (!w || !r.stage) return null;
  if (r.inShop) {
    const o = r.shopOffer;
    return {
      shop: true,
      offer: o && {
        items: o.items.map((x) => ({ id: x.id, price: x.price, sold: x.sold })),
        mythics: o.mythics.map((x) => ({ id: x.id, price: x.price, sold: x.sold })),
        boughtItems: o.boughtItems, boughtMythics: o.boughtMythics,
      },
    };
  }
  const dir = {};
  if (d) {
    for (const k in d) if (typeof d[k] === 'number' || typeof d[k] === 'boolean') dir[k] = d[k];
    dir.events = [...d.events];
  }
  const base = w.baseInteractables ?? w.interactables.length;
  return {
    seed: r.stageSeed, stageId: r.stage.id, stageTime: r.stageTime || 0, dir,
    bossCount: r.bossCount || 1, bossDead: !!r.bossDead, finalSpawnT: r.finalSpawnT || 0, bossSpawned: !!r.bossSpawned,
    portal: { state: w.portal.state, charge: w.portal.charge || 0 },
    its: w.interactables.slice(0, base).map((it) => [it.kind, it.used ? 1 : 0, it.state === 'charging' ? 1 : 0, +(it.charge || 0).toFixed(4), it.woke ? 1 : 0, it.quarter || 0]),
    drops: w.interactables.slice(base).filter((it) => it.kind === 'chest' && !it.used).map((it) => ({ x: it.pos.x, y: it.pos.y, z: it.pos.z, tier: it.tier, free: !!it.free })),
    hp: p.hp, pos: [p.pos.x, p.pos.y, p.pos.z], yaw: p.camYaw,
  };
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
  const tomes = {};
  for (const id in d.tomes || {}) if (TOME_BY_ID[id] && d.tomes[id].level > 0) tomes[id] = { level: d.tomes[id].level | 0, value: +d.tomes[id].value || 0 };
  d.tomes = tomes;
  return d;
}

export function clearRun() {
  try {
    localStorage.removeItem(KEY);
  } catch (_) {}
}
