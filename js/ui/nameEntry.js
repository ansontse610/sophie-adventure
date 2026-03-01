// ─── Name Entry UI ───
// Shown when a player's score qualifies for the leaderboard.
// Captures keyboard input for a name (max 20 chars), drawn on canvas.
// On mobile (touch devices), uses a hidden HTML input to trigger the virtual keyboard.

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../config.js';
import { input } from '../engine/input.js';

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
        this._hiddenInput = null;
        this._inputHandler = null;
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

        if (input.isTouchDevice) {
            this._showMobileInput();
        } else {
            // Attach keyboard listener for text input
            this._keyHandler = (e) => this._handleKey(e);
            window.addEventListener('keydown', this._keyHandler);
        }
    }

    /** Create a hidden input field to trigger mobile virtual keyboard */
    _showMobileInput() {
        // Create hidden input
        let inp = document.getElementById('name-entry-input');
        if (!inp) {
            inp = document.createElement('input');
            inp.id = 'name-entry-input';
            inp.type = 'text';
            inp.maxLength = this.maxLength;
            inp.autocomplete = 'off';
            inp.autocapitalize = 'words';
            inp.style.cssText = `
                position: fixed;
                bottom: 0; left: 50%;
                transform: translateX(-50%);
                width: 80%; max-width: 360px;
                padding: 10px;
                font-size: 18px;
                font-family: 'Press Start 2P', monospace;
                background: #1a1a2e;
                color: #fff;
                border: 2px solid #FF69B4;
                border-radius: 8px;
                text-align: center;
                z-index: 100;
                outline: none;
            `;
            document.body.appendChild(inp);
        }
        inp.value = '';
        inp.style.display = 'block';

        // Sync input value to this.name
        this._inputHandler = () => {
            this.name = inp.value.slice(0, this.maxLength);
        };
        inp.addEventListener('input', this._inputHandler);

        // Handle Enter key / submit
        inp.addEventListener('keydown', this._mobileKeyHandler = (e) => {
            if (e.key === 'Enter' && this.name.length > 0) {
                e.preventDefault();
                const name = this.name;
                this.hide();
                if (this.onComplete) this.onComplete(name);
            }
        });

        // Also add a confirm button for mobile
        let btn = document.getElementById('name-confirm-btn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'name-confirm-btn';
            btn.textContent = 'OK';
            btn.style.cssText = `
                position: fixed;
                bottom: 52px; left: 50%;
                transform: translateX(-50%);
                padding: 8px 32px;
                font-size: 14px;
                font-family: 'Press Start 2P', monospace;
                background: #FF69B4;
                color: #FFF;
                border: none;
                border-radius: 8px;
                z-index: 100;
                cursor: pointer;
            `;
            document.body.appendChild(btn);
        }
        btn.style.display = 'block';
        btn.onclick = () => {
            if (this.name.length > 0) {
                const name = this.name;
                this.hide();
                if (this.onComplete) this.onComplete(name);
            }
        };

        // Focus the input with a small delay (iOS needs this)
        setTimeout(() => inp.focus(), 100);
        this._hiddenInput = inp;
    }

    hide() {
        this.active = false;
        if (this._keyHandler) {
            window.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        // Clean up mobile input
        const inp = document.getElementById('name-entry-input');
        if (inp) {
            inp.style.display = 'none';
            inp.blur();
            if (this._inputHandler) inp.removeEventListener('input', this._inputHandler);
            if (this._mobileKeyHandler) inp.removeEventListener('keydown', this._mobileKeyHandler);
        }
        const btn = document.getElementById('name-confirm-btn');
        if (btn) btn.style.display = 'none';
        this._hiddenInput = null;
        this._inputHandler = null;
        this._mobileKeyHandler = null;
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
        const confirmMsg = input.isTouchDevice ? 'Type name below & tap OK' : 'Press ENTER to confirm';
        ctx.fillText(confirmMsg, CANVAS_WIDTH / 2, 300);

        ctx.restore();
    }
}
