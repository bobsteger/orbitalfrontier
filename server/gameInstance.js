// Game instance - manages state for a single zone

export class GameInstance {
  constructor(zoneId) {
    this.zoneId = zoneId;
    this.maxPlayers = 32;
    this.players = new Map();
    this.npcs = new Map();
    this.projectiles = [];

    // Zone-specific configuration
    this.config = this.getZoneConfig(zoneId);

    // Game loop
    this.lastUpdate = Date.now();
    this.tickRate = 20; // Updates per second

    // Start game loop
    this.startGameLoop();
  }

  getZoneConfig(zoneId) {
    const configs = {
      earth_vicinity: {
        name: 'Earth Vicinity',
        safeZone: true,
        factionControl: 'earthAuthority',
        npcSpawns: ['patrol', 'trader']
      },
      moon_vicinity: {
        name: 'Moon Vicinity',
        safeZone: true,
        factionControl: 'lunarCollective',
        npcSpawns: ['miner', 'trader']
      },
      orbital_station: {
        name: 'Orbital Station',
        safeZone: true,
        factionControl: 'freeTradersGuild',
        npcSpawns: ['trader']
      },
      open_space_1: {
        name: 'Open Space Sector 1',
        safeZone: false,
        factionControl: null,
        npcSpawns: ['pirate', 'trader']
      }
    };

    return configs[zoneId] || configs.open_space_1;
  }

  startGameLoop() {
    setInterval(() => {
      this.update();
    }, 1000 / this.tickRate);
  }

  update() {
    const now = Date.now();
    const deltaTime = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    // Update NPCs
    this.updateNPCs(deltaTime);

    // Update projectiles
    this.updateProjectiles(deltaTime);

    // Check collisions
    this.checkCollisions();
  }

  updateNPCs(deltaTime) {
    for (const [id, npc] of this.npcs) {
      // Simple NPC AI would go here
      // For Phase 1, NPCs are static or follow simple patterns
    }
  }

  updateProjectiles(deltaTime) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];

      // Update position
      projectile.position.x += projectile.velocity.x * deltaTime;
      projectile.position.y += projectile.velocity.y * deltaTime;
      projectile.position.z += projectile.velocity.z * deltaTime;

      projectile.lifetime -= deltaTime;

      // Remove expired projectiles
      if (projectile.lifetime <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  checkCollisions() {
    // Check projectile-player collisions
    for (const projectile of this.projectiles) {
      for (const [playerId, player] of this.players) {
        if (projectile.ownerId === playerId) continue;

        const distance = this.distance3D(projectile.position, player.position);
        if (distance < 5) { // Hit radius
          // Handle hit
          player.damage = (player.damage || 0) + projectile.damage;
          projectile.lifetime = 0; // Mark for removal
        }
      }
    }
  }

  distance3D(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dz = p2.z - p1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // Player management
  addPlayer(playerId, playerData) {
    this.players.set(playerId, {
      id: playerId,
      position: playerData?.position || { x: 0, y: 0, z: 0 },
      rotation: playerData?.rotation || { x: 0, y: 0, z: 0, w: 1 },
      velocity: { x: 0, y: 0, z: 0 },
      shipType: playerData?.shipType || 'wanderer',
      hull: playerData?.hull || 100,
      shield: playerData?.shield || 50,
      joinedAt: Date.now()
    });
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  updatePlayer(playerId, data) {
    const player = this.players.get(playerId);
    if (!player) return;

    if (data.position) player.position = data.position;
    if (data.rotation) player.rotation = data.rotation;
    if (data.velocity) player.velocity = data.velocity;
  }

  getPlayerData(playerId) {
    return this.players.get(playerId);
  }

  getPlayerCount() {
    return this.players.size;
  }

  isFull() {
    return this.players.size >= this.maxPlayers;
  }

  // Combat processing
  processCombat(attackerId, data) {
    const { type, targetId, damage } = data;

    // Validate attacker
    const attacker = this.players.get(attackerId);
    if (!attacker) {
      return { success: false, message: 'Invalid attacker' };
    }

    // Check safe zone
    if (this.config.safeZone) {
      return { success: false, message: 'Combat not allowed in safe zone' };
    }

    // Create projectile
    const projectile = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ownerId: attackerId,
      position: { ...attacker.position },
      velocity: data.direction ? {
        x: data.direction.x * 500,
        y: data.direction.y * 500,
        z: data.direction.z * 500
      } : { x: 0, y: 0, z: 500 },
      damage: damage || 10,
      lifetime: 4 // seconds
    };

    this.projectiles.push(projectile);

    return {
      success: true,
      projectileId: projectile.id
    };
  }

  // Get full zone state
  getState() {
    const players = {};
    for (const [id, player] of this.players) {
      players[id] = {
        position: player.position,
        rotation: player.rotation,
        velocity: player.velocity,
        shipType: player.shipType
      };
    }

    const npcs = {};
    for (const [id, npc] of this.npcs) {
      npcs[id] = {
        position: npc.position,
        rotation: npc.rotation,
        type: npc.type
      };
    }

    return {
      zoneId: this.zoneId,
      config: this.config,
      players,
      npcs
    };
  }
}
