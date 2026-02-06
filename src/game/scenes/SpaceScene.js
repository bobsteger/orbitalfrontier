import { Scene } from '@babylonjs/core/scene';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera';
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight';
import { PointLight } from '@babylonjs/core/Lights/pointLight';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Texture } from '@babylonjs/core/Materials/Textures/texture';
import { STAR_CATALOG, getStarColor, magnitudeToBrightness, celestialToCartesian } from '../data/starCatalog.js';
import { Ship } from '../entities/Ship.js';
import { Station } from '../entities/Station.js';
import { FlightController } from '../systems/FlightController.js';
import { HUD } from '../ui/HUD.js';
import { StationMenu } from '../ui/StationMenu.js';

// Required side effects for Babylon.js
import '@babylonjs/core/Helpers/sceneHelpers';
import '@babylonjs/core/Meshes/meshBuilder';
import '@babylonjs/core/Materials/standardMaterial';
import '@babylonjs/core/Lights/hemisphericLight';
import '@babylonjs/core/Lights/pointLight';
import '@babylonjs/core/Layers/effectLayer';

// Camera view modes
export const CAMERA_MODES = {
  FIRST_PERSON: 'first_person',
  THIRD_PERSON: 'third_person'
};

export class SpaceScene {
  constructor(engine, inputManager, gameState) {
    this.engine = engine;
    this.inputManager = inputManager;
    this.gameState = gameState;
    this.scene = null;
    this.camera = null;
    this.playerShip = null;
    this.flightController = null;
    this.hud = null;
    this.stationMenu = null;
    this.stations = [];
    this.celestialBodies = {};
    this.lastTime = performance.now();
    this.nearbyStation = null;

    // Camera view mode
    this.cameraMode = CAMERA_MODES.FIRST_PERSON;
  }

  async initialize(onProgress) {
    // Create scene
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.01, 0.01, 0.02, 1);

    // Enable logarithmic depth buffer to prevent z-fighting at large distances
    this.scene.useRightHandedSystem = false;
    this.scene.logarithmicDepthBuffer = true;

    onProgress(50, 'Creating camera and lights...');

    // Create camera (will follow player ship)
    this.camera = new FreeCamera('camera', new Vector3(0, 5, -20), this.scene);
    this.camera.minZ = 1; // Increased to reduce z-fighting at distance
    this.camera.maxZ = 1000000; // Very far view distance for space
    this.camera.fov = 0.9; // Slightly wider field of view

    // Create sun light
    const sunLight = new PointLight('sunLight', new Vector3(100000, 50000, 0), this.scene);
    sunLight.intensity = 1.5;
    sunLight.diffuse = new Color3(1, 0.98, 0.9);

    // Ambient light for visibility
    const ambientLight = new HemisphericLight('ambientLight', new Vector3(0, 1, 0), this.scene);
    ambientLight.intensity = 0.3;
    ambientLight.diffuse = new Color3(0.6, 0.6, 0.8);
    ambientLight.groundColor = new Color3(0.1, 0.1, 0.2);

    onProgress(60, 'Generating celestial bodies...');

    // Create starfield
    this.createStarfield();

    // Create celestial bodies
    this.createCelestialBodies();

    onProgress(70, 'Creating stations...');

    // Create stations
    this.createStations();

    onProgress(80, 'Spawning player ship...');

    // Create player ship
    this.playerShip = new Ship(this.scene, this.gameState.ship);
    this.playerShip.mesh.position = new Vector3(0, 0, 0);

    // Initialize flight controller
    this.flightController = new FlightController(
      this.playerShip,
      this.inputManager,
      this.gameState
    );

    // Initialize HUD
    this.hud = new HUD(this.scene, this.gameState, this.playerShip);

    // Register navigation objects with HUD
    this.registerNavObjects();

    // Initialize station menu
    this.stationMenu = new StationMenu(this.gameState, () => this.undock());

    // Setup docking key handler
    this.setupDockingControls();

    onProgress(85, 'Setting up camera follow...');

    // Setup camera to follow ship
    this.setupCameraFollow();
  }

  setupDockingControls() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Enter' && this.nearbyStation && !this.gameState.player.isDocked) {
        this.dock(this.nearbyStation);
      }
      if (e.code === 'Escape' && this.gameState.player.isDocked) {
        this.undock();
      }
    });
  }

  dock(station) {
    this.gameState.player.isDocked = true;
    this.gameState.player.currentLocation = station.id;
    this.flightController.fullStop();
    this.hud.hideDockingPrompt();
    this.stationMenu.show(station);
    this.inputManager.unlock();
  }

  undock() {
    this.gameState.player.isDocked = false;
    this.gameState.player.currentLocation = 'open_space';
    this.stationMenu.hide();
  }

  createStarfield() {
    // Create stars based on real star catalog data
    const starDistance = 500000;

    // Create stars from catalog (real positions and colors)
    for (let i = 0; i < STAR_CATALOG.length; i++) {
      const [name, ra, dec, magnitude, spectralClass] = STAR_CATALOG[i];

      // Convert celestial coordinates to 3D position
      const pos = celestialToCartesian(ra, dec, starDistance);

      // Calculate star size based on magnitude (brighter = bigger)
      const brightness = magnitudeToBrightness(magnitude);
      const starSize = 50 + brightness * 1800; // Size range: 50-450

      const star = MeshBuilder.CreateSphere(`star_${name}`, {
        diameter: starSize,
        segments: 6
      }, this.scene);

      star.position = new Vector3(pos.x, pos.y, pos.z);

      // Get color from spectral class
      const color = getStarColor(spectralClass);
      const starMaterial = new StandardMaterial(`starMat_${name}`, this.scene);
      starMaterial.emissiveColor = new Color3(
        color[0] * brightness + (1 - brightness) * 0.5,
        color[1] * brightness + (1 - brightness) * 0.5,
        color[2] * brightness + (1 - brightness) * 0.5
      );
      starMaterial.disableLighting = true;
      star.material = starMaterial;
    }

    // Add additional dim background stars to fill the sky
    this.createBackgroundStars(starDistance * 1.1, 2000);
  }

  createBackgroundStars(distance, count) {
    // Add dimmer random stars for fuller sky coverage
    for (let i = 0; i < count; i++) {
      // Random position on sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = distance * Math.sin(phi) * Math.cos(theta);
      const y = distance * Math.sin(phi) * Math.sin(theta);
      const z = distance * Math.cos(phi);

      const star = MeshBuilder.CreateSphere(`bgStar${i}`, {
        diameter: 600 + Math.random() * 40,
        segments: 4
      }, this.scene);

      star.position = new Vector3(x, y, z);

      const starMaterial = new StandardMaterial(`bgStarMat${i}`, this.scene);
      const dimness = 0.3 + Math.random() * 0.4;
      starMaterial.emissiveColor = new Color3(dimness, dimness, dimness);
      starMaterial.disableLighting = true;
      star.material = starMaterial;
    }
  }

  createCelestialBodies() {
    // Local texture paths (NASA/Solar System Scope public domain imagery)
    const EARTH_TEXTURE = '/assets/textures/earth.jpg';
    const EARTH_CLOUDS = '/assets/textures/earth_clouds.jpg';
    const MOON_TEXTURE = '/assets/textures/moon.jpg';
    const SUN_TEXTURE = '/assets/textures/sun.jpg';

    // Earth (large, far away)
    const earth = MeshBuilder.CreateSphere('earth', { diameter: 12742, segments: 64 }, this.scene);
    earth.position = new Vector3(-50000, -5000, 30000);
    const earthMaterial = new StandardMaterial('earthMaterial', this.scene);
    earthMaterial.diffuseTexture = new Texture(EARTH_TEXTURE, this.scene);
    earthMaterial.specularColor = new Color3(0.2, 0.2, 0.3);
    earthMaterial.specularPower = 8;
    earth.material = earthMaterial;
    // Tilt Earth's axis slightly
    earth.rotation.z = 0.41; // ~23.5 degrees
    this.celestialBodies.earth = earth;

    // Earth clouds layer (larger gap to prevent z-fighting)
    const earthClouds = MeshBuilder.CreateSphere('earthClouds', { diameter: 13000, segments: 48 }, this.scene);
    earthClouds.position = earth.position.clone();
    earthClouds.rotation.z = 0.41;
    const cloudMaterial = new StandardMaterial('cloudMaterial', this.scene);
    cloudMaterial.diffuseTexture = new Texture(EARTH_CLOUDS, this.scene);
    cloudMaterial.opacityTexture = new Texture(EARTH_CLOUDS, this.scene);
    cloudMaterial.alpha = 0.6;
    cloudMaterial.specularColor = new Color3(0, 0, 0);
    cloudMaterial.backFaceCulling = true;
    earthClouds.material = cloudMaterial;
    this.celestialBodies.earthClouds = earthClouds;

    // Moon (smaller, closer)
    const moon = MeshBuilder.CreateSphere('moon', { diameter: 3474, segments: 32 }, this.scene);
    moon.position = new Vector3(40000, 2000, -20000);
    const moonMaterial = new StandardMaterial('moonMaterial', this.scene);
    moonMaterial.diffuseTexture = new Texture(MOON_TEXTURE, this.scene);
    moonMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    moon.material = moonMaterial;
    this.celestialBodies.moon = moon;

    // Sun (bright sphere in the distance)
    const sunGlow = MeshBuilder.CreateSphere('sunGlow', { diameter: 2000 }, this.scene);
    sunGlow.position = new Vector3(100000, 50000, 0);
    const sunMaterial = new StandardMaterial('sunMaterial', this.scene);
    sunMaterial.emissiveTexture = new Texture(SUN_TEXTURE, this.scene);
    sunMaterial.disableLighting = true;
    sunGlow.material = sunMaterial;
    this.celestialBodies.sun = sunGlow;
  }

  createStations() {
    // Earth Base - High orbit station near Earth
    const earthBase = new Station(this.scene, {
      name: 'Earth Base',
      id: 'earth_base',
      type: 'station',
      position: new Vector3(-45000, -3000, 28000),
      faction: 'earthAuthority'
    });
    this.stations.push(earthBase);

    // Moon Base - Lunar surface installation
    const moonBase = new Station(this.scene, {
      name: 'Moon Base',
      id: 'moon_base',
      type: 'base',
      position: new Vector3(38500, 1000, -18500),
      faction: 'lunarCollective'
    });
    this.stations.push(moonBase);

    // Orbital Station - L1 Lagrange point
    const orbitalStation = new Station(this.scene, {
      name: 'Orbital Station',
      id: 'orbital_station',
      type: 'station',
      position: new Vector3(0, 500, 5000),
      faction: 'freeTradersGuild'
    });
    this.stations.push(orbitalStation);
  }

  setupCameraFollow() {
    // Camera offsets for different view modes
    this.firstPersonOffset = new Vector3(0, 0.8, 2.5); // Inside cockpit, looking forward
    this.thirdPersonOffset = new Vector3(0, 8, -25); // Behind and above ship

    // Setup view mode toggle (V key)
    this.setupViewModeToggle();

    // Apply initial view mode
    this.applyCameraMode();
  }

  setupViewModeToggle() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyV') {
        this.toggleCameraMode();
      }
    });
  }

  toggleCameraMode() {
    if (this.cameraMode === CAMERA_MODES.FIRST_PERSON) {
      this.cameraMode = CAMERA_MODES.THIRD_PERSON;
    } else {
      this.cameraMode = CAMERA_MODES.FIRST_PERSON;
    }
    this.applyCameraMode();
  }

  applyCameraMode() {
    if (this.cameraMode === CAMERA_MODES.FIRST_PERSON) {
      // First person: hide ship, show HUD
      if (this.playerShip && this.playerShip.mesh) {
        this.setShipVisibility(false);
      }
      if (this.hud) {
        this.hud.setVisible(true);
      }
    } else {
      // Third person: show ship, hide HUD
      if (this.playerShip && this.playerShip.mesh) {
        this.setShipVisibility(true);
      }
      if (this.hud) {
        this.hud.setVisible(false);
      }
    }
  }

  setShipVisibility(visible) {
    if (!this.playerShip || !this.playerShip.mesh) return;

    this.playerShip.mesh.isVisible = visible;

    // Also set visibility for child meshes
    const children = this.playerShip.mesh.getChildMeshes();
    children.forEach(child => {
      child.isVisible = visible;
    });

    // Handle loaded model meshes if any
    if (this.playerShip.loadedMeshes) {
      this.playerShip.loadedMeshes.forEach(mesh => {
        mesh.isVisible = visible;
      });
    }

    // Engine glow visibility
    if (this.playerShip.engineGlow) {
      this.playerShip.engineGlow.left.isVisible = visible;
      this.playerShip.engineGlow.right.isVisible = visible;
    }
  }

  registerNavObjects() {
    // Register stations (approximate bounding diameter)
    for (const station of this.stations) {
      const color = this.getFactionColor(station.faction);
      // Stations are roughly 80-100 units in diameter
      const stationSize = station.config.type === 'station' ? 100 : 80;
      this.hud.addNavObject(station.name, station.mesh, 'station', color, stationSize);
    }

    // Register celestial bodies with their actual diameters
    if (this.celestialBodies.earth) {
      this.hud.addNavObject('Earth', this.celestialBodies.earth, 'celestial', '#6eb5ff', 12742);
    }
    if (this.celestialBodies.moon) {
      this.hud.addNavObject('Moon', this.celestialBodies.moon, 'celestial', '#cccccc', 3474);
    }
    if (this.celestialBodies.sun) {
      this.hud.addNavObject('Sun', this.celestialBodies.sun, 'celestial', '#ffdd44', 2000);
    }
  }

  getFactionColor(faction) {
    const colors = {
      earthAuthority: '#4fc3f7',
      lunarCollective: '#b8a9c9',
      freeTradersGuild: '#4caf50'
    };
    return colors[faction] || '#4fc3f7';
  }

  update() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Update flight controller
    if (this.flightController) {
      this.flightController.update(deltaTime);
    }

    // Update camera position to follow ship
    this.updateCamera(deltaTime);

    // Update HUD (only in first-person mode)
    if (this.hud && this.cameraMode === CAMERA_MODES.FIRST_PERSON) {
      this.hud.update(deltaTime);
      this.hud.updateNavLabels(this.camera);
    }

    // Rotate celestial bodies
    this.updateCelestialBodies(deltaTime);

    // Check for station proximity (only show docking prompt in first-person)
    this.checkStationProximity();
  }

  updateCelestialBodies(deltaTime) {
    // Very slow rotation for realism (1 rotation per ~10 minutes)
    if (this.celestialBodies.earth) {
      this.celestialBodies.earth.rotation.y += deltaTime * 0.01;
    }
    // Clouds rotate slightly differently for subtle effect
    if (this.celestialBodies.earthClouds) {
      this.celestialBodies.earthClouds.rotation.y += deltaTime * 0.012;
    }
    // Moon rotates very slowly
    if (this.celestialBodies.moon) {
      this.celestialBodies.moon.rotation.y += deltaTime * 0.005;
    }
    // Sun rotates slowly
    if (this.celestialBodies.sun) {
      this.celestialBodies.sun.rotation.y += deltaTime * 0.003;
    }
  }

  updateCamera(deltaTime) {
    if (!this.playerShip || !this.playerShip.mesh) return;

    const shipPosition = this.playerShip.mesh.position;
    const shipRotation = this.playerShip.mesh.rotationQuaternion;

    if (this.cameraMode === CAMERA_MODES.FIRST_PERSON) {
      // First person: camera locked inside cockpit, no lerp (instant follow)
      const offset = this.firstPersonOffset.clone();
      if (shipRotation) {
        offset.rotateByQuaternionToRef(shipRotation, offset);
      }

      // Instant position update - no velocity-dependent movement
      this.camera.position = shipPosition.add(offset);

      // Camera looks forward in ship's direction
      const forward = this.playerShip.getForward();
      const lookTarget = this.camera.position.add(forward.scale(100));
      this.camera.setTarget(lookTarget);

    } else {
      // Third person: camera behind and above ship, smooth follow
      const offset = this.thirdPersonOffset.clone();
      if (shipRotation) {
        offset.rotateByQuaternionToRef(shipRotation, offset);
      }

      const targetPosition = shipPosition.add(offset);

      // Smooth follow for third person (adds cinematic feel)
      this.camera.position = Vector3.Lerp(
        this.camera.position,
        targetPosition,
        8 * deltaTime
      );

      // Look at the ship (slightly above center for better framing)
      const lookOffset = new Vector3(0, 2, 0);
      if (shipRotation) {
        lookOffset.rotateByQuaternionToRef(shipRotation, lookOffset);
      }
      const lookTarget = shipPosition.add(lookOffset);
      this.camera.setTarget(lookTarget);
    }

    // Update target identification (only relevant in first person)
    if (this.cameraMode === CAMERA_MODES.FIRST_PERSON) {
      this.updateTargetIdentification();
    }
  }

  updateTargetIdentification() {
    // Find what's in the center of view
    const forward = this.playerShip.getForward();
    const shipPos = this.playerShip.mesh.position;

    let closestTarget = null;
    let closestAngle = 0.15; // ~8.5 degrees cone for targeting

    // Check stations
    for (const station of this.stations) {
      const toStation = station.mesh.position.subtract(shipPos);
      const distance = toStation.length();
      const direction = toStation.normalize();
      const angle = Math.acos(Vector3.Dot(forward, direction));

      if (angle < closestAngle) {
        closestAngle = angle;
        closestTarget = {
          type: 'station',
          name: station.name,
          faction: station.faction,
          distance: distance,
          object: station
        };
      }
    }

    // Check celestial bodies
    const bodies = [
      { name: 'Earth', key: 'earth' },
      { name: 'Moon', key: 'moon' },
      { name: 'Sun', key: 'sun' }
    ];

    for (const body of bodies) {
      if (this.celestialBodies[body.key]) {
        const toBody = this.celestialBodies[body.key].position.subtract(shipPos);
        const distance = toBody.length();
        const direction = toBody.normalize();
        const angle = Math.acos(Vector3.Dot(forward, direction));

        if (angle < closestAngle) {
          closestAngle = angle;
          closestTarget = {
            type: 'celestial',
            name: body.name,
            distance: distance,
            object: this.celestialBodies[body.key]
          };
        }
      }
    }

    // Update HUD with target info
    if (this.hud) {
      this.hud.updateTarget(closestTarget);
    }
  }

  checkStationProximity() {
    if (this.gameState.player.isDocked) return;

    const dockingRange = 100; // Units within which docking is possible
    let foundNearby = false;

    for (const station of this.stations) {
      const distance = Vector3.Distance(
        this.playerShip.mesh.position,
        station.mesh.position
      );

      station.setHighlight(distance < dockingRange * 2);

      if (distance < dockingRange) {
        // Player can dock - update HUD to show docking prompt
        this.hud.showDockingPrompt(station);
        this.nearbyStation = station;
        foundNearby = true;
      }
    }

    if (!foundNearby) {
      this.hud.hideDockingPrompt();
      this.nearbyStation = null;
    }
  }

  render() {
    this.scene.render();
  }

  dispose() {
    this.scene.dispose();
  }
}
