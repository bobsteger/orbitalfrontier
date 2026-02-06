import { Vector3, Quaternion } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Mesh } from '@babylonjs/core/Meshes/mesh';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF';

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
  },
  transport: {
    name: 'Transport',
    class: 'Freighter',
    mass: 5000,
    thrust: 10000,
    agility: 0.5,
    maxHull: 300,
    maxShield: 50,
    cargoCapacity: 500,
    hardpoints: 2
  }
};

// Ship design configurations - maps ship types to their visual representation
export const SHIP_DESIGNS = {
  wanderer: {
    type: 'procedural',
    design: 'default'
  },
  talon: {
    type: 'procedural',
    design: 'default'
  },
  hauler: {
    type: 'procedural',
    design: 'default'
  },
  transport: {
    type: 'model',
    modelPath: 'assets/models/futuristic_transport_ship.glb',
    scale: new Vector3(1, 1, 1),
    rotation: new Vector3(0, 0, 0)
  }
};

export class Ship {
  constructor(scene, shipState) {
    this.scene = scene;
    this.state = shipState;
    this.type = SHIP_TYPES[shipState.type] || SHIP_TYPES.wanderer;
    this.design = SHIP_DESIGNS[shipState.type] || SHIP_DESIGNS.wanderer;

    // Physics state
    this.velocity = Vector3.Zero();
    this.angularVelocity = Vector3.Zero();

    // Model loading state
    this.modelLoaded = false;
    this.loadedMeshes = null;

    // Create ship mesh (procedural placeholder or final mesh)
    this.mesh = this.createShipMesh();

    // Load GLB model if this ship type uses one
    if (this.design.type === 'model') {
      this.loadShipModel();
    } else {
      this.modelLoaded = true;
    }

    // Engine particles (visual feedback for thrust)
    this.engineGlow = this.createEngineGlow();
    this.thrustLevel = 0;
  }

  async loadShipModel() {
    try {
      const result = await SceneLoader.ImportMeshAsync(
        '',
        '',
        this.design.modelPath,
        this.scene
      );

      this.loadedMeshes = result.meshes;

      // Find the root mesh (usually __root__ or the first mesh)
      const rootMesh = result.meshes[0];

      // Store current position and rotation from placeholder
      const currentPosition = this.mesh.position.clone();
      const currentRotation = this.mesh.rotationQuaternion ?
        this.mesh.rotationQuaternion.clone() : Quaternion.Identity();

      // Dispose of placeholder mesh and its children
      this.mesh.getChildMeshes().forEach(child => child.dispose());
      this.mesh.dispose();

      // Set up the loaded model
      this.mesh = rootMesh;
      this.mesh.position = currentPosition;
      this.mesh.rotationQuaternion = currentRotation;

      // Apply design scale and rotation adjustments
      if (this.design.scale) {
        this.mesh.scaling = this.design.scale.clone();
      }
      if (this.design.rotation) {
        const adjustQuat = Quaternion.FromEulerAngles(
          this.design.rotation.x,
          this.design.rotation.y,
          this.design.rotation.z
        );
        this.mesh.rotationQuaternion = currentRotation.multiply(adjustQuat);
      }

      // Recreate engine glow for the new mesh
      if (this.engineGlow) {
        this.engineGlow.left.dispose();
        this.engineGlow.right.dispose();
        this.engineGlow = this.createEngineGlow();
      }

      this.modelLoaded = true;
      console.log(`Loaded ship model: ${this.design.modelPath}`);
    } catch (error) {
      console.error(`Failed to load ship model: ${this.design.modelPath}`, error);
      // Keep using placeholder mesh on failure
      this.modelLoaded = true;
    }
  }

  createShipMesh() {
    // Check if this ship type uses a custom model
    if (this.design.type === 'model') {
      // Create a simple placeholder while the model loads
      return this.createPlaceholderMesh();
    }

    // Create procedural ship mesh based on design type
    return this.createProceduralMesh();
  }

  createPlaceholderMesh() {
    // Simple box placeholder while model loads
    const placeholder = MeshBuilder.CreateBox('shipPlaceholder', {
      width: 4,
      height: 2,
      depth: 6
    }, this.scene);

    const placeholderMaterial = new StandardMaterial('placeholderMat', this.scene);
    placeholderMaterial.diffuseColor = new Color3(0.3, 0.3, 0.3);
    placeholderMaterial.alpha = 0.5;
    placeholder.material = placeholderMaterial;

    placeholder.rotationQuaternion = Quaternion.Identity();

    return placeholder;
  }

  createProceduralMesh() {
    // Create a simple ship shape using primitives

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
    // Dispose engine glow
    if (this.engineGlow) {
      this.engineGlow.left.dispose();
      this.engineGlow.right.dispose();
      if (this.engineGlow.material) {
        this.engineGlow.material.dispose();
      }
    }

    // Dispose loaded model meshes
    if (this.loadedMeshes) {
      this.loadedMeshes.forEach(mesh => {
        if (mesh.material) {
          mesh.material.dispose();
        }
        mesh.dispose();
      });
    } else {
      // Dispose procedural mesh and children
      this.mesh.getChildMeshes().forEach(child => {
        if (child.material) {
          child.material.dispose();
        }
        child.dispose();
      });
      if (this.mesh.material) {
        this.mesh.material.dispose();
      }
      this.mesh.dispose();
    }
  }
}
