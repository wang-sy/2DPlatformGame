# Phaser 3 Platform Game Framework

## Project Overview

A production-ready 2D platform game framework built with **Phaser 3** and **TypeScript**. This template provides a complete foundation for creating platform games, featuring advanced player controls, enemy AI, collectibles, trigger systems, and more. The modular architecture makes it easy to extend and customize for your specific needs.

### Core Features

- 🎮 **Complete Game Loop**: Main menu, gameplay, victory/game over scenes
- 🏃 **Advanced Player Controls**: Jump, double jump, wall jump, charged jump, shooting
- 🎯 **Intelligent Enemy System**: Multiple AI behaviors (patrol, follow, jump patterns)
- 💎 **Collection System**: Required items, scoring, visual feedback
- ⚡ **Trigger Mechanism**: Configurable event-based interactions
- 🎵 **Audio Management**: Centralized BGM and sound effects system
- 🎨 **Animation System**: Atlas-based sprite animations with fallback
- 📦 **Tilemap Support**: Create levels using Tiled map editor
- 🆔 **UUID Management**: Unique object identification and referencing
- 📱 **Responsive UI System**: Automatic scaling and layout adaptation for all screen sizes

## Quick Start

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd template-vite-ts

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Game Controls

| Key | Action | Notes |
|-----|--------|-------|
| ← → | Move left/right | Configurable speed |
| ↑ / SPACE | Jump | Normal jump when standing |
| ↑ / SPACE | Double jump | Press again in air |
| ↓ | Duck/Crouch | Hold to crouch |
| ↓ + ↑/SPACE | Charged jump | Crouch first, then hold jump to charge |
| X | Shoot | Has cooldown |
| R | Restart level | Quick restart |

## Project Structure

```
template-vite-ts/
├── src/
│   ├── main.ts                 # Application entry point
│   └── game/
│       ├── main.ts             # Game configuration
│       ├── scenes/             # Game scenes
│       │   ├── Boot.ts         # Initial setup
│       │   ├── Preloader.ts    # Asset loading
│       │   ├── MainMenu.ts     # Main menu
│       │   ├── Game.ts         # Core gameplay
│       │   ├── GameOver.ts     # Game over screen
│       │   └── Victory.ts      # Victory screen
│       ├── sprites/            # Game objects
│       │   ├── Player.ts       # Player character
│       │   ├── Enemy.ts        # Enemy entities
│       │   ├── Collectible.ts  # Collectible items
│       │   ├── Trigger.ts      # Event triggers
│       │   ├── Obstacle.ts     # Obstacles (static/movable/destructible)
│       │   ├── Bullet.ts       # Projectiles
│       │   ├── Goal.ts         # Level goals
│       │   └── StaticHazard.ts # Hazards (spikes, etc.)
│       ├── managers/           # System managers
│       │   ├── AnimationManager.ts     # Animation handling
│       │   ├── BGMPlayer.ts            # Background music
│       │   ├── SoundEffectPlayer.ts    # Sound effects
│       │   ├── GameObjectManager.ts    # Object registry
│       │   ├── CollectedItemsManager.ts # Collection tracking
│       │   └── UIManager.ts            # Responsive UI management
│       ├── events/             # Event system
│       │   └── EventBus.ts     # Global event bus
│       ├── ui/                 # UI components
│       │   └── HealthUI.ts     # Health display
│       └── utils/              # Utilities
│           ├── UUIDGenerator.ts        # UUID generation
│           └── EventBusDebugger.ts     # Event debugging
├── public/
│   └── assets/                # Game assets
│       ├── player/            # Player sprites
│       ├── enemy/             # Enemy sprites
│       ├── collectible/       # Item sprites
│       ├── obstacle/          # Obstacle sprites
│       ├── tilemap/           # Level maps
│       │   └── scenes/        # Tilemap JSON files
│       └── audio/             # Audio files
│           ├── bgm/           # Background music
│           └── sound_effect/  # Sound effects
└── docs/                      # Documentation
    ├── README.md              # This file
    ├── architecture.md        # System architecture
    ├── components.md          # Component reference
    ├── resources.md           # Asset configuration
    ├── tilemap-guide.md       # Level editing guide
    └── modification-guide.md  # Customization guide
```

## Core Concepts

### 1. Scene System

The game uses Phaser's scene system to manage different game states:

- **Boot**: Initialize core systems
- **Preloader**: Load all game assets with progress display
- **MainMenu**: Interactive main menu with options
- **Game**: Core gameplay scene
- **GameOver/Victory**: End game states with statistics

### 2. GameObject Management

All game objects are managed through a centralized **GameObjectManager** using UUIDs:

```typescript
// Register an object
gameObjectManager.registerObject(uuid, object, type, name);

// Retrieve an object
const target = gameObjectManager.getObjectByUUID(uuid);
```

### 3. Event System

Global event communication through **EventBus**:

```typescript
// Emit an event
eventBus.emit(GameEvent.PLAYER_JUMP, { velocity: -500 });

// Listen for events
eventBus.on(GameEvent.PLAYER_JUMP, (data) => {
    console.log('Player jumped with velocity:', data.velocity);
});
```

### 4. Tilemap Integration

Levels are created using Tiled editor with support for:

- Multiple terrain layers
- Object layers for entities
- Custom properties per object
- Collision configuration
- Trigger zones

## Key Systems

### Player System

The player supports multiple configurable abilities:

```typescript
// Configurable in tilemap
{
  "can_jump": true,
  "can_double_jump": true,
  "can_wall_jump": true,
  "can_shoot": true,
  "max_health": 3,
  "move_speed": 200,
  "jump_speed": 500
}
```

### Enemy AI Patterns

Enemies support 8 different movement patterns:

- **static**: No movement
- **patrol**: Back and forth movement
- **jump**: Periodic jumping
- **move_and_jump**: Frog-like movement
- **patrol_jump**: Patrol with jumps
- **follow**: Track player
- **follow_jump**: Track and jump
- **custom**: Combination patterns

### Trigger System

Create interactive events without code:

```typescript
// Example: Moving platform trigger
{
  "type": "trigger",
  "event_type": "move",
  "target_uuid": "platform-001",
  "velocity_y": -200,
  "duration": 1000,
  "return_to_origin": true
}
```

### Collection System

Track and manage collectibles:

- Required items for level completion
- Score tracking
- Visual feedback
- Persistent between scenes

### UI System

Responsive UI management with **UIManager**:

```typescript
// Create responsive UI layout
const uiConfig: UILayoutConfig = {
  baseWidth: 1024,
  baseHeight: 768,
  scalingMode: 'fit',
  elements: {
    title: {
      type: 'text',
      text: 'Game Title',
      position: { x: '50%', y: '30%' }
    },
    playButton: {
      type: 'button',
      text: 'PLAY',
      position: { x: '50%', y: '60%' },
      onClick: () => startGame()
    }
  }
};

const uiManager = new UIManager(scene, uiConfig);
uiManager.createUI();
```

Features:
- Percentage-based positioning
- Automatic scaling for different screen sizes
- Built-in button interactions
- Animation support
- Multiple element types (text, image, button, container)

## Documentation

- 🏗️ [Architecture](./architecture.md) - System design and patterns
- 🧩 [Components](./components.md) - Detailed component API
- 🎨 [Resources](./resources.md) - Asset configuration guide
- 🗺️ [Tilemap Guide](./tilemap-guide.md) - Level creation tutorial
- 🔧 [Modification Guide](./modification-guide.md) - Common customizations
- 📱 [UI System Guide](./ui-system-guide.md) - Responsive UI development

## Technology Stack

- **Phaser 3.86+** - Game engine
- **TypeScript 5.6+** - Type-safe JavaScript
- **Vite 6.0+** - Fast build tool
- **Tiled** - Map editor (external)

## Performance Considerations

- Object pooling for bullets and particles
- Automatic off-screen culling
- Texture atlases for batch rendering
- Event delegation pattern
- Lazy asset loading

## License

MIT License - See LICENSE file for details