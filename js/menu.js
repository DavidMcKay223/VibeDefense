class GameMenu {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'splash';
        this.setupMenu();
    }

    startLevel(level) {
        this.showScreen('game');
        this.game.initializeLevel(level);
    }

    setupMenu() {
        // Create splash screen if it doesn't exist
        if (!document.getElementById('splashScreen')) {
            const splashScreen = document.createElement('div');
            splashScreen.id = 'splashScreen';
            splashScreen.className = 'menu-screen';
            splashScreen.innerHTML = `
                <h1>Vibe Defense</h1>
                <button id="startGameBtn" class="game-button">Start Game</button>
            `;
            document.getElementById('gameContainer').appendChild(splashScreen);

            // Add click handler to start button
            document.getElementById('startGameBtn').onclick = () => {
                this.showScreen('levelSelect');
            };
        }

        // Create level select screen if it doesn't exist
        if (!document.getElementById('levelSelect')) {
            const levelSelect = document.createElement('div');
            levelSelect.id = 'levelSelect';
            levelSelect.className = 'menu-screen';
            levelSelect.style.display = 'none';
            
            // Create level cards
            levelSelect.innerHTML = `
                <h2>Select Level</h2>
                <div class="level-grid">
                    ${LEVELS.map((level, index) => `
                        <div class="level-card" data-level="${index}">
                            <div class="level-preview">
                                <!-- Level preview will be drawn here -->
                            </div>
                            <h3>${level.name}</h3>
                            <span class="difficulty ${level.difficulty}">${level.difficulty}</span>
                            <p>${level.config.description || ''}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            document.getElementById('gameContainer').appendChild(levelSelect);

            // Add click handlers to level cards
            levelSelect.querySelectorAll('.level-card').forEach((card, index) => {
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 150;
                card.querySelector('.level-preview').appendChild(canvas);
                
                // Draw path preview
                const level = LEVELS[index];
                const path = level.createPath(canvas.width, canvas.height);
                const ctx = canvas.getContext('2d');
                
                // Draw background
                ctx.fillStyle = '#90EE90';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw path
                path.draw(ctx);
                
                card.onclick = () => {
                    this.startLevel(level);
                };
            });
        }

        // Show splash screen initially
        this.showScreen('splash');
    }

    showScreen(screenId) {
        // Hide all screens
        const screens = ['splashScreen', 'levelSelect', 'gameCanvas', 'leftPanel', 'rightPanel', 'shopPanel'];
        screens.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = 'none';
            }
        });

        // Show requested screen
        switch (screenId) {
            case 'splash':
                document.getElementById('splashScreen').style.display = 'flex';
                break;
            case 'levelSelect':
                document.getElementById('levelSelect').style.display = 'flex';
                break;
            case 'game':
                document.getElementById('gameCanvas').style.display = 'block';
                document.getElementById('leftPanel').style.display = 'flex';
                document.getElementById('rightPanel').style.display = 'flex';
                document.getElementById('shopPanel').style.display = 'block';
                break;
        }

        this.currentScreen = screenId;
    }
} 