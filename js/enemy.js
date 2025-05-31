class BaseEnemy {
    constructor(path) {
        this.path = path;
        this.currentPoint = 0;
        this.x = path.points[0].x;
        this.y = path.points[0].y;
        this.size = 20;
        this.isDead = false;
        this.reachedEnd = false;
        this.onDeath = () => {};
        this.onReachEnd = () => {};
        this.angle = 0;
    }

    update(deltaTime) {
        if (this.isDead) return;

        const targetPoint = this.path.points[this.currentPoint + 1];
        if (!targetPoint) {
            this.isDead = true;
            this.reachedEnd = true;
            this.onReachEnd();
            return;
        }

        const dx = targetPoint.x - this.x;
        const dy = targetPoint.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.angle = Math.atan2(dy, dx);

        if (distance < this.speed) {
            this.currentPoint++;
            if (this.currentPoint >= this.path.points.length - 1) {
                this.isDead = true;
                this.reachedEnd = true;
                this.onReachEnd();
                return;
            }
        } else {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }

        // Update any special effects
        this.updateEffects(deltaTime);
    }

    updateEffects(deltaTime) {
        // Override in subclasses
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health <= 0) {
            this.isDead = true;
            this.onDeath();
        }
    }

    drawHealthBar(ctx) {
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

class BasicEnemy extends BaseEnemy {
    constructor(path) {
        super(path);
        this.speed = 1.5;
        this.health = 50;
        this.maxHealth = 50;
        this.value = 10; // Score/money value
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw body
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.moveTo(-this.size/2, -this.size/3);
        ctx.lineTo(this.size/2, 0);
        ctx.lineTo(-this.size/2, this.size/3);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

class SpeedEnemy extends BaseEnemy {
    constructor(path) {
        super(path);
        this.speed = 3;
        this.health = 30;
        this.maxHealth = 30;
        this.value = 15;
        this.trailPoints = [];
    }

    updateEffects(deltaTime) {
        // Update trail
        this.trailPoints.unshift({ x: this.x, y: this.y, alpha: 1 });
        if (this.trailPoints.length > 5) {
            this.trailPoints.pop();
        }
        this.trailPoints.forEach(point => point.alpha *= 0.8);
    }

    draw(ctx) {
        if (this.isDead) return;

        // Draw trail
        this.trailPoints.forEach(point => {
            ctx.fillStyle = `rgba(255, 255, 0, ${point.alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.size/3, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw streamlined body
        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.moveTo(-this.size/2, 0);
        ctx.lineTo(0, -this.size/4);
        ctx.lineTo(this.size/2, 0);
        ctx.lineTo(0, this.size/4);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

class ArmoredEnemy extends BaseEnemy {
    constructor(path) {
        super(path);
        this.speed = 0.7;
        this.health = 150;
        this.maxHealth = 150;
        this.value = 25;
        this.armor = 0.5; // Damage reduction
    }

    takeDamage(damage) {
        super.takeDamage(damage * (1 - this.armor));
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw armored body
        ctx.fillStyle = '#888888';
        ctx.beginPath();
        ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
        ctx.fill();

        // Draw armor plates
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 4;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(0, 0, this.size/2 - i * 5, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

class LayeredEnemy extends BaseEnemy {
    constructor(path) {
        super(path);
        this.speed = 1;
        this.maxLayers = 3;
        this.currentLayer = this.maxLayers;
        this.healthPerLayer = 40;
        this.health = this.healthPerLayer * this.maxLayers;
        this.maxHealth = this.health;
        this.value = 30;
    }

    takeDamage(damage) {
        super.takeDamage(damage);
        this.currentLayer = Math.ceil(this.health / this.healthPerLayer);
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw layered body
        const colors = ['#FF0000', '#00FF00', '#0000FF'];
        for (let i = 0; i < this.currentLayer; i++) {
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            ctx.arc(0, 0, this.size/2 - i * 5, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

class BossEnemy extends BaseEnemy {
    constructor(path) {
        super(path);
        this.speed = 0.5;
        this.size = 40;
        this.health = 500;
        this.maxHealth = 500;
        this.value = 100;
        this.rotationAngle = 0;
    }

    updateEffects(deltaTime) {
        this.rotationAngle += 0.02;
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // Draw main body
        ctx.fillStyle = '#800080';
        ctx.beginPath();
        ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
        ctx.fill();

        // Draw rotating spikes
        ctx.rotate(this.rotationAngle);
        const spikeCount = 8;
        for (let i = 0; i < spikeCount; i++) {
            const angle = (i / spikeCount) * Math.PI * 2;
            ctx.save();
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(this.size/2, 0);
            ctx.lineTo(this.size/2 + 15, -10);
            ctx.lineTo(this.size/2 + 15, 10);
            ctx.closePath();
            ctx.fillStyle = '#FF00FF';
            ctx.fill();
            ctx.restore();
        }

        // Draw core
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, this.size/4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        this.drawHealthBar(ctx);
    }
}

// Enemy type registry
const EnemyTypes = {
    Basic: BasicEnemy,
    Speed: SpeedEnemy,
    Armored: ArmoredEnemy,
    Layered: LayeredEnemy,
    Boss: BossEnemy
}; 