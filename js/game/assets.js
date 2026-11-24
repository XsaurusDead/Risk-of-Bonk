// External 3D assets (glTF). Currently: Quaternius "Stylized Nature MegaKit"
// (CC0) — optimized copies live in assets/packs/stylized-nature/web/.
//
// Models are preloaded at startup and turned into "parts" (geometry + material
// with node transforms baked in) so the world can draw them with instancing.
// If anything fails to load the game silently falls back to procedural props.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MAT, addSway } from './models.js';

const BASE = 'assets/packs/stylized-nature/web/';
export const NATURE_MODELS = [
  ...[1, 2, 3, 4, 5].map((i) => 'CommonTree_' + i),
  ...[1, 2, 3, 4, 5].map((i) => 'Pine_' + i),
  ...[1, 2, 3, 4, 5].map((i) => 'DeadTree_' + i),
  ...[1, 2, 3, 4, 5].map((i) => 'TwistedTree_' + i),
  'Rock_Medium_1', 'Rock_Medium_2', 'Rock_Medium_3', 'Bush_Common', 'Bush_Common_Flowers', 'Flower_3_Group', 'Flower_4_Group',
  'Fern_1', 'Clover_1', 'Clover_2', 'Plant_1', 'Plant_1_Big', 'Plant_7_Big', 'Mushroom_Common', 'Mushroom_Laetiporus',
  'Pebble_Round_1', 'Pebble_Round_2', 'Pebble_Square_3',
];

const models = new Map(); // name -> { parts:[{geometry, material, leaf}], height, width }
const extraTextures = {};
let ready = false;

export function assetsReady() {
  return ready;
}
export function getModel(name) {
  return models.get(name) || null;
}
export function desertRockTexture() {
  return extraTextures.desertRock || null;
}

/** Load every nature model; resolves even if some fail. onProgress(0..1). */
export async function preloadAssets(onProgress) {
  const loader = new GLTFLoader();
  let done = 0;
  const total = NATURE_MODELS.length + 1;
  const tick = () => onProgress && onProgress(++done / total);
  const jobs = NATURE_MODELS.map((name) =>
    loader.loadAsync(BASE + name + '.gltf').then((g) => {
      models.set(name, toParts(g.scene, name));
    }).catch((e) => console.warn('[assets] failed', name, e?.message)).finally(tick)
  );
  jobs.push(
    new THREE.TextureLoader().loadAsync(BASE + 'Rocks_Desert_Diffuse.png').then((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.flipY = false; // glTF texture convention
      extraTextures.desertRock = t;
    }).catch(() => {}).finally(tick)
  );
  await Promise.all(jobs);
  ready = models.size > 0;
  return ready;
}

const matCache = new Map();
/** Convert a glTF material into one that fits our renderer + quality level. */
function adaptMaterial(src, name, leafy) {
  const key = src.uuid + (leafy ? 'L' : '');
  if (matCache.has(key)) return matCache.get(key);
  const cutout = src.alphaTest > 0 || src.transparent || /leaf|leaves|flower|grass|plant|fern|clover/i.test(src.name);
  const params = { map: src.map || null, color: src.color ? src.color.clone() : new THREE.Color(1, 1, 1), side: cutout ? THREE.DoubleSide : THREE.FrontSide, alphaTest: cutout ? 0.45 : 0 };
  let m;
  if (MAT.high) {
    m = new THREE.MeshStandardMaterial({ ...params, normalMap: src.normalMap || null, roughness: 0.9, metalness: 0 });
  } else {
    m = new THREE.MeshLambertMaterial(params);
  }
  m.transparent = false;
  // the pack's textures are authored dark for a different light setup: lift them, and give
  // foliage a little light shining through the leaves so shaded leaf cards don't go black
  m.color.multiplyScalar(leafy ? 1.55 : /Rock|Pebble/.test(name) ? 1.6 : 1.3);
  if (leafy && m.map) {
    m.emissiveMap = m.map;
    m.emissive = new THREE.Color(0.32, 0.32, 0.3);
  }
  // foliage sways in the wind (trunks stay put: sway grows with height)
  if (leafy) addSway(m, /Twisted|Dead/.test(name) ? 0.0015 : /Pine|Common/.test(name) ? 0.0028 : 0.05);
  matCache.set(key, m);
  return m;
}

function toParts(scene, name) {
  scene.updateMatrixWorld(true);
  const parts = [];
  const box = new THREE.Box3();
  scene.traverse((o) => {
    if (!o.isMesh) return;
    const geo = o.geometry.clone();
    geo.userData.src = name;
    geo.applyMatrix4(o.matrixWorld);
    // instancing only needs these attributes
    for (const k of Object.keys(geo.attributes)) if (!['position', 'normal', 'uv'].includes(k)) geo.deleteAttribute(k);
    geo.computeBoundingSphere();
    geo.computeBoundingBox();
    box.union(geo.boundingBox);
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    const leafy = /leaf|leaves|flower|grass|plant|fern|clover/i.test(mats[0].name) || /Bush|Flower|Fern|Clover|Plant/.test(name);
    parts.push({ geometry: geo, material: adaptMaterial(mats[0], name, leafy), castShadow: !/Pebble|Clover|Plant_7/.test(name) });
  });
  const size = new THREE.Vector3();
  box.getSize(size);
  return { parts, height: size.y, width: Math.max(size.x, size.z) };
}
