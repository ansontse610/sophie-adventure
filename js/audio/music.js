// ─── Background Music ───
// Procedural chiptune loop using Web Audio API.
// A cheerful, adventure-style melody that loops seamlessly.

import { audio } from './audio.js';

// Note frequency lookup (octave 4 and 5)
const N = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
    A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
    A5: 880.00, B5: 987.77,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00,
    A3: 220.00, B3: 246.94,
    R: 0, // rest
};

export class Music {
    constructor() {
        this.playing = false;
        this.loopTimer = null;
        this.currentNodes = [];
        this.bpm = 140;
    }

    /** Melody pattern — a fun chiptune adventure loop */
    get melodyPattern() {
        // Each entry: [note, duration in beats]
        return [
            // Phrase 1 — bright ascending
            [N.C5, 1], [N.E5, 1], [N.G5, 1], [N.E5, 1],
            [N.F5, 1], [N.A5, 1], [N.G5, 2],

            // Phrase 2 — playful bounce
            [N.E5, 1], [N.D5, 0.5], [N.E5, 0.5], [N.C5, 1], [N.D5, 1],
            [N.E5, 1], [N.C5, 1], [N.D5, 2],

            // Phrase 3 — rise up
            [N.C5, 1], [N.D5, 1], [N.E5, 1], [N.F5, 1],
            [N.G5, 1.5], [N.E5, 0.5], [N.D5, 1], [N.C5, 1],

            // Phrase 4 — resolution
            [N.E5, 1], [N.D5, 1], [N.C5, 1], [N.E5, 1],
            [N.G5, 2], [N.C5, 2],
        ];
    }

    /** Bass line (lower octave, follows chord roots) */
    get bassPattern() {
        return [
            // 4 beats per bar, 8 bars total to match melody
            [N.C3, 2], [N.G3, 2],
            [N.F3, 2], [N.C3, 2],

            [N.C3, 2], [N.G3, 2],
            [N.C3, 2], [N.G3, 2],

            [N.C3, 2], [N.D3, 2],
            [N.E3, 2], [N.F3, 2],

            [N.C3, 2], [N.G3, 2],
            [N.C3, 2], [N.R, 2],
        ];
    }

    /** Start playing background music loop */
    start() {
        if (!audio.ctx || this.playing) return;
        this.playing = true;
        this._scheduleLoop();
    }

    /** Stop all music */
    stop() {
        this.playing = false;
        if (this.loopTimer) {
            clearTimeout(this.loopTimer);
            this.loopTimer = null;
        }
        // Stop any playing nodes
        for (const node of this.currentNodes) {
            try { node.stop(); } catch (e) {}
        }
        this.currentNodes = [];
    }

    _scheduleLoop() {
        if (!this.playing || !audio.ctx) return;

        const beatDur = 60 / this.bpm; // seconds per beat
        const t = audio.now + 0.05; // small offset to avoid clicks

        // Schedule melody
        let offset = 0;
        for (const [freq, beats] of this.melodyPattern) {
            if (freq > 0) {
                this._scheduleNote(freq, t + offset, beats * beatDur * 0.9, 'square', 0.12);
            }
            offset += beats * beatDur;
        }

        // Schedule bass
        let bassOffset = 0;
        for (const [freq, beats] of this.bassPattern) {
            if (freq > 0) {
                this._scheduleNote(freq, t + bassOffset, beats * beatDur * 0.85, 'triangle', 0.18);
            }
            bassOffset += beats * beatDur;
        }

        // Schedule percussion (kick-like on every beat)
        const totalBeats = offset / beatDur;
        for (let i = 0; i < totalBeats; i++) {
            const bt = t + i * beatDur;
            if (i % 2 === 0) {
                this._scheduleKick(bt);
            } else {
                this._scheduleHihat(bt);
            }
        }

        // Schedule next loop
        const loopDuration = offset * 1000; // ms
        this.loopTimer = setTimeout(() => this._scheduleLoop(), loopDuration - 100);
    }

    _scheduleNote(freq, time, duration, type, volume) {
        if (!audio.ctx) return;
        const osc = audio.ctx.createOscillator();
        const env = audio.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);

        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(volume, time + 0.015);
        env.gain.setValueAtTime(volume * 0.8, time + duration * 0.6);
        env.gain.linearRampToValueAtTime(0, time + duration);

        osc.connect(env);
        env.connect(audio.musicGain);

        osc.start(time);
        osc.stop(time + duration + 0.02);
        this.currentNodes.push(osc);

        // Cleanup reference after note ends
        setTimeout(() => {
            const idx = this.currentNodes.indexOf(osc);
            if (idx !== -1) this.currentNodes.splice(idx, 1);
        }, (time - audio.now + duration + 0.1) * 1000);
    }

    _scheduleKick(time) {
        if (!audio.ctx) return;
        const osc = audio.ctx.createOscillator();
        const env = audio.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.1);

        env.gain.setValueAtTime(0.2, time);
        env.gain.linearRampToValueAtTime(0, time + 0.1);

        osc.connect(env);
        env.connect(audio.musicGain);

        osc.start(time);
        osc.stop(time + 0.12);
    }

    _scheduleHihat(time) {
        if (!audio.ctx) return;
        const bufferSize = audio.ctx.sampleRate * 0.04;
        const buffer = audio.ctx.createBuffer(1, bufferSize, audio.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }

        const noise = audio.ctx.createBufferSource();
        noise.buffer = buffer;

        const env = audio.ctx.createGain();
        env.gain.setValueAtTime(0.06, time);
        env.gain.linearRampToValueAtTime(0, time + 0.04);

        const hp = audio.ctx.createBiquadFilter();
        hp.type = 'highpass';
        hp.frequency.value = 8000;

        noise.connect(hp);
        hp.connect(env);
        env.connect(audio.musicGain);

        noise.start(time);
        noise.stop(time + 0.05);
    }
}
