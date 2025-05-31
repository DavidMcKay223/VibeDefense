class Level {
    constructor(name, difficulty, pathCreator, config = {}) {
        this.name = name;
        this.difficulty = difficulty;
        this.pathCreator = pathCreator;
        
        // Base wave configuration
        const baseConfig = {
            initialEnemyCount: 10,
            enemyCountIncrease: 2,
            spawnInterval: 1000,
            enemyHealth: 100,
            enemySpeed: 1,
            bossFrequency: 5 // Every X waves
        };

        // Apply difficulty modifiers
        switch (difficulty) {
            case 'easy':
                this.config = {
                    ...baseConfig,
                    initialEnemyCount: 8,
                    enemyCountIncrease: 1,
                    spawnInterval: 1200,
                    enemyHealth: 80,
                    enemySpeed: 0.8,
                    bossFrequency: 7
                };
                break;
            case 'medium':
                this.config = {
                    ...baseConfig
                    // Use base config as is for medium
                };
                break;
            case 'hard':
                this.config = {
                    ...baseConfig,
                    initialEnemyCount: 12,
                    enemyCountIncrease: 3,
                    spawnInterval: 800,
                    enemyHealth: 120,
                    enemySpeed: 1.2,
                    bossFrequency: 4
                };
                break;
            case 'expert':
                this.config = {
                    ...baseConfig,
                    initialEnemyCount: 15,
                    enemyCountIncrease: 4,
                    spawnInterval: 600,
                    enemyHealth: 200,
                    enemySpeed: 1.5,
                    bossFrequency: 3
                };
                break;
        }

        // Override with any custom config
        this.config = { ...this.config, ...config };
    }

    createPath(width, height) {
        return this.pathCreator(width, height);
    }

    getDifficultyColor() {
        switch (this.difficulty) {
            case 'easy': return '#27ae60';
            case 'medium': return '#f39c12';
            case 'hard': return '#c0392b';
            case 'expert': return '#8e44ad';
            default: return '#95a5a6';
        }
    }
}

// Path creation functions
function createSimplePath(width, height) {
    const path = new Path();
    const margin = height * 0.2;
    
    path.addPoint(0, height / 2);
    path.addPoint(width * 0.25, height / 2);
    path.addPoint(width * 0.25, margin);
    path.addPoint(width * 0.75, margin);
    path.addPoint(width * 0.75, height - margin);
    path.addPoint(width * 0.25, height - margin);
    path.addPoint(width * 0.25, height / 2);
    path.addPoint(width, height / 2);
    
    return path;
}

function createZigzagPath(width, height) {
    const path = new Path();
    const segments = 4;
    const segmentWidth = width / segments;
    
    path.addPoint(0, height * 0.2);
    for (let i = 0; i < segments; i++) {
        path.addPoint(segmentWidth * (i + 1), height * (i % 2 ? 0.2 : 0.8));
    }
    
    return path;
}

function createSpiralPath(width, height) {
    const path = new Path();
    const centerX = width / 2;
    const centerY = height / 2;
    const spiralSize = Math.min(width, height) * 0.4;
    const points = 50;
    
    path.addPoint(0, height / 2);
    
    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 4;
        const radius = (i / points) * spiralSize;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        path.addPoint(x, y);
    }
    
    path.addPoint(width, height / 2);
    
    return path;
}

function createMazePath(width, height) {
    const path = new Path();
    const margin = height * 0.15;
    const midY = height / 2;
    
    path.addPoint(0, midY);
    path.addPoint(width * 0.2, midY);
    path.addPoint(width * 0.2, margin);
    path.addPoint(width * 0.4, margin);
    path.addPoint(width * 0.4, height - margin);
    path.addPoint(width * 0.6, height - margin);
    path.addPoint(width * 0.6, margin);
    path.addPoint(width * 0.8, margin);
    path.addPoint(width * 0.8, height - margin);
    path.addPoint(width * 0.9, height - margin);
    path.addPoint(width * 0.9, midY);
    path.addPoint(width, midY);
    
    return path;
}

// Define available levels
const LEVELS = [
    new Level("Beginner's Path", 'easy', createSimplePath, {
        description: "A gentle introduction with a simple S-shaped path. Perfect for learning the basics.",
        enemyTypes: ['basic', 'speed'],
        reward: 1.2 // 20% bonus rewards
    }),
    
    new Level("Zigzag Challenge", 'medium', createZigzagPath, {
        description: "Test your skills with this zigzagging path that requires strategic tower placement.",
        enemyTypes: ['basic', 'speed', 'armored'],
        reward: 1.5 // 50% bonus rewards
    }),
    
    new Level("Spiral Madness", 'hard', createSpiralPath, {
        description: "A challenging spiral path that will test your tower positioning skills.",
        enemyTypes: ['basic', 'speed', 'armored', 'layered'],
        reward: 2.0 // 100% bonus rewards
    }),
    
    new Level("Maze Runner", 'expert', createMazePath, {
        description: "The ultimate challenge with a complex maze-like path and relentless enemies.",
        enemyTypes: ['basic', 'speed', 'armored', 'layered', 'boss'],
        reward: 3.0 // 200% bonus rewards
    })
]; 