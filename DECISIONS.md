# Sophie's Adventure — Decision Log

This file records design decisions and fine-tuning agreements for future reference.

---

## 2026-03-01 — Initial Setup

### Tech Stack
- **Vanilla HTML5 Canvas + JavaScript** (no frameworks/libraries)
- ES Modules for code organization (no bundler needed)
- Google Fonts CDN for "Press Start 2P" retro font

### Art Style
- Simple geometric shapes and CSS colors
- No external sprite assets
- Character drawn with arcs, rectangles, and fills

### Architecture
- **Config-driven stages** — each stage is a JS module exporting platform/monster/goal data
- **Entity base class** — all game objects inherit common position, velocity, draw/update interface
- **Monster factory pattern** — new monster types added by creating a class + registering in `MONSTER_TYPES`
- **State machine** — Game states: `MENU`, `PLAYING`, `WIN`, `GAME_OVER`

### Game Design — Stage 1
- 4000px wide side-scrolling level
- 5 sections (A–E) with progressive difficulty
- 4 monster types: Slime (patrol), Bat (flying sine-wave), Spiky (un-stompable), Frog (periodic jumps)
- Player has 3 lives, invincibility frames after hit

### Birthday Feature
- Reaching the goal flag triggers "Happy Birthday to Sophie" popup
- Animated pink balloon with "10" inside rises with wobble
- Confetti particle effect in background

### Hosting
- Designed for GitHub Pages deployment (static files only)
- Open `index.html` via any HTTP server for local testing

---

## 2026-03-01 — Audio System

### Implementation
- **Web Audio API** for all sounds — fully procedural, zero external files
- Audio engine singleton (`js/audio/audio.js`) manages AudioContext + gain buses
- Separate **music bus** (0.35 volume) and **SFX bus** (0.5 volume) through a master gain

### Sound Effects (`js/audio/sfx.js`)
- **Jump** — ascending square wave sweep (300→600Hz)
- **Stomp** — descending sine + noise pop
- **Hit** — descending sawtooth buzz + noise
- **Land** — short noise burst (subtle)
- **Game Over** — four descending sad notes
- **Victory fanfare** — C-E-G-C ascending arpeggio
- **Start** — two quick beeps

### Background Music (`js/audio/music.js`)
- Procedural chiptune loop at 140 BPM
- Square wave melody + triangle bass + kick/hihat percussion
- Loops seamlessly; stops on win/game over, restarts on retry

### Happy Birthday Song (`js/audio/birthday.js`)
- "Happy Birthday to You" melody in C major at 110 BPM
- Sine wave melody + octave shimmer + quiet triangle harmony
- Plays automatically 1.2s after victory fanfare on stage completion

### Browser Audio Policy
- AudioContext initialized on first user gesture (Space to start)
- `ensureAudio()` called in menu → complies with autoplay restrictions

---

## 2026-03-01 — Timer, Scoring & Leaderboard

### Timer System
- Each stage has a `timeLimit` (Stage 1: **100 seconds**)
- Timer counts down during gameplay, displayed top-right on HUD
- Timer **flashes red** when ≤10 seconds remain
- Running out of time = Game Over ("Time's up!")

### Scoring System
- **Time bonus**: Up to `maxTimeScore` (10,000) awarded proportionally to remaining time
  - Formula: `maxTimeScore × (timeRemaining / timeLimit)`
  - Finishing at 50s remaining → 5,000 time bonus
  - Finishing at 0s → 0 time bonus
- **Monster kill scores** (based on difficulty):
  - Slime: **100** (easy patrol, stompable)
  - Bat: **200** (flying, harder to stomp)
  - Frog: **300** (tricky timing, only stompable on ground)
  - Spiky: **500** (un-stompable, must dodge — awarded if later game mechanics allow)
- Final score = monster kills + time bonus

### Leaderboard (`js/ui/leaderboard.js`)
- **Top 5 scores** stored in `localStorage` (key: `sophie_adventure_leaderboard`)
- Each entry: name (max 20 chars), score, stage, date
- Sorted highest→lowest; only top 5 kept
- Shown after winning (or name entry)
- Gold/silver/bronze coloring for ranks 1–3

### Name Entry (`js/ui/nameEntry.js`)
- Triggered on WIN if score qualifies for leaderboard
- Canvas-drawn overlay with text input box
- Keyboard captures all printable characters + Backspace + Enter
- Max **20 characters**, character count shown
- Enter confirms → entry saved → leaderboard displayed

### Game Flow (Updated)
1. MENU → (Space) → PLAYING
2. PLAYING → reach goal → WIN (birthday popup + score)
3. WIN → (Space after 3s) → NAME_ENTRY (if qualifies) or LEADERBOARD
4. NAME_ENTRY → (Enter) → LEADERBOARD
5. LEADERBOARD → (Space) → restart to PLAYING
6. PLAYING → die/timeout → GAME_OVER → (Space) → restart

---

## Future Ideas (To Be Discussed)
- [ ] Add more stages (Stage 2, 3, ...)
- [x] ~~Sound effects and background music~~ ✅ Done (2026-03-01)
- [x] ~~Timer + time-based scoring~~ ✅ Done (2026-03-01)
- [x] ~~High score persistence (localStorage)~~ ✅ Done (2026-03-01)
- [ ] Mobile touch controls
- [ ] Power-ups (speed boost, invincibility star, double jump)
- [ ] Coin/collectible system
- [ ] Boss monster at end of later stages
- [ ] Custom sprite art to replace geometric shapes
- [ ] Parallax background layers
- [ ] Screen shake on damage
