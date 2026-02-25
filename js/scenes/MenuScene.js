/**
 * MenuScene.js
 * Retro-futuristic title screen with score table and animated text.
 */
class MenuScene extends Phaser.Scene {
  constructor() { super({ key: 'MenuScene' }); }

  create() {
    /* ── Title ──────────────────────────────────────────── */
    const titleStyle = {
      fontFamily: '"Courier New", monospace',
      stroke: '#003366',
      strokeThickness: 6,
    };

    const t1 = this.add.text(CFG.WIDTH / 2, 110, 'SPACES', {
      ...titleStyle, fontSize: '72px', fill: '#00ffff',
    }).setOrigin(0.5);

    const t2 = this.add.text(CFG.WIDTH / 2, 185, 'INVADER', {
      ...titleStyle, fontSize: '72px', fill: '#ff00ff',
    }).setOrigin(0.5);

    // Pulse both title lines
    [t1, t2].forEach(t =>
      this.tweens.add({ targets: t, alpha: { from: 0.75, to: 1 }, duration: 1100, yoyo: true, repeat: -1 }),
    );

    /* ── Decorative horizontal rule ─────────────────────── */
    const gfx = this.add.graphics();
    gfx.lineStyle(1, 0x00ffff, 0.4);
    gfx.strokeRect(40, 255, CFG.WIDTH - 80, 1);

    /* ── Score table ────────────────────────────────────── */
    const tableItems = [
      { key: 'mystery',  label: '=  ? PTS',  y: 282 },
      { key: 'enemy1_a', label: '= 30 PTS',  y: 316 },
      { key: 'enemy2_a', label: '= 20 PTS',  y: 350 },
      { key: 'enemy3_a', label: '= 10 PTS',  y: 384 },
    ];

    tableItems.forEach(({ key, label, y }) => {
      this.add.image(CFG.WIDTH / 2 - 55, y, key).setOrigin(0.5);
      this.add.text(CFG.WIDTH / 2 - 20, y, label, {
        fontFamily: '"Courier New", monospace',
        fontSize: '18px',
        fill: '#ffffff',
      }).setOrigin(0, 0.5);
    });

    /* ── "Press enter" blink ────────────────────────────── */
    const prompt = this.add.text(CFG.WIDTH / 2, 470, 'PRESS  ENTER  OR  SPACE  TO  START', {
      fontFamily: '"Courier New", monospace',
      fontSize: '19px',
      fill: '#00ff41',
    }).setOrigin(0.5);

    this.tweens.add({ targets: prompt, alpha: 0, duration: 550, yoyo: true, repeat: -1 });

    /* ── Controls hint ──────────────────────────────────── */
    this.add.text(CFG.WIDTH / 2, 530, '← A / D → to move   ·   SPACE / ↑ / W to fire', {
      fontFamily: '"Courier New", monospace',
      fontSize: '14px',
      fill: '#446688',
    }).setOrigin(0.5);

    /* ── Start game on Enter or Space ───────────────────── */
    const start = () => {
      this.scene.stop('UIScene'); // clean slate if returning from GameOver
      this.scene.start('GameScene', { level: 1, score: 0, lives: CFG.PLAYER.LIVES });
      this.scene.launch('UIScene');
    };

    this.input.keyboard.once('keydown-ENTER', start, this);
    this.input.keyboard.once('keydown-SPACE', start, this);
  }
}
