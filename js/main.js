/**
 * main.js
 * Boots both rendering systems:
 *   1. Three.js  — synthwave background (runs its own rAF loop)
 *   2. Phaser 3  — transparent canvas layered on top
 */

/* ── Three.js background ──────────────────────────────────── */
const threeBg = new ThreeBackground('three-canvas', CFG.WIDTH, CFG.HEIGHT);

let _lastTs = 0;
(function animateBg(ts) {
  requestAnimationFrame(animateBg);
  const delta = Math.min((ts - _lastTs) / 1000, 0.05); // cap at 50 ms
  _lastTs = ts;
  threeBg.update(delta);
})(0);

/* ── Phaser 3 game ────────────────────────────────────────── */
const game = new Phaser.Game({
  type: Phaser.AUTO,
  width:  CFG.WIDTH,
  height: CFG.HEIGHT,

  // Transparent so the Three.js canvas is visible beneath
  backgroundColor: 'transparent',
  transparent: true,

  parent: 'phaser-container',

  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },

  // Scenes are loaded in order; PreloadScene → MenuScene → …
  scene: [PreloadScene, MenuScene, GameScene, UIScene, GameOverScene],
});
