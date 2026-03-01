// ─── Leaderboard ───
// Stores top 5 scores in localStorage. Each entry: { name, score, stage }.

const STORAGE_KEY = 'sophie_adventure_leaderboard';
const MAX_ENTRIES = 5;

export class Leaderboard {
    constructor() {
        this.entries = this._load();
    }

    /** Load from localStorage */
    _load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) return JSON.parse(data);
        } catch (e) {
            console.warn('Failed to load leaderboard:', e);
        }
        return [];
    }

    /** Save to localStorage */
    _save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
        } catch (e) {
            console.warn('Failed to save leaderboard:', e);
        }
    }

    /** Check if a score qualifies for the leaderboard */
    qualifies(score) {
        if (this.entries.length < MAX_ENTRIES) return true;
        return score > this.entries[this.entries.length - 1].score;
    }

    /** Add a new entry and sort. Returns the rank (1-based). */
    addEntry(name, score, stage = 1) {
        const entry = {
            name: name.substring(0, 20),
            score,
            stage,
            date: new Date().toISOString().slice(0, 10),
        };
        this.entries.push(entry);
        this.entries.sort((a, b) => b.score - a.score);
        this.entries = this.entries.slice(0, MAX_ENTRIES);
        this._save();
        return this.entries.indexOf(entry) + 1;
    }

    /** Get all entries (sorted high→low) */
    getEntries() {
        return [...this.entries];
    }

    /** Get the rank a given score would place at (1-based, 0 if not qualifying) */
    getRank(score) {
        if (!this.qualifies(score)) return 0;
        for (let i = 0; i < this.entries.length; i++) {
            if (score > this.entries[i].score) return i + 1;
        }
        return this.entries.length + 1;
    }
}
