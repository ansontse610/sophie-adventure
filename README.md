# 🎮 Sophie's Adventure

A web-based platformer game built with vanilla HTML5 Canvas and JavaScript.  
Help 10-year-old Sophie run, jump, and stomp her way through monsters to reach the goal!

## 🎂 Special Feature

When Sophie reaches the finish flag, a **"Happy Birthday to Sophie!"** celebration pops up — complete with confetti and a rising **"10" balloon**!

## 🕹️ Controls

| Key | Action |
|-----|--------|
| `←` Arrow Left | Move left |
| `→` Arrow Right | Move right |
| `Space` | Jump |

## 👾 Monsters

| Monster | Behavior | Stompable? |
|---------|----------|------------|
| **Slime** (green) | Patrols left-right on ground | ✅ Yes |
| **Bat** (purple) | Flies with sine-wave pattern | ✅ Yes |
| **Spiky** (red) | Rolls fast along ground | ❌ No — jump over! |
| **Frog** (blue) | Sits, then jumps periodically | ✅ On ground only |

## 🚀 How to Run Locally

ES Modules require serving over HTTP (not `file://`). Use any of these:

```bash
# Option 1: Node.js serve
npx serve .

# Option 2: Python
python -m http.server 8000

# Option 3: VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then open `http://localhost:3000` (or whichever port) in your browser.

## 🌐 GitHub Pages Deployment

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch → main → / (root)**
4. Your game will be live at `https://<username>.github.io/sophie-adventure/`

## 📁 Project Structure

```
sophie-adventure/
├── index.html              # Entry point
├── css/style.css           # Canvas + page styling
├── js/
│   ├── main.js             # Bootstrap
│   ├── config.js           # Game constants & colors
│   ├── engine/
│   │   ├── game.js         # Game loop & state machine
│   │   ├── input.js        # Keyboard handler
│   │   ├── physics.js      # Gravity & collision
│   │   └── camera.js       # Viewport scrolling
│   ├── entities/
│   │   ├── entity.js       # Base class
│   │   ├── player.js       # Sophie
│   │   ├── platform.js     # Ground & platforms
│   │   └── goal.js         # Finish flag
│   ├── monsters/
│   │   ├── monster.js      # Base monster class
│   │   ├── slime.js        # Green patrol blob
│   │   ├── bat.js          # Purple flyer
│   │   ├── spiky.js        # Red un-stompable ball
│   │   └── frog.js         # Blue jumping frog
│   ├── stages/
│   │   └── stage1.js       # Level 1 layout
│   └── ui/
│       ├── hud.js          # Lives & score display
│       └── popup.js        # Birthday celebration
├── DECISIONS.md            # Design decisions log
└── README.md               # This file
```

## 🔧 Extending the Game

- **New stage**: Create `js/stages/stage2.js` with the same config shape as `stage1.js`
- **New monster**: Create a class in `js/monsters/`, extend `Monster`, register it in `MONSTER_TYPES` inside `game.js`
- **Tune gameplay**: Edit values in `js/config.js` (gravity, speed, jump force, etc.)

## License

Made with ❤️ for Sophie's 10th birthday.
