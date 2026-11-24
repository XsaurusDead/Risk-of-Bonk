// Background music: streamed MP3s with crossfades and looping.
//
// Tracks live in assets/music/. Stages 1-6 pick a random track from
// STAGE_TRACKS each time a stage starts. Summoning the portal boss switches to a
// random BOSS_TRACKS song (the stage song resumes where it left off once every
// boss is dead). The final stage (Celestial Throne) plays FINAL_TRACKS and the
// title / character select screens play MENU_TRACKS.
// Audio is routed through WebAudio gain nodes so fades also work on iOS,
// where the <audio> volume property is read-only.
import { G } from './state.js';
import { getAudioContext, unlockAudio } from './audio.js';

export const STAGE_TRACKS = [
  'assets/music/Imhotep.mp3',
  'assets/music/Obstacular Explosion (Live Reading Feb `86).mp3',
  'assets/music/Curious Corn.mp3',
  'assets/music/Feng Shui.mp3',
  'assets/music/Jurassic Shift.mp3',
  'assets/music/Oolite Grove & Citadel Jam.mp3',
  'assets/music/Vibuthi.mp3',
  'assets/music/Waterfall City.mp3',
  'assets/music/Yoy Mandala.mp3',
];
export const BOSS_TRACKS = [
  'assets/music/bosses/Aumriff (Mantric Mutterings in Which Tig Evaporates) (Live Reading Dec `85).mp3',
  'assets/music/bosses/Ozric Tentacles (Electronic) - Jellylips (Live from Blue Bubble Studios).mp3',
  'assets/music/bosses/Ullular Gate.mp3',
  'assets/music/bosses/ozric tentacles   pyramidion.mp3',
];
export const FINAL_TRACKS = ['assets/music/final/Mooncalf.mp3'];
export const MENU_TRACKS = ['assets/music/main-menu/Yaboop Yaboop.mp3'];

const FADE = 1.6;

class Deck {
  constructor() {
    this.el = new Audio();
    this.el.loop = true;
    this.el.preload = 'none';
    this.gain = null;
    this.src = null;
  }
  connect() {
    if (this.gain) return true;
    const ctx = getAudioContext();
    if (!ctx) return false;
    try {
      const source = ctx.createMediaElementSource(this.el);
      this.gain = ctx.createGain();
      this.gain.gain.value = 0;
      source.connect(this.gain).connect(ctx.destination);
      return true;
    } catch (e) {
      return false;
    }
  }
  fadeTo(v, secs) {
    const ctx = getAudioContext();
    if (this.gain && ctx) {
      const g = this.gain.gain;
      g.cancelScheduledValues(ctx.currentTime);
      g.setValueAtTime(g.value, ctx.currentTime);
      g.linearRampToValueAtTime(v, ctx.currentTime + secs);
    } else this.el.volume = Math.max(0, Math.min(1, v)); // fallback without WebAudio
  }
}

export const Music = {
  decks: null,
  cur: 0,
  current: null,
  last: null,
  ducked: false,

  init() {
    this.decks = [new Deck(), new Deck()];
    this.lastBoss = null;
    this.resumeAfterBoss = null;
    // browsers block audio until the first click/tap/key: start whatever should be playing then
    const kick = () => {
      unlockAudio();
      const deck = this.decks[this.cur];
      if (this.current && deck.el.paused) {
        deck.connect();
        const p = deck.el.play();
        if (p && p.catch) p.catch(() => {});
        deck.fadeTo(this.volume, FADE);
      }
    };
    for (const ev of ['pointerdown', 'keydown', 'touchend']) document.addEventListener(ev, kick, { passive: true });
  },

  /** Title / character select music (keeps playing if it already is). */
  playMenu() {
    this.resumeAfterBoss = null;
    if (!MENU_TRACKS.length) return this.stop();
    if (MENU_TRACKS.includes(this.current)) return;
    this.play(MENU_TRACKS[Math.floor(Math.random() * MENU_TRACKS.length)]);
  },

  /** A portal boss was summoned: switch to a random boss song, remember the stage song. */
  playBoss() {
    if (!BOSS_TRACKS.length) return;
    if (BOSS_TRACKS.includes(this.current)) return;
    if (this.current && STAGE_TRACKS.includes(this.current)) {
      this.resumeAfterBoss = { url: this.current, t: this.decks[this.cur].el.currentTime || 0 };
    }
    let pick = BOSS_TRACKS[Math.floor(Math.random() * BOSS_TRACKS.length)];
    if (BOSS_TRACKS.length > 1) while (pick === this.lastBoss) pick = BOSS_TRACKS[Math.floor(Math.random() * BOSS_TRACKS.length)];
    this.lastBoss = pick;
    this.play(pick);
  },

  /** Every portal boss is dead: back to the stage song where it left off. */
  endBoss() {
    if (!BOSS_TRACKS.includes(this.current)) return;
    const r = this.resumeAfterBoss;
    this.resumeAfterBoss = null;
    if (r) this.play(r.url, r.t);
    else this.playStage(false);
  },

  get volume() {
    const s = G.save?.settings;
    return (s?.musicVolume ?? 0.5) * (this.ducked ? 0.35 : 1);
  },

  /** Pick a random stage track (never the same one twice in a row when there's a choice). */
  playStage(final = false) {
    this.resumeAfterBoss = null;
    const list = final ? FINAL_TRACKS : STAGE_TRACKS;
    if (!list.length) return this.stop();
    let pick = list[Math.floor(Math.random() * list.length)];
    if (list.length > 1) while (pick === this.last) pick = list[Math.floor(Math.random() * list.length)];
    this.play(pick);
  },

  play(url, startAt = 0) {
    if (!this.decks) this.init();
    const old = this.decks[this.cur];
    this.cur = 1 - this.cur;
    const deck = this.decks[this.cur];
    deck.connect();
    deck.src = url;
    deck.el.src = encodeURI(url);
    deck.el.currentTime = startAt;
    if (startAt) deck.el.addEventListener('loadedmetadata', () => { deck.el.currentTime = startAt; }, { once: true });
    deck.fadeTo(0, 0.01);
    const p = deck.el.play();
    if (p && p.catch) p.catch(() => {});
    deck.fadeTo(this.volume, FADE);
    this.fadeOutDeck(old);
    this.current = url;
    if (STAGE_TRACKS.includes(url)) this.last = url;
  },

  fadeOutDeck(deck) {
    if (!deck || !deck.src) return;
    deck.fadeTo(0, FADE);
    const src = deck.src;
    setTimeout(() => {
      if (deck.src === src && this.decks[this.cur] !== deck) deck.el.pause();
    }, FADE * 1000 + 100);
  },

  stop(secs = FADE) {
    if (!this.decks) return;
    const deck = this.decks[this.cur];
    if (!deck.src) return;
    deck.fadeTo(0, secs);
    const src = deck.src;
    setTimeout(() => {
      if (deck.src === src) {
        deck.el.pause();
        deck.src = null;
      }
    }, secs * 1000 + 100);
    this.current = null;
  },

  /** Quieter while paused / in menus over the run. */
  duck(on) {
    this.ducked = on;
    this.applyVolume();
  },

  applyVolume() {
    if (!this.decks || !this.current) return;
    this.decks[this.cur].fadeTo(this.volume, 0.25);
  },
};
