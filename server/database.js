// Database manager for player accounts and persistent data
// Phase 1: In-memory storage (stubbed)
// Phase 2: SQLite/PostgreSQL implementation

export class Database {
  constructor() {
    // In-memory storage for Phase 1
    this.players = new Map();
    this.ships = new Map();
    this.transactions = [];

    console.log('Database: Using in-memory storage (Phase 1)');
  }

  // Player account management
  async createPlayer(username, passwordHash) {
    const id = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const player = {
      id,
      username,
      passwordHash,
      credits: 10000, // Starting credits
      reputation: {
        earthAuthority: 0,
        lunarCollective: 0,
        freeTradersGuild: 0,
        voidRunners: -50
      },
      createdAt: Date.now(),
      lastLogin: Date.now()
    };

    this.players.set(id, player);

    // Create default ship
    await this.createShip(id, 'wanderer');

    return { id, username };
  }

  async getPlayer(id) {
    return this.players.get(id) || null;
  }

  async getPlayerByUsername(username) {
    for (const player of this.players.values()) {
      if (player.username === username) {
        return player;
      }
    }
    return null;
  }

  async updatePlayer(id, updates) {
    const player = this.players.get(id);
    if (!player) return false;

    Object.assign(player, updates);
    return true;
  }

  // Ship management
  async createShip(playerId, shipType) {
    const id = `ship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const shipDefaults = {
      wanderer: { maxHull: 100, maxShield: 50, cargoCapacity: 50 },
      talon: { maxHull: 60, maxShield: 80, cargoCapacity: 10 },
      hauler: { maxHull: 200, maxShield: 30, cargoCapacity: 200 }
    };

    const defaults = shipDefaults[shipType] || shipDefaults.wanderer;

    const ship = {
      id,
      playerId,
      type: shipType,
      hull: defaults.maxHull,
      maxHull: defaults.maxHull,
      shield: defaults.maxShield,
      maxShield: defaults.maxShield,
      cargo: [],
      cargoCapacity: defaults.cargoCapacity,
      upgrades: {},
      position: { x: 0, y: 0, z: 0 },
      currentZone: 'orbital_station'
    };

    this.ships.set(id, ship);
    return ship;
  }

  async getShip(id) {
    return this.ships.get(id) || null;
  }

  async getPlayerShips(playerId) {
    const ships = [];
    for (const ship of this.ships.values()) {
      if (ship.playerId === playerId) {
        ships.push(ship);
      }
    }
    return ships;
  }

  async updateShip(id, updates) {
    const ship = this.ships.get(id);
    if (!ship) return false;

    Object.assign(ship, updates);
    return true;
  }

  // Transaction logging (for economy tracking)
  async logTransaction(playerId, type, details) {
    const transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerId,
      type, // 'trade', 'repair', 'upgrade', 'mission', 'combat'
      details,
      timestamp: Date.now()
    };

    this.transactions.push(transaction);

    // Keep only last 10000 transactions in memory
    if (this.transactions.length > 10000) {
      this.transactions = this.transactions.slice(-10000);
    }

    return transaction;
  }

  async getPlayerTransactions(playerId, limit = 100) {
    return this.transactions
      .filter(t => t.playerId === playerId)
      .slice(-limit);
  }

  // Leaderboard queries
  async getLeaderboard(type, limit = 10) {
    const players = Array.from(this.players.values());

    switch (type) {
      case 'credits':
        return players
          .sort((a, b) => b.credits - a.credits)
          .slice(0, limit)
          .map(p => ({ username: p.username, credits: p.credits }));

      case 'reputation':
        // Total positive reputation
        return players
          .map(p => ({
            username: p.username,
            reputation: Object.values(p.reputation).reduce((sum, r) => sum + Math.max(0, r), 0)
          }))
          .sort((a, b) => b.reputation - a.reputation)
          .slice(0, limit);

      default:
        return [];
    }
  }

  // Cleanup/shutdown
  close() {
    console.log('Database: Closing connection');
    // In Phase 2, this would close SQLite/PostgreSQL connections
  }

  // Export data (for debugging/backup)
  export() {
    return {
      players: Array.from(this.players.values()),
      ships: Array.from(this.ships.values()),
      transactions: this.transactions
    };
  }

  // Import data (for debugging/restore)
  import(data) {
    if (data.players) {
      this.players.clear();
      for (const player of data.players) {
        this.players.set(player.id, player);
      }
    }

    if (data.ships) {
      this.ships.clear();
      for (const ship of data.ships) {
        this.ships.set(ship.id, ship);
      }
    }

    if (data.transactions) {
      this.transactions = data.transactions;
    }
  }
}
