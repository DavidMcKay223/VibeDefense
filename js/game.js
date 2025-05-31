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
        this.spawnInterval = 2000; // Spawn enemy every 2 seconds
        
        // Create path
        this.path = new Path(this.canvas);
        
        // Bind methods
        this.gameLoop = this.gameLoop.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        
        // Add event listeners
        this.canvas.addEventListener('click', this.handleClick);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        
        // Add tower placement button
        this.createTowerButton();
    }

    createTowerButton() {
        const button = document.createElement('button');
        button.textContent = 'Place Tower';
        button.style.position = 'absolute';
        button.style.top = '20px';
        button.style.left = '20px';
        button.style.padding = '10px';
        button.style.cursor = 'pointer';
        
        button.addEventListener('click', () => {
            Tower.isPlacing = !Tower.isPlacing;
            button.textContent = Tower.isPlacing ? 'Cancel' : 'Place Tower';
            Tower.placementTower = Tower.isPlacing ? new Tower(0, 0) : null;
        });
        
        document.body.appendChild(button);
    }

    spawnEnemy() {
        const enemy = new Enemy(this.path);
        this.enemies.push(enemy);
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

    handleClick(event) {
        if (!Tower.isPlacing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if the placement is valid (not too close to path)
        if (!this.path.isPointNearPath(x, y)) {
            this.towers.push(new Tower(x, y));
        }
        
        // Reset placement mode
        Tower.isPlacing = false;
        Tower.placementTower = null;
        const button = document.querySelector('button');
        if (button) button.textContent = 'Place Tower';
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

        // Update towers
        this.towers.forEach(tower => tower.update(deltaTime, this.enemies));

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
}

// Start the game when the window loads
window.addEventListener('load', () => {
    const game = new Game();
    game.start();
}); 