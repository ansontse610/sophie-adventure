// ─── Spiky ───
// Red spiked ball that rolls fast along the ground. NOT stompable.

import { Monster } from './monster.js';
import { SPIKY_SPEED, COLORS } from '../config.js';

export class Spiky extends Monster {
    constructor(x, y, patrolRange = 150) {
        super(x, y, 22, 22, COLORS.spiky, false); // canBeStomped = false
        this.patrolRange = patrolRange;
        this.angle = 0;
        this.scoreValue = 500;  // most dangerous (un-stompable)
    }

    update(dt) {
        if (!this.isAlive) return;

        this.x += SPIKY_SPEED * this.direction * dt;
        this.angle += dt * 6 * this.direction; // spinning

        if (this.x > this.originX + this.patrolRange) this.direction = -1;
        else if (this.x < this.originX - this.patrolRange) this.direction = 1;
    }

    draw(ctx, camera) {
        if (!this.isAlive) return;
        const sx = Math.round(this.x - camera.x);
        const sy = Math.round(this.y);
        const cx = sx + this.width / 2;
        const cy = sy + this.height / 2;
        const r = this.width / 2;

        // Spikes
        const numSpikes = 8;
        ctx.fillStyle = COLORS.spikySpike;
        for (let i = 0; i < numSpikes; i++) {
            const a = this.angle + (i / numSpikes) * Math.PI * 2;
            const tipX = cx + Math.cos(a) * (r + 6);
            const tipY = cy + Math.sin(a) * (r + 6);
            const baseL = a + 0.3;
            const baseR = a - 0.3;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(cx + Math.cos(baseL) * r, cy + Math.sin(baseL) * r);
            ctx.lineTo(cx + Math.cos(baseR) * r, cy + Math.sin(baseR) * r);
            ctx.closePath();
            ctx.fill();
        }

        // Core ball
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        // Angry eyes
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 2, 3, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy - 2, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(cx - 4, cy - 1, 1.5, 0, Math.PI * 2);
        ctx.arc(cx + 4, cy - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Angry eyebrows
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 7, cy - 6);
        ctx.lineTo(cx - 2, cy - 4);
        ctx.moveTo(cx + 7, cy - 6);
        ctx.lineTo(cx + 2, cy - 4);
        ctx.stroke();
    }
}
