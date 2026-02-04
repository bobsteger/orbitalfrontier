# Orbital Frontier

A multiplayer space flight simulator with trading and combat, set in cislunar space (Earth-Moon system).

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The game will open automatically at `http://localhost:3000`

### Controls

| Key | Action |
|-----|--------|
| W/S | Thrust forward/backward |
| A/D | Strafe left/right |
| Space/F | Thrust up/down |
| Q/E | Roll left/right |
| Mouse | Pitch and yaw |
| Click | Enable mouse look |
| ESC | Release mouse |
| Enter | Dock (when near station) |

## Project Structure

```
orbital-frontier/
├── src/
│   ├── main.js              # Entry point
│   ├── game/
│   │   ├── Game.js          # Main game class
│   │   ├── GameState.js     # Player/ship state management
│   │   ├── scenes/
│   │   │   └── SpaceScene.js    # Main 3D scene
│   │   ├── entities/
│   │   │   ├── Ship.js          # Player/NPC ships
│   │   │   ├── Station.js       # Space stations
│   │   │   └── Projectile.js    # Weapons fire
│   │   ├── systems/
│   │   │   ├── InputManager.js      # Keyboard/mouse input
│   │   │   ├── FlightController.js  # Ship physics
│   │   │   ├── Autopilot.js         # AI navigation
│   │   │   ├── CombatSystem.js      # Weapons and damage
│   │   │   └── TradingSystem.js     # Economy
│   │   └── ui/
│   │       ├── HUD.js           # In-game overlay
│   │       └── StationMenu.js   # Docking interface
│   ├── network/
│   │   └── SocketClient.js  # Multiplayer (Phase 2)
│   └── utils/
│       └── helpers.js       # Utility functions
├── server/
│   ├── index.js         # Express + Socket.io server
│   ├── gameInstance.js  # Zone management
│   └── database.js      # Data persistence
├── assets/
│   ├── models/          # 3D models
│   ├── textures/        # Images and skyboxes
│   └── audio/           # Sound effects and music
└── docs/
    └── GAME_DESIGN_DOCUMENT.md
```

## Technology Stack

- **Engine:** Babylon.js 7.x
- **Build Tool:** Vite 5.x
- **Multiplayer:** Socket.io 4.x (Phase 2)
- **Backend:** Node.js + Express
- **Database:** SQLite (dev) / PostgreSQL (prod)

## Development Phases

### Phase 1: Prototype (Current)
- [x] Core flight mechanics
- [x] Basic ship physics with flight assist
- [x] Three stations + open space
- [x] Simple trading system
- [ ] Basic NPC pirates
- [ ] Manual combat

### Phase 2: Foundation
- [ ] Multiplayer (instanced zones)
- [ ] All three ship types
- [ ] Ship upgrade system
- [ ] Full station services

### Phase 3: Depth
- [ ] Skill system
- [ ] Faction reputation
- [ ] Mission system
- [ ] Autopilot combat modes

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run server   # Start game server (multiplayer)
```

## License

All rights reserved. This is a private project.
