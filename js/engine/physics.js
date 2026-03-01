// ─── Physics Utilities ───
import { GRAVITY, MAX_FALL_SPEED } from '../config.js';

/**
 * Apply gravity to an entity that has velocityY.
 * @param {object} entity - must have velocityY
 * @param {number} dt - delta time in seconds
 */
export function applyGravity(entity, dt) {
    entity.velocityY += GRAVITY * dt;
    if (entity.velocityY > MAX_FALL_SPEED) {
        entity.velocityY = MAX_FALL_SPEED;
    }
}

/**
 * AABB overlap test.
 * Returns true if the two rectangles overlap.
 */
export function checkCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

/**
 * Resolve a moving entity landing on top of a platform.
 * Returns true if the entity was snapped onto the platform.
 */
export function resolveTopCollision(entity, platform, prevY) {
    const entityBottom = entity.y + entity.height;
    const prevBottom = prevY + entity.height;

    // Was above platform top last frame, now overlapping
    if (prevBottom <= platform.y && entityBottom > platform.y) {
        // Horizontal overlap check
        if (entity.x + entity.width > platform.x && entity.x < platform.x + platform.width) {
            entity.y = platform.y - entity.height;
            entity.velocityY = 0;
            entity.grounded = true;
            return true;
        }
    }
    return false;
}
