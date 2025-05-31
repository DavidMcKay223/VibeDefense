class Enemy {
    constructor(path) {
        this.path = path;
        this.currentPoint = 0;
        this.x = path.points[0].x;
        this.y = path.points[0].y;
        this.speed = 1.5; // Increased base speed
        this.size = 20;
        this.health = 50; // Reduced from 100
        this.maxHealth = 50; // Reduced from 100
        this.isDead = false;
        this.reachedEnd = false;
        
        // Callbacks
        this.onDeath = () => {};
        this.onReachEnd = () => {};
    }

    update(deltaTime) {
        if (this.isDead) return;

        // Get current target point
        const targetPoint = this.path.points[this.currentPoint + 1];
        if (!targetPoint) {
            // Reached the end
            this.isDead = true;
            this.reachedEnd = true;
            this.onReachEnd();
            return;
        }

        // Calculate direction to next point
        const dx = targetPoint.x - this.x;
        const dy = targetPoint.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            // Reached the current target point, move to next
            this.currentPoint++;
            if (this.currentPoint >= this.path.points.length - 1) {
                this.isDead = true;
                this.reachedEnd = true;
                this.onReachEnd();
                return;
            }
        } else {
            // Move towards target point
            const moveX = (dx / distance) * this.speed;
            const moveY = (dy / distance) * this.speed;
            this.x += moveX;
            this.y += moveY;
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isDead = true;
            this.onDeath();
        }
    }

    draw(ctx) {
        if (this.isDead) return;

        // Draw enemy body
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw health bar
        const healthBarWidth = 30;
        const healthBarHeight = 4;
        const healthPercentage = this.health / this.maxHealth;
        
        // Health bar background
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(
            this.x - healthBarWidth / 2,
            this.y - this.size / 2 - 10,
            healthBarWidth,
            healthBarHeight
        );
        
        // Current health
        ctx.fillStyle = '#00FF00';
        ctx.fillRect(
            this.x - healthBarWidth / 2,
            this.y - this.size / 2 - 10,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );
    }
} 