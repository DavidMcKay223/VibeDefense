class Shop {
    constructor(game) {
        this.game = game;
        this.items = this.setupItems();
        this.setupShopUI();
        this.updateButtonStates = this.updateButtonStates.bind(this);
        
        // Update button states when money changes
        if (this.game.updateUI) {
            const originalUpdateUI = this.game.updateUI.bind(this.game);
            this.game.updateUI = () => {
                originalUpdateUI();
                this.updateButtonStates();
            };
        }
    }

    setupItems() {
        return {
            damageBoost: {
                name: "Damage Boost",
                description: "Increases all tower damage by 25%",
                cost: 200,
                level: 0,
                maxLevel: 3,
                effect: (tower) => {
                    tower.damage *= 1.25;
                }
            },
            rangeBoost: {
                name: "Range Boost",
                description: "Increases all tower range by 20%",
                cost: 150,
                level: 0,
                maxLevel: 3,
                effect: (tower) => {
                    tower.range *= 1.2;
                }
            },
            speedBoost: {
                name: "Speed Boost",
                description: "Increases all tower firing speed by 15%",
                cost: 175,
                level: 0,
                maxLevel: 3,
                effect: (tower) => {
                    tower.fireRate *= 0.85;
                }
            },
            criticalHit: {
                name: "Critical Strike",
                description: "Towers have a chance to deal double damage",
                cost: 300,
                level: 0,
                maxLevel: 3,
                effect: (tower) => {
                    if (!tower.critChance) tower.critChance = 0;
                    tower.critChance += 0.1; // 10% chance per level
                }
            },
            chainReaction: {
                name: "Chain Reaction",
                description: "Projectiles have a chance to split and hit additional enemies",
                cost: 250,
                level: 0,
                maxLevel: 3,
                effect: (tower) => {
                    if (!tower.chainChance) tower.chainChance = 0;
                    tower.chainChance += 0.15; // 15% chance per level
                }
            }
        };
    }

    setupShopUI() {
        const shopItems = document.querySelector('.shop-items');
        if (!shopItems) return;
        
        shopItems.innerHTML = '';

        Object.entries(this.items).forEach(([id, item]) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            itemElement.id = `shop-item-${id}`;
            itemElement.innerHTML = `
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p class="bonus-text">Level ${item.level}/${item.maxLevel}</p>
                </div>
                <button class="buy-button" ${this.canBuyItem(id) ? '' : 'disabled'}>
                    Buy (${item.cost})
                </button>
            `;

            const buyButton = itemElement.querySelector('.buy-button');
            buyButton.onclick = () => this.buyItem(id);

            shopItems.appendChild(itemElement);
        });
    }

    canBuyItem(itemId) {
        const item = this.items[itemId];
        return item.level < item.maxLevel && this.game.money >= this.getItemCost(itemId);
    }

    getItemCost(itemId) {
        const item = this.items[itemId];
        const basePrice = item.cost;
        const priceIncrease = 1.5; // 50% increase per level
        const currentPrice = Math.floor(basePrice * Math.pow(priceIncrease, item.level));
        
        // Apply power-up master discount if unlocked
        if (this.game.achievements?.rewards?.powerUpMaster?.unlocked) {
            return Math.floor(currentPrice * 0.75); // 25% discount
        }
        
        return currentPrice;
    }

    buyItem(itemId) {
        const item = this.items[itemId];
        const cost = this.getItemCost(itemId);

        if (!this.canBuyItem(itemId)) return;

        // Deduct cost and apply upgrade
        this.game.money -= cost;
        item.level++;

        // Apply effect to all existing towers
        this.game.towers.forEach(tower => item.effect(tower));

        // Update achievements
        if (this.game.achievements?.stats) {
            this.game.achievements.stats.powerUpsUsed++;
            this.game.achievements.checkRewards();
        }

        // Update UI
        this.updateItemUI(itemId);
        this.game.updateUI();
    }

    updateItemUI(itemId) {
        const itemElement = document.getElementById(`shop-item-${itemId}`);
        if (!itemElement) return;

        const item = this.items[itemId];
        const bonusText = itemElement.querySelector('.bonus-text');
        const buyButton = itemElement.querySelector('.buy-button');
        
        if (bonusText) {
            bonusText.textContent = `Level ${item.level}/${item.maxLevel}`;
        }
        
        if (buyButton) {
            const cost = this.getItemCost(itemId);
            buyButton.textContent = `Buy (${cost})`;
            buyButton.disabled = !this.canBuyItem(itemId);
            
            if (item.level >= item.maxLevel) {
                buyButton.textContent = 'MAX';
                buyButton.disabled = true;
            } else if (this.game.money < cost) {
                buyButton.classList.add('cant-afford');
            } else {
                buyButton.classList.remove('cant-afford');
            }
        }
    }

    updateButtonStates() {
        Object.entries(this.items).forEach(([itemId, item]) => {
            const itemElement = document.getElementById(`shop-item-${itemId}`);
            if (!itemElement) return;

            const buyButton = itemElement.querySelector('.buy-button');
            if (!buyButton) return;

            const cost = this.getItemCost(itemId);
            const canAfford = this.game.money >= cost;
            const isMaxLevel = item.level >= item.maxLevel;
            
            buyButton.disabled = !canAfford || isMaxLevel;
            
            if (isMaxLevel) {
                buyButton.textContent = 'MAX';
            } else {
                buyButton.textContent = `Buy (${cost})`;
                buyButton.classList.toggle('cant-afford', !canAfford);
            }
        });
    }

    applyUpgrades(tower) {
        Object.values(this.items).forEach(item => {
            for (let i = 0; i < item.level; i++) {
                item.effect(tower);
            }
        });
    }
} 