class WaveSystem {
    constructor(path, config) {
        this.path = path;
        this.config = config;
        this.currentWave = 0;
        this.activeEnemies = [];
        this.isWaveActive = false;
        this.enemyQueue = [];
        this.lastSpawnTime = 0;
        
        // Event callbacks
        this.onEnemyDeath = null;
        this.onEnemyReachEnd = null;
        this.onWaveComplete = null;
    }

    generateWave() {
        if (this.isWaveActive) return;
        
        this.currentWave++;
        this.isWaveActive = true;
        
        // Calculate number of enemies for this wave
        const enemyCount = this.config.initialEnemyCount + 
            (this.currentWave - 1) * this.config.enemyCountIncrease;
        
        // Clear any remaining enemies from previous waves
        this.enemyQueue = [];
        
        // Generate enemies for this wave
        for (let i = 0; i < enemyCount; i++) {
            let enemy;
            
            // Check if this should be a boss wave
            if (this.currentWave % this.config.bossFrequency === 0 && i === enemyCount - 1) {
                enemy = new BossEnemy(
                    this.path.points[0].x,
                    this.path.points[0].y,
                    this.path,
                    this.config.enemyHealth * 5,  // Boss has 5x health
                    this.config.enemySpeed * 0.7  // Boss is slower
                );
            } else {
                // Determine enemy type based on wave number and available types
                let enemyType = this.getEnemyTypeForWave();
                
                switch (enemyType) {
                    case 'speed':
                        enemy = new SpeedEnemy(
                            this.path.points[0].x,
                            this.path.points[0].y,
                            this.path,
                            this.config.enemyHealth * 0.7,
                            this.config.enemySpeed * 1.5
                        );
                        break;
                    case 'armored':
                        enemy = new ArmoredEnemy(
                            this.path.points[0].x,
                            this.path.points[0].y,
                            this.path,
                            this.config.enemyHealth * 2,
                            this.config.enemySpeed * 0.8
                        );
                        break;
                    case 'layered':
                        enemy = new LayeredEnemy(
                            this.path.points[0].x,
                            this.path.points[0].y,
                            this.path,
                            this.config.enemyHealth * 1.5,
                            this.config.enemySpeed * 0.9
                        );
                        break;
                    default:
                        enemy = new Enemy(
                            this.path.points[0].x,
                            this.path.points[0].y,
                            this.path,
                            this.config.enemyHealth,
                            this.config.enemySpeed
                        );
                }
            }
            
            // Apply wave scaling
            enemy.health *= (1 + this.currentWave * 0.1); // 10% health increase per wave
            enemy.value *= (1 + this.currentWave * 0.05); // 5% value increase per wave
            
            // Apply reward multiplier if specified in config
            if (this.config.reward) {
                enemy.value = Math.ceil(enemy.value * this.config.reward);
            }
            
            this.enemyQueue.push(enemy);
        }
    }

    getEnemyTypeForWave() {
        if (!this.config.enemyTypes) return 'basic';
        
        const availableTypes = this.config.enemyTypes;
        
        // More advanced enemies become more common in later waves
        const waveProgress = Math.min(this.currentWave / 20, 1); // Max difficulty at wave 20
        
        // Random selection weighted by wave progress
        const rand = Math.random();
        if (rand < waveProgress * 0.7) { // 70% chance for advanced enemy in later waves
            return availableTypes[Math.floor(Math.random() * availableTypes.length)];
        }
        return 'basic';
    }

    update(deltaTime) {
        if (!this.isWaveActive) return;

        // Spawn enemies from queue
        const currentTime = performance.now();
        if (this.enemyQueue.length > 0 && currentTime - this.lastSpawnTime >= this.config.spawnInterval) {
            const enemy = this.enemyQueue.shift();
            this.activeEnemies.push(enemy);
            this.lastSpawnTime = currentTime;
        }

        // Update active enemies
        for (let i = this.activeEnemies.length - 1; i >= 0; i--) {
            const enemy = this.activeEnemies[i];
            enemy.update(deltaTime);

            if (!enemy.isAlive) {
                this.activeEnemies.splice(i, 1);
                if (this.onEnemyDeath) {
                    this.onEnemyDeath(enemy);
                }
            } else if (enemy.reachedEnd) {
                this.activeEnemies.splice(i, 1);
                if (this.onEnemyReachEnd) {
                    this.onEnemyReachEnd(enemy);
                }
            }
        }

        // Check if wave is complete
        if (this.enemyQueue.length === 0 && this.activeEnemies.length === 0) {
            this.isWaveActive = false;
            if (this.onWaveComplete) {
                this.onWaveComplete();
            }
        }
    }

    draw(ctx) {
        // Draw active enemies
        this.activeEnemies.forEach(enemy => {
            if (enemy.isAlive) {
                enemy.draw(ctx);
            }
        });
    }
} 