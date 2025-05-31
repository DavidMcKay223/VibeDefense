class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.money = 200;
        this.lives = 20;
        this.score = 0;
        this.towers = [];
        this.path = this.createPath();
        this.waveSystem = new WaveSystem(this.path);
        this.setupWaveCallbacks();
        this.lastFrameTime = 0;
        this.isPaused = false;
        this.setupUI();
    }

    setupWaveCallbacks() {
        this.waveSystem.onEnemyDeath = (enemy) => {
            this.money += enemy.value;
            this.score += enemy.value;
            this.updateUI();
        };

        this.waveSystem.onEnemyReachEnd = (enemy) => {
            this.lives--;
            this.updateUI();
            if (this.lives <= 0) {
                this.gameOver();
            }
        };

        this.waveSystem.onWaveComplete = () => {
            // Bonus money for completing wave
            const bonus = 50 + this.waveSystem.currentWave * 10;
            this.money += bonus;
            this.updateUI();
            
            // Show wave complete message
            const message = document.getElementById('waveMessage');
            message.textContent = `Wave ${this.waveSystem.currentWave} Complete! +${bonus} bonus gold`;
            message.style.display = 'block';
            setTimeout(() => {
                message.style.display = 'none';
            }, 3000);

            // Start next wave after delay
            setTimeout(() => {
                if (!this.isPaused) {
                    this.waveSystem.generateWave();
                }
            }, 5000);
        };
    }

    setupUI() {
        // Tower selection buttons
        const towerButtons = document.querySelectorAll('.tower-button');
        towerButtons.forEach(button => {
            button.addEventListener('click', () => {
                const type = button.getAttribute('data-type');
                const TowerClass = Tower.types[type];
                if (this.money >= TowerClass.cost) {
                    Tower.isPlacing = true;
                    Tower.selectedType = TowerClass;
                    Tower.placementTower = new TowerClass(0, 0);
                }
            });
        });

        // Update tower costs in UI
        towerButtons.forEach(button => {
            const type = button.getAttribute('data-type');
            const cost = Tower.types[type].cost;
            const costSpan = button.querySelector('.tower-cost');
            if (costSpan) {
                costSpan.textContent = cost;
            }
        });

        // Start wave button
        const startWaveButton = document.getElementById('startWave');
        if (startWaveButton) {
            startWaveButton.addEventListener('click', () => {
                if (!this.waveSystem.isWaveActive) {
                    this.waveSystem.generateWave();
                }
            });
        }

        this.updateUI();
    }

    updateUI() {
        document.getElementById('money').textContent = this.money;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('score').textContent = this.score;
        document.getElementById('wave').textContent = this.waveSystem.currentWave;

        // Update tower button states
        const towerButtons = document.querySelectorAll('.tower-button');
        towerButtons.forEach(button => {
            const type = button.getAttribute('data-type');
            const TowerClass = Tower.types[type];
            button.disabled = this.money < TowerClass.cost;
        });
    }

    createPath() {
        const path = new Path();
        
        // Create a more interesting path with multiple turns
        const margin = 50;
        
        // Start from the left middle
        path.addPoint(0, this.height / 2);
        
        // First segment: Move right
        path.addPoint(this.width / 4, this.height / 2);
        
        // Go up
        path.addPoint(this.width / 4, margin);
        
        // Go right
        path.addPoint(this.width * 3/4, margin);
        
        // Go down
        path.addPoint(this.width * 3/4, this.height - margin);
        
        // Go left
        path.addPoint(this.width / 4, this.height - margin);
        
        // Go up to middle
        path.addPoint(this.width / 4, this.height / 2);
        
        // Final stretch to right
        path.addPoint(this.width, this.height / 2);
        
        return path;
    }

    handleClick(x, y) {
        if (Tower.isPlacing) {
            if (this.canPlaceTower(x, y)) {
                const tower = new Tower.selectedType(x, y);
                this.towers.push(tower);
                this.money -= Tower.selectedType.cost;
                this.updateUI();
            }
            Tower.isPlacing = false;
            Tower.placementTower = null;
        } else {
            // Select existing tower
            Tower.selectedTower = this.towers.find(tower => {
                const dx = tower.x - x;
                const dy = tower.y - y;
                return Math.sqrt(dx * dx + dy * dy) < tower.size;
            });

            if (Tower.selectedTower) {
                this.showTowerUpgradeUI(Tower.selectedTower);
            } else {
                this.hideTowerUpgradeUI();
            }
        }
    }

    handleMove(x, y) {
        if (Tower.isPlacing && Tower.placementTower) {
            Tower.placementTower.x = x;
            Tower.placementTower.y = y;
        }
    }

    canPlaceTower(x, y) {
        // Check if too close to path
        const minDistanceToPath = 30;
        if (this.path.isPointTooClose(x, y, minDistanceToPath)) {
            return false;
        }

        // Check if too close to other towers
        const minDistanceToTower = 40;
        return !this.towers.some(tower => {
            const dx = tower.x - x;
            const dy = tower.y - y;
            return Math.sqrt(dx * dx + dy * dy) < minDistanceToTower;
        });
    }

    showTowerUpgradeUI(tower) {
        const upgradeUI = document.getElementById('towerUpgrade');
        if (upgradeUI) {
            upgradeUI.style.display = 'block';
            const upgradeCost = tower.getUpgradeCost();
            const upgradeButton = document.getElementById('upgradeButton');
            if (upgradeButton) {
                upgradeButton.disabled = this.money < upgradeCost || upgradeCost === Infinity;
                upgradeButton.textContent = upgradeCost === Infinity ? 'Max Level' : `Upgrade (${upgradeCost})`;
                upgradeButton.onclick = () => {
                    if (this.money >= upgradeCost && tower.upgrade()) {
                        this.money -= upgradeCost;
                        this.updateUI();
                    }
                };
            }
        }
    }

    hideTowerUpgradeUI() {
        const upgradeUI = document.getElementById('towerUpgrade');
        if (upgradeUI) {
            upgradeUI.style.display = 'none';
        }
        Tower.selectedTower = null;
    }

    gameOver() {
        this.isPaused = true;
        const gameOverScreen = document.getElementById('gameOver');
        if (gameOverScreen) {
            gameOverScreen.style.display = 'block';
            document.getElementById('finalScore').textContent = this.score;
        }
    }

    restart() {
        this.money = 200;
        this.lives = 20;
        this.score = 0;
        this.towers = [];
        this.waveSystem = new WaveSystem(this.path);
        this.setupWaveCallbacks();
        this.isPaused = false;
        this.updateUI();
        
        const gameOverScreen = document.getElementById('gameOver');
        if (gameOverScreen) {
            gameOverScreen.style.display = 'none';
        }
    }

    gameLoop(currentTime) {
        if (this.isPaused) return;

        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw background
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw grid for visual reference
        this.drawGrid();

        // Draw path
        this.path.draw(this.ctx);

        // Update and draw towers
        this.towers.forEach(tower => {
            tower.update(deltaTime, this.waveSystem.activeEnemies);
            tower.draw(this.ctx);
        });

        // Update and draw wave system
        this.waveSystem.update(deltaTime);
        this.waveSystem.draw(this.ctx);

        // Draw tower being placed
        if (Tower.isPlacing && Tower.placementTower) {
            Tower.placementTower.draw(this.ctx);
            
            // Show placement validity
            const rect = this.canvas.getBoundingClientRect();
            const x = Tower.placementTower.x;
            const y = Tower.placementTower.y;
            
            if (this.canPlaceTower(x, y)) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, Tower.placementTower.size, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            } else {
                this.ctx.beginPath();
                this.ctx.arc(x, y, Tower.placementTower.size, 0, Math.PI * 2);
                this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    drawGrid() {
        const gridSize = 40;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x < this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y < this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    start() {
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.gameLoop.bind(this));

        // Start first wave after a short delay
        setTimeout(() => {
            if (!this.isPaused) {
                this.waveSystem.generateWave();
            }
        }, 2000);
    }
}

// Initialize game when window loads
window.addEventListener('load', () => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        const game = new Game(canvas);
        
        // Set up event listeners
        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            game.handleClick(x, y);
        });

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            game.handleMove(x, y);
        });

        // Start game
        game.start();
    }
}); 