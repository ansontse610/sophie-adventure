// ─── Input Handler ───
// Tracks keyboard state. Use isDown() for continuous checks, justPressed() for one-shot.

class Input {
    constructor() {
        /** @type {Set<string>} currently held keys */
        this.keys = new Set();
        /** @type {Set<string>} keys pressed this frame (cleared each frame) */
        this.justPressedKeys = new Set();

        window.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
                e.preventDefault();
            }
            if (!this.keys.has(e.key)) {
                this.justPressedKeys.add(e.key);
            }
            this.keys.add(e.key);
        });

        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.key);
        });
    }

    /** True while the key is held */
    isDown(key) {
        return this.keys.has(key);
    }

    /** True only on the first frame the key is pressed */
    justPressed(key) {
        return this.justPressedKeys.has(key);
    }

    /** Call at the END of each game frame to reset one-shot keys */
    endFrame() {
        this.justPressedKeys.clear();
    }
}

// Singleton
export const input = new Input();
