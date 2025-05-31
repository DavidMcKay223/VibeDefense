class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.range = 100;
        this.color = '#4A90E2';
        this.damage = 10;
        this.fireRate = 1000; // milliseconds between shots
        this.lastShot = 0;
        this.target = null;
        this.projectiles = [];
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

        this.projectiles.push(new Projectile(
            this.x,
            this.y,
            this.target,
            this.damage
        ));
        this.lastShot = Date.now();
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

    // Static properties for tower placement
    static isPlacing = false;
    static selectedTower = null;
    static placementTower = null;
}

class Projectile {
    constructor(x, y, target, damage) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = 5;
        this.size = 5;
        this.isDead = false;
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

        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
} 