class Tower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.range = 100;
        this.color = '#4A90E2';
    }

    draw(ctx) {
        // Draw tower base
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.x - this.size / 2,
            this.y - this.size / 2,
            this.size,
            this.size
        );

        // Draw range circle (only when selected or placing)
        if (Tower.isPlacing || this === Tower.selectedTower) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.range, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(74, 144, 226, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.fillStyle = 'rgba(74, 144, 226, 0.1)';
            ctx.fill();
        }
    }

    // Static properties for tower placement
    static isPlacing = false;
    static selectedTower = null;
    static placementTower = null;
} 