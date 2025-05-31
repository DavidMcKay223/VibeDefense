class Shop {
    constructor(game) {
        this.game = game;
        this.items = {
            multishot: {
                name: "Arcane Multishot",
                description: "Towers have a 30% chance to shoot an additional projectile",
                cost: 500,
                maxLevel: 3,
                level: 0,
                effect: (tower) => {
                    if (Math.random() < 0.3) {
                        tower.shoot(tower.targetEnemy, true); // true indicates it's a bonus shot
                    }
                },
                bonusPerLevel: "Additional 30% chance per level"
            },
            damage: {
                name: "Power Crystal",
                description: "Increases tower damage by 25%",
                cost: 400,
                maxLevel: 5,
                level: 0,
                effect: (tower) => {
                    tower.damage *= 1.25;
                },
                bonusPerLevel: "+25% damage per level"
            },
            range: {
                name: "Sight Stone",
                description: "Increases tower range by 20%",
                cost: 300,
                maxLevel: 3,
                level: 0,
                effect: (tower) => {
                    tower.range *= 1.2;
                },
                bonusPerLevel: "+20% range per level"
            },
            speed: {
                name: "Haste Rune",
                description: "Increases tower attack speed by 15%",
                cost: 450,
                maxLevel: 4,
                level: 0,
                effect: (tower) => {
                    tower.attackSpeed *= 0.85; // Reduce cooldown by 15%
                },
                bonusPerLevel: "+15% attack speed per level"
            },
            critical: {
                name: "Dragon's Eye",
                description: "20% chance to deal double damage",
                cost: 600,
                maxLevel: 3,
                level: 0,
                effect: (tower) => {
                    if (Math.random() < 0.2) {
                        tower.damage *= 2;
                    }
                },
                bonusPerLevel: "+20% critical chance per level"
            },
            chain: {
                name: "Lightning Orb",
                description: "Attacks have 25% chance to chain to another enemy",
                cost: 700,
                maxLevel: 2,
                level: 0,
                effect: (tower, enemy) => {
                    if (Math.random() < 0.25) {
                        const nearbyEnemies = tower.game.waveSystem.activeEnemies
                            .filter(e => e !== enemy && e.distanceTo(enemy) < 100);
                        if (nearbyEnemies.length > 0) {
                            const target = nearbyEnemies[0];
                            tower.shoot(target, true);
                        }
                    }
                },
                bonusPerLevel: "+25% chain chance per level"
            }
        };

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

    setupShopUI() {
        const shopPanel = document.getElementById('shopPanel');
        if (!shopPanel) return;

        const itemsContainer = shopPanel.querySelector('.shop-items');
        if (!itemsContainer) return;
        
        for (const [id, item] of Object.entries(this.items)) {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            itemElement.innerHTML = `
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p class="bonus-text">Level ${item.level}/${item.maxLevel}</p>
                    <p class="bonus-text">${item.bonusPerLevel}</p>
                </div>
                <button class="buy-button" data-item="${id}" data-cost="${this.getItemCost(id)}">
                    Buy (${this.getItemCost(id)} gold)
                </button>
            `;
            itemsContainer.appendChild(itemElement);

            const buyButton = itemElement.querySelector('.buy-button');
            buyButton.addEventListener('click', () => this.buyItem(id));
        }

        // Ensure shop starts hidden
        shopPanel.style.display = 'none';
        
        // Initial button states
        this.updateButtonStates();
    }

    updateButtonStates() {
        const buttons = document.querySelectorAll('.buy-button');
        buttons.forEach(button => {
            const itemId = button.getAttribute('data-item');
            const item = this.items[itemId];
            const cost = parseInt(button.getAttribute('data-cost'));
            
            // Disable if can't afford or max level reached
            const canAfford = this.game.money >= cost;
            const isMaxLevel = item.level >= item.maxLevel;
            
            button.disabled = !canAfford || isMaxLevel;
            
            // Update button text based on state
            if (isMaxLevel) {
                button.textContent = 'MAX LEVEL';
            } else {
                button.textContent = `Buy (${cost} gold)`;
                if (!canAfford) {
                    button.classList.add('cant-afford');
                } else {
                    button.classList.remove('cant-afford');
                }
            }
        });
    }

    getItemCost(itemId) {
        const item = this.items[itemId];
        let cost = item.cost;
        
        // Apply power-up master discount if unlocked
        if (this.game.achievements?.rewards.powerUpMaster.unlocked) {
            cost = Math.floor(cost * 0.75); // 25% discount
        }
        
        return cost;
    }

    buyItem(itemId) {
        const item = this.items[itemId];
        if (item.level >= item.maxLevel) {
            return;
        }

        const cost = this.getItemCost(itemId);
        if (this.game.money >= cost) {
            this.game.money -= cost;
            item.level++;
            
            // Track power-up usage for achievements
            if (this.game.achievements) {
                this.game.achievements.stats.powerUpsUsed++;
                this.game.achievements.checkRewards();
            }
            
            // Apply the upgrade to all existing towers
            this.game.towers.forEach(tower => {
                tower.upgrades = tower.upgrades || [];
                tower.upgrades.push(item);
            });

            // Update the UI
            this.updateItemUI(itemId);
            this.game.updateUI();
        }
    }

    updateItemUI(itemId) {
        const item = this.items[itemId];
        const itemElement = document.querySelector(`[data-item="${itemId}"]`).parentElement;
        const levelText = itemElement.querySelector('.bonus-text');
        const costText = itemElement.querySelector('.cost-text');
        
        levelText.textContent = `Level ${item.level}/${item.maxLevel}`;
        costText.textContent = item.level < item.maxLevel ? `$${this.getItemCost(itemId)}` : 'MAX';
        
        this.updateButtonStates();
    }

    applyUpgrades(tower) {
        // Apply all active upgrades to a tower
        Object.values(this.items).forEach(item => {
            for (let i = 0; i < item.level; i++) {
                item.effect(tower);
            }
        });
    }
} 