// ─── Input Handler ───
// Tracks keyboard + touch state. Use isDown() for continuous, justPressed() for one-shot.

class Input {
    constructor() {
        /** @type {Set<string>} currently held keys */
        this.keys = new Set();
        /** @type {Set<string>} keys pressed this frame (cleared each frame) */
        this.justPressedKeys = new Set();

        // ── Keyboard ──
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

        // ── Touch Controls ──
        this.isTouchDevice = false;
        this.playing = false; // true only during active gameplay
        this._initTouch();
    }

    /** Set up touch button listeners */
    _initTouch() {
        const btnLeft  = document.getElementById('btn-left');
        const btnRight = document.getElementById('btn-right');
        const btnJump  = document.getElementById('btn-jump');

        if (!btnLeft || !btnRight || !btnJump) return;

        // Detect touch capability
        const onFirstTouch = () => {
            this.isTouchDevice = true;
            window.removeEventListener('touchstart', onFirstTouch);
        };
        window.addEventListener('touchstart', onFirstTouch, { passive: true });

        // Helper to bind a button to a virtual key
        const bindButton = (btn, key) => {
            // Touch events
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.classList.add('active');
                if (!this.keys.has(key)) {
                    this.justPressedKeys.add(key);
                }
                this.keys.add(key);
            }, { passive: false });

            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.classList.remove('active');
                this.keys.delete(key);
            }, { passive: false });

            btn.addEventListener('touchcancel', (e) => {
                btn.classList.remove('active');
                this.keys.delete(key);
            });

            // Also support mouse (for testing on desktop)
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                btn.classList.add('active');
                if (!this.keys.has(key)) {
                    this.justPressedKeys.add(key);
                }
                this.keys.add(key);
            });

            btn.addEventListener('mouseup', (e) => {
                btn.classList.remove('active');
                this.keys.delete(key);
            });

            btn.addEventListener('mouseleave', (e) => {
                btn.classList.remove('active');
                this.keys.delete(key);
            });
        };

        bindButton(btnLeft,  'ArrowLeft');
        bindButton(btnRight, 'ArrowRight');
        bindButton(btnJump,  ' ');

        // Prevent context menu on long press
        [btnLeft, btnRight, btnJump].forEach(btn => {
            btn.addEventListener('contextmenu', (e) => e.preventDefault());
        });

        // Allow tapping the canvas as "Space" ONLY for menu/continue screens.
        // During gameplay, only the dedicated jump button should trigger Space.
        const canvas = document.getElementById('game');
        if (canvas) {
            canvas.addEventListener('touchstart', (e) => {
                // Only inject Space if game is NOT playing (menu, game over, win, leaderboard)
                if (!this.playing) {
                    if (!this.keys.has(' ')) {
                        this.justPressedKeys.add(' ');
                    }
                    this.keys.add(' ');
                }
            }, { passive: true });

            canvas.addEventListener('touchend', () => {
                if (!this.playing) {
                    this.keys.delete(' ');
                }
            }, { passive: true });
        }
    }

    /** Call from game engine to indicate whether gameplay is active */
    setPlaying(isPlaying) {
        this.playing = isPlaying;
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
