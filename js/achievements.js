class Achievements {
    constructor(game) {
        this.game = game;
        this.stats = {
            timePlayed: 0,
            enemiesKilled: 0,
            wavesCompleted: 0,
            powerUpsUsed: 0,
            totalMoney: 0,
            highestWave: 0
        };
        
        this.rewards = {
            doubleIncome: {
                name: "Double Income",
                description: "Earn twice as much money from kills",
                unlocked: false,
                requirement: { enemiesKilled: 1000 }
            },
            waveRush: {
                name: "Wave Rush",
                description: "Reduce time between waves by 50%",
                unlocked: false,
                requirement: { wavesCompleted: 20 }
            },
            veteranBonus: {
                name: "Veteran Bonus",
                description: "Start with 500 extra money",
                unlocked: false,
                requirement: { timePlayed: 3600 } // 1 hour in seconds
            },
            powerUpMaster: {
                name: "Power-Up Master",
                description: "25% discount on all power-ups",
                unlocked: false,
                requirement: { powerUpsUsed: 50 }
            }
        };

        this.startTime = Date.now();
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
        this.stats.timePlayed = Math.floor((Date.now() - this.startTime) / 1000);
    }

    checkRewards() {
        for (const [id, reward] of Object.entries(this.rewards)) {
            if (!reward.unlocked) {
                const requirement = Object.entries(reward.requirement)[0];
                const [stat, value] = requirement;
                if (this.stats[stat] >= value) {
                    reward.unlocked = true;
                    this.showRewardNotification(reward.name);
                }
            }
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