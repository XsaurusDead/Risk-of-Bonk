// Unified input: keyboard + mouse (pointer lock), gamepad (standard mapping)
// and touch (virtual joystick + drag-to-look + on-screen buttons).
import { G } from './state.js';

const ACTIONS = ['primary', 'ability1', 'ability2', 'ultimate', 'jump', 'interact', 'pause', 'inventory', 'items'];

const KEYMAP = {
  Space: 'jump',
  KeyE: 'interact',
  KeyF: 'interact',
  KeyQ: 'ability1',
  ShiftLeft: 'ability2',
  ShiftRight: 'ability2',
  KeyR: 'ultimate',
  Escape: 'pause',
  KeyP: 'pause',
  Tab: 'inventory',
  KeyI: 'items',
};

const PADMAP = {
  7: 'primary', // RT
  6: 'ability1', // LT
  5: 'ability2', // RB
  3: 'ultimate', // Y
  4: 'ultimate', // LB
  0: 'jump', // A
  2: 'interact', // X
  9: 'pause', // Start
  8: 'inventory', // Back / View
};

export const Input = {
  device: 'kbm',
  move: { x: 0, y: 0 },
  look: { x: 0, y: 0 }, // radians to apply this frame
  held: {},
  pressed: {},
  menu: { up: false, down: false, left: false, right: false, confirm: false, back: false },
  keys: new Set(),
  mouseDown: [false, false, false],
  pointerLocked: false,
  wantPointerLock: false,
  onDeviceChange: null,
  onPointerLockLost: null,
  onKey: null,
  numberPressed: 0,

  // touch state
  joy: { id: null, ox: 0, oy: 0, x: 0, y: 0 },
  lookTouch: { id: null, lx: 0, ly: 0 },
  touchHeld: {},
  touchLook: { x: 0, y: 0 },

  _padPrev: [],
  _padStickPrev: { x: 0, y: 0 },
  _padRepeat: 0,

  init(canvas) {
    this.canvas = canvas;
    for (const a of ACTIONS) {
      this.held[a] = false;
      this.pressed[a] = false;
    }

    window.addEventListener('keydown', (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return; // typing in a text field
      if (e.code === 'Tab') e.preventDefault();
      if (e.code === 'Space' && G.mode === 'playing') e.preventDefault();
      if (!this.keys.has(e.code)) {
        const a = KEYMAP[e.code];
        if (a) this.pressed[a] = true;
        if (e.code.startsWith('Digit')) this.numberPressed = parseInt(e.code.slice(5), 10) || 0;
        if (e.code === 'ArrowUp') this.menu.up = true;
        if (e.code === 'ArrowDown') this.menu.down = true;
        if (e.code === 'ArrowLeft') this.menu.left = true;
        if (e.code === 'ArrowRight') this.menu.right = true;
        if (e.code === 'Enter') this.menu.confirm = true;
        if (e.code === 'Escape' || e.code === 'Backspace') this.menu.back = true;
        if (this.onKey) this.onKey(e.code);
      }
      this.keys.add(e.code);
      this.setDevice('kbm');
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => {
      this.keys.clear();
      this.mouseDown = [false, false, false];
    });

    canvas.addEventListener('mousedown', (e) => {
      this.setDevice('kbm');
      if (G.mode === 'playing' && !this.pointerLocked) {
        this.requestLock();
        return;
      }
      this.mouseDown[e.button] = true;
      if (e.button === 0) this.pressed.click = true;
      if (e.button === 2) this.pressed.ability1 = true;
    });
    window.addEventListener('mouseup', (e) => (this.mouseDown[e.button] = false));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    window.addEventListener('mousemove', (e) => {
      if (!this.pointerLocked) return;
      const s = (G.save?.settings.sensitivity ?? 1) * 0.0022;
      const inv = G.save?.settings.invertY ? -1 : 1;
      this.look.x -= e.movementX * s;
      this.look.y -= e.movementY * s * inv;
    });
    document.addEventListener('pointerlockchange', () => {
      const was = this.pointerLocked;
      this.pointerLocked = document.pointerLockElement === canvas;
      if (was && !this.pointerLocked) {
        // releasing the mouse on purpose (e.g. opening the big map) must not pause the game
        if (this._quietUnlock) this._quietUnlock = false;
        else if (this.onPointerLockLost) this.onPointerLockLost();
      }
    });

    window.addEventListener('gamepadconnected', () => this.setDevice('pad'));

    // Detect touch devices on first touch
    window.addEventListener(
      'touchstart',
      () => {
        if (!G.isTouch) {
          G.isTouch = true;
          document.body.classList.add('touch');
        }
        this.setDevice('touch');
      },
      { passive: true }
    );
  },

  requestLock() {
    if (G.isTouch || this.device === 'touch') return;
    try {
      const p = this.canvas.requestPointerLock?.();
      if (p && p.catch) p.catch(() => {});
    } catch (_) {}
  },
  /** Free the mouse. `quiet`: on purpose (an overlay that keeps the game running), so don't pause. */
  releaseLock(quiet = false) {
    if (document.pointerLockElement) {
      this._quietUnlock = quiet;
      document.exitPointerLock();
    }
  },

  setDevice(d) {
    if (this.device !== d) {
      this.device = d;
      document.body.dataset.device = d;
      if (this.onDeviceChange) this.onDeviceChange(d);
    }
  },

  /** Wire up on-screen touch controls (elements live in index.html). */
  initTouch(root) {
    const joyZone = root.querySelector('#joy-zone');
    const joyBase = root.querySelector('#joy-base');
    const joyKnob = root.querySelector('#joy-knob');
    const lookZone = root.querySelector('#look-zone');
    const R = 60;

    const joyStart = (e) => {
      if (this.joy.id !== null) return;
      e.preventDefault();
      this.joy.id = e.pointerId;
      this.joy.ox = e.clientX;
      this.joy.oy = e.clientY;
      this.joy.x = this.joy.y = 0;
      joyBase.style.left = e.clientX + 'px';
      joyBase.style.top = e.clientY + 'px';
      joyBase.classList.add('active');
      joyKnob.style.transform = 'translate(-50%,-50%)';
      joyZone.setPointerCapture?.(e.pointerId);
    };
    const joyMove = (e) => {
      if (e.pointerId !== this.joy.id) return;
      e.preventDefault();
      let dx = e.clientX - this.joy.ox, dy = e.clientY - this.joy.oy;
      const d = Math.hypot(dx, dy);
      if (d > R) {
        dx *= R / d;
        dy *= R / d;
      }
      this.joy.x = dx / R;
      this.joy.y = -dy / R;
      joyKnob.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    };
    const joyEnd = (e) => {
      if (e.pointerId !== this.joy.id) return;
      this.joy.id = null;
      this.joy.x = this.joy.y = 0;
      joyBase.classList.remove('active');
    };
    joyZone.addEventListener('pointerdown', joyStart);
    joyZone.addEventListener('pointermove', joyMove);
    joyZone.addEventListener('pointerup', joyEnd);
    joyZone.addEventListener('pointercancel', joyEnd);

    const lookStart = (e) => {
      if (this.lookTouch.id !== null) return;
      e.preventDefault();
      this.lookTouch.id = e.pointerId;
      this.lookTouch.lx = e.clientX;
      this.lookTouch.ly = e.clientY;
      lookZone.setPointerCapture?.(e.pointerId);
    };
    const lookMove = (e) => {
      if (e.pointerId !== this.lookTouch.id) return;
      e.preventDefault();
      const s = (G.save?.settings.touchSensitivity ?? 1) * 0.0055;
      const inv = G.save?.settings.invertY ? -1 : 1;
      this.touchLook.x -= (e.clientX - this.lookTouch.lx) * s;
      this.touchLook.y -= (e.clientY - this.lookTouch.ly) * s * inv;
      this.lookTouch.lx = e.clientX;
      this.lookTouch.ly = e.clientY;
    };
    const lookEnd = (e) => {
      if (e.pointerId === this.lookTouch.id) this.lookTouch.id = null;
    };
    lookZone.addEventListener('pointerdown', lookStart);
    lookZone.addEventListener('pointermove', lookMove);
    lookZone.addEventListener('pointerup', lookEnd);
    lookZone.addEventListener('pointercancel', lookEnd);

    root.querySelectorAll('[data-action]').forEach((btn) => {
      const a = btn.dataset.action;
      // Buttons also let the thumb drag-to-look after pressing (like most mobile shooters)
      let pid = null, lx = 0, ly = 0;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        pid = e.pointerId;
        lx = e.clientX;
        ly = e.clientY;
        btn.setPointerCapture?.(e.pointerId);
        this.touchHeld[a] = true;
        this.pressed[a] = true;
        btn.classList.add('down');
        this.setDevice('touch');
      });
      btn.addEventListener('pointermove', (e) => {
        if (e.pointerId !== pid || a === 'pause') return;
        if (!btn.dataset.drag) return;
        const s = (G.save?.settings.touchSensitivity ?? 1) * 0.0055;
        this.touchLook.x -= (e.clientX - lx) * s;
        this.touchLook.y -= (e.clientY - ly) * s;
        lx = e.clientX;
        ly = e.clientY;
      });
      const up = (e) => {
        if (e.pointerId !== pid) return;
        pid = null;
        this.touchHeld[a] = false;
        btn.classList.remove('down');
      };
      btn.addEventListener('pointerup', up);
      btn.addEventListener('pointercancel', up);
    });
  },

  /** Poll devices; call once per frame before game update. */
  update(dt) {
    // keyboard + mouse
    const k = this.keys;
    let mx = 0, my = 0;
    if (k.has('KeyW') || (G.mode === 'playing' && k.has('ArrowUp'))) my += 1;
    if (k.has('KeyS') || (G.mode === 'playing' && k.has('ArrowDown'))) my -= 1;
    if (k.has('KeyD') || (G.mode === 'playing' && k.has('ArrowRight'))) mx += 1;
    if (k.has('KeyA') || (G.mode === 'playing' && k.has('ArrowLeft'))) mx -= 1;

    const held = {
      primary: this.mouseDown[0] && this.pointerLocked,
      ability1: (this.mouseDown[2] && this.pointerLocked) || k.has('KeyQ'),
      ability2: k.has('ShiftLeft') || k.has('ShiftRight'),
      ultimate: k.has('KeyR'),
      jump: k.has('Space'),
      interact: k.has('KeyE') || k.has('KeyF'),
      pause: false,
      inventory: k.has('Tab'),
    };

    // touch
    if (this.joy.id !== null) {
      mx += this.joy.x;
      my += this.joy.y;
    }
    for (const a in this.touchHeld) if (this.touchHeld[a]) held[a] = true;
    this.look.x += this.touchLook.x;
    this.look.y += this.touchLook.y;
    this.touchLook.x = this.touchLook.y = 0;

    // gamepad
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    let pad = null;
    for (const p of pads) if (p && p.connected) { pad = p; break; }
    if (pad) {
      const dz = (v) => (Math.abs(v) < 0.18 ? 0 : (v - Math.sign(v) * 0.18) / 0.82);
      const lx = dz(pad.axes[0] || 0), ly = dz(pad.axes[1] || 0);
      const rx = dz(pad.axes[2] || 0), ry = dz(pad.axes[3] || 0);
      const btn = (i) => !!pad.buttons[i] && (pad.buttons[i].pressed || pad.buttons[i].value > 0.4);
      let any = Math.abs(lx) + Math.abs(ly) + Math.abs(rx) + Math.abs(ry) > 0;
      mx += lx;
      my -= ly;
      const s = (G.save?.settings.padSensitivity ?? 1) * 3.0;
      const inv = G.save?.settings.invertY ? -1 : 1;
      const curve = (v) => Math.sign(v) * v * v;
      this.look.x -= curve(rx) * s * dt;
      this.look.y -= curve(ry) * s * dt * 0.75 * inv;
      for (const i in PADMAP) {
        const down = btn(+i);
        const a = PADMAP[i];
        if (down) {
          held[a] = true;
          any = true;
          if (!this._padPrev[i]) this.pressed[a] = true;
        }
      }
      // menu navigation
      const edge = (i) => btn(i) && !this._padPrev[i];
      if (edge(12)) this.menu.up = true;
      if (edge(13)) this.menu.down = true;
      if (edge(14)) this.menu.left = true;
      if (edge(15)) this.menu.right = true;
      if (edge(0)) this.menu.confirm = true;
      if (edge(1)) this.menu.back = true;
      // stick-as-dpad for menus with repeat
      this._padRepeat -= dt;
      const sx = pad.axes[0] || 0, sy = pad.axes[1] || 0;
      const strong = Math.abs(sx) > 0.6 || Math.abs(sy) > 0.6;
      if (strong && this._padRepeat <= 0) {
        if (Math.abs(sy) > Math.abs(sx)) sy < 0 ? (this.menu.up = true) : (this.menu.down = true);
        else sx < 0 ? (this.menu.left = true) : (this.menu.right = true);
        this._padRepeat = 0.25;
      }
      if (!strong) this._padRepeat = 0;
      for (let i = 0; i < pad.buttons.length; i++) {
        const d = btn(i);
        if (d) any = true;
        this._padPrev[i] = d;
      }
      if (any) this.setDevice('pad');
      this.padConnected = true;
    } else this.padConnected = false;

    const len = Math.hypot(mx, my);
    if (len > 1) {
      mx /= len;
      my /= len;
    }
    this.move.x = mx;
    this.move.y = my;
    for (const a of ACTIONS) this.held[a] = !!held[a];
  },

  endFrame() {
    for (const a of ACTIONS) this.pressed[a] = false;
    this.pressed.click = false;
    this.look.x = this.look.y = 0;
    this.numberPressed = 0;
    for (const m in this.menu) this.menu[m] = false;
  },
};
