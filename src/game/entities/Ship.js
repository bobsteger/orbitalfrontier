import { Vector3, Quaternion } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Mesh } from '@babylonjs/core/Meshes/mesh';

// Ship types and their stats
export const SHIP_TYPES = {
  wanderer: {
    name: 'Wanderer',
    class: 'All-Rounder',
    mass: 1000,
    thrust: 5000,
    agility: 2.0,
    maxHull: 100,
    maxShield: 50,
    cargoCapacity: 50,
    hardpoints: 2
  },
  talon: {
    name: 'Talon',
    class: 'Fighter',
    mass: 600,
    thrust: 6000,
    agility: 3.5,
    maxHull: 60,
    maxShield: 80,
    cargoCapacity: 10,
    hardpoints: 4
  },
  hauler: {
    name: 'Hauler',
    class: 'Freighter',
    mass: 3000,
    thrust: 8000,
    agility: 0.8,
    maxHull: 200,
    maxShield: 30,
    cargoCapacity: 200,
    hardpoints: 1
  }
};

export class Ship {
  constructor(scene, shipState) {
    this.scene = scene;
    this.state = shipState;
    this.type = SHIP_TYPES[shipState.type] || SHIP_TYPES.wanderer;

    // Physics state
    this.velocity = Vector3.Zero();
    this.angularVelocity = Vector3.Zero();

    // Create ship mesh
    this.mesh = this.createShipMesh();

    // Engine particles (visual feedback for thrust)
    this.engineGlow = this.createEngineGlow();
    this.thrustLevel = 0;
  }

  createShipMesh() {
    // Create a simple ship shape using primitives
    // In production, this would load a GLTF model

    // Main hull (elongated octahedron-like shape)
    const hull = MeshBuilder.CreatePolyhedron('shipHull', {
      type: 1, // Octahedron
      size: 2
    }, this.scene);

    // Scale to ship proportions
    hull.scaling = new Vector3(1.5, 0.5, 2.5);

    // Cockpit
    const cockpit = MeshBuilder.CreateSphere('cockpit', {
      diameter: 1.2,
      segments: 16
    }, this.scene);
    cockpit.position = new Vector3(0, 0.3, 1.5);
    cockpit.parent = hull;

    // Wings
    const wingL = MeshBuilder.CreateBox('wingL', {
      width: 3,
      height: 0.1,
      depth: 1.5
    }, this.scene);
    wingL.position = new Vector3(-2, 0, -0.5);
    wingL.rotation.z = -0.2;
    wingL.parent = hull;

    const wingR = MeshBuilder.CreateBox('wingR', {
      width: 3,
      height: 0.1,
      depth: 1.5
    }, this.scene);
    wingR.position = new Vector3(2, 0, -0.5);
    wingR.rotation.z = 0.2;
    wingR.parent = hull;

    // Engine pods
    const engineL = MeshBuilder.CreateCylinder('engineL', {
      diameter: 0.6,
      height: 1.5
    }, this.scene);
    engineL.position = new Vector3(-1.5, -0.2, -2.5);
    engineL.rotation.x = Math.PI / 2;
    engineL.parent = hull;

    const engineR = MeshBuilder.CreateCylinder('engineR', {
      diameter: 0.6,
      height: 1.5
    }, this.scene);
    engineR.position = new Vector3(1.5, -0.2, -2.5);
    engineR.rotation.x = Math.PI / 2;
    engineR.parent = hull;

    // Materials
    const hullMaterial = new StandardMaterial('hullMaterial', this.scene);
    hullMaterial.diffuseColor = new Color3(0.4, 0.45, 0.5);
    hullMaterial.specularColor = new Color3(0.6, 0.6, 0.6);
    hullMaterial.specularPower = 32;
    hull.material = hullMaterial;
    wingL.material = hullMaterial;
    wingR.material = hullMaterial;
    engineL.material = hullMaterial;
    engineR.material = hullMaterial;

    const cockpitMaterial = new StandardMaterial('cockpitMaterial', this.scene);
    cockpitMaterial.diffuseColor = new Color3(0.2, 0.3, 0.4);
    cockpitMaterial.specularColor = new Color3(0.8, 0.9, 1);
    cockpitMaterial.specularPower = 64;
    cockpitMaterial.alpha = 0.8;
    cockpit.material = cockpitMaterial;

    // Enable rotation quaternion for proper 3D rotation
    hull.rotationQuaternion = Quaternion.Identity();

    return hull;
  }

  createEngineGlow() {
    // Create engine glow meshes
    const glowMaterial = new StandardMaterial('engineGlowMat', this.scene);
    glowMaterial.emissiveColor = new Color3(0.3, 0.6, 1);
    glowMaterial.disableLighting = true;
    glowMaterial.alpha = 0.5;

    const glowL = MeshBuilder.CreateSphere('glowL', { diameter: 0.5 }, this.scene);
    glowL.position = new Vector3(-1.5, -0.2, -3.2);
    glowL.material = glowMaterial;
    glowL.parent = this.mesh;

    const glowR = MeshBuilder.CreateSphere('glowR', { diameter: 0.5 }, this.scene);
    glowR.position = new Vector3(1.5, -0.2, -3.2);
    glowR.material = glowMaterial;
    glowR.parent = this.mesh;

    return { left: glowL, right: glowR, material: glowMaterial };
  }

  setThrustLevel(level) {
    this.thrustLevel = Math.max(0, Math.min(1, level));

    // Update engine glow based on thrust
    const intensity = 0.3 + this.thrustLevel * 0.7;
    const scale = 0.5 + this.thrustLevel * 1.5;

    this.engineGlow.material.emissiveColor = new Color3(
      0.3 + this.thrustLevel * 0.2,
      0.6 - this.thrustLevel * 0.2,
      1 - this.thrustLevel * 0.5
    );
    this.engineGlow.material.alpha = intensity;

    this.engineGlow.left.scaling = new Vector3(scale, scale, scale + this.thrustLevel * 2);
    this.engineGlow.right.scaling = new Vector3(scale, scale, scale + this.thrustLevel * 2);
  }

  // Get forward direction based on current rotation
  getForward() {
    const forward = new Vector3(0, 0, 1);
    if (this.mesh.rotationQuaternion) {
      forward.rotateByQuaternionToRef(this.mesh.rotationQuaternion, forward);
    }
    return forward;
  }

  // Get right direction based on current rotation
  getRight() {
    const right = new Vector3(1, 0, 0);
    if (this.mesh.rotationQuaternion) {
      right.rotateByQuaternionToRef(this.mesh.rotationQuaternion, right);
    }
    return right;
  }

  // Get up direction based on current rotation
  getUp() {
    const up = new Vector3(0, 1, 0);
    if (this.mesh.rotationQuaternion) {
      up.rotateByQuaternionToRef(this.mesh.rotationQuaternion, up);
    }
    return up;
  }

  // Get current speed (magnitude of velocity)
  getSpeed() {
    return this.velocity.length();
  }

  dispose() {
    this.mesh.dispose();
  }
}
