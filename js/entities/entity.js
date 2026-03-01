// ─── Base Entity ───
// All game objects extend this.

export class Entity {
    constructor(x, y, width, height, color = '#FFF') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.velocityX = 0;
        this.velocityY = 0;
        this.grounded = false;
        this.isAlive = true;
    }

    /** Override in subclasses */
    update(dt, input) {}

    /** Default: draw a filled rectangle */
    draw(ctx, camera) {
        if (!this.isAlive) return;
        ctx.fillStyle = this.color;
        ctx.fillRect(
            Math.round(this.x - camera.x),
            Math.round(this.y),
            this.width,
            this.height
        );
    }

    /** Bounding box (world coords) — useful for external collision checks */
    get bounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        };
    }
}
