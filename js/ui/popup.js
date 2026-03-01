// ─── Birthday Popup + Balloon Animation ───
// Triggered when Sophie reaches the goal.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';

export class Popup {
    constructor() {
        this.active = false;
        this.timer = 0;
        this.balloonY = CANVAS_HEIGHT + 60; // starts below screen
        this.balloonTargetY = 180;
        this.confetti = [];
        this.textScale = 0;
    }

    /** Call once when the player wins */
    show() {
        this.active = true;
        this.timer = 0;
        this.balloonY = CANVAS_HEIGHT + 60;
        this.textScale = 0;

        // Generate confetti particles
        this.confetti = [];
        for (let i = 0; i < 60; i++) {
            this.confetti.push({
                x: Math.random() * CANVAS_WIDTH,
                y: Math.random() * -CANVAS_HEIGHT,
                vx: (Math.random() - 0.5) * 100,
                vy: Math.random() * 120 + 40,
                size: Math.random() * 6 + 3,
                color: ['#FF69B4', '#FFD700', '#FF6347', '#00CED1', '#9370DB', '#32CD32', '#FF1493'][
                    Math.floor(Math.random() * 7)
                ],
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 6,
            });
        }
    }

    update(dt) {
        if (!this.active) return;
        this.timer += dt;

        // Balloon rises smoothly
        if (this.balloonY > this.balloonTargetY) {
            this.balloonY -= 100 * dt;
            if (this.balloonY < this.balloonTargetY) {
                this.balloonY = this.balloonTargetY;
            }
        }

        // Text scale-in
        if (this.textScale < 1) {
            this.textScale += dt * 2;
            if (this.textScale > 1) this.textScale = 1;
        }

        // Confetti
        for (const c of this.confetti) {
            c.x += c.vx * dt;
            c.y += c.vy * dt;
            c.rotation += c.rotSpeed * dt;
            // Loop confetti that falls off screen
            if (c.y > CANVAS_HEIGHT + 10) {
                c.y = -10;
                c.x = Math.random() * CANVAS_WIDTH;
            }
        }
    }

    draw(ctx) {
        if (!this.active) return;

        // Semi-transparent backdrop
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // ── Confetti ──
        for (const c of this.confetti) {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rotation);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 0.5);
            ctx.restore();
        }

        // ── Birthday text ──
        ctx.save();
        ctx.translate(CANVAS_WIDTH / 2, 60);
        ctx.scale(this.textScale, this.textScale);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Glow
        ctx.shadowColor = '#FF69B4';
        ctx.shadowBlur = 20;

        // "🎉 Happy Birthday" line
        ctx.font = '20px "Press Start 2P", monospace';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('🎉 Happy Birthday 🎉', 0, 0);

        // "to Sophie!" line
        ctx.font = '24px "Press Start 2P", monospace';
        ctx.fillStyle = '#FF69B4';
        ctx.fillText('to Sophie!', 0, 40);

        ctx.shadowBlur = 0;
        ctx.restore();

        // ── Balloon with "10" ──
        this.drawBalloon(ctx, CANVAS_WIDTH / 2, this.balloonY);
    }

    drawBalloon(ctx, x, y) {
        const wobble = Math.sin(this.timer * 2) * 8;
        const bx = x + wobble;

        // String
        ctx.strokeStyle = '#999';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(bx, y + 45);
        ctx.quadraticCurveTo(bx + wobble * 0.3, y + 80, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 20);
        ctx.stroke();

        // Balloon body (large oval)
        const gradient = ctx.createRadialGradient(bx - 8, y - 8, 5, bx, y, 42);
        gradient.addColorStop(0, '#FF91C0');
        gradient.addColorStop(0.7, '#FF1493');
        gradient.addColorStop(1, '#C71076');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(bx, y, 36, 44, 0, 0, Math.PI * 2);
        ctx.fill();

        // Balloon highlight (glossy reflection)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(bx - 10, y - 14, 10, 16, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Knot at bottom
        ctx.fillStyle = '#C71076';
        ctx.beginPath();
        ctx.moveTo(bx - 5, y + 42);
        ctx.lineTo(bx, y + 50);
        ctx.lineTo(bx + 5, y + 42);
        ctx.closePath();
        ctx.fill();

        // "10" text on balloon
        ctx.save();
        ctx.font = 'bold 30px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFF';
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 4;
        ctx.fillText('10', bx, y + 2);
        ctx.restore();
    }
}
