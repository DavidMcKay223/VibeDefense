// Base classes first
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
            return true;
        }

        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            if (typeof this.target.takeDamage === 'function') {
                this.target.takeDamage(this.damage);
            }
            this.hasHit = true;
            return true;
        }

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

class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.range = 100;
        this.damage = 10;
        this.fireRate = 1000;
        this.lastFireTime = 0;
        this.targetEnemy = null;
        this.projectiles = [];
        this.level = 1;
        this.maxLevel = 3;
        this.shotCount = 0;
        this.specialShotInterval = 5;
        this.baseStats = {
            damage: this.damage,
            range: this.range,
            fireRate: this.fireRate
        };
        this.game = window.gameInstance;
    }

    update(deltaTime, enemies) {
        // Update projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const projectile = this.projectiles[i];
            if (projectile.update(deltaTime)) {
                this.projectiles.splice(i, 1);
            }
        }

        // Find target if we don't have one or current target is dead/out of range
        if (!this.targetEnemy || !this.targetEnemy.isAlive || !this.isInRange(this.targetEnemy)) {
            this.targetEnemy = this.findTarget(enemies);
        }

        // Fire at target if we have one
        if (this.targetEnemy && this.targetEnemy.isAlive) {
            const currentTime = performance.now();
            if (currentTime - this.lastFireTime >= this.fireRate) {
                this.fire();
                this.lastFireTime = currentTime;
            }
        }
    }

    findTarget(enemies) {
        // Find the first enemy in range
        return enemies.find(enemy => enemy.isAlive && this.isInRange(enemy));
    }

    isInRange(enemy) {
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        return (dx * dx + dy * dy) <= this.range * this.range;
    }

    fire() {
        this.shotCount++;
        let damage = this.damage;

        // Special shot for max level towers
        if (this.level === this.maxLevel && this.shotCount % this.specialShotInterval === 0) {
            damage *= 2;
        }

        // Apply critical hit if we have the power-up
        if (this.critChance && Math.random() < this.critChance) {
            damage *= 2;
            console.log('Critical hit! Damage:', damage);
        }

        // Create main projectile
        const projectile = new Projectile(this.x, this.y, this.targetEnemy, damage);
        this.projectiles.push(projectile);

        // Chain reaction power-up: chance to create additional projectiles
        if (this.chainChance && Math.random() < this.chainChance) {
            // Find additional targets within range
            const nearbyEnemies = this.game.waveSystem.activeEnemies
                .filter(enemy => 
                    enemy !== this.targetEnemy && 
                    enemy.isAlive && 
                    this.isInRange(enemy)
                )
                .slice(0, 2); // Maximum 2 additional targets

            nearbyEnemies.forEach(enemy => {
                const chainProjectile = new Projectile(this.x, this.y, enemy, damage * 0.75); // Chain projectiles deal 75% damage
                this.projectiles.push(chainProjectile);
                console.log('Chain reaction triggered!');
            });
        }
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
        const gemSize = 4;
        const spacing = 8;
        const startX = this.x - ((this.maxLevel - 1) * spacing) / 2;
        
        for (let i = 0; i < this.maxLevel; i++) {
            ctx.beginPath();
            ctx.arc(startX + i * spacing, this.y - this.size/2 - 5, gemSize, 0, Math.PI * 2);
            
            if (i < this.level) {
                // Filled gem for current level
                ctx.fillStyle = `rgba(46, 204, 113, ${alpha})`;
                ctx.fill();
            } else {
                // Empty gem for potential upgrades
                ctx.strokeStyle = `rgba(149, 165, 166, ${alpha})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    upgrade() {
        console.log('Attempting to upgrade tower:', {
            currentLevel: this.level,
            maxLevel: this.maxLevel,
            currentDamage: this.damage,
            currentRange: this.range,
            currentFireRate: this.fireRate
        });

        if (this.level < this.maxLevel) {
            this.level++;
            
            // Increase stats with each level
            this.damage = this.baseStats.damage * (1 + (this.level - 1) * 0.5); // +50% per level
            this.range = this.baseStats.range * (1 + (this.level - 1) * 0.2);  // +20% per level
            this.fireRate = this.baseStats.fireRate * (1 - (this.level - 1) * 0.15); // -15% per level
            
            console.log('Tower upgraded:', {
                newLevel: this.level,
                newDamage: this.damage,
                newRange: this.range,
                newFireRate: this.fireRate
            });
            
            return true;
        }
        console.log('Tower already at max level');
        return false;
    }

    getUpgradeCost() {
        const cost = this.level >= this.maxLevel ? Infinity : Math.floor(this.constructor.cost * (1 + this.level * 0.5));
        console.log('Calculating upgrade cost:', {
            currentLevel: this.level,
            maxLevel: this.maxLevel,
            baseCost: this.constructor.cost,
            upgradeCost: cost
        });
        return cost;
    }
}

// Initialize TowerManager first
const TowerManager = {
    isPlacing: false,
    selectedTower: null,
    placementTower: null,
    selectedType: null,
    types: {},
    costs: {}
};

// Define tower classes
class BasicTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.damage = 20;
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
                -this.size/2,
                -this.size/2,
                this.size,
                this.size
            );
        } else {
            // Fallback shape drawing
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = `rgba(52, 152, 219, ${alpha})`;
            ctx.beginPath();
            ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillRect(0, -2, this.size/2, 4);
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
        this.damage = 100;
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
                -this.size/2,
                -this.size/2,
                this.size,
                this.size
            );
        } else {
            // Fallback shape drawing
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = `rgba(155, 89, 182, ${alpha})`;
            ctx.beginPath();
            ctx.arc(0, 0, this.size/2, 0, Math.PI * 2);
            ctx.fill();
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
        return 250;
    }
}

class RapidTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.damage = 10;
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
                -this.size/2,
                -this.size/2,
                this.size,
                this.size
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

class ChainLightningTower extends Tower {
    constructor(x, y) {
        super(x, y);
        this.damage = 30;
        this.range = 150;
        this.fireRate = 1500;
        this.projectileColor = '#F1C40F'; // Yellow/gold for lightning
        this.chainCount = 3; // Number of chain bounces
        this.chainRange = 100; // Range for chain bounces
        this.damageMultiplier = 1.2; // Each bounce does 20% more damage
        this.baseStats = {
            damage: this.damage,
            range: this.range,
            fireRate: this.fireRate,
            chainCount: this.chainCount,
            chainRange: this.chainRange
        };
        this.rotation = 0;
    }

    drawTowerBody(ctx, alpha) {
        ctx.save();
        
        // Draw base
        const baseImg = assetManager.getImage('chainTower_base');
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
        const towerImg = assetManager.getImage('chainTower');
        if (towerImg) {
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.globalAlpha = alpha;
            ctx.drawImage(towerImg, 
                -this.size/2,
                -this.size/2,
                this.size,
                this.size
            );
        } else {
            // Fallback shape drawing
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = `rgba(241, 196, 15, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(-this.size/2, -this.size/2);
            ctx.lineTo(this.size/2, 0);
            ctx.lineTo(-this.size/2, this.size/2);
            ctx.closePath();
            ctx.fill();
            
            // Draw lightning effect
            ctx.strokeStyle = `rgba(241, 196, 15, ${alpha * 0.7})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = -this.size/4; i <= this.size/4; i += 4) {
                ctx.moveTo(-this.size/4, i);
                ctx.lineTo(this.size/4, i);
            }
            ctx.stroke();
        }

        ctx.restore();
    }

    fire() {
        this.shotCount++;
        let damage = this.damage;

        // Special shot for max level towers
        if (this.level === this.maxLevel && this.shotCount % this.specialShotInterval === 0) {
            damage *= 2;
            this.chainCount += 2; // Extra bounces for special shots
        }

        // Create chain lightning projectile
        const projectile = new ChainLightningProjectile(
            this.x, 
            this.y, 
            this.targetEnemy,
            damage,
            this.chainCount,
            this.chainRange,
            this.damageMultiplier
        );
        this.projectiles.push(projectile);

        // Chain reaction power-up effect
        if (this.chainChance && Math.random() < this.chainChance) {
            this.chainCount++; // Add an extra bounce
            console.log('Chain reaction triggered - Extra bounce added!');
        }
    }

    upgrade() {
        if (this.level < this.maxLevel) {
            this.level++;
            
            // Increase stats with each level
            this.damage = this.baseStats.damage * (1 + (this.level - 1) * 0.5); // +50% per level
            this.range = this.baseStats.range * (1 + (this.level - 1) * 0.2);  // +20% per level
            this.fireRate = this.baseStats.fireRate * (1 - (this.level - 1) * 0.15); // -15% per level
            this.chainCount = this.baseStats.chainCount + this.level - 1; // +1 chain per level
            this.chainRange = this.baseStats.chainRange * (1 + (this.level - 1) * 0.1); // +10% chain range per level
            
            return true;
        }
        return false;
    }

    static get cost() {
        return 350;
    }
}

class ChainLightningProjectile extends Projectile {
    constructor(x, y, target, damage, chainCount, chainRange, damageMultiplier) {
        super(x, y, target, damage);
        this.chainCount = chainCount;
        this.chainRange = chainRange;
        this.damageMultiplier = damageMultiplier;
        this.hitEnemies = new Set();
        this.lightningSegments = [];
        this.speed = 8; // Faster than normal projectiles
    }

    update(deltaTime) {
        if (this.hasHit || !this.target || !this.target.isAlive) {
            return true;
        }

        // Calculate direction to target
        const dx = this.target.x - this.x;
        const dy = this.target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.speed) {
            // Hit the target
            if (typeof this.target.takeDamage === 'function') {
                this.target.takeDamage(this.damage);
                this.hitEnemies.add(this.target);

                // Chain to nearby enemies
                if (this.chainCount > 0) {
                    const nearbyEnemies = window.gameInstance.waveSystem.activeEnemies
                        .filter(enemy => 
                            enemy.isAlive && 
                            !this.hitEnemies.has(enemy) &&
                            this.getDistanceTo(enemy) <= this.chainRange
                        );

                    if (nearbyEnemies.length > 0) {
                        // Find the closest enemy
                        const nextTarget = nearbyEnemies.reduce((closest, current) => {
                            const closestDist = this.getDistanceTo(closest);
                            const currentDist = this.getDistanceTo(current);
                            return currentDist < closestDist ? current : closest;
                        });

                        // Add lightning segment for visual effect
                        this.lightningSegments.push({
                            start: { x: this.x, y: this.y },
                            end: { x: nextTarget.x, y: nextTarget.y },
                            alpha: 1
                        });

                        // Create new projectile for the chain
                        const chainProjectile = new ChainLightningProjectile(
                            this.x,
                            this.y,
                            nextTarget,
                            this.damage * this.damageMultiplier,
                            this.chainCount - 1,
                            this.chainRange,
                            this.damageMultiplier
                        );
                        chainProjectile.hitEnemies = new Set(this.hitEnemies);
                        window.gameInstance.towers[0].projectiles.push(chainProjectile);
                    }
                }
            }
            this.hasHit = true;
            return true;
        }

        // Move towards target
        this.x += (dx / distance) * this.speed;
        this.y += (dy / distance) * this.speed;

        return false;
    }

    getDistanceTo(enemy) {
        const dx = enemy.x - this.x;
        const dy = enemy.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    draw(ctx) {
        if (this.hasHit) return;

        // Draw lightning projectile
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#F1C40F';
        ctx.fill();

        // Draw lightning effect
        ctx.strokeStyle = '#F1C40F';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x - 5, this.y);
        ctx.lineTo(this.x + 5, this.y);
        ctx.moveTo(this.x, this.y - 5);
        ctx.lineTo(this.x, this.y + 5);
        ctx.stroke();

        // Draw chain segments
        this.lightningSegments.forEach(segment => {
            ctx.strokeStyle = `rgba(241, 196, 15, ${segment.alpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(segment.start.x, segment.start.y);
            ctx.lineTo(segment.end.x, segment.end.y);
            ctx.stroke();

            // Fade out the segment
            segment.alpha *= 0.95;
        });

        // Remove faded segments
        this.lightningSegments = this.lightningSegments.filter(segment => segment.alpha > 0.1);
    }
}

// Register tower types and costs AFTER all classes are defined
TowerManager.types = {
    'Basic': BasicTower,
    'Sniper': SniperTower,
    'Rapid': RapidTower,
    'Chain': ChainLightningTower
};

TowerManager.costs = {
    'Basic': 100,
    'Sniper': 250,
    'Rapid': 150,
    'Chain': 350
};

TowerManager.selectedType = BasicTower;

// Export to window
window.Tower = Tower;
window.TowerManager = TowerManager;
window.Projectile = Projectile;

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