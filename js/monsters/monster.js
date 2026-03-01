// ─── Base Monster ───
import { Entity } from '../entities/entity.js';

export class Monster extends Entity {
    /**
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {string} color
     * @param {boolean} canBeStomped - if false, any contact hurts Sophie
     */
    constructor(x, y, width, height, color, canBeStomped = true) {
        super(x, y, width, height, color);
        this.canBeStomped = canBeStomped;
        this.originX = x;
        this.originY = y;
        this.patrolRange = 100; // default patrol distance
        this.direction = 1;     // 1 = right, -1 = left
        this.scoreValue = 100;  // base points for defeating this monster
    }

    /** Called when Sophie stomps this monster */
    onStomped() {
        if (!this.canBeStomped) return false;
        this.isAlive = false;
        return true;
    }
}
