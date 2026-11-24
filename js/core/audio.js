// Sound effects via WebAudio: recorded samples from assets/sfx/ (picked from the
// "400 Sounds Pack" and "96 Extra SFX" packs) with tiny procedural synth sounds as
// the fallback (while samples load, and for sounds without a sample: laser, zap).
import { G } from './state.js';

let ctx = null;
let master = null;
let noiseBuf = null;
const lastPlay = {};

function ensure() {
  if (ctx) return true;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    loadSamples();
    return true;
  } catch (e) {
    return false;
  }
}

export function getAudioContext() {
  return ensure() ? ctx : null;
}

export function unlockAudio() {
  if (!ensure()) return;
  if (ctx.state === 'suspended') ctx.resume();
}

function vol() {
  return G.save?.settings.volume ?? 0.7;
}

function tone({ type = 'square', f0 = 440, f1 = f0, dur = 0.1, gain = 0.3, delay = 0 }) {
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
  g.gain.setValueAtTime(gain * vol(), t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise({ dur = 0.2, gain = 0.3, freq = 1200, q = 1, type = 'lowpass', delay = 0 }) {
  const t = ctx.currentTime + delay;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain * vol(), t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.02);
}

const SFX = {
  shoot: () => tone({ type: 'square', f0: 900, f1: 300, dur: 0.06, gain: 0.08 }),
  laser: () => tone({ type: 'sawtooth', f0: 1400, f1: 200, dur: 0.25, gain: 0.12 }),
  swing: () => noise({ dur: 0.12, gain: 0.25, freq: 900, type: 'bandpass', q: 2 }),
  hit: () => tone({ type: 'triangle', f0: 300, f1: 120, dur: 0.05, gain: 0.1 }),
  crit: () => tone({ type: 'square', f0: 1200, f1: 600, dur: 0.07, gain: 0.08 }),
  boom: () => {
    noise({ dur: 0.45, gain: 0.5, freq: 500 });
    tone({ type: 'sine', f0: 120, f1: 40, dur: 0.4, gain: 0.4 });
  },
  bigboom: () => {
    noise({ dur: 1.2, gain: 0.7, freq: 300 });
    tone({ type: 'sine', f0: 90, f1: 25, dur: 1.1, gain: 0.6 });
  },
  coin: () => {
    tone({ type: 'square', f0: 1300, f1: 1300, dur: 0.05, gain: 0.05 });
    tone({ type: 'square', f0: 1750, f1: 1750, dur: 0.08, gain: 0.05, delay: 0.05 });
  },
  xp: () => tone({ type: 'sine', f0: 700 + Math.random() * 300, f1: 1400, dur: 0.06, gain: 0.05 }),
  item: () => {
    [523, 659, 784, 1046].forEach((f, i) => tone({ type: 'triangle', f0: f, dur: 0.15, gain: 0.15, delay: i * 0.06 }));
  },
  legendary: () => {
    [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone({ type: 'square', f0: f, dur: 0.25, gain: 0.1, delay: i * 0.07 }));
  },
  levelup: () => {
    [440, 554, 659, 880].forEach((f, i) => tone({ type: 'square', f0: f, dur: 0.18, gain: 0.1, delay: i * 0.08 }));
  },
  chest: () => {
    noise({ dur: 0.2, gain: 0.2, freq: 2000, type: 'highpass' });
    tone({ type: 'triangle', f0: 300, f1: 900, dur: 0.25, gain: 0.15 });
  },
  deny: () => tone({ type: 'square', f0: 180, f1: 140, dur: 0.15, gain: 0.12 }),
  hurt: () => {
    tone({ type: 'sawtooth', f0: 220, f1: 80, dur: 0.15, gain: 0.2 });
  },
  dash: () => noise({ dur: 0.25, gain: 0.25, freq: 1800, type: 'bandpass', q: 0.7 }),
  jump: () => tone({ type: 'sine', f0: 300, f1: 600, dur: 0.1, gain: 0.08 }),
  freeze: () => tone({ type: 'sine', f0: 2000, f1: 900, dur: 0.3, gain: 0.08 }),
  zap: () => noise({ dur: 0.1, gain: 0.2, freq: 3500, type: 'highpass' }),
  roar: () => {
    tone({ type: 'sawtooth', f0: 90, f1: 50, dur: 1.2, gain: 0.35 });
    noise({ dur: 1.0, gain: 0.3, freq: 400 });
  },
  portal: () => {
    [262, 330, 392, 523, 659].forEach((f, i) => tone({ type: 'sine', f0: f, f1: f * 2, dur: 0.6, gain: 0.12, delay: i * 0.1 }));
  },
  tick: () => tone({ type: 'square', f0: 2200, f1: 1800, dur: 0.025, gain: 0.06 }),
  ui: () => tone({ type: 'triangle', f0: 660, dur: 0.05, gain: 0.08 }),
  achievement: () => {
    [659, 784, 988, 1318].forEach((f, i) => tone({ type: 'triangle', f0: f, dur: 0.3, gain: 0.14, delay: i * 0.1 }));
  },
  death: () => {
    tone({ type: 'sawtooth', f0: 400, f1: 40, dur: 1.5, gain: 0.3 });
  },
};

// ------------------------------------------------------------------ samples
// name -> [files (a random one plays), gain, pitch variation]
const SAMPLES = {
  shoot: [['shoot'], 0.35, 0.1],
  swing: [['swing_1', 'swing_2', 'swing_3'], 0.5, 0.1],
  hit: [['hit_1', 'hit_2', 'hit_3'], 0.45, 0.12],
  crit: [['crit'], 0.5, 0.1],
  boom: [['boom_1', 'boom_2'], 0.6, 0.1],
  bigboom: [['bigboom_1', 'bigboom_2'], 0.8, 0.06],
  coin: [['coin_1', 'coin_2'], 0.32, 0.08],
  xp: [['xp_1', 'xp_2'], 0.25, 0.15],
  item: [['item_1', 'item_2'], 0.7, 0.04],
  upgrade: [['upgrade'], 0.7, 0],
  legendary: [['legendary'], 0.9, 0],
  levelup: [['levelup'], 0.7, 0],
  chest: [['chest'], 0.8, 0.04],
  deny: [['deny'], 0.5, 0],
  hurt: [['hurt_1', 'hurt_2'], 0.6, 0.1],
  dash: [['dash'], 0.5, 0.08],
  jump: [['jump'], 0.35, 0.08],
  freeze: [['freeze_1', 'freeze_2'], 0.5, 0.08],
  roar: [['roar'], 0.9, 0.05],
  portal: [['portal'], 0.6, 0],
  tick: [['tick'], 0.5, 0.12],
  ui: [['ui'], 0.5, 0.05],
  achievement: [['achievement'], 0.7, 0],
  death: [['death'], 0.9, 0],
};
const buffers = {};
let samplesRequested = false;

function loadSamples() {
  if (samplesRequested || !ctx) return;
  samplesRequested = true;
  const files = new Set(Object.values(SAMPLES).flatMap((s) => s[0]));
  for (const f of files) {
    fetch(`assets/sfx/${f}.mp3`)
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
      .then((b) => new Promise((res, rej) => ctx.decodeAudioData(b, res, rej)))
      .then((buf) => { buffers[f] = buf; })
      .catch(() => {}); // the synth version keeps playing for this one
  }
}

function playSample(name) {
  const s = SAMPLES[name];
  if (!s) return false;
  const ready = s[0].filter((f) => buffers[f]);
  if (!ready.length) return false;
  const src = ctx.createBufferSource();
  src.buffer = buffers[ready[Math.floor(Math.random() * ready.length)]];
  if (s[2]) src.playbackRate.value = 1 + (Math.random() - 0.5) * 2 * s[2];
  const g = ctx.createGain();
  g.gain.value = s[1] * 2 * vol();
  src.connect(g).connect(master);
  src.start();
  return true;
}

export function sfx(name, minGap = 0.03) {
  if (!ctx || vol() <= 0) return;
  const now = ctx.currentTime;
  if (lastPlay[name] && now - lastPlay[name] < minGap) return;
  lastPlay[name] = now;
  if (playSample(name)) return;
  const f = SFX[name];
  if (f) {
    try {
      f();
    } catch (_) {}
  }
}
