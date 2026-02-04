// Input manager handles keyboard and mouse input

export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;

    // Input state
    this.keys = {};
    this.mouse = {
      x: 0,
      y: 0,
      deltaX: 0,
      deltaY: 0,
      buttons: {},
      locked: false
    };

    // Bind event handlers
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handlePointerLockChange = this.handlePointerLockChange.bind(this);
    this.handleClick = this.handleClick.bind(this);

    // Setup listeners
    this.setupListeners();
  }

  setupListeners() {
    // Keyboard
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Mouse
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('click', this.handleClick);

    // Pointer lock
    document.addEventListener('pointerlockchange', this.handlePointerLockChange);
  }

  handleKeyDown(event) {
    this.keys[event.code] = true;

    // Prevent default for game controls
    const preventKeys = [
      'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'
    ];
    if (preventKeys.includes(event.code)) {
      event.preventDefault();
    }
  }

  handleKeyUp(event) {
    this.keys[event.code] = false;
  }

  handleMouseMove(event) {
    if (this.mouse.locked) {
      this.mouse.deltaX = event.movementX;
      this.mouse.deltaY = event.movementY;
    } else {
      this.mouse.x = event.clientX;
      this.mouse.y = event.clientY;
      this.mouse.deltaX = 0;
      this.mouse.deltaY = 0;
    }
  }

  handleMouseDown(event) {
    this.mouse.buttons[event.button] = true;
  }

  handleMouseUp(event) {
    this.mouse.buttons[event.button] = false;
  }

  handleClick() {
    // Request pointer lock on click
    if (!this.mouse.locked) {
      this.canvas.requestPointerLock();
    }
  }

  handlePointerLockChange() {
    this.mouse.locked = document.pointerLockElement === this.canvas;
  }

  // Check if a key is currently pressed
  isKeyDown(code) {
    return this.keys[code] === true;
  }

  // Check if a mouse button is pressed
  isMouseButtonDown(button) {
    return this.mouse.buttons[button] === true;
  }

  // Get mouse movement delta (for look controls)
  getMouseDelta() {
    const delta = {
      x: this.mouse.deltaX,
      y: this.mouse.deltaY
    };

    // Reset delta after reading
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;

    return delta;
  }

  // Get normalized movement input from WASD/arrows
  getMovementInput() {
    const input = { x: 0, y: 0, z: 0 };

    // Forward/backward
    if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) input.z = 1;
    if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) input.z = -1;

    // Strafe left/right
    if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) input.x = -1;
    if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) input.x = 1;

    // Up/down (space/ctrl or R/F)
    if (this.isKeyDown('Space') || this.isKeyDown('KeyR')) input.y = 1;
    if (this.isKeyDown('ControlLeft') || this.isKeyDown('ControlRight') || this.isKeyDown('KeyF')) input.y = -1;

    return input;
  }

  // Get rotation input from Q/E keys
  getRotationInput() {
    let roll = 0;
    if (this.isKeyDown('KeyQ')) roll = 1;
    if (this.isKeyDown('KeyE')) roll = -1;
    return roll;
  }

  // Release pointer lock
  unlock() {
    document.exitPointerLock();
  }

  dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('click', this.handleClick);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChange);
  }
}
