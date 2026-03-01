// ─── Bat ───
// Flying purple diamond that oscillates vertically. Stompable.

import { Monster } from './monster.js';
import { BAT_SPEED, BAT_WAVE_AMP, BAT_WAVE_FREQ, COLORS } from '../config.js';

export class Bat extends Monster {
    constructor(x, y, patrolRange = 120) {
        super(x, y, 22, 16, COLORS.bat, true);
        this.patrolRange = patrolRange;
        this.waveTimer = 0;
        this.wingTimer = 0;
        this.scoreValue = 200;  // harder to stomp while flying
    }

    update(dt) {
        if (!this.isAlive) return;

        // Horizontal patrol
        this.x += BAT_SPEED * this.direction * dt;
        if (this.x > this.originX + this.patrolRange) this.direction = -1;
        else if (this.x < this.originX - this.patrolRange) this.direction = 1;

        // Vertical sine wave
        this.waveTimer += dt * BAT_WAVE_FREQ * Math.PI * 2;
        this.y = this.originY + Math.sin(this.waveTimer) * BAT_WAVE_AMP;

        // Wing flap timer
        this.wingTimer += dt * 12;
    }

    draw(ctx, camera) {
        if (!this.isAlive) return;
        const sx = Math.round(this.x - camera.x);
        const sy = Math.round(this.y);
        const cx = sx + this.width / 2;
        const cy = sy + this.height / 2;
        const wingFlap = Math.sin(this.wingTimer) * 6;

        // Wings
        ctx.fillStyle = COLORS.batWing;
        // Left wing
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy);
        ctx.quadraticCurveTo(cx - 16, cy - 8 - wingFlap, cx - 12, cy + 4);
        ctx.closePath();
        ctx.fill();
        // Right wing
        ctx.beginPath();
        ctx.moveTo(cx + 4, cy);
        ctx.quadraticCurveTo(cx + 16, cy - 8 - wingFlap, cx + 12, cy + 4);
        ctx.closePath();
        ctx.fill();

        // Body (diamond / oval)
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 6, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 2, 2, 0, Math.PI * 2);
        ctx.arc(cx + 3, cy - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Red pupils
        ctx.fillStyle = '#F00';
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 2, 1, 0, Math.PI * 2);
        ctx.arc(cx + 3, cy - 2, 1, 0, Math.PI * 2);
        ctx.fill();
    }
}
