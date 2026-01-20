/* ========================================
   NEXUS RUNNER - VERSION PREMIUM 3D AMÉLIORÉE
   Graphismes de qualité supérieure + Système de niveaux
   ======================================== */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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
// SYSTÈME DE NIVEAUX
// ========================================

const Levels = {
    DESERT: {
        name: 'Désert',
        id: 0,
        bgGradient: ['#fbbf24', '#f59e0b', '#d97706'],
        skyGradient: ['#fed7aa', '#fdba74', '#fb923c'],
        groundColor: '#92400e',
        obstacleTypes: ['cactus', 'rock'],
        particleColor: '#f59e0b',
        clouds: false,
        stars: false
    },
    FOREST: {
        name: 'Forêt',
        id: 1,
        bgGradient: ['#22c55e', '#16a34a', '#15803d'],
        skyGradient: ['#86efac', '#4ade80', '#22c55e'],
        groundColor: '#166534',
        obstacleTypes: ['tree', 'log', 'rock'],
        particleColor: '#16a34a',
        clouds: true,
        stars: false
    },
    NIGHT: {
        name: 'Nuit',
        id: 2,
        bgGradient: ['#1e293b', '#0f172a', '#020617'],
        skyGradient: ['#334155', '#1e293b', '#0f172a'],
        groundColor: '#0f172a',
        obstacleTypes: ['moon', 'star', 'rock'],
        particleColor: '#6366f1',
        clouds: false,
        stars: true
    },
    OCEAN: {
        name: 'Océan',
        id: 3,
        bgGradient: ['#0ea5e9', '#0284c7', '#0369a1'],
        skyGradient: ['#7dd3fc', '#38bdf8', '#0ea5e9'],
        groundColor: '#075985',
        obstacleTypes: ['coral', 'seaweed', 'rock'],
        particleColor: '#0284c7',
        clouds: true,
        stars: false
    },
    SPACE: {
        name: 'Espace',
        id: 4,
        bgGradient: ['#6366f1', '#4f46e5', '#4338ca'],
        skyGradient: ['#818cf8', '#6366f1', '#4f46e5'],
        groundColor: '#312e81',
        obstacleTypes: ['asteroid', 'planet', 'star'],
        particleColor: '#8b5cf6',
        clouds: false,
        stars: true
    }
};

let currentLevel = Levels.DESERT;
let levelProgress = 0;

function getCurrentLevel() {
    const levelIndex = Math.floor(score / 500) % 5;
    return Object.values(Levels)[levelIndex];
}

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
let groundY = 0;

// ========================================
// DINOSAURE ULTRA AMÉLIORÉ
// ========================================

class Player {
    constructor() {
        this.x = 120;
        this.y = 0;
        this.width = 80;
        this.height = 100;
        this.velocityY = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.jumpPower = 20;
        this.gravity = 0.85;
        this.groundY = canvas.height - 140;
        this.slideHeight = 55;
        this.normalHeight = 100;
        this.doubleJumpAvailable = false;
        this.canDoubleJump = false;
        this.rotation = 0;
        this.legAnimation = 0;
        this.tailAnimation = 0;
        this.headBob = 0;
        
        this.y = this.groundY;
        groundY = this.groundY;
    }
    
    update() {
        if (this.isJumping || this.y < this.groundY) {
            this.velocityY += this.gravity;
            this.y += this.velocityY;
            
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.velocityY = 0;
                this.isJumping = false;
                this.canDoubleJump = false;
                this.doubleJumpAvailable = false;
                audioManager.playJump();
            }
        }
        
        if (this.isSliding) {
            this.height = this.slideHeight;
        } else {
            this.height = this.normalHeight;
        }
        
        if (!this.isJumping && !this.isSliding) {
            this.legAnimation += 0.4 * gameSpeed;
            this.tailAnimation += 0.2 * gameSpeed;
            this.headBob = Math.sin(this.legAnimation * 2) * 2;
        }
        
        if (this.isJumping) {
            this.rotation = Math.sin(this.velocityY * 0.08) * 0.15;
            this.tailAnimation += 0.3;
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
            this.velocityY = -this.jumpPower * 0.85;
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
        const level = getCurrentLevel();
        for (let i = 0; i < 15; i++) {
            particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height,
                level.particleColor,
                Math.random() * 8 - 4,
                Math.random() * -8 - 2,
                4
            ));
        }
    }
    
    draw() {
        ctx.save();
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        if (playerInvincible) {
            ctx.shadowBlur = 40;
            ctx.shadowColor = '#10b981';
            ctx.globalAlpha = 0.7 + Math.sin(Date.now() * 0.015) * 0.3;
        }
        
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);
        
        // Queue animée
        const tailOffset = Math.sin(this.tailAnimation) * 8;
        ctx.fillStyle = '#6366f1';
        ctx.beginPath();
        ctx.moveTo(-this.width / 2 - 10, -10);
        ctx.quadraticCurveTo(-this.width / 2 - 30 + tailOffset, -20, -this.width / 2 - 25 + tailOffset, 10);
        ctx.quadraticCurveTo(-this.width / 2 - 20 + tailOffset, 30, -this.width / 2 - 10, 20);
        ctx.closePath();
        ctx.fill();
        
        // Corps principal avec gradient
        const bodyGradient = ctx.createLinearGradient(-this.width/2, -this.height/2, this.width/2, this.height/2);
        bodyGradient.addColorStop(0, '#818cf8');
        bodyGradient.addColorStop(0.5, '#6366f1');
        bodyGradient.addColorStop(1, '#4f46e5');
        ctx.fillStyle = bodyGradient;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Détails du corps
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        
        // Ventre
        ctx.fillStyle = '#c7d2fe';
        ctx.fillRect(-this.width / 2 + 5, -this.height / 2 + 20, this.width - 10, this.height - 40);
        
        // Tête avec animation de balancement
        const headY = -this.height / 2 - 20 + this.headBob;
        const headGradient = ctx.createRadialGradient(0, headY, 0, 0, headY, 30);
        headGradient.addColorStop(0, '#a5b4fc');
        headGradient.addColorStop(1, '#6366f1');
        ctx.fillStyle = headGradient;
        ctx.beginPath();
        ctx.ellipse(0, headY, 28, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Détails de la tête
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Museau
        ctx.fillStyle = '#818cf8';
        ctx.beginPath();
        ctx.ellipse(0, headY + 15, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Yeux expressifs
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-12, headY - 3, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(12, headY - 3, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupilles
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(-12, headY - 3, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(12, headY - 3, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Reflet des yeux
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-10, headY - 5, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(14, headY - 5, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Pattes
        if (!this.isSliding) {
            const legOffset = Math.sin(this.legAnimation) * 12;
            this.drawLeg(-20, this.height / 2 - 15 + legOffset, 14, 28, '#4f46e5');
            this.drawLeg(20, this.height / 2 - 15 - legOffset, 14, 28, '#4f46e5');
        } else {
            this.drawLeg(-25, this.height / 2 - 10, 16, 22, '#4f46e5');
            this.drawLeg(25, this.height / 2 - 10, 16, 22, '#4f46e5');
        }
        
        // Pattes arrière
        this.drawLeg(-30, this.height / 2 - 5, 16, 32, '#4f46e5');
        this.drawLeg(30, this.height / 2 - 5, 16, 32, '#4f46e5');
        
        ctx.restore();
    }
    
    drawLeg(x, y, w, h, color) {
        const legGradient = ctx.createLinearGradient(x - w/2, y, x + w/2, y + h);
        legGradient.addColorStop(0, color);
        legGradient.addColorStop(1, this.darkenColor(color, 0.3));
        ctx.fillStyle = legGradient;
        ctx.fillRect(x - w/2, y, w, h);
        ctx.strokeStyle = this.darkenColor(color, 0.4);
        ctx.lineWidth = 1;
        ctx.strokeRect(x - w/2, y, w, h);
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
            x: this.x + 15,
            y: this.y + 15,
            width: this.width - 30,
            height: this.height - 30
        };
    }
}

// ========================================
// OBSTACLES AMÉLIORÉS PAR NIVEAU
// ========================================

class Obstacle {
    constructor(type) {
        this.type = type;
        this.x = canvas.width;
        this.width = 0;
        this.height = 0;
        this.y = 0;
        this.rotation = 0;
        this.animationPhase = Math.random() * Math.PI * 2;
        
        const level = getCurrentLevel();
        
        if (type === 'cactus') {
            this.width = 55;
            this.height = 90;
            this.y = groundY - this.height;
            this.color = '#10b981';
        } else if (type === 'rock') {
            this.width = 65;
            this.height = 55;
            this.y = groundY;
            this.color = '#6b7280';
        } else if (type === 'tree') {
            this.width = 70;
            this.height = 120;
            this.y = groundY - this.height;
            this.color = '#166534';
        } else if (type === 'log') {
            this.width = 80;
            this.height = 40;
            this.y = groundY;
            this.color = '#92400e';
        } else if (type === 'moon') {
            this.width = 60;
            this.height = 60;
            this.y = groundY - 100;
            this.color = '#fbbf24';
        } else if (type === 'star') {
            this.width = 50;
            this.height = 50;
            this.y = groundY - 80;
            this.color = '#fbbf24';
        } else if (type === 'coral') {
            this.width = 60;
            this.height = 70;
            this.y = groundY - this.height;
            this.color = '#ec4899';
        } else if (type === 'seaweed') {
            this.width = 50;
            this.height = 100;
            this.y = groundY - this.height;
            this.color = '#10b981';
        } else if (type === 'asteroid') {
            this.width = 70;
            this.height = 70;
            this.y = groundY - 60;
            this.color = '#6b7280';
            this.rotation = Math.random() * Math.PI * 2;
        } else if (type === 'planet') {
            this.width = 80;
            this.height = 80;
            this.y = groundY - 80;
            this.color = '#8b5cf6';
        }
        
        this.passed = false;
    }
    
    update() {
        this.x -= baseSpeed * gameSpeed;
        this.animationPhase += 0.1;
        
        if (this.type === 'star' || this.type === 'moon') {
            this.y += Math.sin(this.animationPhase) * 3;
        }
        
        if (this.type === 'asteroid') {
            this.rotation += 0.1;
        }
        
        if (this.type === 'seaweed') {
            const wave = Math.sin(this.animationPhase * 2) * 8;
            this.x += wave * 0.1;
        }
    }
    
    draw() {
        ctx.save();
        
        if (this.type === 'cactus') {
            this.drawCactus();
        } else if (this.type === 'rock') {
            this.drawRock();
        } else if (this.type === 'tree') {
            this.drawTree();
        } else if (this.type === 'log') {
            this.drawLog();
        } else if (this.type === 'moon') {
            this.drawMoon();
        } else if (this.type === 'star') {
            this.drawStar();
        } else if (this.type === 'coral') {
            this.drawCoral();
        } else if (this.type === 'seaweed') {
            this.drawSeaweed();
        } else if (this.type === 'asteroid') {
            this.drawAsteroid();
        } else if (this.type === 'planet') {
            this.drawPlanet();
        }
        
        ctx.restore();
    }
    
    drawCactus() {
        const centerX = this.x + this.width / 2;
        
        // Corps principal avec gradient
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y + this.height);
        gradient.addColorStop(0, '#34d399');
        gradient.addColorStop(1, '#059669');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x + 20, this.y, 15, this.height);
        
        // Branches
        ctx.fillRect(this.x + 5, this.y + 25, 12, 35);
        ctx.fillRect(this.x + 38, this.y + 35, 12, 30);
        ctx.fillRect(this.x + 8, this.y + 55, 10, 25);
        
        // Détails - épines
        ctx.strokeStyle = '#047857';
        ctx.lineWidth = 1;
        for (let i = 5; i < this.height; i += 10) {
            ctx.beginPath();
            ctx.moveTo(this.x + 35, this.y + i);
            ctx.lineTo(this.x + 40, this.y + i - 4);
            ctx.stroke();
        }
    }
    
    drawRock() {
        // Forme irrégulière avec ombres
        const gradient = ctx.createRadialGradient(
            this.x + this.width/2, this.y + this.height/2, 0,
            this.x + this.width/2, this.y + this.height/2, this.width
        );
        gradient.addColorStop(0, '#9ca3af');
        gradient.addColorStop(1, '#4b5563');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(this.x + 20, this.y);
        ctx.quadraticCurveTo(this.x + 10, this.y + 15, this.x + 5, this.y + 25);
        ctx.quadraticCurveTo(this.x, this.y + 35, this.x + 15, this.y + this.height);
        ctx.quadraticCurveTo(this.x + 40, this.y + this.height + 5, this.x + this.width - 5, this.y + this.height - 8);
        ctx.quadraticCurveTo(this.x + this.width, this.y + 25, this.x + 50, this.y + 10);
        ctx.quadraticCurveTo(this.x + 35, this.y + 3, this.x + 20, this.y);
        ctx.closePath();
        ctx.fill();
        
        // Détails
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    drawTree() {
        // Tronc
        const trunkGradient = ctx.createLinearGradient(this.x + 25, this.y, this.x + 25, this.y + this.height);
        trunkGradient.addColorStop(0, '#92400e');
        trunkGradient.addColorStop(1, '#78350f');
        ctx.fillStyle = trunkGradient;
        ctx.fillRect(this.x + 25, this.y + 60, 20, 60);
        
        // Feuillage
        const leafGradient = ctx.createRadialGradient(
            this.x + this.width/2, this.y + 40, 0,
            this.x + this.width/2, this.y + 40, 50
        );
        leafGradient.addColorStop(0, '#22c55e');
        leafGradient.addColorStop(1, '#15803d');
        ctx.fillStyle = leafGradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + 40, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - 15, this.y + 30, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 + 15, this.y + 30, 25, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawLog() {
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
        gradient.addColorStop(0, '#a16207');
        gradient.addColorStop(1, '#78350f');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2, this.height/2, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cercles de croissance
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/3, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    drawMoon() {
        const gradient = ctx.createRadialGradient(
            this.x + this.width/2, this.y + this.height/2, 0,
            this.x + this.width/2, this.y + this.height/2, this.width/2
        );
        gradient.addColorStop(0, '#fef3c7');
        gradient.addColorStop(1, '#f59e0b');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Cratères
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 - 10, this.y + this.height/2 - 10, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + this.width/2 + 15, this.y + this.height/2 + 10, 6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawStar() {
        ctx.fillStyle = '#fef3c7';
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
            const x = Math.cos(angle) * (this.width/2);
            const y = Math.sin(angle) * (this.height/2);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
    
    drawCoral() {
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, '#f472b6');
        gradient.addColorStop(1, '#ec4899');
        ctx.fillStyle = gradient;
        
        // Forme de corail
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y + this.height);
        ctx.lineTo(this.x + 10, this.y + this.height - 40);
        ctx.lineTo(this.x + 20, this.y + this.height - 60);
        ctx.lineTo(this.x + this.width/2, this.y);
        ctx.lineTo(this.x + this.width - 20, this.y + this.height - 60);
        ctx.lineTo(this.x + this.width - 10, this.y + this.height - 40);
        ctx.closePath();
        ctx.fill();
    }
    
    drawSeaweed() {
        const wave = Math.sin(this.animationPhase * 2) * 10;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width/2, this.y + this.height);
        ctx.quadraticCurveTo(this.x + this.width/2 + wave, this.y + this.height/2, this.x + this.width/2, this.y);
        ctx.stroke();
    }
    
    drawAsteroid() {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotation);
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width/2);
        gradient.addColorStop(0, '#9ca3af');
        gradient.addColorStop(1, '#374151');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Détails
        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.arc(-10, -5, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(12, 8, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    drawPlanet() {
        const gradient = ctx.createRadialGradient(
            this.x + this.width/2 - 15, this.y + this.height/2 - 15, 0,
            this.x + this.width/2, this.y + this.height/2, this.width/2
        );
        gradient.addColorStop(0, '#a78bfa');
        gradient.addColorStop(1, '#6d28d9');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Anneaux
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(this.x + this.width/2, this.y + this.height/2, this.width/2 + 8, 4, 0, 0, Math.PI * 2);
        ctx.stroke();
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

// ========================================
// POWER-UPS & PARTICULES (inchangés mais optimisés)
// ========================================

class PowerUp {
    constructor(type) {
        this.type = type;
        this.width = 50;
        this.height = 50;
        this.x = canvas.width;
        this.y = canvas.height - 240;
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
        this.rotation += 0.1;
        this.floatPhase += 0.06;
        this.floatY = Math.sin(this.floatPhase) * 10;
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2 + this.floatY);
        ctx.rotate(this.rotation);
        
        ctx.shadowBlur = 25;
        ctx.shadowColor = this.color;
        
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
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px sans-serif';
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

class Particle {
    constructor(x, y, color, velocityX, velocityY, size = 5) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.life = 1.0;
        this.decay = 0.012;
        this.size = size;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.3;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += 0.25;
        this.velocityX *= 0.97;
        this.rotation += this.rotationSpeed;
        this.life -= this.decay;
    }
    
    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
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
let obstacleSpawnInterval = 90;

let powerUpSpawnTimer = 0;
let powerUpSpawnInterval = 400;

let lastFrameTime = 0;
let frameCount = 0;

let activePowerUp = null;
let powerUpTimer = 0;
let powerUpMaxTimer = 300;
let playerInvincible = false;
let slowMotionActive = false;

// ========================================
// FONCTIONS UTILITAIRES
// ========================================

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkGameCollisions() {
    if (playerInvincible && activePowerUp === 'invincible') {
        return false;
    }
    
    const playerHitbox = player.getHitbox();
    
    for (let obstacle of obstacles) {
        if (checkCollision(playerHitbox, obstacle.getHitbox())) {
            return true;
        }
    }
    
    return false;
}

function spawnObstacle() {
    const level = getCurrentLevel();
    const types = level.obstacleTypes;
    const type = types[Math.floor(Math.random() * types.length)];
    obstacles.push(new Obstacle(type));
}

function spawnPowerUp() {
    const types = ['doubleJump', 'slowMotion', 'invincible'];
    const type = types[Math.floor(Math.random() * types.length)];
    powerUps.push(new PowerUp(type));
}

function activatePowerUp(type) {
    activePowerUp = type;
    powerUpTimer = powerUpMaxTimer;
    
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
        
        if (powerUpTimer <= 0) {
            if (activePowerUp === 'slowMotion') {
                slowMotionActive = false;
            } else if (activePowerUp === 'invincible') {
                playerInvincible = false;
            } else if (activePowerUp === 'doubleJump') {
                player.doubleJumpAvailable = false;
                player.canDoubleJump = false;
            }
            
            activePowerUp = null;
            powerUpTimer = 0;
            document.getElementById('powerUpIndicator').classList.remove('active');
        }
    }
}

// ========================================
// ARRIÈRE-PLAN AVEC NIVEAUX
// ========================================

function drawBackground() {
    const level = getCurrentLevel();
    currentLevel = level;
    
    // Ciel avec gradient selon le niveau
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height - 140);
    level.skyGradient.forEach((color, index) => {
        skyGradient.addColorStop(index / (level.skyGradient.length - 1), color);
    });
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height - 140);
    
    // Nuages (selon le niveau)
    if (level.clouds) {
        const cloudOffset = (Date.now() * 0.003 * gameSpeed) % (canvas.width + 300);
        for (let i = 0; i < 6; i++) {
            const cloudX = (i * 250 + cloudOffset) % (canvas.width + 300) - 150;
            const cloudY = 60 + i * 50;
            drawCloud(cloudX, cloudY);
        }
    }
    
    // Étoiles (niveau nuit/espace)
    if (level.stars) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        for (let i = 0; i < 150; i++) {
            const x = (i * 97) % canvas.width;
            const y = (i * 143) % (canvas.height - 150);
            const twinkle = Math.sin(Date.now() * 0.003 + i) * 0.5 + 0.5;
            const size = (Math.sin(Date.now() * 0.005 + i) * 0.8 + 1.2) * twinkle;
            ctx.globalAlpha = twinkle;
            ctx.fillRect(x, y, size, size);
        }
        ctx.globalAlpha = 1;
    }
    
    // Sol avec gradient
    function darkenColor(color, amount) {
        if (color.startsWith('#')) {
            const num = parseInt(color.replace("#", ""), 16);
            const r = Math.max(0, Math.floor((num >> 16) * (1 - amount)));
            const g = Math.max(0, Math.floor(((num >> 8) & 0x00FF) * (1 - amount)));
            const b = Math.max(0, Math.floor((num & 0x0000FF) * (1 - amount)));
            return `rgb(${r},${g},${b})`;
        }
        return color;
    }
    
    const groundGradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
    groundGradient.addColorStop(0, level.groundColor);
    groundGradient.addColorStop(1, darkenColor(level.groundColor, 0.3));
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    
    // Lignes de perspective
    ctx.strokeStyle = `rgba(255, 255, 255, ${level.id === 2 ? 0.2 : 0.15})`;
    ctx.lineWidth = 2;
    const lineOffset = (Date.now() * 0.02 * gameSpeed) % 70;
    
    for (let i = -1; i < canvas.width / 70 + 1; i++) {
        const x = i * 70 - lineOffset;
        const perspectivePoint = canvas.width / 2;
        const startY = groundY;
        const endX = perspectivePoint + (x - perspectivePoint) * 1.2;
        const endY = canvas.height;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
    
    // Afficher le nom du niveau
    if (score > 0 && score % 500 < 100) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 32px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(level.name, canvas.width / 2, 60);
        ctx.globalAlpha = 0.6;
        ctx.fillText(level.name, canvas.width / 2, 60);
        ctx.globalAlpha = 1;
    }
}

function drawCloud(x, y) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.arc(x + 30, y, 40, 0, Math.PI * 2);
    ctx.arc(x + 60, y, 35, 0, Math.PI * 2);
    ctx.fill();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    
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
        if (slowMotionActive) {
            gameSpeed = 0.5;
        } else {
            gameSpeed = Math.min(3.5, 1 + score / 600);
        }
        
        player.update();
        
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
        
        obstacleSpawnTimer++;
        if (obstacleSpawnTimer >= obstacleSpawnInterval / gameSpeed) {
            spawnObstacle();
            obstacleSpawnTimer = 0;
            obstacleSpawnInterval = Math.max(50, obstacleSpawnInterval - 0.2);
        }
        
        powerUps.forEach(powerUp => {
            powerUp.update();
            
            if (!powerUp.collected && checkCollision(player.getHitbox(), powerUp.getHitbox())) {
                powerUp.collected = true;
                activatePowerUp(powerUp.type);
            }
        });
        
        powerUps = powerUps.filter(powerUp => powerUp.x + powerUp.width > 0 && !powerUp.collected);
        
        powerUpSpawnTimer++;
        if (powerUpSpawnTimer >= powerUpSpawnInterval) {
            if (Math.random() < 0.25) {
                spawnPowerUp();
            }
            powerUpSpawnTimer = 0;
        }
        
        particles.forEach(particle => particle.update());
        particles = particles.filter(particle => particle.life > 0);
        
        updatePowerUp();
        
        if (checkGameCollisions()) {
            audioManager.playCollision();
            gameOver();
        }
        
        const speedPercentage = (gameSpeed / 3.5) * 100;
        document.getElementById('speedBar').style.width = speedPercentage + '%';
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// ========================================
// GESTION DES ÉVÉNEMENTS (reste inchangé)
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
    obstacleSpawnInterval = 90;
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
    
    const level = getCurrentLevel();
    for (let i = 0; i < 40; i++) {
        particles.push(new Particle(
            player.x + player.width / 2,
            player.y + player.height / 2,
            level.particleColor,
            Math.random() * 12 - 6,
            Math.random() * 12 - 6,
            6
        ));
    }
    
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

document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('usernameInput').value.trim();
    if (username) {
        accountManager.login(username);
        const account = accountManager.getCurrentAccount();
        if (account) {
            document.getElementById('playerName').textContent = account.username;
            document.getElementById('welcomeName').textContent = account.username;
            document.getElementById('bestScore').textContent = (account.bestScore || 0).toLocaleString();
            
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

loadAccountsList();
updateScore();
requestAnimationFrame(gameLoop);
