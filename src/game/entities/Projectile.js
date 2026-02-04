import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';

// Weapon types
export const WEAPON_TYPES = {
  pulseLaser: {
    name: 'Pulse Laser',
    type: 'energy',
    damage: 10,
    speed: 500,
    fireRate: 4, // shots per second
    energyCost: 5,
    range: 2000,
    color: new Color3(0.3, 0.8, 1)
  },
  autocannon: {
    name: 'Autocannon',
    type: 'ballistic',
    damage: 25,
    speed: 300,
    fireRate: 2,
    ammoCost: 1,
    range: 1500,
    color: new Color3(1, 0.8, 0.3)
  },
  missile: {
    name: 'Missile',
    type: 'guided',
    damage: 100,
    speed: 150,
    acceleration: 50,
    fireRate: 0.5,
    ammoCost: 1,
    range: 5000,
    trackingStrength: 2,
    color: new Color3(1, 0.3, 0.2)
  }
};

export class Projectile {
  constructor(scene, config) {
    this.scene = scene;
    this.weaponType = WEAPON_TYPES[config.weaponType] || WEAPON_TYPES.pulseLaser;
    this.position = config.position.clone();
    this.direction = config.direction.clone().normalize();
    this.velocity = this.direction.scale(this.weaponType.speed);
    this.owner = config.owner;
    this.target = config.target || null;
    this.distanceTraveled = 0;
    this.isAlive = true;

    // Create projectile mesh
    this.mesh = this.createProjectileMesh();
    this.mesh.position = this.position;

  }

  createProjectileMesh() {
    let mesh;

    switch (this.weaponType.type) {
      case 'energy':
        // Laser bolt - elongated glowing shape
        mesh = MeshBuilder.CreateCylinder('laser', {
          diameter: 0.3,
          height: 3,
          tessellation: 6
        }, this.scene);
        mesh.rotation.x = Math.PI / 2;
        break;

      case 'ballistic':
        // Bullet - small sphere
        mesh = MeshBuilder.CreateSphere('bullet', {
          diameter: 0.5,
          segments: 8
        }, this.scene);
        break;

      case 'guided':
        // Missile - cone shape
        mesh = MeshBuilder.CreateCylinder('missile', {
          diameterTop: 0,
          diameterBottom: 0.8,
          height: 2,
          tessellation: 8
        }, this.scene);
        mesh.rotation.x = Math.PI / 2;
        break;

      default:
        mesh = MeshBuilder.CreateSphere('projectile', {
          diameter: 0.5
        }, this.scene);
    }

    // Material
    const material = new StandardMaterial('projectileMat', this.scene);
    material.emissiveColor = this.weaponType.color;
    material.disableLighting = true;
    mesh.material = material;

    return mesh;
  }

  update(deltaTime) {
    if (!this.isAlive) return;

    // Guided missiles track their target
    if (this.weaponType.type === 'guided' && this.target && this.target.mesh) {
      const toTarget = this.target.mesh.position.subtract(this.position).normalize();
      const currentDirection = this.velocity.normalize();

      // Gradually turn toward target
      const newDirection = Vector3.Lerp(
        currentDirection,
        toTarget,
        this.weaponType.trackingStrength * deltaTime
      ).normalize();

      // Accelerate
      const speed = Math.min(
        this.velocity.length() + this.weaponType.acceleration * deltaTime,
        this.weaponType.speed * 2
      );

      this.velocity = newDirection.scale(speed);
    }

    // Update position
    const movement = this.velocity.scale(deltaTime);
    this.position.addInPlace(movement);
    this.mesh.position = this.position;

    // Orient projectile in direction of travel
    if (this.velocity.length() > 0) {
      const direction = this.velocity.normalize();
      this.mesh.lookAt(this.position.add(direction));
    }

    // Track distance traveled
    this.distanceTraveled += movement.length();

    // Check if exceeded range
    if (this.distanceTraveled > this.weaponType.range) {
      this.destroy();
    }
  }

  checkCollision(target) {
    if (!this.isAlive || !target || !target.mesh) return false;

    // Simple sphere collision
    const distance = Vector3.Distance(this.position, target.mesh.position);
    const hitRadius = 5; // Approximate ship size

    if (distance < hitRadius) {
      return true;
    }

    return false;
  }

  destroy() {
    this.isAlive = false;

    // Create small explosion effect
    this.createExplosion();

    // Cleanup
    setTimeout(() => {
      this.mesh.dispose();
    }, 100);
  }

  createExplosion() {
    // Simple flash effect
    const flash = MeshBuilder.CreateSphere('flash', {
      diameter: 2
    }, this.scene);
    flash.position = this.position.clone();

    const flashMaterial = new StandardMaterial('flashMat', this.scene);
    flashMaterial.emissiveColor = this.weaponType.color;
    flashMaterial.disableLighting = true;
    flashMaterial.alpha = 1;
    flash.material = flashMaterial;

    // Animate and remove
    let scale = 1;
    const expandInterval = setInterval(() => {
      scale += 0.5;
      flash.scaling = new Vector3(scale, scale, scale);
      flashMaterial.alpha -= 0.1;

      if (flashMaterial.alpha <= 0) {
        clearInterval(expandInterval);
        flash.dispose();
      }
    }, 16);
  }

  dispose() {
    this.mesh.dispose();
  }
}
