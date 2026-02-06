import { AdvancedDynamicTexture } from '@babylonjs/gui/2D/advancedDynamicTexture';
import { TextBlock } from '@babylonjs/gui/2D/controls/textBlock';
import { Rectangle } from '@babylonjs/gui/2D/controls/rectangle';
import { Ellipse } from '@babylonjs/gui/2D/controls/ellipse';
import { Line } from '@babylonjs/gui/2D/controls/line';
import { StackPanel } from '@babylonjs/gui/2D/controls/stackPanel';
import { Control } from '@babylonjs/gui/2D/controls/control';
import { Vector3, Matrix } from '@babylonjs/core/Maths/math.vector';

export class HUD {
  constructor(scene, gameState, playerShip) {
    this.scene = scene;
    this.gameState = gameState;
    this.playerShip = playerShip;
    this.currentTarget = null;
    this.navLabelsVisible = true;
    this.navLabels = [];
    this.navObjects = []; // Will be populated with stations and celestial bodies
    this.isVisible = true;
    this.hudElements = []; // Track all HUD elements for visibility toggle

    // Create fullscreen GUI
    this.gui = AdvancedDynamicTexture.CreateFullscreenUI('HUD', true, scene);

    // Setup nav label toggle
    this.setupNavLabelToggle();

    // Create HUD elements
    this.createCockpitFrame();
    this.createTargetingReticle();
    this.createTargetDisplay();
    this.createFlightData();
    this.createShipStatus();
    this.createCreditsDisplay();
    this.createCompass();
    this.createDockingPrompt();
  }

  setVisible(visible) {
    this.isVisible = visible;

    // Toggle all tracked HUD elements
    for (const element of this.hudElements) {
      element.isVisible = visible;
    }

    // Also toggle nav labels
    if (visible) {
      this.updateNavLabelsVisibility();
    } else {
      for (const navLabel of this.navLabels) {
        navLabel.circle.isVisible = false;
        navLabel.line.isVisible = false;
        navLabel.label.isVisible = false;
      }
    }

    // Nav status text
    if (this.navStatusText) {
      this.navStatusText.isVisible = visible;
    }
  }

  createCockpitFrame() {
    // Top frame bar
    const topBar = new Rectangle('topBar');
    topBar.width = '100%';
    topBar.height = '60px';
    topBar.background = 'linear-gradient(180deg, rgba(0,10,20,0.9) 0%, rgba(0,10,20,0) 100%)';
    topBar.thickness = 0;
    topBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.gui.addControl(topBar);
    this.hudElements.push(topBar);

    // Bottom frame bar
    const bottomBar = new Rectangle('bottomBar');
    bottomBar.width = '100%';
    bottomBar.height = '80px';
    bottomBar.background = 'linear-gradient(0deg, rgba(0,10,20,0.9) 0%, rgba(0,10,20,0) 100%)';
    bottomBar.thickness = 0;
    bottomBar.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    this.gui.addControl(bottomBar);
    this.hudElements.push(bottomBar);

    // Left frame
    const leftBar = new Rectangle('leftBar');
    leftBar.width = '80px';
    leftBar.height = '100%';
    leftBar.background = 'linear-gradient(90deg, rgba(0,10,20,0.7) 0%, rgba(0,10,20,0) 100%)';
    leftBar.thickness = 0;
    leftBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    this.gui.addControl(leftBar);
    this.hudElements.push(leftBar);

    // Right frame
    const rightBar = new Rectangle('rightBar');
    rightBar.width = '80px';
    rightBar.height = '100%';
    rightBar.background = 'linear-gradient(270deg, rgba(0,10,20,0.7) 0%, rgba(0,10,20,0) 100%)';
    rightBar.thickness = 0;
    rightBar.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.gui.addControl(rightBar);
    this.hudElements.push(rightBar);

    // Corner accents
    this.createCornerAccent('topLeft', Control.HORIZONTAL_ALIGNMENT_LEFT, Control.VERTICAL_ALIGNMENT_TOP);
    this.createCornerAccent('topRight', Control.HORIZONTAL_ALIGNMENT_RIGHT, Control.VERTICAL_ALIGNMENT_TOP);
    this.createCornerAccent('bottomLeft', Control.HORIZONTAL_ALIGNMENT_LEFT, Control.VERTICAL_ALIGNMENT_BOTTOM);
    this.createCornerAccent('bottomRight', Control.HORIZONTAL_ALIGNMENT_RIGHT, Control.VERTICAL_ALIGNMENT_BOTTOM);
  }

  createCornerAccent(name, hAlign, vAlign) {
    const corner = new Rectangle(name);
    corner.width = '100px';
    corner.height = '100px';
    corner.thickness = 2;
    corner.color = 'rgba(79, 195, 247, 0.3)';
    corner.background = 'transparent';
    corner.horizontalAlignment = hAlign;
    corner.verticalAlignment = vAlign;

    // Offset from edge
    corner.left = hAlign === Control.HORIZONTAL_ALIGNMENT_LEFT ? '20px' : '-20px';
    corner.top = vAlign === Control.VERTICAL_ALIGNMENT_TOP ? '20px' : '-20px';

    this.gui.addControl(corner);
    this.hudElements.push(corner);
  }

  createTargetingReticle() {
    // Outer targeting circle
    const outerCircle = new Ellipse('outerCircle');
    outerCircle.width = '80px';
    outerCircle.height = '80px';
    outerCircle.color = 'rgba(79, 195, 247, 0.6)';
    outerCircle.thickness = 1;
    outerCircle.background = 'transparent';
    this.gui.addControl(outerCircle);
    this.hudElements.push(outerCircle);

    // Inner targeting circle
    const innerCircle = new Ellipse('innerCircle');
    innerCircle.width = '40px';
    innerCircle.height = '40px';
    innerCircle.color = 'rgba(79, 195, 247, 0.8)';
    innerCircle.thickness = 1;
    innerCircle.background = 'transparent';
    this.gui.addControl(innerCircle);
    this.hudElements.push(innerCircle);

    // Crosshair lines
    const lineLength = 15;
    const gap = 25;

    // Top line
    const topLine = new Rectangle('topLine');
    topLine.width = '2px';
    topLine.height = `${lineLength}px`;
    topLine.background = 'rgba(79, 195, 247, 0.9)';
    topLine.top = `-${gap + lineLength/2}px`;
    this.gui.addControl(topLine);
    this.hudElements.push(topLine);

    // Bottom line
    const bottomLine = new Rectangle('bottomLine');
    bottomLine.width = '2px';
    bottomLine.height = `${lineLength}px`;
    bottomLine.background = 'rgba(79, 195, 247, 0.9)';
    bottomLine.top = `${gap + lineLength/2}px`;
    this.gui.addControl(bottomLine);
    this.hudElements.push(bottomLine);

    // Left line
    const leftLine = new Rectangle('leftLine');
    leftLine.width = `${lineLength}px`;
    leftLine.height = '2px';
    leftLine.background = 'rgba(79, 195, 247, 0.9)';
    leftLine.left = `-${gap + lineLength/2}px`;
    this.gui.addControl(leftLine);
    this.hudElements.push(leftLine);

    // Right line
    const rightLine = new Rectangle('rightLine');
    rightLine.width = `${lineLength}px`;
    rightLine.height = '2px';
    rightLine.background = 'rgba(79, 195, 247, 0.9)';
    rightLine.left = `${gap + lineLength/2}px`;
    this.gui.addControl(rightLine);
    this.hudElements.push(rightLine);

    // Center dot
    const centerDot = new Ellipse('centerDot');
    centerDot.width = '6px';
    centerDot.height = '6px';
    centerDot.background = 'rgba(79, 195, 247, 1)';
    centerDot.thickness = 0;
    this.gui.addControl(centerDot);
    this.hudElements.push(centerDot);
  }

  createTargetDisplay() {
    // Target info panel (below reticle)
    this.targetPanel = new Rectangle('targetPanel');
    this.targetPanel.width = '280px';
    this.targetPanel.height = '70px';
    this.targetPanel.cornerRadius = 5;
    this.targetPanel.color = 'rgba(79, 195, 247, 0.5)';
    this.targetPanel.thickness = 1;
    this.targetPanel.background = 'rgba(0, 20, 40, 0.7)';
    this.targetPanel.top = '80px';
    this.targetPanel.isVisible = false;
    this.gui.addControl(this.targetPanel);
    this.hudElements.push(this.targetPanel);

    // Target name
    this.targetName = new TextBlock('targetName');
    this.targetName.text = 'NO TARGET';
    this.targetName.color = '#4fc3f7';
    this.targetName.fontSize = 16;
    this.targetName.fontFamily = 'Consolas, monospace';
    this.targetName.fontWeight = 'bold';
    this.targetName.top = '-18px';
    this.targetName.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.targetPanel.addControl(this.targetName);

    // Target type/faction
    this.targetType = new TextBlock('targetType');
    this.targetType.text = '';
    this.targetType.color = '#888888';
    this.targetType.fontSize = 11;
    this.targetType.fontFamily = 'Consolas, monospace';
    this.targetType.top = '2px';
    this.targetPanel.addControl(this.targetType);

    // Target distance
    this.targetDistance = new TextBlock('targetDistance');
    this.targetDistance.text = '--- km';
    this.targetDistance.color = '#ffffff';
    this.targetDistance.fontSize = 14;
    this.targetDistance.fontFamily = 'Consolas, monospace';
    this.targetDistance.top = '20px';
    this.targetPanel.addControl(this.targetDistance);
  }

  createFlightData() {
    // Flight data panel (bottom center)
    const flightPanel = new Rectangle('flightPanel');
    flightPanel.width = '300px';
    flightPanel.height = '70px';
    flightPanel.cornerRadius = 5;
    flightPanel.color = 'rgba(79, 195, 247, 0.5)';
    flightPanel.thickness = 1;
    flightPanel.background = 'rgba(0, 20, 40, 0.7)';
    flightPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    flightPanel.top = '-15px';
    this.gui.addControl(flightPanel);
    this.hudElements.push(flightPanel);

    // Speed value (large, center)
    this.speedText = new TextBlock('speedText');
    this.speedText.text = '0';
    this.speedText.color = '#ffffff';
    this.speedText.fontSize = 32;
    this.speedText.fontFamily = 'Consolas, monospace';
    this.speedText.top = '-8px';
    flightPanel.addControl(this.speedText);

    // Speed label
    const speedLabel = new TextBlock('speedLabel');
    speedLabel.text = 'm/s';
    speedLabel.color = '#4fc3f7';
    speedLabel.fontSize = 12;
    speedLabel.top = '22px';
    flightPanel.addControl(speedLabel);

    // Heading display (left side of speed)
    this.headingText = new TextBlock('headingText');
    this.headingText.text = 'HDG 000';
    this.headingText.color = '#4fc3f7';
    this.headingText.fontSize = 12;
    this.headingText.fontFamily = 'Consolas, monospace';
    this.headingText.left = '-100px';
    this.headingText.top = '-15px';
    flightPanel.addControl(this.headingText);

    // Flight assist indicator
    this.flightAssistText = new TextBlock('flightAssist');
    this.flightAssistText.text = 'FA ON';
    this.flightAssistText.color = '#4caf50';
    this.flightAssistText.fontSize = 12;
    this.flightAssistText.fontFamily = 'Consolas, monospace';
    this.flightAssistText.left = '-100px';
    this.flightAssistText.top = '5px';
    flightPanel.addControl(this.flightAssistText);

    // Coordinates (right side)
    this.coordsText = new TextBlock('coordsText');
    this.coordsText.text = '0, 0, 0';
    this.coordsText.color = '#888888';
    this.coordsText.fontSize = 10;
    this.coordsText.fontFamily = 'Consolas, monospace';
    this.coordsText.left = '90px';
    this.coordsText.top = '-5px';
    flightPanel.addControl(this.coordsText);
  }

  createShipStatus() {
    // Ship status panel (bottom left)
    const statusPanel = new Rectangle('statusPanel');
    statusPanel.width = '160px';
    statusPanel.height = '90px';
    statusPanel.cornerRadius = 5;
    statusPanel.color = 'rgba(79, 195, 247, 0.5)';
    statusPanel.thickness = 1;
    statusPanel.background = 'rgba(0, 20, 40, 0.7)';
    statusPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    statusPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_BOTTOM;
    statusPanel.left = '20px';
    statusPanel.top = '-15px';
    this.gui.addControl(statusPanel);
    this.hudElements.push(statusPanel);

    const stack = new StackPanel();
    stack.isVertical = true;
    stack.paddingTop = '8px';
    statusPanel.addControl(stack);

    // Hull bar
    this.hullBar = this.createStatusBar(stack, 'HULL', '#4caf50');

    // Shield bar
    this.shieldBar = this.createStatusBar(stack, 'SHLD', '#2196f3');

    // Energy bar
    this.energyBar = this.createStatusBar(stack, 'ENGY', '#ff9800');
  }

  createStatusBar(parent, label, color) {
    const container = new Rectangle();
    container.width = '145px';
    container.height = '24px';
    container.thickness = 0;
    parent.addControl(container);

    // Label
    const labelText = new TextBlock();
    labelText.text = label;
    labelText.color = '#888888';
    labelText.fontSize = 10;
    labelText.fontFamily = 'Consolas, monospace';
    labelText.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    labelText.left = '5px';
    container.addControl(labelText);

    // Bar background
    const barBg = new Rectangle();
    barBg.width = '90px';
    barBg.height = '10px';
    barBg.cornerRadius = 2;
    barBg.color = 'rgba(255,255,255,0.2)';
    barBg.thickness = 1;
    barBg.background = 'rgba(0,0,0,0.3)';
    barBg.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    barBg.left = '-8px';
    container.addControl(barBg);

    // Bar fill
    const barFill = new Rectangle();
    barFill.width = '100%';
    barFill.height = '100%';
    barFill.cornerRadius = 2;
    barFill.thickness = 0;
    barFill.background = color;
    barFill.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    barBg.addControl(barFill);

    return barFill;
  }

  createCreditsDisplay() {
    // Credits display (top right)
    const creditsPanel = new Rectangle('creditsPanel');
    creditsPanel.width = '140px';
    creditsPanel.height = '35px';
    creditsPanel.cornerRadius = 5;
    creditsPanel.color = 'rgba(79, 195, 247, 0.5)';
    creditsPanel.thickness = 1;
    creditsPanel.background = 'rgba(0, 20, 40, 0.7)';
    creditsPanel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    creditsPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    creditsPanel.left = '-20px';
    creditsPanel.top = '20px';
    this.gui.addControl(creditsPanel);
    this.hudElements.push(creditsPanel);

    this.creditsText = new TextBlock('creditsText');
    this.creditsText.text = '10,000 CR';
    this.creditsText.color = '#ffd700';
    this.creditsText.fontSize = 16;
    this.creditsText.fontFamily = 'Consolas, monospace';
    creditsPanel.addControl(this.creditsText);
  }

  createCompass() {
    // Compass/heading indicator (top center)
    const compassPanel = new Rectangle('compassPanel');
    compassPanel.width = '200px';
    compassPanel.height = '30px';
    compassPanel.cornerRadius = 3;
    compassPanel.color = 'rgba(79, 195, 247, 0.5)';
    compassPanel.thickness = 1;
    compassPanel.background = 'rgba(0, 20, 40, 0.7)';
    compassPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    compassPanel.top = '20px';
    this.gui.addControl(compassPanel);
    this.hudElements.push(compassPanel);

    // Location name
    this.locationText = new TextBlock('locationText');
    this.locationText.text = 'OPEN SPACE';
    this.locationText.color = '#4fc3f7';
    this.locationText.fontSize = 12;
    this.locationText.fontFamily = 'Consolas, monospace';
    compassPanel.addControl(this.locationText);
  }

  createDockingPrompt() {
    // Docking prompt (center-bottom area)
    this.dockingPanel = new Rectangle('dockingPanel');
    this.dockingPanel.width = '220px';
    this.dockingPanel.height = '50px';
    this.dockingPanel.cornerRadius = 5;
    this.dockingPanel.color = '#4caf50';
    this.dockingPanel.thickness = 2;
    this.dockingPanel.background = 'rgba(0, 40, 20, 0.9)';
    this.dockingPanel.top = '160px';
    this.dockingPanel.isVisible = false;
    this.gui.addControl(this.dockingPanel);
    this.hudElements.push(this.dockingPanel);

    this.dockingText = new TextBlock('dockingText');
    this.dockingText.text = 'PRESS [ENTER] TO DOCK';
    this.dockingText.color = '#ffffff';
    this.dockingText.fontSize = 14;
    this.dockingText.fontFamily = 'Consolas, monospace';
    this.dockingPanel.addControl(this.dockingText);
  }

  showDockingPrompt(station) {
    this.dockingPanel.isVisible = true;
    this.dockingText.text = `DOCK: ${station.name.toUpperCase()}\n[ENTER]`;
    this.currentDockingStation = station;
  }

  hideDockingPrompt() {
    this.dockingPanel.isVisible = false;
    this.currentDockingStation = null;
  }

  updateTarget(target) {
    this.currentTarget = target;

    if (target) {
      this.targetPanel.isVisible = true;
      this.targetName.text = target.name.toUpperCase();

      // Format distance
      let distStr;
      if (target.distance > 10000) {
        distStr = `${(target.distance / 1000).toFixed(1)} km`;
      } else {
        distStr = `${Math.round(target.distance)} m`;
      }
      this.targetDistance.text = distStr;

      // Set type/faction info and color based on target type
      if (target.type === 'station') {
        const factionNames = {
          earthAuthority: 'EARTH AUTHORITY',
          lunarCollective: 'LUNAR COLLECTIVE',
          freeTradersGuild: 'FREE TRADERS GUILD'
        };
        this.targetType.text = `STATION - ${factionNames[target.faction] || 'INDEPENDENT'}`;
        this.targetName.color = '#4caf50'; // Green for stations
        this.targetPanel.color = 'rgba(76, 175, 80, 0.5)';
      } else if (target.type === 'celestial') {
        this.targetType.text = 'CELESTIAL BODY';
        this.targetName.color = '#ffd700'; // Gold for celestial
        this.targetPanel.color = 'rgba(255, 215, 0, 0.3)';
      } else {
        this.targetType.text = target.type.toUpperCase();
        this.targetName.color = '#4fc3f7';
        this.targetPanel.color = 'rgba(79, 195, 247, 0.5)';
      }
    } else {
      this.targetPanel.isVisible = false;
    }
  }

  update(deltaTime) {
    // Update speed
    if (this.playerShip) {
      const speed = Math.round(this.playerShip.getSpeed());
      this.speedText.text = speed.toString();

      // Update heading
      if (this.playerShip.mesh) {
        const forward = this.playerShip.getForward();
        let heading = Math.atan2(forward.x, forward.z) * (180 / Math.PI);
        heading = ((heading % 360) + 360) % 360;
        this.headingText.text = `HDG ${Math.round(heading).toString().padStart(3, '0')}`;
      }
    }

    // Update flight assist indicator
    const fa = this.gameState.settings.flightAssist;
    this.flightAssistText.text = fa ? 'FA ON' : 'FA OFF';
    this.flightAssistText.color = fa ? '#4caf50' : '#ff5252';

    // Update ship status bars
    const ship = this.gameState.ship;
    this.hullBar.width = `${(ship.hull / ship.maxHull) * 100}%`;
    this.shieldBar.width = `${(ship.shield / ship.maxShield) * 100}%`;
    this.energyBar.width = `${(ship.fuel / ship.maxFuel) * 100}%`;

    // Update credits
    this.creditsText.text = `${this.gameState.player.credits.toLocaleString()} CR`;

    // Update coordinates
    if (this.playerShip && this.playerShip.mesh) {
      const pos = this.playerShip.mesh.position;
      this.coordsText.text = `${Math.round(pos.x)}, ${Math.round(pos.y)}, ${Math.round(pos.z)}`;
    }

    // Update location text
    const loc = this.gameState.player.currentLocation;
    const locationNames = {
      earth_base: 'DOCKED: EARTH BASE',
      moon_base: 'DOCKED: MOON BASE',
      orbital_station: 'DOCKED: ORBITAL STATION',
      open_space: 'OPEN SPACE'
    };
    this.locationText.text = locationNames[loc] || 'UNKNOWN';
  }

  setupNavLabelToggle() {
    // Create nav label status indicator
    this.navStatusText = new TextBlock('navStatus');
    this.navStatusText.text = 'NAV: ON';
    this.navStatusText.color = '#4caf50';
    this.navStatusText.fontSize = 12;
    this.navStatusText.fontFamily = 'Consolas, monospace';
    this.navStatusText.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
    this.navStatusText.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
    this.navStatusText.left = '-20px';
    this.navStatusText.top = '60px';
    this.gui.addControl(this.navStatusText);

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyN') {
        this.navLabelsVisible = !this.navLabelsVisible;
        this.updateNavLabelsVisibility();
        // Update status indicator
        this.navStatusText.text = this.navLabelsVisible ? 'NAV: ON' : 'NAV: OFF';
        this.navStatusText.color = this.navLabelsVisible ? '#4caf50' : '#888888';
      }
    });
  }

  addNavObject(name, mesh, type = 'station', color = '#4fc3f7', diameter = 100) {
    this.navObjects.push({ name, mesh, type, color, diameter });
    this.createNavLabel(name, color);
  }

  createNavLabel(name, color) {
    // Circle marker - positioned independently at object location
    const circle = new Ellipse(`navCircle_${name}`);
    circle.width = '28px';
    circle.height = '28px';
    circle.color = color;
    circle.thickness = 1.5;
    circle.background = 'transparent';
    circle.isVisible = this.navLabelsVisible;
    this.gui.addControl(circle);

    // Line from circle to label
    const line = new Line(`navLine_${name}`);
    line.lineWidth = 1;
    line.color = color;
    line.isVisible = this.navLabelsVisible;
    this.gui.addControl(line);

    // Text label
    const label = new TextBlock(`navLabel_${name}`);
    label.text = name;
    label.color = color;
    label.fontSize = 13;
    label.fontFamily = 'Consolas, monospace';
    label.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
    label.resizeToFit = true;
    label.isVisible = this.navLabelsVisible;
    this.gui.addControl(label);

    this.navLabels.push({
      name,
      circle,
      line,
      label
    });
  }

  updateNavLabelsVisibility() {
    for (const navLabel of this.navLabels) {
      navLabel.circle.isVisible = this.navLabelsVisible;
      navLabel.line.isVisible = this.navLabelsVisible;
      navLabel.label.isVisible = this.navLabelsVisible;
    }
  }

  updateNavLabels(camera) {
    if (!this.navLabelsVisible || !camera) return;

    const engine = this.scene.getEngine();
    const canvasWidth = engine.getRenderWidth();
    const canvasHeight = engine.getRenderHeight();

    // Get transformation matrices
    const viewMatrix = camera.getViewMatrix();
    const projectionMatrix = camera.getProjectionMatrix();
    const transformMatrix = viewMatrix.multiply(projectionMatrix);

    for (let i = 0; i < this.navObjects.length; i++) {
      const navObj = this.navObjects[i];
      const navLabel = this.navLabels[i];

      if (!navObj.mesh || !navLabel) continue;

      const worldPos = navObj.mesh.position.clone();

      // Check if in front of camera
      const toObject = worldPos.subtract(camera.position);
      const distance = toObject.length();
      const cameraForward = camera.getForwardRay().direction;
      const dot = Vector3.Dot(cameraForward, toObject.normalize());

      if (dot < 0) {
        // Behind camera - hide all elements
        navLabel.circle.isVisible = false;
        navLabel.line.isVisible = false;
        navLabel.label.isVisible = false;
        continue;
      }

      // Project to screen coordinates
      const projectedPos = Vector3.Project(
        worldPos,
        Matrix.Identity(),
        transformMatrix,
        { x: 0, y: 0, width: canvasWidth, height: canvasHeight }
      );

      // Check if on screen (with some margin)
      if (projectedPos.x < -50 || projectedPos.x > canvasWidth + 50 ||
          projectedPos.y < -50 || projectedPos.y > canvasHeight + 50) {
        navLabel.circle.isVisible = false;
        navLabel.line.isVisible = false;
        navLabel.label.isVisible = false;
        continue;
      }

      // Show elements
      navLabel.circle.isVisible = true;
      navLabel.line.isVisible = true;
      navLabel.label.isVisible = true;

      // Convert to GUI coordinates (GUI uses center as origin)
      const guiX = projectedPos.x - canvasWidth / 2;
      const guiY = projectedPos.y - canvasHeight / 2;

      // Calculate apparent size of object on screen
      // Use angular size formula: apparent_size = actual_size / distance * focal_factor
      const objectDiameter = navObj.diameter || 100;
      const fov = camera.fov || 0.8;
      const focalLength = canvasHeight / (2 * Math.tan(fov / 2));
      const apparentSize = (objectDiameter / distance) * focalLength;

      // Clamp circle size between minimum and maximum
      const minCircleSize = 24;
      const maxCircleSize = 300;
      const circleSize = Math.max(minCircleSize, Math.min(maxCircleSize, apparentSize * 1.2)); // 1.2x padding
      const circleRadius = circleSize / 2;

      // Update circle size
      navLabel.circle.width = `${circleSize}px`;
      navLabel.circle.height = `${circleSize}px`;

      // Position circle centered on object
      navLabel.circle.left = `${guiX}px`;
      navLabel.circle.top = `${guiY}px`;

      // Line goes from circle edge (top-right at 45 degrees) to label
      const lineStartX = guiX + circleRadius * 0.7;
      const lineStartY = guiY - circleRadius * 0.7;
      const lineEndX = guiX + circleRadius + 35;
      const lineEndY = guiY - circleRadius - 25;

      // Position line using screen coordinates (add back center offset)
      navLabel.line.x1 = lineStartX + canvasWidth / 2;
      navLabel.line.y1 = lineStartY + canvasHeight / 2;
      navLabel.line.x2 = lineEndX + canvasWidth / 2;
      navLabel.line.y2 = lineEndY + canvasHeight / 2;

      // Position label at end of line
      navLabel.label.left = `${lineEndX + 3}px`;
      navLabel.label.top = `${lineEndY - 10}px`;

      // Format distance
      let distStr;
      if (distance > 10000) {
        distStr = `${(distance / 1000).toFixed(1)}km`;
      } else {
        distStr = `${Math.round(distance)}m`;
      }

      // Update label text with distance
      navLabel.label.text = `${navObj.name}\n${distStr}`;
    }
  }

  dispose() {
    this.gui.dispose();
  }
}
