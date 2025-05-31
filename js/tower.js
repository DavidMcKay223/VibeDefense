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
        this.fireRate = 1000; // milliseconds between shots
        this.lastFireTime = 0;
        this.targetEnemy = null;
        this.projectiles = [];
        this.level = 1;
        this.maxLevel = 3;
        this.shotCount = 0;
        this.specialShotInterval = 5; // Every 5th shot is special when maxed
        this.baseStats = {
            damage: this.damage,
            range: this.range,
            fireRate: this.fireRate
        };
    }

    update(deltaTime, enemies) {
        // Update projectiles
        this.projectiles = this.projectiles.filter(proj => !proj.update(deltaTime));

        // Find new target if needed
        if (!this.targetEnemy || !this.targetEnemy.isAlive || !this.isInRange(this.targetEnemy)) {
            this.targetEnemy = this.findTarget(enemies);
        }

        // Fire at target if ready
        const currentTime = Date.now();
        if (this.targetEnemy && currentTime - this.lastFireTime >= this.fireRate) {
            this.shoot(this.targetEnemy);
            this.lastFireTime = currentTime;
        }
    }

    findTarget(enemies) {
        // Filter out dead enemies and find the closest one in range
        return enemies
            .filter(enemy => enemy.isAlive)
            .find(enemy => this.isInRange(enemy));
    }

    isInRange(enemy) {
        if (!enemy) return false;
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.range;
    }

    shoot(target) {
        if (!target || !target.isAlive) return;

        this.shotCount++;
        const isSpecialShot = this.level === this.maxLevel && this.shotCount % this.specialShotInterval === 0;

        // Calculate barrel end position based on rotation
        const barrelLength = this.size/2;
        const rotation = Math.atan2(target.y - this.y, target.x - this.x);
        const startX = this.x + Math.cos(rotation) * barrelLength;
        const startY = this.y + Math.sin(rotation) * barrelLength;

        const projectile = new Projectile(startX, startY, target, this.damage);
        this.projectiles.push(projectile);

        // Handle special shot if applicable
        if (isSpecialShot && this.specialAbility) {
            this.specialAbility(startX, startY, target);
        }
    }

    specialAbility(x, y, target) {
        // Override in subclasses
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
        if (this.targetEnemy && this.targetEnemy.isAlive) {
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
        this.fireRate = 1000;
        this.projectileColor = '#4A90E2'; // Blue projectiles
        this.baseStats = {
            damage: this.damage,
            range: this.range,
            fireRate: this.fireRate
        };
        this.rotation = 0;
    }

    drawTowerBody(ctx, alpha) {
        ctx.save();
        
        // Draw base
        const baseImg = assetManager.getImage('basicTower_base');
        if (baseImg) {
            ctx.globalAlpha = alpha;
            ctx.drawImage(baseImg, 
                this.x - this.size, 
                this.y - this.size/4, 
                this.size * 2, 
                this.size
            );
        }

        // Calculate rotation angle if we have a target
        if (this.targetEnemy) {
            this.rotation = Math.atan2(
                this.targetEnemy.y - this.y,
                this.targetEnemy.x - this.x
            );
        }

        // Draw tower with rotation
        const towerImg = assetManager.getImage('basicTower');
        if (towerImg) {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = alpha;
            ctx.drawImage(towerImg, 
                -this.size/2, // Adjusted from -this.size
                -this.size/2, // Adjusted from -this.size
                this.size,    // Adjusted from this.size * 2
                this.size     // Adjusted from this.size * 2
            );
        } else {
            // Fallback shape drawing
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = `rgba(52, 152, 219, ${alpha})`;
            ctx.beginPath();
            ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(0, -2, this.size/2, 4); // Adjusted cannon size and position
        }

        ctx.restore();
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
        this.fireRate = 2000;
        this.projectileColor = '#9B59B6'; // Purple projectiles
        this.baseStats = {
            damage: this.damage,
            range: this.range,
            fireRate: this.fireRate
        };
        this.rotation = 0; // Current rotation angle
    }

    drawTowerBody(ctx, alpha) {
        ctx.save();
        
        // Draw base
        const baseImg = assetManager.getImage('sniperTower_base');
        if (baseImg) {
            ctx.globalAlpha = alpha;
            ctx.drawImage(baseImg, 
                this.x - this.size, 
                this.y - this.size/4, 
                this.size * 2, 
                this.size
            );
        }

        // Calculate rotation angle if we have a target
        if (this.targetEnemy) {
            this.rotation = Math.atan2(
                this.targetEnemy.y - this.y,
                this.targetEnemy.x - this.x
            );
        }

        // Draw tower with rotation
        const towerImg = assetManager.getImage('sniperTower');
        if (towerImg) {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = alpha;
            ctx.drawImage(towerImg, 
                -this.size/2, // Adjusted from -this.size
                -this.size/2, // Adjusted from -this.size
                this.size,    // Adjusted from this.size * 2
                this.size     // Adjusted from this.size * 2
            );
        } else {
            // Fallback shape drawing
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = `rgba(155, 89, 182, ${alpha})`;
            
            // Draw octagonal base
            ctx.beginPath();
            const sides = 8;
            const size = this.size/2;
            for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2;
                const x = Math.cos(angle) * size;
                const y = Math.sin(angle) * size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            // Draw the barrel (adjusted position and size)
            ctx.fillRect(0, -2, this.size * 0.75, 4);
        }

        ctx.restore();
    }

    specialAbility(x, y, target) {
        // Sniper towers can pierce through enemies
        return new PiercingShot(x, y, 
            target.x - x,
            target.y - y,
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
        this.fireRate = 400;
        this.projectileColor = '#2ECC71'; // Green projectiles
        this.baseStats = {
            damage: this.damage,
            range: this.range,
            fireRate: this.fireRate
        };
        this.rotation = 0;
    }

    drawTowerBody(ctx, alpha) {
        ctx.save();
        
        // Draw base
        const baseImg = assetManager.getImage('rapidTower_base');
        if (baseImg) {
            ctx.globalAlpha = alpha;
            ctx.drawImage(baseImg, 
                this.x - this.size, 
                this.y - this.size/4, 
                this.size * 2, 
                this.size
            );
        }

        // Calculate rotation angle if we have a target
        if (this.targetEnemy) {
            this.rotation = Math.atan2(
                this.targetEnemy.y - this.y,
                this.targetEnemy.x - this.x
            );
        }

        // Draw tower with rotation
        const towerImg = assetManager.getImage('rapidTower');
        if (towerImg) {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = alpha;
            ctx.drawImage(towerImg, 
                -this.size/2, // Adjusted from -this.size
                -this.size/2, // Adjusted from -this.size
                this.size,    // Adjusted from this.size * 2
                this.size     // Adjusted from this.size * 2
            );
        } else {
            // Fallback shape drawing
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = `rgba(46, 204, 113, ${alpha})`;
            
            // Draw circular base
            ctx.beginPath();
            ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
            ctx.fill();

            // Draw triple barrels
            const barrelSpacing = 10;
            ctx.fillRect(-barrelSpacing, -2, this.size/2, 4);  // Left barrel
            ctx.fillRect(0, -2, this.size/2, 4);               // Center barrel
            ctx.fillRect(barrelSpacing, -2, this.size/2, 4);   // Right barrel
        }

        ctx.restore();
    }

    specialAbility(x, y, target) {
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

class Projectile {
    constructor(x, y, target, damage, speed = 5) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.radius = 4;
        this.hasHit = false;
    }

    update(deltaTime) {
        if (this.hasHit || !this.target || !this.target.isAlive) {
            return true; // Return true to indicate this projectile should be removed
        }

        // Calculate direction to target
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            // Hit the target
            if (typeof this.target.takeDamage === 'function') {
                this.target.takeDamage(this.damage);
            }
            this.hasHit = true;
            return true;
        }

        // Move towards target
        this.x += (dx / distance) * this.speed;
        this.y += (dy / distance) * this.speed;

        return false;
    }

    draw(ctx) {
        if (this.hasHit) return;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#00F';
        ctx.fill();
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