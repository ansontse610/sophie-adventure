// ─── Happy Birthday Song ───
// "Happy Birthday to You" melody played with Web Audio API.
// Plays once when Sophie completes the stage.

import { audio } from './audio.js';

// Note frequencies
const N = {
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
    A4: 440.00, Bb4: 466.16, B4: 493.88,
    C5: 523.25, D5: 587.33,
    R: 0,
};

export class BirthdaySong {
    constructor() {
        this.playing = false;
        this.nodes = [];
    }

    /**
     * "Happy Birthday to You" in C major
     * Melody with note + duration (in beats)
     * Traditional timing:
     *   Hap-py birth-day to you (×2)
     *   Hap-py birth-day dear So-phie
     *   Hap-py birth-day to you
     */
    get melody() {
        return [
            // "Happy birthday to you" (line 1)
            [N.C4, 0.75], [N.C4, 0.25], [N.D4, 1], [N.C4, 1], [N.F4, 1], [N.E4, 2],

            // "Happy birthday to you" (line 2)
            [N.C4, 0.75], [N.C4, 0.25], [N.D4, 1], [N.C4, 1], [N.G4, 1], [N.F4, 2],

            // "Happy birthday dear Sophie" (line 3)
            [N.C4, 0.75], [N.C4, 0.25], [N.C5, 1], [N.A4, 1], [N.F4, 0.75], [N.E4, 0.25], [N.D4, 2],

            // "Happy birthday to you" (line 4)
            [N.Bb4, 0.75], [N.Bb4, 0.25], [N.A4, 1], [N.F4, 1], [N.G4, 1], [N.F4, 2],
        ];
    }

    /** Harmony / accompaniment (gentle chords beneath) */
    get harmony() {
        return [
            // Line 1: F chord tones
            [N.F4, 6, 0.06],
            // Line 2
            [N.C4, 4, 0.06], [N.F4, 2, 0.06],
            // Line 3
            [N.C4, 2, 0.06], [N.A4, 2, 0.06], [N.F4, 2, 0.06],
            // Line 4
            [N.Bb4, 2, 0.06], [N.F4, 2, 0.06], [N.C4, 2, 0.06],
        ];
    }

    /** Play the full Happy Birthday song */
    play() {
        if (!audio.ctx || this.playing) return;
        this.playing = true;

        const bpm = 110;
        const beatDur = 60 / bpm;
        const t = audio.now + 0.3; // slight delay after victory fanfare

        // Schedule melody
        let offset = 0;
        for (const [freq, beats] of this.melody) {
            if (freq > 0) {
                this._note(freq, t + offset, beats * beatDur * 0.9, 'sine', 0.22);
                // Slight octave shimmer for warmth
                this._note(freq * 2, t + offset, beats * beatDur * 0.7, 'sine', 0.04);
            }
            offset += beats * beatDur;
        }

        // Schedule harmony (quiet triangle wave underneath)
        let harmOffset = 0;
        for (const [freq, beats, vol] of this.harmony) {
            if (freq > 0) {
                this._note(freq * 0.5, t + harmOffset, beats * beatDur * 0.85, 'triangle', vol);
            }
            harmOffset += beats * beatDur;
        }

        // Mark as done after song finishes
        const totalDuration = offset;
        setTimeout(() => {
            this.playing = false;
            this.nodes = [];
        }, (totalDuration + 1) * 1000);
    }

    stop() {
        this.playing = false;
        for (const node of this.nodes) {
            try { node.stop(); } catch (e) {}
        }
        this.nodes = [];
    }

    _note(freq, time, duration, type, volume) {
        if (!audio.ctx) return;
        const osc = audio.ctx.createOscillator();
        const env = audio.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);

        // Soft attack, gentle release
        env.gain.setValueAtTime(0, time);
        env.gain.linearRampToValueAtTime(volume, time + 0.03);
        env.gain.setValueAtTime(volume * 0.9, time + duration * 0.5);
        env.gain.linearRampToValueAtTime(0, time + duration);

        osc.connect(env);
        env.connect(audio.musicGain);

        osc.start(time);
        osc.stop(time + duration + 0.05);
        this.nodes.push(osc);
    }
}
