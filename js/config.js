/**
 * config.js – shared constants for Spaces Invader.
 * Accessible globally by all scene / helper scripts.
 */
const CFG = {
  WIDTH:  800,
  HEIGHT: 600,

  /* ── Neon palette (integer hex for Phaser / Three.js) ── */
  COL: {
    CYAN:    0x00ffff,
    MAGENTA: 0xff00ff,
    GREEN:   0x00ff41,
    RED:     0xff0040,
    YELLOW:  0xffd700,
    PURPLE:  0x9900ff,
    ORANGE:  0xff6600,
    WHITE:   0xffffff,
    BG:      0x000011,
  },

  /* ── Player ─────────────────────────────────────────── */
  PLAYER: {
    SPEED:          220,
    BULLET_SPEED:  -490,   // negative = upward
    SHOOT_COOLDOWN: 280,   // ms between shots
    LIVES:            3,
    START_X:        400,
    START_Y:        540,
  },

  /* ── Enemy grid ──────────────────────────────────────── */
  ENEMIES: {
    COLS:            11,
    ROWS:             5,
    H_SPACING:       58,
    V_SPACING:       46,
    START_X:         92,   // x of first enemy
    START_Y:        105,   // y of first enemy
    BASE_SPEED:      28,   // px / s base horizontal speed
    DROP_AMOUNT:     22,   // px to drop per wall bounce
    BULLET_SPEED:   210,   // px / s base
    SHOOT_INTERVAL: 900,   // ms between enemy shots (base)
  },

  /* ── Mystery ship ─────────────────────────────────────── */
  MYSTERY: {
    SPEED:       165,
    Y:            52,
    INTERVAL_MS: 24000,
    SCORE:        150,
  },

  /* ── Shields ──────────────────────────────────────────── */
  SHIELDS: {
    COUNT:     4,
    BLOCK_SIZE: 8,
    BLOCKS_W:  11,
    BLOCKS_H:   7,
    Y:         462,
  },

  /* ── Score per row (top → bottom) ────────────────────── */
  ROW_SCORE: [30, 20, 20, 10, 10],
};
