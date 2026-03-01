// ─── Stage 1: Sophie's First Adventure ───
// Layout config: platforms, monsters, goal, and metadata.
// Coordinates are in world pixels. Canvas is 800×450. Ground Y ~400.

export const stage1 = {
    name: "Sophie's First Adventure",
    width: 4000,
    background: '#87CEEB', // sky blue
    timeLimit: 100,         // seconds to complete the stage
    maxTimeScore: 10000,    // score awarded if completed instantly

    // Player spawn
    playerStart: { x: 60, y: 340 },

    // Platforms: { x, y, width, height?, isGround? }
    platforms: [
        // ── Section A (0–800): Tutorial flat ground ──
        { x: 0, y: 400, width: 750, height: 50, isGround: true },

        // ── Section B (800–1600): Gap + floating platform ──
        { x: 800, y: 400, width: 200, height: 50, isGround: true },
        { x: 880, y: 310, width: 100, height: 18 },             // floating
        { x: 1050, y: 280, width: 100, height: 18 },            // floating higher
        { x: 1200, y: 400, width: 300, height: 50, isGround: true },

        // ── Section C (1500–2400): Steps going up ──
        { x: 1500, y: 400, width: 200, height: 50, isGround: true },
        { x: 1600, y: 340, width: 120, height: 18 },            // step 1
        { x: 1750, y: 290, width: 120, height: 18 },            // step 2
        { x: 1900, y: 250, width: 120, height: 18 },            // step 3
        { x: 2050, y: 310, width: 150, height: 18 },            // landing
        { x: 2200, y: 400, width: 200, height: 50, isGround: true },

        // ── Section D (2400–3200): Narrow platforms over pit ──
        { x: 2400, y: 400, width: 150, height: 50, isGround: true },
        { x: 2600, y: 370, width: 80, height: 18 },             // narrow 1
        { x: 2730, y: 340, width: 80, height: 18 },             // narrow 2
        { x: 2860, y: 370, width: 80, height: 18 },             // narrow 3
        { x: 3000, y: 400, width: 200, height: 50, isGround: true },

        // ── Section E (3200–4000): Final run ──
        { x: 3200, y: 400, width: 800, height: 50, isGround: true },
        { x: 3400, y: 320, width: 100, height: 18 },            // bonus platform
        { x: 3600, y: 300, width: 100, height: 18 },            // bonus platform
    ],

    // Monsters: { type, x, y, ...extra props }
    monsters: [
        // Section A — 1 Slime for tutorial
        { type: 'slime', x: 400, y: 382, patrolRange: 120 },

        // Section B — 1 Bat over the gap
        { type: 'bat', x: 950, y: 240, patrolRange: 100 },

        // Section C — 2 Slimes + 1 Frog on the steps
        { type: 'slime', x: 1550, y: 382, patrolRange: 60 },
        { type: 'frog', x: 1800, y: 272 },
        { type: 'slime', x: 2100, y: 292, patrolRange: 40 },

        // Section D — 1 Spiky rolling below the narrow platforms
        { type: 'spiky', x: 2600, y: 378, patrolRange: 300 },

        // Section E — Mix: Slime, Bat, Frog
        { type: 'slime', x: 3300, y: 382, patrolRange: 80 },
        { type: 'bat', x: 3500, y: 260, patrolRange: 80 },
        { type: 'frog', x: 3650, y: 382 },
        { type: 'slime', x: 3800, y: 382, patrolRange: 60 },
    ],

    // Goal position (finish flag)
    goal: { x: 3920, y: 340 },

    // Decorative clouds (optional visual flair)
    clouds: [
        { x: 100, y: 60, size: 1.0 },
        { x: 500, y: 40, size: 1.3 },
        { x: 900, y: 70, size: 0.8 },
        { x: 1400, y: 30, size: 1.1 },
        { x: 1900, y: 55, size: 1.4 },
        { x: 2500, y: 45, size: 0.9 },
        { x: 3100, y: 65, size: 1.2 },
        { x: 3700, y: 35, size: 1.0 },
    ],

    // Decorative hills (background parallax)
    hills: [
        { x: 150, size: 1.0 },
        { x: 600, size: 1.5 },
        { x: 1100, size: 1.2 },
        { x: 1800, size: 1.8 },
        { x: 2500, size: 1.3 },
        { x: 3300, size: 1.6 },
    ],
};
