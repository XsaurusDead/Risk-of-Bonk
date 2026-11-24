// Rigged glTF models for survivors (instead of the built-in block models).
//
// CHAR_MODELS maps a survivor id to a .glb in assets/models/. The model is
// preloaded at boot, cloned per use (SkeletonUtils keeps the skeleton working),
// and driven by an AnimationMixer: idle / run / jump / fall / attack / land.
// Costumes recolour the textures in the shader (hue / saturation / brightness).
// Anything that fails to load falls back to the block model.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/addons/utils/SkeletonUtils.js';
import { buildCharacter as buildBlockCharacter, COSTUMES } from './models.js';

export const CHAR_MODELS = {
  kestrel: {
    url: 'assets/models/fox/fox.glb', // "Hooded Fox" by Heytibo (itch.io)
    height: 2.35, // metres in game
    hide: /^Sword/, // the fox's sword: Kestrel gets a bow instead
    prop: 'bow',
    anims: { idle: 'Idle', run: 'Run', jump: 'Jump', fall: 'Fall', attack: 'Attack', land: 'ToucheGround' },
  },
};

// per-costume recolour of the model's textures
const COSTUME_LOOK = [
  null, // Classic: original colours
  { hue: 0.5, sat: 1.0, bright: 1.0 }, // Rival: blue fox
  { hue: 0.0, sat: 0.1, bright: 1.8, tint: 0xeef8ff }, // Arctic: white fox
  { hue: -0.03, sat: 1.35, bright: 0.7, emissive: 0x551100 }, // Inferno
  { hue: 0.72, sat: 0.9, bright: 0.55, emissive: 0x1a0830 }, // Shadow
  { hue: 0.06, sat: 1.25, bright: 1.25, tint: 0xffe7a0 }, // Golden
];

const templates = {};

export async function preloadCharacterModels() {
  const loader = new GLTFLoader();
  await Promise.all(Object.entries(CHAR_MODELS).map(async ([id, def]) => {
    try {
      const g = await loader.loadAsync(def.url);
      g.scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(g.scene);
      templates[id] = { scene: g.scene, clips: g.animations, height: box.max.y - box.min.y, minY: box.min.y };
    } catch (e) {
      console.warn('[charmodels] could not load', def.url, e?.message);
    }
  }));
}

export const hasCharModel = (id) => !!templates[id];

/** Survivor model: the rigged glTF one if there is one, otherwise the block model. */
export function buildCharacter(id, costume = 0) {
  const t = templates[id];
  if (!t) return buildBlockCharacter(id, costume);
  try {
    return buildSkinned(id, costume, t);
  } catch (e) {
    console.warn('[charmodels] build failed, using block model', e);
    return buildBlockCharacter(id, costume);
  }
}

function recolour(mat, look) {
  const m = mat.clone();
  if (!look) return m;
  if (look.tint) m.color = new THREE.Color(look.tint);
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
  if (!idx) return null;
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

function buildSkinned(id, costume, t) {
  const def = CHAR_MODELS[id];
  const model = cloneSkinned(t.scene);
  const s = def.height / t.height;
  model.scale.setScalar(s);
  model.position.y = -t.minY * s;
  const root = new THREE.Group();
  root.add(model);
  model.updateMatrixWorld(true);

  const look = COSTUME_LOOK[costume] || null;
  const mats = new Map();
  let hideMesh = null, headMesh = null;
  model.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.frustumCulled = false; // skinned bounds don't follow the animation
    if (!mats.has(o.material)) mats.set(o.material, recolour(o.material, look));
    o.material = mats.get(o.material);
    if (def.hide && def.hide.test(o.name)) hideMesh = o;
    if (/hood|head/i.test(o.name)) headMesh = o;
  });

  // swap the held prop: a bow placed where the sword's grip is, following the same hand bone
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
      bow.scale.setScalar(1 / s); // the bow is sized in game metres
      bow.scale.multiplyScalar(1.25);
      model.add(bow);
      bow.position.copy(model.worldToLocal(grip.clone()));
      bow.position.z += 0.06 / s;
      hand.attach(bow);
    }
  }
  const head = headMesh ? mainBone(headMesh) : null;
  if (COSTUMES[costume]?.flair === 'crown' && head) {
    const crown = buildCrown();
    crown.scale.setScalar(1.6 / s);
    model.add(crown);
    const top = new THREE.Vector3(0, def.height * 0.98, 0);
    crown.position.copy(model.worldToLocal(root.localToWorld(top)));
    head.attach(crown);
  }

  const anim = new CharAnimator(model, t.clips, def.anims);
  // the game's procedural animation code drives these; for rigged models they're harmless stand-ins
  const dummy = () => new THREE.Object3D();
  const rig = { body: dummy(), head: dummy(), armL: dummy(), armR: dummy(), legL: dummy(), legR: dummy(), handR: hand || dummy(), handL: hand || dummy(), anim };
  return { root, rig };
}

/** Cross-fades between locomotion clips; attacks and landings play once on top. */
class CharAnimator {
  constructor(model, clips, names) {
    this.mixer = new THREE.AnimationMixer(model);
    this.actions = {};
    for (const [k, n] of Object.entries(names)) {
      const clip = clips.find((c) => c.name === n);
      if (!clip) continue;
      const a = this.mixer.clipAction(clip);
      if (k === 'attack' || k === 'land' || k === 'jump') {
        a.setLoop(THREE.LoopOnce, 1);
        a.clampWhenFinished = true;
      }
      this.actions[k] = a;
    }
    this.base = null;
    this.oneShot = null;
    this.oneShotT = 0;
    this.lastAttack = -9;
    this.t = 0;
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

  /** One-shot clip (attack / land) that blends back into the locomotion clip. */
  once(name, speed = 1) {
    const a = this.actions[name];
    if (!a) return;
    if (name === 'attack') {
      if (this.t - this.lastAttack < 0.3) return; // don't restart it every shot at high attack speed
      this.lastAttack = this.t;
    }
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
    this.play(state);
    if (state === 'run' && this.actions.run) this.actions.run.timeScale = runSpeed;
    if (this.oneShot) {
      this.oneShotT -= dt;
      if (this.oneShotT <= 0) {
        this.oneShot.fadeOut(0.15);
        this.oneShot = null;
        if (this.base) this.actions[this.base].setEffectiveWeight(1);
      }
    }
    this.mixer.update(dt);
  }
}
