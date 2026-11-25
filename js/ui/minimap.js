// Minimap (rotates with the camera) and a full-screen map (M / tap).
// Shows terrain, the portal and every goodie: chests by tier, shrines, Moai,
// jump pads and caves. Enemies are deliberately not shown.
import { G } from '../core/state.js';
import { Input } from '../core/input.js';
import { SIZE } from '../game/world.js';
import { MAP_ICONS, iconImage, icon } from '../data/icons.js';

const MARK = {
  chest_normal: { icon: '📦', col: '#d8a050', label: 'Chest' },
  chest_large: { icon: '🧰', col: '#c87aff', label: 'Large chest' },
  chest_epic: { icon: '💜', col: '#c461ff', label: 'Epic chest' },
  chest_legendary: { icon: '🌟', col: '#ffb22e', label: 'Legendary chest' },
  heal: { icon: '💚', col: '#55ff88', label: 'Healing shrine' },
  combat: { icon: '⚔️', col: '#ff4433', label: 'Combat shrine' },
  boss: { icon: '💀', col: '#b455ff', label: 'Boss shrine' },
  xp: { icon: '📘', col: '#55e6ff', label: 'Wisdom shrine' },
  moai: { icon: '🗿', col: '#ff8070', label: 'Moai' },
  magnet: { icon: '🧲', col: '#ff5566', label: 'Magnet statue' },
  portal: { icon: '🌀', col: '#ff3355', label: 'Portal' },
  pad: { icon: '⏫', col: '#55ffdd', label: 'Jump pad' },
  cave: { icon: '🕳️', col: '#9fdcff', label: 'Cave' },
};
for (const [k, m] of Object.entries(MARK)) m.px = MAP_ICONS[k];
const ICON_PX = 16; // marker size on the 200px minimap canvas
const ICON_PX_BIG = 24; // on the 640px big map

/** Pixel-art marker with a dark backing disc so it reads on any terrain. */
function drawIcon(ctx, m, x, y, size) {
  const img = iconImage(m.px);
  const s = m === MARK.portal ? size * 1.4 : size;
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.beginPath();
  ctx.arc(x, y, s * 0.62, 0, Math.PI * 2);
  ctx.fill();
  if (img.complete && img.naturalWidth) {
    const prev = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, Math.round(x - s / 2), Math.round(y - s / 2), s, s);
    ctx.imageSmoothingEnabled = prev;
  } else {
    ctx.fillStyle = m.col;
    ctx.fillRect(x - 3, y - 3, 6, 6);
  }
}
const VIEW = 190; // metres visible across the small map

export const Minimap = {
  base: null,
  world: null,
  bigOpen: false,

  bind() {
    const mm = document.getElementById('minimap');
    mm.addEventListener('click', () => this.toggleBig());
    mm.addEventListener('pointerdown', (e) => e.stopPropagation());
    document.getElementById('bigmap-close').addEventListener('click', () => this.toggleBig(false));
    const prev = Input.onKey;
    Input.onKey = (code) => {
      if (prev) prev(code);
      if (code === 'KeyM' && (G.mode === 'playing' || this.bigOpen)) this.toggleBig();
    };
  },

  /** Pre-render a shaded terrain image for the stage. */
  init(world) {
    this.world = world;
    const R = 256;
    const cv = document.createElement('canvas');
    cv.width = cv.height = R;
    const ctx = cv.getContext('2d');
    const img = ctx.createImageData(R, R);
    const g = world.stage.ground;
    const hex = (c) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
    const low = hex(g.low), mid = hex(g.mid), high = hex(g.high), rock = hex(g.slope);
    const liq = world.stage.liquid ? hex(world.stage.liquid.color) : null;
    const amp = world.stage.terrain.amp + (world.stage.terrain.terrace ? world.stage.terrain.terrace.height * 2 : 0);
    const step = SIZE / R;
    for (let j = 0; j < R; j++) {
      for (let i = 0; i < R; i++) {
        const x = -SIZE / 2 + (i + 0.5) * step, z = -SIZE / 2 + (j + 0.5) * step;
        const h = world.heightAt(x, z);
        let c;
        if (liq && h < world.liquidLevel) c = liq;
        else {
          const t = Math.max(0, Math.min(1, (h + amp) / (amp * 2.4)));
          const a = t < 0.5 ? low : mid, b = t < 0.5 ? mid : high, k = t < 0.5 ? t * 2 : (t - 0.5) * 2;
          c = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
          const slope = world.slopeAt(x, z);
          if (slope > 0.6) c = rock;
        }
        // hill shading from the north-west so plateaus and cliffs read clearly
        const shade = Math.max(0.55, Math.min(1.3, 1 + (world.heightAt(x - step, z - step) - h) * 0.12));
        const o = (j * R + i) * 4;
        img.data[o] = c[0] * shade;
        img.data[o + 1] = c[1] * shade;
        img.data[o + 2] = c[2] * shade;
        img.data[o + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    this.base = cv;
    this.legend();
  },

  markers() {
    const w = this.world;
    const out = [];
    for (const it of w.interactables) {
      if (it.used) continue;
      out.push({ x: it.pos.x, z: it.pos.z, m: MARK[it.kind === 'chest' ? 'chest_' + it.tier : it.kind] });
    }
    for (const p of w.jumpPads) out.push({ x: p.x, z: p.z, m: MARK.pad });
    for (const c of w.caves) out.push({ x: c.x, z: c.z, m: MARK.cave });
    if (w.portal && w.portal.state !== 'none') out.push({ x: w.portal.pos.x, z: w.portal.pos.z, m: MARK.portal, always: true });
    return out;
  },

  draw() {
    if (this.bigOpen) return this.drawBig();
    const cv = document.getElementById('minimap');
    if (!cv || !this.base || !G.player || cv.offsetParent === null) return;
    const ctx = cv.getContext('2d');
    const S = cv.width, c = S / 2;
    const p = G.player;
    const scale = S / VIEW; // px per metre
    const yaw = p.camYaw;
    ctx.save();
    ctx.clearRect(0, 0, S, S);
    ctx.beginPath();
    ctx.arc(c, c, c - 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, S, S);
    // terrain, rotated so the camera's forward direction points up
    ctx.translate(c, c);
    ctx.rotate(yaw);
    const bs = this.base.width / SIZE; // base px per metre
    ctx.scale(scale / bs, scale / bs);
    ctx.drawImage(this.base, -(p.pos.x + SIZE / 2) * bs, -(p.pos.z + SIZE / 2) * bs);
    ctx.restore();
    // markers (kept upright)
    const cs = Math.cos(yaw), sn = Math.sin(yaw);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const mk of this.markers()) {
      const dx = mk.x - p.pos.x, dz = mk.z - p.pos.z;
      let px = (dx * cs - dz * sn) * scale, py = (dx * sn + dz * cs) * scale;
      const d = Math.hypot(px, py);
      const lim = c - 12;
      if (d > lim) {
        if (!mk.always) continue;
        px *= lim / d;
        py *= lim / d;
      }
      drawIcon(ctx, mk.m, c + px, c + py, ICON_PX);
    }
    // player arrow
    ctx.translate(c, c);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(6, 7);
    ctx.lineTo(0, 3);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  },

  toggleBig(force) {
    this.bigOpen = force !== undefined ? force : !this.bigOpen;
    document.getElementById('bigmap').classList.toggle('hidden', !this.bigOpen);
    if (this.bigOpen) {
      Input.releaseLock(true); // the map is an overlay: the run keeps going, no pause menu
      this.drawBig();
    } else if (G.mode === 'playing') Input.requestLock();
  },

  drawBig() {
    const cv = document.getElementById('bigmap-canvas');
    if (!cv || !this.base) return;
    const ctx = cv.getContext('2d');
    const S = cv.width;
    const k = S / SIZE;
    ctx.clearRect(0, 0, S, S);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(this.base, 0, 0, S, S);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const mk of this.markers()) {
      drawIcon(ctx, mk.m, (mk.x + SIZE / 2) * k, (mk.z + SIZE / 2) * k, ICON_PX_BIG);
    }
    const p = G.player;
    if (p) {
      ctx.save();
      ctx.translate((p.pos.x + SIZE / 2) * k, (p.pos.z + SIZE / 2) * k);
      ctx.rotate(-p.camYaw);
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(8, 9);
      ctx.lineTo(0, 4);
      ctx.lineTo(-8, 9);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
      ctx.restore();
    }
  },

  legend() {
    const el = document.getElementById('bm-legend');
    if (el) el.innerHTML = Object.values(MARK).map((m) => `<span>${icon(m.px)} ${m.label}</span>`).join('');
  },
};
