class Achievements {
    constructor(game) {
        this.game = game;
        
        // Try to load saved stats from localStorage
        const savedStats = this.loadStats();
        
        this.stats = {
            timePlayed: savedStats?.timePlayed || 0,
            enemiesKilled: savedStats?.enemiesKilled || 0,
            wavesCompleted: savedStats?.wavesCompleted || 0,
            powerUpsUsed: savedStats?.powerUpsUsed || 0,
            totalMoney: savedStats?.totalMoney || 0,
            highestWave: savedStats?.highestWave || 0
        };
        
        // Try to load saved rewards from localStorage
        const savedRewards = this.loadRewards();
        
        this.rewards = {
            doubleIncome: {
                name: "Double Income",
                description: "Earn twice as much money from kills",
                unlocked: savedRewards?.doubleIncome || false,
                requirement: { enemiesKilled: 1000 }
            },
            waveRush: {
                name: "Wave Rush",
                description: "Reduce time between waves by 50%",
                unlocked: savedRewards?.waveRush || false,
                requirement: { wavesCompleted: 20 }
            },
            veteranBonus: {
                name: "Veteran Bonus",
                description: "Start with 500 extra money",
                unlocked: savedRewards?.veteranBonus || false,
                requirement: { timePlayed: 3600 } // 1 hour in seconds
            },
            powerUpMaster: {
                name: "Power-Up Master",
                description: "25% discount on all power-ups",
                unlocked: savedRewards?.powerUpMaster || false,
                requirement: { powerUpsUsed: 50 }
            }
        };

        this.startTime = Date.now();
        
        // Set up auto-save interval
        this.autoSaveInterval = setInterval(() => this.saveProgress(), 30000); // Save every 30 seconds
    }

    loadStats() {
        try {
            const saved = localStorage.getItem('vibeDefense_stats');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Failed to load stats:', e);
            return null;
        }
    }

    loadRewards() {
        try {
            const saved = localStorage.getItem('vibeDefense_rewards');
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error('Failed to load rewards:', e);
            return null;
        }
    }

    saveProgress() {
        try {
            // Update time played before saving
            this.updateTimePlayed();
            
            // Save stats
            localStorage.setItem('vibeDefense_stats', JSON.stringify(this.stats));
            
            // Save reward unlocks
            const rewardStates = {};
            Object.entries(this.rewards).forEach(([key, reward]) => {
                rewardStates[key] = reward.unlocked;
            });
            localStorage.setItem('vibeDefense_rewards', JSON.stringify(rewardStates));
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
    }

    setupEventListeners() {
        if (!this.game.waveSystem) return;

        // Store original callbacks if they exist
        const originalOnEnemyDeath = this.game.waveSystem.onEnemyDeath || (() => {});
        const originalOnWaveComplete = this.game.waveSystem.onWaveComplete || (() => {});

        // Track enemy kills
        this.game.waveSystem.onEnemyDeath = (enemy) => {
            this.stats.enemiesKilled++;
            this.stats.totalMoney += enemy.value * (this.rewards.doubleIncome.unlocked ? 2 : 1);
            this.checkRewards();
            originalOnEnemyDeath(enemy);
        };

        // Track wave completion
        this.game.waveSystem.onWaveComplete = () => {
            this.stats.wavesCompleted++;
            this.stats.highestWave = Math.max(this.stats.highestWave, this.game.waveSystem.currentWave);
            this.checkRewards();
            originalOnWaveComplete();
        };
    }

    updateTimePlayed() {
        const currentTime = Math.floor((Date.now() - this.startTime) / 1000);
        this.stats.timePlayed += currentTime;
        this.startTime = Date.now(); // Reset start time for next calculation
    }

    checkRewards() {
        let rewardUnlocked = false;
        
        for (const [id, reward] of Object.entries(this.rewards)) {
            if (!reward.unlocked) {
                const requirement = Object.entries(reward.requirement)[0];
                const [stat, value] = requirement;
                if (this.stats[stat] >= value) {
                    reward.unlocked = true;
                    this.showRewardNotification(reward.name);
                    rewardUnlocked = true;
                }
            }
        }
        
        // Save progress when a reward is unlocked
        if (rewardUnlocked) {
            this.saveProgress();
        }
    }

    showRewardNotification(rewardName) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <h3>🏆 Achievement Unlocked!</h3>
            <p>${rewardName}</p>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    getFormattedTime() {
        const hours = Math.floor(this.stats.timePlayed / 3600);
        const minutes = Math.floor((this.stats.timePlayed % 3600) / 60);
        const seconds = this.stats.timePlayed % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    }

    showAchievementsScreen() {
        // Update time played before showing screen
        this.updateTimePlayed();
        
        const achievementsScreen = document.createElement('div');
        achievementsScreen.id = 'achievementsScreen';
        achievementsScreen.className = 'game-screen';
        achievementsScreen.innerHTML = `
            <div class="achievements-container">
                <h2>Achievements</h2>
                <div class="stats-section">
                    <h3>Statistics</h3>
                    <div class="stat-grid">
                        <div class="stat-item">
                            <span class="stat-label">Time Played:</span>
                            <span class="stat-value">${this.getFormattedTime()}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Enemies Killed:</span>
                            <span class="stat-value">${this.stats.enemiesKilled}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Waves Completed:</span>
                            <span class="stat-value">${this.stats.wavesCompleted}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Power-ups Used:</span>
                            <span class="stat-value">${this.stats.powerUpsUsed}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Total Money Earned:</span>
                            <span class="stat-value">$${this.stats.totalMoney}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Highest Wave:</span>
                            <span class="stat-value">${this.stats.highestWave}</span>
                        </div>
                    </div>
                </div>
                <div class="rewards-section">
                    <h3>Rewards</h3>
                    <div class="rewards-grid">
                        ${Object.entries(this.rewards).map(([id, reward]) => `
                            <div class="reward-item ${reward.unlocked ? 'unlocked' : ''}">
                                <h4>${reward.name}</h4>
                                <p>${reward.description}</p>
                                <div class="progress-bar">
                                    <div class="progress" style="width: ${this.getProgressPercentage(id)}%"></div>
                                </div>
                                <span class="progress-text">${this.getProgressText(id)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <button class="close-button" onclick="this.closest('#achievementsScreen').remove()">Close</button>
            </div>
        `;
        document.body.appendChild(achievementsScreen);
    }

    getProgressPercentage(rewardId) {
        const reward = this.rewards[rewardId];
        const [stat, required] = Object.entries(reward.requirement)[0];
        const current = this.stats[stat];
        return Math.min(100, Math.floor((current / required) * 100));
    }

    getProgressText(rewardId) {
        const reward = this.rewards[rewardId];
        const [stat, required] = Object.entries(reward.requirement)[0];
        const current = this.stats[stat];
        return `${current}/${required}`;
    }
} 