class WaveSystem {
    constructor(path) {
        this.path = path;
        this.currentWave = 0;
        this.enemiesSpawned = 0;
        this.enemiesDefeated = 0;
        this.isWaveActive = false;
        this.spawnQueue = [];
        this.activeEnemies = [];
        this.lastSpawnTime = 0;
        this.spawnInterval = 1000; // Base spawn interval in ms
        this.onWaveComplete = () => {};
        this.onEnemySpawn = () => {};
        this.onEnemyDeath = () => {};
        this.onEnemyReachEnd = () => {};
    }

    generateWave() {
        this.currentWave++;
        this.spawnQueue = [];
        this.enemiesSpawned = 0;
        this.enemiesDefeated = 0;
        
        // Adjust difficulty based on wave number
        const waveConfig = this.getWaveConfig();
        
        // Generate spawn queue based on wave config
        waveConfig.enemies.forEach(enemy => {
            for (let i = 0; i < enemy.count; i++) {
                this.spawnQueue.push({
                    type: enemy.type,
                    delay: enemy.delay || 0
                });
            }
        });

        // Shuffle spawn queue for variety
        this.shuffleQueue();
        
        this.isWaveActive = true;
        this.lastSpawnTime = Date.now();
        this.spawnInterval = waveConfig.spawnInterval;
    }

    getWaveConfig() {
        // Base configuration that scales with wave number
        const config = {
            spawnInterval: Math.max(1000 - this.currentWave * 50, 400), // Spawn faster as waves progress
            enemies: []
        };

        if (this.currentWave % 5 === 0) {
            // Boss wave every 5 waves
            config.enemies.push({
                type: 'Boss',
                count: Math.floor(this.currentWave / 10) + 1,
                delay: 2000
            });
            config.enemies.push({
                type: 'Speed',
                count: this.currentWave,
                delay: 500
            });
        } else {
            // Regular wave
            const baseEnemyCount = Math.floor(10 + this.currentWave * 1.5);
            
            // Add basic enemies
            config.enemies.push({
                type: 'Basic',
                count: baseEnemyCount,
                delay: 0
            });

            // Add speed enemies after wave 2
            if (this.currentWave > 2) {
                config.enemies.push({
                    type: 'Speed',
                    count: Math.floor(this.currentWave / 2),
                    delay: 0
                });
            }

            // Add armored enemies after wave 3
            if (this.currentWave > 3) {
                config.enemies.push({
                    type: 'Armored',
                    count: Math.floor(this.currentWave / 3),
                    delay: 500
                });
            }

            // Add layered enemies after wave 4
            if (this.currentWave > 4) {
                config.enemies.push({
                    type: 'Layered',
                    count: Math.floor(this.currentWave / 4),
                    delay: 1000
                });
            }
        }

        return config;
    }

    shuffleQueue() {
        for (let i = this.spawnQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.spawnQueue[i], this.spawnQueue[j]] = [this.spawnQueue[j], this.spawnQueue[i]];
        }
    }

    update(deltaTime) {
        if (!this.isWaveActive) return;

        // Update active enemies
        this.activeEnemies = this.activeEnemies.filter(enemy => !enemy.isDead);
        this.activeEnemies.forEach(enemy => enemy.update(deltaTime));

        // Check if it's time to spawn next enemy
        const currentTime = Date.now();
        if (this.spawnQueue.length > 0 && currentTime - this.lastSpawnTime >= this.spawnInterval) {
            const enemyConfig = this.spawnQueue.shift();
            setTimeout(() => this.spawnEnemy(enemyConfig.type), enemyConfig.delay);
            this.lastSpawnTime = currentTime;
        }

        // Check if wave is complete
        if (this.spawnQueue.length === 0 && this.activeEnemies.length === 0) {
            this.isWaveActive = false;
            this.onWaveComplete();
        }
    }

    spawnEnemy(type) {
        const EnemyClass = EnemyTypes[type];
        if (!EnemyClass) return;

        const enemy = new EnemyClass(this.path);
        
        // Set up callbacks
        enemy.onDeath = () => {
            this.enemiesDefeated++;
            this.onEnemyDeath(enemy);
        };
        enemy.onReachEnd = () => {
            this.onEnemyReachEnd(enemy);
        };

        this.activeEnemies.push(enemy);
        this.enemiesSpawned++;
        this.onEnemySpawn(enemy);
    }

    draw(ctx) {
        this.activeEnemies.forEach(enemy => enemy.draw(ctx));
    }

    getWaveProgress() {
        return {
            wave: this.currentWave,
            spawned: this.enemiesSpawned,
            defeated: this.enemiesDefeated,
            remaining: this.spawnQueue.length + this.activeEnemies.length,
            isActive: this.isWaveActive
        };
    }
} 