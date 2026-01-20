/* ========================================
   SYSTÈME AUDIO - Web Audio API
   Sons procéduraux pour le jeu
   ======================================== */

class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.enabled = false;
        this.volume = 0.5;
        
        // Initialiser le contexte audio (après interaction utilisateur)
        this.init();
    }
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
        } catch (e) {
            console.warn('Web Audio API non supportée');
        }
    }
    
    enable() {
        this.enabled = true;
        // Redémarrer le contexte si suspendu
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }
    
    disable() {
        this.enabled = false;
    }
    
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }
    
    // Générer un son de saut
    playJump() {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3 * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }
    
    // Générer un son de collision
    playCollision() {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.4 * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
        
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.3);
    }
    
    // Générer un son de power-up
    playPowerUp() {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.3 * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
        
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.2);
    }
    
    // Générer un son de score
    playScore() {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.05);
        
        gainNode.gain.setValueAtTime(0.2 * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }
    
    // Générer un son de glissade
    playSlide() {
        if (!this.enabled || !this.audioContext) return;
        
        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.15);
        
        gainNode.gain.setValueAtTime(0.2 * this.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);
        
        osc.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.15);
    }
    
    // Son de fond (ambiance)
    startBackground() {
        if (!this.enabled || !this.audioContext) return;
        
        // Créer un son d'ambiance basse fréquence
        this.backgroundOsc = this.audioContext.createOscillator();
        this.backgroundGain = this.audioContext.createGain();
        
        this.backgroundOsc.type = 'sine';
        this.backgroundOsc.frequency.value = 60;
        
        this.backgroundGain.gain.value = 0.05 * this.volume;
        
        this.backgroundOsc.connect(this.backgroundGain);
        this.backgroundGain.connect(this.masterGain);
        
        this.backgroundOsc.start();
    }
    
    stopBackground() {
        if (this.backgroundOsc) {
            this.backgroundOsc.stop();
            this.backgroundOsc = null;
        }
    }
}

// Instance globale
const audioManager = new AudioManager();
