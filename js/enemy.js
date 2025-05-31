class Enemy {
    constructor(x, y, path, health, speed) {
        this.x = x;
        this.y = y;
        this.path = path;
        this.health = health;
        this.maxHealth = health;
        this.speed = speed;
        this.currentPathIndex = 0;
        this.reachedEnd = false;
        this.value = 10; // Base value for killing this enemy
        this.size = 20;
        this.color = '#e74c3c';
        this.isAlive = true;
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.isAlive = false;
        }
    }

    update(deltaTime) {
        if (this.reachedEnd || !this.isAlive) return;

        // Move along path
        const targetPoint = this.path.points[this.currentPathIndex];
        const dx = targetPoint.x - this.x;
        const dy = targetPoint.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            // Reached current target point
            this.x = targetPoint.x;
            this.y = targetPoint.y;
            this.currentPathIndex++;

            if (this.currentPathIndex >= this.path.points.length) {
                this.reachedEnd = true;
                return;
            }
        } else {
            // Move towards target point
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }
    }

    draw(ctx) {
        if (!this.isAlive) return;

        // Draw enemy body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw health bar
        const healthBarWidth = this.size * 2;
        const healthBarHeight = 4;
        const healthPercentage = this.health / this.maxHealth;
        
        // Health bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(
            this.x - healthBarWidth/2,
            this.y - this.size - 10,
            healthBarWidth,
            healthBarHeight
        );
        
        // Health bar fill
        ctx.fillStyle = healthPercentage > 0.5 ? '#2ecc71' : healthPercentage > 0.2 ? '#f1c40f' : '#e74c3c';
        ctx.fillRect(
            this.x - healthBarWidth/2,
            this.y - this.size - 10,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );
    }
}

class SpeedEnemy extends Enemy {
    constructor(x, y, path, health, speed) {
        super(x, y, path, health, speed);
        this.color = '#2ecc71';
        this.size = 15;
        this.value = 15;
        this.trail = [];
        this.maxTrailLength = 5;
    }

    update(deltaTime) {
        // Add current position to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        super.update(deltaTime);
    }

    draw(ctx) {
        // Draw trail
        ctx.globalAlpha = 0.3;
        this.trail.forEach((pos, index) => {
            const alpha = index / this.trail.length;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.size * alpha, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        super.draw(ctx);
    }
}

class ArmoredEnemy extends Enemy {
    constructor(x, y, path, health, speed) {
        super(x, y, path, health, speed);
        this.color = '#7f8c8d';
        this.size = 25;
        this.value = 20;
        this.armor = 2; // Takes half damage
    }

    draw(ctx) {
        super.draw(ctx);
        
        // Draw armor plates
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(
                this.x,
                this.y,
                this.size - 5 + i * 5,
                (i * Math.PI / 1.5),
                ((i + 1) * Math.PI / 1.5)
            );
            ctx.stroke();
        }
    }
}

class LayeredEnemy extends Enemy {
    constructor(x, y, path, health, speed) {
        super(x, y, path, health, speed);
        this.color = '#9b59b6';
        this.size = 22;
        this.value = 25;
        this.layers = 3;
        this.currentLayer = this.layers;
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Update layer based on health percentage
        this.currentLayer = Math.ceil((this.health / this.maxHealth) * this.layers);
    }

    draw(ctx) {
        // Draw layers
        for (let i = 0; i < this.currentLayer; i++) {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = 0.3 + (0.7 * (i / this.layers));
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size - (i * 4), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // Draw health bar
        const healthBarWidth = this.size * 2;
        const healthBarHeight = 4;
        const healthPercentage = this.health / this.maxHealth;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(
            this.x - healthBarWidth/2,
            this.y - this.size - 10,
            healthBarWidth,
            healthBarHeight
        );
        
        ctx.fillStyle = healthPercentage > 0.5 ? '#2ecc71' : healthPercentage > 0.2 ? '#f1c40f' : '#e74c3c';
        ctx.fillRect(
            this.x - healthBarWidth/2,
            this.y - this.size - 10,
            healthBarWidth * healthPercentage,
            healthBarHeight
        );
    }
}

class BossEnemy extends Enemy {
    constructor(x, y, path, health, speed) {
        super(x, y, path, health, speed);
        this.color = '#e67e22';
        this.size = 35;
        this.value = 100;
        this.rotation = 0;
        this.spikes = 8;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.rotation += 0.02;
    }

    draw(ctx) {
        // Draw base
        super.draw(ctx);
        
        // Draw rotating spikes
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.strokeStyle = '#d35400';
        ctx.lineWidth = 3;
        
        for (let i = 0; i < this.spikes; i++) {
            const angle = (i / this.spikes) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(angle) * (this.size + 15),
                Math.sin(angle) * (this.size + 15)
            );
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

// Enemy type registry
const EnemyTypes = {
    Speed: SpeedEnemy,
    Armored: ArmoredEnemy,
    Layered: LayeredEnemy,
    Boss: BossEnemy
}; 