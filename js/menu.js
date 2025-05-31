class GameMenu {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'splash';
        this.setupMenus();
        this.selectedLevel = null;
    }

    setupMenus() {
        // Create splash screen
        this.splashScreen = document.getElementById('splashScreen');
        this.levelSelect = document.getElementById('levelSelect');
        this.leftPanel = document.getElementById('leftPanel');
        this.rightPanel = document.getElementById('rightPanel');

        // Setup event listeners
        document.getElementById('startGameBtn').addEventListener('click', () => {
            this.showScreen('levelSelect');
        });

        // Setup level selection
        const levelCards = this.levelSelect.querySelectorAll('.level-card');
        this.levelSelect.innerHTML = `
            <h2>Select Level</h2>
            <div class="level-grid">
                ${Object.entries(Levels).map(([key, level]) => `
                    <div class="level-card" data-level="${key}">
                        <div class="level-preview">
                            <canvas width="400" height="300"></canvas>
                        </div>
                        <h3>${level.name}</h3>
                        <span class="difficulty ${level.difficulty.toLowerCase()}">${level.difficulty}</span>
                    </div>
                `).join('')}
            </div>
        `;

        // Setup level selection and preview rendering
        const cards = this.levelSelect.querySelectorAll('.level-card');
        cards.forEach(card => {
            const levelKey = card.getAttribute('data-level');
            const canvas = card.querySelector('canvas');
            const ctx = canvas.getContext('2d');
            
            // Draw level preview
            const level = Levels[levelKey];
            const path = level.createPath(canvas.width, canvas.height);
            
            // Draw background
            ctx.fillStyle = '#90EE90';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw grid for visual reference
            this.drawPreviewGrid(ctx, canvas.width, canvas.height);
            
            // Draw path with thicker lines for preview
            ctx.save();
            ctx.lineWidth = 4;
            path.draw(ctx);
            ctx.restore();

            // Add click handler
            card.addEventListener('click', () => {
                this.selectedLevel = level;
                this.startGame();
            });
        });

        // Handle window resize for responsive canvas sizing
        window.addEventListener('resize', () => {
            this.updatePreviewCanvasSizes();
        });
    }

    drawPreviewGrid(ctx, width, height) {
        const gridSize = 40;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        for (let x = 0; x < width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let y = 0; y < height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    updatePreviewCanvasSizes() {
        const cards = this.levelSelect.querySelectorAll('.level-card');
        cards.forEach(card => {
            const preview = card.querySelector('.level-preview');
            const canvas = preview.querySelector('canvas');
            if (canvas) {
                // Maintain aspect ratio while fitting the preview container
                const rect = preview.getBoundingClientRect();
                canvas.style.width = rect.width + 'px';
                canvas.style.height = rect.height + 'px';
            }
        });
    }

    showScreen(screenName) {
        this.currentScreen = screenName;
        
        // Hide/show main screens
        this.splashScreen.style.display = screenName === 'splash' ? 'flex' : 'none';
        this.levelSelect.style.display = screenName === 'levelSelect' ? 'flex' : 'none';
        document.getElementById('gameCanvas').style.display = screenName === 'game' ? 'block' : 'none';
        
        // Handle side panels
        this.leftPanel.style.display = screenName === 'game' ? 'flex' : 'none';
        this.rightPanel.style.display = screenName === 'game' ? 'flex' : 'none';

        // Update preview sizes when showing level select
        if (screenName === 'levelSelect') {
            setTimeout(() => this.updatePreviewCanvasSizes(), 0);
        }
    }

    startGame() {
        if (!this.selectedLevel) return;
        
        // Hide menus and show game
        this.showScreen('game');
        
        // Initialize game with selected level
        this.game.initializeLevel(this.selectedLevel);
    }
} 