/* ========================================
   NEXUS RUNNER - JEU PREMIUM
   Architecture : Game Loop avec Canvas 2D
   ======================================== */

// ========================================
// CONFIGURATION & INITIALISATION
// ========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuration du canvas
function resizeCanvas() {
    const maxWidth = Math.min(1200, window.innerWidth - 48);
    const maxHeight = Math.min(700, window.innerHeight - 48);
    
    canvas.width = maxWidth;
    canvas.height = maxHeight;
    
    // Ajuster les dimensions pour le jeu (ratio 16:9 approximatif)
    const aspectRatio = 16 / 9;
    if (canvas.width / canvas.height > aspectRatio) {
        canvas.width = canvas.height * aspectRatio;
    } else {
        canvas.height = canvas.width / aspectRatio;
    }
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ========================================
// ÉTAT DU JEU
// ========================================

const GameState = {
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

let gameState = GameState.MENU;
let score = 0;
let bestScore = parseInt(localStorage.getItem('nexusRunnerBestScore') || '0');
let gameSpeed = 1;
let baseSpeed = 4;
let audioEnabled = false;

// ========================================
// CLASSES DU JEU
// ========================================

// Personnage principal
class Player {
    constructor() {
        this.x = 80;
        this.y = 0;
        this.width = 60;
        this.height = 80;
        this.velocityY = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.jumpPower = 18;
        this.gravity = 0.8;
        this.groundY = canvas.height - 100;
        this.slideHeight = 40;
        this.normalHeight = 80;
        this.doubleJumpAvailable = false;
        this.canDoubleJump = false;
        
        this.y = this.groundY;
        this.color = '#6366f1';
    }
    
    update() {
        // Appliquer la gravité
        if (this.isJumping || this.y < this.groundY) {
            this.velocityY += this.gravity;
            this.y += this.velocityY;
            
            // Atterrissage
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.velocityY = 0;
                this.isJumping = false;
                this.canDoubleJump = false;
                this.doubleJumpAvailable = false;
            }
        }
        
        // Gestion du slide
        if (this.isSliding) {
            this.height = this.slideHeight;
        } else {
            this.height = this.normalHeight;
        }
    }
    
    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.velocityY = -this.jumpPower;
            this.isSliding = false;
            this.createJumpParticles();
        } else if (this.doubleJumpAvailable && this.canDoubleJump) {
            this.velocityY = -this.jumpPower * 0.8;
            this.canDoubleJump = false;
            this.createJumpParticles();
        }
    }
    
    slide() {
        if (!this.isJumping) {
            this.isSliding = true;
        }
    }
    
    stopSlide() {
        this.isSliding = false;
    }
    
    createJumpParticles() {
        for (let i = 0; i < 8; i++) {
            particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height,
                '#8b5cf6',
                Math.random() * 4 - 2,
                Math.random() * -4 - 2
            ));
        }
    }
    
    draw() {
        ctx.save();
        
        // Glow effect si invincible
        if (playerInvincible) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#10b981';
        }
        
        // Corps du personnage
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Détails (yeux)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 15, this.y + 20, 10, 10);
        ctx.fillRect(this.x + 35, this.y + 20, 10, 10);
        
        // Animation de course
        const time = Date.now() * 0.01;
        if (!this.isJumping && !this.isSliding) {
            const legOffset = Math.sin(time * 10) * 5;
            ctx.fillRect(this.x + 10, this.y + this.height - 15 + legOffset, 8, 15);
            ctx.fillRect(this.x + this.width - 18, this.y + this.height - 15 - legOffset, 8, 15);
        }
        
        ctx.restore();
    }
    
    getHitbox() {
        return {
            x: this.x + 10,
            y: this.y + 10,
            width: this.width - 20,
            height: this.height - 20
        };
    }
}

// Obstacles
class Obstacle {
    constructor(type = 'normal') {
        this.type = type; // 'normal', 'high', 'low'
        this.width = 40;
        this.x = canvas.width;
        
        if (type === 'high') {
            this.height = 80;
            this.y = canvas.height - 100 - this.height;
        } else if (type === 'low') {
            this.height = 40;
            this.y = canvas.height - 100;
        } else {
            this.height = 60;
            this.y = canvas.height - 100;
        }
        
        this.color = '#ef4444';
        this.passed = false;
    }
    
    update() {
        this.x -= baseSpeed * gameSpeed;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Détails
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 10, this.y + 10, 20, 20);
    }
    
    getHitbox() {
        return {
            x: this.x + 5,
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 10
        };
    }
}

// Power-ups
class PowerUp {
    constructor(type) {
        this.type = type; // 'doubleJump', 'slowMotion', 'invincible'
        this.width = 40;
        this.height = 40;
        this.x = canvas.width;
        this.y = canvas.height - 200;
        this.collected = false;
        this.rotation = 0;
        
        const colors = {
            'doubleJump': '#8b5cf6',
            'slowMotion': '#f59e0b',
            'invincible': '#10b981'
        };
        this.color = colors[type] || '#6366f1';
    }
    
    update() {
        this.x -= baseSpeed * gameSpeed;
        this.rotation += 0.1;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        
        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        // Icône
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Symbole selon le type
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (this.type === 'doubleJump') {
            ctx.fillText('↑↑', 0, 0);
        } else if (this.type === 'slowMotion') {
            ctx.fillText('⏱', 0, 0);
        } else if (this.type === 'invincible') {
            ctx.fillText('🛡', 0, 0);
        }
        
        ctx.restore();
    }
    
    getHitbox() {
        return {
            x: this.x + 5,
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 10
        };
    }
}

// Particules
class Particle {
    constructor(x, y, color, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.life = 1.0;
        this.decay = 0.02;
        this.size = Math.random() * 4 + 2;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.2; // gravité légère
        this.life -= this.decay;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// ========================================
// VARIABLES DU JEU
// ========================================

const player = new Player();
let obstacles = [];
let powerUps = [];
let particles = [];

let obstacleSpawnTimer = 0;
let obstacleSpawnInterval = 120;

let powerUpSpawnTimer = 0;
let powerUpSpawnInterval = 300;

let lastFrameTime = 0;
let frameCount = 0;
let fps = 60;

// Power-up actifs
let activePowerUp = null;
let powerUpTimer = 0;
let playerInvincible = false;
let slowMotionActive = false;

// ========================================
// GESTION DES COLLISIONS
// ========================================

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkGameCollisions() {
    if (playerInvincible) return false;
    
    const playerHitbox = player.getHitbox();
    
    // Collision avec obstacles
    for (let obstacle of obstacles) {
        if (checkCollision(playerHitbox, obstacle.getHitbox())) {
            return true;
        }
    }
    
    return false;
}

// ========================================
// GÉNÉRATION D'OBSTACLES & POWER-UPS
// ========================================

function spawnObstacle() {
    const types = ['normal', 'normal', 'normal', 'high', 'low'];
    const type = types[Math.floor(Math.random() * types.length)];
    obstacles.push(new Obstacle(type));
}

function spawnPowerUp() {
    const types = ['doubleJump', 'slowMotion', 'invincible'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUps.push(new PowerUp(type));
}

// ========================================
// POWER-UPS LOGIC
// ========================================

function activatePowerUp(type) {
    activePowerUp = type;
    powerUpTimer = 300; // 5 secondes à 60 FPS
    
    const indicator = document.getElementById('powerUpIndicator');
    const icon = indicator.querySelector('.power-up-icon');
    const name = indicator.querySelector('.power-up-name');
    const timerBar = indicator.querySelector('.timer-bar');
    
    const names = {
        'doubleJump': 'Double Saut',
        'slowMotion': 'Ralenti',
        'invincible': 'Invincibilité'
    };
    
    name.textContent = names[type];
    indicator.classList.add('active');
    
    if (type === 'doubleJump') {
        player.doubleJumpAvailable = true;
        player.canDoubleJump = true;
        icon.style.background = 'linear-gradient(135deg, #8b5cf6, #a78bfa)';
    } else if (type === 'slowMotion') {
        slowMotionActive = true;
        icon.style.background = 'linear-gradient(135deg, #f59e0b, #fbbf24)';
    } else if (type === 'invincible') {
        playerInvincible = true;
        icon.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
    }
}

function updatePowerUp() {
    if (activePowerUp) {
        powerUpTimer--;
        
        const timerBar = document.querySelector('.timer-bar');
        const percentage = (powerUpTimer / 300) * 100;
        timerBar.style.width = percentage + '%';
        
        if (powerUpTimer <= 0) {
            // Désactiver le power-up
            if (activePowerUp === 'slowMotion') {
                slowMotionActive = false;
            } else if (activePowerUp === 'invincible') {
                playerInvincible = false;
            }
            
            activePowerUp = null;
            document.getElementById('powerUpIndicator').classList.remove('active');
        }
    }
}

// ========================================
// DESSIN DU JEU
// ========================================

function drawBackground() {
    // Gradient ciel
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(0.5, '#16213e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Étoiles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (let i = 0; i < 50; i++) {
        const x = (i * 73) % canvas.width;
        const y = (i * 137) % (canvas.height - 100);
        const size = Math.sin(Date.now() * 0.001 + i) * 1 + 1.5;
        ctx.fillRect(x, y, size, size);
    }
    
    // Sol
    const groundY = canvas.height - 100;
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    
    // Lignes au sol (parallax)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    const lineOffset = (Date.now() * 0.01 * gameSpeed) % 40;
    for (let i = -1; i < canvas.width / 40 + 1; i++) {
        const x = i * 40 - lineOffset;
        ctx.beginPath();
        ctx.moveTo(x, groundY);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

function draw() {
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner l'arrière-plan
    drawBackground();
    
    // Dessiner les particules
    particles.forEach(particle => particle.draw());
    
    // Dessiner les obstacles
    obstacles.forEach(obstacle => obstacle.draw());
    
    // Dessiner les power-ups
    powerUps.forEach(powerUp => powerUp.draw());
    
    // Dessiner le joueur
    player.draw();
}

// ========================================
// GAME LOOP
// ========================================

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    
    // Calcul FPS
    frameCount++;
    if (frameCount % 60 === 0) {
        fps = Math.round(1000 / deltaTime);
    }
    
    if (gameState === GameState.PLAYING) {
        // Mise à jour de la vitesse du jeu
        if (slowMotionActive) {
            gameSpeed = 0.5;
        } else {
            gameSpeed = Math.min(3, 1 + score / 1000);
        }
        
        // Mise à jour du joueur
        player.update();
        
        // Mise à jour des obstacles
        obstacles.forEach(obstacle => {
            obstacle.update();
            
            // Score quand on passe un obstacle
            if (!obstacle.passed && obstacle.x + obstacle.width < player.x) {
                obstacle.passed = true;
                score += 10;
                updateScore();
            }
        });
        
        // Supprimer les obstacles hors écran
        obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
        
        // Spawn d'obstacles
        obstacleSpawnTimer++;
        if (obstacleSpawnTimer >= obstacleSpawnInterval / gameSpeed) {
            spawnObstacle();
            obstacleSpawnTimer = 0;
            obstacleSpawnInterval = Math.max(60, obstacleSpawnInterval - 0.5);
        }
        
        // Mise à jour des power-ups
        powerUps.forEach(powerUp => {
            powerUp.update();
            
            // Collection
            if (!powerUp.collected && checkCollision(player.getHitbox(), powerUp.getHitbox())) {
                powerUp.collected = true;
                activatePowerUp(powerUp.type);
            }
        });
        
        // Supprimer les power-ups hors écran ou collectés
        powerUps = powerUps.filter(powerUp => powerUp.x + powerUp.width > 0 && !powerUp.collected);
        
        // Spawn de power-ups
        powerUpSpawnTimer++;
        if (powerUpSpawnTimer >= powerUpSpawnInterval) {
            if (Math.random() < 0.3) { // 30% de chance
                spawnPowerUp();
            }
            powerUpSpawnTimer = 0;
        }
        
        // Mise à jour des particules
        particles.forEach(particle => particle.update());
        particles = particles.filter(particle => particle.life > 0);
        
        // Mise à jour des power-ups actifs
        updatePowerUp();
        
        // Vérifier les collisions
        if (checkGameCollisions()) {
            gameOver();
        }
        
        // Mise à jour de la barre de vitesse
        const speedPercentage = (gameSpeed / 3) * 100;
        document.getElementById('speedBar').style.width = speedPercentage + '%';
    }
    
    // Dessiner
    draw();
    
    requestAnimationFrame(gameLoop);
}

// ========================================
// GESTION DES ÉVÉNEMENTS
// ========================================

function updateScore() {
    document.getElementById('score').textContent = score.toLocaleString();
    
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('nexusRunnerBestScore', bestScore.toString());
        document.getElementById('bestScore').textContent = bestScore.toLocaleString();
    }
}

function startGame() {
    gameState = GameState.PLAYING;
    score = 0;
    gameSpeed = 1;
    baseSpeed = 4;
    
    obstacles = [];
    powerUps = [];
    particles = [];
    
    obstacleSpawnTimer = 0;
    obstacleSpawnInterval = 120;
    powerUpSpawnTimer = 0;
    
    activePowerUp = null;
    powerUpTimer = 0;
    playerInvincible = false;
    slowMotionActive = false;
    
    player.y = player.groundY;
    player.isJumping = false;
    player.isSliding = false;
    player.velocityY = 0;
    player.doubleJumpAvailable = false;
    player.canDoubleJump = false;
    
    updateScore();
    hideAllScreens();
}

function pauseGame() {
    if (gameState === GameState.PLAYING) {
        gameState = GameState.PAUSED;
        showScreen('pauseScreen');
        document.getElementById('pauseScore').textContent = score.toLocaleString();
    } else if (gameState === GameState.PAUSED) {
        gameState = GameState.PLAYING;
        hideAllScreens();
    }
}

function resumeGame() {
    gameState = GameState.PLAYING;
    hideAllScreens();
}

function gameOver() {
    gameState = GameState.GAME_OVER;
    
    // Shake effect
    document.querySelector('.game-container').classList.add('shake');
    setTimeout(() => {
        document.querySelector('.game-container').classList.remove('shake');
    }, 500);
    
    // Particules de collision
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(
            player.x + player.width / 2,
            player.y + player.height / 2,
            '#ef4444',
            Math.random() * 8 - 4,
            Math.random() * 8 - 4
        ));
    }
    
    updateScore();
    showScreen('gameOverScreen');
    document.getElementById('finalScore').textContent = score.toLocaleString();
    document.getElementById('finalBestScore').textContent = bestScore.toLocaleString();
    
    // Nouveau record
    if (score === bestScore && score > 0) {
        document.getElementById('newRecord').style.display = 'block';
    } else {
        document.getElementById('newRecord').style.display = 'none';
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

// ========================================
// ÉVÉNEMENTS CLAVIER
// ========================================

const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (gameState === GameState.PLAYING) {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            player.jump();
        } else if (e.code === 'ArrowDown') {
            e.preventDefault();
            player.slide();
        } else if (e.code === 'KeyP') {
            e.preventDefault();
            pauseGame();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    
    if (e.code === 'ArrowDown') {
        player.stopSlide();
    }
});

// Contrôles tactiles (mobile)
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchStartY = e.touches[0].clientY;
    
    if (gameState === GameState.MENU) {
        startGame();
    } else if (gameState === GameState.PLAYING) {
        player.jump();
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchY = e.touches[0].clientY;
    
    if (gameState === GameState.PLAYING && touchY > touchStartY + 50) {
        player.slide();
    }
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (gameState === GameState.PLAYING) {
        player.stopSlide();
    }
});

// ========================================
// BOUTONS UI
// ========================================

document.getElementById('startBtn').addEventListener('click', () => {
    startGame();
});

document.getElementById('resumeBtn').addEventListener('click', () => {
    resumeGame();
});

document.getElementById('restartBtn').addEventListener('click', () => {
    startGame();
});

document.getElementById('playAgainBtn').addEventListener('click', () => {
    startGame();
});

document.getElementById('audioToggle').addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    document.getElementById('audioToggle').classList.toggle('muted', !audioEnabled);
});

// ========================================
// INITIALISATION
// ========================================

// Afficher le meilleur score au démarrage
document.getElementById('bestScore').textContent = bestScore.toLocaleString();

// Démarrer le game loop
requestAnimationFrame(gameLoop);
