# Orbital Frontier
## Game Design Document v1.0

---

## Overview

**Title:** Orbital Frontier  
**Genre:** Space Flight Simulator / Trading / Combat  
**Setting:** Near-future cislunar space (Earth-Moon system)  
**Platform:** Web browser (desktop primary, mobile stretch goal)  
**Target Audience:** Players who enjoy space sims, trading games, and skill-based flight combat  

### Elevator Pitch

Orbital Frontier is a multiplayer space simulation set in the colonized space between Earth and Moon. Players pilot customizable ships as traders, fighters, or explorers—flying manually for precise control or delegating to upgradeable autopilot systems. The frontier is a place of opportunity and danger, where factions vie for influence and every journey through open space carries risk.

### Core Fantasy

You are a frontier pilot in humanity's first off-world economy. The stations and bases are safe harbors, but the space between them is wild—and profitable for those skilled or clever enough to navigate it.

---

## Technical Specification

### Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Game Engine** | Babylon.js | JavaScript-native, excellent 3D performance, strong space/sci-fi capability, plays to developer's web skills |
| **Language** | JavaScript (ES6+) | Developer expertise; TypeScript optional for scale |
| **UI Framework** | HTML/CSS + Babylon.GUI | Menu systems in HTML/CSS, in-game HUD via Babylon.GUI |
| **Multiplayer** | WebSocket (Socket.io or ws) | Real-time bidirectional communication |
| **Backend** | Node.js + Express | JavaScript throughout the stack |
| **Database** | SQLite (dev) → PostgreSQL (prod) | Player accounts, ship state, economy |
| **Authentication** | JWT tokens | Stateless, scalable session management |
| **Hosting** | TBD | Options: Heroku, Railway, DigitalOcean, AWS |

### Required Libraries

```json
{
  "dependencies": {
    "@babylonjs/core": "^7.x",
    "@babylonjs/gui": "^7.x",
    "@babylonjs/loaders": "^7.x",
    "@babylonjs/materials": "^7.x",
    "socket.io": "^4.x",
    "socket.io-client": "^4.x",
    "express": "^4.x",
    "jsonwebtoken": "^9.x",
    "better-sqlite3": "^9.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "eslint": "^8.x"
  }
}
```

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Babylon.js  │  │  Game State │  │  WebSocket Client   │  │
│  │  Renderer   │◄─┤  Manager    │◄─┤  (Socket.io)        │  │
│  └─────────────┘  └─────────────┘  └──────────┬──────────┘  │
└───────────────────────────────────────────────┼─────────────┘
                                                │
                                                │ WebSocket
                                                │
┌───────────────────────────────────────────────┼─────────────┐
│                        SERVER                 │             │
│  ┌──────────────────┐  ┌─────────────────────▼──────────┐  │
│  │  Game Instance   │  │  WebSocket Server              │  │
│  │  Manager         │◄─┤  (Socket.io)                   │  │
│  └────────┬─────────┘  └────────────────────────────────┘  │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────────┐  ┌────────────────────────────────┐  │
│  │  Physics/Game    │  │  Database (SQLite/PostgreSQL)  │  │
│  │  Simulation      │  │  - Player accounts             │  │
│  └──────────────────┘  │  - Ship configurations         │  │
│                        │  - Economy state               │  │
│                        └────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Multiplayer Architecture

**Phase 1: Instanced Sessions**
- Players connect to discrete "zone" instances
- Each zone handles max 16-32 concurrent players
- Zones: Earth vicinity, Moon vicinity, Orbital Station vicinity, Open Space sectors
- State synchronized via authoritative server
- Players can transition between zones (loading screen during handoff)

**Phase 2: Persistent MMO-lite (Future)**
- Zone servers communicate via message queue
- Shared database for persistent world state
- Seamless zone transitions
- Global economy synchronization

---

## Game World

### Setting

The year is 2087. Humanity has established a permanent presence in cislunar space. Earth's governments, lunar colonists, and independent operators compete for resources and influence in the void between worlds. The frontier is profitable but lawless—a place where opportunity and danger travel together.

### Locations

| Location | Description | Services |
|----------|-------------|----------|
| **Earth Base** | High-orbit station serving as gateway to Earth. Heavy Earth Authority presence. Safe, expensive, well-stocked. | Repair, Trade, Upgrades, Missions, Skills |
| **Moon Base** | Lunar surface installation. Hub of mining operations. Lunar Collective territory. Industrial, practical. | Repair, Trade, Upgrades, Missions, Skills |
| **Orbital Station** | Independent station at L1 Lagrange point. Free Traders Guild headquarters. Neutral ground, busy, diverse. | Repair, Trade, Upgrades, Missions, Skills |
| **Open Space** | The void between destinations. Travel lanes, debris fields, asteroid clusters. Where danger lives. | None (exploration, combat, travel) |

### Factions

| Faction | Philosophy | Player Relationship |
|---------|------------|---------------------|
| **Earth Authority** | Order, regulation, taxation. Believes Earth should govern all human space. | Reputation affects docking fees, mission availability, legal status |
| **Lunar Collective** | Independence, self-sufficiency. Moon-born colonists who want autonomy. | Reputation affects trade prices, mission availability, safe harbor |
| **Free Traders Guild** | Profit, pragmatism. Merchants who pay for protection and stay neutral. | Reputation affects trade opportunities, information, escort contracts |
| **Void Runners** | Freedom, opportunity, survival. Pirates, salvagers, smugglers. The threat. | NPC antagonists primarily; gray market access at very high reputation |

### Conflict Drivers

- **Resource Scarcity:** Helium-3 from lunar mining is the dominant energy source. Control of supply routes is power.
- **Political Tension:** Earth Authority wants to extend jurisdiction; Lunar Collective resists.
- **Economic Competition:** Free Traders exploit the gaps; Void Runners exploit everyone.
- **Player Agency:** Players choose who to help, who to cross, and what kind of pilot to become.

---

## Core Mechanics

### Flight Model: Hybrid Newtonian

**Base Physics (Newtonian):**
- Ships have mass and moment of inertia
- Thrust adds velocity; no drag in vacuum
- Must burn retrograde to slow down
- Rotation and translation are independent

**Flight Assist System:**
- Toggle on/off (default: on for new players)
- When on:
  - Auto-dampens lateral drift
  - Limits maximum velocity for control
  - Assists with orientation toward velocity vector
- When off:
  - Full Newtonian physics
  - Enables advanced maneuvers (flipping, drifting combat)
  - Higher skill ceiling, higher risk

**Autopilot System:**
- Separate from flight assist
- Can be given high-level instructions:
  - **Navigate:** Fly to selected destination
  - **Follow:** Maintain position relative to target ship
  - **Evade:** Prioritize avoiding damage
  - **Defensive:** Return fire while evading
  - **Offensive:** Engage target aggressively
- Autopilot quality is upgradeable (see Progression)
- Player can take manual control at any time (overrides autopilot)

### Combat System

**Where:** Open space only. Bases and stations are safe zones.

**Manual Combat:**
- Direct control of ship orientation and thrust
- Weapons aimed via reticle (lead indicator for moving targets)
- Manage energy between weapons, shields, engines
- High skill ceiling, rewarding mastery

**Autopilot Combat:**
- AI follows assigned behavior mode
- Effectiveness depends on autopilot module quality
- Player can manage systems and give strategic commands
- Good for multitasking (trading while under escort, managing fleet)

**Weapons (Initial Set):**
| Weapon | Type | Characteristics |
|--------|------|-----------------|
| Pulse Laser | Energy | Accurate, moderate damage, no ammo |
| Autocannon | Ballistic | High damage, requires ammo, less accurate |
| Missile | Guided | High damage, limited payload, can be evaded/shot down |

**Damage Model:**
- Shields absorb damage first (regenerate over time)
- Hull damage reduces ship function
- Systems can be damaged (engines, weapons, autopilot)
- Destruction = respawn at last station (with penalties)

### Trading System

**Goods:**
| Category | Examples | Notes |
|----------|----------|-------|
| Raw Materials | Ore, Ice, Helium-3 | Cheap at source, valuable at stations |
| Manufactured | Electronics, Parts, Medicine | Station specialties |
| Contraband | Weapons, Narcotics, Stolen Data | Illegal at Authority stations, profitable |

**Trading Loop:**
1. Check prices at current station
2. Buy goods (limited by cargo capacity and credits)
3. Travel to destination (risk of piracy in open space)
4. Sell goods for profit
5. Repeat, upgrade, expand

**Economy (Phase 1):**
- Fixed prices per station
- Each station has specialties (cheap to buy) and needs (expensive to sell)
- Price list available at all stations (no hidden information)

**Economy (Future):**
- Dynamic supply/demand
- Player actions affect prices
- Market speculation possible

### Station Interface (Menu-Based)

When docked, player sees UI panels for:

**Hangar**
- Repair hull and systems (costs credits)
- View ship status
- Switch ships (when multiple owned)

**Shipyard**
- Purchase ship upgrades
- Buy new ships
- Sell current ship

**Market**
- Buy and sell goods
- View price comparisons to other stations

**Mission Board**
- Accept contracts (delivery, escort, combat, smuggling)
- View active missions
- Claim rewards

**Training**
- Purchase skill unlocks
- View skill tree
- Spend skill points

**Reputation**
- View standing with each faction
- See effects of current reputation levels

---

## Progression Systems

### Credits (Currency)

- Earned via trading, missions, combat bounties, salvage
- Spent on repairs, upgrades, ships, goods, skills
- No premium currency (monetization TBD, cosmetics only if any)

### Ship Upgrades

| System | Upgrades |
|--------|----------|
| **Engines** | Thrust power, fuel efficiency, max speed (with assist) |
| **Weapons** | Damage, fire rate, energy efficiency, new weapon types |
| **Shields** | Capacity, recharge rate, resistance types |
| **Cargo** | Capacity expansion, refrigeration (perishables), hidden compartments (contraband) |
| **Autopilot** | Combat effectiveness, navigation efficiency, new behavior modes |
| **Sensors** | Detection range, target info detail, stealth detection |

### Skill Unlocks

Skills represent pilot training, unlocked with credits and skill points (earned via play).

| Skill Tree | Examples |
|------------|----------|
| **Piloting** | Improved flight assist, manual control bonuses, evasion |
| **Combat** | Weapon accuracy, missile tracking, shield management |
| **Trading** | Better prices, larger transaction limits, contraband handling |
| **Engineering** | Repair efficiency, system optimization, jury-rigging |
| **Leadership** | (Future) NPC crew bonuses, fleet command |

### Faction Reputation

| Level | Effects |
|-------|---------|
| **Hostile** | Attacked on sight, no docking |
| **Unfriendly** | High prices, no missions, searched for contraband |
| **Neutral** | Standard prices and access |
| **Friendly** | Discounts, better missions, tips |
| **Allied** | Best prices, exclusive missions, faction-specific gear |

Reputation is a zero-sum tension: helping one faction often hurts another.

---

## Ships

### Archetypes

Players choose one starting ship; others can be purchased later.

| Ship | Class | Strengths | Weaknesses |
|------|-------|-----------|------------|
| **Talon** | Fighter | Fast, agile, strong weapons, good shields | Tiny cargo, expensive to repair |
| **Hauler** | Freighter | Huge cargo, efficient engines, durable hull | Slow, weak weapons, sluggish handling |
| **Wanderer** | All-Rounder | Balanced stats, versatile, upgradeable | Master of none, average at everything |

### Ship Stats

| Stat | Description |
|------|-------------|
| Hull | Total hit points |
| Shield | Regenerating damage buffer |
| Cargo | Cubic meters of storage |
| Mass | Affects acceleration and handling |
| Thrust | Engine power |
| Agility | Rotation speed |
| Power | Energy generation for weapons/shields |
| Hardpoints | Weapon mount slots |

---

## Demo Scope (v0.1)

The initial playable demo focuses on the core loop: **fly, trade, survive.**

### Included Features

- [ ] One flyable ship (Wanderer all-rounder)
- [ ] Hybrid flight model with toggleable flight assist
- [ ] Basic autopilot (navigate to destination)
- [ ] Three locations (Earth Base, Moon Base, Orbital Station)
- [ ] Open space travel between locations
- [ ] Menu-based station interface (repair, trade only)
- [ ] Simple trading loop (3-5 goods, fixed prices)
- [ ] Basic NPC pirates (Void Runners) in open space
- [ ] Manual combat with one weapon type
- [ ] Single-player only (multiplayer infrastructure stubbed)

### Excluded from Demo (Future Phases)

- Multiplayer
- Ship upgrades and alternate ships
- Skill system
- Faction reputation
- Missions/contracts
- Autopilot combat behaviors
- Advanced weapons

---

## Development Phases

### Phase 1: Prototype (Demo)
- Core flight mechanics
- Single-player trading loop
- Basic combat
- Three stations + open space
- Duration: 4-8 weeks

### Phase 2: Foundation
- Multiplayer (instanced)
- All three ship types
- Ship upgrade system
- Full station services
- Duration: 8-12 weeks

### Phase 3: Depth
- Skill system
- Faction reputation
- Mission system
- Autopilot combat modes
- Duration: 8-12 weeks

### Phase 4: Polish & Expansion
- Dynamic economy
- Additional ships and weapons
- More locations (asteroid belts, derelicts)
- Persistent MMO-lite transition (if viable)
- Duration: Ongoing

---

## Art & Audio Direction

### Visual Style

- **Aesthetic:** Grounded near-future sci-fi (The Expanse, For All Mankind)
- **Ships:** Functional, utilitarian, visible thrusters and radiators
- **Stations:** Industrial, modular, lived-in
- **Space:** Beautiful but hostile—Earth and Moon visible, starfields, lens flares
- **UI:** Clean, holographic, readable at a glance

### Audio

- **Music:** Ambient electronic, building during combat
- **SFX:** Muffled thrust (cockpit perspective), weapon impacts, UI feedback
- **Voice:** (Future) Mission briefings, autopilot callouts, faction chatter

---

## Appendix

### Inspirations

- Elite Dangerous (flight model, trading)
- Freelancer (accessibility, mission structure)
- EVE Online (economy, factions)
- The Expanse (setting, aesthetic)
- Escape Velocity (indie spirit, scope management)

### Open Questions

- Monetization model (free-to-play with cosmetics? Premium purchase?)
- Mobile support (touch controls feasible?)
- Permadeath or soft death?
- Player-owned stations (late game)?

### File Structure (Recommended)

```
orbital-frontier/
├── GAME_DESIGN_DOCUMENT.md
├── README.md
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.js
│   ├── game/
│   │   ├── Game.js
│   │   ├── scenes/
│   │   │   ├── SpaceScene.js
│   │   │   └── StationScene.js
│   │   ├── entities/
│   │   │   ├── Ship.js
│   │   │   ├── Station.js
│   │   │   └── Projectile.js
│   │   ├── systems/
│   │   │   ├── FlightController.js
│   │   │   ├── Autopilot.js
│   │   │   ├── CombatSystem.js
│   │   │   └── TradingSystem.js
│   │   └── ui/
│   │       ├── HUD.js
│   │       └── StationMenu.js
│   ├── network/
│   │   └── SocketClient.js
│   └── utils/
│       └── helpers.js
├── server/
│   ├── index.js
│   ├── gameInstance.js
│   └── database.js
├── assets/
│   ├── models/
│   ├── textures/
│   └── audio/
└── docs/
    └── GAME_DESIGN_DOCUMENT.md
```

---

*Document Version: 1.0*  
*Last Updated: February 2025*  
*Project: Orbital Frontier*
