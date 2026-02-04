import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Projectile, WEAPON_TYPES } from '../entities/Projectile.js';

export class CombatSystem {
  constructor(scene, gameState) {
    this.scene = scene;
    this.gameState = gameState;

    this.projectiles = [];
    this.ships = []; // All ships that can be damaged

    // Weapon state
    this.weaponCooldowns = {};
    this.currentWeapon = 'pulseLaser';

    // Energy/ammo tracking
    this.energy = 100;
    this.maxEnergy = 100;
    this.energyRegenRate = 10; // per second

    this.ammo = {
      autocannon: 200,
      missile: 8
    };
  }

  registerShip(ship) {
    if (!this.ships.includes(ship)) {
      this.ships.push(ship);
    }
  }

  unregisterShip(ship) {
    const index = this.ships.indexOf(ship);
    if (index > -1) {
      this.ships.splice(index, 1);
    }
  }

  update(deltaTime) {
    // Regenerate energy
    this.energy = Math.min(this.maxEnergy, this.energy + this.energyRegenRate * deltaTime);

    // Update cooldowns
    for (const weapon in this.weaponCooldowns) {
      if (this.weaponCooldowns[weapon] > 0) {
        this.weaponCooldowns[weapon] -= deltaTime;
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];

      if (!projectile.isAlive) {
        this.projectiles.splice(i, 1);
        continue;
      }

      projectile.update(deltaTime);

      // Check collisions with all ships except owner
      for (const ship of this.ships) {
        if (ship === projectile.owner) continue;

        if (projectile.checkCollision(ship)) {
          this.handleHit(projectile, ship);
          break;
        }
      }
    }
  }

  fire(ship, weaponType = null) {
    const weapon = weaponType || this.currentWeapon;
    const weaponData = WEAPON_TYPES[weapon];

    if (!weaponData) return false;

    // Check cooldown
    if (this.weaponCooldowns[weapon] > 0) return false;

    // Check energy/ammo
    if (weaponData.energyCost && this.energy < weaponData.energyCost) return false;
    if (weaponData.ammoCost && (!this.ammo[weapon] || this.ammo[weapon] < weaponData.ammoCost)) return false;

    // Consume resources
    if (weaponData.energyCost) {
      this.energy -= weaponData.energyCost;
    }
    if (weaponData.ammoCost) {
      this.ammo[weapon] -= weaponData.ammoCost;
    }

    // Set cooldown
    this.weaponCooldowns[weapon] = 1 / weaponData.fireRate;

    // Calculate spawn position (in front of ship)
    const forward = ship.getForward();
    const spawnOffset = forward.scale(5);
    const spawnPosition = ship.mesh.position.add(spawnOffset);

    // Add ship velocity to projectile
    const projectileVelocity = ship.velocity ? ship.velocity.clone() : Vector3.Zero();

    // Create projectile
    const projectile = new Projectile(this.scene, {
      weaponType: weapon,
      position: spawnPosition,
      direction: forward.add(projectileVelocity.scale(0.01)).normalize(), // Lead slightly
      owner: ship,
      target: this.getClosestEnemy(ship)
    });

    this.projectiles.push(projectile);

    return true;
  }

  handleHit(projectile, ship) {
    const damage = projectile.weaponType.damage;

    // Apply damage to ship
    const destroyed = this.gameState.damageShip(damage);

    // Destroy projectile
    projectile.destroy();

    // Create hit effect
    this.createHitEffect(projectile.position, ship);

    if (destroyed) {
      this.handleShipDestroyed(ship);
    }
  }

  createHitEffect(position, ship) {
    // Visual feedback for hit
    // The explosion is already created by projectile.destroy()

    // TODO: Add screen shake, sound effect, etc.
  }

  handleShipDestroyed(ship) {
    // TODO: Handle ship destruction
    // - Spawn explosion
    // - Drop cargo
    // - Award bounty
    // - Respawn logic

    console.log('Ship destroyed:', ship);
  }

  getClosestEnemy(ship) {
    let closest = null;
    let closestDistance = Infinity;

    for (const other of this.ships) {
      if (other === ship) continue;

      // TODO: Check faction hostility

      const distance = Vector3.Distance(ship.mesh.position, other.mesh.position);
      if (distance < closestDistance) {
        closest = other;
        closestDistance = distance;
      }
    }

    return closest;
  }

  setCurrentWeapon(weaponType) {
    if (WEAPON_TYPES[weaponType]) {
      this.currentWeapon = weaponType;
    }
  }

  cycleWeapon() {
    const weapons = Object.keys(WEAPON_TYPES);
    const currentIndex = weapons.indexOf(this.currentWeapon);
    const nextIndex = (currentIndex + 1) % weapons.length;
    this.currentWeapon = weapons[nextIndex];
    return this.currentWeapon;
  }

  getWeaponStatus() {
    const weapon = WEAPON_TYPES[this.currentWeapon];
    return {
      name: weapon.name,
      type: this.currentWeapon,
      ready: (this.weaponCooldowns[this.currentWeapon] || 0) <= 0,
      cooldown: Math.max(0, this.weaponCooldowns[this.currentWeapon] || 0),
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      ammo: this.ammo[this.currentWeapon] || null
    };
  }

  dispose() {
    for (const projectile of this.projectiles) {
      projectile.dispose();
    }
    this.projectiles = [];
  }
}
