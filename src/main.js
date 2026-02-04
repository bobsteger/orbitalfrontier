import { Game } from './game/Game.js';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  const canvas = document.getElementById('gameCanvas');
  const loadingScreen = document.getElementById('loadingScreen');
  const loadingProgress = document.getElementById('loadingProgress');
  const loadingText = document.getElementById('loadingText');

  // Progress callback for loading screen
  const onProgress = (progress, message) => {
    loadingProgress.style.width = `${progress}%`;
    loadingText.textContent = message;
  };

  try {
    // Initialize game
    const game = new Game(canvas);

    onProgress(10, 'Creating engine...');
    await game.initialize(onProgress);

    onProgress(100, 'Ready!');

    // Hide loading screen
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 500);

    // Start game loop
    game.start();

    // Handle window resize
    window.addEventListener('resize', () => {
      game.resize();
    });

    // Expose game instance for debugging in development
    if (import.meta.env.DEV) {
      window.game = game;
    }

  } catch (error) {
    console.error('Failed to initialize game:', error);
    loadingText.textContent = 'Failed to load game. Please refresh.';
    loadingText.style.color = '#ff5252';
  }
});
