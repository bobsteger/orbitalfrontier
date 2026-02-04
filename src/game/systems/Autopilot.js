import { Vector3 } from '@babylonjs/core/Maths/math.vector';

// Autopilot modes
export const AUTOPILOT_MODE = {
  OFF: 'off',
  NAVIGATE: 'navigate', // Fly to destination
  FOLLOW: 'follow', // Maintain position relative to target
  EVADE: 'evade', // Prioritize avoiding damage
  DEFENSIVE: 'defensive', // Return fire while evading
  OFFENSIVE: 'offensive' // Engage target aggressively
};

export class Autopilot {
  constructor(ship, flightController) {
    this.ship = ship;
    this.flightController = flightController;

    this.mode = AUTOPILOT_MODE.OFF;
    this.destination = null;
    this.targetShip = null;
    this.followDistance = 50;

    // Autopilot quality affects performance (1.0 = basic, 2.0 = advanced)
    this.quality = 1.0;

    // Navigation settings
    this.arrivalThreshold = 100; // Distance at which we consider "arrived"
    this.slowdownDistance = 500; // Distance at which to start slowing
  }

  setMode(mode, target = null) {
    this.mode = mode;

    switch (mode) {
      case AUTOPILOT_MODE.NAVIGATE:
        this.destination = target; // Vector3
        break;
      case AUTOPILOT_MODE.FOLLOW:
      case AUTOPILOT_MODE.DEFENSIVE:
      case AUTOPILOT_MODE.OFFENSIVE:
        this.targetShip = target; // Ship reference
        break;
      case AUTOPILOT_MODE.EVADE:
        this.targetShip = target; // Threat to evade
        break;
    }
  }

  update(deltaTime) {
    if (this.mode === AUTOPILOT_MODE.OFF) return;

    switch (this.mode) {
      case AUTOPILOT_MODE.NAVIGATE:
        this.updateNavigate(deltaTime);
        break;
      case AUTOPILOT_MODE.FOLLOW:
        this.updateFollow(deltaTime);
        break;
      case AUTOPILOT_MODE.EVADE:
        this.updateEvade(deltaTime);
        break;
      case AUTOPILOT_MODE.DEFENSIVE:
        this.updateDefensive(deltaTime);
        break;
      case AUTOPILOT_MODE.OFFENSIVE:
        this.updateOffensive(deltaTime);
        break;
    }
  }

  updateNavigate(deltaTime) {
    if (!this.destination) {
      this.mode = AUTOPILOT_MODE.OFF;
      return;
    }

    const position = this.ship.mesh.position;
    const toDestination = this.destination.subtract(position);
    const distance = toDestination.length();

    // Check if arrived
    if (distance < this.arrivalThreshold) {
      this.flightController.fullStop();
      this.mode = AUTOPILOT_MODE.OFF;
      return;
    }

    // Calculate desired direction
    const desiredDirection = toDestination.normalize();

    // Calculate desired speed based on distance
    let desiredSpeed = 200; // Max cruise speed
    if (distance < this.slowdownDistance) {
      desiredSpeed = (distance / this.slowdownDistance) * 200;
      desiredSpeed = Math.max(desiredSpeed, 20); // Minimum approach speed
    }

    // Rotate to face destination
    this.rotateToward(desiredDirection, deltaTime);

    // Thrust if facing roughly the right direction
    const forward = this.ship.getForward();
    const alignment = Vector3.Dot(forward, desiredDirection);

    if (alignment > 0.9) {
      // We're facing the right way, apply thrust
      const desiredVelocity = desiredDirection.scale(desiredSpeed);
      this.flightController.matchVelocity(desiredVelocity, deltaTime);
    } else if (alignment < 0) {
      // Facing wrong way, slow down
      this.flightController.matchVelocity(Vector3.Zero(), deltaTime);
    }
  }

  updateFollow(deltaTime) {
    if (!this.targetShip || !this.targetShip.mesh) {
      this.mode = AUTOPILOT_MODE.OFF;
      return;
    }

    // Calculate desired position relative to target
    const targetPos = this.targetShip.mesh.position;
    const targetForward = this.targetShip.getForward();

    // Position behind and slightly above target
    const desiredOffset = targetForward.scale(-this.followDistance);
    desiredOffset.y += 10;

    const desiredPosition = targetPos.add(desiredOffset);

    // Temporarily set as destination and use navigate logic
    const originalDestination = this.destination;
    this.destination = desiredPosition;
    this.updateNavigate(deltaTime);
    this.destination = originalDestination;

    // Stay in follow mode
    this.mode = AUTOPILOT_MODE.FOLLOW;
  }

  updateEvade(deltaTime) {
    if (!this.targetShip || !this.targetShip.mesh) {
      // No threat, just drift
      return;
    }

    const threatPosition = this.targetShip.mesh.position;
    const position = this.ship.mesh.position;
    const awayFromThreat = position.subtract(threatPosition).normalize();

    // Add some randomness for unpredictable evasion
    const randomOffset = new Vector3(
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5,
      (Math.random() - 0.5) * 0.5
    );
    const evadeDirection = awayFromThreat.add(randomOffset).normalize();

    // Rotate away from threat
    this.rotateToward(evadeDirection, deltaTime);

    // Full thrust away
    const forward = this.ship.getForward();
    if (Vector3.Dot(forward, evadeDirection) > 0.5) {
      const desiredVelocity = evadeDirection.scale(200);
      this.flightController.matchVelocity(desiredVelocity, deltaTime);
    }
  }

  updateDefensive(deltaTime) {
    // Prioritize evasion but return fire when possible
    this.updateEvade(deltaTime);

    // TODO: Add firing logic when combat system is integrated
  }

  updateOffensive(deltaTime) {
    if (!this.targetShip || !this.targetShip.mesh) {
      this.mode = AUTOPILOT_MODE.OFF;
      return;
    }

    const targetPosition = this.targetShip.mesh.position;
    const position = this.ship.mesh.position;
    const toTarget = targetPosition.subtract(position);
    const distance = toTarget.length();

    // Calculate lead position (where target will be)
    const targetVelocity = this.targetShip.velocity || Vector3.Zero();
    const interceptTime = distance / 500; // Approximate projectile travel time
    const leadPosition = targetPosition.add(targetVelocity.scale(interceptTime));

    const toLeadPosition = leadPosition.subtract(position);
    const attackDirection = toLeadPosition.normalize();

    // Rotate to aim at lead position
    this.rotateToward(attackDirection, deltaTime);

    // Manage distance - stay in optimal weapon range
    const optimalRange = 500;
    const tooClose = 200;

    if (distance < tooClose) {
      // Too close, back off
      const awayDirection = position.subtract(targetPosition).normalize();
      const desiredVelocity = awayDirection.scale(100);
      this.flightController.matchVelocity(desiredVelocity, deltaTime);
    } else if (distance > optimalRange) {
      // Close in
      const desiredVelocity = attackDirection.scale(150);
      this.flightController.matchVelocity(desiredVelocity, deltaTime);
    } else {
      // At good range, match target velocity for stable aiming
      this.flightController.matchVelocity(targetVelocity, deltaTime);
    }

    // TODO: Add firing logic when combat system is integrated
  }

  rotateToward(direction, deltaTime) {
    const forward = this.ship.getForward();
    const rotationSpeed = 2.0 * this.quality;

    // Calculate rotation needed
    const cross = Vector3.Cross(forward, direction);
    const dot = Vector3.Dot(forward, direction);

    // Apply angular velocity toward target direction
    if (dot < 0.999) {
      const rotationAxis = cross.normalize();
      const angle = Math.acos(Math.min(1, Math.max(-1, dot)));
      const rotationAmount = Math.min(angle, rotationSpeed * deltaTime);

      this.ship.angularVelocity = rotationAxis.scale(rotationAmount / deltaTime);
    } else {
      this.ship.angularVelocity = Vector3.Zero();
    }
  }

  // Get ETA to destination (in seconds)
  getETA() {
    if (this.mode !== AUTOPILOT_MODE.NAVIGATE || !this.destination) {
      return null;
    }

    const distance = Vector3.Distance(this.ship.mesh.position, this.destination);
    const speed = this.ship.getSpeed() || 50; // Assume minimum cruise speed

    return distance / speed;
  }

  // Get distance to current target/destination
  getDistanceToTarget() {
    if (this.destination) {
      return Vector3.Distance(this.ship.mesh.position, this.destination);
    }
    if (this.targetShip && this.targetShip.mesh) {
      return Vector3.Distance(this.ship.mesh.position, this.targetShip.mesh.position);
    }
    return null;
  }
}
