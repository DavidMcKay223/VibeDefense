class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.lastTime = 0;
        this.entities = [];
        
        // Game state
        this.isRunning = true;
        
        // Bind the gameLoop to maintain context
        this.gameLoop = this.gameLoop.bind(this);
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

        // Draw all entities
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