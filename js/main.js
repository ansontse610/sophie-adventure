// ─── Main Entry Point ───
// Bootstrap the game, load Stage 1, and start the loop.

import { Game } from './engine/game.js';
import { stage1 } from './stages/stage1.js';

const canvas = document.getElementById('game');
const game = new Game(canvas);

game.loadStage(stage1);
game.start();

// For debugging in console
window.__game = game;
