class Path {
    constructor(canvas) {
        this.canvas = canvas;
        this.points = [];
        this.pathWidth = 30; // Width of the path
        this.generatePath();
    }

    generatePath() {
        const numPoints = 4; // Number of points in the path
        const margin = 40; // Reduced margin from edges
        
        // Start point (always on the left side)
        const startY = Math.random() * (this.canvas.height - 2 * margin) + margin;
        this.points.push({ x: margin, y: startY });

        // Generate middle points
        for (let i = 0; i < numPoints - 2; i++) {
            const x = margin + ((i + 1) * (this.canvas.width - 2 * margin) / (numPoints - 1));
            const y = Math.random() * (this.canvas.height - 2 * margin) + margin;
            this.points.push({ x, y });
        }

        // End point (always on the right side)
        const endY = Math.random() * (this.canvas.height - 2 * margin) + margin;
        this.points.push({ x: this.canvas.width - margin, y: endY });
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        // Draw path
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        // Style the path
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = this.pathWidth;
        ctx.stroke();
        
        // Draw points for visual reference
        ctx.fillStyle = '#654321';
        this.points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    isPointNearPath(x, y) {
        const threshold = this.pathWidth + 10; // Slightly larger than path width for better placement
        
        // Check if point is too close to canvas edges
        const edgeMargin = 20;
        if (x < edgeMargin || x > this.canvas.width - edgeMargin ||
            y < edgeMargin || y > this.canvas.height - edgeMargin) {
            return true;
        }

        // Check distance to each path segment
        for (let i = 0; i < this.points.length - 1; i++) {
            const p1 = this.points[i];
            const p2 = this.points[i + 1];
            
            const distance = this.distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
            if (distance < threshold) {
                return true;
            }
        }
        return false;
    }

    distanceToLineSegment(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;

        return Math.sqrt(dx * dx + dy * dy);
    }
} 