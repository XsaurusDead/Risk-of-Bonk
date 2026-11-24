// All DOM UI: menus, character select, logbook, settings, HUD, level-up,
// game over, toasts and controller menu navigation.
import { G } from '../core/state.js';
import { Input } from '../core/input.js';
import { sfx, unlockAudio } from '../core/audio.js';
import { CHARACTERS, CHARACTER_ORDER } from '../data/characters.js';
import { ITEMS, ITEM_LIST } from '../data/items.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import {
  isCharacterUnlocked, isItemUnlocked, isCostumeUnlocked, selectedCostume, unlockSourceFor, achievementProgress, persist, resetSave, setAchievementHandler, DEFAULT_SETTINGS,
} from '../core/save.js';
import { Game } from '../game/game.js';
import { loadRunData } from '../core/runsave.js';
import { diffLabel, DIFF_LABELS, STAGE_TIME } from '../game/director.js';
import { Minimap } from './minimap.js';
import { Music } from '../core/music.js';
import { COSTUMES, COSTUME_LEVELS } from '../game/models.js';
import { charLevelInfo } from '../core/charlevel.js';
import { formatTime, formatNum, RARITY, RARITY_ORDER } from '../core/util.js';
import * as THREE from 'three';
import { icon, achievementIcon, characterIcon, UI_ICONS } from '../data/icons.js';
import { TOME_BY_ID, TOME_SLOTS, TOME_MAX, WEAPON_MAX, WEAPON_SLOTS } from '../data/tomes.js';
import { WEAPONS } from '../data/weapons.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
export const CHAR_EMOJI = { vanguard: '🔫', bonker: '🏏', pyra: '🔥', glacia: '❄️', kestrel: '🏹', tinker: '🔧', kaze: '👊', morrow: '💀', bulwark: '🛡️', nyx: '🗡️', sol: '☀️', rook: '🎯', vex: '☣️', echo: '⏳', grizzle: '🐺', spark: '⚡', mimic: '🎰' };
const KEYS = {
  kbm: ['LMB', 'RMB', 'SHIFT', 'R'],
  pad: ['RT', 'LT', 'RB', 'Y'],
  touch: ['', '', '', ''],
};
const SLOT_NAMES = ['Primary', 'Ability 1', 'Ability 2', 'Ultimate'];
const SLOTS = ['primary', 'ability1', 'ability2', 'ultimate'];
const _v = new THREE.Vector3();

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
function rewardText(a) {
  if (a.reward.costume) {
    const [cid, i] = a.reward.costume.split(':');
    return `Unlocks costume <b style="color:${COSTUMES[+i].swatch || CHARACTERS[cid].color}">${COSTUMES[+i].name} ${CHARACTERS[cid].name}</b>`;
  }
  if (a.reward.character) return `Unlocks <b style="color:${CHARACTERS[a.reward.character].color}">${CHARACTERS[a.reward.character].name}</b>`;
  if (a.reward.item) {
    const it = ITEMS[a.reward.item];
    return `Unlocks ${it.icon} <b class="r-${it.rarity}">${it.name}</b>`;
  }
  return '';
}

export const UI = {
  screen: 'title',
  prevScreen: 'title',
  selChar: null,
  focusEl: null,
  invToggle: false,
  fpsAcc: 0,
  fpsN: 0,
  lastItemCount: -1,

  init() {
    G.ui = this;
    setAchievementHandler((a) => this.toastAchievement(a));

    document.addEventListener('click', (e) => {
      unlockAudio();
      const go = e.target.closest('[data-go]');
      const back = e.target.closest('[data-back]');
      if (go) {
        sfx('ui');
        this.showScreen(go.dataset.go);
      } else if (back) {
        sfx('ui');
        this.goBack(back.dataset.back);
      }
    });
    document.addEventListener('pointerdown', () => unlockAudio(), { once: false, passive: true });

    $('#btn-start').addEventListener('click', () => this.startRun());
    $('#btn-resume').addEventListener('click', () => Game.resume());
    $('#btn-quit').addEventListener('click', () => {
      sfx('ui');
      Game.quitToMenu(false);
    });
    $('#btn-savequit').addEventListener('click', () => {
      sfx('ui');
      Game.quitToMenu(true);
    });
    $('#btn-continue').addEventListener('click', () => {
      unlockAudio();
      sfx('portal');
      this.showScreen('none');
      $('#hud').classList.remove('hidden');
      if (!Game.resumeRun()) this.showScreen('title');
    });
    $('#btn-vic-continue').addEventListener('click', () => {
      sfx('portal');
      Game.continueAfterVictory();
    });
    $('#btn-vic-end').addEventListener('click', () => {
      sfx('ui');
      Game.endRunVictory();
    });
    $('#btn-retry').addEventListener('click', () => {
      const id = G.run?.charId || G.save.lastChar;
      Game.cleanupRun();
      this.showScreen('none');
      Game.startRun(id);
    });
    $('#btn-menu').addEventListener('click', () => Game.quitToMenu());
    $$('.tab').forEach((t) =>
      t.addEventListener('click', () => {
        $$('.tab').forEach((x) => x.classList.toggle('active', x === t));
        this.renderLogbook(t.dataset.tab);
      })
    );
    $('#hud-stats').addEventListener('click', () => (this.invToggle = false));

    Minimap.bind();
    this.bindSelect();
    Input.onDeviceChange = (d) => this.onDevice(d);
    Input.onPointerLockLost = () => {
      if (G.mode === 'playing') Game.pause();
    };
    Input.initTouch($('#touch-controls'));
    this.onDevice(Input.device);
    this.buildCharGrid();
    this.selectChar(G.save.lastChar);
    $('#title-foot').textContent = `${Object.keys(CHARACTERS).filter(isCharacterUnlocked).length}/${CHARACTER_ORDER.length} survivors · ${Object.keys(G.save.achievements).length}/${ACHIEVEMENTS.length} achievements`;
    this.showScreen('title');
  },

  onDevice(d) {
    document.body.dataset.device = d;
    if (d === 'touch') document.body.classList.add('touch');
    this.buildAbilityBar();
    this.updateTouchVisibility();
  },

  updateTouchVisibility() {
    const show = G.isTouch && (G.mode === 'playing' || G.mode === 'transition');
    if (G.mode === 'chest') return;
    $('#touch-controls').classList.toggle('hidden', !show);
  },

  // ------------------------------------------------------------ screens
  showScreen(name) {
    if (name !== this.screen && this.screen !== 'settings') this.prevScreen = this.screen;
    this.screen = name;
    $$('.screen').forEach((s) => s.classList.add('hidden'));
    const el = $('#screen-' + name);
    if (el) el.classList.remove('hidden');
    this.focusEl = null;
    $$('.focus').forEach((f) => f.classList.remove('focus'));
    if (name === 'select') {
      this.buildCharGrid();
      this.selectChar(this.selChar || G.save.lastChar);
    }
    if (name === 'logbook') {
      $$('.tab').forEach((x, i) => x.classList.toggle('active', i === 0));
      this.renderLogbook('ach');
    }
    if (name === 'settings') this.renderSettings();
    if (name === 'title') {
      const d = loadRunData();
      $('#btn-continue').classList.toggle('hidden', !d);
      if (d) $('#continue-info').textContent = `${CHARACTERS[d.charId].name} · Stage ${d.stageNum + 1} · ${formatTime(d.time)} · Lv ${d.level}`;
      $('#title-foot').textContent = `${Object.keys(CHARACTERS).filter(isCharacterUnlocked).length}/${CHARACTER_ORDER.length} survivors · ${Object.keys(G.save.achievements).length}/${ACHIEVEMENTS.length} achievements`;
    }
    const inMenu = G.mode === 'menu';
    $('#hud').classList.toggle('hidden', inMenu || name === 'gameover');
    this.updateTouchVisibility();
  },

  goBack(target) {
    if (target === '__prev') {
      if (G.mode === 'paused') return this.showScreen('pause');
      return this.showScreen(this.prevScreen === 'settings' ? 'title' : this.prevScreen || 'title');
    }
    this.showScreen(target);
  },

  // ------------------------------------------------------------ character select
  buildCharGrid() {
    const strip = $('#cs-strip');
    strip.innerHTML = '';
    for (const id of CHARACTER_ORDER) {
      const c = CHARACTERS[id];
      const b = document.createElement('button');
      b.className = 'cs-mini' + (isCharacterUnlocked(id) ? '' : ' locked');
      b.dataset.char = id;
      b.title = c.name;
      b.style.background = c.color;
      b.style.setProperty('--c', c.color);
      b.innerHTML = characterIcon(id);
      b.addEventListener('click', () => {
        sfx('ui');
        const dir = CHARACTER_ORDER.indexOf(id) >= CHARACTER_ORDER.indexOf(this.selChar) ? 1 : -1;
        this.selectChar(id, dir);
      });
      strip.appendChild(b);
    }
  },

  cycleChar(step) {
    const i = CHARACTER_ORDER.indexOf(this.selChar);
    const n = CHARACTER_ORDER.length;
    this.selectChar(CHARACTER_ORDER[(i + step + n) % n], step);
    sfx('ui');
  },

  selectChar(id, dir = 0) {
    if (!CHARACTERS[id]) id = 'vanguard';
    this.selChar = id;
    const c = CHARACTERS[id];
    const unlocked = isCharacterUnlocked(id);
    const idx = CHARACTER_ORDER.indexOf(id);
    $$('.cs-mini').forEach((m) => m.classList.toggle('sel', m.dataset.char === id));
    const sel = $(`.cs-mini[data-char="${id}"]`);
    sel?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
    $('#cs-count').textContent = `${idx + 1} / ${CHARACTER_ORDER.length}`;

    // ---- hero block (name, title, character level)
    const lv = charLevelInfo(id);
    const src = unlockSourceFor('character', id);
    let hero = `<div class="nm" style="color:${c.color}">${esc(c.name)}</div><div class="tt">${esc(c.title)}</div>`;
    if (unlocked) {
      const pct = lv.max ? 100 : Math.min(100, (lv.into / lv.need) * 100);
      const nextCos = COSTUME_LEVELS.find((l) => l > lv.level);
      hero += `<div class="cs-lvl" style="--c:${c.color}"><span class="badge">Lv ${lv.level}</span><div class="bar"><i style="width:${pct}%"></i></div>
        <small>${lv.max ? 'Max level' : `${formatNum(lv.into)} / ${formatNum(lv.need)} XP`}${nextCos ? ` · next costume at Lv ${nextCos}` : ''}</small></div>`;
    } else if (src) {
      const prog = achievementProgress(src);
      hero += `<div class="cs-lock">🔒 <b>${esc(src.name)}</b> — ${esc(src.desc)}<div class="bar"><i style="width:${Math.min(100, (prog / src.cond.value) * 100)}%"></i></div><small>${formatNum(prog)} / ${formatNum(src.cond.value)}</small></div>`;
    }
    const heroEl = $('#cs-hero');
    heroEl.innerHTML = hero;
    heroEl.style.animation = 'none';
    void heroEl.offsetWidth;
    heroEl.style.animation = '';

    // ---- info panel
    const b = c.base;
    const keys = { kbm: ['AUTO', 'RMB / Q', 'SHIFT', 'R'], pad: ['AUTO', 'LT', 'RB', 'Y'], touch: ['AUTO', '⚡', '2nd', 'ULT'] }[Input.device] || ['AUTO', 'RMB', 'SHIFT', 'R'];
    const stat = (label, val, frac, txt) => `<span>${label}</span><div class="sb"><i style="width:${Math.round(Math.min(1, frac) * 100)}%"></i></div><b>${txt ?? val}</b>`;
    const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
    let panel = `<div class="cs-sec"><h4>Playstyle</h4><p class="cs-lore">${esc(c.lore)}</p></div>
      <div class="cs-sec" style="--c:${c.color}"><h4>Base stats</h4><div class="cs-stats">
        ${stat('Health', b.hp, b.hp / 190)}${stat('Damage', b.damage, b.damage / 15)}${stat('Move speed', b.speed, b.speed / 10.5)}
        ${stat('Armor', b.armor, b.armor / 25)}${stat('Regen', b.regen, b.regen / 2, b.regen + '/s')}${stat('Jumps', b.jumps, b.jumps / 3)}
        ${stat('Range', c.ratings.range, c.ratings.range / 5, stars(c.ratings.range))}${stat('Complexity', c.difficulty, c.difficulty / 3, stars(c.difficulty))}
      </div></div>
      <div class="cs-sec"><h4>Passive</h4>
        <div class="cs-card" style="--c:${c.color}"><div class="ico">${c.passive.icon}</div><div><div class="hd">${esc(c.passive.name)}<span class="tag">PASSIVE</span></div><div class="ds">${esc(c.passive.desc)}</div></div></div></div>
      <div class="cs-sec"><h4>Abilities</h4>`;
    const skills = [c.primary, ...c.abilities];
    skills.forEach((sk, i) => {
      const cd = i === 0 ? `${sk.rate}/s` : `${sk.cd}s${sk.charges ? ` · ${sk.charges} charges` : ''}`;
      const tag = i === 0 ? '<span class="tag auto">AUTO-ATTACK</span>' : `<span class="tag key">${keys[i]}</span>`;
      const slot = ['Primary', 'Ability 1', 'Ability 2', 'Ultimate'][i];
      const extra = i === 0 ? ' Fires automatically at the nearest enemy.' : '';
      panel += `<div class="cs-card ${i === 3 ? 'ult' : ''}" style="--c:${i === 3 ? '#ffb22e' : c.color}"><div class="ico">${sk.icon}</div><div>
        <div class="hd">${esc(sk.name)}<span class="tag">${slot.toUpperCase()}</span>${tag}<span class="cdv">⏱ ${cd}</span></div><div class="ds">${esc(sk.desc)}${extra}</div></div></div>`;
    });
    panel += '</div>';
    const pEl = $('#cs-panel');
    pEl.innerHTML = panel;
    pEl.scrollTop = 0;
    pEl.style.animation = 'none';
    void pEl.offsetWidth;
    pEl.style.animation = '';

    this.renderCostumes();
    $('#btn-start').disabled = !unlocked;
    $('#btn-start').textContent = unlocked ? 'Start Run ▶' : '🔒 Locked';
    if (G.mode === 'menu') Game.setMenuCharacter(id, selectedCostume(id), !unlocked, dir);
  },

  renderCostumes(hoverIdx = null) {
    const id = this.selChar;
    const c = CHARACTERS[id];
    const cur = selectedCostume(id);
    const wrap = $('#cs-costumes');
    wrap.innerHTML = COSTUMES.map((co, i) => {
      const un = isCharacterUnlocked(id) && isCostumeUnlocked(id, i);
      const bg = co.swatch ? co.swatch : c.color;
      return `<button class="cs-swatch ${i === cur ? 'sel' : ''} ${un ? '' : 'locked'}" data-i="${i}" title="${esc(co.name)}" style="background:${bg}">${i === 0 ? characterIcon(id) : ''}</button>`;
    }).join('');
    wrap.querySelectorAll('.cs-swatch').forEach((b) => {
      b.addEventListener('click', () => this.setCostume(+b.dataset.i));
      b.addEventListener('mouseenter', () => this.costumeLabel(+b.dataset.i));
      b.addEventListener('mouseleave', () => this.costumeLabel(null));
    });
    $('#cs-cos-name').textContent = `${COSTUMES[cur].name} ${c.name}`;
    this.costumeLabel(hoverIdx);
  },

  costumeLabel(i) {
    const el = $('#cs-cos-label');
    const id = this.selChar;
    if (i === null || i === undefined) {
      el.textContent = '';
      return;
    }
    const co = COSTUMES[i];
    if (isCostumeUnlocked(id, i)) el.textContent = `${co.name} ${CHARACTERS[id].name}${i ? ' — unlocked' : ''}`;
    else el.textContent = `🔒 ${co.name}: reach character level ${COSTUME_LEVELS[i]} with ${CHARACTERS[id].name} (you are Lv ${charLevelInfo(id).level})`;
  },

  setCostume(i) {
    const id = this.selChar;
    if (!isCharacterUnlocked(id) || !isCostumeUnlocked(id, i)) {
      sfx('deny');
      this.costumeLabel(i);
      return;
    }
    G.save.costumes[id] = i;
    persist();
    sfx('item');
    this.renderCostumes(i);
    if (G.mode === 'menu') Game.setMenuCharacter(id, i, false, 0);
  },

  cycleCostume(step) {
    const n = COSTUMES.length;
    let i = selectedCostume(this.selChar);
    for (let k = 0; k < n; k++) {
      i = (i + step + n) % n;
      if (isCostumeUnlocked(this.selChar, i)) break;
    }
    this.setCostume(i);
  },

  /** Arrows, swipes, drag-to-rotate and keyboard/gamepad for the select screen. */
  bindSelect() {
    $('#cs-prev').addEventListener('click', () => this.cycleChar(-1));
    $('#cs-next').addEventListener('click', () => this.cycleChar(1));
    const drag = $('#cs-drag');
    let sx = 0, lx = 0, t0 = 0, pid = null;
    drag.addEventListener('pointerdown', (e) => {
      pid = e.pointerId;
      sx = lx = e.clientX;
      t0 = performance.now();
      drag.setPointerCapture?.(e.pointerId);
    });
    drag.addEventListener('pointermove', (e) => {
      if (e.pointerId !== pid) return;
      Game.menuSpin += (e.clientX - lx) * 0.012;
      lx = e.clientX;
    });
    const up = (e) => {
      if (e.pointerId !== pid) return;
      pid = null;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 70 && performance.now() - t0 < 450) this.cycleChar(dx < 0 ? 1 : -1);
    };
    drag.addEventListener('pointerup', up);
    drag.addEventListener('pointercancel', up);
    window.addEventListener('keydown', (e) => {
      if (this.screen !== 'select' || e.target?.tagName === 'INPUT') return;
      if (e.code === 'KeyA') this.cycleChar(-1);
      else if (e.code === 'KeyD') this.cycleChar(1);
      else if (e.code === 'KeyQ') this.cycleCostume(-1);
      else if (e.code === 'KeyE') this.cycleCostume(1);
    });
  },

  charLevelUp(id, lvl) {
    const c = CHARACTERS[id];
    const cos = COSTUME_LEVELS.indexOf(lvl);
    this.toastText(`⭐ ${c.name} reached character level ${lvl}!${cos > 0 ? ` (unlocks the ${COSTUMES[cos].name} costume)` : ''}`);
  },

  startRun() {
    if (!isCharacterUnlocked(this.selChar)) {
      sfx('deny');
      return;
    }
    unlockAudio();
    sfx('portal');
    this.showScreen('none');
    $('#hud').classList.remove('hidden');
    Game.startRun(this.selChar);
  },

  // ------------------------------------------------------------ logbook
  renderLogbook(tab) {
    const body = $('#logbook-body');
    if (tab === 'ach') {
      const f = (this.achFilter ||= { mode: 'all', q: '' });
      const done = ACHIEVEMENTS.filter((a) => G.save.achievements[a.id]).length;
      body.innerHTML = `<div class="lb-bar"><input id="lb-q" placeholder="Search achievements…" value="${esc(f.q)}">
        ${[['all', 'All'], ['todo', 'In progress'], ['done', 'Completed'], ['reward', 'Unlocks something']].map(([k, t]) => `<button class="chip ${f.mode === k ? 'on' : ''}" data-mode="${k}">${t}</button>`).join('')}
        <div class="lb-count">${done} / ${ACHIEVEMENTS.length} completed</div></div><div id="lb-list"></div>`;
      const draw = () => {
        const q = f.q.trim().toLowerCase();
        const rows = ACHIEVEMENTS.filter((a) => {
          const isDone = !!G.save.achievements[a.id];
          if (f.mode === 'todo' && isDone) return false;
          if (f.mode === 'done' && !isDone) return false;
          if (f.mode === 'reward' && !a.reward.item && !a.reward.character) return false;
          if (q && !(a.name + ' ' + a.desc + ' ' + rewardText(a)).toLowerCase().includes(q)) return false;
          return true;
        });
        $('#lb-list').innerHTML = rows.map((a) => {
          const isDone = !!G.save.achievements[a.id];
          const prog = isDone ? a.cond.value : achievementProgress(a);
          const pct = Math.min(100, (prog / a.cond.value) * 100);
          return `<div class="ach ${isDone ? 'done' : ''}"><div class="ach-ic">${achievementIcon(a)}</div><div><div class="nm">${esc(a.name)}</div><div class="ds">${esc(a.desc)}</div></div>
            <div class="rw">${rewardText(a)}<br><small>${formatNum(prog)} / ${formatNum(a.cond.value)}</small></div>
            <div class="prog"><i style="width:${pct}%"></i></div></div>`;
        }).join('') || '<p style="color:var(--muted)">Nothing here.</p>';
      };
      draw();
      $('#lb-q').addEventListener('input', (e) => { f.q = e.target.value; draw(); });
      body.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => { f.mode = c.dataset.mode; this.renderLogbook('ach'); }));
    } else if (tab === 'items') {
      let html = '';
      for (const r of RARITY_ORDER) {
        html += `<h3 class="r-${r}">${RARITY[r].name}</h3><div class="item-grid">`;
        for (const it of ITEM_LIST.filter((x) => x.rarity === r)) {
          const unlocked = isItemUnlocked(it.id);
          const src = unlockSourceFor('item', it.id);
          const seen = G.save.discovered[it.id];
          html += `<div class="item-entry ${unlocked ? '' : 'locked'}" style="--c:${RARITY[r].color}"><div class="ic">${it.icon}</div><div>
            <div class="nm">${it.name}${seen ? '' : unlocked ? ' <small style="color:#888">(undiscovered)</small>' : ''}</div>
            <div class="ds">${unlocked ? it.desc : '🔒 ' + (src ? `${src.name}: ${src.desc}` : 'Locked')}</div></div></div>`;
        }
        html += '</div>';
      }
      body.innerHTML = html;
    } else {
      const s = G.save.stats;
      const rows = [
        ['Runs started', s.runs || 0], ['Enemies defeated', s.kills || 0], ['Elites defeated', s.eliteKills || 0], ['Bosses defeated', s.bossKills || 0],
        ['Stages cleared', s.stagesCleared || 0], ['Chests opened', s.chests || 0], ['Coins spent', s.coinsSpent || 0],
        ['Highest stage reached', s.stageReached || 0], ['Longest run', formatTime(s.runTime || 0)], ['Highest level', s.level || 0],
        ['Most items in one run', s.itemsHeld || 0], ['Biggest hit', formatNum(s.maxHit || 0)], ['Critical hits', s.crits || 0], ['Enemies frozen', s.freezes || 0],
        ['Ultimates used', s.ultsUsed || 0],
      ];
      body.innerHTML = `<div class="rec">${rows.map(([a, b]) => `<span>${a}</span><b>${typeof b === 'number' ? b.toLocaleString() : b}</b>`).join('')}</div>`;
    }
  },

  // ------------------------------------------------------------ settings
  renderSettings() {
    const s = G.save.settings;
    const body = $('#settings-body');
    const rows = [
      ['sensitivity', 'Mouse sensitivity', 'range', 0.2, 3, 0.05],
      ['padSensitivity', 'Controller look speed', 'range', 0.3, 3, 0.05],
      ['touchSensitivity', 'Touch look speed', 'range', 0.3, 3, 0.05],
      ['musicVolume', 'Music volume', 'range', 0, 1, 0.05],
      ['volume', 'Sound effects volume', 'range', 0, 1, 0.05],
      ['invertY', 'Invert Y axis', 'toggle'],
      ['aimAssist', 'Aim assist (controller/touch)', 'toggle'],
      ['quality', 'Graphics quality', 'select', [['auto', 'Auto'], ['low', 'Low (phones)'], ['high', 'High']]],
      ['damageNumbers', 'Damage numbers', 'toggle'],
      ['screenShake', 'Screen shake', 'toggle'],
      ['showFps', 'Show FPS', 'toggle'],
    ];
    body.innerHTML = '';
    for (const [key, label, type, a, b, step] of rows) {
      const row = document.createElement('div');
      row.className = 'setting';
      row.innerHTML = `<label>${label}</label>`;
      let ctl;
      if (type === 'range') {
        ctl = document.createElement('input');
        ctl.type = 'range';
        ctl.min = a;
        ctl.max = b;
        ctl.step = step;
        ctl.value = s[key];
        ctl.addEventListener('input', () => {
          s[key] = parseFloat(ctl.value);
          persist();
          if (key === 'musicVolume') Music.applyVolume();
        });
        ctl.dataset.nav = '1';
      } else if (type === 'toggle') {
        ctl = document.createElement('button');
        ctl.className = 'toggle' + (s[key] ? ' on' : '');
        ctl.textContent = s[key] ? 'ON' : 'OFF';
        ctl.addEventListener('click', () => {
          s[key] = !s[key];
          ctl.className = 'toggle' + (s[key] ? ' on' : '');
          ctl.textContent = s[key] ? 'ON' : 'OFF';
          persist();
          if (key === 'showFps') $('#hud-fps').classList.toggle('hidden', !s.showFps);
        });
      } else {
        ctl = document.createElement('select');
        for (const [v, t] of a) {
          const o = document.createElement('option');
          o.value = v;
          o.textContent = t;
          if (s[key] === v) o.selected = true;
          ctl.appendChild(o);
        }
        ctl.addEventListener('change', () => {
          s[key] = ctl.value;
          persist();
          if (key === 'quality') this.toastText('Graphics quality applies after reloading the page.');
        });
        ctl.dataset.nav = '1';
      }
      row.appendChild(ctl);
      body.appendChild(row);
    }
    const reset = document.createElement('div');
    reset.className = 'setting';
    reset.innerHTML = `<label>Reset all progress</label>`;
    const rb = document.createElement('button');
    rb.className = 'toggle';
    rb.textContent = 'Reset…';
    let armed = false;
    rb.addEventListener('click', () => {
      if (!armed) {
        armed = true;
        rb.textContent = 'Click again to confirm';
        return;
      }
      resetSave();
      rb.textContent = 'Progress reset';
      this.buildCharGrid();
      this.selectChar('vanguard');
    });
    reset.appendChild(rb);
    body.appendChild(reset);
    const defaults = document.createElement('div');
    defaults.className = 'setting';
    defaults.innerHTML = `<label>Restore default settings</label>`;
    const db = document.createElement('button');
    db.className = 'toggle';
    db.textContent = 'Restore';
    db.addEventListener('click', () => {
      G.save.settings = { ...DEFAULT_SETTINGS };
      persist();
      this.renderSettings();
    });
    defaults.appendChild(db);
    body.appendChild(defaults);
  },

  // ------------------------------------------------------------ in-run UI
  onStageStart() {
    Minimap.init(G.world);
    $('#hud').classList.remove('hidden');
    this.showScreen('none');
    this.buildAbilityBar();
    this.lastItemCount = -1;
    this.lastTomeKey = null;
    $('#hud-stage').textContent = G.run.stage.name + ` · Stage ${G.run.stageNum + 1}`;
    $('#hud-fps').classList.toggle('hidden', !G.save.settings.showFps);
    this.setBoss(null);
  },

  buildAbilityBar() {
    const bar = $('#hud-abilities');
    const p = G.player;
    if (!p) return;
    const c = p.char;
    const skills = [c.primary, ...c.abilities];
    const keys = KEYS[Input.device] || KEYS.kbm;
    bar.innerHTML = skills.map((s, i) => `<div class="ab ${i === 3 ? 'ult' : ''}" data-slot="${SLOTS[i]}"><span>${s.icon}</span><i class="cd"></i><b class="cdt"></b><span class="key">${keys[i]}</span><span class="chg"></span></div>`).join('');
    // touch buttons get the character's icons
    $('#tb-primary .ic').innerHTML = c.primary.icon;
    $('#tb-a1 .ic').innerHTML = c.abilities[0].icon;
    $('#tb-a2 .ic').innerHTML = c.abilities[1].icon;
    $('#tb-ult .ic').innerHTML = c.abilities[2].icon;
  },

  banner(title, sub, boss = false) {
    const b = $('#hud-banner');
    b.classList.add('hidden');
    void b.offsetWidth;
    b.querySelector('.t').textContent = title;
    b.querySelector('.s').textContent = sub || '';
    b.classList.toggle('boss', boss);
    b.classList.remove('hidden');
    clearTimeout(this.bannerTimer);
    this.bannerTimer = setTimeout(() => b.classList.add('hidden'), 3600);
  },

  setBoss(e, name) {
    this.boss = e;
    $('#hud-boss').classList.toggle('hidden', !e);
    if (e) $('#hud-boss-name').textContent = name || `${e.def.name} — ${e.def.title}`;
  },

  // ------------------------------------------------------------ Moai
  showMoai(choices) {
    const cards = choices.map((id, i) => {
      const it = ITEMS[id];
      return `<button class="up-card" data-i="${i}" style="--c:${RARITY[it.rarity].color}"><div class="ic">${it.icon}</div><div><div class="rr">${RARITY[it.rarity].name}</div><div class="nm">${esc(it.name)}</div><div class="tx">${esc(it.desc)}</div></div><div class="key">[${i + 1}]</div></button>`;
    });
    cards.push(`<button class="up-card devil" data-i="3"><div class="ic">${icon(UI_ICONS.devil)}</div><div><div class="rr">DEVIL'S TRADEMARK</div><div class="nm">Take the Mark</div><div class="tx">A rare currency. What it buys… you'll find out.</div></div><div class="key">[4]</div></button>`);
    $('#moai-cards').innerHTML = cards.join('');
    $$('#moai-cards .up-card').forEach((b) => b.addEventListener('click', () => Game.chooseMoai(+b.dataset.i)));
    this.showScreen('moai');
  },
  hideMoai() {
    this.showScreen('none');
  },

  toastItem(id) {
    const it = ITEMS[id];
    const n = G.player.items[id] || 1;
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.setProperty('--c', RARITY[it.rarity].color);
    t.innerHTML = `<div class="ic">${it.icon}</div><div><div class="nm">${it.name}${n > 1 ? ' ×' + n : ''}</div><div class="ds">${it.desc}</div></div>`;
    this.pushToast(t, '#toasts');
  },
  toastText(text) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.setProperty('--c', '#aaa');
    t.innerHTML = `<div class="ic">${icon(UI_ICONS.info)}</div><div><div class="ds">${esc(text)}</div></div>`;
    this.pushToast(t, '#toasts');
  },
  // Animated achievement popup (queued so several unlocks play one after another)
  toastAchievement(a) {
    (this.achQueue ||= []).push(a);
    if (!this.achShowing) this.nextAchievement();
  },
  nextAchievement() {
    const a = this.achQueue.shift();
    if (!a) {
      this.achShowing = false;
      return;
    }
    this.achShowing = true;
    sfx('achievement');
    const dur = this.achQueue.length > 2 ? 2600 : 4200;
    let reward = '';
    if (a.reward.character) {
      const c = CHARACTERS[a.reward.character];
      reward = `<div class="ap-reward" style="--c:${c.color}"><div class="ap-ri portrait" style="background:${c.color}">${characterIcon(a.reward.character)}</div><div class="ap-rt"><small>NEW SURVIVOR</small><b style="color:${c.color}">${esc(c.name)}</b><span>${esc(c.title)}</span></div></div>`;
    } else if (a.reward.costume) {
      const [cid, ci] = a.reward.costume.split(':');
      const co = COSTUMES[+ci];
      const c = CHARACTERS[cid];
      reward = `<div class="ap-reward" style="--c:${co.swatch}"><div class="ap-ri portrait" style="background:${co.swatch}">${characterIcon(cid)}</div><div class="ap-rt"><small>NEW COSTUME</small><b style="color:${co.swatch}">${esc(co.name)} ${esc(c.name)}</b><span>Equip it on the survivor select screen</span></div></div>`;
    } else if (a.reward.item) {
      const it = ITEMS[a.reward.item];
      const col = RARITY[it.rarity].color;
      reward = `<div class="ap-reward" style="--c:${col}"><div class="ap-ri">${it.icon}</div><div class="ap-rt"><small>NEW ${RARITY[it.rarity].name.toUpperCase()} ITEM</small><b style="color:${col}">${esc(it.name)}</b><span>${esc(it.desc)}</span></div></div>`;
    }
    const el = document.createElement('div');
    el.className = 'ach-pop';
    el.style.setProperty('--dur', dur + 'ms');
    el.innerHTML = `<div class="ap-shine"></div><div class="ap-main"><div class="ap-icon">${achievementIcon(a)}</div><div class="ap-text"><div class="ap-k">ACHIEVEMENT UNLOCKED</div><div class="ap-n">${esc(a.name)}</div><div class="ap-d">${esc(a.desc)}</div></div></div>${reward}`;
    const root = $('#ach-toasts');
    root.innerHTML = '';
    root.appendChild(el);
    setTimeout(() => {
      el.remove();
      this.nextAchievement();
    }, dur);
  },
  pushToast(el, root, life = 4000) {
    const r = $(root);
    r.appendChild(el);
    while (r.children.length > 4) r.firstChild.remove();
    setTimeout(() => el.remove(), life);
  },

  flashCoins() {
    const c = $('#hud-coins');
    c.classList.remove('flash');
    void c.offsetWidth;
    c.classList.add('flash');
  },
  hurt(frac) {
    this.hurtLevel = Math.min(1, (this.hurtLevel || 0) + frac * 3 + 0.15);
  },

  fade(cb) {
    const f = $('#fade');
    f.classList.add('on');
    setTimeout(() => {
      try { cb(); } finally { setTimeout(() => f.classList.remove('on'), 150); }
    }, 550);
  },

  showPause(on) {
    if (on) {
      $('#pause-stats').innerHTML = this.statsHtml();
      this.showScreen('pause');
    } else this.showScreen('none');
  },

  showLevelUp(choices, level) {
    $('#lvl-num').textContent = level;
    const keys = Input.device === 'pad' ? ['A', 'A', 'A'] : ['1', '2', '3'];
    $('#levelup-cards').innerHTML = choices.map((c, i) => `<button class="up-card" data-i="${i}" style="--c:${RARITY[c.rarity].color}">
      <div class="ic">${c.icon}</div><div><div class="rr">${RARITY[c.rarity].name}</div><div class="nm">${c.name}</div>${c.tag ? `<div class="up-tag ${c.kind}">${c.tag}</div>` : ''}<div class="tx">${c.text}</div></div><div class="key">[${keys[i]}]</div></button>`).join('');
    $$('#levelup-cards .up-card').forEach((b) => b.addEventListener('click', () => Game.chooseUpgrade(+b.dataset.i)));
    this.showScreen('levelup');
    this.levelOpenT = performance.now();
  },
  hideLevelUp() {
    this.showScreen('none');
  },

  showVictory(s) {
    const c = CHARACTERS[s.charId];
    $('#victory-body').innerHTML = `<div class="go-stats">
      <div class="go-stat"><b style="color:${c.color}">${c.name}</b>Survivor</div>
      <div class="go-stat"><b>${formatTime(s.time)}</b>Time</div>
      <div class="go-stat"><b>${s.level}</b>Level</div>
      <div class="go-stat"><b>${s.items.reduce((a, [, n]) => a + n, 0)}</b>Items</div>
      <div class="go-stat"><b>${s.kills.toLocaleString()}</b>Kills</div></div>`;
    sfx('legendary');
    this.showScreen('victory');
  },

  showGameOver(s) {
    const c = CHARACTERS[s.charId];
    const lbl = diffLabel(s.diff);
    let html = `<div class="go-stats">
      <div class="go-stat"><b style="color:${c.color}">${c.name}</b>Survivor</div>
      <div class="go-stat"><b>${formatTime(s.time)}</b>Time survived</div>
      <div class="go-stat"><b>${s.stage}</b>Stage reached</div>
      <div class="go-stat"><b>${s.level}</b>Level</div>
      <div class="go-stat"><b>${s.kills.toLocaleString()}</b>Kills</div>
      <div class="go-stat"><b style="color:${lbl.color}">${lbl.name}</b>Difficulty</div></div>`;
    if (s.items.length) {
      html += `<h3>Items</h3><div class="go-items">${s.items.map(([id, n]) => {
        const it = ITEMS[id];
        return `<div class="hud-item" style="--c:${RARITY[it.rarity].color}" title="${esc(it.name)}">${it.icon}${n > 1 ? `<b>${n}</b>` : ''}</div>`;
      }).join('')}</div>`;
    }
    if (s.achievements.length) {
      html += `<div class="go-new"><b>${icon(UI_ICONS.trophy)} New this run:</b><br>${s.achievements.map((id) => {
        const a = ACHIEVEMENTS.find((x) => x.id === id);
        return `${achievementIcon(a)} ${a.name} — ${rewardText(a)}`;
      }).join('<br>')}</div>`;
    }
    $('#gameover-body').innerHTML = html;
    const t = $('#screen-gameover .dead');
    t.textContent = s.victory ? 'RUN COMPLETE' : 'YOU DIED';
    t.classList.toggle('won', !!s.victory);
    this.showScreen('gameover');
  },

  statsHtml() {
    const p = G.player;
    if (!p) return '';
    const s = p.stats;
    const pct = (v) => `${Math.round(v * 100)}%`;
    const armorRed = s.armor >= 0 ? 1 - 100 / (100 + s.armor) : 0;
    const rows = [
      ['Damage', s.damage.toFixed(1)], ['Attack speed', pct(s.attackSpeed)], ['Max HP', Math.round(s.maxHp)], ['Regen', s.regen.toFixed(1) + '/s'],
      ['Armor', `${Math.round(s.armor)} (${pct(armorRed)})`], ['Crit chance', pct(s.crit)], ['Crit damage', pct(s.critMult)], ['Move speed', s.moveSpeed.toFixed(1)],
      ['Cooldowns', pct(s.cdMult)], ['Jumps', s.jumps], ['Area', pct(s.area)], ['Luck', s.luck.toFixed(2)], ['Pickup range', s.pickup.toFixed(1) + 'm'],
      ['XP gain', pct(s.xpMult)], ['Coin gain', pct(s.coinMult)], ['Dodge', pct(s.dodge)],
      ['Projectiles', '+' + (Math.round(s.projectiles * 100) / 100)], ['Life steal', pct(s.lifesteal)], ['Shield', Math.round(s.maxShield)],
    ];
    let html = `<h3>Stats — Level ${p.level}</h3><div class="st-grid">${rows.map(([a, b]) => `<span>${a} <b>${b}</b></span>`).join('')}</div>`;
    const tids = Object.keys(p.tomes);
    html += `<h3>Tomes (${tids.length}/${TOME_SLOTS})</h3>`;
    html += tids.length ? `<div class="inv-list">${tids.map((id) => {
      const t = TOME_BY_ID[id], o = p.tomes[id];
      return `<div class="item-entry" style="--c:#7fd6ff"><div class="ic">${icon(t.icon)}</div><div><div class="nm">${t.name} <span class="lvl">Lv ${o.level}${o.level >= TOME_MAX ? ' MAX' : ''}</span></div><div class="ds">${t.fmt(o.value)}${t.note ? ` · ${t.note}` : ''}</div></div></div>`;
    }).join('')}</div>` : `<p style="color:var(--muted)">No tomes yet — pick them when you level up (max ${TOME_SLOTS} different).</p>`;
    html += `<h3>Weapons (${p.weaponOrder.length}/${WEAPON_SLOTS})</h3><div class="inv-list">${p.weaponOrder.map((id) => {
      const w = p.weapons[id], m = p.weaponMods(id);
      const def = WEAPONS[id];
      const name = def ? def.name : p.char.primary.name;
      const ic = def ? icon(def.icon) : p.char.primary.icon;
      const parts = [`+${pct(m.dmg - 1)} damage`];
      if (w.rate) parts.push(`+${pct(w.rate)} fire rate`);
      if (w.area) parts.push(`+${pct(w.area)} size`);
      if (w.proj) parts.push(`+${Math.round(w.proj * 100) / 100} projectiles`);
      if (m.crit) parts.push(`+${pct(m.crit)} crit`);
      return `<div class="item-entry" style="--c:#ffb22e"><div class="ic">${ic}</div><div><div class="nm">${name} <span class="lvl">Lv ${w.level}${w.level >= WEAPON_MAX ? ' MAX' : ''}${id === 'primary' ? ' · MAIN' : ''}</span></div><div class="ds">${def ? def.desc + '<br>' : ''}${parts.join(' · ')}</div></div></div>`;
    }).join('')}</div>`;
    if (p.itemOrder.length) {
      html += `<h3>Items (${p.itemCount})</h3><div class="inv-list">${p.itemOrder.map((id) => {
        const it = ITEMS[id];
        return `<div class="item-entry" style="--c:${RARITY[it.rarity].color}"><div class="ic">${it.icon}</div><div><div class="nm">${it.name} ×${p.items[id]}</div><div class="ds">${it.desc}</div></div></div>`;
      }).join('')}</div>`;
    } else html += `<p style="color:var(--muted)">No items yet — open chests with coins!</p>`;
    return html;
  },

  // ------------------------------------------------------------ chest roulette
  openRoulette(winnerId, kind, onDone) {
    const N = 56, WIN = 46;
    const ids = Game.rouletteFiller(kind, N);
    ids[WIN] = winnerId;
    // a little near-miss tension: sometimes park a shiny item right next to the winner
    if (Math.random() < 0.4) ids[WIN + (Math.random() < 0.5 ? 1 : -1)] = Game.rouletteFiller('large', 1)[0];
    const strip = $('#rl-strip');
    strip.innerHTML = ids.map((id, i) => {
      const it = ITEMS[id];
      return `<div class="rc" data-i="${i}" style="--c:${RARITY[it.rarity].color}"><div class="ic">${it.icon}</div><div class="nm">${esc(it.name)}</div><i class="bar"></i></div>`;
    }).join('');
    $('#rl-title').innerHTML = kind === 'large' ? `${icon(UI_ICONS.largeChest)} Large Chest` : `${icon(UI_ICONS.chest)} Chest`;
    $('#rl-result').classList.remove('show');
    $('#rl-result').innerHTML = '';
    $('#rl-hint').textContent = '';
    $('#roulette').classList.remove('hidden');
    $('#hud-prompt').classList.add('hidden');
    const card = strip.firstElementChild;
    const cardW = card.getBoundingClientRect().width;
    const step = cardW + 8;
    const winW = $('.rl-window').getBoundingClientRect().width;
    // land somewhere inside the winning card (not always dead centre)
    const inside = cardW * (0.15 + Math.random() * 0.7);
    const target = WIN * step + inside - winW / 2;
    this.rl = { winnerId, onDone, t: 0, dur: 4.6 + Math.random() * 0.8, target, step, winW, lastIdx: -1, done: false, doneT: 0, strip };
    strip.style.transform = 'translateX(0px)';
    $('#roulette').onpointerdown = () => this.skipRoulette();
  },

  skipRoulette() {
    const r = this.rl;
    if (!r) return;
    if (!r.done) r.t = Math.max(r.t, r.dur - 0.05);
    else if (r.doneT > 0.35) this.closeRoulette();
  },

  updateRoulette() {
    const r = this.rl;
    if (!r) return;
    // run on wall-clock time so the spin always takes the same real duration
    const now = performance.now();
    const dt = Math.min(1, (now - (r.last || now)) / 1000);
    r.last = now;
    // ignore the key press that opened the chest; afterwards any confirm-ish input skips
    const skip = Input.pressed.interact || Input.pressed.jump || Input.menu.confirm || Input.pressed.primary || Input.pressed.click;
    if (skip && (r.done || r.t > 0.35)) this.skipRoulette();
    if (!r.done) {
      r.t = Math.min(r.dur, r.t + dt);
      const k = r.t / r.dur;
      const ease = 1 - Math.pow(1 - k, 4); // fast start, long satisfying slowdown
      const x = r.target * ease;
      r.strip.style.transform = `translateX(${-x}px)`;
      const idx = Math.floor((x + r.winW / 2) / r.step);
      if (idx !== r.lastIdx) {
        r.lastIdx = idx;
        sfx('tick', 0.02);
      }
      if (r.t >= r.dur) {
        r.done = true;
        const it = ITEMS[r.winnerId];
        const col = RARITY[it.rarity].color;
        r.strip.querySelector('[data-i="46"]').classList.add('win');
        const res = $('#rl-result');
        res.style.setProperty('--c', col);
        res.innerHTML = `<div class="rr" style="color:${col}">${RARITY[it.rarity].name.toUpperCase()}</div><div class="nm" style="color:${col}">${it.icon} ${esc(it.name)}</div><div class="ds">${esc(it.desc)}</div>`;
        res.classList.add('show');
        sfx(it.rarity === 'legendary' ? 'legendary' : it.rarity === 'epic' ? 'achievement' : 'item');
      }
    } else {
      r.doneT += dt;
      if (r.doneT > 0.35) $('#rl-hint').textContent = Input.device === 'touch' ? 'Tap to continue' : Input.device === 'pad' ? 'Press A to continue' : 'Press E / Space / Click to continue';
      if (r.doneT > 3.2) this.closeRoulette();
    }
  },

  closeRoulette() {
    const r = this.rl;
    if (!r) return;
    this.rl = null;
    $('#roulette').classList.add('hidden');
    r.onDone();
  },

  // ------------------------------------------------------------ per-frame
  update(dt) {
    this.menuNav();
    if (G.mode === 'chest') {
      this.updateRoulette();
      return;
    }
    if (G.save.settings.showFps) {
      this.fpsAcc += dt;
      this.fpsN++;
      if (this.fpsAcc > 0.5) {
        $('#hud-fps').textContent = Math.round(this.fpsN / this.fpsAcc) + ' fps';
        this.fpsAcc = 0;
        this.fpsN = 0;
      }
    }
    if (!G.run || !G.player) return;
    if (G.mode === 'levelup') {
      if (Input.numberPressed >= 1 && Input.numberPressed <= 3) Game.chooseUpgrade(Input.numberPressed - 1);
      return;
    }
    if (G.mode === 'moai') {
      if (Input.numberPressed >= 1 && Input.numberPressed <= 4) Game.chooseMoai(Input.numberPressed - 1);
      return;
    }
    if (G.mode !== 'playing' && G.mode !== 'transition') return;
    this.updateHud(dt);
  },

  updateHud(dt) {
    const run = G.run, p = G.player, s = p.stats;
    const stg = run.stageTime || 0;
    const timerEl = $('#hud-timer');
    if (run.stage.final) timerEl.textContent = formatTime(stg);
    else if (stg > STAGE_TIME) timerEl.textContent = `OVERTIME +${formatTime(stg - STAGE_TIME)}`;
    else timerEl.textContent = `${formatTime(stg)} / ${formatTime(STAGE_TIME)}`;
    timerEl.classList.toggle('ot', stg > STAGE_TIME && !run.stage.final);
    $('#hud-runtime').textContent = `Run ${formatTime(run.time)}`;
    const dv = $('#hud-devil');
    dv.classList.toggle('hidden', !run.devilMarks);
    if (run.devilMarks) dv.querySelector('b').textContent = run.devilMarks;
    const bh = $('#hud-bhop');
    const hop = p.bhop || 1;
    bh.classList.toggle('hidden', hop < 1.05);
    if (hop >= 1.05) bh.textContent = `🐇 ${Math.round(hop * 100)}% speed`;
    this.minimapT = (this.minimapT || 0) - dt;
    if (this.minimapT <= 0) {
      this.minimapT = 0.1;
      Minimap.draw();
    }
    const lbl = diffLabel(run.diff);
    const idx = DIFF_LABELS.indexOf(lbl);
    const next = DIFF_LABELS[idx + 1];
    const frac = next ? (run.diff - lbl.at) / (next.at - lbl.at) : 1;
    const fill = $('#hud-diff-fill');
    fill.style.width = (frac * 100).toFixed(1) + '%';
    fill.style.background = lbl.color;
    $('#hud-diff-label').textContent = lbl.name;
    $('#hud-coin-val').textContent = formatNum(Math.floor(run.coins));

    // hp
    const max = s.maxHp + s.maxShield;
    $('#hud-hp-fill').style.width = ((Math.max(0, p.hp) / max) * 100).toFixed(1) + '%';
    const sh = $('#hud-shield-fill');
    sh.style.left = ((Math.max(0, p.hp) / max) * 100).toFixed(1) + '%';
    sh.style.width = ((p.shield / max) * 100).toFixed(1) + '%';
    $('#hud-barrier-fill').style.width = ((p.barrier / s.maxHp) * 100).toFixed(1) + '%';
    $('#hud-hp-text').textContent = `${Math.ceil(Math.max(0, p.hp + p.shield))} / ${Math.ceil(max)}`;
    $('#hud-level-val').textContent = p.level;
    $('#hud-xp-fill').style.width = ((p.xp / p.xpNext) * 100).toFixed(1) + '%';

    // abilities (desktop bar + touch buttons share data-slot)
    for (let i = 0; i < 4; i++) {
      const slot = SLOTS[i];
      let frac = 0, txt = '', ready = true, chg = '';
      if (i > 0) {
        const max = p.maxCharges(i - 1);
        const cdm = p.cdMax[slot] || 1;
        if (p.charges[slot] <= 0) {
          frac = Math.max(0, p.cd[slot] / cdm);
          txt = p.cd[slot] > 0 ? (p.cd[slot] < 10 ? p.cd[slot].toFixed(1) : Math.ceil(p.cd[slot])) : '';
          ready = false;
        }
        if (max > 1) chg = p.charges[slot];
      }
      for (const el of document.querySelectorAll(`[data-slot="${slot}"]`)) {
        const cd = el.querySelector('.cd');
        if (cd) cd.style.height = (frac * 100).toFixed(0) + '%';
        const t = el.querySelector('.cdt');
        if (t) t.textContent = txt;
        const c = el.querySelector('.chg');
        if (c) c.textContent = chg;
        el.classList.toggle('ready', ready);
      }
    }

    // tomes bar + weapon levels on the ability buttons
    const tkey = Object.entries(p.tomes).map(([k, o]) => k + o.level).join() + '|' + p.weaponOrder.map((id) => id + p.weapons[id].level).join();
    if (tkey !== this.lastTomeKey) {
      this.lastTomeKey = tkey;
      // weapons (gold) | tomes (blue)
      let wh = p.weaponOrder.map((id) => {
        const def = WEAPONS[id];
        const lv = p.weapons[id].level;
        return `<div class="hud-tome weapon" title="${esc(def ? def.name : p.char.primary.name)}">${def ? icon(def.icon) : p.char.primary.icon}<b>${lv >= WEAPON_MAX ? 'MAX' : lv}</b></div>`;
      }).join('');
      for (let k = p.weaponOrder.length; k < WEAPON_SLOTS; k++) wh += '<div class="hud-tome weapon empty"></div>';
      const ids = Object.keys(p.tomes);
      let th = ids.map((id) => `<div class="hud-tome" title="${esc(TOME_BY_ID[id].name)}">${icon(TOME_BY_ID[id].icon)}<b>${p.tomes[id].level}</b></div>`).join('');
      for (let k = ids.length; k < TOME_SLOTS; k++) th += '<div class="hud-tome empty"></div>';
      $('#hud-tomes').innerHTML = `<div class="ht-group">${wh}</div><div class="ht-sep"></div><div class="ht-group">${th}</div>`;
      // the main weapon's level on the primary button
      const pb = $('#hud-abilities .ab[data-slot="primary"]');
      if (pb) {
        let b = pb.querySelector('.wl');
        if (!b) {
          b = document.createElement('span');
          b.className = 'wl';
          pb.appendChild(b);
        }
        const lv = p.weapons.primary.level;
        b.textContent = lv >= WEAPON_MAX ? 'MAX' : 'Lv' + lv;
      }
    }

    // items bar
    if (p.itemCount !== this.lastItemCount) {
      this.lastItemCount = p.itemCount;
      $('#hud-items').innerHTML = p.itemOrder.map((id) => {
        const it = ITEMS[id];
        const n = p.items[id];
        return `<div class="hud-item" style="--c:${RARITY[it.rarity].color}">${it.icon}${n > 1 ? `<b>${n}</b>` : ''}</div>`;
      }).join('');
    }

    // boss
    if (this.boss) {
      const e = this.boss;
      $('#hud-boss-fill').style.width = ((Math.max(0, e.hp) / e.maxHp) * 100).toFixed(1) + '%';
      if (e.dead) this.setBoss(null);
    }

    // objective + portal marker
    const P = G.world.portal;
    let obj = '';
    if (run.stage.final) obj = run.finalSpawnT > 0 ? `${icon(1226)} The Apex Sovereign descends in ${Math.ceil(run.finalSpawnT)}s…` : run.won ? `${icon(UI_ICONS.crown)} Victory!` : `${icon(1226)} Defeat the Apex Sovereign`;
    else if (P.state === 'idle') obj = `${icon(UI_ICONS.portal)} Find the portal and activate it to summon the boss`;
    else if (P.state === 'charging') obj = `${icon(1039)} Charging portal: ${Math.floor(P.charge * 100)}%${!run.bossDead ? ' · Defeat the boss' : ''}${Math.hypot(p.pos.x - P.pos.x, p.pos.z - P.pos.z) > G.world.chargeRadius ? ' · Return to the ring!' : ''}`;
    else if (P.state === 'ready') obj = `${icon(1151)} Portal ready — enter it to continue`;
    const objEl = $('#hud-objective');
    if (this.objHtml !== obj) objEl.innerHTML = this.objHtml = obj;
    this.updatePortalMarker(P, p);

    // interaction prompt
    const it = Game.interactable;
    const prompt = $('#hud-prompt');
    const key = Input.device === 'pad' ? 'X' : Input.device === 'touch' ? '✋' : 'E';
    if (it) {
      let text = '';
      if (it.kind === 'chest') {
        const cost = Game.chestCost(it.obj);
        const can = run.coins >= cost;
        const tn = { normal: '', large: 'Large ', epic: '<span class="r-epic">Epic</span> ', legendary: '<span class="r-legendary">Legendary</span> ' }[it.obj.tier] || '';
        text = `<span class="k">${key}</span>Open ${tn}Chest — <span class="${can ? '' : 'cant'}">${icon(UI_ICONS.coin)} ${cost}</span>`;
      } else if (it.kind === 'portal') {
        const n = run.bossCount || 1;
        text = it.obj.state === 'idle' ? `<span class="k">${key}</span>Activate portal <span class="cant">(summons ${n > 1 ? n + ' bosses' : 'the boss'}!)</span>` : `<span class="k">${key}</span>Enter portal`;
      } else {
        const T = {
          heal: 'Shrine of Healing — restore 50% HP', xp: 'Shrine of Wisdom — gain experience', combat: 'Shrine of Combat — summon challengers for loot',
          boss: `Shrine of the Mountain — ${Math.min(8, (run.bossCount || 1) * 2)}x portal bosses (more loot)`, moai: 'Moai — choose a gift',
        };
        text = `<span class="k">${key}</span>${T[it.kind] || it.kind}`;
      }
      if (prompt.innerHTML !== text) prompt.innerHTML = text;
      prompt.classList.remove('hidden');
    } else prompt.classList.add('hidden');
    $('#tb-interact').classList.toggle('hidden', !it);

    $('#crosshair').classList.toggle('target', !!p.aim.target);

    // hurt vignette (recent damage + low hp)
    this.hurtLevel = Math.max(0, (this.hurtLevel || 0) - dt * 2);
    const low = p.hp / s.maxHp < 0.3 ? 0.35 + Math.sin(G.realTime * 6) * 0.1 : 0;
    $('#hurt-vignette').style.opacity = Math.min(1, Math.max(this.hurtLevel, low)).toFixed(2);

    // inventory / stats overlay
    if (Input.pressed.inventory && Input.device === 'touch') this.invToggle = !this.invToggle;
    const showStats = Input.held.inventory && Input.device !== 'touch' ? true : this.invToggle;
    const st = $('#hud-stats');
    if (showStats) {
      this.statsT = (this.statsT || 0) - dt;
      if (st.classList.contains('hidden') || this.statsT <= 0) {
        st.innerHTML = this.statsHtml();
        this.statsT = 0.5;
      }
      st.classList.remove('hidden');
    } else st.classList.add('hidden');
  },

  updatePortalMarker(P, p) {
    const m = $('#portal-marker');
    if (P.state === 'none') {
      m.classList.add('hidden');
      return;
    }
    if (P.state === 'charging' && Math.hypot(p.pos.x - P.pos.x, p.pos.z - P.pos.z) < G.world.chargeRadius) {
      m.classList.add('hidden');
      return;
    }
    _v.set(P.pos.x, P.pos.y + 6, P.pos.z).project(G.camera);
    const w = window.innerWidth, h = window.innerHeight;
    let x = (_v.x * 0.5 + 0.5) * w, y = (-_v.y * 0.5 + 0.5) * h;
    const behind = _v.z > 1;
    if (behind) {
      x = w - x;
      y = h - 40;
    }
    const pad = 40;
    x = Math.max(pad, Math.min(w - pad, x));
    y = Math.max(pad + 60, Math.min(h - pad - 60, y));
    // keep clear of the on-screen buttons on touch devices
    if (G.isTouch && x > w - 280 && y > h - 300) y = h - 300;
    m.style.left = x + 'px';
    m.style.top = y + 'px';
    m.querySelector('span').textContent = Math.round(p.pos.distanceTo(P.pos)) + 'm';
    m.classList.remove('hidden');
  },

  // ------------------------------------------------------------ controller menu navigation
  menuNav() {
    const nav = Input.menu;
    if (!(nav.up || nav.down || nav.left || nav.right || nav.confirm || nav.back)) return;
    if (G.mode === 'playing' || G.mode === 'transition') return;
    const scr = $('#screen-' + this.screen);
    if (!scr || scr.classList.contains('hidden')) return;
    if (this.screen === 'select') {
      if (nav.left) return this.cycleChar(-1);
      if (nav.right) return this.cycleChar(1);
      if (nav.up) return this.cycleCostume(1);
      if (nav.down) return this.cycleCostume(-1);
      if (nav.confirm) return this.startRun();
      if (nav.back) return this.showScreen('title');
      return;
    }
    if (nav.back) {
      if (this.screen === 'pause') return Game.resume();
      const b = scr.querySelector('[data-back]');
      if (b) {
        b.click();
        return;
      }
    }
    const els = Array.from(scr.querySelectorAll('button:not([disabled]), [data-nav]')).filter((e) => e.offsetParent !== null);
    if (!els.length) return;
    if (!this.focusEl || !els.includes(this.focusEl)) {
      this.setFocus(els[0]);
      if (!nav.confirm) return;
    }
    if (nav.confirm) {
      const f = this.focusEl;
      if (f.tagName === 'SELECT') {
        f.selectedIndex = (f.selectedIndex + 1) % f.options.length;
        f.dispatchEvent(new Event('change'));
      } else f.click();
      return;
    }
    const f = this.focusEl;
    if ((nav.left || nav.right) && f.type === 'range') {
      const st = parseFloat(f.step) || 0.1;
      f.value = parseFloat(f.value) + (nav.right ? st * 2 : -st * 2);
      f.dispatchEvent(new Event('input'));
      return;
    }
    const r0 = f.getBoundingClientRect();
    const cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2;
    const dir = nav.up ? [0, -1] : nav.down ? [0, 1] : nav.left ? [-1, 0] : [1, 0];
    let best = null, bestScore = Infinity;
    for (const e of els) {
      if (e === f) continue;
      const r = e.getBoundingClientRect();
      const dx = r.left + r.width / 2 - cx, dy = r.top + r.height / 2 - cy;
      const along = dx * dir[0] + dy * dir[1];
      if (along <= 4) continue;
      const perp = Math.abs(dx * dir[1] - dy * dir[0]);
      const score = along + perp * 2.5;
      if (score < bestScore) {
        bestScore = score;
        best = e;
      }
    }
    if (best) this.setFocus(best);
  },
  setFocus(el) {
    if (this.focusEl) this.focusEl.classList.remove('focus');
    this.focusEl = el;
    el.classList.add('focus');
    el.scrollIntoView?.({ block: 'nearest' });
    sfx('ui');
    if (el.dataset.char) this.selectChar(el.dataset.char);
  },
};
