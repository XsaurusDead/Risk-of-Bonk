// Megabonk-style spawn director.
//
// Every stage has a 10 minute clock:
//   * a steady trickle of enemies whose population grows each minute,
//   * HUGE waves at 3:00 and 6:00,
//   * a Champion mini-boss at 5:00 and 8:00,
//   * after 10:00 OVERTIME: relentless waves (incl. Overtime Reapers) that get
//     stronger every 30 seconds you stay. Leave through the portal to escape.
// Enemy strength still follows the run's exponential difficulty curve.
import * as THREE from 'three';
import { G } from '../core/state.js';
import { ENEMIES, ELITES } from '../data/enemies.js';
import { spawnEnemy, aliveCount } from './enemies.js';
import { weightedPick, rand, pick } from '../core/util.js';
import { sfx } from '../core/audio.js';
import { shake } from './fx.js';
import { track } from '../core/save.js';

export const STAGE_TIME = 600;
const _v = new THREE.Vector3();

export class Director {
  constructor(stage) {
    this.stage = stage;
    this.t = 0;
    this.trickleT = 2;
    this.events = new Set();
    this.otWaveT = 0;
    this.final = !!stage.final;
  }

  get cap() {
    const base = G.quality === 'low' ? 55 : 100;
    return this.t > STAGE_TIME ? base + 20 : base;
  }

  /** Overtime multiplier for new spawns: x1.35 every 30 seconds past 10:00. */
  get otMult() {
    return this.t > STAGE_TIME ? Math.pow(1.35, (this.t - STAGE_TIME) / 30) : 1;
  }

  update(dt) {
    const run = G.run;
    this.t += dt;
    run.stageTime = this.t;
    const min = this.t / 60;

    // --- scripted events (not on the final arena, which has its own boss)
    if (!this.final) {
      this.event(175, 'warn3', () => G.ui?.banner('HUGE WAVE INCOMING', 'Get ready…', true));
      this.event(180, 'wave3', () => this.hugeWave());
      this.event(295, 'warn5', () => G.ui?.banner('A CHAMPION APPROACHES', 'A mini-boss is coming for you', true));
      this.event(300, 'mini5', () => this.champion());
      this.event(355, 'warn6', () => G.ui?.banner('HUGE WAVE INCOMING', 'Even bigger this time…', true));
      this.event(360, 'wave6', () => this.hugeWave(1.4));
      this.event(475, 'warn8', () => G.ui?.banner('A CHAMPION APPROACHES', 'This one is angrier', true));
      this.event(480, 'mini8', () => this.champion(true));
      this.event(STAGE_TIME, 'ot', () => {
        G.ui?.banner('OVERTIME', 'Enemies grow stronger every 30 seconds — reach the portal!', true);
        sfx('roar');
        shake(0.6);
        track('overtimes');
      });
    }

    // --- steady trickle: target population grows each minute
    const target = Math.min(this.cap, 10 + min * 7 + run.stagesCleared * 4 + run.loop * 10);
    this.trickleT -= dt;
    if (this.trickleT <= 0) {
      this.trickleT = rand(0.7, 1.3);
      const alive = aliveCount();
      if (alive < target) this.spawnGroup(Math.min(target - alive, 1 + Math.floor(min / 3) + Math.floor(Math.random() * 3)));
    }

    // --- overtime waves
    if (this.t > STAGE_TIME && !this.final) {
      this.otWaveT -= dt;
      if (this.otWaveT <= 0) {
        this.otWaveT = 4;
        const ot = (this.t - STAGE_TIME) / 60;
        const n = Math.min(this.cap - aliveCount(), 3 + Math.floor(ot * 3));
        const center = this.spawnCenter(11, 20);
        if (center) for (let i = 0; i < n; i++) spawnEnemy('reaper', this.jitter(center, 5), { otMult: this.otMult });
        if (Math.random() < 0.5) this.spawnGroup(4, { otMult: this.otMult, elite: true });
      }
    }
  }

  event(at, key, fn) {
    if (this.t >= at && !this.events.has(key)) {
      this.events.add(key);
      fn();
    }
  }

  spawnCenter(minD = 26, maxD = 50, flyer = false) {
    const p = G.player, w = G.world;
    for (let k = 0; k < 14; k++) {
      const a = Math.random() * Math.PI * 2;
      const d = rand(minD, maxD);
      const x = p.pos.x + Math.cos(a) * d, z = p.pos.z + Math.sin(a) * d;
      if (Math.abs(x) > w.half - 10 || Math.abs(z) > w.half - 10) continue;
      if (!flyer && w.heightAt(x, z) < w.liquidLevel + 0.3) continue;
      return _v.set(x, 0, z).clone();
    }
    return null;
  }
  jitter(c, r) {
    return c.clone().add(new THREE.Vector3(rand(-r, r), 0, rand(-r, r)));
  }

  spawnGroup(count, o = {}) {
    if (count <= 0) return;
    const run = G.run;
    const id = weightedPick(this.stage.enemies);
    const def = ENEMIES[id];
    if (!def) return;
    const flyer = def.ai === 'flyer' || def.ai === 'swooper';
    // close to the player so standing still gets you surrounded
    const center = this.spawnCenter(13, 24, flyer);
    if (!center) return;
    const eliteChance = Math.min(0.4, 0.02 + (run.diff - 1) * 0.05 + (this.t > STAGE_TIME ? 0.15 : 0));
    for (let i = 0; i < count; i++) {
      const elite = (o.elite || run.diff > 1.5) && Math.random() < eliteChance ? pick(Object.keys(ELITES)) : null;
      spawnEnemy(id, this.jitter(center, 4), { elite, otMult: o.otMult || this.otMult });
    }
  }

  /** Massive swarm from several directions around the player. */
  hugeWave(mult = 1) {
    const run = G.run;
    const total = Math.round((G.quality === 'low' ? 26 : 42) * mult + run.stagesCleared * 4);
    const room = Math.max(0, this.cap + 30 - aliveCount());
    const n = Math.min(total, room);
    const ids = Object.keys(this.stage.enemies);
    const dirs = 4;
    for (let d = 0; d < dirs; d++) {
      const a = (d / dirs) * Math.PI * 2 + Math.random();
      const p = G.player.pos;
      const c = new THREE.Vector3(p.x + Math.cos(a) * 19, 0, p.z + Math.sin(a) * 19);
      G.world.clampBounds(c);
      const id = ids[d % ids.length];
      for (let i = 0; i < Math.ceil(n / dirs); i++) spawnEnemy(id, this.jitter(c, 6), { elite: Math.random() < 0.06 ? pick(Object.keys(ELITES)) : null });
    }
    shake(0.4);
    sfx('roar');
    track('hugeWaves');
  }

  /** A huge, tanky version of the stage's toughest regular enemy. */
  champion(angry = false) {
    const ids = Object.keys(this.stage.enemies).sort((a, b) => ENEMIES[b].hp - ENEMIES[a].hp);
    const id = ids[0];
    const c = this.spawnCenter(15, 22);
    if (!c) return;
    const e = spawnEnemy(id, c, { champion: true, elite: angry ? pick(Object.keys(ELITES)) : null });
    if (e) {
      G.ui?.setBoss(e, `Champion ${ENEMIES[id].name}`);
      shake(0.5);
      sfx('roar');
    }
  }
}

// Difficulty labels shown in the HUD (RoR2-style escalating names).
export const DIFF_LABELS = [
  { at: 1, name: 'Easy', color: '#5fd46a' },
  { at: 1.6, name: 'Medium', color: '#c8e04a' },
  { at: 2.4, name: 'Hard', color: '#ffd23c' },
  { at: 3.5, name: 'Very Hard', color: '#ff9a3c' },
  { at: 5, name: 'Insane', color: '#ff5a3a' },
  { at: 7.5, name: 'Impossible', color: '#ff2a55' },
  { at: 11, name: 'I SEE YOU', color: '#d0308a' },
  { at: 16, name: "I'M COMING FOR YOU", color: '#a020c0' },
  { at: 24, name: 'HAHAHAHAHA', color: '#6a10ff' },
];
export function diffLabel(d) {
  let cur = DIFF_LABELS[0];
  for (const l of DIFF_LABELS) if (d >= l.at) cur = l;
  return cur;
}
