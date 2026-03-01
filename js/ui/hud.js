// ─── HUD (Heads-Up Display) ───
// Draws lives, score, timer, and stage name on the canvas.

import { CANVAS_WIDTH, COLORS } from '../config.js';

export class HUD {
    constructor() {
        this.score = 0;
        this.timeRemaining = 0;
        this.timeLimit = 0;
    }

    addScore(points) {
        this.score += points;
    }

    /** Set up timer for a stage */
    initTimer(timeLimit) {
        this.timeLimit = timeLimit;
        this.timeRemaining = timeLimit;
    }

    /** Update timer each frame. Returns true if time ran out. */
    updateTimer(dt) {
        if (this.timeRemaining > 0) {
            this.timeRemaining -= dt;
            if (this.timeRemaining < 0) this.timeRemaining = 0;
        }
        return this.timeRemaining <= 0;
    }

    /** Calculate time-based score: linear from maxTimeScore → 0 */
    getTimeScore(maxTimeScore) {
        if (this.timeLimit <= 0) return 0;
        const ratio = Math.max(0, this.timeRemaining / this.timeLimit);
        return Math.round(maxTimeScore * ratio);
    }

    draw(ctx, player, stageName) {
        ctx.save();

        // Font setup
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.textBaseline = 'top';

        // ── Lives ──
        ctx.fillStyle = COLORS.hudShadow;
        ctx.fillText(`♥ × ${player.lives}`, 17, 17);
        ctx.fillStyle = '#FF69B4';
        ctx.fillText(`♥ × ${player.lives}`, 16, 16);

        // ── Score ──
        const scoreText = `Score: ${this.score}`;
        ctx.fillStyle = COLORS.hudShadow;
        ctx.fillText(scoreText, 17, 37);
        ctx.fillStyle = COLORS.hud;
        ctx.fillText(scoreText, 16, 36);

        // ── Timer (top right) ──
        ctx.textAlign = 'right';
        const secs = Math.ceil(this.timeRemaining);
        const timerText = `Time: ${secs}`;
        // Flash red when low
        const timerColor = this.timeRemaining <= 10 ? '#FF4444' : '#FFF';
        const flash = this.timeRemaining <= 10 && Math.floor(this.timeRemaining * 3) % 2 === 0;
        ctx.fillStyle = COLORS.hudShadow;
        ctx.fillText(timerText, CANVAS_WIDTH - 15, 17);
        ctx.fillStyle = flash ? '#FF0000' : timerColor;
        ctx.fillText(timerText, CANVAS_WIDTH - 16, 16);

        // ── Stage name (top center) ──
        ctx.textAlign = 'center';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = COLORS.hudShadow;
        ctx.fillText(stageName, CANVAS_WIDTH / 2 + 1, 17);
        ctx.fillStyle = COLORS.hud;
        ctx.fillText(stageName, CANVAS_WIDTH / 2, 16);

        ctx.restore();
    }
}
