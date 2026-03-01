// ─── Audio Engine ───
// Singleton Web Audio API context + utility helpers for synthesis.
// All sounds are generated procedurally — no audio files needed.

class AudioEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.initialized = false;
    }

    /** Must be called from a user gesture (click / keypress) to unlock audio */
    init() {
        if (this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Master → speakers
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.7;
        this.masterGain.connect(this.ctx.destination);

        // Music bus
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.value = 0.35;
        this.musicGain.connect(this.masterGain);

        // SFX bus
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = 0.5;
        this.sfxGain.connect(this.masterGain);

        this.initialized = true;
    }

    get now() {
        return this.ctx ? this.ctx.currentTime : 0;
    }

    /** Play a single tone on a given bus */
    playTone(freq, duration, type = 'square', gainNode = null, volume = 0.3, startTime = null) {
        if (!this.ctx) return;
        const t = startTime ?? this.now;
        const osc = this.ctx.createOscillator();
        const env = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);

        // ADSR-like envelope
        env.gain.setValueAtTime(0, t);
        env.gain.linearRampToValueAtTime(volume, t + 0.01);
        env.gain.setValueAtTime(volume, t + duration * 0.7);
        env.gain.linearRampToValueAtTime(0, t + duration);

        osc.connect(env);
        env.connect(gainNode || this.sfxGain);

        osc.start(t);
        osc.stop(t + duration + 0.05);
    }

    /** Play noise burst (for percussion / hit effects) */
    playNoise(duration, volume = 0.2, gainNode = null) {
        if (!this.ctx) return;
        const t = this.now;
        const bufferSize = this.ctx.sampleRate * duration;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1);
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const env = this.ctx.createGain();
        env.gain.setValueAtTime(volume, t);
        env.gain.linearRampToValueAtTime(0, t + duration);

        // Bandpass to shape the noise
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1;

        noise.connect(filter);
        filter.connect(env);
        env.connect(gainNode || this.sfxGain);

        noise.start(t);
        noise.stop(t + duration + 0.05);
    }
}

// Singleton
export const audio = new AudioEngine();
