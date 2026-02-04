import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { HighlightLayer } from '@babylonjs/core/Layers/highlightLayer';
// Required side effect for HighlightLayer
import '@babylonjs/core/Layers/effectLayerSceneComponent';

export class Station {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.name = config.name;
    this.id = config.id;
    this.faction = config.faction;
    this.position = config.position;

    // Station services
    this.services = {
      repair: true,
      trade: true,
      upgrades: true,
      missions: true
    };

    // Create station mesh
    this.mesh = this.createStationMesh(config.type);
    this.mesh.position = this.position;

    // Create highlight layer for proximity indicator
    this.highlightLayer = new HighlightLayer(`hl_${this.id}`, this.scene);
    this.isHighlighted = false;

    // Create docking beacon
    this.beacon = this.createBeacon();

    // Rotation animation
    this.rotationSpeed = 0.001;
  }

  createStationMesh(type) {
    let station;

    if (type === 'station') {
      // Orbital station - modular ring design
      station = this.createOrbitalStation();
    } else {
      // Surface base - dome/industrial design
      station = this.createSurfaceBase();
    }

    return station;
  }

  createOrbitalStation() {
    // Central hub
    const hub = MeshBuilder.CreateCylinder('hub', {
      diameter: 30,
      height: 60,
      tessellation: 8
    }, this.scene);

    // Rotating ring
    const ring = MeshBuilder.CreateTorus('ring', {
      diameter: 80,
      thickness: 10,
      tessellation: 32
    }, this.scene);
    ring.rotation.x = Math.PI / 2;
    ring.parent = hub;

    // Solar panels
    for (let i = 0; i < 4; i++) {
      const panel = MeshBuilder.CreateBox('panel' + i, {
        width: 40,
        height: 1,
        depth: 15
      }, this.scene);
      panel.position = new Vector3(
        Math.cos(i * Math.PI / 2) * 60,
        Math.sin(i * Math.PI / 2) * 60,
        0
      );
      panel.rotation.z = i * Math.PI / 2;
      panel.parent = hub;

      const panelMaterial = new StandardMaterial('panelMat' + i, this.scene);
      panelMaterial.diffuseColor = new Color3(0.1, 0.15, 0.3);
      panelMaterial.specularColor = new Color3(0.4, 0.5, 0.8);
      panel.material = panelMaterial;
    }

    // Docking ports
    for (let i = 0; i < 2; i++) {
      const port = MeshBuilder.CreateCylinder('port' + i, {
        diameter: 8,
        height: 15,
        tessellation: 6
      }, this.scene);
      port.position = new Vector3(0, 0, (i === 0 ? 1 : -1) * 37);
      port.rotation.x = Math.PI / 2;
      port.parent = hub;
    }

    // Materials
    const hubMaterial = new StandardMaterial('hubMaterial', this.scene);
    hubMaterial.diffuseColor = new Color3(0.5, 0.5, 0.55);
    hubMaterial.specularColor = new Color3(0.3, 0.3, 0.35);
    hub.material = hubMaterial;

    const ringMaterial = new StandardMaterial('ringMaterial', this.scene);
    ringMaterial.diffuseColor = new Color3(0.6, 0.6, 0.65);
    ringMaterial.specularColor = new Color3(0.4, 0.4, 0.45);
    ring.material = ringMaterial;

    // Add some lights to the station
    this.addStationLights(hub);

    return hub;
  }

  createSurfaceBase() {
    // Main dome
    const dome = MeshBuilder.CreateSphere('dome', {
      diameter: 50,
      segments: 16,
      slice: 0.5
    }, this.scene);
    dome.rotation.x = Math.PI;

    // Landing platform
    const platform = MeshBuilder.CreateCylinder('platform', {
      diameter: 80,
      height: 3,
      tessellation: 16
    }, this.scene);
    platform.position.y = -1.5;
    platform.parent = dome;

    // Structures
    for (let i = 0; i < 3; i++) {
      const structure = MeshBuilder.CreateBox('struct' + i, {
        width: 15,
        height: 10,
        depth: 20
      }, this.scene);
      const angle = (i * 2 * Math.PI) / 3;
      structure.position = new Vector3(
        Math.cos(angle) * 35,
        5,
        Math.sin(angle) * 35
      );
      structure.rotation.y = angle;
      structure.parent = dome;

      const structMaterial = new StandardMaterial('structMat' + i, this.scene);
      structMaterial.diffuseColor = new Color3(0.45, 0.45, 0.5);
      structure.material = structMaterial;
    }

    // Materials
    const domeMaterial = new StandardMaterial('domeMaterial', this.scene);
    domeMaterial.diffuseColor = new Color3(0.7, 0.7, 0.75);
    domeMaterial.specularColor = new Color3(0.5, 0.5, 0.55);
    domeMaterial.alpha = 0.9;
    dome.material = domeMaterial;

    const platformMaterial = new StandardMaterial('platformMaterial', this.scene);
    platformMaterial.diffuseColor = new Color3(0.3, 0.3, 0.35);
    platform.material = platformMaterial;

    this.addStationLights(dome);

    return dome;
  }

  addStationLights(parent) {
    // Add small glowing lights to indicate activity
    const lightMaterial = new StandardMaterial('stationLightMat', this.scene);
    lightMaterial.emissiveColor = new Color3(0.8, 0.9, 1);
    lightMaterial.disableLighting = true;

    for (let i = 0; i < 8; i++) {
      const light = MeshBuilder.CreateSphere('stationLight' + i, {
        diameter: 1
      }, this.scene);
      const angle = (i * 2 * Math.PI) / 8;
      light.position = new Vector3(
        Math.cos(angle) * 20,
        Math.random() * 10 - 5,
        Math.sin(angle) * 20
      );
      light.material = lightMaterial;
      light.parent = parent;
    }
  }

  createBeacon() {
    // Create a beacon/marker that helps locate the station
    const beacon = MeshBuilder.CreateSphere('beacon', {
      diameter: 5
    }, this.scene);

    const beaconMaterial = new StandardMaterial('beaconMat', this.scene);
    beaconMaterial.emissiveColor = this.getFactionColor();
    beaconMaterial.disableLighting = true;
    beaconMaterial.alpha = 0.6;

    beacon.material = beaconMaterial;
    beacon.position = this.position.add(new Vector3(0, 50, 0));

    return beacon;
  }

  getFactionColor() {
    const colors = {
      earthAuthority: new Color3(0.2, 0.4, 1),
      lunarCollective: new Color3(0.8, 0.8, 0.6),
      freeTradersGuild: new Color3(0.2, 0.8, 0.4)
    };
    return colors[this.faction] || new Color3(1, 1, 1);
  }

  setHighlight(enabled) {
    if (enabled && !this.isHighlighted) {
      this.highlightLayer.addMesh(this.mesh, this.getFactionColor());
      this.isHighlighted = true;
    } else if (!enabled && this.isHighlighted) {
      this.highlightLayer.removeMesh(this.mesh);
      this.isHighlighted = false;
    }
  }

  update(deltaTime) {
    // Slow rotation for visual interest
    if (this.mesh) {
      this.mesh.rotation.y += this.rotationSpeed;
    }

    // Beacon pulse effect
    if (this.beacon) {
      const pulse = Math.sin(performance.now() / 500) * 0.3 + 0.7;
      this.beacon.material.alpha = pulse * 0.6;
    }
  }

  dispose() {
    this.highlightLayer.dispose();
    this.mesh.dispose();
    this.beacon.dispose();
  }
}
