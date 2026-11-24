// Dependency-free helpers shared by item definitions and the player's stat code.
export const hyper = (x, n) => 1 - 1 / (1 + x * n); // hyperbolic stacking (never reaches 100%)

/** Apply a plain stat-mod object (per stack) to the stat accumulator. */
export function applyModsObj(m, o, n) {
  for (const k in o) {
    const v = o[k];
    if (k === 'cdr') m.cdr *= Math.pow(1 - v, n);
    else if (k === 'ultCdr') m.ultCdr *= Math.pow(1 - v, n);
    else if (k === 'dmgTaken') m.dmgTakenMult *= Math.pow(1 - v, n);
    else if (k === 'dodge') m.dodge = 1 - (1 - m.dodge) * (1 - hyper(v, n));
    else if (k === 'chestDiscount') m.chestDiscount = 1 - (1 - m.chestDiscount) * Math.pow(1 - v, n);
    else if (k === 'execute') m.execute = Math.max(m.execute, Math.min(0.3, v + 0.03 * (n - 1)));
    else if (typeof v === 'boolean') m[k] = v;
    else m[k] += v * n;
  }
}

