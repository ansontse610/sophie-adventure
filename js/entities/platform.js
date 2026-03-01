// ─── Platform ───
// Static ground and floating platforms.

import { Entity } from './entity.js';
import { COLORS } from '../config.js';

export class Platform extends Entity {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {boolean} isGround - if true uses ground colors
     */
    constructor(x, y, width, height = 24, isGround = false) {
        super(x, y, width, height, isGround ? COLORS.ground : COLORS.platform);
        this.isGround = isGround;
        this.topColor = isGround ? COLORS.groundTop : COLORS.platformTop;
    }

    draw(ctx, camera) {
        const sx = Math.round(this.x - camera.x);
        const sy = Math.round(this.y);

        // Main body
        ctx.fillStyle = this.color;
        ctx.fillRect(sx, sy, this.width, this.height);

        // Grass/top layer (4px tall)
        ctx.fillStyle = this.topColor;
        ctx.fillRect(sx, sy, this.width, 4);

        // Simple texture lines
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        for (let i = 8; i < this.height; i += 8) {
            ctx.beginPath();
            ctx.moveTo(sx, sy + i);
            ctx.lineTo(sx + this.width, sy + i);
            ctx.stroke();
        }
    }
}
