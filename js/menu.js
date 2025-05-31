class GameMenu {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'splash';
        this.setupMenus();
    }

    setupMenus() {
        // Set up splash screen
        const startGameBtn = document.getElementById('startGameBtn');
        if (startGameBtn) {
            startGameBtn.onclick = () => this.showScreen('levelSelect');
        }

        // Set up level select screen
        const levelGrid = document.querySelector('.level-grid');
        if (levelGrid) {
            levelGrid.innerHTML = ''; // Clear existing content
            
            // Create level cards
            LEVELS.forEach((level, index) => {
                const card = document.createElement('div');
                card.className = 'level-card';
                card.innerHTML = `
                    <div class="level-preview">
                        <canvas width="200" height="150"></canvas>
                    </div>
                    <h3>${level.name}</h3>
                    <span class="difficulty ${level.difficulty.toLowerCase()}">${level.difficulty}</span>
                    <p>${level.description}</p>
                `;

                // Draw path preview
                const canvas = card.querySelector('canvas');
                const ctx = canvas.getContext('2d');
                const path = level.createPath(canvas.width, canvas.height);
                
                // Draw background
                ctx.fillStyle = '#90EE90';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Draw path
                ctx.strokeStyle = level.getDifficultyColor();
                ctx.lineWidth = 3;
                ctx.beginPath();
                path.points.forEach((point, i) => {
                    if (i === 0) {
                        ctx.moveTo(point.x, point.y);
                    } else {
                        ctx.lineTo(point.x, point.y);
                    }
                });
                ctx.stroke();

                // Add click handler
                card.onclick = () => {
                    this.startLevel(level);
                };

                levelGrid.appendChild(card);
            });
        }
    }

    showScreen(screenId) {
        // Hide all screens
        const screens = ['splashScreen', 'levelSelect', 'gameCanvas', 'leftPanel', 'rightPanel'];
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
                break;
        }

        this.currentScreen = screenId;
    }

    startLevel(level) {
        this.showScreen('game');
        this.game.initializeLevel(level);
    }
} 