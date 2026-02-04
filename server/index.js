// Orbital Frontier - Game Server
// Phase 1: Stubbed for single-player demo
// Phase 2: Full multiplayer implementation

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GameInstance } from './gameInstance.js';
import { Database } from './database.js';

const PORT = process.env.PORT || 3001;

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Initialize database
const db = new Database();

// Game instances (one per zone)
const gameInstances = {
  earth_vicinity: new GameInstance('earth_vicinity'),
  moon_vicinity: new GameInstance('moon_vicinity'),
  orbital_station: new GameInstance('orbital_station'),
  open_space_1: new GameInstance('open_space_1')
};

// REST API routes
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Get server status
app.get('/status', (req, res) => {
  const status = {};
  for (const [zone, instance] of Object.entries(gameInstances)) {
    status[zone] = {
      players: instance.getPlayerCount(),
      maxPlayers: instance.maxPlayers
    };
  }
  res.json(status);
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  let currentZone = null;
  let playerId = socket.id;

  // Player joins a zone
  socket.on('join_zone', (data) => {
    const { zone, playerData } = data;

    if (!gameInstances[zone]) {
      socket.emit('error', { message: 'Invalid zone' });
      return;
    }

    // Leave current zone if in one
    if (currentZone) {
      gameInstances[currentZone].removePlayer(playerId);
      socket.leave(currentZone);
    }

    // Join new zone
    currentZone = zone;
    socket.join(zone);
    gameInstances[zone].addPlayer(playerId, playerData);

    // Send zone state to player
    socket.emit('zone_state', gameInstances[zone].getState());

    // Notify others in zone
    socket.to(zone).emit('player_joined', {
      playerId,
      playerData
    });
  });

  // Position update from player
  socket.on('position_update', (data) => {
    if (!currentZone) return;

    gameInstances[currentZone].updatePlayer(playerId, data);

    // Broadcast to others in zone
    socket.to(currentZone).emit('player_moved', {
      playerId,
      ...data
    });
  });

  // Combat event
  socket.on('combat_event', (data) => {
    if (!currentZone) return;

    const result = gameInstances[currentZone].processCombat(playerId, data);

    // Broadcast to all in zone
    io.to(currentZone).emit('combat_result', result);
  });

  // Zone transfer request
  socket.on('zone_transfer', (data) => {
    const { targetZone } = data;

    if (!gameInstances[targetZone]) {
      socket.emit('error', { message: 'Invalid target zone' });
      return;
    }

    // Check if target zone has space
    if (gameInstances[targetZone].isFull()) {
      socket.emit('error', { message: 'Target zone is full' });
      return;
    }

    // Get player data from current zone
    const playerData = currentZone ? gameInstances[currentZone].getPlayerData(playerId) : null;

    // Remove from current zone
    if (currentZone) {
      gameInstances[currentZone].removePlayer(playerId);
      socket.leave(currentZone);
      socket.to(currentZone).emit('player_left', { playerId });
    }

    // Add to new zone
    currentZone = targetZone;
    socket.join(targetZone);
    gameInstances[targetZone].addPlayer(playerId, playerData);

    // Send new zone state
    socket.emit('zone_transferred', {
      zone: targetZone,
      state: gameInstances[targetZone].getState()
    });

    socket.to(targetZone).emit('player_joined', { playerId, playerData });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    if (currentZone) {
      gameInstances[currentZone].removePlayer(playerId);
      socket.to(currentZone).emit('player_left', { playerId });
    }
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Orbital Frontier server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  httpServer.close(() => {
    db.close();
    process.exit(0);
  });
});
