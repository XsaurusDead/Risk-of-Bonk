// Local leaderboard: the best runs on this device, stored in the save (localStorage).
// A run is recorded when it ends (death, victory or abandoning it); Save & Quit doesn't
// end a run, so it isn't recorded until the resumed run finishes.
import { G } from './state.js';
import { persist, selectedCostume } from './save.js';
import { submitRun } from './online.js';

export const LB_SIZE = 25;

/**
 * The board is ranked by KILLS (more kills = higher place). This score only breaks ties
 * between runs with the same number of kills: progress, level and time survived.
 */
export function runScore(s) {
  return Math.round(
    (s.stagesCleared || 0) * 1000 + (s.victory ? 5000 : 0) + (s.kills || 0) + (s.level || 1) * 20 + Math.floor((s.time || 0) / 60) * 15,
  );
}

/** Ranking: kills first, then the tie-break score, then the newer run. */
export function compareRuns(a, b) {
  return (b.kills || 0) - (a.kills || 0) || (b.score || 0) - (a.score || 0) || b.date - a.date;
}

export function leaderboard() {
  if (!Array.isArray(G.save?.leaderboard)) G.save.leaderboard = [];
  G.save.leaderboard.sort(compareRuns); // older saves were ranked by score
  return G.save.leaderboard;
}

/** Add a finished run; returns its rank (1-based) or 0 if it didn't make the list. */
export function recordRun(s, reason = 'death') {
  if (!G.save || !s) return 0;
  if ((s.time || 0) < 20 && !s.stagesCleared) return 0;
  const list = leaderboard();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    date: Date.now(),
    charId: s.charId,
    costume: selectedCostume(s.charId),
    score: runScore(s),
    stage: s.stage,
    stagesCleared: s.stagesCleared,
    time: Math.round(s.time || 0),
    level: s.level,
    kills: s.kills,
    items: (s.items || []).reduce((a, [, n]) => a + n, 0),
    victory: !!s.victory,
    reason,
  };
  // the global board gets every recorded run (it keeps each player's best)
  s.lbOnline = submitRun({ ...entry });
  list.push(entry);
  list.sort(compareRuns);
  list.length = Math.min(list.length, LB_SIZE);
  persist();
  const rank = list.indexOf(entry) + 1;
  return rank;
}
