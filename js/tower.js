// Static properties for tower management
const TowerManager = {
    isPlacing: false,
    selectedTower: null,
    placementTower: null,
    selectedType: null,
    types: {}
};

class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.range = 100;
        this.damage = 10;
        this.attackSpeed = 1000; // milliseconds between attacks
        this.lastAttackTime = 0;
        this.targetEnemy = null;
        this.upgrades = [];
        this.level = 1;
        this.projectiles = [];
        this.maxLevel = 3;
        this.shotCount = 0;
        this.specialShotInterval = 5; // Every 5th shot is special when maxed
        this.baseStats = {
            damage: this.damage,
            range: this.range,
            attackSpeed: this.attackSpeed
        };
    }

    update(deltaTime, enemies) {
        // Reset stats to base values before applying upgrades
        this.damage = this.baseStats.damage * this.level;
        this.range = this.baseStats.range;
        this.attackSpeed = this.baseStats.attackSpeed;

        // Update projectiles
        this.projectiles = this.projectiles.filter(proj => !proj.isDead);
        this.projectiles.forEach(proj => proj.update(deltaTime));

        // Find target if don't have one or current target is dead/out of range
        if (!this.targetEnemy || !enemies.includes(this.targetEnemy) || 
            this.getDistanceToEnemy(this.targetEnemy) > this.range) {
            this.targetEnemy = this.findTarget(enemies);
        }

        // Attack if we have a target and enough time has passed
        if (this.targetEnemy && performance.now() - this.lastAttackTime >= this.attackSpeed) {
            this.shoot(this.targetEnemy);
            this.lastAttackTime = performance.now();
        }
    }

    findTarget(enemies) {
        // Find the enemy that's furthest along the path within range
        return enemies
            .filter(enemy => this.getDistanceToEnemy(enemy) <= this.range)
            .sort((a, b) => b.distanceTraveled - a.distanceTraveled)[0];
    }

    shoot(enemy) {
        if (!enemy) return;

        this.shotCount++;
        const isSpecialShot = this.level === this.maxLevel && this.shotCount % this.specialShotInterval === 0;
        
        let currentDamage = this.damage;

        // Apply magical upgrades
        if (this.upgrades) {
            this.upgrades.forEach(upgrade => {
                if (upgrade.effect) {
                    // Store original stats
                    const originalDamage = this.damage;
                    const originalRange = this.range;
                    const originalAttackSpeed = this.attackSpeed;

                    // Apply the upgrade effect
                    upgrade.effect(this, enemy);

                    // If damage was modified by the effect, use the new value
                    if (this.damage !== originalDamage) {
                        currentDamage = this.damage;
                    }

                    // Restore original stats (effects should be temporary per shot)
                    this.damage = originalDamage;
                    this.range = originalRange;
                    this.attackSpeed = originalAttackSpeed;
                }
            });
        }

        this.projectiles.push(new Projectile(
            this.x,
            this.y,
            enemy,
            currentDamage,
            this.projectileColor || '#FFA500',
            isSpecialShot,
            this.specialAbility ? this.specialAbility.bind(this) : null
        ));
    }

    specialAbility(x, y) {
        // Override in subclasses
    }

    getDistanceToEnemy(enemy) {
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    draw(ctx, alpha = 1) {
        ctx.save();
        
        // Draw range circle when selected or placing
        if (TowerManager.isPlacing || this === TowerManager.selectedTower) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(74, 144, 226, ${alpha * 0.3})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = `rgba(74, 144, 226, ${alpha * 0.1})`;
            ctx.fill();
        }
        
        // Draw base platform
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.size/3, this.size/2, this.size/6, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(85, 85, 85, ${alpha})`;
        ctx.fill();

        // Draw tower body
        this.drawTowerBody(ctx, alpha);

        // Draw level gems
        this.drawLevelGems(ctx, alpha);

        // Draw projectiles
        this.projectiles.forEach(proj => proj.draw(ctx));

        // Draw targeting line
        if (this.targetEnemy && !this.targetEnemy.isDead) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.targetEnemy.x, this.targetEnemy.y);
            ctx.strokeStyle = `rgba(74, 144, 226, ${alpha * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore();
    }

    drawTowerBody(ctx, alpha) {
        // Default tower body - override in subclasses
        ctx.fillStyle = `rgba(52, 152, 219, ${alpha})`;
        ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }

    drawLevelGems(ctx, alpha) {
        const gemColors = ['#FFD700', '#FF5733', '#9B59B6'];
        const gemSize = 6;
        const spacing = gemSize * 2;
        const startX = this.x - ((this.level - 1) * spacing) / 2;
        
        for (let i = 0; i < this.level; i++) {
            ctx.beginPath();
            ctx.moveTo(startX + i * spacing, this.y + this.size/2 + gemSize);
            ctx.lineTo(startX + i * spacing - gemSize/2, this.y + this.size/2 + gemSize * 2);
            ctx.lineTo(startX + i * spacing + gemSize/2, this.y + this.size/2 + gemSize * 2);
            ctx.closePath();
            
            ctx.fillStyle = `rgba(${gemColors[this.level - 1]}, ${alpha})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    upgrade() {
        if (this.level < this.maxLevel) {
            this.level++;
            this.damage = this.baseStats.damage * this.level;
            return true;
        }
        return false;
    }

    getUpgradeCost() {
        return this.level < this.maxLevel ? this.constructor.cost * 0.75 : Infinity;
    }
}

class BasicTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.damage = 10;
        this.range = 120;
        this.attackSpeed = 1000;
        this.projectileColor = '#4A90E2'; // Blue projectiles
        this.baseStats = {
            damage: this.damage,
            range: this.range,
            attackSpeed: this.attackSpeed
        };
    }

    drawTowerBody(ctx, alpha) {
        // Blue tower with rounded top
        ctx.fillStyle = `rgba(52, 152, 219, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y - this.size/4, this.size/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Tower base
        ctx.fillRect(this.x - this.size/3, this.y - this.size/4, this.size/1.5, this.size/1.5);
    }

    static get cost() {
        return 100;
    }
}

class SniperTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.damage = 50;
        this.range = 200;
        this.attackSpeed = 2000;
        this.projectileColor = '#9B59B6'; // Purple projectiles
        this.baseStats = {
            damage: this.damage,
            range: this.range,
            attackSpeed: this.attackSpeed
        };
    }

    drawTowerBody(ctx, alpha) {
        // Purple sniper tower with long barrel
        ctx.fillStyle = `rgba(155, 89, 182, ${alpha})`; // Purple color
        
        // Draw the main tower body (octagonal base)
        ctx.beginPath();
        const sides = 8;
        const size = this.size/2;
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = this.x + Math.cos(angle) * size;
            const y = this.y + Math.sin(angle) * size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();

        // Draw the sniper barrel
        if (this.targetEnemy) {
            const angle = Math.atan2(
                this.targetEnemy.y - this.y,
                this.targetEnemy.x - this.x
            );
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.fillRect(0, -2, this.size/1.2, 4);
            ctx.restore();
        } else {
            // Default barrel position (pointing right)
            ctx.fillRect(this.x, this.y - 2, this.size/1.2, 4);
        }
    }

    specialAbility(x, y) {
        // Sniper towers can pierce through enemies
        return new PiercingShot(x, y, 
            this.targetEnemy.x - x,
            this.targetEnemy.y - y,
            this.damage * 1.5
        );
    }

    static get cost() {
        return 200;
    }
}

class RapidTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.damage = 5;
        this.range = 100;
        this.attackSpeed = 400;
        this.projectileColor = '#2ECC71'; // Green projectiles
        this.baseStats = {
            damage: this.damage,
            range: this.range,
            attackSpeed: this.attackSpeed
        };
    }

    drawTowerBody(ctx, alpha) {
        // Green rapid-fire tower with multiple turrets
        ctx.fillStyle = `rgba(46, 204, 113, ${alpha})`; // Green color
        
        // Draw triangular base
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size/2);
        ctx.lineTo(this.x - this.size/2, this.y + this.size/2);
        ctx.lineTo(this.x + this.size/2, this.y + this.size/2);
        ctx.closePath();
        ctx.fill();

        // Draw multiple small turret barrels
        const barrelCount = 3;
        for (let i = 0; i < barrelCount; i++) {
            const angle = ((i / barrelCount) - 0.5) * Math.PI * 0.5;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.fillRect(0, -1, this.size/2, 2);
            ctx.restore();
        }
    }

    specialAbility(x, y) {
        // Rapid towers shoot multiple projectiles in a spread
        return new MultiShot(x, y, this.damage, 5);
    }

    static get cost() {
        return 150;
    }
}

// Register tower types
TowerManager.types = {
    'Basic': BasicTower,
    'Sniper': SniperTower,
    'Rapid': RapidTower
};

TowerManager.selectedType = BasicTower;

// Export both the Tower class and TowerManager
window.Tower = Tower;
window.TowerManager = TowerManager;

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
        // Draw tower base (common for all towers)
        ctx.save();
        
        // Draw base platform
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.size/3, this.size/2, this.size/6, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#555555';
        ctx.fill();

        // Draw tower body
        this.drawTowerBody(ctx);

        // Draw level gems
        this.drawLevelGems(ctx);

        // Draw range circle when selected or placing
        if (TowerManager.isPlacing || this === TowerManager.selectedTower) {
            this.drawRangeCircle(ctx);
        }

        // Draw projectiles
        this.projectiles.forEach(proj => proj.draw(ctx));

        // Draw targeting line
        if (this.target && !this.target.isDead) {
            this.drawTargetingLine(ctx);
        }

        ctx.restore();
    }

    drawRangeCircle(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(74, 144, 226, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(74, 144, 226, 0.1)';
        ctx.fill();
    }

    drawTargetingLine(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.target.x, this.target.y);
        ctx.strokeStyle = 'rgba(74, 144, 226, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    drawLevelGems(ctx) {
        const gemColors = ['#FFD700', '#FF5733', '#9B59B6'];
        const gemSize = 6;
        const spacing = gemSize * 2;
        const startX = this.x - ((this.level - 1) * spacing) / 2;
        
        for (let i = 0; i < this.level; i++) {
            ctx.beginPath();
            ctx.moveTo(startX + i * spacing, this.y + this.size/2 + gemSize);
            ctx.lineTo(startX + i * spacing - gemSize/2, this.y + this.size/2 + gemSize * 2);
            ctx.lineTo(startX + i * spacing + gemSize/2, this.y + this.size/2 + gemSize * 2);
            ctx.closePath();
            
            ctx.fillStyle = gemColors[this.level - 1];
            ctx.fill();
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    drawTowerBody(ctx) {
        // Override in subclasses
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