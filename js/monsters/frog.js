// ─── Frog ───
// Blue frog that sits then jumps periodically. Stompable on ground, dangerous airborne.

import { Monster } from './monster.js';
import { FROG_SIT_TIME, FROG_JUMP_FORCE, GRAVITY, COLORS } from '../config.js';

export class Frog extends Monster {
    constructor(x, y) {
        super(x, y, 22, 18, COLORS.frog, true);
        this.sitTimer = 0;
        this.isJumping = false;
        this.groundY = y; // remember spawn ground level
        this.scoreValue = 300;  // tricky timing required
    }

    update(dt) {
        if (!this.isAlive) return;

        if (!this.isJumping) {
            // Sitting / waiting
            this.sitTimer += dt;
            if (this.sitTimer >= FROG_SIT_TIME) {
                this.sitTimer = 0;
                this.isJumping = true;
                this.velocityY = -FROG_JUMP_FORCE;
                this.velocityX = this.direction * 60; // small horizontal hop
                this.canBeStomped = false; // dangerous while airborne
            }
        } else {
            // Airborne
            this.velocityY += GRAVITY * dt;
            this.x += this.velocityX * dt;
            this.y += this.velocityY * dt;

            // Land back on ground
            if (this.y >= this.groundY) {
                this.y = this.groundY;
                this.velocityY = 0;
                this.velocityX = 0;
                this.isJumping = false;
                this.canBeStomped = true;
                this.direction *= -1; // face opposite after each jump
            }
        }
    }

    draw(ctx, camera) {
        if (!this.isAlive) return;
        const sx = Math.round(this.x - camera.x);
        const sy = Math.round(this.y);
        const cx = sx + this.width / 2;

        // Body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.ellipse(cx, sy + 12, 11, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(cx, sy + 5, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes (bulging on top)
        ctx.fillStyle = COLORS.frogEye;
        ctx.beginPath();
        ctx.arc(cx - 5, sy + 1, 4, 0, Math.PI * 2);
        ctx.arc(cx + 5, sy + 1, 4, 0, Math.PI * 2);
        ctx.fill();

        // Pupils
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(cx - 5, sy + 2, 2, 0, Math.PI * 2);
        ctx.arc(cx + 5, sy + 2, 2, 0, Math.PI * 2);
        ctx.fill();

        // Legs (tucked when sitting, extended when jumping)
        ctx.fillStyle = this.color;
        if (this.isJumping) {
            // Extended back legs
            ctx.fillRect(sx, sy + 14, 5, 8);
            ctx.fillRect(sx + this.width - 5, sy + 14, 5, 8);
        } else {
            // Tucked legs
            ctx.beginPath();
            ctx.ellipse(sx + 3, sy + 16, 4, 3, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(sx + this.width - 3, sy + 16, 4, 3, 0.3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Danger indicator when airborne — red tint
        if (this.isJumping) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(cx, sy + 10, 14, 12, 0, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
