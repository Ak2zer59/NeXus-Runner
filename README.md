# 🎮 Nexus Runner

Un jeu de course infini moderne et premium inspiré du jeu du dinosaure de Google Chrome, avec une expérience visuelle haut de gamme, des animations fluides et une interface soignée.

![Nexus Runner](https://img.shields.io/badge/Status-Playable-success)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Caractéristiques

### Gameplay
- **Course automatique** - Le personnage court automatiquement
- **Obstacles dynamiques** - Génération procédurale d'obstacles variés
- **Commandes simples** - Saut, glissade et double saut
- **Difficulté progressive** - La vitesse augmente avec le score
- **Système de score** - Score actuel et meilleur score sauvegardé localement

### Power-ups
- **Double Saut** 🟣 - Permet de sauter une deuxième fois en l'air
- **Ralenti** 🟠 - Ralentit le temps pour faciliter l'évitement
- **Invincibilité** 🟢 - Protection temporaire contre les collisions

### Interface & Design
- **Design minimaliste premium** - Style inspiré d'Apple, Vercel, Framer
- **Dark mode natif** - Interface sombre soignée
- **Animations fluides** - 60 FPS avec transitions spring
- **Typographie moderne** - Police Inter pour une lecture optimale
- **Micro-interactions** - Feedback visuel immédiat sur toutes les actions
- **Responsive** - Compatible desktop et mobile

### Techniques & Performance
- **100% Frontend** - HTML, CSS, JavaScript vanilla uniquement
- **Fonctionne offline** - Aucune dépendance externe (sauf Google Fonts)
- **Performances élevées** - Optimisé pour 60 FPS
- **Canvas 2D** - Rendu graphique performant

## 🎮 Contrôles

### Desktop
- **Space** ou **↑** - Sauter
- **↓** - Glisser
- **P** - Mettre en pause / Reprendre

### Mobile
- **Tap** - Sauter
- **Swipe vers le bas** - Glisser

## 🚀 Installation & Déploiement

### Déploiement sur GitHub Pages

1. **Créer un nouveau repository GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Nexus Runner"
   git branch -M main
   git remote add origin https://github.com/votre-username/nexus-runner.git
   git push -u origin main
   ```

2. **Activer GitHub Pages**
   - Allez dans les paramètres du repository (Settings)
   - Scroll jusqu'à la section "Pages"
   - Sélectionnez la branche `main` comme source
   - Cliquez sur "Save"
   - Votre jeu sera disponible à `https://votre-username.github.io/nexus-runner/`

### Déploiement local

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-username/nexus-runner.git
   cd nexus-runner
   ```

2. **Ouvrir avec un serveur local**
   
   **Option A : Python**
   ```bash
   # Python 3
   python -m http.server 8000
   ```
   
   **Option B : Node.js (avec http-server)**
   ```bash
   npx http-server -p 8000
   ```
   
   **Option C : VS Code Live Server**
   - Installer l'extension "Live Server"
   - Clic droit sur `index.html` → "Open with Live Server"

3. **Ouvrir dans le navigateur**
   - Accédez à `http://localhost:8000`

## 📁 Structure du Projet

```
nexus-runner/
├── index.html      # Structure HTML principale
├── style.css       # Styles CSS premium
├── script.js       # Logique du jeu
└── README.md       # Documentation
```

## 🏗️ Architecture du Jeu

### Game Loop
Le jeu utilise `requestAnimationFrame` pour un rendu à 60 FPS. Le game loop gère :
- Mise à jour de la physique (joueur, obstacles, particules)
- Détection des collisions
- Génération procédurale d'obstacles et power-ups
- Gestion des power-ups actifs
- Calcul du score

### Classes Principales

#### `Player`
- Gestion de la physique (saut, glissade, gravité)
- Double saut avec power-up
- Détection de collision

#### `Obstacle`
- Types variés (normal, haut, bas)
- Mouvement horizontal avec vitesse variable
- Génération procédurale

#### `PowerUp`
- Trois types : doubleJump, slowMotion, invincible
- Animation de rotation
- Effets visuels avec glow

#### `Particle`
- Système de particules pour les effets (saut, collision)
- Animation et décroissance

### Système de Power-ups

Chaque power-up a une durée de 5 secondes (300 frames) :
- **Double Saut** : Active la possibilité de sauter une deuxième fois
- **Ralenti** : Réduit la vitesse du jeu à 50%
- **Invincibilité** : Rend le joueur invulnérable avec effet visuel

## 🎨 Choix UI/UX

### Design System
- **Couleurs** : Palette sombre avec accents vibrants (indigo, violet, vert)
- **Typographie** : Inter (Google Fonts) pour une lisibilité optimale
- **Espacement** : Système d'espacement cohérent (4px, 8px, 12px, 16px, 24px, 32px, 48px)
- **Ombres** : Utilisation de multiples couches pour la profondeur
- **Glassmorphism** : Backdrop blur pour les éléments UI

### Animations
- **Transitions** : Cubic-bezier pour des mouvements naturels
- **Spring animations** : Pour les interactions (boutons, écrans)
- **Micro-interactions** : Feedback immédiat sur hover/click
- **Parallax** : Légers effets de parallaxe sur le sol

### Accessibilité
- Contrastes élevés pour la lisibilité
- Indicateurs visuels clairs
- Instructions affichées
- Support tactile pour mobile

## 🔧 Personnalisation

### Modifier la difficulté

Dans `script.js`, ajustez :
```javascript
let baseSpeed = 4;  // Vitesse de base
obstacleSpawnInterval = 120;  // Intervalle entre obstacles
```

### Modifier les couleurs

Dans `style.css`, variables CSS :
```css
:root {
    --accent-primary: #6366f1;
    --accent-secondary: #8b5cf6;
    /* ... */
}
```

### Ajouter des power-ups

Dans `script.js`, étendez la classe `PowerUp` et ajoutez la logique dans `activatePowerUp()`.

## 📱 Compatibilité

- ✅ Chrome / Edge (recommandé)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile (iOS Safari, Chrome Mobile)

## 🐛 Dépannage

### Le jeu ne démarre pas
- Vérifiez que tous les fichiers sont présents
- Ouvrez la console du navigateur (F12) pour voir les erreurs

### Performances faibles
- Fermez les autres onglets
- Utilisez Chrome ou Edge pour de meilleures performances
- Réduisez la résolution de la fenêtre

### Power-ups ne fonctionnent pas
- Assurez-vous de collecter le power-up en le touchant directement
- Vérifiez que le timer n'est pas déjà actif

## 📝 Licence

Ce projet est libre d'utilisation. N'hésitez pas à le personnaliser selon vos besoins !

## 🙏 Remerciements

Inspiré du jeu du dinosaure de Google Chrome, avec une approche moderne et premium.

---

**Bon jeu ! 🎮✨**

