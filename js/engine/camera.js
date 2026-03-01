// ─── Camera ───
// Follows Sophie horizontally, clamped to stage bounds.

import { CANVAS_WIDTH, CANVAS_HEIGHT, CAMERA_LEAD } from '../config.js';

export class Camera {
    constructor(stageWidth) {
        this.x = 0;
        this.y = 0;
        this.stageWidth = stageWidth;
    }

    /** Call each frame with the player reference */
    update(player) {
        // Camera tries to keep player CAMERA_LEAD px from the left edge
        const target = player.x - CAMERA_LEAD;
        // Smooth lerp
        this.x += (target - this.x) * 0.1;
        // Clamp so we don't show outside the stage
        this.x = Math.max(0, Math.min(this.x, this.stageWidth - CANVAS_WIDTH));
    }
}
