// Run orchestration: menus backdrop, stage loading, difficulty curve,
// chests, portal/boss event, level-ups, death and stage transitions.
import * as THREE from 'three';
import { G } from '../core/state.js';
import { Input } from '../core/input.js';
import { STAGES, SHOP_STAGE } from '../data/stages.js';
import { BOSSES, ENEMIES } from '../data/enemies.js';
import { ITEMS, ITEM_LIST } from '../data/items.js';
import { TOMES, TOME_SLOTS, TOME_MAX, WEAPON_MAX, WEAPON_SLOTS, WEAPON_STATS, PRIMARY_UPS, ROLL_RARITY } from '../data/tomes.js';
import { WEAPONS, WEAPON_IDS } from '../data/weapons.js';
import { icon } from '../data/icons.js';
import { CHARACTERS } from '../data/characters.js';
import { World, PILLAR_RADIUS, PILLAR_TIME } from './world.js';
import { Player, xpFor } from './player.js';
import { Director } from './director.js';
import { initEnemies, updateEnemies, clearEnemies, spawnEnemy } from './enemies.js';
import { updateCombat, clearCombat } from './combat.js';
import { initFx, updateFx, updateHpBars, updateBlobShadows, clearFx, particles, gibs, ring, shake, floatText } from './fx.js';
import { initPickups, updatePickups, clearPickups, dropItem, rollRarity, rollItem, dropCoins, collectAll, activatePower } from './pickups.js';
import { updateMinions, clearMinions } from './minions.js';
import { windUniform } from './models.js';
import { buildCharacter, loadCharModel, hasCharModel } from './charmodels.js';
import { loadEnemyModel } from './enemymodels.js';
import { loadVoxModel } from './voxelsprites.js';

/** Start loading every GLB / voxel model this stage can spawn (boss, its minions, the pool). */
function preloadStageModels(stage) {
  const ids = Object.keys(stage.enemies || {});
  const boss = BOSSES[stage.boss];
  if (boss?.summon) ids.push(boss.summon);
  ids.push('reaper'); // overtime wraiths
  for (const def of [boss, ...ids.map((id) => ENEMIES[id])]) {
    if (def?.glb) loadEnemyModel(def.glb);
    if (def?.vox) loadVoxModel(def.vox);
  }
}
import { sfx } from '../core/audio.js';
import { track, trackMax, commitRunBests, persist, selectedCostume, isTomeUnlocked, isItemUnlocked } from '../core/save.js';
import { weightedPick, shuffle, rand, RARITY } from '../core/util.js';
import { saveRun, clearRun, loadRunData } from '../core/runsave.js';
import { Music } from '../core/music.js';
import { recordRun } from '../core/leaderboard.js';

/** Share of Moai that also offer the Devil's Trademark. */
const MOAI_DEVIL_CHANCE = 0.25;
import { updateGlyphs, clearGlyphs, glyphRing } from './glyphs.js';

const _v = new THREE.Vector3();
const SILHOUETTE = new THREE.MeshBasicMaterial({ color: 0x07040c });
// which showcase animation each survivor plays on the select screen
const MENU_ANIM = { bonker: 'swing', sol: 'swing', kaze: 'punch', pyra: 'cast', glacia: 'cast', morrow: 'cast', vex: 'cast', echo: 'cast', spark: 'cast' };

export const Game = {
  init() {
    const scene = G.scene;
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.1);
    scene.add(this.hemi);
    this.sun = new THREE.DirectionalLight(0xffffff, 2);
    this.sun.position.set(40, 80, 30);
    this.sun.castShadow = G.quality !== 'low';
    const sc = this.sun.shadow.camera;
    sc.left = sc.bottom = -45;
    sc.right = sc.top = 45;
    sc.near = 1;
    sc.far = 200;
    this.sun.shadow.mapSize.set(2048, 2048);
    this.sun.shadow.bias = -0.0005;
    scene.add(this.sun, this.sun.target);
    scene.fog = new THREE.Fog(0xffffff, 40, 170);
    this.sunOffset = new THREE.Vector3(60, 55, 25);
    this.buildSky();

    initFx(scene);
    initPickups(scene, (id) => this.onItemCollected(id));
    initEnemies();
    this.enterMenu();
  },

  buildSky() {
    const geo = new THREE.SphereGeometry(400, 32, 16);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: {
        top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, ground: { value: new THREE.Color() },
        sunDir: { value: this.sunOffset.clone().normalize() }, sunCol: { value: new THREE.Color() },
      },
      vertexShader: `varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          vec4 p = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * p;
          gl_Position.z = gl_Position.w; // always at the far plane
        }`,
      fragmentShader: `uniform vec3 top; uniform vec3 horizon; uniform vec3 ground; uniform vec3 sunDir; uniform vec3 sunCol;
        varying vec3 vDir;
        void main() {
          vec3 d = normalize(vDir);
          float h = d.y;
          vec3 c = h > 0.0 ? mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.55)) : mix(horizon, ground, clamp(-h * 4.0, 0.0, 1.0));
          float s = max(dot(d, normalize(sunDir)), 0.0);
          c += sunCol * (pow(s, 900.0) * 2.5 + pow(s, 24.0) * 0.25 + pow(s, 4.0) * 0.06);
          gl_FragColor = vec4(c, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    this.sky = new THREE.Mesh(geo, mat);
    this.sky.frustumCulled = false;
    this.sky.renderOrder = -10;
    G.scene.add(this.sky);
  },

  applyStageLook(stage) {
    const u = this.sky.material.uniforms;
    const horizon = new THREE.Color(stage.fog);
    u.horizon.value.copy(horizon);
    u.top.value.set(stage.sky).lerp(new THREE.Color(0x0a1a4a), 0.18);
    u.ground.value.copy(horizon).multiplyScalar(0.8);
    u.sunCol.value.set(stage.sun);
    G.scene.background = null;
    G.scene.fog.color.set(stage.fog);
    G.scene.fog.near = 30;
    G.scene.fog.far = stage.fogFar;
    this.hemi.color.set(stage.hemiSky);
    this.hemi.groundColor.set(stage.hemiGround);
    const pbr = G.quality === 'high';
    this.hemi.intensity = stage.hemiInt * (pbr ? 1.0 : 1);
    this.sun.color.set(stage.sun);
    this.sun.intensity = stage.sunInt * (pbr ? 1.05 : 1);
  },

  // ------------------------------------------------------------ menu backdrop
  enterMenu() {
    Music.playMenu();
    this.cleanupRun();
    G.mode = 'menu';
    if (!this.menuWorld) {
      this.menuWorld = new World(STAGES[0], 4242, 0);
    }
    G.world = this.menuWorld;
    G.scene.add(this.menuWorld.group);
    this.applyStageLook(STAGES[0]);
    this.menuT = 0;
    this.setMenuCharacter(G.save.lastChar, selectedCostume(G.save.lastChar));
  },

  setMenuCharacter(id, costume = 0, locked = false, dir = 0) {
    if (this.menuModel) G.scene.remove(this.menuModel.root);
    this.menuModel = buildCharacter(id, costume);
    if (locked && this.menuModel.rig.anim) this.menuModel.rig.anim.frozen = true;
    // the 3D model loads on demand: show the block model meanwhile, then swap it in
    if (!hasCharModel(id)) {
      loadCharModel(id).then((ok) => {
        if (ok && this.menuChar === id && G.mode === 'menu' && this.menuModel && !this.menuModel.glb) this.setMenuCharacter(id, costume, locked, 0);
      });
    }
    const h = this.menuWorld.heightAt(0, 0);
    this.menuModel.root.position.set(0, h, 0);
    if (locked) {
      // unknown survivors are shown as a dark silhouette
      this.menuModel.root.traverse((o) => { if (o.isMesh) o.material = SILHOUETTE; });
    }
    G.scene.add(this.menuModel.root);
    this.menuChar = id;
    this.menuLocked = locked;
    this.menuSwitchT = 0;
    this.menuSwitchDir = dir || 1;
    this.menuShowT = 1.2; // first showcase attack shortly after switching
    this.menuSpin = 0;
    if (!locked && dir) particles(this.menuModel.root.position.clone().setY(h + 1), new THREE.Color(CHARACTERS[id].color).getHex(), 24, 5, 0.7, 0.3);
  },

  /** Title-screen orbit, or the survivor showcase on the select screen. */
  menuUpdate(dt) {
    this.menuT += dt;
    const w = this.menuWorld;
    const h = w.heightAt(0, 0);
    const cam = G.camera;
    const selecting = G.ui?.screen === 'select';
    if (selecting) {
      // frame the survivor in the space left of the info panel
      const panel = document.getElementById('cs-panel');
      const portrait = window.innerWidth <= window.innerHeight;
      const shift = !portrait && panel ? panel.getBoundingClientRect().width / 2 : 0;
      cam.setViewOffset(window.innerWidth, window.innerHeight, shift, portrait ? window.innerHeight * 0.16 : 0, window.innerWidth, window.innerHeight);
      cam.position.set(0, h + 1.7, 5.6);
      cam.lookAt(0, h + 1.2, 0);
      this.viewOffset = true;
    } else {
      if (this.viewOffset) {
        cam.clearViewOffset();
        this.viewOffset = false;
      }
      const a = this.menuT * 0.08;
      const off = window.innerWidth > window.innerHeight && G.ui?.screen === 'title' ? 2.2 : 0;
      cam.position.set(Math.sin(a) * 7, h + 2.6, Math.cos(a) * 7);
      cam.lookAt(-Math.cos(a) * off, h + 1.3, Math.sin(a) * off);
    }
    if (this.menuModel) this.animateMenuModel(dt, selecting, h);
    w.update(dt);
    windUniform.value += dt;
    this.sun.position.copy(this.sunOffset);
    this.sun.target.position.set(0, 0, 0);
    this.sky.position.copy(G.camera.position);
    updateFx(dt);
    updateGlyphs(dt);
  },

  animateMenuModel(dt, selecting, h) {
    const m = this.menuModel;
    const r = m.rig;
    const root = m.root;
    this.menuSwitchT += dt;
    // spin-in + scale pop when a new survivor is shown
    const k = Math.min(1, this.menuSwitchT / 0.45);
    const ease = 1 - Math.pow(1 - k, 3);
    const pop = k < 1 ? 0.7 + 0.3 * ease + Math.sin(k * Math.PI) * 0.08 : 1;
    root.scale.setScalar(pop);
    this.menuSpin *= Math.pow(0.15, dt); // drag-to-rotate eases back
    if (selecting) root.rotation.y = (1 - ease) * Math.PI * this.menuSwitchDir + Math.sin(this.menuT * 0.6) * 0.35 + this.menuSpin;
    else root.rotation.y = this.menuT * 0.6;
    // idle: breathing, sway
    const t = this.menuT;
    r.body.position.y = Math.sin(t * 2) * 0.04;
    r.body.rotation.y = 0;
    r.body.rotation.x = 0;
    let armR = Math.sin(t * 1.5) * 0.12 - 0.15, armL = -Math.sin(t * 1.5) * 0.12, twist = 0;
    r.legL.rotation.x = r.legR.rotation.x = 0;
    // showcase: every few seconds perform the primary attack + an ability flourish
    if (selecting && !this.menuLocked) {
      this.menuShowT -= dt;
      if (this.menuShowT <= 0) {
        this.menuShowT = 3.2;
        this.menuAnimT = 0;
        this.menuAnimType = MENU_ANIM[this.menuChar] || 'shoot';
        if (r.anim) r.anim.once('attack', 1.2);
      }
      if (this.menuAnimT !== undefined && this.menuAnimT < 1.2) {
        this.menuAnimT += dt;
        const a = this.menuAnimT;
        const col = new THREE.Color(CHARACTERS[this.menuChar].color).getHex();
        const hand = new THREE.Vector3();
        r.handR.getWorldPosition(hand);
        switch (this.menuAnimType) {
          case 'swing':
            if (a < 0.25) { armR = -2.6 * (a / 0.25); twist = 0.4 * (a / 0.25); }
            else if (a < 0.5) { const q = (a - 0.25) / 0.25; armR = -2.6 + q * 3.4; twist = 0.4 - q * 0.9; if (q > 0.6 && !this.menuFx) { this.menuFx = 1; particles(hand, col, 18, 6, 0.5, 0.3); } }
            break;
          case 'punch':
            if (a < 0.6) { const ph = Math.floor(a / 0.15) % 2; armR = ph ? -1.6 : -0.2; armL = ph ? -0.2 : -1.6; twist = ph ? -0.3 : 0.3; if (Math.random() < 0.3) particles(hand, 0xffffff, 2, 3, 0.25, 0.2); }
            break;
          case 'cast':
            if (a < 0.7) { armR = -1.7; armL = -1.3; r.body.position.y += Math.sin(a * 9) * 0.05; if (Math.random() < 0.5) particles(hand, col, 2, 2, 0.5, 0.22, -2); }
            break;
          default:
            if (a < 0.7) { armR = -1.5; if (this.menuChar === 'vanguard' || this.menuChar === 'bulwark') armL = -1.5; if (Math.random() < 0.4) particles(hand, 0xffee99, 2, 4, 0.2, 0.15, 0); }
        }
        if (a < 0.05) this.menuFx = 0;
        // a little hop of joy at the end
        if (a > 0.8 && a < 1.2) r.body.position.y += Math.sin(((a - 0.8) / 0.4) * Math.PI) * 0.25;
      }
    }
    r.armR.rotation.x = armR;
    r.armL.rotation.x = armL;
    r.body.rotation.y = twist;
    if (r.anim) {
      // rigged model: a little jump at the end of the showcase, otherwise idle
      const a = this.menuAnimT ?? 9;
      r.anim.update(r.anim.frozen ? 0 : dt, selecting && !this.menuLocked && a > 0.75 && a < 1.1 ? 'jump' : 'idle');
      root.position.y = h + (selecting && a > 0.8 && a < 1.2 ? Math.sin(((a - 0.8) / 0.4) * Math.PI) * 0.35 : 0);
    }
  },

  // ------------------------------------------------------------ run lifecycle
  startRun(charId) {
    G.save.lastChar = charId;
    persist();
    clearRun();
    this.startRunBase(charId);
    G.time = 0;
    track('runs');
    this.loadStage();
  },

  /** Continue a saved run (title screen "Continue Run"). */
  resumeRun() {
    const d = loadRunData();
    if (!d) return false;
    this.startRunBase(d.charId);
    const run = G.run, p = G.player;
    run.stageNum = d.stageNum;
    run.stagesCleared = d.stagesCleared;
    run.time = d.time;
    run.coins = d.coins;
    run.stats = d.stats || {};
    run.kills0 = (G.save.stats.kills || 0) - (d.killsThisRun || 0);
    run.chestsOpened = d.chestsOpened || 0;
    run.devilMarks = d.devilMarks || 0;
    p.level = d.level;
    p.xp = d.xp;
    p.xpNext = xpFor(p.level);
    p.pendingLevelUps = d.pendingLevelUps || 0;
    p.items = d.items;
    p.itemOrder = d.itemOrder;
    p.itemCount = Object.values(d.items).reduce((a, b) => a + b, 0);
    p.upgrades = d.upgrades;
    if (d.tomes) p.tomes = d.tomes;
    if (d.weapons?.primary) Object.assign(p.weapons.primary, d.weapons.primary);
    for (const id of d.weaponOrder || []) {
      if (id === 'primary' || !WEAPONS[id] || !d.weapons?.[id]) continue;
      if (p.addWeapon(id)) Object.assign(p.weapons[id], d.weapons[id]);
    }
    p.infusionHp = d.infusionHp || 0;
    p.eaterDmg = d.eaterDmg || 0;
    p.markDirty();
    p.recalcStats();
    G.time = run.time;
    this.loadStage();
    if (G.ui) G.ui.toastText('Run resumed — welcome back!');
    return true;
  },

  startRunBase(charId) {
    G.camera.clearViewOffset();
    this.viewOffset = false;
    if (this.menuModel) {
      G.scene.remove(this.menuModel.root);
      this.menuModel = null;
    }
    if (this.menuWorld) G.scene.remove(this.menuWorld.group);
    G.run = {
      charId, stats: {}, newAchievements: [], coins: 0, stageNum: 0, stagesCleared: 0, loop: 0,
      diff: 1, coinScale: 1, xpScale: 1, chestScale: 1, time: 0, boss: null, secT: 0, kills0: G.save.stats.kills || 0,
      onBossKilled: (e) => this.onBossKilled(e),
      onChampionKilled: (e) => this.onChampionKilled(e),
      chestsOpened: 0, devilMarks: 0,
      onPlayerDeath: () => this.onPlayerDeath(),
    };
    if (G.player) G.player.dispose(); // never leave an old survivor model in the scene
    G.player = new Player(charId);
    G.minions = [];
  },

  loadStage() {
    const run = G.run;
    clearEnemies();
    clearCombat();
    clearPickups();
    clearFx();
    clearGlyphs();
    clearMinions(true);
    if (G.world && G.world !== this.menuWorld) G.world.dispose();
    const stage = STAGES[run.stageNum % STAGES.length];
    run.loop = Math.floor(run.stageNum / STAGES.length);
    run.stage = stage;
    this.updateDifficulty();
    run.chestScale = Math.pow(run.diff, 0.85);
    G.world = new World(stage, (Math.random() * 1e9) | 0, run.loop);
    G.scene.add(G.world.group);
    this.applyStageLook(stage);
    this.director = new Director(stage);
    run.boss = null;
    run.bossDead = false;
    run.bossCount = 1;
    run.stageTime = 0;
    run.finalSpawnT = 0;
    run.powers = {};
    run.saveT = 0;
    if (stage.final) {
      // no portal on the final stage: the Apex Sovereign comes to you
      G.world.portal.state = 'none';
      G.world.portal.group.visible = false;
      run.finalSpawnT = 8;
    }

    const p = G.player;
    p.pos.set(0, G.world.heightAt(0, 0) + 25, 0);
    p.vel.set(0, -10, 0);
    p.grounded = false;
    p.dead = false;
    p.model.rotation.x = 0;
    p.hp = p.stats.maxHp;
    p.stageKills = 0;
    p.camYaw = Math.atan2(-(G.world.portalPos.x), -(G.world.portalPos.z)) + Math.PI + (Math.random() - 0.5) * 2;
    for (const m of G.minions) m.pos.copy(p.pos);

    trackMax('stageReached', run.stageNum + 1);
    // animated / voxel models of this stage's enemies and boss build in the background
    preloadStageModels(stage);
    G.mode = 'playing';
    if (G.ui) {
      G.ui.onStageStart();
      G.ui.banner(stage.name + (run.loop ? ` (Loop ${run.loop + 1})` : ''), stage.subtitle);
    }
    sfx('portal');
    Input.requestLock();
    Music.duck(false);
    Music.playStage(!!stage.final);
    saveRun();
  },

  updateDifficulty() {
    const run = G.run;
    const minutes = run.time / 60;
    // Exponential in both time and stages cleared (Megabonk-style: enemies mostly scale with
    // time, so a good build really feels strong). Overtime keeps the old, much harsher curve.
    // the Tome of Chaos (and anything else that adds `difficulty`) turns everything up by its %
    run.diffBonus = G.player?.stats.difficulty || 0;
    run.diff = Math.pow(1.06, minutes) * Math.pow(1.35, run.stagesCleared) * (1 + run.diffBonus);
    run.diffHard = Math.pow(1.055, minutes) * Math.pow(1.3, run.stagesCleared);
    // Enemies keep up with YOU: their health follows your damage per second, their damage
    // follows how much punishment you can take (HP, armor, shield). Updated twice a second.
    run.powerT = (run.powerT || 0) - G.dt;
    const p = G.player;
    if (p && p.stats.damage && run.powerT <= 0) {
      run.powerT = 0.5;
      const s = p.stats;
      const critF = 1 + Math.min(1, s.crit) * (s.critMult - 1);
      // what your build should deal (main weapon + extra weapons + items)...
      const formula = s.damage * s.attackSpeed * critF * 4 * (1 + 0.05 * (p.itemCount || 0)) * (1 + 0.35 * ((p.weaponOrder?.length || 1) - 1)) * (1 + (s.projectiles || 0) * 0.5);
      // ...and what you actually dealt recently (smoothed; capped so one big burst doesn't spike it)
      if (run.dps > 0 && run.dps !== run.lastDpsSample) {
        run.lastDpsSample = run.dps;
        run.dpsAvg = run.dpsAvg ? run.dpsAvg * 0.85 + run.dps * 0.15 : run.dps;
      }
      const dps = Math.max(formula, Math.min(run.dpsAvg || 0, formula * 3));
      run.playerDps = dps;
      // only a gentle nudge from your build (strong builds should feel strong)...
      // later stages follow very strong builds a bit more closely (no endless snowball)
      run.hpScale = Math.pow(Math.max(1, dps / 150), Math.min(0.72, 0.45 + 0.035 * run.stagesCleared));
      const ehp = s.maxHp * (1 + Math.max(0, s.armor) / 100) + (s.maxShield || 0);
      run.playerEhp = ehp;
      run.dmgScale = Math.pow(Math.max(1, ehp / 250), 0.4);
      // ...except in overtime, which still hunts you down whatever you built
      run.hpScaleHard = Math.pow(Math.max(1, dps / 50), 0.75);
      run.dmgScaleHard = Math.pow(Math.max(1, ehp / 110), 0.7);
    }
    run.coinScale = Math.pow(run.diff, 0.45);
    run.xpScale = Math.pow(run.diff, 0.65);
  },

  cleanupRun() {
    clearEnemies();
    clearCombat();
    clearPickups();
    clearFx();
    clearGlyphs();
    clearMinions(false);
    if (G.player) {
      G.player.dispose();
      G.player = null;
    }
    if (G.world && G.world !== this.menuWorld) G.world.dispose();
    G.world = null;
    G.run = null;
  },

  /** Save & Quit keeps the checkpoint; abandon deletes it. */
  quitToMenu(keepSave = false) {
    if (G.run) {
      if (keepSave && !G.run.ended && !G.player?.dead) saveRun();
      else {
        clearRun();
        // abandoning a run still puts it on the leaderboard
        if (!G.run.ended && G.player && !G.player.dead) recordRun(this.summary(), 'quit');
      }
      commitRunBests();
    }
    this.enterMenu();
    if (G.ui) G.ui.showScreen('title');
  },

  // ------------------------------------------------------------ main update
  update(dt) {
    const run = G.run;
    const p = G.player;
    if (!run.inShop) run.time += dt; // time stands still in the Red Market
    G.time = run.time;
    this.updateDifficulty();
    run.secT += dt;
    if (run.secT >= 1) {
      run.secT = 0;
      trackMax('runTime', Math.floor(run.time));
    }

    p.update(dt);
    if (!p.dead && !run.inShop) this.director.update(dt);
    updateEnemies(dt);
    updateMinions(dt);
    updateCombat(dt);
    updatePickups(dt);
    G.world.update(dt);
    updateFx(dt);
    updateGlyphs(dt);
    updateHpBars();
    this.updatePortal(dt);
    this.updatePillars(dt);
    this.updateShrines();
    if (run.finalSpawnT > 0) {
      run.finalSpawnT -= dt;
      if (run.finalSpawnT <= 0) this.spawnFinalBoss();
    }
    if (!run.inShop) run.saveT += dt;
    if (run.saveT > 15 && !p.dead) {
      run.saveT = 0;
      saveRun();
    }
    this.updateAmbient(dt);

    // shadow camera follows the player
    this.sun.position.copy(p.pos).add(this.sunOffset);
    this.sun.target.position.copy(p.pos);
    this.sky.position.copy(G.camera.position);
    windUniform.value += dt;
    updateBlobShadows();

    // interaction
    this.interactable = p.dead ? null : G.world.findInteractable(p.pos);
    if (Input.pressed.interact && this.interactable) this.interact(this.interactable);

    // level ups
    if (p.pendingLevelUps > 0 && !p.dead && G.mode === 'playing') this.openLevelUp();
  },

  updateAmbient(dt) {
    const st = G.run.stage;
    const p = G.player;
    if (st.snow && Math.random() < 0.6) {
      particles(_v.set(p.pos.x + rand(-25, 25), p.pos.y + 14, p.pos.z + rand(-25, 25)), 0xffffff, 1, 0.5, 3, 0.15, 3);
    }
    if (st.embers && Math.random() < 0.4) {
      particles(_v.set(p.pos.x + rand(-25, 25), G.world.liquidLevel, p.pos.z + rand(-25, 25)), 0xff7733, 1, 1, 2.5, 0.15, -2);
    }
    if (st.id === 'void' && Math.random() < 0.3) {
      particles(_v.set(p.pos.x + rand(-25, 25), p.pos.y + rand(0, 8), p.pos.z + rand(-25, 25)), 0xb455ff, 1, 0.3, 2, 0.12, -0.5);
    }
    if (st.id === 'hollow' && Math.random() < 0.3) {
      particles(_v.set(p.pos.x + rand(-20, 20), p.pos.y + rand(0, 5), p.pos.z + rand(-20, 20)), 0x2fffe0, 1, 0.3, 2.5, 0.1, -0.3);
    }
  },

  // ------------------------------------------------------------ interaction
  /**
   * Chest prices rise with every chest opened this run (Megabonk-style):
   * 10, 13, 16, 20, 24 … the steps grow gently as you progress.
   */
  chestCost(c) {
    if (c.free) return 0;
    const p = G.player;
    const n = G.run.chestsOpened || 0;
    const base = 10 * (1 + 0.25 * n + 0.035 * n * n);
    const tierMult = { normal: 1, large: 2, epic: 4, legendary: 8 }[c.tier] || 1;
    // prices also follow the difficulty (like gold does), so late-game gold doesn't buy hundreds of chests
    return Math.ceil(base * tierMult * Math.pow(Math.max(1, G.run.diff || 1), 0.45) * (1 - p.stats.chestDiscount));
  },

  interact(it) {
    const o = it.obj;
    switch (it.kind) {
      case 'chest': return this.openChest(o);
      case 'portal':
        if (G.world.stage.shop) return this.exitShop();
        if (o.state === 'idle') this.activatePortal();
        else if (o.state === 'ready') this.leaveStage();
        return;
      case 'shop': return this.openShop();
      case 'redportal':
        if (!(G.run.devilMarks > 0)) return;
        if (G.world.portal.state !== 'ready') {
          G.ui?.toastText('The red portal opens once the stage portal is charged and the boss is dead.');
          sfx('deny', 0.3);
          return;
        }
        G.run.devilMarks--;
        track('redPortals');
        return this.leaveStage(true);
      case 'heal': return this.useShrine(o, () => {
        const p = G.player;
        p.heal(p.stats.maxHp * 0.5);
        ring(p.pos, 6, 0x55ff88, 0.6);
        particles(p.pos, 0x55ff88, 30, 6, 0.8);
        floatText(p.pos.clone().setY(p.pos.y + 2.5), '+50% HP', '#88ff99', true);
        sfx('levelup');
      });
      case 'pillar': return this.activatePillar(o);
      case 'boss': return this.useShrine(o, () => {
        const run = G.run;
        if (G.world.portal.state !== 'idle') return false;
        run.bossCount = Math.min(8, (run.bossCount || 1) * 2);
        const word = { 2: 'DOUBLED', 4: 'QUADRUPLED', 8: 'OCTUPLED' }[run.bossCount];
        G.ui?.banner(`Boss ${word}`, `${run.bossCount} bosses will guard the portal — each drops loot`, true);
        sfx('roar');
      });
      case 'combat': return this.useShrine(o, () => this.startCombatShrine(o));
      case 'moai': return this.openMoai(o);
      case 'magnet': return this.useShrine(o, () => {
        activatePower('magnet', 20);
        G.ui?.banner('Magnet Statue', 'Every coin and orb is yours — 20 seconds');
      });
    }
  },

  useShrine(o, fn) {
    if (o.used) return;
    if (fn() === false) {
      sfx('deny', 0.2);
      G.ui?.toastText('The portal is already active.');
      return;
    }
    o.used = true;
    track('shrinesUsed');
  },

  startCombatShrine(o) {
    const run = G.run;
    const ids = Object.keys(run.stage.enemies);
    const n = 6 + Math.min(10, run.stagesCleared * 2 + Math.floor((run.stageTime || 0) / 120));
    o.wave = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const pos = o.pos.clone().add(_v.set(Math.cos(a) * 9, 0, Math.sin(a) * 9));
      const e = spawnEnemy(ids[i % ids.length], pos, { elite: i < 1 + run.loop ? 'blazing' : null });
      if (e) o.wave.push(e);
    }
    G.ui?.banner('Shrine of Combat', `Defeat ${n} challengers for a reward`, true);
    sfx('roar');
  },

  updateShrines() {
    for (const o of G.world.interactables) {
      if (o.kind !== 'combat' || !o.wave) continue;
      if (o.wave.every((e) => e.dead)) {
        o.wave = null;
        dropItem(o.pos.clone().setY(o.pos.y + 3), rollItem(rollRarity('large')));
        dropCoins(o.pos, 15 * G.run.coinScale);
        ring(o.pos, 8, 0xff4433, 0.6);
        G.ui?.banner('Challenge complete', 'The shrine rewards you');
        sfx('item');
      }
    }
  },

  // ---- Moai: pick 1 of 3 items or a Devil's Trademark
  openMoai(o) {
    if (o.used) return;
    const kind = 'small';
    const seen = new Set();
    const choices = [];
    for (let k = 0; k < 30 && choices.length < 3; k++) {
      const id = rollItem(rollRarity(kind));
      if (!seen.has(id)) { seen.add(id); choices.push(id); }
    }
    // the red Devil's Trademark is only offered by some Moai (1 in 4)
    const devil = Math.random() < MOAI_DEVIL_CHANCE;
    this.moaiState = { o, choices, devil };
    G.mode = 'moai';
    Input.releaseLock();
    G.ui?.showMoai(choices, devil);
    sfx('portal');
  },
  chooseMoai(i) {
    const st = this.moaiState;
    if (!st || G.mode !== 'moai') return;
    const run = G.run;
    st.o.used = true;
    track('shrinesUsed');
    if (i === 3 && !st.devil) return;
    if (i === 3) {
      run.devilMarks = (run.devilMarks || 0) + 1;
      track('devilMarks');
      G.ui?.toastText("You took a Devil's Trademark. Its price will come due…");
      sfx('roar');
    } else if (st.choices[i]) this.onItemCollected(st.choices[i]);
    this.moaiState = null;
    G.ui?.hideMoai();
    G.mode = 'playing';
    Input.requestLock();
  },

  openChest(c) {
    const run = G.run;
    if (c.used) return;
    const cost = this.chestCost(c);
    if (run.coins < cost) {
      sfx('deny', 0.2);
      if (G.ui) G.ui.flashCoins();
      return;
    }
    run.coins -= cost;
    if (!c.free) run.chestsOpened = (run.chestsOpened || 0) + 1; // dropped free chests don't raise prices
    c.used = true;
    track('chests');
    if (c.tier === 'large') track('largeChests');
    if (c.tier === 'epic' || c.tier === 'legendary') track('specialChests');
    track('coinsSpent', cost);
    const kind = { normal: 'small', large: 'large', epic: 'epic', legendary: 'legendary' }[c.tier] || 'small';
    const id = rollItem(rollRarity(kind));
    particles(c.pos, 0xffe680, 20, 6, 0.6);
    gibs(c.pos.clone().setY(c.pos.y + 0.6), 0xffcc22, c.tier !== 'normal' ? 14 : 8, 6, 0.22); // coin shower
    c.group.scale.set(1.15, 0.85, 1.15);
    setTimeout(() => c.group.scale.set(1, 1, 1), 120);
    sfx('chest');
    // Freeze the whole game while the CS:GO-style roulette spins.
    G.mode = 'chest';
    if (G.ui) G.ui.openRoulette(id, kind, () => this.finishChest(c, id));
    else this.finishChest(c, id);
  },

  /** Filler items for the roulette strip, rolled with the same odds as the chest. */
  rouletteFiller(kind, n) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(rollItem(rollRarity(kind)));
    return out;
  },

  finishChest(c, id) {
    G.mode = 'playing';
    this.onItemCollected(id);
    particles(G.player.pos, 0xffffff, 16, 6, 0.6);
    Input.requestLock();
  },

  activatePortal() {
    const run = G.run;
    const P = G.world.portal;
    P.state = 'charging';
    P.charge = 0;
    const bossId = run.stage.boss;
    const def = BOSSES[bossId];
    const count = run.bossCount || 1;
    run.bossesAlive = 0;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const pos = P.pos.clone().add(_v.set(Math.cos(a) * (14 + i * 2), 0, Math.sin(a) * (14 + i * 2)));
      G.world.clampBounds(pos);
      const b = spawnEnemy(bossId, pos, { boss: true });
      if (b) {
        run.bossesAlive++;
        if (!run.boss) run.boss = b;
        glyphRing(b.pos, 8, 3.6, 'H', 29, { height: 3.4, life: 1.8, rise: 0.4, stagger: 0.05 });
      }
    }
    if (run.loop > 0 && Math.random() < 0.5 + run.loop * 0.2) {
      // later loops can bring an extra elite guard
      spawnEnemy(Object.keys(run.stage.enemies)[0], P.pos.clone().add(_v.set(4, 0, 4)), { elite: 'overloading' });
    }
    if (G.ui) {
      G.ui.banner(def.name, def.title, true);
      G.ui.setBoss(run.boss);
    }
    Music.playBoss();
    shake(0.6);
    sfx('roar');
  },

  /** Charge pillars: no interaction — step into the ring and it starts charging; stay until it's full for a free level-up choice. */
  activatePillar(o) {
    if (o.used || o.state === 'charging') return;
    o.state = 'charging';
    o.charge = o.charge || 0;
    sfx('portal');
    ring(o.pos, PILLAR_RADIUS, 0xffc040, 0.6);
    if (!o.woke) G.ui?.toastText(o.golden ? 'Golden pillar charging — stay in the ring for a LEGENDARY upgrade' : 'Pillar charging — stay in the ring for a free upgrade');
    if (o.woke) return;
    o.woke = true;
    // its glow draws a pack of enemies
    this.director?.spawnGroup(4 + Math.floor((G.run.stageTime || 0) / 90), { far: true });
  },

  updatePillars(dt) {
    const p = G.player;
    for (const o of G.world.interactables) {
      if (o.kind !== 'pillar' || o.used) continue;
      const inZone = !p.dead && Math.hypot(p.pos.x - o.pos.x, p.pos.z - o.pos.z) < PILLAR_RADIUS && Math.abs(p.pos.y - o.pos.y) < 8;
      // charging starts by itself as soon as you step into the ring
      if (o.state !== 'charging') {
        if (!inZone) continue;
        this.activatePillar(o);
      }
      // charges while you stand in it, drains slowly when you leave
      o.charge = Math.max(0, Math.min(1, o.charge + (inZone ? dt / PILLAR_TIME : -dt / (PILLAR_TIME * 3))));
      const q = Math.floor(o.charge * 4);
      if (q > (o.quarter || 0) && q < 4) {
        o.quarter = q;
        floatText(o.pos.clone().setY(o.pos.y + 7), `${q * 25}%`, '#ffd060', true);
        sfx('tick', 0.5);
      }
      if (o.charge >= 1) {
        o.used = true;
        o.state = 'done';
        track('shrinesUsed');
        track('pillarsCharged');
        p.pendingLevelUps++;
        if (o.golden) {
          // golden pillar: this level-up offers only legendary choices
          p.pendingGolden = (p.pendingGolden || 0) + 1;
          track('goldenPillars');
          G.ui?.banner('Golden Pillar', 'A legendary choice awaits', true);
        }
        particles(o.pos.clone().setY(o.pos.y + 5), 0xffd060, 50, 10, 1, 0.6);
        ring(o.pos, PILLAR_RADIUS, 0x55ff99, 0.8);
        floatText(p.pos.clone().setY(p.pos.y + 2.6), 'UPGRADE!', '#ffd060', true);
        sfx('levelup');
      }
    }
  },

  updatePortal(dt) {
    const P = G.world.portal;
    const p = G.player;
    if (P.state !== 'charging') return;
    const inZone = Math.hypot(p.pos.x - P.pos.x, p.pos.z - P.pos.z) < G.world.chargeRadius && !p.dead;
    if (inZone) P.charge = Math.min(1, P.charge + dt / 40);
    if (P.charge >= 1 && G.run.bossDead) {
      P.state = 'ready';
      sfx('portal');
      if (G.ui) G.ui.banner('Portal Charged', 'Interact with the portal to travel onward');
      ring(P.pos, 10, 0x55ddff, 1);
    }
  },

  /** The final boss is re-scaled to the player's current power so it is never a pushover. */
  spawnFinalBoss() {
    const run = G.run, p = G.player, s = p.stats;
    const fx = -Math.sin(p.camYaw), fz = -Math.cos(p.camYaw);
    const pos = p.pos.clone().add(new THREE.Vector3(fx * 26, 0, fz * 26));
    G.world.clampBounds(pos);
    const e = spawnEnemy(run.stage.boss, pos, { boss: true });
    if (!e) return;
    // single-target DPS estimate from stats + items, and the measured damage of the last second
    const critF = 1 + s.crit * (s.critMult - 1);
    const formulaDps = s.damage * s.attackSpeed * critF * 4 * (1 + 0.05 * p.itemCount);
    const dps = Math.max(formulaDps, Math.min(run.dps || 0, formulaDps * 2));
    const hp = Math.max(e.maxHp * 1.5, dps * 75);
    e.maxHp = e.hp = hp;
    // a heavy hit should take ~12% of your effective health
    const ehp = s.maxHp * (1 + Math.max(0, s.armor) / 100) * (1 / s.dmgTakenMult);
    e.dmg = Math.max(e.dmg, ehp * 0.1);
    run.boss = e;
    if (G.ui) {
      G.ui.banner(e.def.name, e.def.title, true);
      G.ui.setBoss(e);
    }
    shake(1);
    sfx('roar');
  },

  onFinalBossKilled() {
    const run = G.run;
    track('finalBossKills');
    track('runsWon');
    run.won = true;
    setTimeout(() => {
      if (G.run !== run || G.player.dead) return;
      G.mode = 'victory';
      Input.releaseLock();
      if (G.ui) G.ui.showVictory(this.summary());
    }, 3000);
  },

  /** After beating the final boss: keep going (next loop, harder). */
  continueAfterVictory() {
    track('loopsCompleted');
    if (G.ui) G.ui.showScreen('none');
    this.leaveStage();
  },

  endRunVictory() {
    const run = G.run;
    run.ended = true;
    commitRunBests();
    clearRun();
    G.mode = 'gameover';
    const s = { ...this.summary(), victory: true };
    s.lbRank = recordRun(s, 'victory');
    if (G.ui) G.ui.showGameOver(s);
  },

  onBossKilled(e) {
    const run = G.run;
    run.bossesAlive = Math.max(0, (run.bossesAlive || 1) - 1);
    run.bossDead = run.bossesAlive === 0;
    if (!run.bossDead) {
      // next living boss takes over the health bar
      run.boss = G.enemies.find((x) => x.isBoss && !x.dead) || null;
      G.ui?.setBoss(run.boss);
    }
    G.hitStop = 0.35;
    track('bossKills');
    const rarity = rollRarity('boss');
    dropItem(e.pos.clone().setY(e.pos.y + 2), rollItem(rarity));
    if (run.loop > 0) dropItem(e.pos.clone().setY(e.pos.y + 2), rollItem(rollRarity('boss')));
    dropCoins(e.pos, e.def.coins * run.coinScale);
    shake(1);
    sfx('bigboom');
    if (e.def.final) {
      if (G.ui) {
        G.ui.setBoss(null);
        G.ui.banner('VICTORY', 'The Apex Sovereign has fallen', false);
      }
      this.onFinalBossKilled();
      return;
    }
    if (run.bossDead) Music.endBoss();
    if (G.ui && run.bossDead) {
      G.ui.setBoss(null);
      G.ui.banner(e.def.name + ' defeated', G.world.portal.charge >= 1 ? 'The portal is ready' : 'Finish charging the portal');
    }
  },

  onChampionKilled(e) {
    track('championKills');
    dropItem(e.pos.clone().setY(e.pos.y + 2), rollItem(rollRarity('large')));
    dropCoins(e.pos, 20 * G.run.coinScale);
    G.hitStop = 0.15;
    G.ui?.banner('Champion defeated', 'It dropped something shiny');
  },

  /** Leave the stage (the next one loads; `toShop`: visit the Red Market on the way). */
  leaveStage(toShop = false) {
    const run = G.run;
    collectAll();
    run.stagesCleared++;
    track('stagesCleared');
    track('clear_' + run.stage.id);
    run.stageNum++;
    G.mode = 'transition';
    const next = () => (toShop ? this.enterShop() : this.loadStage());
    if (G.ui) G.ui.fade(next);
    else next();
    sfx('portal');
  },

  // ------------------------------------------------------------ the Red Market (shop)
  /** Build the shop map; time is frozen and nothing spawns until you take its portal. */
  enterShop() {
    const run = G.run;
    clearEnemies();
    clearCombat();
    clearPickups();
    clearFx();
    clearGlyphs();
    if (G.world && G.world !== this.menuWorld) G.world.dispose();
    run.inShop = true;
    run.stage = SHOP_STAGE;
    G.world = new World(SHOP_STAGE, (Math.random() * 1e9) | 0, run.loop);
    G.scene.add(G.world.group);
    this.applyStageLook(SHOP_STAGE);
    run.boss = null;
    run.bossDead = false;
    run.powers = {};
    run.stageTime = 0;
    track('shopVisits');
    run.shopOffer = this.rollShop();
    // the pedestal crystals show what's on sale
    const peds = G.world.shopPedestals || [];
    const normal = peds.filter((p) => !p.mythic), myth = peds.filter((p) => p.mythic);
    run.shopOffer.items.forEach((o, i) => { if (normal[i]) { normal[i].mesh.material.color.set(RARITY[ITEMS[o.id].rarity].hex); o.ped = normal[i]; } });
    myth.forEach((p, i) => { const o = run.shopOffer.mythics[i]; if (o) o.ped = p; else p.sold = true; });
    const p = G.player;
    p.pos.set(0, G.world.heightAt(0, 2) + 4, 2);
    p.vel.set(0, -5, 0);
    p.grounded = false;
    p.hp = p.stats.maxHp;
    p.camYaw = 0;
    for (const m of G.minions) m.pos.copy(p.pos);
    G.mode = 'playing';
    G.ui?.onStageStart?.();
    G.ui?.banner('The Red Market', 'Time stands still. Talk to the merchant — the portal leads on.', true);
    Input.requestLock();
  },

  /** 10 wares (buy up to 5) and up to 5 unlocked mythics (buy up to 2), priced like chests. */
  rollShop() {
    const base = this.chestCost({ tier: 'normal' });
    const mult = { common: 1.5, rare: 2.6, epic: 4.5, legendary: 8 };
    const items = [], seen = new Set();
    for (let k = 0; k < 80 && items.length < 10; k++) {
      const id = rollItem(rollRarity('large'));
      if (!id || seen.has(id)) continue;
      seen.add(id);
      items.push({ id, price: Math.ceil(base * mult[ITEMS[id].rarity]), sold: false });
    }
    const mythics = shuffle(ITEM_LIST.filter((it) => it.rarity === 'mythic' && isItemUnlocked(it.id)).map((it) => it.id)).slice(0, 5)
      .map((id) => ({ id, price: Math.ceil(base * 6), sold: false }));
    return { items, mythics, boughtItems: 0, boughtMythics: 0, maxItems: 5, maxMythics: 2 };
  },

  openShop() {
    if (!G.run.shopOffer) return;
    G.mode = 'shop';
    Input.releaseLock();
    G.ui?.showShop(G.run.shopOffer);
    sfx('chest');
  },
  closeShop() {
    if (G.mode !== 'shop') return;
    G.mode = 'playing';
    G.ui?.hideShop();
    Input.requestLock();
  },
  /** Buy offer `i` of the wares (`mythic` false) or the mythics. */
  buyShop(mythic, i) {
    const run = G.run, offer = run.shopOffer;
    if (!offer || G.mode !== 'shop') return false;
    const o = (mythic ? offer.mythics : offer.items)[i];
    if (!o || o.sold) return false;
    if (mythic ? offer.boughtMythics >= offer.maxMythics : offer.boughtItems >= offer.maxItems) return false;
    if (run.coins < o.price) {
      sfx('deny', 0.3);
      G.ui?.flashCoins();
      return false;
    }
    run.coins -= o.price;
    o.sold = true;
    if (o.ped) o.ped.sold = true;
    if (mythic) offer.boughtMythics++;
    else offer.boughtItems++;
    track('shopBuys');
    track('coinsSpent', o.price);
    if (mythic) track('mythicsBought');
    this.onItemCollected(o.id);
    G.ui?.showShop(offer);
    return true;
  },
  /** Leave the market: on into the next stage. */
  exitShop() {
    const run = G.run;
    if (G.mode === 'shop') this.closeShop();
    run.inShop = false;
    run.shopOffer = null;
    G.mode = 'transition';
    if (G.ui) G.ui.fade(() => this.loadStage());
    else this.loadStage();
    sfx('portal');
  },

  // ------------------------------------------------------------ level ups
  /**
   * Level-up choices: randomly only tomes, only weapons, or a mix of both.
   * Tomes: max 4 different per run, each up to Lv 99. Weapons (your 4 skills): up to Lv 50.
   * The rolled rarity scales how much of the effect a pick grants; luck improves the odds.
   */
  rollUpgrades(force = null) {
    const p = G.player;
    const luck = p.stats.luck;
    const weights = {};
    for (const r in ROLL_RARITY) {
      const o = ['common', 'rare', 'epic', 'legendary'].indexOf(r);
      weights[r] = ROLL_RARITY[r].weight * (o === 0 ? 1 : Math.pow(1 + 0.3 * luck, o));
    }
    // golden pillar: every choice is legendary
    if (force) for (const r in weights) weights[r] = r === force ? 1 : 0;
    const owned = Object.keys(p.tomes);
    const tomePool = TOMES.filter((t) => isTomeUnlocked(t) && (p.tomes[t.id] ? p.tomes[t.id].level < TOME_MAX : owned.length < TOME_SLOTS));
    // weapons: level up one you carry, or (with a free slot) pick up a new one
    const ownedW = p.weaponOrder.filter((id) => p.weapons[id].level < WEAPON_MAX);
    const newW = p.weaponOrder.length < WEAPON_SLOTS ? WEAPON_IDS.filter((id) => !p.weapons[id]) : [];
    const weaponPool = [...ownedW, ...newW];
    let mode = ['tomes', 'weapons', 'mixed'][Math.floor(Math.random() * 3)];
    if (!tomePool.length) mode = 'weapons';
    if (!weaponPool.length) mode = tomePool.length ? 'tomes' : 'none';
    if (mode === 'none') return [];
    let nTomes = mode === 'tomes' ? 3 : mode === 'weapons' ? 0 : 1 + Math.floor(Math.random() * 2);
    nTomes = Math.min(nTomes, tomePool.length);
    let nWeapons = Math.min(3 - nTomes, weaponPool.length);
    nTomes = Math.min(3 - nWeapons, tomePool.length);
    const choices = [];
    for (const t of shuffle([...tomePool]).slice(0, nTomes)) {
      const rarity = weightedPick(weights);
      const value = t.base * ROLL_RARITY[rarity].mult;
      const lv = p.tomes[t.id]?.level || 0;
      choices.push({
        kind: 'tome', id: t.id, rarity, value, name: t.name, icon: icon(t.icon),
        tag: lv ? `TOME · Lv ${lv} → ${lv + 1}` : `NEW TOME · ${owned.length + 1}/${TOME_SLOTS}`, text: t.fmt(value),
      });
    }
    // mix level-ups of carried weapons and new weapons (when a slot is free)
    const pickW = [];
    const o = shuffle([...ownedW]), n = shuffle([...newW]);
    while (pickW.length < nWeapons && (o.length || n.length)) {
      const takeNew = n.length && (!o.length || Math.random() < 0.45);
      pickW.push(takeNew ? n.shift() : o.shift());
    }
    for (const id of pickW) {
      const rarity = weightedPick(weights);
      if (!p.weapons[id]) {
        const def = WEAPONS[id];
        const bonus = 0.1 * (ROLL_RARITY[rarity].mult - 1);
        choices.push({
          kind: 'newWeapon', id, rarity, value: bonus, name: def.name, icon: icon(def.icon),
          tag: `NEW WEAPON · ${p.weaponOrder.length + 1}/${WEAPON_SLOTS}`, text: def.desc + (bonus > 0 ? ` Starts with +${Math.round(bonus * 100)}% damage.` : ''),
        });
        continue;
      }
      const ups = id === 'primary' ? PRIMARY_UPS : WEAPONS[id].ups;
      const stats = WEAPON_STATS.filter((st) => ups.includes(st.id));
      const st = weightedPick(Object.fromEntries(stats.map((x) => [x.id, x.weight])));
      const sdef = WEAPON_STATS.find((x) => x.id === st);
      const value = sdef.base * ROLL_RARITY[rarity].mult;
      const lv = p.weapons[id].level;
      const name = id === 'primary' ? p.char.primary.name : WEAPONS[id].name;
      const ic = id === 'primary' ? p.char.primary.icon : icon(WEAPONS[id].icon);
      choices.push({
        kind: 'weapon', slot: id, stat: st, rarity, value, name, icon: ic,
        tag: `WEAPON · Lv ${lv} → ${lv + 1}`, text: sdef.fmt(value) + ((lv + 1) % 10 === 0 ? ' · +10% damage milestone' : ''),
      });
    }
    return shuffle(choices);
  },

  /** The next level-up's choices (golden pillars make them all legendary). */
  nextChoices() {
    return this.rollUpgrades(G.player.pendingGolden > 0 ? 'legendary' : null);
  },

  openLevelUp() {
    this.levelChoices = this.nextChoices();
    if (!this.levelChoices.length) {
      // every tome and weapon is maxed: nothing left to choose
      G.player.pendingLevelUps = 0;
      return;
    }
    G.mode = 'levelup';
    Input.releaseLock();
    if (G.ui) G.ui.showLevelUp(this.levelChoices, G.player.level);
  },

  chooseUpgrade(i) {
    const c = this.levelChoices?.[i];
    if (!c || G.mode !== 'levelup') return;
    const p = G.player;
    if (c.kind === 'tome') p.addTome(c.id, c.value);
    else if (c.kind === 'weapon') p.levelWeapon(c.slot, c.stat, c.value);
    else if (c.kind === 'newWeapon') p.addWeapon(c.id, c.value);
    p.pendingLevelUps--;
    if (p.pendingGolden > 0) p.pendingGolden--;
    sfx(c.kind === 'tome' ? 'item' : 'upgrade');
    if (p.pendingLevelUps > 0) this.levelChoices = this.nextChoices();
    if (p.pendingLevelUps > 0 && this.levelChoices.length) {
      G.ui.showLevelUp(this.levelChoices, p.level - p.pendingLevelUps + 1);
    } else {
      G.ui.hideLevelUp();
      G.mode = 'playing';
      Input.requestLock();
    }
  },

  onItemCollected(id) {
    G.player.addItem(id);
    const it = ITEMS[id];
    sfx(it.rarity === 'legendary' ? 'legendary' : 'item');
    if (G.ui) G.ui.toastItem(id);
  },

  // ------------------------------------------------------------ pause / death
  pause() {
    if (G.mode !== 'playing') return;
    G.mode = 'paused';
    Music.duck(true);
    Input.releaseLock();
    if (G.ui) G.ui.showPause(true);
  },
  resume() {
    if (G.mode !== 'paused') return;
    G.mode = 'playing';
    Music.duck(false);
    if (G.ui) G.ui.showPause(false);
    Input.requestLock();
  },

  onPlayerDeath() {
    const run = G.run;
    run.deathT = 0;
    run.ended = true;
    clearRun();
    track('deaths');
    Music.stop(2.5);
    setTimeout(() => {
      if (G.run !== run) return;
      G.mode = 'gameover';
      commitRunBests();
      Input.releaseLock();
      const s = this.summary();
      s.lbRank = recordRun(s, 'death');
      if (G.ui) G.ui.showGameOver(s);
    }, 2200);
  },

  summary() {
    const run = G.run, p = G.player;
    return {
      charId: run.charId, time: run.time, stage: run.stageNum + 1, stagesCleared: run.stagesCleared, level: p.level,
      kills: (G.save.stats.kills || 0) - run.kills0, items: p.itemOrder.map((id) => [id, p.items[id]]), achievements: run.newAchievements.slice(),
      diff: run.diff, victory: !!run.won,
    };
  },
};
