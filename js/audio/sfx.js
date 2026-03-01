// ─── Sound Effects ───
// All SFX synthesized with Web Audio API oscillators.

import { audio } from './audio.js';

export const sfx = {
    /** Sophie jumps */
    jump() {
        if (!audio.ctx) return;
        const t = audio.now;
        const osc = audio.ctx.createOscillator();
        const env = audio.ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(600, t + 0.15);

        env.gain.setValueAtTime(0.2, t);
        env.gain.linearRampToValueAtTime(0, t + 0.15);

        osc.connect(env);
        env.connect(audio.sfxGain);
        osc.start(t);
        osc.stop(t + 0.2);
    },

    /** Stomp on a monster */
    stomp() {
        if (!audio.ctx) return;
        const t = audio.now;

        // Boing sound
        const osc = audio.ctx.createOscillator();
        const env = audio.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, t);
        osc.frequency.linearRampToValueAtTime(200, t + 0.2);
        env.gain.setValueAtTime(0.3, t);
        env.gain.linearRampToValueAtTime(0, t + 0.2);
        osc.connect(env);
        env.connect(audio.sfxGain);
        osc.start(t);
        osc.stop(t + 0.25);

        // Pop
        audio.playNoise(0.05, 0.15);
    },

    /** Sophie takes damage */
    hit() {
        if (!audio.ctx) return;
        const t = audio.now;

        // Descending buzz
        const osc = audio.ctx.createOscillator();
        const env = audio.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, t);
        osc.frequency.linearRampToValueAtTime(100, t + 0.3);
        env.gain.setValueAtTime(0.2, t);
        env.gain.linearRampToValueAtTime(0, t + 0.3);
        osc.connect(env);
        env.connect(audio.sfxGain);
        osc.start(t);
        osc.stop(t + 0.35);

        audio.playNoise(0.1, 0.1);
    },

    /** Game over */
    gameOver() {
        if (!audio.ctx) return;
        const t = audio.now;
        // Sad descending notes
        const notes = [400, 350, 300, 200];
        notes.forEach((freq, i) => {
            audio.playTone(freq, 0.3, 'triangle', audio.sfxGain, 0.25, t + i * 0.25);
        });
    },

    /** Stage clear / victory fanfare (short, before birthday song) */
    victory() {
        if (!audio.ctx) return;
        const t = audio.now;
        const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
        notes.forEach((freq, i) => {
            audio.playTone(freq, 0.2, 'square', audio.sfxGain, 0.2, t + i * 0.15);
        });
        // Final long note
        audio.playTone(1047, 0.6, 'triangle', audio.sfxGain, 0.25, t + 0.6);
    },

    /** Menu select / start game */
    start() {
        if (!audio.ctx) return;
        audio.playTone(440, 0.1, 'square', audio.sfxGain, 0.15);
        audio.playTone(660, 0.15, 'square', audio.sfxGain, 0.15, audio.now + 0.1);
    },

    /** Landing on platform (subtle) */
    land() {
        if (!audio.ctx) return;
        audio.playNoise(0.03, 0.06);
    },
};
