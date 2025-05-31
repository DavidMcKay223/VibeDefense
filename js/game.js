class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;
        this.entities = [];
        this.towers = [];
        
        // Game state
        this.isRunning = true;
        
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
        // Start the game loop
        requestAnimationFrame(this.gameLoop);
    }

    gameLoop(timestamp) {
        // Calculate delta time
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update game state
        this.update(deltaTime);

        // Draw everything
        this.draw();

        // Continue the game loop
        if (this.isRunning) {
            requestAnimationFrame(this.gameLoop);
        }
    }

    update(deltaTime) {
        // Update all entities
        for (const entity of this.entities) {
            if (entity.update) {
                entity.update(deltaTime);
            }
        }
    }

    draw() {
        // Draw background
        this.ctx.fillStyle = '#90EE90'; // Light green background
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw path
        this.path.draw(this.ctx);

        // Draw towers
        for (const tower of this.towers) {
            tower.draw(this.ctx);
        }

        // Draw placement tower if in placement mode
        if (Tower.isPlacing && Tower.placementTower) {
            Tower.placementTower.draw(this.ctx);
        }

        // Draw entities
        for (const entity of this.entities) {
            if (entity.draw) {
                entity.draw(this.ctx);
            }
        }
    }
}

// Start the game when the window loads
window.addEventListener('load', () => {
    const game = new Game();
    game.start();
}); 