// Per-survivor levels. Every bit of XP you collect in a run also goes to the
// character you're playing. Character levels unlock that survivor's costumes
// (through achievements), nothing else, so they never affect balance.
import { G } from './state.js';

export const MAX_CHAR_LEVEL = 30;

/** Total XP needed to reach a level (level 1 = 0). */
export function xpForCharLevel(level) {
  return Math.round(300 * Math.pow(Math.max(0, level - 1), 1.8));
}

export function charLevelFromXp(xp) {
  let l = 1;
  while (l < MAX_CHAR_LEVEL && xp >= xpForCharLevel(l + 1)) l++;
  return l;
}

export function charXp(id) {
  return G.save?.charStats?.[id]?.charXp || 0;
}

export function charLevelInfo(id) {
  const xp = charXp(id);
  const level = charLevelFromXp(xp);
  const cur = xpForCharLevel(level), next = xpForCharLevel(level + 1);
  return { level, xp, into: xp - cur, need: next - cur, max: level >= MAX_CHAR_LEVEL };
}
