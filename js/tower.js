class BaseTower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.range = 100;
        this.damage = 10;
        this.fireRate = 1000;
        this.lastShot = 0;
        this.target = null;
        this.projectiles = [];
        this.cost = 100;
    }

    update(deltaTime, enemies) {
        // Update projectiles
        this.projectiles = this.projectiles.filter(proj => !proj.isDead);
        this.projectiles.forEach(proj => proj.update(deltaTime));

        // Find target if we don't have one or current target is dead
        if (!this.target || this.target.isDead) {
            this.findTarget(enemies);
        }

        // Check if target is still in range
        if (this.target && !this.isInRange(this.target)) {
            this.target = null;
        }

        // Shoot if we have a target and enough time has passed
        if (this.target && Date.now() - this.lastShot >= this.fireRate) {
            this.shoot();
        }
    }

    findTarget(enemies) {
        this.target = enemies.find(enemy => 
            !enemy.isDead && this.isInRange(enemy)
        );
    }

    isInRange(enemy) {
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= this.range;
    }

    shoot() {
        if (!this.target) return;
        this.createProjectile();
        this.lastShot = Date.now();
    }

    createProjectile() {
        this.projectiles.push(new Projectile(
            this.x,
            this.y,
            this.target,
            this.damage,
            this.projectileColor
        ));
    }

    draw(ctx) {
        // Draw tower base
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );

        // Draw tower symbol
        this.drawSymbol(ctx);

        // Draw range circle (only when selected or placing)
        if (Tower.isPlacing || this === Tower.selectedTower) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(74, 144, 226, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.fillStyle = 'rgba(74, 144, 226, 0.1)';
            ctx.fill();
        }

        // Draw projectiles
        this.projectiles.forEach(proj => proj.draw(ctx));

        // Draw targeting line if we have a target
        if (this.target && !this.target.isDead) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.target.x, this.target.y);
            ctx.strokeStyle = 'rgba(74, 144, 226, 0.5)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    drawSymbol(ctx) {
        // Override in subclasses
    }
}

class BasicTower extends BaseTower {
    constructor(x, y) {
        super(x, y);
        this.color = '#4A90E2';
        this.projectileColor = '#FFA500';
        this.damage = 10;
        this.fireRate = 1000;
        this.range = 100;
        this.cost = 100;
    }

    drawSymbol(ctx) {
        // Draw a simple dot in the center
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class SniperTower extends BaseTower {
    constructor(x, y) {
        super(x, y);
        this.color = '#800080';
        this.projectileColor = '#FF00FF';
        this.damage = 50;
        this.fireRate = 2000;
        this.range = 200;
        this.cost = 200;
    }

    drawSymbol(ctx) {
        // Draw crosshair symbol
        ctx.strokeStyle = '#FFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - 8, this.y);
        ctx.lineTo(this.x + 8, this.y);
        ctx.moveTo(this.x, this.y - 8);
        ctx.lineTo(this.x, this.y + 8);
        ctx.stroke();
    }
}

class RapidTower extends BaseTower {
    constructor(x, y) {
        super(x, y);
        this.color = '#32CD32';
        this.projectileColor = '#90EE90';
        this.damage = 5;
        this.fireRate = 300;
        this.range = 80;
        this.cost = 150;
    }

    drawSymbol(ctx) {
        // Draw multiple small dots
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(this.x + (i * 6 - 6), this.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Projectile {
    constructor(x, y, target, damage, color = '#FFA500') {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = 5;
        this.size = 5;
        this.isDead = false;
        this.color = color;
    }

    update(deltaTime) {
        if (this.isDead) return;

        // Move towards target
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed || this.target.isDead) {
            // Hit target or target died
            if (!this.target.isDead) {
                this.target.takeDamage(this.damage);
            }
            this.isDead = true;
            return;
        }

        // Move projectile
        this.x += (dx / distance) * this.speed;
        this.y += (dy / distance) * this.speed;
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Static properties for tower placement
const Tower = {
    isPlacing: false,
    selectedTower: null,
    placementTower: null,
    selectedType: BasicTower,
    types: {
        'Basic': BasicTower,
        'Sniper': SniperTower,
        'Rapid': RapidTower
    }
}; 