class Path {
    constructor() {
        this.points = [];
        this.segments = [];
    }

    addPoint(x, y) {
        this.points.push({ x, y });
        if (this.points.length > 1) {
            const start = this.points[this.points.length - 2];
            const end = this.points[this.points.length - 1];
            this.segments.push({ start, end });
        }
    }

    isPointTooClose(x, y, minDistance) {
        for (const segment of this.segments) {
            const distance = this.pointToLineDistance(x, y, segment.start, segment.end);
            if (distance < minDistance) {
                return true;
            }
        }
        return false;
    }

    pointToLineDistance(x, y, lineStart, lineEnd) {
        const A = x - lineStart.x;
        const B = y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = lineStart.x;
            yy = lineStart.y;
        } else if (param > 1) {
            xx = lineEnd.x;
            yy = lineEnd.y;
        } else {
            xx = lineStart.x + param * C;
            yy = lineStart.y + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;

        return Math.sqrt(dx * dx + dy * dy);
    }

    draw(ctx) {
        if (this.points.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);

        // Draw the main path
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 30;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();

        // Draw path border
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 32;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalCompositeOperation = 'destination-over';
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';

        // Draw direction arrows
        this.drawDirectionArrows(ctx);
    }

    drawDirectionArrows(ctx) {
        const arrowSpacing = 60; // Distance between arrows
        
        for (const segment of this.segments) {
            const dx = segment.end.x - segment.start.x;
            const dy = segment.end.y - segment.start.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const numArrows = Math.floor(length / arrowSpacing);
            
            if (numArrows > 0) {
                const spacing = length / numArrows;
                const angle = Math.atan2(dy, dx);
                
                for (let i = 0; i < numArrows; i++) {
                    const t = (i + 0.5) / numArrows;
                    const x = segment.start.x + dx * t;
                    const y = segment.start.y + dy * t;
                    
                    this.drawArrow(ctx, x, y, angle);
                }
            }
        }
    }

    drawArrow(ctx, x, y, angle) {
        const arrowSize = 10;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-arrowSize, -arrowSize/2);
        ctx.lineTo(-arrowSize, arrowSize/2);
        ctx.closePath();
        
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        ctx.restore();
    }
} 