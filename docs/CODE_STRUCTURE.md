# Code Structure Guide

## Project Overview

This is a game project based on Phaser 3 and TypeScript, using Vite as the build tool. The project adopts object-oriented design patterns, implementing a modular and maintainable code structure through patterns such as Manager and Singleton.

## Directory Structure

```
template-vite-ts/
├── src/
│   ├── main.ts                    # Application entry point
│   ├── vite-env.d.ts             # Vite type definitions
│   └── game/
│       ├── main.ts                # Game configuration and initialization
│       ├── managers/              # Manager classes (Singleton pattern)
│       │   ├── AnimationManager.ts
│       │   ├── BGMPlayer.ts
│       │   ├── CollectedItemsManager.ts
│       │   └── SoundEffectPlayer.ts
│       ├── scenes/                # Game scenes
│       │   ├── Boot.ts
│       │   ├── Preloader.ts
│       │   ├── MainMenu.ts
│       │   ├── Game.ts
│       │   ├── Victory.ts
│       │   └── GameOver.ts
│       ├── sprites/               # Game sprite classes
│       │   ├── Player.ts
│       │   ├── Enemy.ts
│       │   ├── Collectible.ts
│       │   ├── StaticHazard.ts
│       │   └── Goal.ts
│       └── ui/                    # UI components
│           └── HealthUI.ts
├── public/                        # Static resources
│   └── assets/
│       ├── tilemap/              # Tiled map files
│       ├── audio/                # Audio resources
│       └── ...                   # Other resources
├── vite/                         # Vite configuration
│   ├── config.dev.mjs
│   └── config.prod.mjs
└── docs/                         # Documentation
    ├── SoundEffectConfiguration.md
    ├── TILEMAP_GUIDE.md
    ├── BGM_GUIDE.md
    └── CODE_STRUCTURE.md
```

## Core Architecture

### 1. Game Initialization Flow

```
main.ts → game/main.ts → Boot → Preloader → MainMenu → Game → Victory/GameOver
```

#### src/main.ts
Application entry point, simply imports the game main file:
```typescript
import './game/main';
```

#### src/game/main.ts
Game configuration and Phaser instance creation:
```typescript
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [Boot, Preloader, MainMenu, Game, GameOver, Victory]
};

export default new Phaser.Game(config);
```

### 2. Scene System

#### Boot.ts
- Initialize basic resources
- Load boot screen resources
- Initialize BGMPlayer

```typescript
export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // Load boot resources
        this.load.image('background', 'assets/bg.png');
    }

    create() {
        // Initialize BGMPlayer
        BGMPlayer.getInstance().initialize(this.game);
        // Go to preloader scene
        this.scene.start('Preloader');
    }
}
```

#### Preloader.ts
- Automatically parse and load Tilemap resources
- Load atlases and animation configurations
- Initialize sound effect system
- Create all animations

Key features:
1. **Automatic resource loading**: Parse tilemap.json, automatically load all referenced resources
2. **Atlas recognition**: Distinguish atlases from regular images through `atlas` attribute
3. **Animation configuration**: Automatically load `_animators.json` files

```typescript
private loadAllAssets() {
    let tilemapJsonObj = JSON.parse(tilemapJsonRaw);
    let tilesets = tilemapJsonObj["tilesets"];
    
    tilesets.forEach((tileset: any) => {
        // Check if it's an atlas
        if (isAtlas) {
            // Load atlas and animation configuration
            this.load.atlas(name, imageUri, atlasJsonUri);
            this.load.json(`${name}_animations`, animationConfigUri);
        } else {
            // Load regular image
            this.load.image(name, imageUri);
        }
    });
}
```

#### Game.ts
- Parse Tilemap to create game world
- Manage game logic and collision detection
- Handle player input and game state

Core features:
1. **Tilemap parsing**: Create layers and objects
2. **Object factory**: Create different game objects based on type
3. **Collision management**: Set up physics collisions and overlap detection
4. **Game flow**: Handle victory and failure conditions

```typescript
private createObject(obj: Phaser.Types.Tilemaps.TiledObject) {
    switch (obj.type) {
        case "player":
            this.createPlayerFromTilemap(obj);
            break;
        case "enemy":
            this.createEnemyFromTilemap(obj);
            break;
        case "collectible":
            this.createCollectibleFromTilemap(obj);
            break;
        // ...
    }
}
```

### 3. Manager System (Managers)

#### AnimationManager (Animation Manager)
**Design Pattern**: Singleton Pattern
**Responsibility**: Centrally manage creation and playback of all sprite animations

Core features:
- Load animation configurations (supports old and new formats)
- Batch create animations
- Provide unified animation playback interface

```typescript
export class AnimationManager {
    private static instance: AnimationManager;
    private atlasAnimations: Map<string, AnimationConfig[]> = new Map();
    
    static getInstance(): AnimationManager {
        if (!AnimationManager.instance) {
            AnimationManager.instance = new AnimationManager();
        }
        return AnimationManager.instance;
    }
    
    // Create animations
    createAnimationsForAtlas(atlasKey: string): void
    
    // Play animation
    playAnimation(sprite: Sprite, atlasKey: string, animationName: string): void
}
```

#### BGMPlayer (Background Music Player)
**Design Pattern**: Singleton Pattern
**Responsibility**: Manage game background music playback

Core features:
- Automatically monitor scene switching
- Play corresponding music based on configuration files
- Preload and lazy load strategies
- Prevent duplicate playback

```typescript
export class BGMPlayer {
    private static instance: BGMPlayer;
    private bgmConfig: BGMConfig | null = null;
    private currentBGM: string | null = null;
    
    public initialize(game: Phaser.Game): void
    private checkSceneChange(): void
    private onSceneChange(sceneName: string): void
    public setVolume(volume: number): void
}
```

#### SoundEffectPlayer (Sound Effect Player)
**Design Pattern**: Singleton Pattern
**Responsibility**: Manage game sound effect playback

Core features:
- Animation-sound automatic association
- Random sound effect selection
- Sound effect preload management
- Global volume control

```typescript
export class SoundEffectPlayer {
    private static instance: SoundEffectPlayer;
    private soundEffectConfig: SoundEffectConfig = {};
    private animationToSounds: Map<string, SoundEffect[]> = new Map();
    
    async loadConfig(configPath: string): Promise<void>
    playAnimationSound(atlasKey: string, animationName: string, volume?: number): void
    setGlobalVolume(volume: number): void
}
```

#### CollectedItemsManager (Collected Items Manager)
**Design Pattern**: Regular class (instantiated per Game scene)
**Responsibility**: Track items collected by player

Core features:
- Record collected items
- Calculate total score
- Track must-collect items
- Generate statistics

```typescript
export class CollectedItemsManager {
    private collectedItems: CollectedItem[] = [];
    private mustCollectItems: Set<string> = new Set();
    
    collectItem(name: string, type: string, score: number, mustCollect: boolean): void
    hasCollectedAllRequired(): boolean
    getTotalScore(): number
    getSummaryData(): CollectionSummary
}
```

### 4. Sprite System (Sprites)

#### Player (Player Class)
**Inheritance**: `Phaser.Physics.Arcade.Sprite`
**Features**:
- Multiple movement abilities (double jump, wall jump, charge jump)
- Animation state management
- Health system
- Sound effect integration

Core mechanics:
```typescript
export class Player extends Phaser.Physics.Arcade.Sprite {
    // Movement abilities
    private jumpCount: number = 0;
    private maxJumps: number = 2;
    private isTouchingWall: boolean = false;
    private isCharging: boolean = false;
    
    // State management
    private health: number = 3;
    private isInvulnerable: boolean = false;
    
    // Animation and sound
    private animationManager: AnimationManager;
    private soundEffectPlayer: SoundEffectPlayer;
    
    update(): void {
        // Handle input
        // Update animation
        // Play sound effects
    }
}
```

#### Enemy (Enemy Class)
**Inheritance**: `Phaser.Physics.Arcade.Sprite`
**Features**:
- Patrol AI
- Configurable properties (speed, range, damage)
- Animation system
- Defeat mechanism

```typescript
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private moveSpeed: number;
    private moveRange: number;
    private patrolBehavior: 'horizontal' | 'vertical' | 'static';
    
    constructor(scene: Scene, enemyObject: Phaser.Types.Tilemaps.TiledObject) {
        // Read properties from Tiled object
        const properties = enemyObject.properties;
        this.moveSpeed = properties.moveSpeed || 50;
        this.moveRange = properties.moveRange || 100;
    }
    
    update(): void {
        // Execute patrol logic
    }
}
```

#### Collectible (Collectible Class)
**Inheritance**: `Phaser.Physics.Arcade.Sprite`
**Features**:
- Collection effects (scale, rotate, fade out)
- Score system
- Must-collect marker

```typescript
export class Collectible extends Phaser.Physics.Arcade.Sprite {
    private score: number;
    private itemType: string;
    private mustCollect: boolean;
    
    collect(): void {
        // Play collection animation
        // Mark as collected
        // Destroy object
    }
}
```

### 5. UI System

#### HealthUI (Health UI)
UI component displaying player health:

```typescript
export class HealthUI extends Phaser.GameObjects.Container {
    private hearts: Phaser.GameObjects.Image[] = [];
    
    updateHealth(currentHealth: number): void {
        // Update heart icon display
        // Add animation effects
    }
}
```

## Design Patterns

### 1. Singleton Pattern
Used for global managers:
- AnimationManager
- BGMPlayer
- SoundEffectPlayer

Advantages:
- Global access point
- Avoid duplicate instantiation
- State sharing

### 2. Factory Pattern
Object creation in Game.ts:

```typescript
private createObject(obj: TiledObject) {
    switch (obj.type) {
        case "player": return new Player(this, obj);
        case "enemy": return new Enemy(this, obj);
        // ...
    }
}
```

### 3. Observer Pattern
Scene event system:

```typescript
// BGMPlayer listens for scene changes
this.game.events.on('step', () => {
    this.checkSceneChange();
});
```

### 4. Strategy Pattern
Different patrol behaviors for enemies:

```typescript
switch (this.patrolBehavior) {
    case 'horizontal':
        this.horizontalPatrol();
        break;
    case 'vertical':
        this.verticalPatrol();
        break;
}
```

## Data Flow

### 1. Configuration-Driven
All major systems are driven by JSON configuration files:

```
tilemap.json → Map and object configuration
bgm-config.json → Background music configuration
sound_effect/config.json → Sound effect configuration
*_animators.json → Animation configuration
```

### 2. Resource Loading Flow

```
Preloader.preload()
    ↓
Parse tilemap.json
    ↓
Identify resource types (atlas/image)
    ↓
Load corresponding resources
    ↓
Preloader.create()
    ↓
Create animations
    ↓
Initialize sound effects
```

### 3. Game Loop

```
Game.update()
    ↓
Player.update() → Handle input
    ↓
Enemy.update() → AI logic
    ↓
Collision detection
    ↓
UI update
```

## Extension Guide

### Adding New Scenes

1. Create scene class:
```typescript
// src/game/scenes/NewScene.ts
export class NewScene extends Scene {
    constructor() {
        super('NewScene');
    }
    
    preload() { }
    create() { }
    update() { }
}
```

2. Register scene:
```typescript
// src/game/main.ts
scene: [..., NewScene]
```

3. Configure BGM (optional):
```json
// bgm-config.json
"scenes": {
    "NewScene": {
        "bgm": "new_scene_music"
    }
}
```

### Adding New Sprite Types

1. Create sprite class:
```typescript
// src/game/sprites/NewSprite.ts
export class NewSprite extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Scene, obj: TiledObject) {
        super(scene, obj.x, obj.y, obj.name);
        // Initialize
    }
}
```

2. Register in Game.ts:
```typescript
private createObject(obj: TiledObject) {
    switch (obj.type) {
        case "new_sprite":
            return new NewSprite(this, obj);
    }
}
```

### Adding New Managers

1. Create manager class:
```typescript
// src/game/managers/NewManager.ts
export class NewManager {
    private static instance: NewManager;
    
    static getInstance(): NewManager {
        if (!NewManager.instance) {
            NewManager.instance = new NewManager();
        }
        return NewManager.instance;
    }
}
```

2. Initialize where needed:
```typescript
// Preloader.ts or Boot.ts
NewManager.getInstance().init(this);
```

## Best Practices

### 1. Type Safety
Always use TypeScript's type system:

```typescript
// Good practice
private health: number = 100;
private moveSpeed: number;

// Avoid
private health = 100; // any type
```

### 2. Resource Management
- Centralize resource loading in Preloader
- Use configuration files to manage resource paths
- Clean up unnecessary resources on scene transitions

### 3. Performance Optimization
- Use object pools for frequently created/destroyed objects
- Set physics collision body sizes appropriately
- Use atlases to reduce Draw Calls

### 4. Code Organization
- One class per file
- Related functionality in the same directory
- Use clear naming conventions

## Debugging Tips

### 1. Physics Debugging
```typescript
// Enable in Game config
physics: {
    arcade: {
        debug: true
    }
}
```

### 2. Console Logging
All managers have detailed log output:
```typescript
console.log('[SoundEffectPlayer]', message);
console.log('BGMPlayer:', message);
```

### 3. Scene Debugging
```typescript
// Get current active scenes
const activeScenes = this.game.scene.getScenes(true);
console.log('Active scenes:', activeScenes);
```

## Common Pattern Examples

### Delayed Execution
```typescript
this.time.delayedCall(1000, () => {
    // Execute after 1 second
});
```

### Tween Animation
```typescript
this.tweens.add({
    targets: sprite,
    x: 100,
    duration: 1000,
    ease: 'Power2'
});
```

### Event Listening
```typescript
this.input.on('pointerdown', (pointer) => {
    // Handle click
});
```

## Summary

The project adopts a clear layered architecture:
1. **Scene Layer**: Manages game flow
2. **Manager Layer**: Provides global services
3. **Sprite Layer**: Implements game entities
4. **UI Layer**: Handles user interface

Through configuration-driven design, singleton managers, factory patterns, and other design patterns, a highly modular and extensible code structure is achieved. Each component has clear responsibilities, making it easy to maintain and extend.