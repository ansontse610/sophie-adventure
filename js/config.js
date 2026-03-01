// ─── Game Configuration Constants ───
// Tweak these values to adjust game feel.

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 450;

// Physics
export const GRAVITY = 1400;           // px/s²
export const MAX_FALL_SPEED = 600;     // px/s terminal velocity

// Player
export const PLAYER_SPEED = 220;       // px/s horizontal
export const PLAYER_JUMP_FORCE = 520;  // px/s upward impulse
export const PLAYER_STOMP_BOUNCE = 350;// px/s bounce after stomping a monster
export const PLAYER_WIDTH = 28;
export const PLAYER_HEIGHT = 40;
export const PLAYER_LIVES = 3;
export const INVINCIBLE_DURATION = 1.5;// seconds of invincibility after hit

// Monsters
export const SLIME_SPEED = 60;
export const BAT_SPEED = 80;
export const BAT_WAVE_AMP = 40;        // vertical sine amplitude
export const BAT_WAVE_FREQ = 2;        // oscillations per second
export const SPIKY_SPEED = 120;
export const FROG_SIT_TIME = 2;        // seconds between jumps
export const FROG_JUMP_FORCE = 400;

// Camera
export const CAMERA_LEAD = 250;        // px ahead of player to show

// Colors (geometric shape palette)
export const COLORS = {
    sky:        '#87CEEB',
    ground:     '#8B5E3C',
    groundTop:  '#6DBE45',
    platform:   '#A0522D',
    platformTop:'#7EC850',
    player: {
        body:    '#FF69B4',
        head:    '#FFDAB9',
        hair:    '#8B4513',
        bow:     '#FF1493',
        eyes:    '#333333',
        skirt:   '#FF69B4',
        legs:    '#FFDAB9',
        shoes:   '#FF1493',
    },
    slime:      '#32CD32',
    slimeEye:   '#FFFFFF',
    bat:        '#9370DB',
    batWing:    '#7B68EE',
    spiky:      '#DC143C',
    spikySpike: '#FF4500',
    frog:       '#4169E1',
    frogEye:    '#FFFFFF',
    goal:       '#FFD700',
    goalStar:   '#FFF700',
    hud:        '#FFFFFF',
    hudShadow:  '#000000',
};
