/**
 * PreloadScene.js
 * Generates every game texture programmatically using Phaser Graphics,
 * then transitions straight to MenuScene.  No external assets needed.
 */
class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: 'PreloadScene' }); }

  create() {
    this._makePlayer();
    this._makeEnemies();
    this._makeBullets();
    this._makeMystery();
    this._makeShieldBlock();
    this._makeParticle();
    this.scene.start('MenuScene');
  }

  /* ── Helper: draw a circle with soft glow ──────────────── */
  _glowCircle(g, x, y, r, color) {
    for (let i = 3; i >= 1; i--) {
      g.fillStyle(color, 0.08 * (4 - i));
      g.fillCircle(x, y, r * (i + 1));
    }
    g.fillStyle(color, 1);
    g.fillCircle(x, y, r);
  }

  /* ── Player ship (angular fighter silhouette) ─────────── */
  _makePlayer() {
    const W = 44, H = 28;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // Outer glow
    g.fillStyle(0x00ff41, 0.12);
    g.fillTriangle(W / 2, 0, 0, H, W, H);

    // Wings
    g.fillStyle(0x00dd30, 1);
    g.fillTriangle(W / 2, 6, 1, H - 2, W / 2 - 2, H - 4);
    g.fillTriangle(W / 2, 6, W - 1, H - 2, W / 2 + 2, H - 4);

    // Main hull
    g.fillStyle(0x00ff41, 1);
    g.fillTriangle(W / 2, 1, 6, H - 2, W - 6, H - 2);

    // Cockpit highlight
    g.fillStyle(0xaaffcc, 0.9);
    g.fillTriangle(W / 2, 4, W / 2 - 4, H - 10, W / 2 + 4, H - 10);

    // Engine exhaust bar
    g.fillStyle(0x00ffff, 0.7);
    g.fillRect(W / 2 - 9, H - 4, 18, 4);

    g.generateTexture('player', W, H);
    g.destroy();
  }

  /* ── Enemy sprites (3 types × 2 animation frames) ─────── */
  _makeEnemies() {
    this._makeEnemy1();
    this._makeEnemy2();
    this._makeEnemy3();
  }

  // Type 1 – top row – Cyan angular diamond
  _makeEnemy1() {
    const W = 32, H = 26;

    const draw = (key, antennasOpen) => {
      const g = this.make.graphics({ add: false });
      // Glow halo
      g.fillStyle(0x00ffff, 0.10);
      g.fillEllipse(W / 2, H / 2, W + 4, H + 4);
      // Body diamond
      g.fillStyle(0x00ffff, 1);
      g.fillTriangle(W / 2, 1, W - 3, H / 2, W / 2, H - 2);
      g.fillTriangle(W / 2, 1,      3, H / 2, W / 2, H - 2);
      // Eyes (dark cutouts)
      g.fillStyle(0x000022, 1);
      g.fillRect(W / 2 - 8, H / 2 - 3, 5, 6);
      g.fillRect(W / 2 + 3, H / 2 - 3, 5, 6);
      // Antennae
      g.fillStyle(0x00ffff, 1);
      if (antennasOpen) {
        g.fillRect(W / 2 - 6, 0, 2, 4);
        g.fillRect(W / 2 + 4, 0, 2, 4);
      } else {
        g.fillRect(W / 2 - 1, 0, 2, 5);
      }
      g.generateTexture(key, W, H);
      g.destroy();
    };

    draw('enemy1_a', false);
    draw('enemy1_b', true);
  }

  // Type 2 – rows 1-2 – Magenta crab
  _makeEnemy2() {
    const W = 38, H = 28;

    const draw = (key, clawsUp) => {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0xff00ff, 0.10);
      g.fillEllipse(W / 2, H / 2, W + 4, H + 4);
      // Body
      g.fillStyle(0xff00ff, 1);
      g.fillRect(7, 5, W - 14, H - 10);
      // Claws
      const cy = clawsUp ? 4 : 8;
      g.fillRect(0, cy, 9, H - cy - 8);
      g.fillRect(W - 9, cy, 9, H - cy - 8);
      // Eyes
      g.fillStyle(0x000022, 1);
      g.fillRect(11, 9,  6, 7);
      g.fillRect(W - 17, 9, 6, 7);
      // Legs
      g.fillStyle(0xff00ff, 1);
      g.fillRect(9,  H - 6, 5, 6);
      g.fillRect(W / 2 - 2, H - 6, 4, 6);
      g.fillRect(W - 14, H - 6, 5, 6);
      g.generateTexture(key, W, H);
      g.destroy();
    };

    draw('enemy2_a', false);
    draw('enemy2_b', true);
  }

  // Type 3 – rows 3-4 – Green octopus
  _makeEnemy3() {
    const W = 36, H = 26;

    const draw = (key, armsDown) => {
      const g = this.make.graphics({ add: false });
      g.fillStyle(0x00ff41, 0.10);
      g.fillEllipse(W / 2, H / 2, W + 4, H + 4);
      // Body
      g.fillStyle(0x00ff41, 1);
      g.fillRect(4, 4, W - 8, H - 8);
      // Head bumps
      g.fillRect(9,  0, 7, 6);
      g.fillRect(W - 16, 0, 7, 6);
      // Eyes
      g.fillStyle(0x000022, 1);
      g.fillRect(9,  8,  7, 7);
      g.fillRect(W - 16, 8, 7, 7);
      // Tentacles
      g.fillStyle(0x00ff41, 1);
      const ty = armsDown ? 16 : 12;
      g.fillRect(0, ty, 5, H - ty - 2);
      g.fillRect(W - 5, ty, 5, H - ty - 2);
      g.fillRect(9,  H - 5, 5, 5);
      g.fillRect(W - 14, H - 5, 5, 5);
      g.generateTexture(key, W, H);
      g.destroy();
    };

    draw('enemy3_a', false);
    draw('enemy3_b', true);
  }

  /* ── Bullet textures ──────────────────────────────────── */
  _makeBullets() {
    // Player bullet – bright cyan lance
    let g = this.make.graphics({ add: false });
    g.fillStyle(0x00ffff, 0.35); g.fillRect(0,  0, 5, 20);
    g.fillStyle(0x00ffff, 1.00); g.fillRect(1,  0, 3, 20);
    g.fillStyle(0xffffff, 1.00); g.fillRect(1,  0, 3,  6);
    g.generateTexture('player_bullet', 5, 20);
    g.destroy();

    // Enemy bullet – pulsing red dart
    g = this.make.graphics({ add: false });
    g.fillStyle(0xff0040, 0.35); g.fillRect(0, 0, 5, 14);
    g.fillStyle(0xff0040, 1.00); g.fillRect(1, 0, 3, 14);
    g.generateTexture('enemy_bullet', 5, 14);
    g.destroy();
  }

  /* ── Mystery ship – glowing UFO ───────────────────────── */
  _makeMystery() {
    const W = 52, H = 22;
    const g = this.make.graphics({ add: false });
    // Outer glow
    g.fillStyle(0xff0040, 0.15);
    g.fillEllipse(W / 2, H / 2 + 2, W + 4, H);
    // Body ellipse
    g.fillStyle(0xff0040, 1);
    g.fillEllipse(W / 2, H / 2 + 3, W - 4, H - 8);
    // Dome
    g.fillStyle(0xff6688, 0.85);
    g.fillEllipse(W / 2, H / 2 - 1, W / 2 + 4, H / 2 + 2);
    // Windows
    g.fillStyle(0xffcc00, 1);
    [10, 21, 32, 43].forEach(x => g.fillCircle(x, H / 2 + 3, 3));
    g.generateTexture('mystery', W, H);
    g.destroy();
  }

  /* ── Shield block (single 8×8 tile) ──────────────────── */
  _makeShieldBlock() {
    const S = CFG.SHIELDS.BLOCK_SIZE;
    const g = this.make.graphics({ add: false });
    g.fillStyle(0x00ff41, 1);
    g.fillRect(0, 0, S, S);
    g.generateTexture('shield_block', S, S);
    g.destroy();
  }

  /* ── Particle dot for explosion effects ───────────────── */
  _makeParticle() {
    const g = this.make.graphics({ add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('particle', 8, 8);
    g.destroy();
  }
}
