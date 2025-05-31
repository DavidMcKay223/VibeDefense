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
        this.level = 1;
        this.maxLevel = 3;
        this.shotCount = 0;
        this.specialShotInterval = 5; // Every 5th shot is special when maxed
    }

    getUpgradeCost() {
        return this.level < this.maxLevel ? this.constructor.cost * 0.75 : Infinity;
    }

    upgrade() {
        if (this.level < this.maxLevel) {
            this.level++;
            // Base stat improvements
            this.damage *= 1.5;
            this.range *= 1.2;
            this.fireRate *= 0.8;
            return true;
        }
        return false;
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
        this.shotCount++;
        const isSpecialShot = this.level === this.maxLevel && this.shotCount % this.specialShotInterval === 0;
        
        this.projectiles.push(new Projectile(
            this.x,
            this.y,
            this.target,
            this.damage,
            this.projectileColor,
            isSpecialShot,
            this.specialAbility.bind(this)
        ));
    }

    specialAbility(x, y) {
        // Override in subclasses
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

        // Draw level indicator
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < this.level; i++) {
            ctx.beginPath();
            ctx.arc(
                this.x - this.size / 4 + (i * this.size / 4),
                this.y + this.size / 2 + 5,
                3,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // Draw tower symbol
        this.drawSymbol(ctx);

        // Draw range circle
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

        // Draw targeting line
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
    static cost = 100;
    
    constructor(x, y) {
        super(x, y);
        this.color = '#4A90E2';
        this.projectileColor = '#FFA500';
        this.damage = 15;
        this.fireRate = 800;
        this.range = 120;
    }

    specialAbility(x, y) {
        // Create a small explosion
        return new Explosion(x, y, 30, this.damage * 0.5);
    }

    drawSymbol(ctx) {
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
        ctx.fill();
    }
}

class SniperTower extends BaseTower {
    static cost = 200;
    
    constructor(x, y) {
        super(x, y);
        this.color = '#800080';
        this.projectileColor = '#FF00FF';
        this.damage = 40;
        this.fireRate = 1500;
        this.range = 250;
    }

    specialAbility(x, y) {
        // Pierce through enemies
        return new PiercingShot(x, y, this.target.x - x, this.target.y - y, this.damage);
    }

    drawSymbol(ctx) {
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
    static cost = 150;
    
    constructor(x, y) {
        super(x, y);
        this.color = '#32CD32';
        this.projectileColor = '#90EE90';
        this.damage = 8;
        this.fireRate = 250;
        this.range = 100;
    }

    specialAbility(x, y) {
        // Multi-shot
        return new MultiShot(x, y, this.damage * 0.5, 3);
    }

    drawSymbol(ctx) {
        ctx.fillStyle = '#FFF';
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(this.x + (i * 6 - 6), this.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

class Projectile {
    constructor(x, y, target, damage, color = '#FFA500', isSpecial = false, specialAbility = null) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = 5;
        this.size = isSpecial ? 7 : 5;
        this.isDead = false;
        this.color = isSpecial ? '#FFD700' : color;
        this.isSpecial = isSpecial;
        this.specialAbility = specialAbility;
    }

    update(deltaTime) {
        if (this.isDead) return;

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed || this.target.isDead) {
            if (!this.target.isDead) {
                this.target.takeDamage(this.damage);
                if (this.isSpecial && this.specialAbility) {
                    const effect = this.specialAbility(this.x, this.y);
                    if (effect) {
                        return effect;
                    }
                }
            }
            this.isDead = true;
            return null;
        }

        this.x += (dx / distance) * this.speed;
        this.y += (dy / distance) * this.speed;
        return null;
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        if (this.isSpecial) {
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}

class Explosion {
    constructor(x, y, radius, damage) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.damage = damage;
        this.currentRadius = 0;
        this.growthRate = 2;
        this.isDead = false;
    }

    update(deltaTime) {
        if (this.isDead) return null;

        this.currentRadius += this.growthRate;
        if (this.currentRadius >= this.radius) {
            this.isDead = true;
        }
        return null;
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 165, 0, 0.3)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 165, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

class PiercingShot {
    constructor(x, y, dx, dy, damage) {
        this.x = x;
        this.y = y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.dx = (dx / dist) * 10;
        this.dy = (dy / dist) * 10;
        this.damage = damage;
        this.length = 40;
        this.isDead = false;
        this.lifetime = 20;
    }

    update(deltaTime) {
        if (this.isDead) return null;

        this.x += this.dx;
        this.y += this.dy;
        this.lifetime--;

        if (this.lifetime <= 0) {
            this.isDead = true;
        }
        return null;
    }

    draw(ctx) {
        if (this.isDead) return;

        ctx.beginPath();
        ctx.moveTo(this.x - this.dx * this.length/2, this.y - this.dy * this.length/2);
        ctx.lineTo(this.x + this.dx * this.length/2, this.y + this.dy * this.length/2);
        ctx.strokeStyle = '#FF00FF';
        ctx.lineWidth = 4;
        ctx.stroke();
    }
}

class MultiShot {
    constructor(x, y, damage, count) {
        this.x = x;
        this.y = y;
        this.damage = damage;
        this.count = count;
        this.particles = [];
        this.isDead = false;
        this.init();
    }

    init() {
        for (let i = 0; i < this.count; i++) {
            const angle = (i / this.count) * Math.PI * 2;
            this.particles.push({
                x: this.x,
                y: this.y,
                dx: Math.cos(angle) * 5,
                dy: Math.sin(angle) * 5,
                life: 20
            });
        }
    }

    update(deltaTime) {
        if (this.isDead) return null;

        let allDead = true;
        this.particles.forEach(particle => {
            if (particle.life > 0) {
                particle.x += particle.dx;
                particle.y += particle.dy;
                particle.life--;
                allDead = false;
            }
        });

        if (allDead) {
            this.isDead = true;
        }
        return null;
    }

    draw(ctx) {
        if (this.isDead) return;

        this.particles.forEach(particle => {
            if (particle.life > 0) {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#90EE90';
                ctx.fill();
            }
        });
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