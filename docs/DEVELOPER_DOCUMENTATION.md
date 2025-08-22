# 🔧 Developer Documentation

Comprehensive technical guide for developers working with the Advanced Phaser 3 Platform Game Framework. This document covers architecture, APIs, extension points, and best practices.

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Systems](#core-systems)
3. [Sprite System](#sprite-system)
4. [Manager Systems](#manager-systems)
5. [Event System](#event-system)
6. [Scene Management](#scene-management)
7. [UUID System](#uuid-system)
8. [Trigger System](#trigger-system)
9. [Animation System](#animation-system)
10. [Audio System](#audio-system)
11. [Extension Guide](#extension-guide)
12. [Performance Guidelines](#performance-guidelines)
13. [Debugging Tools](#debugging-tools)
14. [API Reference](#api-reference)

## 🏗️ Architecture Overview

### Technology Stack
- **Framework**: Phaser 3.90.0
- **Language**: TypeScript 5.7.2
- **Build Tool**: Vite 6.3.1
- **Physics**: Arcade Physics
- **Module System**: ES Modules

### Design Patterns
- **Singleton Pattern**: Managers (AnimationManager, GameObjectManager)
- **Observer Pattern**: Event Bus system
- **Factory Pattern**: Object creation from tilemap
- **Component Pattern**: Sprite behaviors
- **Object Pool Pattern**: Bullet management

### Core Principles
1. **Configuration-Driven**: JSON files control behavior
2. **Event-Driven**: Loose coupling via event bus
3. **UUID-Based**: Unique identification for all objects
4. **Modular Design**: Independent, reusable components
5. **Type Safety**: Full TypeScript typing

## 🎮 Core Systems

### Game Initialization Flow
```typescript
// src/main.ts
const game = new Game({
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: [Boot, Preloader, MainMenu, Game, GameOver, Victory]
});
```

### Scene Lifecycle
1. **Boot**: Initial setup, basic assets
2. **Preloader**: Load all game assets
3. **MainMenu**: Title screen and navigation
4. **Game**: Main gameplay loop
5. **GameOver/Victory**: End states

## 🎯 Sprite System

### Base Sprite Architecture

#### Player Class
```typescript
export class Player extends Phaser.Physics.Arcade.Sprite {
    // Core properties
    private health: number = 3;
    private maxHealth: number = 3;
    private moveSpeed: number = 200;
    private jumpSpeed: number = 500;
    
    // Advanced mechanics
    private jumpCount: number = 0;
    private maxJumps: number = 2;
    private isCharging: boolean = false;
    private chargeTime: number = 0;
    
    constructor(scene: Scene, tiledObject: TiledObject) {
        // Read properties from tilemap
        const properties = tiledObject.properties as any[];
        if (properties) {
            const maxHealthProp = properties.find(prop => prop.name === 'max_health');
            if (maxHealthProp) {
                this.maxHealth = maxHealthProp.value;
                this.health = this.maxHealth;
            }
        }
    }
}
```

#### Enemy Class
```typescript
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private moveMethod: string;
    private moveSpeed: number = 50;
    private damage: number = 1;
    
    // AI behaviors
    private updateAI(): void {
        switch(this.moveMethod) {
            case 'patrol': this.patrol(); break;
            case 'follow': this.followPlayer(); break;
            case 'jump': this.jumpBehavior(); break;
        }
    }
}
```

### Sprite Properties Configuration
All sprites can be configured via tilemap properties:
```json
{
    "name": "enemy_sprite",
    "type": "enemy",
    "properties": [
        {"name": "uuid", "value": "enemy-001"},
        {"name": "move_method", "value": "patrol"},
        {"name": "move_speed", "value": 100},
        {"name": "patrol_distance", "value": 200},
        {"name": "damage", "value": 1}
    ]
}
```

## 🎛️ Manager Systems

### AnimationManager
Singleton manager for all sprite animations.

```typescript
class AnimationManager {
    private static instance: AnimationManager;
    private animations: Map<string, AnimationConfig>;
    
    static getInstance(): AnimationManager {
        if (!this.instance) {
            this.instance = new AnimationManager();
        }
        return this.instance;
    }
    
    createAnimationsForAtlas(atlasKey: string): void {
        // Auto-generate animations from atlas
    }
    
    playAnimation(sprite: Sprite, atlas: string, animKey: string): void {
        // Play animation with fallback
    }
}
```

### GameObjectManager
UUID-based object registry.

```typescript
class GameObjectManager {
    private gameObjects: Map<string, GameObjectWithUUID>;
    
    registerObject(uuid: string, object: GameObject, type: string): void {
        // Register object with UUID
    }
    
    getObjectByUUID(uuid: string): GameObjectWithUUID | undefined {
        // Retrieve object by UUID
    }
    
    getObjectsByType(type: string): GameObjectWithUUID[] {
        // Get all objects of type
    }
}
```

### BGMPlayer & SoundEffectPlayer
Audio management systems.

```typescript
class BGMPlayer {
    private config: BGMConfig;
    private currentBGM: string | null;
    
    async loadAndPlayBGM(sceneName: string): Promise<void> {
        // Scene-based BGM playback
    }
}

class SoundEffectPlayer {
    private soundMappings: Map<string, string[]>;
    
    playAnimationSound(atlas: string, animation: string): void {
        // Animation-synchronized SFX
    }
}
```

## 📡 Event System

### EventBus Architecture
Central communication hub for all game systems.

```typescript
// Event types
export enum GameEvent {
    SCENE_START = 'scene-start',
    PLAYER_HIT = 'player-hit',
    ENEMY_DEFEATED = 'enemy-defeated',
    ITEM_COLLECTED = 'item-collected',
    // ... 50+ event types
}

// Event data interfaces
interface PlayerHitData {
    damage: number;
    source: string;
    knockback: Vector2;
}

// Usage
eventBus.emit(GameEvent.PLAYER_HIT, {
    damage: 1,
    source: 'enemy',
    knockback: { x: -200, y: -100 }
});

eventBus.on(GameEvent.PLAYER_HIT, (data: PlayerHitData) => {
    // Handle player hit
});
```

### Event Flow Patterns
1. **Scene Events**: Scene transitions and lifecycle
2. **Combat Events**: Damage, death, victory
3. **Collection Events**: Items, score, achievements
4. **UI Events**: Menu interactions, HUD updates
5. **Audio Events**: Music changes, sound triggers

## 🎬 Scene Management

### Scene Structure
```typescript
export class Game extends Phaser.Scene {
    // Core properties
    private player: Player;
    private enemies: Phaser.Physics.Arcade.Group;
    private triggers: Trigger[];
    private gameObjectManager: GameObjectManager;
    
    create(): void {
        // 1. Setup world
        this.createTilemap();
        
        // 2. Create objects from tilemap
        this.createObjectsFromTilemap();
        
        // 3. Setup collisions
        this.createOverlapEvents();
        
        // 4. Initialize UI
        this.createUI();
    }
    
    private createObjectsFromTilemap(): void {
        // Parse tilemap objects
        // Create triggers last to ensure targets exist
        const triggers: TiledObject[] = [];
        
        this.map.getObjectLayer('Objects').objects.forEach(obj => {
            if (obj.type === 'trigger') {
                triggers.push(obj);
            } else {
                this.createObject(obj);
            }
        });
        
        // Create triggers after all objects
        triggers.forEach(obj => this.createObject(obj));
    }
}
```

## 🆔 UUID System

### Implementation Details
Every game object has a unique identifier for cross-referencing.

```typescript
// UUID Generation
export class UUIDGenerator {
    static generate(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Object Registration
const uuid = properties.find(p => p.name === 'uuid')?.value || UUIDGenerator.generate();
gameObjectManager.registerObject(uuid, sprite, 'enemy');

// Object Retrieval
const target = gameObjectManager.getObjectByUUID(targetUUID);
```

### UUID Usage Patterns
1. **Trigger Targets**: Triggers reference objects by UUID
2. **Cross-References**: Objects can reference each other
3. **Save System**: UUIDs enable save/load functionality
4. **Debug Tracking**: Track object relationships

## 🎯 Trigger System

### Trigger Architecture
Invisible zones that activate events when players enter.

```typescript
export class Trigger extends Phaser.GameObjects.Zone {
    private eventType: 'move' | 'scale';
    private targetUUID: string;
    private triggered: boolean = false;
    
    activate(player: Player): void {
        if (this.triggered && !this.repeat) return;
        
        this.scene.time.delayedCall(this.delay, () => {
            this.executeTriggerEvent();
        });
    }
    
    private executeMoveEvent(target: GameObject): void {
        // Handle static vs dynamic bodies differently
        if (isStatic) {
            // Animate position for static bodies
            this.scene.tweens.add({
                targets: target,
                x: target.x + moveX,
                y: target.y + moveY,
                duration: this.duration
            });
        } else {
            // Set velocity for dynamic bodies
            target.setVelocity(this.velocityX, this.velocityY);
        }
    }
}
```

### Trigger Properties
```json
{
    "type": "trigger",
    "properties": [
        {"name": "event_type", "value": "move|scale"},
        {"name": "target_uuid", "value": "object-uuid"},
        {"name": "velocity_x", "value": 0},
        {"name": "velocity_y", "value": -1000},
        {"name": "scale_x", "value": 2.0},
        {"name": "scale_y", "value": 2.0},
        {"name": "duration", "value": 1500},
        {"name": "delay", "value": 200},
        {"name": "repeat", "value": true},
        {"name": "return_to_origin", "value": false}
    ]
}
```

## 🎨 Animation System

### Animation Configuration
```json
{
    "anims": [
        {
            "key": "idle",
            "frames": [0, 1, 2, 3],
            "frameRate": 10,
            "repeat": -1
        },
        {
            "key": "walk",
            "frames": [4, 5, 6, 7, 8, 9],
            "frameRate": 15,
            "repeat": -1
        }
    ]
}
```

### Animation Manager Usage
```typescript
// Create animations from atlas
animationManager.createAnimationsForAtlas('player');

// Play animation
animationManager.playAnimation(sprite, 'player', 'walk');

// Animation events
eventBus.emit(GameEvent.ANIMATION_PLAY, {
    sprite: this,
    atlas: 'player',
    animation: 'jump'
});
```

## 🔊 Audio System

### Background Music System
```typescript
// Configuration
{
    "MainMenu": "menu-theme.mp3",
    "Game": "level-1.mp3",
    "Victory": "victory-fanfare.mp3"
}

// Usage
bgmPlayer.startMonitoring(scene);
// Automatically plays appropriate music per scene
```

### Sound Effects System
```typescript
// Configuration
{
    "player": {
        "jump": ["jump1.mp3", "jump2.mp3"],
        "hit": ["hurt.mp3"],
        "shoot": ["laser.mp3"]
    }
}

// Animation-triggered SFX
eventBus.on(GameEvent.ANIMATION_PLAY, (data) => {
    soundEffectPlayer.playAnimationSound(data.atlas, data.animation);
});
```

## 🚀 Extension Guide

### Adding New Sprite Types
1. Create class extending `Phaser.Physics.Arcade.Sprite`
2. Add property parsing in constructor
3. Register type in `Game.createObject()`
4. Add to tilemap with properties

### Adding New Trigger Events
1. Add event type to Trigger class
2. Implement execute method
3. Add properties parsing
4. Document in configuration guide

### Adding New Managers
1. Create singleton class
2. Initialize in Boot or Preloader
3. Add event listeners if needed
4. Document public API

### Adding New Scenes
1. Create scene class extending `Phaser.Scene`
2. Add to game config scenes array
3. Implement create/update methods
4. Add BGM configuration

## ⚡ Performance Guidelines

### Optimization Strategies
1. **Object Pooling**: Reuse bullets and particles
2. **Texture Atlases**: Combine sprites for batch rendering
3. **Event Cleanup**: Remove listeners when not needed
4. **Culling**: Disable off-screen objects
5. **LOD System**: Reduce detail for distant objects

### Performance Monitoring
```typescript
// FPS monitoring
this.game.loop.actualFps

// Object count
this.children.length

// Physics bodies
this.physics.world.bodies.entries.length
```

## 🐛 Debugging Tools

### EventBus Debugger
```typescript
// Enable in development
if (import.meta.env.DEV) {
    eventBusDebugger.enable();
}
```

### UUID Registry Debug
```typescript
// Press 'U' key to log all objects
gameObjectManager.debugLogObjects();
```

### Trigger Visualization
```typescript
// Uncomment in Trigger constructor
if (import.meta.env.DEV) {
    this.createDebugVisualization();
}
```

### Console Commands
```javascript
// Get player
game.scene.scenes[3].player

// List all UUIDs
GameObjectManager.getInstance().getAllObjects()

// Trigger event manually
eventBus.emit('player-hit', {damage: 1})
```

## 📚 API Reference

### Player API
```typescript
class Player {
    // Properties
    health: number;
    maxHealth: number;
    
    // Methods
    takeDamage(damage: number): void;
    heal(amount: number): void;
    shoot(): void;
    jump(): void;
    getHealth(): number;
    getMaxHealth(): number;
}
```

### Enemy API
```typescript
class Enemy {
    // Properties
    moveMethod: string;
    damage: number;
    
    // Methods
    takeDamage(damage: number): void;
    getDamage(): number;
    setMoveMethod(method: string): void;
}
```

### GameObjectManager API
```typescript
class GameObjectManager {
    // Methods
    registerObject(uuid: string, object: GameObject, type: string): void;
    getObjectByUUID(uuid: string): GameObjectWithUUID | undefined;
    getObjectsByType(type: string): GameObjectWithUUID[];
    removeObject(uuid: string): boolean;
    hasObject(uuid: string): boolean;
    getAllObjects(): GameObjectWithUUID[];
}
```

### EventBus API
```typescript
class EventBus {
    // Methods
    emit(event: GameEvent, data?: any): void;
    on(event: GameEvent, callback: Function): void;
    once(event: GameEvent, callback: Function): void;
    off(event: GameEvent, callback: Function): void;
    removeAllListeners(event?: GameEvent): void;
}
```

## 🔄 Development Workflow

### Setup
```bash
npm install
npm run dev
```

### Build Process
```bash
# Development build
npm run dev

# Production build
npm run build

# Build without logs
npm run build-nolog
```

### Testing Checklist
- [ ] Player controls responsive
- [ ] Enemies behave correctly
- [ ] Triggers activate properly
- [ ] Audio plays correctly
- [ ] UI updates properly
- [ ] Performance acceptable (60 FPS)

### Deployment
1. Run production build
2. Test dist/ locally
3. Deploy to static host
4. Verify all assets load

## 📝 Best Practices

1. **Always use TypeScript types**
2. **Configure via JSON, not hardcoded values**
3. **Use event bus for communication**
4. **Register objects with UUIDs**
5. **Clean up resources in destroy()**
6. **Test on multiple browsers**
7. **Profile performance regularly**
8. **Document configuration options**

---

For questions or contributions, please refer to the main README or create an issue on GitHub.