/* ========================================
   SYSTÈME DE COMPTES & SAUVEGARDE
   Gestion des profils utilisateurs locaux
   ======================================== */

class AccountManager {
    constructor() {
        this.accounts = this.loadAccounts();
        this.currentAccount = null;
    }
    
    // Charger les comptes depuis localStorage
    loadAccounts() {
        try {
            const stored = localStorage.getItem('nexusRunnerAccounts');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            return {};
        }
    }
    
    // Sauvegarder les comptes
    saveAccounts() {
        try {
            localStorage.setItem('nexusRunnerAccounts', JSON.stringify(this.accounts));
        } catch (e) {
            console.warn('Impossible de sauvegarder les comptes');
        }
    }
    
    // Créer ou récupérer un compte
    login(username) {
        if (!username || username.trim() === '') {
            return false;
        }
        
        const cleanUsername = username.trim().substring(0, 20);
        
        // Créer le compte s'il n'existe pas
        if (!this.accounts[cleanUsername]) {
            this.accounts[cleanUsername] = {
                username: cleanUsername,
                bestScore: 0,
                totalGames: 0,
                totalScore: 0,
                createdAt: Date.now(),
                lastPlayed: Date.now()
            };
        } else {
            // Mettre à jour la date de dernière connexion
            this.accounts[cleanUsername].lastPlayed = Date.now();
        }
        
        this.currentAccount = cleanUsername;
        this.saveAccounts();
        return true;
    }
    
    // Se déconnecter
    logout() {
        this.currentAccount = null;
    }
    
    // Obtenir le compte actuel
    getCurrentAccount() {
        if (!this.currentAccount) return null;
        return this.accounts[this.currentAccount];
    }
    
    // Mettre à jour le meilleur score
    updateBestScore(score) {
        if (!this.currentAccount || !this.accounts[this.currentAccount]) {
            return false;
        }
        
        const account = this.accounts[this.currentAccount];
        const isNewRecord = score > account.bestScore;
        
        if (isNewRecord) {
            account.bestScore = score;
        }
        
        account.totalGames += 1;
        account.totalScore += score;
        account.lastPlayed = Date.now();
        
        this.saveAccounts();
        return isNewRecord;
    }
    
    // Obtenir la liste des comptes triés
    getAccountsList() {
        return Object.values(this.accounts)
            .sort((a, b) => {
                // Trier par meilleur score, puis par dernière connexion
                if (b.bestScore !== a.bestScore) {
                    return b.bestScore - a.bestScore;
                }
                return b.lastPlayed - a.lastPlayed;
            });
    }
    
    // Supprimer un compte
    deleteAccount(username) {
        if (this.accounts[username]) {
            delete this.accounts[username];
            this.saveAccounts();
            
            // Si c'est le compte actuel, se déconnecter
            if (this.currentAccount === username) {
                this.logout();
            }
            return true;
        }
        return false;
    }
}

// Instance globale
const accountManager = new AccountManager();
