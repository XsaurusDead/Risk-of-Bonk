// Animated rune-pillar sprites from the "Spells effect of separation and decoration 4"
// pack (assets/textures/glyphs/<colour>_<design>.png: 8 frames of 32x48 in a row).
// Colours: A gold, B pink, C ice blue, D green, E bronze, F white, G violet-gold,
// H red, K blue-violet. Used for level-ups, ultimates, boss spawns, shrines and the portal.
import * as THREE from 'three';
import { G } from '../core/state.js';

const FRAMES = 8;
const loader = new THREE.TextureLoader();
const base = new Map();
const live = []; // short-lived bursts
const attached = []; // pillars that live on shrines / the portal

const pending = new Map(); // clones made before their image finished loading

function texture(color, design) {
  const key = `${color}_${design}`;
  if (!base.has(key)) {
    pending.set(key, []);
    const t = loader.load(`assets/textures/glyphs/${key}.png`, () => {
      // copies share the image but keep their own version counter: refresh them
      for (const c of pending.get(key) || []) c.needsUpdate = true;
      pending.delete(key);
    });
    t.colorSpace = THREE.SRGBColorSpace;
    t.magFilter = THREE.NearestFilter;
    t.minFilter = THREE.NearestFilter;
    t.generateMipmaps = false;
    t.repeat.set(1 / FRAMES, 1);
    base.set(key, t);
  }
  const src = base.get(key);
  const t = src.clone(); // own UV offset per sprite, same image
  t.repeat.set(1 / FRAMES, 1);
  if (pending.has(key)) {
    t.needsUpdate = false;
    t.version = 0;
    pending.get(key).push(t);
  }
  return t;
}

/** One animated rune pillar standing on its base point. */
export function makeGlyph(color, design = 17, height = 2.4, opts = {}) {
  const mat = new THREE.SpriteMaterial({
    map: texture(color, design), transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: opts.opacity ?? 1,
  });
  const s = new THREE.Sprite(mat);
  s.center.set(0.5, 0);
  s.scale.set(height * (32 / 48), height, 1);
  s.renderOrder = 5;
  s.userData.glyph = { t: Math.random() * 2, fps: opts.fps ?? 10, h: height, design };
  return s;
}

function animate(s, dt) {
  const g = s.userData.glyph;
  g.t += dt;
  s.material.map.offset.x = (Math.floor(g.t * g.fps) % FRAMES) / FRAMES;
}

/** A burst that rises, holds and fades (pos = ground point). */
export function spawnGlyph(pos, color, design = 17, o = {}) {
  if (!G.scene) return null;
  const s = makeGlyph(color, design, o.height ?? 2.4, o);
  s.position.copy(pos);
  s.visible = !(o.delay > 0);
  G.scene.add(s);
  live.push({ s, life: o.life ?? 1.2, age: -(o.delay || 0), rise: o.rise ?? 1.2, y0: pos.y, h: o.height ?? 2.4, follow: o.follow || null, off: o.follow ? pos.clone().sub(o.follow.pos) : null });
  return s;
}

/** A ring of bursts around a point (level-ups, ultimates, boss spawns). */
export function glyphRing(center, n, radius, color, design = 17, o = {}) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + (o.spin || 0);
    const p = center.clone().add(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    if (G.world && !o.follow) p.y = G.world.groundAt(p.x, p.z, center.y + 2);
    spawnGlyph(p, color, design, { ...o, delay: (o.stagger || 0) * i });
  }
}

/** A permanent pillar on an object (shrine, portal); returns the sprite. */
export function attachGlyph(parent, color, design = 17, height = 2.4, y = 0, opts = {}) {
  const s = makeGlyph(color, design, height, opts);
  s.position.y = y;
  parent.add(s);
  if (opts.owner) s.userData.owner = opts.owner;
  attached.push(s);
  return s;
}

/** Swap an attached pillar's colour (e.g. the portal when it's charged). */
export function recolorGlyph(s, color, design) {
  const g = s.userData.glyph;
  const t = texture(color, design ?? g.design ?? 17);
  s.material.map = t;
  s.material.needsUpdate = true;
}

export function updateGlyphs(dt) {
  for (let i = live.length - 1; i >= 0; i--) {
    const b = live[i];
    b.age += dt;
    if (b.age < 0) continue;
    b.s.visible = true;
    animate(b.s, dt);
    const k = b.age / b.life;
    if (b.follow) b.s.position.copy(b.follow.pos).add(b.off);
    // grow in, rise, fade out
    const grow = Math.min(1, b.age / 0.15);
    b.s.scale.set(b.h * (32 / 48) * grow, b.h * grow, 1);
    b.s.position.y = (b.follow ? b.follow.pos.y + b.off.y : b.y0) + b.rise * k;
    b.s.material.opacity = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
    if (b.age >= b.life) {
      G.scene.remove(b.s);
      b.s.material.map.dispose();
      b.s.material.dispose();
      live.splice(i, 1);
    }
  }
  for (let i = attached.length - 1; i >= 0; i--) {
    const s = attached[i];
    if (!s.parent) { attached.splice(i, 1); continue; } // its world was unloaded
    if (s.userData.owner?.dead) {
      // e.g. an elite died: drop the marker
      s.parent.remove(s);
      s.material.map.dispose();
      s.material.dispose();
      attached.splice(i, 1);
      continue;
    }
    if (s.visible) animate(s, dt);
  }
}

export function clearGlyphs() {
  for (const b of live) G.scene?.remove(b.s);
  live.length = 0;
}

/** Glyph colour closest to a survivor's colour (for their ultimate). */
export function glyphColorFor(hex) {
  const c = new THREE.Color(hex), hsl = {};
  c.getHSL(hsl);
  if (hsl.s < 0.2) return 'F';
  const h = hsl.h * 360;
  if (h < 15 || h >= 340) return 'H';
  if (h < 50) return 'A';
  if (h < 75) return 'E';
  if (h < 160) return 'D';
  if (h < 210) return 'C';
  if (h < 260) return 'K';
  if (h < 300) return 'B';
  return 'B';
}
