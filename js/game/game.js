// Run orchestration: menus backdrop, stage loading, difficulty curve,
// chests, portal/boss event, level-ups, death and stage transitions.
import * as THREE from 'three';
import { G } from '../core/state.js';
import { Input } from '../core/input.js';
import { STAGES } from '../data/stages.js';
import { BOSSES } from '../data/enemies.js';
import { ITEMS } from '../data/items.js';
import { UPGRADES, UPGRADE_RARITY } from '../data/upgrades.js';
import { CHARACTERS } from '../data/characters.js';
import { World } from './world.js';
import { Player, xpFor } from './player.js';
import { Director } from './director.js';
import { initEnemies, updateEnemies, clearEnemies, spawnEnemy } from './enemies.js';
import { updateCombat, clearCombat } from './combat.js';
import { initFx, updateFx, updateHpBars, updateBlobShadows, clearFx, particles, gibs, ring, shake } from './fx.js';
import { initPickups, updatePickups, clearPickups, dropItem, rollRarity, rollItem, dropCoins, collectAll } from './pickups.js';
import { updateMinions, clearMinions } from './minions.js';
import { buildCharacter, windUniform } from './models.js';
import { sfx } from '../core/audio.js';
import { track, trackMax, commitRunBests, persist } from '../core/save.js';
import { weightedPick, shuffle, rand } from '../core/util.js';
import { saveRun, clearRun, loadRunData } from '../core/runsave.js';

const _v = new THREE.Vector3();

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
    this.cleanupRun();
    G.mode = 'menu';
    if (!this.menuWorld) {
      this.menuWorld = new World(STAGES[0], 4242, 0);
    }
    G.world = this.menuWorld;
    G.scene.add(this.menuWorld.group);
    this.applyStageLook(STAGES[0]);
    this.menuT = 0;
    this.setMenuCharacter(G.save.lastChar);
  },

  setMenuCharacter(id) {
    if (this.menuModel) G.scene.remove(this.menuModel.root);
    this.menuModel = buildCharacter(id);
    const h = this.menuWorld.heightAt(0, 0);
    this.menuModel.root.position.set(0, h, 0);
    G.scene.add(this.menuModel.root);
    this.menuChar = id;
  },

  menuUpdate(dt) {
    this.menuT += dt;
    const w = this.menuWorld;
    const h = w.heightAt(0, 0);
    const cam = G.camera;
    const a = this.menuT * 0.08;
    // on the title screen the hero stands to the right of the menu; elsewhere centred
    const off = window.innerWidth > window.innerHeight && G.ui?.screen === 'title' ? 2.2 : 0;
    cam.position.set(Math.sin(a) * 7, h + 2.6, Math.cos(a) * 7);
    cam.lookAt(-Math.cos(a) * off, h + 1.3, Math.sin(a) * off);
    if (this.menuModel) {
      const r = this.menuModel.rig;
      this.menuModel.root.rotation.y = this.menuT * 0.6;
      r.body.position.y = Math.sin(this.menuT * 2) * 0.04;
      r.armR.rotation.x = Math.sin(this.menuT * 1.5) * 0.15 - 0.2;
      r.armL.rotation.x = -Math.sin(this.menuT * 1.5) * 0.15;
    }
    w.update(dt);
    windUniform.value += dt;
    this.sun.position.copy(this.sunOffset);
    this.sun.target.position.set(0, 0, 0);
    this.sky.position.copy(G.camera.position);
    updateFx(dt);
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
    p.level = d.level;
    p.xp = d.xp;
    p.xpNext = xpFor(p.level);
    p.pendingLevelUps = d.pendingLevelUps || 0;
    p.items = d.items;
    p.itemOrder = d.itemOrder;
    p.itemCount = Object.values(d.items).reduce((a, b) => a + b, 0);
    p.upgrades = d.upgrades;
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
    if (this.menuModel) {
      G.scene.remove(this.menuModel.root);
      this.menuModel = null;
    }
    if (this.menuWorld) G.scene.remove(this.menuWorld.group);
    G.run = {
      charId, stats: {}, newAchievements: [], coins: 0, stageNum: 0, stagesCleared: 0, loop: 0,
      diff: 1, coinScale: 1, xpScale: 1, chestScale: 1, time: 0, boss: null, secT: 0, kills0: G.save.stats.kills || 0,
      onBossKilled: (e) => this.onBossKilled(e),
      onPlayerDeath: () => this.onPlayerDeath(),
    };
    G.player = new Player(charId);
    G.minions = [];
  },

  loadStage() {
    const run = G.run;
    clearEnemies();
    clearCombat();
    clearPickups();
    clearFx();
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
    run.finalSpawnT = 0;
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
    G.mode = 'playing';
    if (G.ui) {
      G.ui.onStageStart();
      G.ui.banner(stage.name + (run.loop ? ` (Loop ${run.loop + 1})` : ''), stage.subtitle);
    }
    sfx('portal');
    Input.requestLock();
    saveRun();
  },

  updateDifficulty() {
    const run = G.run;
    const minutes = run.time / 60;
    // Exponential in both time and stages cleared.
    run.diff = Math.pow(1.085, minutes) * Math.pow(1.22, run.stagesCleared);
    run.coinScale = Math.pow(run.diff, 0.8);
    run.xpScale = Math.pow(run.diff, 0.65);
  },

  cleanupRun() {
    clearEnemies();
    clearCombat();
    clearPickups();
    clearFx();
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
      else clearRun();
      commitRunBests();
    }
    this.enterMenu();
    if (G.ui) G.ui.showScreen('title');
  },

  // ------------------------------------------------------------ main update
  update(dt) {
    const run = G.run;
    const p = G.player;
    run.time += dt;
    G.time = run.time;
    this.updateDifficulty();
    run.secT += dt;
    if (run.secT >= 1) {
      run.secT = 0;
      trackMax('runTime', Math.floor(run.time));
    }

    p.update(dt);
    if (!p.dead) this.director.update(dt);
    updateEnemies(dt);
    updateMinions(dt);
    updateCombat(dt);
    updatePickups(dt);
    G.world.update(dt);
    updateFx(dt);
    updateHpBars();
    this.updatePortal(dt);
    if (run.finalSpawnT > 0) {
      run.finalSpawnT -= dt;
      if (run.finalSpawnT <= 0) this.spawnFinalBoss();
    }
    run.saveT += dt;
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
  chestCost(c) {
    const p = G.player;
    return Math.ceil(c.baseCost * G.run.chestScale * (1 - p.stats.chestDiscount));
  },

  interact(it) {
    if (it.kind === 'chest') this.openChest(it.obj);
    else if (it.kind === 'portal') {
      if (it.obj.state === 'idle') this.activatePortal();
      else if (it.obj.state === 'ready') this.leaveStage();
    }
  },

  openChest(c) {
    const run = G.run;
    const cost = this.chestCost(c);
    if (run.coins < cost) {
      sfx('deny', 0.2);
      if (G.ui) G.ui.flashCoins();
      return;
    }
    run.coins -= cost;
    c.opened = true;
    track('chests');
    if (c.large) track('largeChests');
    track('coinsSpent', cost);
    const kind = c.large ? 'large' : 'small';
    const id = rollItem(rollRarity(kind));
    particles(c.pos, 0xffe680, 20, 6, 0.6);
    gibs(c.pos.clone().setY(c.pos.y + 0.6), 0xffcc22, c.large ? 14 : 8, 6, 0.22); // coin shower
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
    const a = Math.random() * Math.PI * 2;
    const pos = P.pos.clone().add(_v.set(Math.cos(a) * 14, 0, Math.sin(a) * 14));
    G.world.clampBounds(pos);
    run.boss = spawnEnemy(bossId, pos, { boss: true });
    if (run.loop > 0 && Math.random() < 0.5 + run.loop * 0.2) {
      // later loops can bring an extra elite guard
      spawnEnemy(Object.keys(run.stage.enemies)[0], pos.clone().add(_v.set(4, 0, 4)), { elite: 'overloading' });
    }
    if (G.ui) {
      G.ui.banner(def.name, def.title, true);
      G.ui.setBoss(run.boss);
    }
    shake(0.6);
    sfx('roar');
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
    const hp = Math.max(e.maxHp * 2, dps * 110);
    e.maxHp = e.hp = hp;
    // a heavy hit should take ~12% of your effective health
    const ehp = s.maxHp * (1 + Math.max(0, s.armor) / 100) * (1 / s.dmgTakenMult);
    e.dmg = Math.max(e.dmg, ehp * 0.12);
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
    if (G.ui) G.ui.showGameOver({ ...this.summary(), victory: true });
  },

  onBossKilled(e) {
    const run = G.run;
    run.bossDead = true;
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
    if (G.ui) {
      G.ui.setBoss(null);
      G.ui.banner(e.def.name + ' defeated', G.world.portal.charge >= 1 ? 'The portal is ready' : 'Finish charging the portal');
    }
  },

  leaveStage() {
    const run = G.run;
    collectAll();
    run.stagesCleared++;
    track('stagesCleared');
    track('clear_' + run.stage.id);
    run.stageNum++;
    G.mode = 'transition';
    if (G.ui) G.ui.fade(() => this.loadStage());
    else this.loadStage();
    sfx('portal');
  },

  // ------------------------------------------------------------ level ups
  rollUpgrades() {
    const luck = G.player.stats.luck;
    const weights = {};
    for (const r in UPGRADE_RARITY) {
      const o = ['common', 'rare', 'epic', 'legendary'].indexOf(r);
      weights[r] = UPGRADE_RARITY[r].weight * (o === 0 ? 1 : Math.pow(1 + 0.3 * luck, o));
    }
    const pool = shuffle([...UPGRADES]).slice(0, 3);
    return pool.map((u) => {
      const rarity = weightedPick(weights);
      const value = u.base * UPGRADE_RARITY[rarity].mult;
      return { id: u.id, name: u.name, icon: u.icon, rarity, value, text: u.fmt(value) };
    });
  },

  openLevelUp() {
    G.mode = 'levelup';
    this.levelChoices = this.rollUpgrades();
    Input.releaseLock();
    if (G.ui) G.ui.showLevelUp(this.levelChoices, G.player.level);
  },

  chooseUpgrade(i) {
    const c = this.levelChoices?.[i];
    if (!c || G.mode !== 'levelup') return;
    const p = G.player;
    p.applyUpgrade(c.id, c.value);
    p.pendingLevelUps--;
    sfx('item');
    if (p.pendingLevelUps > 0) {
      this.levelChoices = this.rollUpgrades();
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
    Input.releaseLock();
    if (G.ui) G.ui.showPause(true);
  },
  resume() {
    if (G.mode !== 'paused') return;
    G.mode = 'playing';
    if (G.ui) G.ui.showPause(false);
    Input.requestLock();
  },

  onPlayerDeath() {
    const run = G.run;
    run.deathT = 0;
    run.ended = true;
    clearRun();
    track('deaths');
    setTimeout(() => {
      if (G.run !== run) return;
      G.mode = 'gameover';
      commitRunBests();
      Input.releaseLock();
      if (G.ui) G.ui.showGameOver(this.summary());
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
