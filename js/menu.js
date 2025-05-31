class GameMenu {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'splash';
        this.setupMenus();
        this.selectedLevel = null;
    }

    setupMenus() {
        // Create splash screen
        this.splashScreen = document.createElement('div');
        this.splashScreen.id = 'splashScreen';
        this.splashScreen.innerHTML = `
            <div class="logo">
                <div class="logo-tower">
                    <div class="tower-base"></div>
                    <div class="tower-top"></div>
                    <div class="tower-window"></div>
                    <div class="tower-light"></div>
                </div>
                <h1>VIBE DEFENSE</h1>
            </div>
            <button id="startGameBtn">Start Game</button>
        `;

        // Create level select screen
        this.levelSelect = document.createElement('div');
        this.levelSelect.id = 'levelSelect';
        this.levelSelect.innerHTML = `
            <h2>Select Level</h2>
            <div class="level-grid">
                ${Object.entries(Levels).map(([key, level]) => `
                    <div class="level-card" data-level="${key}">
                        <div class="level-preview">
                            <canvas width="200" height="150"></canvas>
                        </div>
                        <h3>${level.name}</h3>
                        <span class="difficulty ${level.difficulty.toLowerCase()}">${level.difficulty}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // Add screens to game container
        const container = document.getElementById('gameContainer');
        container.appendChild(this.splashScreen);
        container.appendChild(this.levelSelect);

        // Setup event listeners
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.showScreen('levelSelect');
        });

        // Setup level selection
        const levelCards = this.levelSelect.querySelectorAll('.level-card');
        levelCards.forEach(card => {
            const levelKey = card.getAttribute('data-level');
            const canvas = card.querySelector('canvas');
            const ctx = canvas.getContext('2d');
            
            // Draw level preview
            const level = Levels[levelKey];
            const path = level.createPath(canvas.width, canvas.height);
            
            // Draw background
            ctx.fillStyle = '#90EE90';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw path
            path.draw(ctx);

            // Add click handler
            card.addEventListener('click', () => {
                this.selectedLevel = level;
                this.startGame();
            });
        });
    }

    showScreen(screenName) {
        this.currentScreen = screenName;
        this.splashScreen.style.display = screenName === 'splash' ? 'flex' : 'none';
        this.levelSelect.style.display = screenName === 'levelSelect' ? 'flex' : 'none';
        document.getElementById('gameCanvas').style.display = screenName === 'game' ? 'block' : 'none';
        document.getElementById('ui').style.display = screenName === 'game' ? 'flex' : 'none';
    }

    startGame() {
        if (!this.selectedLevel) return;
        
        // Hide menus
        this.showScreen('game');
        
        // Initialize game with selected level
        this.game.initializeLevel(this.selectedLevel);
    }
} 