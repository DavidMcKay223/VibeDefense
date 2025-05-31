class Level {
    constructor(name, difficulty, pathCreator, waveConfig = {}) {
        this.name = name;
        this.difficulty = difficulty;
        this.pathCreator = pathCreator;
        this.waveConfig = {
            initialEnemyCount: 10,
            enemyHealthMultiplier: 1,
            spawnRateMultiplier: 1,
            bossFrequency: 5,
            ...waveConfig
        };
    }

    createPath(width, height) {
        return this.pathCreator(width, height);
    }
}

const Levels = {
    BEGINNER: new Level(
        "Beginner's Path",
        "Easy",
        (width, height) => {
            const path = new Path();
            // Simple S-shaped path
            path.addPoint(0, height / 2);
            path.addPoint(width / 4, height / 2);
            path.addPoint(width / 4, height / 4);
            path.addPoint(width * 3/4, height / 4);
            path.addPoint(width * 3/4, height * 3/4);
            path.addPoint(width, height * 3/4);
            return path;
        },
        {
            initialEnemyCount: 8,
            enemyHealthMultiplier: 0.8,
            spawnRateMultiplier: 0.8,
            bossFrequency: 6
        }
    ),

    ZIGZAG: new Level(
        "Zigzag Challenge",
        "Medium",
        (width, height) => {
            const path = new Path();
            const segments = 5;
            const segmentWidth = width / segments;
            let y = height / 6;
            
            path.addPoint(0, y);
            for (let i = 0; i < segments; i++) {
                y = i % 2 === 0 ? height * 5/6 : height / 6;
                path.addPoint(segmentWidth * (i + 1), y);
            }
            return path;
        },
        {
            initialEnemyCount: 12,
            enemyHealthMultiplier: 1.2,
            spawnRateMultiplier: 1.2,
            bossFrequency: 4
        }
    ),

    SPIRAL: new Level(
        "Spiral Madness",
        "Hard",
        (width, height) => {
            const path = new Path();
            const centerX = width / 2;
            const centerY = height / 2;
            const spiralPoints = 24;
            const maxRadius = Math.min(width, height) * 0.4;
            
            path.addPoint(0, height / 2);
            path.addPoint(width * 0.1, height / 2);
            
            for (let i = 0; i < spiralPoints; i++) {
                const angle = (i / spiralPoints) * Math.PI * 2;
                const radius = maxRadius * (1 - i / spiralPoints);
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                path.addPoint(x, y);
            }
            
            path.addPoint(centerX, centerY);
            path.addPoint(width, centerY);
            return path;
        },
        {
            initialEnemyCount: 15,
            enemyHealthMultiplier: 1.5,
            spawnRateMultiplier: 1.5,
            bossFrequency: 3
        }
    ),

    MAZE: new Level(
        "Maze Runner",
        "Expert",
        (width, height) => {
            const path = new Path();
            const margin = 50;
            const rows = 4;
            const rowHeight = (height - margin * 2) / rows;
            
            path.addPoint(0, margin);
            path.addPoint(width - margin, margin);
            
            for (let i = 0; i < rows; i++) {
                const y = margin + rowHeight * (i + 1);
                if (i % 2 === 0) {
                    path.addPoint(width - margin, y);
                    path.addPoint(margin, y);
                } else {
                    path.addPoint(margin, y);
                    path.addPoint(width - margin, y);
                }
            }
            
            path.addPoint(width - margin, height - margin);
            path.addPoint(width, height - margin);
            return path;
        },
        {
            initialEnemyCount: 20,
            enemyHealthMultiplier: 2,
            spawnRateMultiplier: 2,
            bossFrequency: 2
        }
    )
}; 