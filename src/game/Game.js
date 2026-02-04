import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color4 } from '@babylonjs/core/Maths/math.color';
import { SpaceScene } from './scenes/SpaceScene.js';
import { InputManager } from './systems/InputManager.js';
import { GameState } from './GameState.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.engine = null;
    this.activeScene = null;
    this.inputManager = null;
    this.gameState = null;
    this.scenes = {};
  }

  async initialize(onProgress) {
    // Create Babylon engine
    this.engine = new Engine(this.canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true
    });

    onProgress(20, 'Initializing systems...');

    // Initialize game state
    this.gameState = new GameState();

    // Initialize input manager
    this.inputManager = new InputManager(this.canvas);

    onProgress(40, 'Creating space environment...');

    // Create main space scene
    this.scenes.space = new SpaceScene(this.engine, this.inputManager, this.gameState);
    await this.scenes.space.initialize(onProgress);

    // Set active scene
    this.activeScene = this.scenes.space;

    onProgress(90, 'Finalizing...');
  }

  start() {
    // Run render loop
    this.engine.runRenderLoop(() => {
      if (this.activeScene) {
        this.activeScene.update();
        this.activeScene.render();
      }
    });
  }

  resize() {
    this.engine.resize();
  }

  switchScene(sceneName) {
    if (this.scenes[sceneName]) {
      this.activeScene = this.scenes[sceneName];
    }
  }

  dispose() {
    Object.values(this.scenes).forEach(scene => scene.dispose());
    this.inputManager.dispose();
    this.engine.dispose();
  }
}
