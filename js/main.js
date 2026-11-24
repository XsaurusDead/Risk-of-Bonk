// Entry point: renderer/camera setup, boot, and the main loop.
import * as THREE from 'three';
import { G } from './core/state.js';
import { Input } from './core/input.js';
import { loadSave } from './core/save.js';
import { Game } from './game/game.js';
import { UI } from './ui/ui.js';

function showError(msg) {
  let box = document.getElementById('err-box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'err-box';
    box.style.cssText = 'position:fixed;left:8px;bottom:8px;max-width:90vw;z-index:99;background:#400;color:#fff;font:12px monospace;padding:8px;border-radius:6px;white-space:pre-wrap;pointer-events:auto';
    document.body.appendChild(box);
  }
  box.textContent = String(msg).slice(0, 600);
}
window.addEventListener('error', (e) => showError(e.message + (e.filename ? `\n${e.filename}:${e.lineno}` : '')));
window.addEventListener('unhandledrejection', (e) => showError('Promise: ' + (e.reason?.stack || e.reason)));

function boot() {
  window.__G = G; // handy for debugging from the console
  window.__Game = Game;
  loadSave();
  const coarse = window.matchMedia?.('(pointer: coarse)').matches;
  if (coarse) {
    G.isTouch = true;
    document.body.classList.add('touch');
    Input.device = 'touch';
  }
  const q = G.save.settings.quality;
  G.quality = q === 'auto' ? (coarse ? 'low' : 'high') : q;

  const canvas = document.getElementById('game');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: G.quality === 'high', powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, G.quality === 'high' ? 2 : 1.25));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = G.quality === 'high';
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  G.renderer = renderer;

  G.scene = new THREE.Scene();
  G.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 450);
  G.clock = new THREE.Clock();

  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    G.camera.aspect = window.innerWidth / window.innerHeight;
    G.camera.updateProjectionMatrix();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && G.mode === 'playing') Game.pause();
  });

  Input.init(canvas);
  Game.init();
  UI.init();
  document.getElementById('loading').classList.add('hidden');
  requestAnimationFrame(loop);
}

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, G.clock.getDelta());
  G.dt = dt;
  G.realTime += dt;
  Input.update(dt);

  if (Input.pressed.pause) {
    if (G.mode === 'playing') Game.pause();
    else if (G.mode === 'paused') Game.resume();
  }
  try {
    switch (G.mode) {
      case 'menu':
        Game.menuUpdate(dt);
        break;
      case 'playing':
        Game.update(dt);
        break;
    }
    UI.update(dt);
  } catch (err) {
    console.error(err);
    showError(err.stack || err.message);
  }
  G.renderer.render(G.scene, G.camera);
  Input.endFrame();
}

boot();
