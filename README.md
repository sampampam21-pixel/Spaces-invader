# Spaces Invader

Un clone du classique arcade **Space Invaders** développé en Python avec pygame.

## Aperçu

Défendez la Terre contre 55 envahisseurs extraterrestres répartis sur 5 rangées. Détruisez-les tous avant qu'ils n'atteignent le sol, tout en esquivant leurs tirs et en profitant des abris pour vous couvrir.

## Fonctionnalités

- **55 envahisseurs** (5 rangées × 11 colonnes) avec 3 types distincts :
  - Pieuvre (rangées 4-5) — 10 pts
  - Crabe  (rangées 2-3) — 20 pts
  - Calamar (rangée 1)   — 30 pts
- Sprites pixel-art dessinés par programme avec animation 2 images
- **Vaisseau mystère** qui traverse le haut de l'écran pour 100 pts bonus
- **4 abris destructibles** avec dégradation visuelle selon les dégâts reçus
- Progression multi-niveaux : vitesse et cadence de tir augmentent à chaque niveau
- Affichage du score, du niveau et des vies en temps réel

## Prérequis

- Python 3.8+
- pygame 2.0+

## Installation

```bash
git clone https://github.com/sampampam21-pixel/Spaces-invader.git
cd Spaces-invader
pip install -r requirements.txt
```

## Lancement

```bash
python3 spaces_invader.py
```

## Contrôles

| Touche | Action |
|--------|--------|
| `←` / `A` | Déplacer à gauche |
| `→` / `D` | Déplacer à droite |
| `Espace` / `↑` / `W` | Tirer |
| `Échap` | Quitter |

## Système de score

| Envahisseur | Points |
|-------------|--------|
| Pieuvre (bas) | 10 |
| Crabe (milieu) | 20 |
| Calamar (haut) | 30 |
| Vaisseau mystère | 100 |

## Structure du projet

```
Spaces-invader/
├── spaces_invader.py   # Code source principal
├── requirements.txt    # Dépendances Python
└── README.md
```