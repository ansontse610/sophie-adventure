// ─── Slime ───
// Green blob that patrols left-right. Stompable.

import { Monster } from './monster.js';
import { SLIME_SPEED, COLORS } from '../config.js';

export class Slime extends Monster {
    constructor(x, y, patrolRange = 100) {
        super(x, y, 24, 18, COLORS.slime, true);
        this.patrolRange = patrolRange;
        this.squishTimer = 0;
        this.scoreValue = 100;  // easiest monster
    }

    update(dt) {
        if (!this.isAlive) return;

        this.x += SLIME_SPEED * this.direction * dt;

        // Reverse at patrol boundaries
        if (this.x > this.originX + this.patrolRange) {
            this.direction = -1;
        } else if (this.x < this.originX - this.patrolRange) {
            this.direction = 1;
        }

        // Squish animation (bobbing)
        this.squishTimer += dt * 3;
    }

    draw(ctx, camera) {
        if (!this.isAlive) return;
        const sx = Math.round(this.x - camera.x);
        const sy = Math.round(this.y);
        const squish = Math.sin(this.squishTimer) * 2;

        // Body — rounded blob
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(
            sx + this.width / 2,
            sy + this.height / 2 + squish,
            this.width / 2,
            (this.height / 2) - squish,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        // Darker bottom
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(
            sx + this.width / 2,
            sy + this.height - 2 + squish,
            this.width / 2 - 2,
            4,
            0, 0, Math.PI * 2
        );
        ctx.fill();

        // Eyes
        ctx.fillStyle = COLORS.slimeEye;
        const eyeY = sy + this.height / 2 - 2 + squish;
        ctx.beginPath();
        ctx.arc(sx + 7, eyeY, 3, 0, Math.PI * 2);
        ctx.arc(sx + 17, eyeY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Pupils (look in movement direction)
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(sx + 7 + this.direction * 1, eyeY, 1.5, 0, Math.PI * 2);
        ctx.arc(sx + 17 + this.direction * 1, eyeY, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
}
