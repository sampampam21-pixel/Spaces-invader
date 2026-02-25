/**
 * GameOverScene.js
 * Displayed when the player loses all lives or enemies reach the ground.
 * Shows final score and lets the player return to the main menu.
 */
class GameOverScene extends Phaser.Scene {
  constructor() { super({ key: 'GameOverScene' }); }

  create(data) {
    const score = (data && data.score) ? data.score : 0;
    const level = (data && data.level) ? data.level : 1;

    const base = {
      fontFamily: '"Courier New", monospace',
      stroke: '#330011',
      strokeThickness: 5,
    };

    /* ── Title ──────────────────────────────────────────── */
    const title = this.add.text(CFG.WIDTH / 2, 180, 'GAME  OVER', {
      ...base, fontSize: '68px', fill: '#ff0040',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      alpha: { from: 0.7, to: 1 },
      duration: 800, yoyo: true, repeat: -1,
    });

    /* ── Stats ──────────────────────────────────────────── */
    this.add.text(CFG.WIDTH / 2, 295, `SCORE   ${String(score).padStart(6, '0')}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '28px', fill: '#ffffff',
    }).setOrigin(0.5);

    this.add.text(CFG.WIDTH / 2, 348, `LEVEL REACHED   ${level}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '22px', fill: '#00ffff',
    }).setOrigin(0.5);

    /* ── Prompt ─────────────────────────────────────────── */
    const prompt = this.add.text(CFG.WIDTH / 2, 450, 'PRESS  ENTER  OR  SPACE  TO  CONTINUE', {
      fontFamily: '"Courier New", monospace',
      fontSize: '18px', fill: '#00ff41',
    }).setOrigin(0.5);

    this.tweens.add({ targets: prompt, alpha: 0, duration: 550, yoyo: true, repeat: -1 });

    /* ── Back to menu ────────────────────────────────────── */
    const back = () => {
      // Clear registry so UIScene starts fresh
      this.registry.set('score', 0);
      this.registry.set('lives', CFG.PLAYER.LIVES);
      this.registry.set('level', 1);
      this.scene.start('MenuScene');
    };

    this.input.keyboard.once('keydown-ENTER', back, this);
    this.input.keyboard.once('keydown-SPACE', back, this);
  }
}
