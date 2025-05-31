class Path {
    constructor(canvas) {
        this.canvas = canvas;
        this.points = [];
        this.pathWidth = 30; // Width of the path
        this.generatePath();
    }

    generatePath() {
        const margin = 40;
        const segmentWidth = (this.canvas.width - margin * 2) / 3;
        const verticalSegments = 4;
        const segmentHeight = (this.canvas.height - margin * 2) / verticalSegments;

        // Start at top-left
        this.points.push({ 
            x: margin, 
            y: margin 
        });

        // Create zig-zag pattern
        for (let i = 0; i < verticalSegments; i++) {
            // If on even segment, go right then down
            if (i % 2 === 0) {
                // Go right
                this.points.push({
                    x: this.canvas.width - margin,
                    y: margin + i * segmentHeight
                });
                // Go down
                if (i < verticalSegments - 1) {
                    this.points.push({
                        x: this.canvas.width - margin,
                        y: margin + (i + 1) * segmentHeight
                    });
                }
            } else {
                // Go left
                this.points.push({
                    x: margin,
                    y: margin + i * segmentHeight
                });
                // Go down
                if (i < verticalSegments - 1) {
                    this.points.push({
                        x: margin,
                        y: margin + (i + 1) * segmentHeight
                    });
                }
            }
        }

        // Add some curves to make it more interesting
        this.smoothPath();
    }

    smoothPath() {
        const smoothedPoints = [];
        
        // Keep first point
        smoothedPoints.push(this.points[0]);

        // Add control points between each pair of points
        for (let i = 0; i < this.points.length - 1; i++) {
            const current = this.points[i];
            const next = this.points[i + 1];
            
            // Add several points between each pair to create smoother path
            const steps = 5;
            for (let j = 1; j <= steps; j++) {
                const t = j / (steps + 1);
                smoothedPoints.push({
                    x: current.x + (next.x - current.x) * t,
                    y: current.y + (next.y - current.y) * t
                });
            }
        }

        // Keep last point
        smoothedPoints.push(this.points[this.points.length - 1]);
        
        this.points = smoothedPoints;
    }

    draw(ctx) {
        // Draw path background for better visibility
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = this.pathWidth + 4;
        ctx.stroke();

        // Draw main path
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        
        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = this.pathWidth;
        ctx.stroke();

        // Draw direction arrows
        this.drawDirectionArrows(ctx);
    }

    drawDirectionArrows(ctx) {
        const arrowSpacing = 100; // Space between arrows
        let distanceTraveled = 0;
        
        for (let i = 0; i < this.points.length - 1; i++) {
            const start = this.points[i];
            const end = this.points[i + 1];
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const segmentLength = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            while (distanceTraveled < segmentLength) {
                const t = distanceTraveled / segmentLength;
                const x = start.x + dx * t;
                const y = start.y + dy * t;

                // Draw arrow
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle);
                
                ctx.beginPath();
                ctx.moveTo(-10, -5);
                ctx.lineTo(0, 0);
                ctx.lineTo(-10, 5);
                
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3;
                ctx.stroke();
                
                ctx.restore();

                distanceTraveled += arrowSpacing;
            }
            
            distanceTraveled -= segmentLength;
        }
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