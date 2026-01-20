/* ========================================
   NEXUS RUNNER - VERSION PREMIUM 3D
   Architecture : Game Loop avec Canvas 2D 3D-like
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
    LOGIN: 'login',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'gameOver'
};

let gameState = GameState.LOGIN;
let score = 0;
let gameSpeed = 1;
let baseSpeed = 4;
let cameraY = 0;
let cameraZ = 0;

// ========================================
// CLASSES DU JEU AMÉLIORÉES
// ========================================

// Personnage - Dinosaure 3D stylisé
class Player {
    constructor() {
        this.x = 100;
        this.y = 0;
        this.z = 0;
        this.width = 70;
        this.height = 90;
        this.depth = 40;
        this.velocityY = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.jumpPower = 18;
        this.gravity = 0.8;
        this.groundY = canvas.height - 120;
        this.slideHeight = 50;
        this.normalHeight = 90;
        this.doubleJumpAvailable = false;
        this.canDoubleJump = false;
        this.rotation = 0;
        this.legAnimation = 0;
        
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
                audioManager.playJump();
            }
        }
        
        // Gestion du slide
        if (this.isSliding) {
            this.height = this.slideHeight;
        } else {
            this.height = this.normalHeight;
        }
        
        // Animation des jambes
        if (!this.isJumping && !this.isSliding) {
            this.legAnimation += 0.3 * gameSpeed;
        }
        
        // Rotation pendant le saut
        if (this.isJumping) {
            this.rotation = Math.sin(this.velocityY * 0.1) * 0.2;
        } else {
            this.rotation *= 0.9;
        }
    }
    
    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.velocityY = -this.jumpPower;
            this.isSliding = false;
            this.createJumpParticles();
            audioManager.playJump();
        } else if (this.doubleJumpAvailable && this.canDoubleJump) {
            this.velocityY = -this.jumpPower * 0.8;
            this.canDoubleJump = false;
            this.createJumpParticles();
            audioManager.playJump();
        }
    }
    
    slide() {
        if (!this.isJumping) {
            this.isSliding = true;
            audioManager.playSlide();
        }
    }
    
    stopSlide() {
        this.isSliding = false;
    }
    
    createJumpParticles() {
        for (let i = 0; i < 12; i++) {
            particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height,
                '#8b5cf6',
                Math.random() * 6 - 3,
                Math.random() * -6 - 2,
                3
            ));
        }
    }
    
    // Dessiner le dinosaure en 3D stylisé
    draw() {
        ctx.save();
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Effet de glow si invincible
        if (playerInvincible) {
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#10b981';
            ctx.globalAlpha = 0.8 + Math.sin(Date.now() * 0.01) * 0.2;
        }
        
        // Transformation 3D (perspective)
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);
        
        // Corps principal (cuboid 3D)
        this.draw3DCuboid(0, 0, this.width, this.height, this.depth, this.color);
        
        // Tête du dinosaure
        const headY = -this.height / 2 - 15;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(0, headY, 25, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Yeux
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-8, headY - 5, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(8, headY - 5, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupilles
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-8, headY - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(8, headY - 5, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Queue du dinosaure
        const tailX = -this.width / 2 - 20;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(tailX, -10);
        ctx.quadraticCurveTo(tailX - 15, 0, tailX, 10);
        ctx.lineTo(tailX + 10, 0);
        ctx.closePath();
        ctx.fill();
        
        // Pattes avant
        if (!this.isSliding) {
            const legOffset = Math.sin(this.legAnimation) * 8;
            this.drawLeg(-15, this.height / 2 - 10 + legOffset, 12, 20);
            this.drawLeg(15, this.height / 2 - 10 - legOffset, 12, 20);
        } else {
            this.drawLeg(-15, this.height / 2 - 10, 12, 20);
            this.drawLeg(15, this.height / 2 - 10, 12, 20);
        }
        
        // Pattes arrière
        this.drawLeg(-20, this.height / 2 - 5, 14, 25);
        this.drawLeg(20, this.height / 2 - 5, 14, 25);
        
        ctx.restore();
    }
    
    draw3DCuboid(x, y, w, h, d, color) {
        // Face avant
        ctx.fillStyle = color;
        ctx.fillRect(x - w/2, y - h/2, w, h);
        
        // Ombre pour effet 3D
        const gradient = ctx.createLinearGradient(x - w/2, y - h/2, x + w/2, y + h/2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, this.darkenColor(color, 0.3));
        ctx.fillStyle = gradient;
        ctx.fillRect(x - w/2, y - h/2, w, h);
        
        // Bordure pour plus de profondeur
        ctx.strokeStyle = this.darkenColor(color, 0.4);
        ctx.lineWidth = 2;
        ctx.strokeRect(x - w/2, y - h/2, w, h);
        
        // Face latérale (ombre 3D)
        ctx.fillStyle = this.darkenColor(color, 0.4);
        ctx.beginPath();
        ctx.moveTo(x + w/2, y - h/2);
        ctx.lineTo(x + w/2 + d/3, y - h/2 - d/4);
        ctx.lineTo(x + w/2 + d/3, y + h/2 - d/4);
        ctx.lineTo(x + w/2, y + h/2);
        ctx.closePath();
        ctx.fill();
    }
    
    drawLeg(x, y, w, h) {
        ctx.fillStyle = this.darkenColor(this.color, 0.2);
        ctx.fillRect(x - w/2, y, w, h);
        ctx.strokeStyle = this.darkenColor(this.color, 0.4);
        ctx.lineWidth = 1;
        ctx.strokeRect(x - w/2, y, w, h);
    }
    
    darkenColor(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
        const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
        const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
        return `rgb(${r},${g},${b})`;
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

// Obstacles réalistes en 3D
class Obstacle {
    constructor(type = 'cactus') {
        this.type = type; // 'cactus', 'rock', 'bird'
        this.x = canvas.width;
        this.width = 0;
        this.height = 0;
        this.y = 0;
        
        if (type === 'cactus') {
            this.width = 50;
            this.height = 80;
            this.y = canvas.height - 120 - this.height;
            this.color = '#10b981';
        } else if (type === 'rock') {
            this.width = 60;
            this.height = 50;
            this.y = canvas.height - 120;
            this.color = '#6b7280';
        } else if (type === 'bird') {
            this.width = 60;
            this.height = 40;
            this.y = canvas.height - 250;
            this.color = '#f59e0b';
            this.wingPhase = Math.random() * Math.PI * 2;
        }
        
        this.passed = false;
        this.rotation = 0;
    }
    
    update() {
        this.x -= baseSpeed * gameSpeed;
        
        if (this.type === 'bird') {
            this.wingPhase += 0.3;
            this.y += Math.sin(this.wingPhase) * 2;
        }
    }
    
    draw() {
        ctx.save();
        
        if (this.type === 'cactus') {
            this.drawCactus();
        } else if (this.type === 'rock') {
            this.drawRock();
        } else if (this.type === 'bird') {
            this.drawBird();
        }
        
        ctx.restore();
    }
    
    drawCactus() {
        const centerX = this.x + this.width / 2;
        
        // Corps principal
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x + 15, this.y, 20, this.height);
        
        // Branches
        ctx.fillRect(this.x, this.y + 20, 15, 30);
        ctx.fillRect(this.x + 35, this.y + 30, 15, 25);
        
        // Ombres pour effet 3D
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 0.4));
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x + 15, this.y, 20, this.height);
        
        // Détails (épines)
        ctx.strokeStyle = this.darkenColor(this.color, 0.3);
        ctx.lineWidth = 1;
        for (let i = 0; i < this.height; i += 8) {
            ctx.beginPath();
            ctx.moveTo(this.x + 35, this.y + i);
            ctx.lineTo(this.x + 40, this.y + i - 3);
            ctx.stroke();
        }
    }
    
    drawRock() {
        // Forme irrégulière de rocher
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + 20, this.y);
        ctx.quadraticCurveTo(this.x + 10, this.y + 10, this.x + 5, this.y + 20);
        ctx.quadraticCurveTo(this.x, this.y + 30, this.x + 10, this.y + this.height);
        ctx.quadraticCurveTo(this.x + 30, this.y + this.height + 5, this.x + 50, this.y + this.height - 10);
        ctx.quadraticCurveTo(this.x + this.width, this.y + 30, this.x + 45, this.y + 15);
        ctx.quadraticCurveTo(this.x + 40, this.y + 5, this.x + 20, this.y);
        ctx.closePath();
        ctx.fill();
        
        // Ombres
        ctx.fillStyle = this.darkenColor(this.color, 0.3);
        ctx.fill();
        
        // Détails
        ctx.strokeStyle = this.darkenColor(this.color, 0.5);
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    drawBird() {
        const centerX = this.x + this.width / 2;
        const wingOffset = Math.sin(this.wingPhase) * 15;
        
        // Corps
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(centerX, this.y + this.height / 2, 15, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Ailes
        ctx.fillStyle = this.darkenColor(this.color, 0.2);
        ctx.beginPath();
        ctx.ellipse(centerX - 10, this.y + this.height / 2, 20, 8 + wingOffset * 0.5, -0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(centerX + 10, this.y + this.height / 2, 20, 8 + wingOffset * 0.5, 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Bec
        ctx.fillStyle = '#f97316';
        ctx.beginPath();
        ctx.moveTo(centerX + 15, this.y + this.height / 2);
        ctx.lineTo(centerX + 25, this.y + this.height / 2 - 5);
        ctx.lineTo(centerX + 25, this.y + this.height / 2 + 5);
        ctx.closePath();
        ctx.fill();
    }
    
    darkenColor(color, amount) {
        if (color.startsWith('#')) {
            const num = parseInt(color.replace("#", ""), 16);
            const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
            const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
            const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
            return `rgb(${r},${g},${b})`;
        }
        return color;
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
        this.type = type;
        this.width = 45;
        this.height = 45;
        this.x = canvas.width;
        this.y = canvas.height - 220;
        this.collected = false;
        this.rotation = 0;
        this.floatY = 0;
        this.floatPhase = Math.random() * Math.PI * 2;
        
        const colors = {
            'doubleJump': '#8b5cf6',
            'slowMotion': '#f59e0b',
            'invincible': '#10b981'
        };
        this.color = colors[type] || '#6366f1';
    }
    
    update() {
        this.x -= baseSpeed * gameSpeed;
        this.rotation += 0.08;
        this.floatPhase += 0.05;
        this.floatY = Math.sin(this.floatPhase) * 8;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + this.floatY);
        ctx.rotate(this.rotation);
        
        // Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        
        // Forme hexagonale
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = Math.cos(angle) * this.width / 2;
            const y = Math.sin(angle) * this.height / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Symbole
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px sans-serif';
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
            y: this.y + 5 + this.floatY,
            width: this.width - 10,
            height: this.height - 10
        };
    }
}

// Particules améliorées
class Particle {
    constructor(x, y, color, velocityX, velocityY, size = 4) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.life = 1.0;
        this.decay = 0.015;
        this.size = size;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.2;
        this.velocityX *= 0.98;
        this.rotation += this.rotationSpeed;
        this.life -= this.decay;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Particule étoile
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
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
let obstacleSpawnInterval = 100;

let powerUpSpawnTimer = 0;
let powerUpSpawnInterval = 400;

let lastFrameTime = 0;
let frameCount = 0;

// Power-up actifs - BUG CORRIGÉ
let activePowerUp = null;
let powerUpTimer = 0;
let powerUpMaxTimer = 300; // 5 secondes à 60 FPS
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
    // CORRECTION BUG : Vérifier que l'invincibilité n'est pas infinie
    if (playerInvincible && activePowerUp === 'invincible') {
        return false; // Seulement si le power-up invincible est actif
    }
    
    const playerHitbox = player.getHitbox();
    
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
    const types = ['cactus', 'cactus', 'cactus', 'rock', 'bird'];
    const type = types[Math.floor(Math.random() * types.length)];
    obstacles.push(new Obstacle(type));
}

function spawnPowerUp() {
    const types = ['doubleJump', 'slowMotion', 'invincible'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUps.push(new PowerUp(type));
}

// ========================================
// POWER-UPS LOGIC - BUG CORRIGÉ
// ========================================

function activatePowerUp(type) {
    // CORRECTION BUG : Réinitialiser le timer à chaque activation
    activePowerUp = type;
    powerUpTimer = powerUpMaxTimer; // Réinitialiser le timer
    
    audioManager.playPowerUp();
    
    const indicator = document.getElementById('powerUpIndicator');
    const icon = indicator.querySelector('.power-up-icon');
    const name = indicator.querySelector('.power-up-name');
    
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
        const percentage = (powerUpTimer / powerUpMaxTimer) * 100;
        timerBar.style.width = percentage + '%';
        
        // CORRECTION BUG : Désactiver correctement le power-up quand le timer arrive à 0
        if (powerUpTimer <= 0) {
            // Désactiver le power-up selon son type
            if (activePowerUp === 'slowMotion') {
                slowMotionActive = false;
            } else if (activePowerUp === 'invincible') {
                playerInvincible = false; // CORRECTION : Réinitialiser l'invincibilité
            } else if (activePowerUp === 'doubleJump') {
                player.doubleJumpAvailable = false;
                player.canDoubleJump = false;
            }
            
            // Réinitialiser tout
            activePowerUp = null;
            powerUpTimer = 0;
            document.getElementById('powerUpIndicator').classList.remove('active');
        }
    }
}

// ========================================
// DESSIN DU JEU AMÉLIORÉ
// ========================================

function drawBackground() {
    // Gradient ciel amélioré
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.4, '#1e293b');
    gradient.addColorStop(0.7, '#334155');
    gradient.addColorStop(1, '#475569');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Nuages avec effet 3D
    const cloudOffset = (Date.now() * 0.005 * gameSpeed) % canvas.width;
    for (let i = 0; i < 5; i++) {
        const cloudX = (i * 300 + cloudOffset) % (canvas.width + 200) - 100;
        const cloudY = 50 + i * 40;
        drawCloud(cloudX, cloudY);
    }
    
    // Étoiles animées
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 80; i++) {
        const x = (i * 73) % canvas.width;
        const y = (i * 137) % (canvas.height - 150);
        const size = Math.sin(Date.now() * 0.002 + i) * 1.5 + 2;
        ctx.fillRect(x, y, size, size);
    }
    
    // Sol avec perspective 3D
    const groundY = canvas.height - 120;
    const groundGradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
    groundGradient.addColorStop(0, '#2a2a3e');
    groundGradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    
    // Lignes de perspective au sol
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    const lineOffset = (Date.now() * 0.015 * gameSpeed) % 60;
    const perspectiveY = canvas.height;
    
    for (let i = -1; i < canvas.width / 60 + 1; i++) {
        const x = i * 60 - lineOffset;
        // Lignes avec perspective (convergent vers l'horizon)
        const startY = groundY;
        const endX = x;
        const endY = perspectiveY;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
}

function drawCloud(x, y) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.arc(x + 25, y, 35, 0, Math.PI * 2);
    ctx.arc(x + 50, y, 30, 0, Math.PI * 2);
    ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    
    // Ordre de rendu pour profondeur 3D
    particles.forEach(particle => particle.draw());
    obstacles.forEach(obstacle => obstacle.draw());
    powerUps.forEach(powerUp => powerUp.draw());
    player.draw();
}

// ========================================
// GAME LOOP
// ========================================

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    
    frameCount++;
    
    if (gameState === GameState.PLAYING) {
        // Mise à jour de la vitesse
        if (slowMotionActive) {
            gameSpeed = 0.5;
        } else {
            gameSpeed = Math.min(3, 1 + score / 800);
        }
        
        player.update();
        
        // Mise à jour obstacles
        obstacles.forEach(obstacle => {
            obstacle.update();
            
            if (!obstacle.passed && obstacle.x + obstacle.width < player.x) {
                obstacle.passed = true;
                score += 10;
                updateScore();
                audioManager.playScore();
            }
        });
        
        obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
        
        // Spawn obstacles
        obstacleSpawnTimer++;
        if (obstacleSpawnTimer >= obstacleSpawnInterval / gameSpeed) {
            spawnObstacle();
            obstacleSpawnTimer = 0;
            obstacleSpawnInterval = Math.max(60, obstacleSpawnInterval - 0.3);
        }
        
        // Mise à jour power-ups
        powerUps.forEach(powerUp => {
            powerUp.update();
            
            if (!powerUp.collected && checkCollision(player.getHitbox(), powerUp.getHitbox())) {
                powerUp.collected = true;
                activatePowerUp(powerUp.type);
            }
        });
        
        powerUps = powerUps.filter(powerUp => powerUp.x + powerUp.width > 0 && !powerUp.collected);
        
        // Spawn power-ups
        powerUpSpawnTimer++;
        if (powerUpSpawnTimer >= powerUpSpawnInterval) {
            if (Math.random() < 0.25) {
                spawnPowerUp();
            }
            powerUpSpawnTimer = 0;
        }
        
        // Particules
        particles.forEach(particle => particle.update());
        particles = particles.filter(particle => particle.life > 0);
        
        // Power-ups actifs
        updatePowerUp();
        
        // Collisions
        if (checkGameCollisions()) {
            audioManager.playCollision();
            gameOver();
        }
        
        // Barre de vitesse
        const speedPercentage = (gameSpeed / 3) * 100;
        document.getElementById('speedBar').style.width = speedPercentage + '%';
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// ========================================
// GESTION DES ÉVÉNEMENTS
// ========================================

function updateScore() {
    document.getElementById('score').textContent = score.toLocaleString();
    
    const account = accountManager.getCurrentAccount();
    if (account) {
        const currentBest = account.bestScore || 0;
        document.getElementById('bestScore').textContent = currentBest.toLocaleString();
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
    obstacleSpawnInterval = 100;
    powerUpSpawnTimer = 0;
    
    // CORRECTION BUG : Réinitialiser correctement les power-ups
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
    audioManager.startBackground();
}

function pauseGame() {
    if (gameState === GameState.PLAYING) {
        gameState = GameState.PAUSED;
        showScreen('pauseScreen');
        document.getElementById('pauseScore').textContent = score.toLocaleString();
        audioManager.stopBackground();
    } else if (gameState === GameState.PAUSED) {
        gameState = GameState.PLAYING;
        hideAllScreens();
        audioManager.startBackground();
    }
}

function resumeGame() {
    gameState = GameState.PLAYING;
    hideAllScreens();
    audioManager.startBackground();
}

function gameOver() {
    gameState = GameState.GAME_OVER;
    audioManager.stopBackground();
    
    // Collision particles
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(
            player.x + player.width / 2,
            player.y + player.height / 2,
            '#ef4444',
            Math.random() * 10 - 5,
            Math.random() * 10 - 5,
            5
        ));
    }
    
    // Sauvegarder le score
    const account = accountManager.getCurrentAccount();
    let isNewRecord = false;
    
    if (account) {
        isNewRecord = accountManager.updateBestScore(score);
    }
    
    updateScore();
    showScreen('gameOverScreen');
    document.getElementById('finalScore').textContent = score.toLocaleString();
    
    const bestScore = account ? account.bestScore : 0;
    document.getElementById('finalBestScore').textContent = bestScore.toLocaleString();
    
    if (isNewRecord && score > 0) {
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

// Contrôles tactiles
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

// Système de connexion
document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('usernameInput').value.trim();
    if (username) {
        accountManager.login(username);
        const account = accountManager.getCurrentAccount();
        if (account) {
            document.getElementById('playerName').textContent = account.username;
            document.getElementById('welcomeName').textContent = account.username;
            document.getElementById('bestScore').textContent = (account.bestScore || 0).toLocaleString();
            
            // Générer avatar
            const avatars = ['🦖', '🦕', '🐉', '🦎', '👾'];
            const avatar = avatars[username.length % avatars.length];
            document.getElementById('playerAvatar').textContent = avatar;
            
            gameState = GameState.MENU;
            showScreen('startScreen');
        }
    }
});

document.getElementById('usernameInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('loginBtn').click();
    }
});

document.getElementById('logoutBtn')?.addEventListener('click', () => {
    accountManager.logout();
    gameState = GameState.LOGIN;
    showScreen('loginScreen');
    loadAccountsList();
});

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
    if (audioManager.enabled) {
        audioManager.disable();
        document.getElementById('audioToggle').classList.add('muted');
    } else {
        audioManager.enable();
        document.getElementById('audioToggle').classList.remove('muted');
    }
});

// Charger la liste des comptes
function loadAccountsList() {
    const accountsList = document.getElementById('accountsList');
    const accounts = accountManager.getAccountsList();
    
    accountsList.innerHTML = '<div class="accounts-header">Comptes sauvegardés</div>';
    
    accounts.forEach(account => {
        const accountEl = document.createElement('div');
        accountEl.className = 'account-item';
        accountEl.innerHTML = `
            <div class="account-info">
                <div class="account-username">${account.username}</div>
                <div class="account-score">Meilleur: ${account.bestScore.toLocaleString()}</div>
            </div>
            <button class="account-select" data-username="${account.username}">Jouer</button>
        `;
        accountsList.appendChild(accountEl);
        
        accountEl.querySelector('.account-select').addEventListener('click', () => {
            accountManager.login(account.username);
            const acc = accountManager.getCurrentAccount();
            if (acc) {
                document.getElementById('playerName').textContent = acc.username;
                document.getElementById('welcomeName').textContent = acc.username;
                document.getElementById('bestScore').textContent = (acc.bestScore || 0).toLocaleString();
                
                const avatars = ['🦖', '🦕', '🐉', '🦎', '👾'];
                const avatar = avatars[acc.username.length % avatars.length];
                document.getElementById('playerAvatar').textContent = avatar;
                
                gameState = GameState.MENU;
                showScreen('startScreen');
            }
        });
    });
    
    if (accounts.length === 0) {
        accountsList.innerHTML += '<div class="no-accounts">Aucun compte sauvegardé</div>';
    }
}

// Initialisation
loadAccountsList();
updateScore();

// Démarrer le game loop
requestAnimationFrame(gameLoop);
