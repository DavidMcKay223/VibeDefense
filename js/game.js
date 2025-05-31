class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;
        this.entities = [];
        this.towers = [];
        this.enemies = [];
        
        // Game state
        this.isRunning = true;
        this.lastEnemySpawn = 0;
        this.spawnInterval = 2000;
        this.lives = 20;
        this.score = 0;
        this.money = 300;
        
        // Create path
        this.path = new Path(this.canvas);
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        
        // Add event listeners
        this.canvas.addEventListener('click', this.handleClick);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        
        // Create UI
        this.createUI();
        this.selectedTower = null;
        this.specialEffects = [];
    }

    createUI() {
        // Create container for tower buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.position = 'absolute';
        buttonContainer.style.top = '20px';
        buttonContainer.style.left = '20px';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        document.body.appendChild(buttonContainer);

        // Create buttons for each tower type
        Object.entries(Tower.types).forEach(([name, TowerClass]) => {
            const button = document.createElement('button');
            button.textContent = `${name} Tower ($${TowerClass.cost})`;
            button.style.padding = '10px';
            button.style.cursor = 'pointer';
            
            button.addEventListener('click', () => {
                if (this.money >= TowerClass.cost) {
                    Tower.isPlacing = !Tower.isPlacing;
                    Tower.selectedType = TowerClass;
                    Tower.placementTower = Tower.isPlacing ? new TowerClass(0, 0) : null;
                    this.selectedTower = null;
                    
                    // Update all buttons
                    buttonContainer.querySelectorAll('button').forEach(btn => {
                        const btnType = btn.getAttribute('data-type');
                        btn.textContent = btn === button && Tower.isPlacing
                            ? 'Cancel'
                            : `${btnType} Tower ($${Tower.types[btnType].cost})`;
                    });
                }
            });
            
            button.setAttribute('data-type', name);
            buttonContainer.appendChild(button);
        });

        // Create upgrade button
        const upgradeButton = document.createElement('button');
        upgradeButton.textContent = 'Upgrade Tower';
        upgradeButton.style.padding = '10px';
        upgradeButton.style.cursor = 'pointer';
        upgradeButton.style.display = 'none';
        
        upgradeButton.addEventListener('click', () => {
            if (this.selectedTower) {
                const upgradeCost = this.selectedTower.getUpgradeCost();
                if (this.money >= upgradeCost) {
                    if (this.selectedTower.upgrade()) {
                        this.money -= upgradeCost;
                        this.updateStats();
                        this.updateUpgradeButton();
                    }
                }
            }
        });
        
        buttonContainer.appendChild(upgradeButton);
        this.upgradeButton = upgradeButton;

        // Create stats container
        const statsContainer = document.createElement('div');
        statsContainer.style.position = 'absolute';
        statsContainer.style.top = '20px';
        statsContainer.style.right = '20px';
        statsContainer.style.padding = '10px';
        statsContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        statsContainer.style.color = 'white';
        statsContainer.style.borderRadius = '5px';
        statsContainer.style.fontFamily = 'Arial, sans-serif';
        document.body.appendChild(statsContainer);
        this.statsContainer = statsContainer;

        this.updateStats();
    }

    updateStats() {
        this.statsContainer.innerHTML = `
            Lives: ${this.lives} | 
            Score: ${this.score} | 
            Money: $${this.money}
        `;
    }

    spawnEnemy() {
        const enemy = new Enemy(this.path);
        enemy.onDeath = () => {
            if (!enemy.reachedEnd) {
                this.score += 10;
                this.money += 25;
                this.updateStats();
            }
        };
        enemy.onReachEnd = () => {
            this.lives--;
            this.updateStats();
            if (this.lives <= 0) {
                this.gameOver();
            }
        };
        this.enemies.push(enemy);
    }

    gameOver() {
        this.isRunning = false;
        
        // Create game over screen
        const gameOverDiv = document.createElement('div');
        gameOverDiv.style.position = 'absolute';
        gameOverDiv.style.top = '50%';
        gameOverDiv.style.left = '50%';
        gameOverDiv.style.transform = 'translate(-50%, -50%)';
        gameOverDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameOverDiv.style.color = 'white';
        gameOverDiv.style.padding = '20px';
        gameOverDiv.style.borderRadius = '10px';
        gameOverDiv.style.textAlign = 'center';
        gameOverDiv.innerHTML = `
            <h2>Game Over!</h2>
            <p>Final Score: ${this.score}</p>
            <button onclick="location.reload()">Play Again</button>
        `;
        document.body.appendChild(gameOverDiv);
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        if (Tower.isPlacing) {
            // Place new tower
            if (!this.path.isPointNearPath(x, y)) {
                const TowerClass = Tower.selectedType;
                if (this.money >= TowerClass.cost) {
                    const tower = new TowerClass(x, y);
                    this.towers.push(tower);
                    this.money -= TowerClass.cost;
                    this.updateStats();
                }
            }
            
            // Reset placement mode
            Tower.isPlacing = false;
            Tower.placementTower = null;
            
            // Update all buttons
            document.querySelectorAll('button[data-type]').forEach(button => {
                const type = button.getAttribute('data-type');
                button.textContent = `${type} Tower ($${Tower.types[type].cost})`;
            });
        } else {
            // Select tower for upgrade
            this.selectedTower = null;
            for (const tower of this.towers) {
                const dx = tower.x - x;
                const dy = tower.y - y;
                if (dx * dx + dy * dy < tower.size * tower.size) {
                    this.selectedTower = tower;
                    Tower.selectedTower = tower;
                    break;
                }
            }
            this.updateUpgradeButton();
        }
    }

    handleMouseMove(event) {
        if (Tower.isPlacing && Tower.placementTower) {
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            Tower.placementTower.x = x;
            Tower.placementTower.y = y;
        }
    }

    start() {
        requestAnimationFrame(this.gameLoop);
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Spawn enemies
        if (timestamp - this.lastEnemySpawn >= this.spawnInterval) {
            this.spawnEnemy();
            this.lastEnemySpawn = timestamp;
        }

        this.update(deltaTime);
        this.draw();

        if (this.isRunning) {
            requestAnimationFrame(this.gameLoop);
        }
    }

    update(deltaTime) {
        // Update enemies
        this.enemies = this.enemies.filter(enemy => !enemy.isDead);
        this.enemies.forEach(enemy => enemy.update(deltaTime));

        // Update towers and collect special effects
        this.towers.forEach(tower => {
            const effects = tower.update(deltaTime, this.enemies);
            if (Array.isArray(effects)) {
                this.specialEffects.push(...effects.filter(effect => effect !== null));
            }
        });

        // Update special effects
        this.specialEffects = this.specialEffects.filter(effect => !effect.isDead);
        this.specialEffects.forEach(effect => effect.update(deltaTime));

        // Update other entities
        this.entities.forEach(entity => {
            if (entity.update) {
                entity.update(deltaTime);
            }
        });
    }

    draw() {
        // Draw background
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw path
        this.path.draw(this.ctx);

        // Draw enemies
        this.enemies.forEach(enemy => enemy.draw(this.ctx));

        // Draw towers
        this.towers.forEach(tower => tower.draw(this.ctx));

        // Draw special effects
        this.specialEffects.forEach(effect => effect.draw(this.ctx));

        // Draw placement tower if in placement mode
        if (Tower.isPlacing && Tower.placementTower) {
            Tower.placementTower.draw(this.ctx);
        }

        // Draw other entities
        this.entities.forEach(entity => {
            if (entity.draw) {
                entity.draw(this.ctx);
            }
        });
    }

    updateUpgradeButton() {
        if (this.selectedTower) {
            const upgradeCost = this.selectedTower.getUpgradeCost();
            this.upgradeButton.style.display = 'block';
            if (upgradeCost === Infinity) {
                this.upgradeButton.textContent = 'Max Level';
                this.upgradeButton.disabled = true;
            } else {
                this.upgradeButton.textContent = `Upgrade ($${upgradeCost})`;
                this.upgradeButton.disabled = this.money < upgradeCost;
            }
        } else {
            this.upgradeButton.style.display = 'none';
        }
    }
}

// Start the game when the window loads
window.addEventListener('load', () => {
    const game = new Game();
    game.start();
}); 