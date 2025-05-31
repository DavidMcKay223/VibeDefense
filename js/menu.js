class GameMenu {
    constructor(game) {
        this.game = game;
        this.currentScreen = 'splash';
        console.log('GameMenu initialized');
        this.setupMenu();
        
        // Bind methods to ensure proper 'this' context
        this.showScreen = this.showScreen.bind(this);
        this.startLevel = this.startLevel.bind(this);
    }

    startLevel(level) {
        console.log('Starting level:', level.name);
        this.showScreen('game');
        this.game.initializeLevel(level);
    }

    setupMenu() {
        console.log('Setting up menu');
        
        // First, ensure we have a game container
        const gameContainer = document.getElementById('gameContainer');
        if (!gameContainer) {
            console.error('Game container not found! Menu setup failed.');
            return;
        }
        console.log('Found game container:', gameContainer);
        
        // Create splash screen if it doesn't exist
        if (!document.getElementById('splashScreen')) {
            console.log('Creating splash screen');
            const splashScreen = document.createElement('div');
            splashScreen.id = 'splashScreen';
            splashScreen.className = 'menu-screen';
            splashScreen.innerHTML = `
                <h1>Vibe Defense</h1>
                <button id="startGameBtn" class="game-button">Start Game</button>
            `;
            gameContainer.appendChild(splashScreen);
            console.log('Splash screen added to DOM');

            // Add click handler to start button using addEventListener
            const startButton = document.getElementById('startGameBtn');
            console.log('Start button element:', startButton);
            
            if (startButton) {
                startButton.addEventListener('click', (e) => {
                    console.log('Start Game button clicked - Event:', e);
                    console.log('Button that was clicked:', e.target);
                    console.log('Current screen before transition:', this.currentScreen);
                    this.showScreen('levelSelect');
                });
                console.log('Click event listener added to start button');
            } else {
                console.error('Failed to find start button element!');
            }
        } else {
            console.log('Splash screen already exists');
            // Add click handler even if splash screen already exists
            const startButton = document.getElementById('startGameBtn');
            console.log('Found existing start button:', startButton);
            
            if (startButton) {
                // Remove any existing click listeners to prevent duplicates
                const newButton = startButton.cloneNode(true);
                startButton.parentNode.replaceChild(newButton, startButton);
                console.log('Replaced start button to clear old listeners');
                
                newButton.addEventListener('click', (e) => {
                    console.log('Start Game button clicked (existing button) - Event:', e);
                    console.log('Button that was clicked:', e.target);
                    console.log('Current screen before transition:', this.currentScreen);
                    this.showScreen('levelSelect');
                });
                console.log('Click event listener added to existing start button');
            } else {
                console.error('Failed to find existing start button!');
            }
        }

        // Create level select screen if it doesn't exist
        if (!document.getElementById('levelSelect')) {
            console.log('Creating level select screen');
            const levelSelect = document.createElement('div');
            levelSelect.id = 'levelSelect';
            levelSelect.className = 'menu-screen';
            levelSelect.style.display = 'none';
            
            // Create level cards
            console.log('LEVELS array:', LEVELS);
            if (!LEVELS || !Array.isArray(LEVELS)) {
                console.error('LEVELS is not properly defined:', LEVELS);
                return;
            }
            
            console.log('Creating level cards for', LEVELS.length, 'levels');
            const levelGrid = document.createElement('div');
            levelGrid.className = 'level-grid';
            
            LEVELS.forEach((level, index) => {
                console.log('Creating card for level:', level.name);
                const card = document.createElement('div');
                card.className = 'level-card';
                card.setAttribute('data-level', index);
                
                const preview = document.createElement('div');
                preview.className = 'level-preview';
                
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 150;
                canvas.style.width = '100%';
                canvas.style.height = '100%';
                preview.appendChild(canvas);
                
                const title = document.createElement('h3');
                title.textContent = level.name;
                
                const difficulty = document.createElement('span');
                difficulty.className = `difficulty ${level.difficulty}`;
                difficulty.textContent = level.difficulty;
                
                const description = document.createElement('p');
                description.textContent = level.config.description || '';
                
                card.appendChild(preview);
                card.appendChild(title);
                card.appendChild(difficulty);
                card.appendChild(description);
                
                // Draw path preview
                try {
                    console.log('Drawing preview for level:', level.name);
                    const path = level.createPath(canvas.width, canvas.height);
                    const ctx = canvas.getContext('2d');
                    
                    // Clear canvas and draw background
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#90EE90';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // Scale path drawing
                    ctx.save();
                    ctx.scale(1, 1); // Ensure proper scaling
                    
                    // Draw path
                    path.draw(ctx);
                    
                    ctx.restore();
                    console.log('Path preview drawn for level:', level.name);
                } catch (error) {
                    console.error('Error drawing path preview for level', level.name, ':', error);
                }
                
                // Add click handler
                card.addEventListener('click', () => {
                    console.log('Level card clicked:', level.name);
                    this.startLevel(level);
                });
                
                levelGrid.appendChild(card);
                console.log('Card added for level:', level.name);
            });
            
            levelSelect.innerHTML = '<h2>Select Level</h2>';
            levelSelect.appendChild(levelGrid);
            
            gameContainer.appendChild(levelSelect);
            console.log('Level select screen created and added to DOM');
        } else {
            console.log('Level select screen already exists');
            // Re-create level cards if they don't exist
            const levelGrid = document.querySelector('#levelSelect .level-grid');
            if (!levelGrid || levelGrid.children.length === 0) {
                console.log('Level grid is empty, recreating level cards');
                const newLevelGrid = document.createElement('div');
                newLevelGrid.className = 'level-grid';
                
                LEVELS.forEach((level, index) => {
                    console.log('Recreating card for level:', level.name);
                    const card = document.createElement('div');
                    card.className = 'level-card';
                    card.setAttribute('data-level', index);
                    
                    const preview = document.createElement('div');
                    preview.className = 'level-preview';
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = 200;
                    canvas.height = 150;
                    canvas.style.width = '100%';
                    canvas.style.height = '100%';
                    preview.appendChild(canvas);
                    
                    const title = document.createElement('h3');
                    title.textContent = level.name;
                    
                    const difficulty = document.createElement('span');
                    difficulty.className = `difficulty ${level.difficulty}`;
                    difficulty.textContent = level.difficulty;
                    
                    const description = document.createElement('p');
                    description.textContent = level.config.description || '';
                    
                    card.appendChild(preview);
                    card.appendChild(title);
                    card.appendChild(difficulty);
                    card.appendChild(description);
                    
                    // Draw path preview
                    try {
                        console.log('Drawing preview for level:', level.name);
                        const path = level.createPath(canvas.width, canvas.height);
                        const ctx = canvas.getContext('2d');
                        
                        // Clear canvas and draw background
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.fillStyle = '#90EE90';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        
                        // Scale path drawing
                        ctx.save();
                        ctx.scale(1, 1); // Ensure proper scaling
                        
                        // Draw path
                        path.draw(ctx);
                        
                        ctx.restore();
                        console.log('Path preview drawn for level:', level.name);
                    } catch (error) {
                        console.error('Error drawing path preview for level', level.name, ':', error);
                    }
                    
                    // Add click handler
                    card.addEventListener('click', () => {
                        console.log('Level card clicked:', level.name);
                        this.startLevel(level);
                    });
                    
                    newLevelGrid.appendChild(card);
                    console.log('Card recreated for level:', level.name);
                });
                
                // Replace old grid with new one
                const oldGrid = document.querySelector('#levelSelect .level-grid');
                if (oldGrid) {
                    oldGrid.parentNode.replaceChild(newLevelGrid, oldGrid);
                } else {
                    const levelSelect = document.getElementById('levelSelect');
                    if (levelSelect) {
                        levelSelect.appendChild(newLevelGrid);
                    }
                }
                console.log('Level grid recreated and added to DOM');
            }
        }

        // Show splash screen initially
        console.log('Attempting to show initial splash screen');
        this.showScreen('splash');
    }

    showScreen(screenId) {
        console.log('showScreen called with:', screenId);
        console.log('Current screen before change:', this.currentScreen);
        
        // Hide all screens
        const screens = ['splashScreen', 'levelSelect', 'gameCanvas', 'leftPanel', 'rightPanel', 'shopPanel'];
        screens.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                console.log(`Hiding screen: ${id}, current display:`, element.style.display);
                element.style.display = 'none';
            } else {
                console.log(`Screen element not found: ${id}`);
            }
        });

        // Show requested screen
        let targetScreen;
        switch (screenId) {
            case 'splash':
                targetScreen = document.getElementById('splashScreen');
                console.log('Looking for splashScreen element:', targetScreen);
                break;
            case 'levelSelect':
                targetScreen = document.getElementById('levelSelect');
                console.log('Looking for levelSelect element:', targetScreen);
                break;
            case 'game':
                targetScreen = document.getElementById('gameCanvas');
                console.log('Looking for gameCanvas element:', targetScreen);
                break;
            default:
                console.error(`Unknown screen ID: ${screenId}`);
                return;
        }

        if (targetScreen) {
            console.log(`Showing screen: ${screenId}, element:`, targetScreen);
            targetScreen.style.display = 'flex';
            
            // Show additional panels for game screen
            if (screenId === 'game') {
                console.log('Setting up game screen panels');
                targetScreen.style.display = 'block';
                const leftPanel = document.getElementById('leftPanel');
                const rightPanel = document.getElementById('rightPanel');
                const shopPanel = document.getElementById('shopPanel');
                
                console.log('Game panels found:', {
                    leftPanel: !!leftPanel,
                    rightPanel: !!rightPanel,
                    shopPanel: !!shopPanel
                });
                
                if (leftPanel) leftPanel.style.display = 'flex';
                if (rightPanel) rightPanel.style.display = 'flex';
                if (shopPanel) shopPanel.style.display = 'block';
            }
            
            this.currentScreen = screenId;
            console.log('Screen transition complete. Current screen:', this.currentScreen);
        } else {
            console.error(`Screen not found: ${screenId}`);
            console.log('DOM at time of error:', {
                splashScreen: document.getElementById('splashScreen'),
                levelSelect: document.getElementById('levelSelect'),
                gameCanvas: document.getElementById('gameCanvas')
            });
        }
    }
} 