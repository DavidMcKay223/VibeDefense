class Game {
    constructor(canvas) {
        console.log('Game constructor called');
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        console.log('Initializing game components...');
        this.achievements = new Achievements(this);
        console.log('Creating game menu...');
        this.menu = new GameMenu(this);
        console.log('Creating shop...');
        this.shop = new Shop(this);
        
        this.autoWaveEnabled = false;
        this.autoWaveDelay = 3000; // 3 seconds delay between waves
        
        console.log('Resetting game state...');
        this.reset();
        
        // Make the game instance globally accessible
        console.log('Setting global game instance');
        window.gameInstance = this;

        // Load assets before starting
        console.log('Loading game assets...');
        assetManager.loadAssets().then(() => {
            console.log('Assets loaded successfully');
        }).catch(error => {
            console.error('Failed to load assets:', error);
        });
        
        console.log('Game constructor complete');
    }

    reset() {
        this.money = 200;
        this.lives = 20;
        this.score = 0;
        this.towers = [];
        this.path = null;
        this.waveSystem = null;
        this.lastFrameTime = 0;
        this.isPaused = true;
        
        // Don't reset achievement stats on game reset
        // They should persist across games
    }

    initializeLevel(level) {
        this.reset();
        this.path = level.createPath(this.width, this.height);
        this.waveSystem = new WaveSystem(this.path, level.config);
        
        // Apply veteran bonus if unlocked
        if (this.achievements?.rewards?.veteranBonus?.unlocked) {
            this.money += 500;
        }
        
        // Apply wave rush reward if unlocked
        if (this.achievements?.rewards?.waveRush?.unlocked) {
            this.waveSystem.config.spawnInterval *= 0.5;
        }
        
        // Now that wave system is initialized, set up achievements
        if (this.achievements?.setupEventListeners) {
            this.achievements.setupEventListeners();
        }
        
        this.setupWaveCallbacks();
        this.setupUI();
        this.isPaused = false;
        // Show shop when game starts
        document.getElementById('shopPanel').style.display = 'block';
        this.start();
    }

    setupWaveCallbacks() {
        if (!this.waveSystem) return;

        this.waveSystem.onEnemyDeath = (enemy) => {
            const moneyGained = enemy.value * (this.achievements.rewards.doubleIncome.unlocked ? 2 : 1);
            this.money += moneyGained;
            this.score += enemy.value;
            
            // Update achievement stats
            this.achievements.stats.enemiesKilled++;
            this.achievements.stats.totalMoney += moneyGained;
            this.achievements.checkRewards();
            
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
            
            // Update achievement stats
            this.achievements.stats.wavesCompleted++;
            this.achievements.stats.totalMoney += bonus;
            this.achievements.stats.highestWave = Math.max(
                this.achievements.stats.highestWave,
                this.waveSystem.currentWave
            );
            this.achievements.checkRewards();
            
            this.updateUI();
            
            // Show wave complete message
            const message = document.getElementById('waveMessage');
            if (message) {
                message.textContent = `Wave ${this.waveSystem.currentWave} Complete! +${bonus} bonus gold`;
                message.style.display = 'block';
                setTimeout(() => {
                    message.style.display = 'none';
                }, 3000);
            }

            // Enable start wave button
            const startWaveButton = document.getElementById('startWave');
            if (startWaveButton) {
                startWaveButton.disabled = false;
                startWaveButton.textContent = 'Start Next Wave';
            }

            // If auto wave is enabled, start next wave after delay
            if (this.autoWaveEnabled && !this.isPaused) {
                setTimeout(() => {
                    if (this.autoWaveEnabled && !this.isPaused && !this.waveSystem.isWaveActive) {
                        this.waveSystem.generateWave();
                    }
                }, this.autoWaveDelay);
            }
        };
    }

    setupUI() {
        // Ensure game controls container exists
        let gameControls = document.getElementById('gameControls');
        if (!gameControls) {
            gameControls = document.createElement('div');
            gameControls.id = 'gameControls';
            const gameContainer = document.getElementById('gameContainer');
            if (gameContainer) {
                gameContainer.insertBefore(gameControls, gameContainer.firstChild);
            }
        }

        // Tower selection buttons
        const towerButtons = document.querySelectorAll('.tower-button');
        towerButtons.forEach(button => {
            button.addEventListener('click', () => {
                const type = button.getAttribute('data-type');
                const TowerClass = TowerManager.types[type];
                const cost = TowerManager.costs[type];
                if (this.money >= cost) {
                    TowerManager.isPlacing = true;
                    TowerManager.selectedType = TowerClass;
                    TowerManager.placementTower = new TowerClass(0, 0);
                }
            });
        });

        // Update tower costs in UI
        towerButtons.forEach(button => {
            const type = button.getAttribute('data-type');
            const cost = TowerManager.costs[type];
            const costSpan = button.querySelector('.tower-cost');
            if (costSpan) {
                costSpan.textContent = cost;
            }
        });

        // Start wave button
        const startWaveButton = document.getElementById('startWave');
        if (startWaveButton) {
            // Remove any existing event listeners
            const newButton = startWaveButton.cloneNode(true);
            startWaveButton.parentNode.replaceChild(newButton, startWaveButton);
            
            // Add new event listener
            newButton.addEventListener('click', () => {
                if (this.waveSystem && !this.waveSystem.isWaveActive) {
                    this.waveSystem.generateWave();
                    // Disable button during wave
                    newButton.disabled = true;
                    newButton.textContent = 'Wave in Progress...';
                }
            });
        }

        // Add achievements button if it doesn't exist
        if (!document.getElementById('achievementsButton') && gameControls) {
            const achievementsButton = document.createElement('button');
            achievementsButton.id = 'achievementsButton';
            achievementsButton.className = 'game-button';
            achievementsButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" fill="currentColor"/>
                </svg>
                Achievements
            `;
            achievementsButton.onclick = () => this.achievements.showAchievementsScreen();
            gameControls.appendChild(achievementsButton);
        }

        // Add auto wave toggle button
        if (!document.getElementById('autoWaveButton') && gameControls) {
            const autoWaveButton = document.createElement('button');
            autoWaveButton.id = 'autoWaveButton';
            autoWaveButton.className = 'game-button';
            this.updateAutoWaveButton(autoWaveButton);
            
            autoWaveButton.addEventListener('click', () => {
                this.autoWaveEnabled = !this.autoWaveEnabled;
                this.updateAutoWaveButton(autoWaveButton);
                
                // If enabled and no wave is active, start a new wave
                if (this.autoWaveEnabled && this.waveSystem && !this.waveSystem.isWaveActive) {
                    this.waveSystem.generateWave();
                }
            });
            
            gameControls.appendChild(autoWaveButton);
        }

        // Show necessary panels
        const leftPanel = document.getElementById('leftPanel');
        const rightPanel = document.getElementById('rightPanel');
        const gameCanvas = document.getElementById('gameCanvas');
        
        if (leftPanel) leftPanel.style.display = 'flex';
        if (rightPanel) rightPanel.style.display = 'flex';
        if (gameCanvas) gameCanvas.style.display = 'block';

        this.updateUI();
    }

    updateAutoWaveButton(button = document.getElementById('autoWaveButton')) {
        if (!button) return;
        
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path d="M8 5v14l11-7z" fill="currentColor"/>
                ${this.autoWaveEnabled ? '<path d="M0 0h24v24H0z" fill="none"/>' : '<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/>'}
            </svg>
            ${this.autoWaveEnabled ? 'Auto Wave: ON' : 'Auto Wave: OFF'}
        `;
        button.classList.toggle('active', this.autoWaveEnabled);
    }

    updateUI() {
        document.getElementById('money').textContent = this.money;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('score').textContent = this.score;
        document.getElementById('wave').textContent = this.waveSystem ? this.waveSystem.currentWave : 0;

        // Update tower button states
        const towerButtons = document.querySelectorAll('.tower-button');
        towerButtons.forEach(button => {
            const type = button.getAttribute('data-type');
            const TowerClass = TowerManager.types[type];
            button.disabled = this.money < TowerClass.cost;
            button.classList.toggle('selected', TowerManager.isPlacing && TowerManager.selectedType === TowerClass);
        });

        // Update wave button state
        const startWaveButton = document.getElementById('startWave');
        if (startWaveButton && this.waveSystem) {
            startWaveButton.disabled = this.waveSystem.isWaveActive;
            startWaveButton.textContent = this.waveSystem.isWaveActive ? 'Wave in Progress...' : 'Start Next Wave';
        }
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
        if (TowerManager.isPlacing && TowerManager.placementTower) {
            if (this.canPlaceTower(x, y)) {
                const NewTowerType = TowerManager.selectedType;
                const cost = TowerManager.costs[Object.keys(TowerManager.types).find(key => 
                    TowerManager.types[key] === NewTowerType
                )];
                const tower = new NewTowerType(x, y);
                // Apply shop upgrades to new tower
                this.shop.applyUpgrades(tower);
                this.towers.push(tower);
                this.money -= cost;
                this.updateUI();
                
                // Reset placement state
                TowerManager.isPlacing = false;
                TowerManager.placementTower = null;
                TowerManager.selectedType = null;
            }
        } else {
            // Hide upgrade UI first
            this.hideTowerUpgradeUI();
            
            // Select existing tower
            TowerManager.selectedTower = this.towers.find(tower => {
                const dx = tower.x - x;
                const dy = tower.y - y;
                return Math.sqrt(dx * dx + dy * dy) < tower.size;
            });

            if (TowerManager.selectedTower) {
                this.showTowerUpgradeUI(TowerManager.selectedTower);
            }
        }
    }

    handleMove(x, y) {
        if (TowerManager.isPlacing && TowerManager.placementTower) {
            TowerManager.placementTower.x = x;
            TowerManager.placementTower.y = y;
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
            const upgradeCost = tower.getUpgradeCost();
            const upgradeButton = document.getElementById('upgradeButton');
            const costSpan = upgradeUI.querySelector('.upgrade-cost span');
            
            // Position the upgrade UI above the tower using screen coordinates
            const canvasRect = this.canvas.getBoundingClientRect();
            const scale = {
                x: this.canvas.width / canvasRect.width,
                y: this.canvas.height / canvasRect.height
            };
            
            // Convert tower coordinates to screen coordinates
            const towerScreenX = canvasRect.left + (tower.x / scale.x);
            const towerScreenY = canvasRect.top + (tower.y / scale.y);
            
            console.log('Positioning upgrade UI:', {
                canvasRect,
                scale,
                towerX: tower.x,
                towerY: tower.y,
                screenX: towerScreenX,
                screenY: towerScreenY
            });
            
            upgradeUI.style.display = 'block';
            upgradeUI.style.left = `${towerScreenX}px`;
            upgradeUI.style.top = `${towerScreenY}px`; // The transform CSS will move it above the tower
            
            // Update cost display
            if (costSpan) {
                costSpan.textContent = upgradeCost === Infinity ? 'MAX' : upgradeCost;
            }
            
            // Update button state
            if (upgradeButton) {
                upgradeButton.disabled = this.money < upgradeCost || upgradeCost === Infinity;
                upgradeButton.textContent = upgradeCost === Infinity ? 'Max Level' : `Upgrade (${upgradeCost})`;
                
                // Remove old event listener if exists
                const newUpgradeButton = upgradeButton.cloneNode(true);
                upgradeButton.parentNode.replaceChild(newUpgradeButton, upgradeButton);
                
                // Add new event listener
                newUpgradeButton.onclick = () => {
                    if (this.money >= upgradeCost && tower.upgrade()) {
                        this.money -= upgradeCost;
                        this.updateUI();
                        this.showTowerUpgradeUI(tower); // Refresh upgrade UI
                        
                        // Update achievement stats
                        if (this.achievements?.stats) {
                            this.achievements.stats.towersUpgraded++;
                            this.achievements.checkRewards();
                        }
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
        TowerManager.selectedTower = null;
    }

    gameOver() {
        this.isPaused = true;
        this.autoWaveEnabled = false; // Disable auto wave on game over
        const autoWaveButton = document.getElementById('autoWaveButton');
        if (autoWaveButton) {
            this.updateAutoWaveButton(autoWaveButton);
        }
        
        // Update final achievements before game over
        if (this.achievements) {
            this.achievements.updateTimePlayed();
            this.achievements.checkRewards();
        }
        
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').style.display = 'flex';
    }

    restart() {
        // Hide game over screen
        document.getElementById('gameOver').style.display = 'none';
        // Show level select
        this.menu.showScreen('levelSelect');
        // Reset game state
        this.reset();
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
        if (TowerManager.isPlacing && TowerManager.placementTower) {
            const rect = this.canvas.getBoundingClientRect();
            const x = TowerManager.placementTower.x;
            const y = TowerManager.placementTower.y;
            
            // Draw placement radius
            this.ctx.beginPath();
            this.ctx.arc(x, y, TowerManager.placementTower.range, 0, Math.PI * 2);
            this.ctx.strokeStyle = this.canPlaceTower(x, y) ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 0, 0.2)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw tower preview
            TowerManager.placementTower.draw(this.ctx, this.canPlaceTower(x, y) ? 0.8 : 0.4);
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
window.addEventListener('load', async () => {
    console.log('Window loaded, initializing game...');
    const canvas = document.getElementById('gameCanvas');
    console.log('Found game canvas:', canvas);
    
    if (canvas) {
        console.log('Canvas dimensions:', {
            width: canvas.width,
            height: canvas.height,
            clientWidth: canvas.clientWidth,
            clientHeight: canvas.clientHeight
        });
        
        // Load assets first
        try {
            console.log('Loading assets...');
            await assetManager.loadAssets();
            console.log('Assets loaded successfully');
        } catch (error) {
            console.error('Failed to load assets:', error);
            // For now, continue with the game using fallback shapes
        }
        
        console.log('Creating new Game instance');
        const game = new Game(canvas);
        
        // Set up event listeners
        console.log('Setting up canvas event listeners');
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
        
        console.log('Game initialization complete');
    } else {
        console.error('Failed to find game canvas element!');
    }
}); 