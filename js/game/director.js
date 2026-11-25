// Megabonk-style spawn director.
//
// Every stage has a 10 minute clock:
//   * a steady trickle of enemies whose population grows each minute,
//   * HUGE waves at 3:00 and 6:00: for one minute enemies pour in, in big groups, much faster,
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
    this.surgeUntil = 0;
    this.surgeT = 0;
    this.surgeMult = 1;
  }

  get cap() {
    const base = G.quality === 'low' ? 75 : 140;
    return this.t > STAGE_TIME ? base + (G.quality === 'low' ? 35 : 60) : base;
  }

  /** Seconds spent in overtime (past 10:00). */
  get otT() {
    return Math.max(0, this.t - STAGE_TIME);
  }

  /**
   * Overtime strength multiplier for new spawns (HP and damage), growing exponentially:
   *   0:00-1:00  doubles every 30 s   (x4 at 1:00)
   *   1:00-3:00  doubles every 12 s   (x4096 at 3:00)
   *   3:00+      doubles every 4 s    -- only a ridiculously strong build survives
   */
  get otMult() {
    const o = this.otT;
    if (o <= 0) return 1;
    if (o < 60) return Math.pow(2, o / 30);
    if (o < 180) return 4 * Math.pow(2, (o - 60) / 12);
    return 4096 * Math.pow(2, Math.min(o - 180, 240) / 4);
  }

  /** Overtime ghosts fly faster and faster. */
  get otSpeed() {
    const o = this.otT;
    if (o < 60) return 1 + o / 120;
    if (o < 180) return 1.5 + (o - 60) / 120;
    return Math.min(4, 2.5 + (o - 180) / 60);
  }

  update(dt) {
    const run = G.run;
    this.t += dt;
    run.stageTime = this.t;
    const min = this.t / 60;

    // --- scripted events (not on the final arena, which has its own boss)
    if (!this.final) {
      this.event(175, 'warn3', () => G.ui?.banner('HUGE WAVE INCOMING', 'Get ready…', true));
      this.event(180, 'wave3', () => this.startSurge(1));
      this.event(295, 'warn5', () => G.ui?.banner('A CHAMPION APPROACHES', 'A mini-boss is coming for you', true));
      this.event(300, 'mini5', () => this.champion());
      this.event(355, 'warn6', () => G.ui?.banner('HUGE WAVE INCOMING', 'Even bigger this time…', true));
      this.event(360, 'wave6', () => this.startSurge(1.4));
      this.event(475, 'warn8', () => G.ui?.banner('A CHAMPION APPROACHES', 'This one is angrier', true));
      this.event(480, 'mini8', () => this.champion(true));
      this.event(STAGE_TIME, 'ot', () => {
        G.ui?.banner('OVERTIME', 'The dead are coming for you — reach the portal!', true);
        sfx('roar');
        shake(0.6);
        track('overtimes');
      });
      this.event(STAGE_TIME + 60, 'ot2', () => {
        G.ui?.banner('OVERTIME II', 'They double in strength every 12 seconds', true);
        sfx('roar');
        shake(0.8);
      });
      this.event(STAGE_TIME + 180, 'ot3', () => {
        G.ui?.banner('OVERTIME III', 'RUN.', true);
        sfx('roar');
        shake(1.2);
      });
    }

    // --- steady trickle: target population grows each minute
    const target = Math.min(this.cap, 4 + min * 9 + run.stagesCleared * 6 + run.loop * 12);
    this.trickleT -= dt;
    if (this.trickleT <= 0) {
      this.trickleT = rand(0.6, 1.05) / (1 + run.stagesCleared * 0.08);
      const alive = aliveCount();
      if (alive < target) this.spawnGroup(Math.min(target - alive, 2 + Math.floor(min / 2.5) + Math.floor(run.stagesCleared * 0.7) + Math.floor(Math.random() * 3)));
    }

    // --- huge wave: one minute of big groups arriving fast from all sides
    if (this.t < this.surgeUntil) {
      this.surgeT -= dt;
      if (this.surgeT <= 0) {
        this.surgeT = rand(0.35, 0.6) / this.surgeMult;
        const room = this.cap + 45 - aliveCount();
        const size = Math.round((5 + min * 0.7 + run.stagesCleared * 1.2) * this.surgeMult + Math.random() * 3);
        if (room > 0) this.spawnGroup(Math.min(room, size), { far: true });
      }
      if (this.t + dt >= this.surgeUntil) G.ui?.banner('Wave survived', 'The swarm thins out… for now');
    }

    // --- overtime: waves of homing ghosts from every side, faster and bigger each phase
    if (this.t > STAGE_TIME && !this.final) {
      const o = this.otT;
      this.otWaveT -= dt;
      if (this.otWaveT <= 0) {
        this.otWaveT = o < 60 ? 2.5 : o < 180 ? 1.0 : 0.35;
        const want = o < 60 ? 3 + o / 15 : o < 180 ? 6 + (o - 60) / 10 : 14 + (o - 180) / 3;
        const n = Math.min(this.cap - aliveCount(), Math.floor(want));
        const p = G.player.pos;
        const opts = { otMult: this.otMult };
        for (let i = 0; i < n; i++) {
          const a = Math.random() * Math.PI * 2, d = rand(18, 28);
          const pos = new THREE.Vector3(p.x + Math.cos(a) * d, 0, p.z + Math.sin(a) * d);
          G.world.clampBounds(pos);
          const e = spawnEnemy('reaper', pos, opts);
          if (e) {
            e.pos.y = p.y + rand(2, 8); // they come in from the air
            e.otSpeed = this.otSpeed;
          }
        }
        const room = this.cap - aliveCount();
        if (room > 0 && Math.random() < (o < 60 ? 0.4 : 0.7)) this.spawnGroup(Math.min(room, o < 60 ? 4 : 7), { otMult: this.otMult, elite: true });
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
    const center = o.far ? this.spawnCenter(16, 30, flyer) : this.spawnCenter(13, 24, flyer);
    if (!center) return;
    // elites are rare: ~2.5% of spawns at the start, slowly rising to 12% (+6% in overtime)
    const eliteChance = Math.min(0.12, 0.025 + (run.diff - 1) * 0.02) + (this.t > STAGE_TIME ? 0.06 : 0);
    for (let i = 0; i < count; i++) {
      const elite = Math.random() < (o.elite ? eliteChance * 2 : eliteChance) ? pick(Object.keys(ELITES)) : null;
      spawnEnemy(id, this.jitter(center, 4), { elite, otMult: o.otMult || this.otMult });
    }
  }

  /** Huge wave: an opening burst, then one minute of fast group spawns. */
  startSurge(mult = 1) {
    this.hugeWave(0.6 * mult);
    this.surgeUntil = this.t + 60;
    this.surgeT = 1;
    this.surgeMult = mult;
    G.ui?.banner('HUGE WAVE', 'Survive the next 60 seconds!', true);
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
      for (let i = 0; i < Math.ceil(n / dirs); i++) spawnEnemy(id, this.jitter(c, 6), { elite: Math.random() < 0.03 ? pick(Object.keys(ELITES)) : null });
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
  { at: 1.35, name: 'Medium', color: '#c8e04a' },
  { at: 1.9, name: 'Hard', color: '#ffd23c' },
  { at: 2.7, name: 'Very Hard', color: '#ff9a3c' },
  { at: 3.8, name: 'Insane', color: '#ff5a3a' },
  { at: 5.5, name: 'Impossible', color: '#ff2a55' },
  { at: 8, name: 'I SEE YOU', color: '#d0308a' },
  { at: 12, name: "I'M COMING FOR YOU", color: '#a020c0' },
  { at: 18, name: 'HAHAHAHAHA', color: '#6a10ff' },
];
export function diffLabel(d) {
  let cur = DIFF_LABELS[0];
  for (const l of DIFF_LABELS) if (d >= l.at) cur = l;
  return cur;
}
