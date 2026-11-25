// Animated GLB models for enemies / bosses (assets/models/game/*.glb).
//
// spawnEnemy() is synchronous, so models are loaded ahead of time (stage start preloads the
// stage boss). If a model isn't ready yet, the enemy falls back to its procedural model.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { posedBox } from './charmodels.js';

const D = 'assets/models/game/';

/**
 * height: model height in metres (matches the enemy's `height` so hitboxes/HP bars line up)
 * anims: game state -> clip name. `speed` scales a clip's playback.
 */
export const ENEMY_MODELS = {
  blackhorn: {
    url: D + 'blackhorn.glb', height: 6.5,
    anims: { idle: 'idle', walk: 'walk', run: 'run', roar: 'roar', leap: 'leap', crouch: 'crouch' },
    speed: { run: 1.15, walk: 1.1 },
  },
};

const templates = {};
const loading = {};
const loader = new GLTFLoader();

export function loadEnemyModel(key) {
  const def = ENEMY_MODELS[key];
  if (!def) return Promise.resolve(false);
  if (templates[key]) return Promise.resolve(true);
  loading[key] ||= loader.loadAsync(def.url).then((g) => {
    const box = posedBox(g.scene, g.animations.find((c) => c.name === def.anims.idle));
    templates[key] = { scene: g.scene, clips: g.animations, height: box.max.y - box.min.y, minY: box.min.y };
    return true;
  }).catch((e) => {
    console.warn('[enemymodels] could not load', def.url, e?.message);
    return false;
  });
  return loading[key];
}

export const hasEnemyModel = (key) => !!templates[key];

/**
 * A fresh animated instance: { group, mat, anim }. The group's origin is at the feet and
 * it's `height` metres tall (before the enemy's own scale).
 */
export function buildEnemyModel(key, height) {
  const def = ENEMY_MODELS[key], t = templates[key];
  if (!def || !t) return null;
  const inner = cloneSkinned(t.scene);
  const k = (height || def.height) / t.height;
  inner.scale.setScalar(k);
  inner.position.y = -t.minY * k;
  // one material per instance so hit flashes / elite tints don't leak to other copies
  let mat = null;
  inner.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.frustumCulled = false; // skinned: the bind-pose bounds don't follow the animation
    const src = Array.isArray(o.material) ? o.material[0] : o.material;
    mat ||= src.clone();
    if (!mat.emissive) mat.emissive = new THREE.Color(0);
    o.material = mat;
  });
  const group = new THREE.Group();
  group.add(inner);
  const mixer = new THREE.AnimationMixer(inner);
  const actions = {};
  for (const [state, name] of Object.entries(def.anims)) {
    const clip = t.clips.find((c) => c.name === name);
    if (clip) actions[state] = mixer.clipAction(clip);
  }
  return { group, mat, anim: { mixer, actions, cur: null, speed: def.speed || {} } };
}

/** Cross-fade to `state` (no-op if it's already playing). `once` plays it a single time. */
export function playAnim(anim, state, { fade = 0.2, timeScale = 1, once = false, restart = false } = {}) {
  const a = anim.actions[state] || anim.actions.idle;
  if (!a) return;
  a.timeScale = timeScale * (anim.speed[state] || 1);
  if (anim.cur === a && !restart) return;
  a.reset();
  a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
  a.clampWhenFinished = once;
  a.enabled = true;
  if (anim.cur && anim.cur !== a) a.crossFadeFrom(anim.cur, fade, false);
  a.play();
  anim.cur = a;
}
