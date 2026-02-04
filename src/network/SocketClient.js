// WebSocket client for multiplayer (stubbed for Phase 1)
// This will be implemented fully in Phase 2

export class SocketClient {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.playerId = null;
    this.callbacks = {};
  }

  // Connect to game server
  async connect(serverUrl) {
    // Stub: In Phase 2, this will use Socket.io
    console.log('SocketClient: Multiplayer not yet implemented');

    // Simulate successful connection for single-player
    this.connected = false;
    this.playerId = 'local_player';

    return Promise.resolve();
  }

  // Disconnect from server
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connected = false;
  }

  // Register callback for server events
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  // Remove callback
  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  // Emit event to server
  emit(event, data) {
    if (!this.connected) {
      console.warn('SocketClient: Not connected to server');
      return;
    }

    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Trigger local callbacks (for debugging/single player)
  trigger(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(data));
    }
  }

  // Send position update to server
  sendPositionUpdate(position, rotation, velocity) {
    this.emit('position_update', {
      playerId: this.playerId,
      position: { x: position.x, y: position.y, z: position.z },
      rotation: rotation ? { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w } : null,
      velocity: { x: velocity.x, y: velocity.y, z: velocity.z }
    });
  }

  // Send combat event to server
  sendCombatEvent(type, targetId, damage) {
    this.emit('combat_event', {
      playerId: this.playerId,
      type,
      targetId,
      damage
    });
  }

  // Send trade transaction to server
  sendTradeTransaction(stationId, goods, action) {
    this.emit('trade_transaction', {
      playerId: this.playerId,
      stationId,
      goods,
      action
    });
  }

  // Request zone transfer
  requestZoneTransfer(targetZone) {
    this.emit('zone_transfer', {
      playerId: this.playerId,
      targetZone
    });
  }

  // Get connection status
  isConnected() {
    return this.connected;
  }

  // Get player ID
  getPlayerId() {
    return this.playerId;
  }
}
