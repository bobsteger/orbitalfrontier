// Game state manager - tracks player data, credits, cargo, etc.

export class GameState {
  constructor() {
    // Player data
    this.player = {
      name: 'Pilot',
      credits: 10000, // Starting credits
      currentLocation: 'open_space', // earth_base, moon_base, orbital_station, open_space
      isDocked: false
    };

    // Player ship state
    this.ship = {
      type: 'transport',
      hull: 300,
      maxHull: 300,
      shield: 50,
      maxShield: 50,
      cargo: [],
      cargoCapacity: 500,
      fuel: 100,
      maxFuel: 100
    };

    // Faction reputations (-100 to 100)
    this.reputation = {
      earthAuthority: 0,
      lunarCollective: 0,
      freeTradersGuild: 0,
      voidRunners: -50 // Start hostile with pirates
    };

    // Game settings
    this.settings = {
      flightAssist: true,
      musicVolume: 0.5,
      sfxVolume: 0.7
    };
  }

  // Credit management
  addCredits(amount) {
    this.player.credits += amount;
  }

  removeCredits(amount) {
    if (this.player.credits >= amount) {
      this.player.credits -= amount;
      return true;
    }
    return false;
  }

  // Cargo management
  addCargo(item, quantity) {
    const currentCargo = this.getCargoWeight();
    if (currentCargo + quantity <= this.ship.cargoCapacity) {
      const existing = this.ship.cargo.find(c => c.item === item);
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.ship.cargo.push({ item, quantity });
      }
      return true;
    }
    return false;
  }

  removeCargo(item, quantity) {
    const existing = this.ship.cargo.find(c => c.item === item);
    if (existing && existing.quantity >= quantity) {
      existing.quantity -= quantity;
      if (existing.quantity === 0) {
        this.ship.cargo = this.ship.cargo.filter(c => c.item !== item);
      }
      return true;
    }
    return false;
  }

  getCargoWeight() {
    return this.ship.cargo.reduce((sum, c) => sum + c.quantity, 0);
  }

  // Ship damage/repair
  damageShip(amount) {
    // Shield absorbs damage first
    if (this.ship.shield > 0) {
      const shieldDamage = Math.min(this.ship.shield, amount);
      this.ship.shield -= shieldDamage;
      amount -= shieldDamage;
    }

    // Remaining damage goes to hull
    this.ship.hull = Math.max(0, this.ship.hull - amount);

    return this.ship.hull <= 0; // Returns true if destroyed
  }

  repairShip(hullAmount, shieldAmount) {
    this.ship.hull = Math.min(this.ship.maxHull, this.ship.hull + hullAmount);
    this.ship.shield = Math.min(this.ship.maxShield, this.ship.shield + shieldAmount);
  }

  // Location management
  setLocation(location, isDocked = false) {
    this.player.currentLocation = location;
    this.player.isDocked = isDocked;
  }

  // Reputation management
  modifyReputation(faction, amount) {
    if (this.reputation.hasOwnProperty(faction)) {
      this.reputation[faction] = Math.max(-100, Math.min(100, this.reputation[faction] + amount));
    }
  }

  getReputationLevel(faction) {
    const rep = this.reputation[faction];
    if (rep <= -75) return 'hostile';
    if (rep <= -25) return 'unfriendly';
    if (rep < 25) return 'neutral';
    if (rep < 75) return 'friendly';
    return 'allied';
  }

  // Serialize for saving
  toJSON() {
    return {
      player: this.player,
      ship: this.ship,
      reputation: this.reputation,
      settings: this.settings
    };
  }

  // Load from saved data
  fromJSON(data) {
    if (data.player) this.player = { ...this.player, ...data.player };
    if (data.ship) this.ship = { ...this.ship, ...data.ship };
    if (data.reputation) this.reputation = { ...this.reputation, ...data.reputation };
    if (data.settings) this.settings = { ...this.settings, ...data.settings };
  }
}
