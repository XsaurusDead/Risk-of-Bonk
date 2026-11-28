// Real rock textures from the Stylized Nature MegaKit on everything made of stone.
//
// Most stone in the game is built from simple shapes with vertex colours (ruins, caves,
// shrines, Moai, pillars, the portal) and the terrain is a height field: none of them have
// good UVs. A triplanar shader samples the texture along the three world axes and blends by
// the surface normal, so any shape gets a seamless rock surface. The texture is used as a
// *detail* layer (normalised around its average colour): the stage palettes stay as they are.
import * as THREE from 'three';
import { G } from '../core/state.js';

const BASE = 'assets/packs/stylized-nature/web/';
const TEX = {
  rock: { file: 'Rocks_Diffuse.png' },
  desert: { file: 'Rocks_Desert_Diffuse.png' },
  path: { file: 'PathRocks_Diffuse.png' },
};
const loaded = {};

/** Load a texture once; `uniforms` filled in when it arrives (until then the material is plain). */
function texInfo(key) {
  if (loaded[key]) return loaded[key];
  const info = { tex: { value: null }, avg: { value: new THREE.Vector3(0.5, 0.5, 0.5) }, on: { value: 0 } };
  loaded[key] = info;
  new THREE.TextureLoader().load(BASE + TEX[key].file, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 4;
    // average colour (linear) so the texture can be used as a ~1.0-centred detail layer
    try {
      const c = document.createElement('canvas');
      c.width = c.height = 32;
      const g = c.getContext('2d');
      g.drawImage(t.image, 0, 0, 32, 32);
      const d = g.getImageData(0, 0, 32, 32).data;
      const sum = [0, 0, 0];
      const lin = (v) => Math.pow(v / 255, 2.2);
      for (let i = 0; i < d.length; i += 4) for (let k = 0; k < 3; k++) sum[k] += lin(d[i + k]);
      const n = d.length / 4;
      info.avg.value.set(sum[0] / n, sum[1] / n, sum[2] / n);
    } catch (_) {}
    info.tex.value = t;
    info.on.value = 1;
  });
  return info;
}

/**
 * Add triplanar rock detail to a material.
 *  scale:    texture repeats per metre
 *  strength: how strongly the texture modulates the base colour (0..1)
 *  slopeOnly: only on steep surfaces (terrain cliffs)
 */
export function addTriplanar(mat, { tex = 'rock', scale = 0.3, strength = 0.85, slopeOnly = false } = {}) {
  const info = texInfo(tex);
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    if (prev) prev(shader, r);
    shader.uniforms.uTpMap = info.tex;
    shader.uniforms.uTpAvg = info.avg;
    shader.uniforms.uTpOn = info.on;
    shader.uniforms.uTpScale = { value: scale };
    shader.uniforms.uTpStrength = { value: strength };
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTpPos;\nvarying vec3 vTpNormal;')
      .replace(
        '#include <project_vertex>',
        `#include <project_vertex>
        {
          vec4 tpW = vec4(transformed, 1.0);
          vec3 tpN = objectNormal;
          #ifdef USE_INSTANCING
            tpW = instanceMatrix * tpW;
            tpN = mat3(instanceMatrix) * tpN;
          #endif
          tpW = modelMatrix * tpW;
          vTpPos = tpW.xyz;
          vTpNormal = normalize(mat3(modelMatrix) * tpN);
        }`
      );
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vTpPos;\nvarying vec3 vTpNormal;\nuniform sampler2D uTpMap;\nuniform vec3 uTpAvg;\nuniform float uTpOn;\nuniform float uTpScale;\nuniform float uTpStrength;')
      .replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        if (uTpOn > 0.5) {
          vec3 tw = pow(abs(normalize(vTpNormal)), vec3(4.0));
          tw /= (tw.x + tw.y + tw.z);
          vec3 tp = vTpPos * uTpScale;
          vec3 tc = texture2D(uTpMap, tp.zy).rgb * tw.x + texture2D(uTpMap, tp.xz).rgb * tw.y + texture2D(uTpMap, tp.xy).rgb * tw.z;
          vec3 det = tc / max(uTpAvg, vec3(0.02));
          float mask = ${slopeOnly ? 'smoothstep(0.86, 0.62, normalize(vTpNormal).y)' : '1.0'};
          diffuseColor.rgb *= mix(vec3(1.0), clamp(det, 0.0, 2.2), uTpStrength * mask);
        }`
      );
  };
  const key = mat.customProgramCacheKey ? mat.customProgramCacheKey() : '';
  mat.customProgramCacheKey = () => `${key}|tp:${tex}:${scale}:${strength}:${slopeOnly}`;
  mat.needsUpdate = true;
  return mat;
}

/** Desert stages get the sandy rock texture, everything else the grey-brown one. */
export function rockTexFor(stageId) {
  return stageId === 'dunes' ? 'desert' : 'rock';
}

/** Kick off the texture downloads early (boot). */
export function preloadStoneTextures() {
  texInfo('rock');
  texInfo('desert');
  if (G) texInfo('path');
}
