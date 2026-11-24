// Global shared game state. Every module reads/writes through G so systems
// can talk to each other without circular constructor wiring.
export const G = {
  renderer: null,
  scene: null,
  camera: null,
  clock: null,

  mode: 'menu', // menu | playing | paused | levelup | gameover | transition
  isTouch: false,
  quality: 'high',

  save: null, // persistent save (see save.js)
  run: null, // current run state (see game.js)

  world: null,
  player: null,
  enemies: [],
  minions: [],
  enemyHash: null,

  time: 0, // run time in seconds (only advances while playing)
  realTime: 0,
  dt: 0,
  shake: 0,
};
