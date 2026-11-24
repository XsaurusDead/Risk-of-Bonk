// Global leaderboard client (Supabase RPC over plain fetch — no SDK needed).
// The username + a secret token live in the save; finished runs are queued in the save
// and sent when the server is reachable, so nothing is lost when you play offline.
import { G } from './state.js';
import { persist } from './save.js';
import { ONLINE } from '../config/online.js';

export const NAME_MIN = 3;
export const NAME_MAX = 16;
const NAME_RE = /^[A-Za-z0-9ÄÖÜäöüß_.-][A-Za-z0-9ÄÖÜäöüß_. -]{1,14}[A-Za-z0-9ÄÖÜäöüß_.-]$/;
const QUEUE_MAX = 20;

export const onlineEnabled = () => !!(ONLINE.url && ONLINE.key);

export function profile() {
  if (!G.save.profile || typeof G.save.profile !== 'object') G.save.profile = { name: '' };
  return G.save.profile;
}
export const playerName = () => profile().name || '';
/** True when the player still has to pick a username (first start, or their name got taken). */
export const needsName = () => !profile().name || !!profile().nameTaken;

export function cleanName(name) {
  return String(name || '').trim().replace(/\s+/g, ' ');
}
/** Returns an error message, or '' when the name is fine. */
export function nameError(name) {
  const n = cleanName(name);
  if (n.length < NAME_MIN) return `At least ${NAME_MIN} characters.`;
  if (n.length > NAME_MAX) return `At most ${NAME_MAX} characters.`;
  if (!NAME_RE.test(n)) return 'Only letters, numbers, spaces and _ . - (no space at the start or end).';
  return '';
}

class RpcError extends Error {
  constructor(msg, code, status) {
    super(msg);
    this.code = code;
    this.status = status;
  }
}

async function rpc(fn, args) {
  const headers = { 'Content-Type': 'application/json', apikey: ONLINE.key };
  if (ONLINE.key.startsWith('eyJ')) headers.Authorization = 'Bearer ' + ONLINE.key; // legacy JWT anon key
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 10000);
  try {
    const res = await fetch(ONLINE.url.replace(/\/+$/, '') + '/rest/v1/rpc/' + fn, { method: 'POST', headers, body: JSON.stringify(args), signal: ctl.signal });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (_) {}
    if (!res.ok) throw new RpcError(data?.message || `HTTP ${res.status}`, data?.code || '', res.status);
    return data;
  } catch (e) {
    if (e instanceof RpcError) throw e;
    throw new RpcError('offline', 'offline', 0); // network error, CORS, timeout...
  } finally {
    clearTimeout(timer);
  }
}

const TAKEN = 'That name is already taken — pick another one.';
function friendly(e) {
  if (e.code === '23505') return TAKEN;
  if (e.code === '23514') return 'That name is not allowed.';
  if (e.code === 'P0001') return 'Too many requests — try again in a minute.';
  return 'Could not reach the leaderboard server. Check your connection and try again.';
}

/** Register the name with the server if we haven't yet. Returns true when registered. */
async function ensureRegistered() {
  const p = profile();
  if (p.id && p.secret) return true;
  if (!p.name || p.nameTaken) return false;
  try {
    const r = await rpc('register_player', { p_name: p.name });
    p.id = r.id;
    p.secret = r.secret;
    persist();
    return true;
  } catch (e) {
    if (e.code === '23505' || e.code === '23514') {
      p.nameTaken = true; // someone else got it first: the title screen asks for a new one
      persist();
      G.ui?.askName?.();
    }
    return false;
  }
}

/**
 * Pick or change the username. Online, it must be free; offline (or no server configured)
 * the name is kept and registered later. Resolves to { ok, error?, offline? }.
 */
export async function setName(raw) {
  const name = cleanName(raw);
  const err = nameError(name);
  if (err) return { ok: false, error: err };
  const p = profile();
  if (!onlineEnabled()) {
    p.name = name;
    p.nameTaken = false;
    persist();
    return { ok: true, offline: true };
  }
  try {
    if (p.id && p.secret) {
      try {
        await rpc('rename_player', { p_player: p.id, p_secret: p.secret, p_name: name });
      } catch (e) {
        if (e.code !== '28000') throw e;
        // the server forgot us (database reset): start over with a fresh registration
        delete p.id;
        delete p.secret;
      }
    }
    if (!p.id) {
      const r = await rpc('register_player', { p_name: name });
      p.id = r.id;
      p.secret = r.secret;
    }
    p.name = name;
    p.nameTaken = false;
    persist();
    lbCache.clear();
    flushRuns();
    return { ok: true };
  } catch (e) {
    if (e.code === 'offline' && !p.id) {
      // can't check right now — keep it and try to register it with the next run
      p.name = name;
      p.nameTaken = false;
      persist();
      return { ok: true, offline: true };
    }
    return { ok: false, error: friendly(e) };
  }
}

// ------------------------------------------------------------------ runs
let flushing = null;
const waiters = new Map(); // entry id -> resolve(result)

/** Queue a finished run for the global board. Resolves to { rank, personalBest } or null. */
export function submitRun(entry) {
  if (!onlineEnabled()) return Promise.resolve(null);
  const q = (G.save.onlineQueue ||= []);
  q.push(entry);
  if (q.length > QUEUE_MAX) q.splice(0, q.length - QUEUE_MAX);
  persist();
  const done = new Promise((res) => waiters.set(entry.id, res));
  flushRuns();
  setTimeout(() => waiters.get(entry.id)?.(null), 20000); // give up waiting (it stays queued)
  return done.finally(() => waiters.delete(entry.id));
}

/** Send every queued run (oldest first). Safe to call any time. */
export function flushRuns() {
  if (!onlineEnabled() || flushing) return flushing;
  flushing = (async () => {
    const q = (G.save.onlineQueue ||= []);
    while (q.length) {
      if (!(await ensureRegistered())) break;
      const p = profile();
      const e = q[0];
      try {
        const r = await rpc('submit_run', { p_player: p.id, p_secret: p.secret, p_run: e });
        q.shift();
        persist();
        lbCache.clear();
        waiters.get(e.id)?.(r);
      } catch (err) {
        if (err.code === 'P0001') {
          // rate limit (two runs within 15 s): try again shortly
          setTimeout(flushRuns, 16000);
          break;
        }
        if (err.code === '28000') {
          delete p.id;
          delete p.secret;
          persist();
          continue; // re-register and retry
        }
        if (err.status >= 400 && err.status < 500) {
          q.shift(); // rejected as invalid: drop it, don't block the queue forever
          persist();
          waiters.get(e.id)?.(null);
          continue;
        }
        break; // offline / server error: keep it for later
      }
    }
  })().finally(() => (flushing = null));
  return flushing;
}

// ------------------------------------------------------------------ board
const lbCache = new Map(); // charId|'' -> { t, rows }

/** Top runs (best run per player). Throws a friendly Error when unreachable. */
export async function fetchGlobal(charId = null, force = false) {
  const k = charId || '';
  const hit = lbCache.get(k);
  if (!force && hit && performance.now() - hit.t < 30000) return hit.rows;
  try {
    const rows = await rpc('get_leaderboard', { p_char: charId || null, p_limit: 100 });
    lbCache.set(k, { t: performance.now(), rows: rows || [] });
    return rows || [];
  } catch (e) {
    throw new Error(friendly(e));
  }
}
