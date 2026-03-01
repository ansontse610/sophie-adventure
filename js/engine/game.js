// ─── Game Engine ───
// State machine + game loop. Orchestrates all entities, physics, and rendering.

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS } from '../config.js';
import { input } from './input.js';
import { Camera } from './camera.js';
import { checkCollision, resolveTopCollision } from './physics.js';

import { Player } from '../entities/player.js';
import { Platform } from '../entities/platform.js';
import { Goal } from '../entities/goal.js';

import { Slime } from '../monsters/slime.js';
import { Bat } from '../monsters/bat.js';
import { Spiky } from '../monsters/spiky.js';
import { Frog } from '../monsters/frog.js';

import { HUD } from '../ui/hud.js';
import { Popup } from '../ui/popup.js';
import { Leaderboard } from '../ui/leaderboard.js';
import { NameEntry } from '../ui/nameEntry.js';

import { audio } from '../audio/audio.js';
import { sfx } from '../audio/sfx.js';
import { Music } from '../audio/music.js';
import { BirthdaySong } from '../audio/birthday.js';

// Game states
const State = {
    MENU: 'MENU',
    PLAYING: 'PLAYING',
    WIN: 'WIN',
    NAME_ENTRY: 'NAME_ENTRY',
    LEADERBOARD: 'LEADERBOARD',
    GAME_OVER: 'GAME_OVER',
};

// Monster factory
const MONSTER_TYPES = {
    slime: (m) => new Slime(m.x, m.y, m.patrolRange),
    bat:   (m) => new Bat(m.x, m.y, m.patrolRange),
    spiky: (m) => new Spiky(m.x, m.y, m.patrolRange),
    frog:  (m) => new Frog(m.x, m.y),
};

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.state = State.MENU;
        this.stageConfig = null;

        this.player = null;
        this.platforms = [];
        this.monsters = [];
        this.goal = null;
        this.camera = null;
        this.hud = new HUD();
        this.popup = new Popup();
        this.leaderboard = new Leaderboard();
        this.nameEntry = new NameEntry();
        this.finalScore = 0;

        // Decorative
        this.clouds = [];
        this.hills = [];

        // Audio
        this.music = new Music();
        this.birthdaySong = new BirthdaySong();
        this.audioStarted = false;

        // Timing
        this.lastTime = 0;

        // Menu animation
        this.menuTimer = 0;
    }

    /** Load a stage config and initialize all entities */
    loadStage(stageConfig) {
        this.stageConfig = stageConfig;

        // Player
        this.player = new Player(stageConfig.playerStart.x, stageConfig.playerStart.y);
        this.playerSpawn = { ...stageConfig.playerStart };

        // Camera
        this.camera = new Camera(stageConfig.width);

        // Platforms
        this.platforms = stageConfig.platforms.map(
            (p) => new Platform(p.x, p.y, p.width, p.height || 24, p.isGround || false)
        );

        // Monsters
        this.monsters = stageConfig.monsters.map((m) => {
            const factory = MONSTER_TYPES[m.type];
            if (!factory) {
                console.warn(`Unknown monster type: ${m.type}`);
                return null;
            }
            return factory(m);
        }).filter(Boolean);

        // Goal
        this.goal = new Goal(stageConfig.goal.x, stageConfig.goal.y);

        // Decorative
        this.clouds = stageConfig.clouds || [];
        this.hills = stageConfig.hills || [];

        // Reset HUD
        this.hud.score = 0;
        this.hud.initTimer(stageConfig.timeLimit || 100);
    }

    /** Start the game loop */
    start() {
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // cap to avoid spiral
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();
        input.endFrame();

        requestAnimationFrame((t) => this.loop(t));
    }

    // ─── UPDATE ───
    update(dt) {
        switch (this.state) {
            case State.MENU:
                this.updateMenu(dt);
                break;
            case State.PLAYING:
                this.updatePlaying(dt);
                break;
            case State.WIN:
                this.updateWin(dt);
                break;
            case State.NAME_ENTRY:
                this.updateNameEntry(dt);
                break;
            case State.LEADERBOARD:
                this.updateLeaderboard(dt);
                break;
            case State.GAME_OVER:
                this.updateGameOver(dt);
                break;
        }
    }

    /** Initialize audio on first user interaction (browser policy) */
    ensureAudio() {
        if (!this.audioStarted) {
            audio.init();
            this.audioStarted = true;
        }
    }

    updateMenu(dt) {
        this.menuTimer += dt;
        if (input.justPressed(' ')) {
            this.ensureAudio();
            sfx.start();
            this.music.start();
            this.state = State.PLAYING;
            input.setPlaying(true);
        }
    }

    updatePlaying(dt) {
        const player = this.player;

        // ── Update player ──
        const wasGrounded = player.grounded;
        const prevY = player.y;
        player.update(dt, input);

        // Jump SFX (player.update sets velocityY)
        if (input.justPressed(' ') && wasGrounded) {
            sfx.jump();
        }

        // ── Platform collisions ──
        player.grounded = false;
        for (const plat of this.platforms) {
            if (resolveTopCollision(player, plat, prevY)) {
                // Just landed
                if (!wasGrounded) sfx.land();
            }
        }

        // ── Monster updates + collisions ──
        for (const m of this.monsters) {
            if (!m.isAlive) continue;
            m.update(dt);

            if (!checkCollision(player, m)) continue;
            if (player.isInvincible) continue;

            // Check if Sophie is coming from above (stomp)
            const playerBottom = player.y + player.height;
            const monsterMidY = m.y + m.height * 0.4;

            if (player.velocityY > 0 && playerBottom < m.y + m.height * 0.6 && m.canBeStomped) {
                // Stomp!
                m.onStomped();
                player.stomp();
                this.hud.addScore(m.scoreValue);
                sfx.stomp();
            } else {
                // Side / bottom collision → take damage
                player.hit();
                sfx.hit();
                // Respawn at start if fell or lost life
                if (player.lives > 0) {
                    player.x = this.playerSpawn.x;
                    player.y = this.playerSpawn.y;
                    player.velocityY = 0;
                }
            }
        }

        // ── Goal collision ──
        if (this.goal) {
            this.goal.update(dt);
            if (checkCollision(player, this.goal)) {
                // Calculate final score: monster kills + time bonus
                const timeScore = this.hud.getTimeScore(this.stageConfig.maxTimeScore || 10000);
                this.hud.addScore(timeScore);
                this.finalScore = this.hud.score;
                this.state = State.WIN;
                input.setPlaying(false);
                this.popup.show();
                this.music.stop();
                sfx.victory();
                setTimeout(() => this.birthdaySong.play(), 1200);
            }
        }

        // ── Timer ──
        const timeUp = this.hud.updateTimer(dt);
        if (timeUp && this.state === State.PLAYING) {
            // Time's up — game over
            player.lives = 0;
        }

        // ── Check death ──
        if (player.lives <= 0) {
            this.state = State.GAME_OVER;
            input.setPlaying(false);
            this.music.stop();
            sfx.gameOver();
        }

        // ── Camera ──
        this.camera.update(player);
    }

    updateWin(dt) {
        this.popup.update(dt);
        // After 3 seconds, check leaderboard
        if (this.popup.timer > 3 && input.justPressed(' ')) {
            if (this.leaderboard.qualifies(this.finalScore)) {
                // Show name entry
                const rank = this.leaderboard.getRank(this.finalScore);
                this.state = State.NAME_ENTRY;
                this.nameEntry.show(this.finalScore, rank, (name) => {
                    this.leaderboard.addEntry(name, this.finalScore, 1);
                    this.state = State.LEADERBOARD;
                });
            } else {
                this.state = State.LEADERBOARD;
            }
        }
    }

    updateNameEntry(dt) {
        this.nameEntry.update(dt);
        // Input handled by NameEntry's own keydown listener
    }

    updateLeaderboard(dt) {
        if (input.justPressed(' ')) {
            this.restart();
        }
    }

    updateGameOver(dt) {
        if (input.justPressed(' ')) {
            this.restart();
        }
    }

    restart() {
        this.loadStage(this.stageConfig);
        this.popup = new Popup();
        this.nameEntry.hide();
        this.birthdaySong.stop();
        this.music.stop();
        this.music = new Music();
        this.music.start();
        this.finalScore = 0;
        this.state = State.PLAYING;
        input.setPlaying(true);
    }

    // ─── DRAW ───
    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        switch (this.state) {
            case State.MENU:
                this.drawMenu(ctx);
                break;
            case State.PLAYING:
                this.drawWorld(ctx);
                break;
            case State.WIN:
                this.drawWorld(ctx);
                this.popup.draw(ctx);
                // Show hint after delay
                if (this.popup.timer > 3) {
                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.font = '8px "Press Start 2P", monospace';
                    ctx.fillStyle = '#FFF';
                    ctx.fillText(`Final Score: ${this.finalScore}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);
                    if (Math.floor(this.popup.timer * 2) % 2 === 0) {
                        const contMsg = input.isTouchDevice ? 'Tap to continue' : 'Press SPACE to continue';
                        ctx.fillText(contMsg, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30);
                    }
                    ctx.restore();
                }
                break;
            case State.NAME_ENTRY:
                this.drawWorld(ctx);
                this.nameEntry.draw(ctx);
                break;
            case State.LEADERBOARD:
                this.drawWorld(ctx);
                this.drawLeaderboard(ctx);
                break;
            case State.GAME_OVER:
                this.drawWorld(ctx);
                this.drawGameOver(ctx);
                break;
        }
    }

    drawMenu(ctx) {
        // Sky
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Ground
        ctx.fillStyle = COLORS.groundTop;
        ctx.fillRect(0, 280, CANVAS_WIDTH, 170);
        ctx.fillStyle = COLORS.ground;
        ctx.fillRect(0, 286, CANVAS_WIDTH, 164);

        // Clouds
        this.drawCloud(ctx, 100 + Math.sin(this.menuTimer * 0.3) * 10, 80, 1.0);
        this.drawCloud(ctx, 500 + Math.sin(this.menuTimer * 0.2) * 15, 50, 1.3);
        this.drawCloud(ctx, 650 + Math.sin(this.menuTimer * 0.25) * 12, 100, 0.8);

        // Title
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Shadow
        ctx.fillStyle = '#00000044';
        ctx.font = '22px "Press Start 2P", monospace';
        ctx.fillText("Sophie's", CANVAS_WIDTH / 2 + 2, 142);
        ctx.font = '28px "Press Start 2P", monospace';
        ctx.fillText('Adventure', CANVAS_WIDTH / 2 + 2, 182);

        // Title text
        ctx.fillStyle = '#FF69B4';
        ctx.font = '22px "Press Start 2P", monospace';
        ctx.fillText("Sophie's", CANVAS_WIDTH / 2, 140);
        ctx.fillStyle = '#FFD700';
        ctx.font = '28px "Press Start 2P", monospace';
        ctx.fillText('Adventure', CANVAS_WIDTH / 2, 180);

        // Blinking "Press SPACE" / "Tap to Start"
        if (Math.floor(this.menuTimer * 2) % 2 === 0) {
            ctx.font = '11px "Press Start 2P", monospace';
            ctx.fillStyle = '#FFF';
            const startMsg = input.isTouchDevice ? 'Tap to Start' : 'Press SPACE to Start';
            ctx.fillText(startMsg, CANVAS_WIDTH / 2, 280);
        }

        // Controls hint
        ctx.font = '8px "Press Start 2P", monospace';
        ctx.fillStyle = '#FFF';
        const ctrlMsg = input.isTouchDevice
            ? 'Use on-screen buttons to play'
            : '← → to Move    SPACE to Jump';
        ctx.fillText(ctrlMsg, CANVAS_WIDTH / 2, 330);
    }

    drawWorld(ctx) {
        const cam = this.camera;

        // Sky
        ctx.fillStyle = this.stageConfig.background || '#87CEEB';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Background hills (parallax at 0.3x)
        this.drawHills(ctx, cam);

        // Background clouds (parallax at 0.5x)
        this.drawClouds(ctx, cam);

        // Platforms
        for (const p of this.platforms) {
            p.draw(ctx, cam);
        }

        // Goal
        if (this.goal) {
            this.goal.draw(ctx, cam);
        }

        // Monsters
        for (const m of this.monsters) {
            if (m.isAlive) m.draw(ctx, cam);
        }

        // Player
        this.player.draw(ctx, cam);

        // HUD
        this.hud.draw(ctx, this.player, this.stageConfig.name);
    }

    drawGameOver(ctx) {
        // Dim overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.font = '24px "Press Start 2P", monospace';
        ctx.fillStyle = '#FF4444';
        ctx.fillText('Game Over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

        // Show reason
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.fillStyle = '#FFF';
        if (this.hud.timeRemaining <= 0) {
            ctx.fillText("Time's up!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        } else {
            ctx.fillText('You ran out of lives!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
        }

        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = '#AAA';
        ctx.fillText(`Score: ${this.hud.score}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 25);

        ctx.font = '11px "Press Start 2P", monospace';
        ctx.fillStyle = '#FFF';
        const retryMsg = input.isTouchDevice ? 'Tap to Retry' : 'Press SPACE to Retry';
        ctx.fillText(retryMsg, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
    }

    drawLeaderboard(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Title
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = '#FFD700';
        ctx.fillText('🏆 Leaderboard 🏆', CANVAS_WIDTH / 2, 50);

        // Column headers
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = '#AAA';
        ctx.textAlign = 'left';
        ctx.fillText('Rank', 130, 90);
        ctx.fillText('Name', 210, 90);
        ctx.fillText('Score', 480, 90);
        ctx.fillText('Date', 600, 90);

        // Separator line
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(120, 100);
        ctx.lineTo(680, 100);
        ctx.stroke();

        // Entries
        const entries = this.leaderboard.getEntries();
        const rankColors = ['#FFD700', '#C0C0C0', '#CD7F32', '#FFF', '#FFF'];

        for (let i = 0; i < 5; i++) {
            const y = 130 + i * 36;
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'left';

            if (i < entries.length) {
                const e = entries[i];
                const isNewEntry = e.score === this.finalScore;

                ctx.fillStyle = rankColors[i];
                ctx.fillText(`#${i + 1}`, 140, y);

                ctx.fillStyle = isNewEntry ? '#FF69B4' : '#FFF';
                ctx.fillText(e.name, 210, y);

                ctx.fillStyle = isNewEntry ? '#FF69B4' : '#FFF';
                ctx.fillText(`${e.score}`, 480, y);

                ctx.font = '8px "Press Start 2P", monospace';
                ctx.fillStyle = '#888';
                ctx.fillText(e.date || '', 600, y);
            } else {
                ctx.fillStyle = '#444';
                ctx.fillText(`#${i + 1}`, 140, y);
                ctx.fillText('---', 210, y);
                ctx.fillText('---', 480, y);
            }
        }

        // Continue hint
        ctx.textAlign = 'center';
        ctx.font = '9px "Press Start 2P", monospace';
        ctx.fillStyle = '#AAA';
        if (Math.floor(performance.now() / 500) % 2 === 0) {
            const againMsg = input.isTouchDevice ? 'Tap to Play Again' : 'Press SPACE to Play Again';
            ctx.fillText(againMsg, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);
        }

        ctx.restore();
    }

    // ── Decorative helpers ──

    drawCloud(ctx, x, y, scale) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(x, y, 20 * scale, 0, Math.PI * 2);
        ctx.arc(x + 18 * scale, y - 6 * scale, 16 * scale, 0, Math.PI * 2);
        ctx.arc(x + 34 * scale, y, 20 * scale, 0, Math.PI * 2);
        ctx.arc(x + 16 * scale, y + 4 * scale, 18 * scale, 0, Math.PI * 2);
        ctx.fill();
    }

    drawClouds(ctx, cam) {
        for (const c of this.clouds) {
            const px = c.x - cam.x * 0.5; // parallax
            this.drawCloud(ctx, px, c.y, c.size);
        }
    }

    drawHills(ctx, cam) {
        for (const h of this.hills) {
            const px = h.x - cam.x * 0.3;
            const size = h.size;
            ctx.fillStyle = 'rgba(100, 180, 80, 0.35)';
            ctx.beginPath();
            ctx.ellipse(px, 310, 120 * size, 60 * size, 0, Math.PI, 0);
            ctx.fill();
        }
    }
}
