/**
 * GameScene.js
 * Core Space Invaders gameplay loop.
 *
 *  ▪ Player ship   — left/right movement + single-shot with cooldown
 *  ▪ Enemy grid    — 5 × 11 formation, three visual types, two-frame anim
 *  ▪ Enemy AI      — horizontal march, wall-drop, column-shooter
 *  ▪ Mystery ship  — periodic bonus target crossing the top
 *  ▪ Shields       — four destructible arch shields
 *  ▪ Explosions    — tween-animated particle bursts, no external emitter API
 *  ▪ Level system  — speed + fire rate scale per level
 */
class GameScene extends Phaser.Scene {
  constructor() { super({ key: 'GameScene' }); }

  /* ──────────────────────────────────────────────────────── */
  /* LIFECYCLE                                                */
  /* ──────────────────────────────────────────────────────── */

  create(data) {
    this.level = (data && data.level) ? data.level : 1;
    this.score = (data && data.score) ? data.score : 0;
    this.lives = (data && data.lives !== undefined) ? data.lives : CFG.PLAYER.LIVES;

    this.gameActive    = true;
    this.invincibleMs  = 0;   // ms of post-hit invincibility remaining
    this.shootCooldown = 0;   // ms until player can fire again
    this.enemyDir      = 1;   // +1 = right, -1 = left
    this.animTimer     = 0;   // ms since last enemy frame toggle
    this.animFrame     = 0;   // 0 or 1
    this.enemyShotMs   = 0;   // ms until next enemy shot
    this.mysteryMs     = CFG.MYSTERY.INTERVAL_MS + Math.random() * 6000;
    this.mysteryShip   = null;

    this._buildShields();
    this._buildPlayer();
    this._buildEnemies();
    this._buildHUDLine();
    this._buildInput();
    this._buildColliders();
  }

  update(time, delta) {
    if (!this.gameActive) return;

    this._handleMovement(delta);
    this._handleShooting(delta);
    this._stepEnemies(delta);
    this._stepEnemyShooting(delta);
    this._stepMystery(delta);
    this._cullBullets();

    if (this.invincibleMs > 0) this.invincibleMs -= delta;
  }

  /* ──────────────────────────────────────────────────────── */
  /* BUILD HELPERS                                            */
  /* ──────────────────────────────────────────────────────── */

  _buildShields() {
    this.shieldBlocks = this.physics.add.staticGroup();

    const S  = CFG.SHIELDS.BLOCK_SIZE;
    const BW = CFG.SHIELDS.BLOCKS_W;
    const BH = CFG.SHIELDS.BLOCKS_H;
    const spacing = CFG.WIDTH / (CFG.SHIELDS.COUNT + 1);

    for (let s = 0; s < CFG.SHIELDS.COUNT; s++) {
      const sx = spacing * (s + 1) - (BW * S) / 2;
      const sy = CFG.SHIELDS.Y;
      for (let row = 0; row < BH; row++) {
        for (let col = 0; col < BW; col++) {
          // Arch cutout at bottom-centre
          if (row >= BH - 2 && col >= Math.floor(BW * 0.3) && col < Math.floor(BW * 0.7)) continue;
          const b = this.shieldBlocks.create(
            sx + col * S + S / 2,
            sy + row * S + S / 2,
            'shield_block',
          );
          b.health = 3;
        }
      }
    }
  }

  _buildPlayer() {
    this.player = this.physics.add.sprite(CFG.PLAYER.START_X, CFG.PLAYER.START_Y, 'player');
    this.player.setCollideWorldBounds(true);
    this.playerBullets = this.physics.add.group();
  }

  _buildEnemies() {
    this.enemies = this.physics.add.group();
    this.totalEnemies = CFG.ENEMIES.ROWS * CFG.ENEMIES.COLS;

    for (let row = 0; row < CFG.ENEMIES.ROWS; row++) {
      let texA, texB;
      if      (row === 0)       { texA = 'enemy1_a'; texB = 'enemy1_b'; }
      else if (row <= 2)        { texA = 'enemy2_a'; texB = 'enemy2_b'; }
      else                      { texA = 'enemy3_a'; texB = 'enemy3_b'; }

      for (let col = 0; col < CFG.ENEMIES.COLS; col++) {
        const x = CFG.ENEMIES.START_X + col * CFG.ENEMIES.H_SPACING;
        const y = CFG.ENEMIES.START_Y + row * CFG.ENEMIES.V_SPACING;
        const e = this.enemies.create(x, y, texA);
        e.row   = row;
        e.col   = col;
        e.texA  = texA;
        e.texB  = texB;
        e.score = CFG.ROW_SCORE[row];
        e.alive = true;
      }
    }

    this.enemyBullets = this.physics.add.group();
  }

  _buildHUDLine() {
    // Bottom ground line
    this.add.rectangle(CFG.WIDTH / 2, CFG.HEIGHT - 10, CFG.WIDTH, 2, 0x00ff41);
  }

  _buildInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd    = this.input.keyboard.addKeys({
      left:  Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      shoot: Phaser.Input.Keyboard.KeyCodes.W,
    });
  }

  _buildColliders() {
    // Player bullet vs enemies
    this.physics.add.overlap(
      this.playerBullets, this.enemies,
      this._onPlayerHitEnemy, null, this,
    );

    // Enemy bullet vs player
    this.physics.add.overlap(
      this.enemyBullets, this.player,
      this._onEnemyHitPlayer, null, this,
    );

    // Bullets vs shields
    this.physics.add.overlap(
      this.playerBullets, this.shieldBlocks,
      (bullet, block) => { bullet.destroy(); this._damageShieldBlock(block); },
      null, this,
    );
    this.physics.add.overlap(
      this.enemyBullets, this.shieldBlocks,
      (bullet, block) => { bullet.destroy(); this._damageShieldBlock(block); },
      null, this,
    );

    // Enemies touching shields destroys blocks
    this.physics.add.overlap(
      this.enemies, this.shieldBlocks,
      (_, block) => block.destroy(),
      null, this,
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /* UPDATE METHODS                                           */
  /* ──────────────────────────────────────────────────────── */

  _handleMovement(delta) {
    const p = this.player;
    if (this.cursors.left.isDown  || this.wasd.left.isDown)  p.setVelocityX(-CFG.PLAYER.SPEED);
    else if (this.cursors.right.isDown || this.wasd.right.isDown) p.setVelocityX(CFG.PLAYER.SPEED);
    else p.setVelocityX(0);
  }

  _handleShooting(delta) {
    if (this.shootCooldown > 0) {
      this.shootCooldown -= delta;
    }

    const fireKey = this.cursors.space.isDown ||
                    this.cursors.up.isDown    ||
                    this.wasd.shoot.isDown;

    if (fireKey && this.shootCooldown <= 0) {
      this.shootCooldown = CFG.PLAYER.SHOOT_COOLDOWN;
      const b = this.playerBullets.create(this.player.x, this.player.y - 20, 'player_bullet');
      b.setVelocityY(CFG.PLAYER.BULLET_SPEED);
      b.setBlendMode(Phaser.BlendModes.ADD);
    }
  }

  _stepEnemies(delta) {
    const alive = this.enemies.getChildren().filter(e => e.alive);
    if (alive.length === 0) return;

    // Speed scales: faster as fewer remain, faster each level
    const killBonus  = (this.totalEnemies - alive.length) * 0.014;
    const levelBonus = (this.level - 1) * 0.22;
    const speedMult  = 1 + killBonus + levelBonus;
    const step       = (CFG.ENEMIES.BASE_SPEED * speedMult * delta) / 1000;

    const right  = Math.max(...alive.map(e => e.x + 16));
    const left   = Math.min(...alive.map(e => e.x - 16));
    const bottom = Math.max(...alive.map(e => e.y + 14));

    // Enemies breached the player zone → game over
    if (bottom >= CFG.HEIGHT - 50) {
      this._triggerGameOver();
      return;
    }

    let dx = 0, dy = 0;
    if      (this.enemyDir ===  1 && right + step > CFG.WIDTH - 8) { dy = CFG.ENEMIES.DROP_AMOUNT; this.enemyDir = -1; }
    else if (this.enemyDir === -1 && left  - step < 8)              { dy = CFG.ENEMIES.DROP_AMOUNT; this.enemyDir =  1; }
    else dx = this.enemyDir * step;

    alive.forEach(e => e.setPosition(e.x + dx, e.y + dy));

    // Two-frame animation – speed increases as grid thins
    const animInterval = Math.max(80, 480 - this.level * 28 - (this.totalEnemies - alive.length) * 4);
    this.animTimer += delta;
    if (this.animTimer >= animInterval) {
      this.animTimer  = 0;
      this.animFrame  = 1 - this.animFrame;
      alive.forEach(e => e.setTexture(this.animFrame === 0 ? e.texA : e.texB));
    }
  }

  _stepEnemyShooting(delta) {
    this.enemyShotMs -= delta;
    if (this.enemyShotMs > 0) return;

    const alive = this.enemies.getChildren().filter(e => e.alive);
    if (alive.length === 0) return;

    // Pick the bottom enemy in a random column (classic Space Invaders rule)
    const byCol = {};
    alive.forEach(e => {
      if (!byCol[e.col] || byCol[e.col].row < e.row) byCol[e.col] = e;
    });
    const shooters = Object.values(byCol);
    const shooter  = shooters[Math.floor(Math.random() * shooters.length)];

    const b = this.enemyBullets.create(shooter.x, shooter.y + 16, 'enemy_bullet');
    b.setVelocityY(CFG.ENEMIES.BULLET_SPEED + this.level * 18);
    b.setBlendMode(Phaser.BlendModes.ADD);

    // Next shot interval shortens with level and kill count
    const base = Math.max(220, CFG.ENEMIES.SHOOT_INTERVAL - this.level * 80 - (this.totalEnemies - alive.length) * 4);
    this.enemyShotMs = base * (0.5 + Math.random() * 0.8);
  }

  _stepMystery(delta) {
    this.mysteryMs -= delta;

    if (this.mysteryMs <= 0 && !this.mysteryShip) {
      this._spawnMystery();
      this.mysteryMs = CFG.MYSTERY.INTERVAL_MS + Math.random() * 8000;
    }

    if (this.mysteryShip) {
      const mx = this.mysteryShip.x;
      if (mx < -60 || mx > CFG.WIDTH + 60) {
        this.mysteryShip.destroy();
        this.mysteryShip = null;
      }
    }
  }

  _spawnMystery() {
    const dir = Math.random() < 0.5 ? 1 : -1;
    const sx  = dir > 0 ? -30 : CFG.WIDTH + 30;
    this.mysteryShip = this.physics.add.sprite(sx, CFG.MYSTERY.Y, 'mystery');
    this.mysteryShip.setVelocityX(dir * CFG.MYSTERY.SPEED);
    this.mysteryShip.setBlendMode(Phaser.BlendModes.ADD);

    this.physics.add.overlap(
      this.playerBullets, this.mysteryShip,
      (bullet, ship) => {
        if (!this.gameActive) return;
        bullet.destroy();
        this.score += CFG.MYSTERY.SCORE;
        this._explode(ship.x, ship.y, 0xff0040);
        this._floatScore(ship.x, ship.y, CFG.MYSTERY.SCORE, '#ff0040');
        ship.destroy();
        this.mysteryShip = null;
        this._emitHUD();
      },
      null, this,
    );
  }

  /* ──────────────────────────────────────────────────────── */
  /* COLLISION CALLBACKS                                      */
  /* ──────────────────────────────────────────────────────── */

  _onPlayerHitEnemy(bullet, enemy) {
    if (!enemy.alive || !this.gameActive) return;
    bullet.destroy();
    enemy.alive = false;

    const col = enemy.tintTopLeft || 0x00ffff;
    this._explode(enemy.x, enemy.y, col);
    this.score += enemy.score;
    this._floatScore(enemy.x, enemy.y, enemy.score, '#' + col.toString(16).padStart(6, '0'));
    enemy.destroy();

    this._emitHUD();

    // All enemies cleared → next level
    const remaining = this.enemies.getChildren().filter(e => e.alive).length;
    if (remaining === 0) {
      this.gameActive = false;
      this.time.delayedCall(1400, () => {
        this.scene.stop('UIScene');
        this.scene.start('GameScene', { level: this.level + 1, score: this.score, lives: this.lives });
        this.scene.launch('UIScene');
      });
    }
  }

  _onEnemyHitPlayer(bullet, player) {
    if (!this.gameActive || this.invincibleMs > 0) return;
    bullet.destroy();
    this.lives--;
    this._emitHUD();
    this._explode(player.x, player.y, 0x00ff41);

    if (this.lives <= 0) {
      player.setVisible(false);
      this._triggerGameOver();
    } else {
      // Brief flicker + invincibility window
      this.invincibleMs = 2200;
      this.tweens.add({
        targets: player, alpha: { from: 0.1, to: 1 },
        duration: 160, repeat: 7, yoyo: true,
        onComplete: () => player.setAlpha(1),
      });
    }
  }

  _damageShieldBlock(block) {
    block.health--;
    if (block.health <= 0) {
      block.destroy();
    } else {
      const tints = [0x00ff41, 0x00aa28, 0x005514];
      block.setTint(tints[block.health - 1]);
      this.shieldBlocks.refresh();
    }
  }

  /* ──────────────────────────────────────────────────────── */
  /* EFFECTS                                                  */
  /* ──────────────────────────────────────────────────────── */

  /**
   * Cheap tween-based particle burst – 10 coloured dots fly outward.
   * Uses only Phaser Graphics + Tweens, no version-specific emitter API.
   */
  _explode(cx, cy, color) {
    const COUNT = 10;
    for (let i = 0; i < COUNT; i++) {
      const angle = (i / COUNT) * Math.PI * 2 + Math.random() * 0.4;
      const dist  = 55 + Math.random() * 85;
      const size  = 2 + Math.random() * 2.5;

      const g = this.add.graphics();
      g.fillStyle(color, 1);
      g.fillCircle(0, 0, size);
      g.setPosition(cx, cy);
      g.setBlendMode(Phaser.BlendModes.ADD);

      this.tweens.add({
        targets: g,
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 460 + Math.random() * 260,
        ease: 'Power2',
        onComplete: () => g.destroy(),
      });
    }
  }

  /** Score "+XX" text that floats upward and fades. */
  _floatScore(x, y, pts, fill) {
    const t = this.add.text(x, y - 10, `+${pts}`, {
      fontFamily: '"Courier New", monospace',
      fontSize: '16px',
      fill,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: t, y: y - 50, alpha: 0,
      duration: 900,
      onComplete: () => t.destroy(),
    });
  }

  /* ──────────────────────────────────────────────────────── */
  /* UTILS                                                    */
  /* ──────────────────────────────────────────────────────── */

  /** Remove bullets that left the visible area. */
  _cullBullets() {
    this.playerBullets.getChildren().forEach(b => { if (b.y < -20)              b.destroy(); });
    this.enemyBullets.getChildren().forEach(b  => { if (b.y > CFG.HEIGHT + 20)  b.destroy(); });
  }

  /** Push current score / lives / level to UIScene via the registry. */
  _emitHUD() {
    this.registry.set('score', this.score);
    this.registry.set('lives', this.lives);
    this.registry.set('level', this.level);
  }

  _triggerGameOver() {
    this.gameActive = false;
    this.time.delayedCall(1800, () => {
      this.scene.stop('UIScene');
      this.scene.start('GameOverScene', { score: this.score, level: this.level });
    });
  }
}
