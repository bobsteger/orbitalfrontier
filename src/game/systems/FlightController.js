import { Vector3, Quaternion } from '@babylonjs/core/Maths/math.vector';

// Flight controller handles ship physics and controls
// Implements hybrid Newtonian flight model with optional flight assist

export class FlightController {
  constructor(ship, inputManager, gameState) {
    this.ship = ship;
    this.inputManager = inputManager;
    this.gameState = gameState;

    // Flight model parameters
    this.maxSpeed = 200; // Max speed with flight assist on
    this.maxSpeedNoAssist = 1000; // Max speed with flight assist off (for safety)

    // Control sensitivity
    this.pitchSpeed = 1.5;
    this.yawSpeed = 1.5;
    this.rollSpeed = 2.0;
    this.mouseSensitivity = 0.002;

    // Damping factors (for flight assist)
    this.linearDamping = 0.98;
    this.angularDamping = 0.95;
  }

  update(deltaTime) {
    // Get ship type properties
    const shipType = this.ship.type;

    // Handle rotation input (mouse + keyboard)
    this.handleRotation(deltaTime, shipType);

    // Handle thrust input
    this.handleThrust(deltaTime, shipType);

    // Apply flight assist if enabled
    if (this.gameState.settings.flightAssist) {
      this.applyFlightAssist(deltaTime);
    }

    // Apply physics
    this.applyPhysics(deltaTime);

    // Update ship thrust visual
    const thrustInput = this.inputManager.getMovementInput();
    this.ship.setThrustLevel(Math.abs(thrustInput.z) > 0 ? Math.abs(thrustInput.z) : 0);
  }

  handleRotation(deltaTime, shipType) {
    const agility = shipType.agility;

    // Get mouse input for pitch/yaw
    const mouseDelta = this.inputManager.getMouseDelta();

    // Get keyboard roll input
    const rollInput = this.inputManager.getRotationInput();

    // Calculate rotation rates
    const pitchRate = -mouseDelta.y * this.mouseSensitivity * agility;
    const yawRate = mouseDelta.x * this.mouseSensitivity * agility;
    const rollRate = rollInput * this.rollSpeed * agility * deltaTime;

    // Apply rotation to angular velocity
    this.ship.angularVelocity.x += pitchRate;
    this.ship.angularVelocity.y += yawRate;
    this.ship.angularVelocity.z += rollRate;

    // Apply angular damping
    this.ship.angularVelocity.scaleInPlace(this.angularDamping);

    // Clamp angular velocity
    const maxAngularSpeed = 3;
    if (this.ship.angularVelocity.length() > maxAngularSpeed) {
      this.ship.angularVelocity.normalize().scaleInPlace(maxAngularSpeed);
    }

    // Create rotation quaternion from angular velocity
    const rotationAmount = this.ship.angularVelocity.scale(deltaTime);

    // Create quaternions for each axis
    const pitchQuat = Quaternion.RotationAxis(
      this.ship.getRight(),
      rotationAmount.x
    );
    const yawQuat = Quaternion.RotationAxis(
      this.ship.getUp(),
      rotationAmount.y
    );
    const rollQuat = Quaternion.RotationAxis(
      this.ship.getForward(),
      rotationAmount.z
    );

    // Combine rotations
    const combinedRotation = pitchQuat.multiply(yawQuat).multiply(rollQuat);

    // Apply to ship
    if (this.ship.mesh.rotationQuaternion) {
      this.ship.mesh.rotationQuaternion = this.ship.mesh.rotationQuaternion.multiply(combinedRotation);
      this.ship.mesh.rotationQuaternion.normalize();
    }
  }

  handleThrust(deltaTime, shipType) {
    const input = this.inputManager.getMovementInput();

    // Calculate thrust force based on ship properties
    const thrustPower = shipType.thrust / shipType.mass;

    // Get ship's local axes
    const forward = this.ship.getForward();
    const right = this.ship.getRight();
    const up = this.ship.getUp();

    // Calculate thrust vector in world space
    const thrustVector = new Vector3(0, 0, 0);

    // Forward/backward thrust
    if (input.z !== 0) {
      thrustVector.addInPlace(forward.scale(input.z * thrustPower * deltaTime));
    }

    // Strafe thrust (reduced power)
    if (input.x !== 0) {
      thrustVector.addInPlace(right.scale(input.x * thrustPower * 0.5 * deltaTime));
    }

    // Vertical thrust (reduced power)
    if (input.y !== 0) {
      thrustVector.addInPlace(up.scale(input.y * thrustPower * 0.5 * deltaTime));
    }

    // Apply thrust to velocity
    this.ship.velocity.addInPlace(thrustVector);
  }

  applyFlightAssist(deltaTime) {
    // Speed limiter
    const currentSpeed = this.ship.velocity.length();
    if (currentSpeed > this.maxSpeed) {
      this.ship.velocity.normalize().scaleInPlace(this.maxSpeed);
    }

    // Drift dampening - gradually reduce lateral velocity
    const forward = this.ship.getForward();
    const forwardSpeed = Vector3.Dot(this.ship.velocity, forward);
    const forwardVelocity = forward.scale(forwardSpeed);
    const lateralVelocity = this.ship.velocity.subtract(forwardVelocity);

    // Only dampen lateral velocity, not forward
    const dampenedLateral = lateralVelocity.scale(this.linearDamping);
    this.ship.velocity = forwardVelocity.add(dampenedLateral);

    // Angular dampening is stronger with assist
    this.ship.angularVelocity.scaleInPlace(0.9);
  }

  applyPhysics(deltaTime) {
    // Safety: limit maximum velocity
    const maxVelocity = this.gameState.settings.flightAssist ? this.maxSpeed : this.maxSpeedNoAssist;
    if (this.ship.velocity.length() > maxVelocity) {
      this.ship.velocity.normalize().scaleInPlace(maxVelocity);
    }

    // Update position based on velocity
    const movement = this.ship.velocity.scale(deltaTime);
    this.ship.mesh.position.addInPlace(movement);
  }

  // Emergency stop - kill all velocity
  fullStop() {
    this.ship.velocity = Vector3.Zero();
    this.ship.angularVelocity = Vector3.Zero();
  }

  // Match velocity with a target (for docking, formation flying)
  matchVelocity(targetVelocity, deltaTime) {
    const diff = targetVelocity.subtract(this.ship.velocity);
    const maxAdjustment = (this.ship.type.thrust / this.ship.type.mass) * deltaTime;

    if (diff.length() <= maxAdjustment) {
      this.ship.velocity = targetVelocity.clone();
    } else {
      this.ship.velocity.addInPlace(diff.normalize().scale(maxAdjustment));
    }
  }

  // Get current flight data for HUD
  getFlightData() {
    return {
      speed: this.ship.getSpeed(),
      velocity: this.ship.velocity.clone(),
      position: this.ship.mesh.position.clone(),
      flightAssist: this.gameState.settings.flightAssist,
      heading: this.getHeading()
    };
  }

  getHeading() {
    const forward = this.ship.getForward();
    // Calculate heading angle from forward vector
    const heading = Math.atan2(forward.x, forward.z) * (180 / Math.PI);
    return ((heading % 360) + 360) % 360;
  }
}
