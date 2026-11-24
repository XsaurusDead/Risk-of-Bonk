// Tiny procedural sound effects via WebAudio. No asset files needed.
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
    return true;
  } catch (e) {
    return false;
  }
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

export function sfx(name, minGap = 0.03) {
  if (!ctx || vol() <= 0) return;
  const now = ctx.currentTime;
  if (lastPlay[name] && now - lastPlay[name] < minGap) return;
  lastPlay[name] = now;
  const f = SFX[name];
  if (f) {
    try {
      f();
    } catch (_) {}
  }
}
