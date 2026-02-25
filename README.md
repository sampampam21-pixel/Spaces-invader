# Spaces Invader

Un clone rétro-futuriste de **Space Invaders** développé en JavaScript avec **Three.js** et **Phaser 3**, dans une esthétique cyberpunk/synthwave.

## Aperçu

Défendez la Terre contre 55 envahisseurs extraterrestres répartis sur 5 rangées. Détruisez-les tous avant qu'ils n'atteignent le sol, tout en esquivant leurs tirs et en profitant des boucliers pour vous couvrir.

Le jeu tourne entièrement dans le navigateur — aucune installation requise.

## Stack technique

| Rôle | Technologie |
|------|-------------|
| Rendu 3D du fond | [Three.js r128](https://threejs.org/) |
| Logique de jeu, physique, input | [Phaser 3.60](https://phaser.io/) |
| Effets visuels CRT | CSS (scanlines + vignette + flicker) |

Les deux bibliothèques sont chargées depuis un CDN — pas de build tool nécessaire.

## Fonctionnalités

### Gameplay
- **55 envahisseurs** (5 rangées × 11 colonnes) avec 3 types distincts et animation 2 frames
- Formation qui accélère au fil des kills et à chaque nouveau niveau
- **Tir en colonne** : l'ennemi du bas de chaque colonne peut tirer
- **Vaisseau mystère** (ovni) qui traverse le haut de l'écran pour 150 pts
- **4 boucliers destructibles** : chaque bloc encaisse 3 hits avec dégradation colorée
- Progression multi-niveaux : vitesse et cadence de tir augmentent à chaque niveau
- Invincibilité temporaire (avec effet de clignotement) après avoir été touché

### Visuels
- **Fond Three.js** : grille de perspective synthwave défilante, 500 étoiles scintillantes, soleil rétro avec bandes horizontales et nébulosité
- **Sprites générés par code** : aucun fichier image externe — tout est dessiné via l'API Graphics de Phaser
- Explosions en particules tweenées + textes de score flottants
- Effet de blend mode `ADD` sur les balles pour le glow néon
- Overlay CSS : scanlines, vignette radiale, animation CRT flicker, bordure lumineuse

### HUD
- Score, niveau et vies affichés en temps réel (scène UIScene parallèle)
- Icônes de vies sous forme de mini-vaisseaux

## Système de score

| Envahisseur | Points |
|-------------|--------|
| Calamar (rangée 1, cyan) | 30 |
| Crabe (rangées 2-3, magenta) | 20 |
| Pieuvre (rangées 4-5, vert) | 10 |
| Vaisseau mystère (ovni rouge) | 150 |

## Prérequis

- Un navigateur moderne (Chrome, Firefox, Edge, Safari)
- Un **serveur HTTP local** (les modules JS ne fonctionnent pas en `file://`)

## Lancement

```bash
git clone https://github.com/sampampam21-pixel/Spaces-invader.git
cd Spaces-invader

# Option 1 – Python (inclus sur la plupart des systèmes)
python3 -m http.server 8080

# Option 2 – Node.js
npx serve .

# Option 3 – Extension VS Code
# Installer "Live Server" puis clic droit → Open with Live Server
```

Ouvrir ensuite **http://localhost:8080** dans le navigateur.

## Contrôles

| Touche | Action |
|--------|--------|
| `←` / `A` | Déplacer à gauche |
| `→` / `D` | Déplacer à droite |
| `Espace` / `↑` / `W` | Tirer |
| `Entrée` | Valider (menus) |

## Structure du projet

```
Spaces-invader/
├── index.html                  ← page principale (deux canvas empilés)
├── css/
│   └── style.css               ← effets CRT, scanlines, vignette, bordure néon
├── js/
│   ├── config.js               ← constantes globales (vitesses, couleurs, grille…)
│   ├── three-background.js     ← scène Three.js (grille synthwave, étoiles, soleil)
│   ├── main.js                 ← initialisation Three.js + Phaser 3
│   └── scenes/
│       ├── PreloadScene.js     ← génération de tous les sprites par code
│       ├── MenuScene.js        ← écran titre animé + table des scores
│       ├── GameScene.js        ← boucle de jeu principale
│       ├── UIScene.js          ← HUD persistant (score / niveau / vies)
│       └── GameOverScene.js    ← écran de fin de partie
└── README.md
```
