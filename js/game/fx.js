// Visual effects: particles, shockwave rings, ground telegraphs, beams,
// floating damage numbers, enemy health bars and screen shake.
import * as THREE from 'three';
import { G } from '../core/state.js';

const MAX_PARTICLES = 900;
let pMesh, particlesArr = [];
const pool = { ring: [], tele: [], beam: [] };
const active = { ring: [], tele: [], beam: [] };
let dmgLayer, dmgPool = [], dmgActive = [];
let hpBg, hpFill;
const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();
const _c = new THREE.Color();
const UPV = new THREE.Vector3(0, 1, 0);
const flatQ = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);

const ringGeo = new THREE.RingGeometry(0.86, 1, 48);
const discGeo = new THREE.CircleGeometry(1, 48);
const beamGeo = new THREE.CylinderGeometry(1, 1, 1, 6, 1, true);

export function initFx(scene) {
  pMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }), MAX_PARTICLES);
  pMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  pMesh.setColorAt(0, new THREE.Color(1, 1, 1));
  pMesh.count = 0;
  pMesh.frustumCulled = false;
  scene.add(pMesh);

  const bgMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6, depthTest: false });
  const fillMat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false });
  hpBg = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), bgMat, 100);
  hpFill = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).translate(0.5, 0, 0), fillMat, 100);
  hpFill.setColorAt(0, new THREE.Color(1, 0, 0));
  for (const m of [hpBg, hpFill]) {
    m.count = 0;
    m.frustumCulled = false;
    m.renderOrder = 10;
    scene.add(m);
  }
  hpFill.renderOrder = 11;

  dmgLayer = document.getElementById('dmg-layer');
  for (let i = 0; i < 70; i++) {
    const d = document.createElement('div');
    d.className = 'dmg';
    d.style.display = 'none';
    dmgLayer.appendChild(d);
    dmgPool.push(d);
  }
}

/** Re-add pooled scene objects after a scene was rebuilt. */
export function attachFx(scene) {
  scene.add(pMesh, hpBg, hpFill);
}

export function clearFx() {
  particlesArr.length = 0;
  for (const k of ['ring', 'tele', 'beam']) {
    for (const o of active[k]) {
      o.mesh.visible = false;
      pool[k].push(o);
    }
    active[k].length = 0;
  }
  for (const d of dmgActive) {
    d.el.style.display = 'none';
    dmgPool.push(d.el);
  }
  dmgActive.length = 0;
}

export function particles(pos, color, count = 10, speed = 5, life = 0.6, size = 0.3, gravity = 12) {
  if (G.quality === 'low') count = Math.ceil(count * 0.5);
  for (let i = 0; i < count; i++) {
    if (particlesArr.length >= MAX_PARTICLES) particlesArr.shift();
    const a = Math.random() * Math.PI * 2, u = Math.random() * 2 - 1;
    const r = Math.sqrt(1 - u * u);
    const sp = speed * (0.4 + Math.random() * 0.6);
    particlesArr.push({
      x: pos.x, y: pos.y + 0.5, z: pos.z,
      vx: Math.cos(a) * r * sp, vy: Math.abs(u) * sp + speed * 0.3, vz: Math.sin(a) * r * sp,
      life: life * (0.6 + Math.random() * 0.4), max: life, size: size * (0.6 + Math.random() * 0.6), g: gravity,
      c: new THREE.Color(color), rot: Math.random() * 6,
    });
  }
}

function getPooled(kind, make) {
  let o = pool[kind].pop();
  if (!o) {
    o = make();
    G.scene.add(o.mesh);
  } else if (o.mesh.parent !== G.scene) G.scene.add(o.mesh);
  o.mesh.visible = true;
  active[kind].push(o);
  return o;
}

export function ring(pos, radius, color = 0xffffff, life = 0.4) {
  const o = getPooled('ring', () => ({
    mesh: new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ transparent: true, side: THREE.DoubleSide, depthWrite: false })),
  }));
  o.mesh.material.color.set(color);
  o.mesh.position.set(pos.x, pos.y + 0.3, pos.z);
  o.mesh.quaternion.copy(flatQ);
  o.radius = radius;
  o.t = 0;
  o.life = life;
}

/** Ground warning circle that fills up over `dur` seconds. */
export function telegraph(pos, radius, color = 0xff3333, dur = 1) {
  const o = getPooled('tele', () => {
    const g = new THREE.Group();
    const disc = new THREE.Mesh(discGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.18, depthTest: false, depthWrite: false, side: THREE.DoubleSide }));
    const fill = new THREE.Mesh(discGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.3, depthTest: false, depthWrite: false, side: THREE.DoubleSide }));
    const edge = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.8, depthTest: false, depthWrite: false, side: THREE.DoubleSide }));
    g.add(disc, fill, edge);
    for (const m of [disc, fill, edge]) m.renderOrder = 5;
    return { mesh: g, disc, fill, edge };
  });
  for (const m of [o.disc, o.fill, o.edge]) m.material.color.set(color);
  o.mesh.position.set(pos.x, pos.y + 0.25, pos.z);
  o.mesh.quaternion.copy(flatQ);
  o.mesh.scale.set(radius, radius, 1);
  o.t = 0;
  o.life = dur;
  return o;
}

export function beam(from, to, color = 0xffffff, width = 0.1, life = 0.1) {
  const o = getPooled('beam', () => ({
    mesh: new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })),
  }));
  o.mesh.material.color.set(color);
  _v.subVectors(to, from);
  const len = _v.length();
  o.mesh.position.copy(from).addScaledVector(_v, 0.5);
  if (len > 0.0001) o.mesh.quaternion.setFromUnitVectors(UPV, _v.normalize());
  o.mesh.scale.set(width, len, width);
  o.width = width;
  o.t = 0;
  o.life = life;
}

export function damageNumber(pos, amount, crit = false, color = null) {
  if (!G.save?.settings.damageNumbers) return;
  let el = dmgPool.pop();
  if (!el) {
    const old = dmgActive.shift();
    el = old.el;
  }
  el.textContent = amount >= 10 ? Math.round(amount).toLocaleString() : amount.toFixed(1).replace('.0', '');
  el.className = 'dmg' + (crit ? ' crit' : '');
  el.style.color = color || (crit ? '#ff5a3a' : '#ffffff');
  el.style.display = 'block';
  dmgActive.push({ el, x: pos.x + (Math.random() - 0.5) * 0.8, y: pos.y, z: pos.z + (Math.random() - 0.5) * 0.8, t: 0, life: crit ? 0.9 : 0.7 });
}

export function floatText(pos, text, color = '#ffffff', big = false) {
  let el = dmgPool.pop();
  if (!el) el = dmgActive.shift().el;
  el.textContent = text;
  el.className = 'dmg text' + (big ? ' crit' : '');
  el.style.color = color;
  el.style.display = 'block';
  dmgActive.push({ el, x: pos.x, y: pos.y, z: pos.z, t: 0, life: 1.3 });
}

export function shake(amount) {
  if (G.save?.settings.screenShake === false) return;
  G.shake = Math.min(1.5, G.shake + amount);
}

export function updateFx(dt) {
  // particles
  let n = 0;
  for (let i = particlesArr.length - 1; i >= 0; i--) {
    const p = particlesArr[i];
    p.life -= dt;
    if (p.life <= 0) {
      particlesArr[i] = particlesArr[particlesArr.length - 1];
      particlesArr.pop();
    }
  }
  for (const p of particlesArr) {
    p.vy -= p.g * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.z += p.vz * dt;
    p.rot += dt * 5;
    const k = p.size * Math.max(0.05, p.life / p.max);
    _q.setFromAxisAngle(UPV, p.rot);
    _m.compose(_v.set(p.x, p.y, p.z), _q, _s.set(k, k, k));
    pMesh.setMatrixAt(n, _m);
    pMesh.setColorAt(n, p.c);
    n++;
  }
  pMesh.count = n;
  pMesh.instanceMatrix.needsUpdate = true;
  if (pMesh.instanceColor) pMesh.instanceColor.needsUpdate = true;

  for (let i = active.ring.length - 1; i >= 0; i--) {
    const o = active.ring[i];
    o.t += dt;
    const k = o.t / o.life;
    const r = o.radius * (0.2 + 0.8 * Math.sqrt(k));
    o.mesh.scale.set(r, r, 1);
    o.mesh.material.opacity = Math.max(0, 1 - k);
    if (k >= 1) release('ring', i);
  }
  for (let i = active.tele.length - 1; i >= 0; i--) {
    const o = active.tele[i];
    o.t += dt;
    const k = Math.min(1, o.t / o.life);
    o.fill.scale.set(k, k, 1);
    o.edge.material.opacity = 0.5 + 0.5 * Math.sin(o.t * 20);
    if (o.t >= o.life) release('tele', i);
  }
  for (let i = active.beam.length - 1; i >= 0; i--) {
    const o = active.beam[i];
    o.t += dt;
    const k = o.t / o.life;
    const w = o.width * Math.max(0.05, 1 - k);
    o.mesh.scale.x = o.mesh.scale.z = w;
    o.mesh.material.opacity = Math.max(0, 1 - k);
    if (k >= 1) release('beam', i);
  }

  // damage numbers
  const cam = G.camera;
  const w = window.innerWidth, h = window.innerHeight;
  for (let i = dmgActive.length - 1; i >= 0; i--) {
    const d = dmgActive[i];
    d.t += dt;
    if (d.t >= d.life) {
      d.el.style.display = 'none';
      dmgPool.push(d.el);
      dmgActive.splice(i, 1);
      continue;
    }
    _v.set(d.x, d.y + 1.5 + d.t * 2.2, d.z).project(cam);
    if (_v.z > 1) {
      d.el.style.opacity = 0;
      continue;
    }
    const sx = (_v.x * 0.5 + 0.5) * w, sy = (-_v.y * 0.5 + 0.5) * h;
    const pop = d.t < 0.1 ? 1 + (0.1 - d.t) * 5 : 1;
    d.el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%,-50%) scale(${pop})`;
    d.el.style.opacity = Math.min(1, (d.life - d.t) * 3);
  }
}

function release(kind, i) {
  const o = active[kind][i];
  o.mesh.visible = false;
  active[kind][i] = active[kind][active[kind].length - 1];
  active[kind].pop();
  pool[kind].push(o);
}

/** Billboard HP bars over damaged, non-boss enemies. */
export function updateHpBars() {
  const cam = G.camera;
  let n = 0;
  const p = G.player;
  for (const e of G.enemies) {
    if (n >= 100) break;
    if (e.dead || e.isBoss || e.hp >= e.maxHp) continue;
    if (p && e.pos.distanceToSquared(p.pos) > 70 * 70) continue;
    const width = Math.max(1.2, e.radius * 1.6);
    _v.set(e.pos.x, e.pos.y + e.height * e.scale + 0.6, e.pos.z);
    _m.compose(_v, cam.quaternion, _s.set(width + 0.08, 0.2, 1));
    hpBg.setMatrixAt(n, _m);
    const frac = Math.max(0, e.hp / e.maxHp);
    // left-anchored fill: offset by half the width along camera right
    _s.set(1, 0, 0).applyQuaternion(cam.quaternion).multiplyScalar(-width / 2);
    _v.add(_s);
    _m.compose(_v, cam.quaternion, _s.set(width * frac, 0.13, 1));
    hpFill.setMatrixAt(n, _m);
    hpFill.setColorAt(n, _c.set(e.elite ? e.elite.color : e.shieldHp > 0 ? 0x66aaff : 0xff3b3b));
    n++;
  }
  hpBg.count = hpFill.count = n;
  hpBg.instanceMatrix.needsUpdate = true;
  hpFill.instanceMatrix.needsUpdate = true;
  if (hpFill.instanceColor) hpFill.instanceColor.needsUpdate = true;
}
