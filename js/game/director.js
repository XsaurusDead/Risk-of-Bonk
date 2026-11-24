// The Director spends "credits" that accrue over time to spawn waves of
// enemies around the player. Credit income scales with the exponential
// difficulty curve, so the longer you take, the nastier it gets.
import * as THREE from 'three';
import { G } from '../core/state.js';
import { ENEMIES, ELITES } from '../data/enemies.js';
import { spawnEnemy, aliveCount } from './enemies.js';
import { weightedPick, rand, pick } from '../core/util.js';

const _v = new THREE.Vector3();

export class Director {
  constructor(stage) {
    this.stage = stage;
    this.credits = 45 + G.run.stagesCleared * 15;
    this.waveT = 2.5;
  }

  get cap() {
    return G.quality === 'low' ? 45 : 75;
  }

  update(dt) {
    const run = G.run;
    const charging = G.world.portal.state === 'charging';
    const rate = (2.4 + run.stagesCleared * 0.5) * Math.pow(run.diff, 0.6) * (charging ? 1.8 : 1);
    this.credits += rate * dt;
    this.waveT -= dt;
    if (this.waveT <= 0) {
      this.waveT = charging ? rand(2.5, 4.5) : rand(3.5, 6.5);
      this.spawnWave();
    }
  }

  spawnWave() {
    const run = G.run;
    const alive = aliveCount();
    if (alive >= this.cap) return;
    const id = weightedPick(this.stage.enemies);
    const def = ENEMIES[id];
    if (!def) return;
    let cost = def.cost;
    let elite = null;
    const eliteChance = Math.min(0.45, 0.04 + (run.diff - 1) * 0.06);
    if (run.diff > 1.6 && this.credits > cost * 8 && Math.random() < eliteChance) {
      elite = pick(Object.keys(ELITES));
      cost *= 4;
    }
    const count = Math.min(Math.floor(this.credits / cost), elite ? 3 : 8, this.cap - alive);
    if (count <= 0) return;
    const p = G.player;
    const w = G.world;
    // spawn the group somewhere around the player, off to the side
    let center = null;
    for (let k = 0; k < 12 && !center; k++) {
      const a = Math.random() * Math.PI * 2;
      const d = rand(26, 50);
      const x = p.pos.x + Math.cos(a) * d, z = p.pos.z + Math.sin(a) * d;
      if (Math.abs(x) > w.half - 8 || Math.abs(z) > w.half - 8) continue;
      if (w.heightAt(x, z) < w.liquidLevel + 0.3 && !(def.ai === 'flyer' || def.ai === 'swooper')) continue;
      center = _v.set(x, 0, z);
    }
    if (!center) return;
    for (let i = 0; i < count; i++) {
      const pos = center.clone().add(new THREE.Vector3(rand(-4, 4), 0, rand(-4, 4)));
      spawnEnemy(id, pos, { elite });
    }
    this.credits -= count * cost;
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
