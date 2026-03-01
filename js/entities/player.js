// ─── Player: Sophie ───
import { Entity } from './entity.js';
import {
    PLAYER_SPEED, PLAYER_JUMP_FORCE, PLAYER_STOMP_BOUNCE,
    PLAYER_WIDTH, PLAYER_HEIGHT, PLAYER_LIVES,
    INVINCIBLE_DURATION, COLORS, CANVAS_HEIGHT,
} from '../config.js';
import { applyGravity } from '../engine/physics.js';

export class Player extends Entity {
    constructor(x, y) {
        super(x, y, PLAYER_WIDTH, PLAYER_HEIGHT, COLORS.player.body);
        this.lives = PLAYER_LIVES;
        this.invincibleTimer = 0;
        this.facing = 1; // 1 = right, -1 = left
        this.animTimer = 0; // leg animation
        this.isWalking = false;
    }

    update(dt, input) {
        // ── Horizontal movement ──
        this.velocityX = 0;
        this.isWalking = false;

        if (input.isDown('ArrowLeft')) {
            this.velocityX = -PLAYER_SPEED;
            this.facing = -1;
            this.isWalking = true;
        }
        if (input.isDown('ArrowRight')) {
            this.velocityX = PLAYER_SPEED;
            this.facing = 1;
            this.isWalking = true;
        }

        // ── Jump ──
        if (input.justPressed(' ') && this.grounded) {
            this.velocityY = -PLAYER_JUMP_FORCE;
            this.grounded = false;
        }

        // ── Physics ──
        applyGravity(this, dt);

        // Store previous Y for platform resolution
        this.prevY = this.y;

        this.x += this.velocityX * dt;
        this.y += this.velocityY * dt;

        // Don't go left of stage start
        if (this.x < 0) this.x = 0;

        // Fall off screen → lose life
        if (this.y > CANVAS_HEIGHT + 50) {
            this.loseLife();
        }

        // Invincibility countdown
        if (this.invincibleTimer > 0) {
            this.invincibleTimer -= dt;
        }

        // Leg animation timer
        if (this.isWalking) {
            this.animTimer += dt * 8;
        } else {
            this.animTimer = 0;
        }
    }

    /** Called when Sophie stomps a monster */
    stomp() {
        this.velocityY = -PLAYER_STOMP_BOUNCE;
    }

    /** Take damage (called on side collision with monster) */
    hit() {
        if (this.invincibleTimer > 0) return; // still invincible
        this.loseLife();
    }

    loseLife() {
        this.lives--;
        this.invincibleTimer = INVINCIBLE_DURATION;
        // Reset position to a safe spot (handled by Game)
        this.velocityY = -PLAYER_JUMP_FORCE * 0.5;
    }

    get isInvincible() {
        return this.invincibleTimer > 0;
    }

    // ─── Draw Sophie as a simple character ───
    draw(ctx, camera) {
        if (!this.isAlive) return;

        const sx = Math.round(this.x - camera.x);
        const sy = Math.round(this.y);

        // Blink when invincible
        if (this.isInvincible && Math.floor(this.invincibleTimer * 10) % 2 === 0) {
            return; // skip drawing this frame → blink effect
        }

        const f = this.facing;
        const cx = sx + this.width / 2; // center X

        // ── Legs ──
        const legSwing = this.isWalking ? Math.sin(this.animTimer) * 4 : 0;
        ctx.fillStyle = COLORS.player.legs;
        // Left leg
        ctx.fillRect(cx - 8, sy + 28, 5, 10 + legSwing);
        // Right leg
        ctx.fillRect(cx + 3, sy + 28, 5, 10 - legSwing);

        // ── Shoes ──
        ctx.fillStyle = COLORS.player.shoes;
        ctx.fillRect(cx - 9, sy + 36 + legSwing, 7, 4);
        ctx.fillRect(cx + 2, sy + 36 - legSwing, 7, 4);

        // ── Body (dress) ──
        ctx.fillStyle = COLORS.player.skirt;
        ctx.fillRect(cx - 10, sy + 14, 20, 16);
        // Dress triangle flare
        ctx.beginPath();
        ctx.moveTo(cx - 10, sy + 22);
        ctx.lineTo(cx - 13, sy + 30);
        ctx.lineTo(cx + 13, sy + 30);
        ctx.lineTo(cx + 10, sy + 22);
        ctx.closePath();
        ctx.fill();

        // ── Head ──
        ctx.fillStyle = COLORS.player.head;
        ctx.beginPath();
        ctx.arc(cx, sy + 9, 9, 0, Math.PI * 2);
        ctx.fill();

        // ── Hair ──
        ctx.fillStyle = COLORS.player.hair;
        ctx.beginPath();
        ctx.arc(cx, sy + 6, 9, Math.PI, Math.PI * 2);
        ctx.fill();
        // Side hair
        ctx.fillRect(cx + (f === 1 ? -10 : 5), sy + 4, 5, 10);

        // ── Hair bow ──
        ctx.fillStyle = COLORS.player.bow;
        const bowX = cx + f * 6;
        const bowY = sy + 3;
        ctx.beginPath();
        ctx.moveTo(bowX, bowY);
        ctx.lineTo(bowX + f * 5, bowY - 3);
        ctx.lineTo(bowX + f * 2, bowY);
        ctx.lineTo(bowX + f * 5, bowY + 3);
        ctx.closePath();
        ctx.fill();

        // ── Eyes ──
        ctx.fillStyle = COLORS.player.eyes;
        const eyeX = cx + f * 3;
        ctx.beginPath();
        ctx.arc(eyeX, sy + 10, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // ── Smile ──
        ctx.strokeStyle = COLORS.player.eyes;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx + f * 2, sy + 13, 3, 0.1, Math.PI - 0.1);
        ctx.stroke();
    }
}
