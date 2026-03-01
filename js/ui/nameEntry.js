// ─── Name Entry UI ───
// Shown when a player's score qualifies for the leaderboard.
// Captures keyboard input for a name (max 20 chars), drawn on canvas.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';

export class NameEntry {
    constructor() {
        this.active = false;
        this.name = '';
        this.maxLength = 20;
        this.cursorBlink = 0;
        this.rank = 0;
        this.score = 0;
        this.onComplete = null; // callback(name)
        this._keyHandler = null;
    }

    /**
     * Show the name entry screen.
     * @param {number} score - final score
     * @param {number} rank - predicted rank on leaderboard
     * @param {function} onComplete - called with the entered name
     */
    show(score, rank, onComplete) {
        this.active = true;
        this.name = '';
        this.score = score;
        this.rank = rank;
        this.cursorBlink = 0;
        this.onComplete = onComplete;

        // Attach keyboard listener for text input
        this._keyHandler = (e) => this._handleKey(e);
        window.addEventListener('keydown', this._keyHandler);
    }

    hide() {
        this.active = false;
        if (this._keyHandler) {
            window.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
    }

    _handleKey(e) {
        if (!this.active) return;

        if (e.key === 'Enter' && this.name.length > 0) {
            e.preventDefault();
            const name = this.name;
            this.hide();
            if (this.onComplete) this.onComplete(name);
            return;
        }

        if (e.key === 'Backspace') {
            e.preventDefault();
            this.name = this.name.slice(0, -1);
            return;
        }

        // Only allow printable single characters
        if (e.key.length === 1 && this.name.length < this.maxLength) {
            e.preventDefault();
            this.name += e.key;
        }
    }

    update(dt) {
        if (!this.active) return;
        this.cursorBlink += dt;
    }

    draw(ctx) {
        if (!this.active) return;

        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Title
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('🏆 New High Score! 🏆', CANVAS_WIDTH / 2, 100);

        // Score
        ctx.font = '12px "Press Start 2P", monospace';
        ctx.fillStyle = '#FFF';
        ctx.fillText(`Score: ${this.score}    Rank: #${this.rank}`, CANVAS_WIDTH / 2, 145);

        // Prompt
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = '#FF69B4';
        ctx.fillText('Enter your name:', CANVAS_WIDTH / 2, 195);

        // Input box
        const boxW = 360;
        const boxH = 36;
        const boxX = (CANVAS_WIDTH - boxW) / 2;
        const boxY = 218;

        // Box background
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = '#FF69B4';
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        // Name text
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.fillStyle = '#FFF';
        ctx.textAlign = 'left';
        const displayText = this.name;
        ctx.fillText(displayText, boxX + 10, boxY + boxH / 2);

        // Blinking cursor
        if (Math.floor(this.cursorBlink * 3) % 2 === 0) {
            const textWidth = ctx.measureText(displayText).width;
            ctx.fillStyle = '#FF69B4';
            ctx.fillRect(boxX + 12 + textWidth, boxY + 6, 2, boxH - 12);
        }

        // Character count
        ctx.textAlign = 'right';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#666';
        ctx.fillText(`${this.name.length}/${this.maxLength}`, boxX + boxW - 4, boxY + boxH + 14);

        // Instructions
        ctx.textAlign = 'center';
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#AAA';
        ctx.fillText('Press ENTER to confirm', CANVAS_WIDTH / 2, 300);

        ctx.restore();
    }
}
