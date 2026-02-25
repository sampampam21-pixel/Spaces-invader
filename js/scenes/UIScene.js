/**
 * UIScene.js
 * Persistent HUD overlay (score, level, lives) that runs in parallel with
 * GameScene.  Reads state from the Phaser registry set by GameScene so it
 * survives scene restarts without re-registering event listeners.
 */
class UIScene extends Phaser.Scene {
  constructor() { super({ key: 'UIScene' }); }

  create() {
    const style = {
      fontFamily: '"Courier New", monospace',
      fontSize: '18px',
      fill: '#ffffff',
    };

    this.scoreText = this.add.text(10, 8, 'SCORE  000000', style);

    this.levelText = this.add.text(CFG.WIDTH / 2, 8, 'LEVEL  1', style)
      .setOrigin(0.5, 0);

    this.add.text(CFG.WIDTH - 160, 8, 'LIVES', style);

    // Mini player-ship icons (one fewer than lives count)
    this.lifeIcons = [];
    for (let i = 0; i < CFG.PLAYER.LIVES - 1; i++) {
      this.lifeIcons.push(
        this.add.image(CFG.WIDTH - 110 + i * 44, 20, 'player').setScale(0.68),
      );
    }

    // Initialise from registry (covers the level-restart case)
    this._refresh();

    // React to every registry change GameScene makes
    this.registry.events.on('changedata', this._refresh, this);
  }

  _refresh() {
    const score = this.registry.get('score') || 0;
    const lives = this.registry.get('lives') !== undefined ? this.registry.get('lives') : CFG.PLAYER.LIVES;
    const level = this.registry.get('level') || 1;

    this.scoreText.setText('SCORE  ' + String(score).padStart(6, '0'));
    this.levelText.setText('LEVEL  ' + level);

    // Show (lives - 1) icons, hide the rest
    this.lifeIcons.forEach((icon, i) => icon.setVisible(i < lives - 1));
  }
}
