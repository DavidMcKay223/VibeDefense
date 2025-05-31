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
        this.rotation = 0;
        this.type = 'basic'; // Add type property
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

        // Update rotation to face movement direction
        this.rotation = Math.atan2(dy, dx);

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

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Try to use image first
        const img = assetManager.getImage(`${this.type}Enemy`);
        if (img) {
            ctx.drawImage(img, 
                -this.size, 
                -this.size, 
                this.size * 2, 
                this.size * 2
            );
        } else {
            // Fallback to shape drawing
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

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

class SpeedEnemy extends Enemy {
    constructor(x, y, path, health, speed) {
        super(x, y, path, health, speed);
        this.color = '#2ecc71';
        this.size = 15;
        this.value = 15;
        this.trail = [];
        this.maxTrailLength = 5;
        this.type = 'speed';
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
        // Draw trail first
        ctx.globalAlpha = 0.3;
        this.trail.forEach((pos, index) => {
            const alpha = index / this.trail.length;
            ctx.save();
            ctx.translate(pos.x, pos.y);
            ctx.rotate(this.rotation);
            
            const img = assetManager.getImage(this.type + 'Enemy');
            if (img) {
                ctx.globalAlpha = alpha * 0.3;
                ctx.drawImage(img, 
                    -this.size, 
                    -this.size, 
                    this.size * 2, 
                    this.size * 2
                );
            } else {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(0, 0, this.size * alpha, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
        ctx.globalAlpha = 1;
        
        // Draw main enemy
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
        this.type = 'armored';
    }

    takeDamage(amount) {
        super.takeDamage(amount / this.armor);
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
        this.type = 'layered';
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.currentLayer = Math.ceil((this.health / this.maxHealth) * this.layers);
    }

    draw(ctx) {
        if (!this.isAlive) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const img = assetManager.getImage(this.type + 'Enemy');
        if (img) {
            // Draw each layer with decreasing opacity
            for (let i = 0; i < this.currentLayer; i++) {
                ctx.globalAlpha = 0.3 + (0.7 * (i / this.layers));
                ctx.drawImage(img, 
                    -this.size + (i * 2), 
                    -this.size + (i * 2), 
                    this.size * 2 - (i * 4), 
                    this.size * 2 - (i * 4)
                );
            }
        } else {
            // Fallback layered drawing
            for (let i = 0; i < this.currentLayer; i++) {
                ctx.fillStyle = this.color;
                ctx.globalAlpha = 0.3 + (0.7 * (i / this.layers));
                ctx.beginPath();
                ctx.arc(0, 0, this.size - (i * 4), 0, Math.PI * 2);
                ctx.fill();
            }
        }
        ctx.restore();
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
        this.type = 'boss';
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.rotation += 0.02;
    }

    draw(ctx) {
        if (!this.isAlive) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const img = assetManager.getImage(this.type + 'Enemy');
        if (img) {
            ctx.drawImage(img, 
                -this.size * 1.5, 
                -this.size * 1.5, 
                this.size * 3, 
                this.size * 3
            );
        } else {
            // Fallback shape drawing
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw spikes
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
        }
        ctx.restore();

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

// Enemy type registry
const EnemyTypes = {
    Speed: SpeedEnemy,
    Armored: ArmoredEnemy,
    Layered: LayeredEnemy,
    Boss: BossEnemy
};

// Export enemy classes
window.Enemy = Enemy;
window.SpeedEnemy = SpeedEnemy;
window.ArmoredEnemy = ArmoredEnemy;
window.LayeredEnemy = LayeredEnemy;
window.BossEnemy = BossEnemy;
window.EnemyTypes = EnemyTypes; 