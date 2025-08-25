# System Architecture

## Overview

This document describes the architecture of the Phaser 3 Platform Game Framework, including design patterns, system interactions, and implementation details.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Application                          │
├───────────────────┬─────────────────┬───────────────────────┤
│    Scene Layer    │   Manager Layer  │    Event Layer        │
├───────────────────┼─────────────────┼───────────────────────┤
│ • Boot            │ • GameObjectMgr  │ • EventBus            │
│ • Preloader       │ • AnimationMgr   │ • Event Types         │
│ • MainMenu        │ • BGMPlayer      │ • Event Debugger      │
│ • Game            │ • SoundEffectMgr │                       │
│ • GameOver        │ • CollectionMgr  │                       │
│ • Victory         │                  │                       │
├───────────────────┴─────────────────┴───────────────────────┤
│                      Sprite Layer                            │
├───────────────────────────────────────────────────────────────┤
│ Player │ Enemy │ Collectible │ Trigger │ Obstacle │ Bullet │
└───────────────────────────────────────────────────────────────┘
```

## Design Patterns

### 1. Singleton Pattern

Used for global managers that need single instances throughout the game:

```typescript
export class GameObjectManager {
    private static instance: GameObjectManager;
    
    static getInstance(): GameObjectManager {
        if (!GameObjectManager.instance) {
            GameObjectManager.instance = new GameObjectManager();
        }
        return GameObjectManager.instance;
    }
}
```

**Applied to:**
- GameObjectManager
- AnimationManager
- BGMPlayer
- SoundEffectPlayer

### 2. Observer Pattern (Event Bus)

Decouples components through event-driven communication:

```typescript
// Publisher
eventBus.emit(GameEvent.PLAYER_JUMP, { 
    player: this, 
    velocity: -500 
});

// Subscriber
eventBus.on(GameEvent.PLAYER_JUMP, (data) => {
    this.handlePlayerJump(data);
});
```

### 3. Factory Pattern

Used for creating game objects from tilemap data:

```typescript
private createObject(obj: Phaser.Types.Tilemaps.TiledObject) {
    switch (obj.type) {
        case "player":
            return this.createPlayerFromTilemap(obj);
        case "enemy":
            return this.createEnemyFromTilemap(obj);
        // ...
    }
}
```

### 4. Strategy Pattern

Enemy AI behaviors are implemented as strategies:

```typescript
private updateMovement() {
    switch (this.moveMethod) {
        case 'patrol':
            this.updatePatrol();
            break;
        case 'follow':
            this.updateFollow();
            break;
        // Different movement strategies
    }
}
```

## Core Systems

### Scene Management

The game flow is controlled through Phaser's scene system:

```
Boot → Preloader → MainMenu → Game → Victory/GameOver
                       ↑                     ↓
                       └─────────────────────┘
```

Each scene has specific responsibilities:

- **Boot**: Initialize game configuration
- **Preloader**: Load assets and show progress
- **MainMenu**: Handle menu interactions
- **Game**: Core gameplay logic
- **Victory/GameOver**: Display results and statistics

### Object Management System

The UUID-based object management provides:

1. **Unique Identification**: Every object gets a UUID
2. **Cross-referencing**: Objects can reference each other
3. **Lifecycle Management**: Track creation and destruction
4. **Type Registry**: Categorize objects by type

```typescript
interface RegisteredObject {
    uuid: string;
    object: Phaser.GameObjects.GameObject;
    type: string;
    name?: string;
}
```

### Event System Architecture

Events flow through the system in a hierarchical manner:

```
User Input → Sprite Action → Event Emission → System Response
     ↓            ↓               ↓                ↓
  Keyboard    Player.jump()   PLAYER_JUMP    SoundEffect.play()
```

**Event Categories:**

1. **Player Events**: Movement, combat, damage
2. **Game State Events**: Start, pause, game over
3. **Audio Events**: Play BGM, sound effects
4. **Animation Events**: Trigger sprite animations
5. **Collection Events**: Item pickup, score update

### Animation System

The animation system uses a fallback hierarchy:

```
1. Check for sprite-specific animation
2. Fall back to animation type default
3. Fall back to static frame
```

**Animation Configuration:**

```typescript
{
    "animations": [
        {
            "name": "idle",
            "frames": ["idle/frame0000"],
            "frameRate": 10,
            "repeat": -1
        }
    ]
}
```

### Audio Architecture

Audio is managed through two specialized systems:

1. **BGMPlayer**: Handles background music
   - Scene-based track selection
   - Volume control
   - Fade transitions

2. **SoundEffectPlayer**: Manages sound effects
   - Animation-synchronized playback
   - Priority system
   - Pooled audio objects

### Physics System

Built on Phaser's Arcade Physics:

```typescript
// Physics configuration
physics: {
    default: "arcade",
    arcade: {
        gravity: { x: 0, y: 600 },
        debug: false
    }
}
```

**Collision Groups:**
- Player vs Terrain
- Player vs Enemies
- Player vs Collectibles
- Bullets vs Enemies
- Triggers vs Player

## Data Flow

### 1. Level Loading

```
Tilemap JSON → Parser → Object Factory → Game World
     ↓           ↓            ↓              ↓
   Tiled     Properties   Create Sprites  Register UUIDs
```

### 2. Player Input

```
Keyboard → Cursors → Player.update() → Physics → Animation
    ↓         ↓            ↓             ↓          ↓
  Input    Process     Move/Jump    Collision   Sprite
```

### 3. Trigger Activation

```
Player Overlap → Trigger.activate() → Find Target → Execute Event
       ↓                ↓                  ↓             ↓
   Detection         Check UUID        GameObject     Action
```

## Memory Management

### Object Pooling

Reusable objects are pooled to reduce garbage collection:

```typescript
// Bullet pooling
this.bullets = scene.physics.add.group({
    classType: Bullet,
    maxSize: 10,
    runChildUpdate: true
});
```

### Asset Management

Assets are loaded on-demand and cached:

```typescript
// Preload only essential assets
this.load.image('player', 'assets/player/character.png');

// Lazy load optional assets
if (needsAsset && !this.textures.exists(key)) {
    this.load.image(key, path);
}
```

## Performance Optimizations

### 1. Culling

Off-screen objects are automatically culled by Phaser.

### 2. Batch Rendering

Texture atlases enable batch rendering:

```typescript
// All frames in one draw call
this.load.atlas('player', 'player.png', 'player.json');
```

### 3. Event Delegation

Single event bus reduces listener overhead.

### 4. Update Loop Optimization

Only active objects run update logic:

```typescript
// Skip if not active
if (!this.active) return;
```

## Extension Points

### Adding New Object Types

1. Create sprite class extending `Phaser.Physics.Arcade.Sprite`
2. Add factory method in `Game.ts`
3. Register type in tilemap parser
4. Add UUID support in `GameObjectManager`

### Adding New Scenes

1. Create scene class extending `Phaser.Scene`
2. Register in game config
3. Add navigation logic
4. Update event bus if needed

### Custom AI Behaviors

1. Add new method to Enemy class
2. Implement movement logic
3. Add to switch statement
4. Configure in tilemap properties

## Security Considerations

### Input Validation

All tilemap properties are validated:

```typescript
// Validate numeric properties
const health = Math.max(1, Math.min(100, prop.value));
```

### Asset Security

Assets are served from controlled paths:

```typescript
// Restrict to assets directory
const assetPath = '/assets/' + sanitize(filename);
```

## Testing Strategy

### Unit Testing

Test individual components:
- Sprite behaviors
- Manager functions
- Utility methods

### Integration Testing

Test system interactions:
- Scene transitions
- Event propagation
- Object creation

### Performance Testing

Monitor:
- Frame rate
- Memory usage
- Load times

## Deployment Architecture

### Build Process

```
TypeScript → Transpile → Bundle → Optimize → Deploy
    ↓           ↓          ↓         ↓         ↓
   .ts       ES2015      Vite    Minify    /dist
```

### Hosting Requirements

- Static file server
- HTTPS support (for audio)
- CORS headers for assets
- Compression support

## Future Enhancements

### Planned Features

1. **Multiplayer Support**: WebRTC integration
2. **Level Editor**: In-game level creation
3. **Save System**: Progress persistence
4. **Mod Support**: Custom content loading
5. **Analytics**: Player behavior tracking

### Architecture Improvements

1. **Component System**: Entity-Component-System pattern
2. **State Machine**: Formal state management
3. **Dependency Injection**: Improved testability
4. **Plugin System**: Modular extensions

## Conclusion

The architecture provides a solid foundation for platform games while remaining flexible for customization. The modular design, event-driven communication, and UUID-based object management enable complex interactions while maintaining code clarity and performance.