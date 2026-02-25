import pygame
import random
import sys

pygame.init()

# --- Constants ---
SCREEN_W, SCREEN_H = 800, 600
FPS = 60
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 50, 50)
CYAN = (0, 220, 220)
YELLOW = (255, 220, 0)
MAGENTA = (220, 0, 220)
GREY = (150, 150, 150)

INVADER_COLS = 11
INVADER_ROWS = 5
INVADER_H_GAP = 60
INVADER_V_GAP = 50
INVADER_DROP = 20
INVADER_START_SPEED = 0.8   # pixels per frame
INVADER_SPEED_INCREMENT = 0.15

PLAYER_SPEED = 5
BULLET_SPEED = 8
INVADER_BULLET_SPEED = 5
INVADER_SHOOT_CHANCE = 0.001  # per invader per frame

SHIELD_COUNT = 4
SHIELD_BLOCKS_W = 10
SHIELD_BLOCKS_H = 6
SHIELD_BLOCK_SIZE = 8

MYSTERY_SPEED = 3
MYSTERY_SCORE = 100
MYSTERY_SPAWN_INTERVAL = 600  # frames

# Score per row (bottom to top)
ROW_SCORES = [10, 10, 20, 20, 30]


def load_invader_sprites():
    """Draw invader sprites programmatically."""
    sprites = {}

    def make_surface(pixels, color):
        size = len(pixels[0])
        rows = len(pixels)
        surf = pygame.Surface((size * 3, rows * 3), pygame.SRCALPHA)
        for r, row in enumerate(pixels):
            for c, val in enumerate(row):
                if val:
                    pygame.draw.rect(surf, color, (c * 3, r * 3, 3, 3))
        return surf

    # Row 0 (top): small squid-like
    squid = [
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
        [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0],
    ]
    squid_alt = [
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0],
        [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
    ]
    sprites[0] = (make_surface(squid, CYAN), make_surface(squid_alt, CYAN))

    # Rows 1-2: crab
    crab = [
        [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0],
        [0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    ]
    crab_alt = [
        [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
    ]
    sprites[1] = (make_surface(crab, MAGENTA), make_surface(crab_alt, MAGENTA))
    sprites[2] = sprites[1]

    # Rows 3-4: octopus
    octopus = [
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    ]
    octopus_alt = [
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    ]
    sprites[3] = (make_surface(octopus, GREEN), make_surface(octopus_alt, GREEN))
    sprites[4] = sprites[3]

    return sprites


class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = self._draw()
        self.rect = self.image.get_rect(midbottom=(SCREEN_W // 2, SCREEN_H - 20))
        self.speed = PLAYER_SPEED
        self.shoot_cooldown = 0

    def _draw(self):
        surf = pygame.Surface((40, 24), pygame.SRCALPHA)
        # Body
        pygame.draw.rect(surf, GREEN, (4, 8, 32, 16))
        # Cannon
        pygame.draw.rect(surf, GREEN, (17, 0, 6, 10))
        # Legs
        pygame.draw.rect(surf, GREEN, (0, 20, 10, 4))
        pygame.draw.rect(surf, GREEN, (30, 20, 10, 4))
        return surf

    def update(self, keys):
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            self.rect.x -= self.speed
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            self.rect.x += self.speed
        self.rect.clamp_ip(pygame.Rect(0, 0, SCREEN_W, SCREEN_H))
        if self.shoot_cooldown > 0:
            self.shoot_cooldown -= 1

    def shoot(self):
        if self.shoot_cooldown == 0:
            self.shoot_cooldown = 25
            return Bullet(self.rect.centerx, self.rect.top, -BULLET_SPEED, GREEN)
        return None


class Invader(pygame.sprite.Sprite):
    def __init__(self, col, row, sprites):
        super().__init__()
        self.row = row
        self.col = col
        self.frame = 0
        self.sprites = sprites[row % 5]
        self.image = self.sprites[0]
        self.rect = self.image.get_rect()
        self.score = ROW_SCORES[row % 5]

    def animate(self):
        self.frame = 1 - self.frame
        self.image = self.sprites[self.frame]


class Bullet(pygame.sprite.Sprite):
    def __init__(self, x, y, speed, color):
        super().__init__()
        self.image = pygame.Surface((3, 12), pygame.SRCALPHA)
        self.image.fill(color)
        self.rect = self.image.get_rect(centerx=x, top=y)
        self.speed = speed

    def update(self):
        self.rect.y += self.speed
        if self.rect.bottom < 0 or self.rect.top > SCREEN_H:
            self.kill()


class ShieldBlock(pygame.sprite.Sprite):
    def __init__(self, x, y):
        super().__init__()
        self.image = pygame.Surface((SHIELD_BLOCK_SIZE, SHIELD_BLOCK_SIZE))
        self.image.fill(GREEN)
        self.rect = self.image.get_rect(topleft=(x, y))
        self.health = 3

    def hit(self):
        self.health -= 1
        colors = [GREEN, (0, 180, 0), (0, 100, 0)]
        if self.health <= 0:
            self.kill()
        else:
            self.image.fill(colors[max(0, self.health - 1)])


class MysteryShip(pygame.sprite.Sprite):
    def __init__(self, direction):
        super().__init__()
        self.image = self._draw()
        self.direction = direction
        if direction > 0:
            self.rect = self.image.get_rect(right=0, top=30)
        else:
            self.rect = self.image.get_rect(left=SCREEN_W, top=30)

    def _draw(self):
        surf = pygame.Surface((48, 18), pygame.SRCALPHA)
        pygame.draw.ellipse(surf, RED, (0, 6, 48, 12))
        pygame.draw.ellipse(surf, RED, (12, 0, 24, 14))
        for i, x in enumerate([8, 18, 28, 38]):
            pygame.draw.rect(surf, YELLOW, (x, 14, 4, 4))
        return surf

    def update(self):
        self.rect.x += self.direction * MYSTERY_SPEED
        if self.rect.right < 0 or self.rect.left > SCREEN_W:
            self.kill()


def build_shields():
    shield_group = pygame.sprite.Group()
    total_shield_width = SHIELD_BLOCKS_W * SHIELD_BLOCK_SIZE
    spacing = SCREEN_W // (SHIELD_COUNT + 1)
    for i in range(SHIELD_COUNT):
        sx = spacing * (i + 1) - total_shield_width // 2
        sy = SCREEN_H - 120
        for row in range(SHIELD_BLOCKS_H):
            for col in range(SHIELD_BLOCKS_W):
                # Notch at bottom center
                if row >= SHIELD_BLOCKS_H - 2 and SHIELD_BLOCKS_W // 4 <= col < 3 * SHIELD_BLOCKS_W // 4:
                    continue
                shield_group.add(ShieldBlock(sx + col * SHIELD_BLOCK_SIZE, sy + row * SHIELD_BLOCK_SIZE))
    return shield_group


def build_invaders(sprites):
    group = pygame.sprite.Group()
    start_x = (SCREEN_W - (INVADER_COLS - 1) * INVADER_H_GAP) // 2
    start_y = 80
    for row in range(INVADER_ROWS):
        for col in range(INVADER_COLS):
            inv = Invader(col, row, sprites)
            inv.rect.topleft = (start_x + col * INVADER_H_GAP, start_y + row * INVADER_V_GAP)
            group.add(inv)
    return group


def draw_text(surf, text, size, x, y, color=WHITE, center=False):
    font = pygame.font.SysFont("monospace", size, bold=True)
    text_surf = font.render(text, True, color)
    rect = text_surf.get_rect()
    if center:
        rect.center = (x, y)
    else:
        rect.topleft = (x, y)
    surf.blit(text_surf, rect)


def show_screen(screen, clock, title, subtitle, color=GREEN):
    screen.fill(BLACK)
    draw_text(screen, title, 52, SCREEN_W // 2, SCREEN_H // 2 - 60, color, center=True)
    draw_text(screen, subtitle, 22, SCREEN_W // 2, SCREEN_H // 2 + 20, WHITE, center=True)
    pygame.display.flip()
    waiting = True
    while waiting:
        clock.tick(FPS)
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key in (pygame.K_RETURN, pygame.K_SPACE):
                    waiting = False
                elif event.key == pygame.K_ESCAPE:
                    pygame.quit()
                    sys.exit()


def game_loop(screen, clock, level, score, lives):
    sprites = load_invader_sprites()
    player = Player()
    player_group = pygame.sprite.GroupSingle(player)

    invaders = build_invaders(sprites)
    shields = build_shields()

    player_bullets = pygame.sprite.Group()
    invader_bullets = pygame.sprite.Group()
    mystery_group = pygame.sprite.GroupSingle()

    invader_dir = 1
    invader_speed = INVADER_START_SPEED + (level - 1) * INVADER_SPEED_INCREMENT
    invader_move_accum = 0.0
    animate_timer = 0
    mystery_timer = random.randint(MYSTERY_SPAWN_INTERVAL // 2, MYSTERY_SPAWN_INTERVAL)

    all_sprites = pygame.sprite.Group()

    while True:
        clock.tick(FPS)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_ESCAPE:
                    pygame.quit()
                    sys.exit()
                if event.key in (pygame.K_SPACE, pygame.K_UP, pygame.K_w):
                    bullet = player.shoot()
                    if bullet:
                        player_bullets.add(bullet)

        keys = pygame.key.get_pressed()
        player.update(keys)

        # Invader movement
        invader_list = invaders.sprites()
        if invader_list:
            invader_move_accum += invader_speed + (INVADER_COLS * INVADER_ROWS - len(invader_list)) * 0.04
            steps = int(invader_move_accum)
            if steps:
                invader_move_accum -= steps
                rightmost = max(inv.rect.right for inv in invader_list)
                leftmost = min(inv.rect.left for inv in invader_list)

                if invader_dir == 1 and rightmost + steps > SCREEN_W - 10:
                    for inv in invader_list:
                        inv.rect.y += INVADER_DROP
                    invader_dir = -1
                elif invader_dir == -1 and leftmost - steps < 10:
                    for inv in invader_list:
                        inv.rect.y += INVADER_DROP
                    invader_dir = 1
                else:
                    for inv in invader_list:
                        inv.rect.x += invader_dir * steps

        # Animate invaders
        animate_timer += 1
        if animate_timer >= 20:
            animate_timer = 0
            for inv in invader_list:
                inv.animate()

        # Invaders shoot
        if invader_list:
            for inv in invader_list:
                if random.random() < INVADER_SHOOT_CHANCE * (1 + (level - 1) * 0.3):
                    invader_bullets.add(Bullet(inv.rect.centerx, inv.rect.bottom, INVADER_BULLET_SPEED, RED))

        # Mystery ship
        mystery_timer -= 1
        if mystery_timer <= 0 and not mystery_group.sprite:
            direction = random.choice([-1, 1])
            mystery_group.add(MysteryShip(direction))
            mystery_timer = random.randint(MYSTERY_SPAWN_INTERVAL // 2, MYSTERY_SPAWN_INTERVAL)
        mystery_group.update()

        # Update bullets
        player_bullets.update()
        invader_bullets.update()

        # Player bullet vs invaders
        hits = pygame.sprite.groupcollide(player_bullets, invaders, True, True)
        for bullet, hit_invaders in hits.items():
            for inv in hit_invaders:
                score += inv.score

        # Player bullet vs mystery
        if mystery_group.sprite:
            if pygame.sprite.spritecollide(mystery_group.sprite, player_bullets, True):
                score += MYSTERY_SCORE
                mystery_group.sprite.kill()

        # Player bullet vs shields
        pygame.sprite.groupcollide(player_bullets, shields, True, False,
                                   collided=lambda b, s: (s.hit() or True) and b.rect.colliderect(s.rect))

        # Invader bullet vs player
        if pygame.sprite.spritecollide(player, invader_bullets, True):
            lives -= 1
            if lives <= 0:
                return score, lives, "dead"
            player.rect.midbottom = (SCREEN_W // 2, SCREEN_H - 20)

        # Invader bullet vs shields
        pygame.sprite.groupcollide(invader_bullets, shields, True, False,
                                   collided=lambda b, s: (s.hit() or True) and b.rect.colliderect(s.rect))

        # Invaders reach player line or bottom
        for inv in invader_list:
            if inv.rect.bottom >= SCREEN_H - 40:
                return score, 0, "dead"

        # All invaders cleared
        if not invader_list:
            return score, lives, "next_level"

        # --- Draw ---
        screen.fill(BLACK)

        # Ground line
        pygame.draw.line(screen, GREEN, (0, SCREEN_H - 10), (SCREEN_W, SCREEN_H - 10), 2)

        shields.draw(screen)
        invaders.draw(screen)
        player_group.draw(screen)
        player_bullets.draw(screen)
        invader_bullets.draw(screen)
        mystery_group.draw(screen)

        # HUD
        draw_text(screen, f"SCORE  {score:06d}", 20, 10, 5)
        draw_text(screen, f"LEVEL  {level}", 20, SCREEN_W // 2 - 50, 5)
        draw_text(screen, f"LIVES  {lives}", 20, SCREEN_W - 180, 5)
        for i in range(lives - 1):
            screen.blit(player.image, (SCREEN_W - 160 + i * 46, 28))

        pygame.display.flip()


def main():
    screen = pygame.display.set_mode((SCREEN_W, SCREEN_H))
    pygame.display.set_caption("Spaces Invader")
    clock = pygame.time.Clock()

    show_screen(screen, clock, "SPACES INVADER", "PRESS SPACE OR ENTER TO START", CYAN)

    score = 0
    lives = 3
    level = 1

    while True:
        result_score, result_lives, outcome = game_loop(screen, clock, level, score, lives)
        score = result_score
        lives = result_lives

        if outcome == "dead":
            show_screen(screen, clock, "GAME OVER", f"FINAL SCORE: {score:06d}    PRESS ENTER TO PLAY AGAIN", RED)
            score = 0
            lives = 3
            level = 1
        elif outcome == "next_level":
            level += 1
            show_screen(screen, clock, f"LEVEL {level}", f"SCORE: {score:06d}    PRESS ENTER TO CONTINUE", GREEN)


if __name__ == "__main__":
    main()
