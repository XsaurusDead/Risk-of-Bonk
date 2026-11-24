// Rigged / static 3D models for survivors (instead of the built-in block models).
//
// CHAR_MODELS maps a survivor id to a .glb (converted from the uploaded packs into
// assets/models/game/). Models load on demand (the one you select), are cloned per
// use (SkeletonUtils keeps skeletons working) and animated by CharAnimator:
//   * models with animation clips play idle / run / jump / attack clips,
//   * rigged models without clips swing their arm and leg bones procedurally,
//   * static models waddle, hop and lunge like little toys.
// Costumes recolour the textures in the shader. Anything that fails to load falls
// back to the block model.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { buildCharacter as buildBlockCharacter, COSTUMES } from './models.js';
import { G } from '../core/state.js';

const D = 'assets/models/game/';
export const CHAR_MODELS = {
  vanguard: { url: D + 'cop.glb', height: 2.25, swing: { legs: ['LeftLeg', 'RightLeg'], arms: ['LeftArm', 'RightArm'] } },
  bonker: { url: D + 'marauder.glb', height: 2.45, anims: { idle: 'idle', run: 'run', attack: 'attack' }, inPlace: true },
  pyra: { url: D + 'witch.glb', height: 2.25, swing: { legs: ['Hip_L', 'Hip_R'], arms: ['Shoulder_L', 'Shoulder_R'] } },
  glacia: { url: D + 'snowman.glb', height: 2.1, anims: { idle: 'idle', run: 'run', attack: 'attack' }, runScale: 2.4 },
  kestrel: {
    url: 'assets/models/fox/fox.glb', height: 2.35, hide: /^Sword/, prop: 'bow',
    anims: { idle: 'Idle', run: 'Run', jump: 'Jump', fall: 'Fall', attack: 'Attack', land: 'ToucheGround' },
  },
  tinker: {
    url: D + 'goblin.glb', height: 1.75, toy: true,
    matColors: { MaterialGoblin: 0x6fae4a, Green: 0x3f6a2a, Eye: 0xffe14a, Nose: 0x5f9a40, Metal: 0x8a9098 },
  },
  kaze: { url: D + 'cathuman.glb', height: 2.15, anims: { idle: 'idle', run: 'run' } },
  morrow: { url: D + 'skeleton.glb', height: 2.3, swing: { legs: ['thigh.L', 'thigh.R'], arms: ['upper_arm.L', 'upper_arm.R'] } },
  bulwark: { url: D + 'heavy.glb', height: 2.45, anims: { idle: 'idle', run: 'run', jump: 'jump' }, inPlace: true },
  nyx: { url: D + 'killer.glb', height: 2.3, fix: { y: -Math.PI / 2 }, toy: true },
  sol: { url: D + 'hunter.glb', height: 2.3, anims: { idle: 'idle', run: 'run', attack: 'attack' }, inPlace: true },
  vex: { url: D + 'hazmat.glb', height: 2.25, anims: { idle: 'idle', run: 'run', jump: 'jump' }, inPlace: true },
  echo: { url: D + 'vald.glb', height: 2.3, toy: true },
  grizzle: { url: D + 'dog.glb', height: 1.6, fix: { y: Math.PI }, anims: { idle: 'Dog1_Idle_Tail_Wag', run: 'Dog1_Run', attack: 'Dog1_Bark' } },
  spark: { url: D + 'baby.glb', height: 1.75, swing: { legs: ['upperleg01.L', 'upperleg01.R'], arms: ['upperarm01.L', 'upperarm01.R'] } },
  mimic: { url: D + 'bagman.glb', height: 2.3, anims: { idle: 'Idle_loop', run: 'Run_loop', attack: 'Attack' } },
};

// per-costume recolour of the model's textures
const COSTUME_LOOK = [
  null, // Classic: original colours
  { hue: 0.5, sat: 1.0, bright: 1.0 }, // Rival: opposite colours
  { hue: 0.0, sat: 0.1, bright: 1.8, tint: 0xeef8ff }, // Arctic: white
  { hue: -0.03, sat: 1.35, bright: 0.7, emissive: 0x551100 }, // Inferno
  { hue: 0.72, sat: 0.9, bright: 0.55, emissive: 0x1a0830 }, // Shadow
  { hue: 0.06, sat: 1.25, bright: 1.25, tint: 0xffe7a0 }, // Golden
];

const templates = {};
const loading = {};
const loader = new GLTFLoader();

/** Load (once) the model for a survivor. Resolves true when it's ready. */
export function loadCharModel(id) {
  const def = CHAR_MODELS[id];
  if (!def) return Promise.resolve(false);
  if (templates[id]) return Promise.resolve(true);
  if (!loading[id]) {
    loading[id] = loader.loadAsync(def.url).then((g) => {
      // orientation fix (some models are authored lying down or facing sideways)
      const fix = new THREE.Group();
      if (def.fix) fix.rotation.set(def.fix.x || 0, def.fix.y || 0, def.fix.z || 0);
      fix.add(g.scene);
      fix.updateMatrixWorld(true);
      let clips = g.animations;
      if (def.inPlace) clips = clips.map(inPlace);
      // measure in the pose the model is actually shown in (idle clip), not the rig's rest pose:
      // some rigs (Mixamo) have a rest pose far above the animated feet
      const box = posedBox(fix, clips.find((c) => c.name === def.anims?.idle));
      templates[id] = { scene: fix, clips, height: box.max.y - box.min.y, minY: box.min.y };
      return true;
    }).catch((e) => {
      console.warn('[charmodels] could not load', def.url, e?.message);
      return false;
    });
  }
  return loading[id];
}

/** Boot: the last played survivor (and the default one) so the menu shows them right away. */
export async function preloadCharacterModels() {
  const last = G.save?.lastChar;
  await Promise.all([loadCharModel(last || 'vanguard'), loadCharModel('vanguard')]);
}

export const hasCharModel = (id) => !!templates[id];

/** Bounding box of the (skinned) vertices with `clip` applied at its first frame. */
function posedBox(obj, clip) {
  let mixer = null;
  if (clip) {
    mixer = new THREE.AnimationMixer(obj);
    mixer.clipAction(clip).play();
    mixer.update(0);
  }
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3(), v = new THREE.Vector3();
  obj.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    const pos = o.geometry.attributes.position;
    if (o.isSkinnedMesh) o.skeleton.update();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      if (o.isSkinnedMesh) o.applyBoneTransform(i, v);
      box.expandByPoint(v.applyMatrix4(o.matrixWorld));
    }
  });
  if (mixer) {
    mixer.stopAllAction();
    mixer.uncacheRoot(obj);
  }
  return box.isEmpty() ? new THREE.Box3().setFromObject(obj) : box;
}

/** Mixamo-style runs move the hips forward; keep them on the spot (the game moves the player). */
function inPlace(clip) {
  const c = clip.clone();
  for (const t of c.tracks) {
    if (!/hips\.position$/i.test(t.name)) continue;
    const x0 = t.values[0], z0 = t.values[2];
    for (let i = 0; i < t.values.length; i += 3) {
      t.values[i] = x0;
      t.values[i + 2] = z0;
    }
  }
  return c;
}

/** Survivor model: the glTF one if it's loaded, otherwise the block model. */
export function buildCharacter(id, costume = 0) {
  const t = templates[id];
  if (!t) return buildBlockCharacter(id, costume);
  try {
    return buildModel(id, costume, t);
  } catch (e) {
    console.warn('[charmodels] build failed, using block model', e);
    return buildBlockCharacter(id, costume);
  }
}

function recolour(mat, look, color) {
  const m = mat.clone();
  if (color != null && m.color) m.color = new THREE.Color(color);
  if (!look) return m;
  if (look.tint && m.color) m.color.multiply(new THREE.Color(look.tint));
  if (look.emissive) m.emissive = new THREE.Color(look.emissive);
  const u = { hue: look.hue * Math.PI * 2, sat: look.sat, bright: look.bright };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uHue = { value: u.hue };
    sh.uniforms.uSat = { value: u.sat };
    sh.uniforms.uBright = { value: u.bright };
    sh.fragmentShader = 'uniform float uHue; uniform float uSat; uniform float uBright;\n' + sh.fragmentShader.replace(
      '#include <map_fragment>',
      `#include <map_fragment>
      {
        // rotate hue around the grey axis, then saturation / brightness
        vec3 c = diffuseColor.rgb;
        const vec3 k = vec3(0.57735);
        float ca = cos(uHue), sa = sin(uHue);
        c = c * ca + cross(k, c) * sa + k * dot(k, c) * (1.0 - ca);
        float l = dot(c, vec3(0.299, 0.587, 0.114));
        diffuseColor.rgb = max(mix(vec3(l), c, uSat) * uBright, 0.0);
      }`,
    );
  };
  m.customProgramCacheKey = () => `costume${look.hue}_${look.sat}_${look.bright}`;
  return m;
}

/** The bone a mesh is mostly skinned to (e.g. the hand holding the sword). */
function mainBone(mesh) {
  const idx = mesh.geometry.attributes.skinIndex, wt = mesh.geometry.attributes.skinWeight;
  if (!idx || !mesh.skeleton) return null;
  const score = new Map();
  for (let i = 0; i < idx.count; i++) {
    for (let c = 0; c < 4; c++) {
      const j = idx.getComponent(i, c), w = wt.getComponent(i, c);
      if (w > 0) score.set(j, (score.get(j) || 0) + w);
    }
  }
  let best = -1, bw = -1;
  for (const [j, w] of score) if (w > bw) { bw = w; best = j; }
  return mesh.skeleton.bones[best] || null;
}

function buildBow() {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.8 });
  const limb = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 6, 18, Math.PI * 0.95), wood);
  limb.rotation.z = Math.PI / 2 + Math.PI * 0.025;
  limb.position.x = -0.12;
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.16, 6), new THREE.MeshStandardMaterial({ color: 0x3a2410, roughness: 0.9 }));
  const string = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.82, 4), new THREE.MeshBasicMaterial({ color: 0xf2efe0 }));
  string.position.x = -0.12 - 0.02;
  g.add(limb, grip, string);
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  return g;
}

function buildCrown() {
  const g = new THREE.Group();
  const gold = new THREE.MeshStandardMaterial({ color: 0xffcc33, metalness: 0.7, roughness: 0.3, emissive: 0x332200 });
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.08, 10, 1, true), gold));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.09, 5), gold);
    c.position.set(Math.cos(a) * 0.15, 0.08, Math.sin(a) * 0.15);
    g.add(c);
  }
  return g;
}

function buildModel(id, costume, t) {
  const def = CHAR_MODELS[id];
  const model = cloneSkinned(t.scene);
  const s = def.height / t.height;
  const inner = new THREE.Group(); // scale + procedural motion
  inner.scale.setScalar(s);
  inner.position.y = -t.minY * s;
  inner.add(model);
  const root = new THREE.Group();
  root.add(inner);
  root.updateMatrixWorld(true);

  const look = COSTUME_LOOK[costume] || null;
  const mats = new Map();
  let hideMesh = null, headMesh = null, anyMesh = null;
  model.traverse((o) => {
    if (!o.isMesh) return;
    anyMesh ||= o;
    o.castShadow = true;
    o.frustumCulled = false; // skinned bounds don't follow the animation
    const conv = (mat) => {
      if (!mats.has(mat)) mats.set(mat, recolour(mat, look, def.matColors?.[mat.name]));
      return mats.get(mat);
    };
    o.material = Array.isArray(o.material) ? o.material.map(conv) : conv(o.material);
    if (def.hide && def.hide.test(o.name)) hideMesh = o;
    if (/hood|head/i.test(o.name)) headMesh = o;
  });

  // Kestrel: swap the fox's sword for a bow on the same hand bone
  let hand = null;
  if (hideMesh) {
    hand = mainBone(hideMesh);
    hideMesh.visible = false;
    if (def.prop === 'bow' && hand) {
      const geo = hideMesh.geometry;
      geo.computeBoundingBox();
      const pos = geo.attributes.position, v = new THREE.Vector3(), grip = new THREE.Vector3();
      const minY = geo.boundingBox.min.y, span = geo.boundingBox.max.y - minY;
      let n = 0;
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        if (v.y < minY + span * 0.22) { grip.add(v); n++; }
      }
      if (n) grip.divideScalar(n);
      hideMesh.localToWorld(grip);
      const bow = buildBow();
      bow.scale.setScalar(1.25 / s);
      model.add(bow);
      bow.position.copy(model.worldToLocal(grip.clone()));
      bow.position.z += 0.06 / s;
      hand.attach(bow);
    }
  }
  // Golden costume: a little crown on the head
  if (COSTUMES[costume]?.flair === 'crown') {
    const crown = buildCrown();
    crown.scale.setScalar(1.6 / s);
    const top = new THREE.Vector3(0, def.height * 0.98, 0);
    const headBone = headMesh?.isSkinnedMesh ? mainBone(headMesh) : null;
    const parent = headBone || model;
    model.add(crown);
    crown.position.copy(model.worldToLocal(root.localToWorld(top)));
    parent.attach(crown);
  }

  const anim = new CharAnimator(model, inner, t.clips, def);
  // the game's block-model animation code drives these; for glTF models they're harmless stand-ins
  const dummy = () => new THREE.Object3D();
  const handR = hand || dummy();
  const rig = { body: dummy(), head: dummy(), armL: dummy(), armR: dummy(), legL: dummy(), legR: dummy(), handR, handL: handR, anim };
  return { root, rig, glb: true };
}

const _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _ax = new THREE.Vector3();

/**
 * Cross-fades between clips; attacks and landings play once on top. When a model has
 * no clip for something, a procedural layer fills in (bone swings / toy waddle).
 */
class CharAnimator {
  constructor(model, inner, clips, def) {
    this.model = model;
    this.inner = inner;
    this.baseY = inner.position.y;
    this.def = def;
    this.mixer = new THREE.AnimationMixer(model);
    this.actions = {};
    for (const [k, n] of Object.entries(def.anims || {})) {
      const clip = clips.find((c) => c.name === n);
      if (!clip) continue;
      const a = this.mixer.clipAction(clip);
      if (k === 'attack' || k === 'land' || k === 'jump') {
        a.setLoop(THREE.LoopOnce, 1);
        a.clampWhenFinished = true;
      }
      this.actions[k] = a;
    }
    // bones to swing when there's no run clip
    this.swing = [];
    if (def.swing && !this.actions.run) {
      const byName = {};
      model.traverse((o) => { if (o.isBone) byName[o.name] = o; });
      const add = (name, sign, amp) => { const b = byName[name]; if (b) this.swing.push({ b, rest: b.quaternion.clone(), sign, amp }); };
      add(def.swing.legs[0], 1, 0.6);
      add(def.swing.legs[1], -1, 0.6);
      add(def.swing.arms[0], -1, 0.45);
      add(def.swing.arms[1], 1, 0.45);
    }
    this.toy = !!def.toy || (!this.actions.run && !this.swing.length);
    this.procedural = this.toy || this.swing.length > 0;
    this.base = null;
    this.oneShot = null;
    this.oneShotT = 0;
    this.lastAttack = -9;
    this.t = 0;
    this.phase = 0;
    this.k = 0; // 0 idle .. 1 running (smoothed)
    this.atk = 0;
    this.air = 0;
    this.play('idle', 0);
  }

  play(name, fade = 0.18) {
    const a = this.actions[name];
    if (!a || this.base === name) return;
    const prev = this.base ? this.actions[this.base] : null;
    a.reset();
    a.enabled = true;
    a.setEffectiveWeight(1);
    a.play();
    if (prev && fade > 0) prev.crossFadeTo(a, fade, false);
    else if (prev) prev.stop();
    this.base = name;
  }

  /** One-shot clip (attack / land); models without one get a procedural lunge. */
  once(name, speed = 1) {
    if (name === 'attack') {
      if (this.t - this.lastAttack < 0.3) return; // don't restart it every shot at high attack speed
      this.lastAttack = this.t;
      this.atk = 1;
    }
    const a = this.actions[name];
    if (!a) return;
    if (this.oneShot && this.oneShot !== a) this.oneShot.fadeOut(0.08);
    a.reset();
    a.timeScale = speed;
    a.setEffectiveWeight(1);
    a.fadeIn(0.06);
    a.play();
    if (this.base) this.actions[this.base].setEffectiveWeight(0.15);
    this.oneShot = a;
    this.oneShotT = a.getClip().duration / speed - 0.12;
  }

  /** state: 'idle' | 'run' | 'jump' | 'fall'; runSpeed scales the run cycle. */
  update(dt, state, runSpeed = 1) {
    this.t += dt;
    let clipState = state;
    if (!this.actions[clipState]) clipState = state === 'fall' && this.actions.jump ? 'jump' : state === 'jump' || state === 'fall' ? (this.actions.run ? this.base : 'idle') : clipState;
    this.play(clipState);
    if (clipState === 'run' && this.actions.run) this.actions.run.timeScale = runSpeed * (this.def.runScale || 1);
    if (this.oneShot) {
      this.oneShotT -= dt;
      if (this.oneShotT <= 0) {
        this.oneShot.fadeOut(0.15);
        this.oneShot = null;
        if (this.base) this.actions[this.base].setEffectiveWeight(1);
      }
    }
    this.mixer.update(dt);
    if (this.procedural) this.proceduralPose(dt, state, runSpeed);
    else if (this.atk > 0) this.atk = Math.max(0, this.atk - dt * 4);
  }

  proceduralPose(dt, state, runSpeed) {
    const running = state === 'run';
    this.k += ((running ? 1 : 0) - this.k) * Math.min(1, dt * 10);
    this.air += ((state === 'jump' || state === 'fall' ? 1 : 0) - this.air) * Math.min(1, dt * 12);
    this.phase += dt * (running ? 10 * runSpeed : 0);
    this.atk = Math.max(0, this.atk - dt * 4);
    const k = this.k;
    const sw = Math.sin(this.phase);
    const toy = this.toy ? 1 : 0.35;
    const breathe = Math.sin(this.t * 2.2) * 0.012;
    // hop + waddle + forward lean, a lunge on attacks, stretch in the air
    this.inner.position.y = this.baseY + Math.abs(sw) * 0.07 * this.def.height * k * toy;
    this.inner.rotation.set(0.12 * k + 0.35 * this.atk - 0.08 * this.air, Math.sin(this.atk * Math.PI) * 0.35, sw * 0.13 * k * toy);
    const st = 1 + breathe + 0.08 * this.air - 0.05 * this.atk;
    this.inner.scale.set(this.inner.scale.x, this.inner.scale.x * st, this.inner.scale.x);
    // limb swings around the character's left-right axis (works whatever the rig's bone axes are)
    if (this.swing.length) {
      this.inner.getWorldQuaternion(_q);
      const amp = sw * k + (this.air ? 0.4 * this.air : 0);
      for (const s of this.swing) {
        _ax.set(1, 0, 0).applyQuaternion(_q);
        s.b.parent.getWorldQuaternion(_q2);
        _ax.applyQuaternion(_q2.invert()).normalize();
        const atkArm = s.amp < 0.5 && s.sign > 0 ? -1.2 * this.atk : 0;
        _q2.setFromAxisAngle(_ax, s.sign * s.amp * amp + atkArm);
        s.b.quaternion.copy(s.rest).premultiply(_q2);
      }
    }
  }
}
