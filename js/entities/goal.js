// ─── Goal (finish flag) ───
import { Entity } from './entity.js';
import { COLORS } from '../config.js';

export class Goal extends Entity {
    constructor(x, y) {
        // Tall thin rectangle as a flagpole
        super(x, y, 20, 60, COLORS.goal);
        this.starAngle = 0;
    }

    update(dt) {
        this.starAngle += dt * 2; // gentle rotation for sparkle
    }

    draw(ctx, camera) {
        const sx = Math.round(this.x - camera.x);
        const sy = Math.round(this.y);

        // Pole
        ctx.fillStyle = '#AAA';
        ctx.fillRect(sx + 8, sy, 4, this.height);

        // Flag
        ctx.fillStyle = COLORS.goal;
        ctx.beginPath();
        ctx.moveTo(sx + 12, sy);
        ctx.lineTo(sx + 32, sy + 10);
        ctx.lineTo(sx + 12, sy + 20);
        ctx.closePath();
        ctx.fill();

        // Star on top
        this.drawStar(ctx, sx + 10, sy - 6, 5, 8, 4);

        // Sparkle glow
        ctx.fillStyle = `rgba(255, 247, 0, ${0.3 + Math.sin(this.starAngle) * 0.2})`;
        ctx.beginPath();
        ctx.arc(sx + 10, sy - 6, 12, 0, Math.PI * 2);
        ctx.fill();
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        ctx.fillStyle = COLORS.goalStar;
        ctx.beginPath();
        let rot = (Math.PI / 2) * 3;
        const step = Math.PI / spikes;
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(
                cx + Math.cos(rot) * outerRadius,
                cy + Math.sin(rot) * outerRadius
            );
            rot += step;
            ctx.lineTo(
                cx + Math.cos(rot) * innerRadius,
                cy + Math.sin(rot) * innerRadius
            );
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
}
