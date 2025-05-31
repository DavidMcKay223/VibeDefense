class AssetManager {
    constructor() {
        this.images = {};
        this.loaded = false;
        this.loadPromise = null;
    }

    async loadAssets() {
        if (this.loadPromise) return this.loadPromise;

        this.loadPromise = new Promise((resolve) => {
            const assets = {
                // Towers
                'basicTower': 'assets/towers/basic_tower.png',
                'basicTower_base': 'assets/towers/basic_tower_base.png',
                'sniperTower': 'assets/towers/sniper_tower.png',
                'sniperTower_base': 'assets/towers/sniper_tower_base.png',
                'rapidTower': 'assets/towers/rapid_tower.png',
                'rapidTower_base': 'assets/towers/rapid_tower_base.png',
                
                // Enemies
                'basicEnemy': 'assets/enemies/basic_enemy.png',
                'speedEnemy': 'assets/enemies/speed_enemy.png',
                'armoredEnemy': 'assets/enemies/armored_enemy.png',
                'layeredEnemy': 'assets/enemies/layered_enemy.png',
                'bossEnemy': 'assets/enemies/boss_enemy.png',
                
                // Projectiles
                'basicProjectile': 'assets/projectiles/basic_projectile.png',
                'sniperProjectile': 'assets/projectiles/sniper_projectile.png',
                'rapidProjectile': 'assets/projectiles/rapid_projectile.png',
                
                // Effects
                'explosion': 'assets/effects/explosion.png',
                'trail': 'assets/effects/trail.png',
                'upgrade': 'assets/effects/upgrade.png'
            };

            let loadedCount = 0;
            const totalAssets = Object.keys(assets).length;

            const onLoad = () => {
                loadedCount++;
                if (loadedCount === totalAssets) {
                    this.loaded = true;
                    resolve();
                }
            };

            Object.entries(assets).forEach(([key, path]) => {
                const img = new Image();
                img.onload = onLoad;
                img.onerror = () => {
                    console.warn(`Failed to load asset: ${path}`);
                    onLoad(); // Still count as loaded to avoid blocking
                };
                img.src = path;
                this.images[key] = img;
            });
        });

        return this.loadPromise;
    }

    getImage(key) {
        return this.images[key];
    }
}

// Create global instance
window.assetManager = new AssetManager(); 