# Developer Documentation

This comprehensive guide is for developers who want to extend the Phaser 3 TypeScript game template with new features, modify existing systems, or understand the architecture for maintenance and optimization.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Systems](#core-systems)
3. [Event System](#event-system)
4. [Scene Management](#scene-management)
5. [Entity System](#entity-system)
6. [Manager Systems](#manager-systems)
7. [UI System](#ui-system)
8. [Asset Pipeline](#asset-pipeline)
9. [Development Workflow](#development-workflow)
10. [Extension Guide](#extension-guide)
11. [Performance Optimization](#performance-optimization)
12. [Debugging Guide](#debugging-guide)

## Architecture Overview

### Technology Stack

- **Framework**: Phaser 3.90.0
- **Language**: TypeScript 5.7.2
- **Build Tool**: Vite 6.3.1
- **Physics Engine**: Arcade Physics
- **Module System**: ES Modules

### Project Structure

```
src/
├── main.ts                    # Application entry point
├── game/
│   ├── main.ts               # Game initialization
│   ├── events/               # Event system
│   │   └── EventBus.ts      # Centralized event bus
│   ├── scenes/               # Game scenes
│   │   ├── Boot.ts          # Initial loading
│   │   ├── Preloader.ts     # Asset preloading
│   │   ├── MainMenu.ts      # Main menu
│   │   ├── Game.ts          # Main gameplay
│   │   ├── GameOver.ts      # Game over screen
│   │   └── Victory.ts       # Victory screen
│   ├── sprites/              # Game entities
│   │   ├── Player.ts        # Player character
│   │   ├── Enemy.ts         # Enemy entities
│   │   ├── Collectible.ts   # Collectible items
│   │   ├── Goal.ts          # Level goals
│   │   └── StaticHazard.ts  # Static hazards
│   ├── managers/             # System managers
│   │   ├── AnimationManager.ts      # Animation system
│   │   ├── BGMPlayer.ts             # Background music
│   │   ├── SoundEffectPlayer.ts     # Sound effects
│   │   └── CollectedItemsManager.ts # Item tracking
│   ├── ui/                   # UI components
│   │   └── HealthUI.ts      # Health display
│   └── utils/                # Utilities
│       └── EventBusDebugger.ts # Debug tools
```

### Data Flow Architecture

```
┌─────────────────┐
│   Entry Point   │
│    (main.ts)    │
└────────┬────────┘
         │
    ┌────▼────┐
    │  Game   │
    │  Init   │
    └────┬────┘
         │
    ┌────▼────┐     ┌──────────────┐
    │  Boot   │────▶│  Preloader   │
    │  Scene  │     │    Scene     │
    └─────────┘     └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Main Menu   │
                    │    Scene     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  Game Scene  │◀──┐
                    └──────┬───────┘   │
                           │            │
                ┌──────────┴─────────┐  │
                ▼                    ▼  │
         ┌─────────────┐    ┌──────────┴─┐
         │  Game Over  │    │  Victory   │
         │    Scene    │    │   Scene    │
         └─────────────┘    └────────────┘
```

## Core Systems

### 1. Game Configuration (game/main.ts:12-32)

```typescript
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,                    // Renderer type
    width: 1024,                   // Game width
    height: 768,                   // Game height
    parent: 'game-container',      // DOM container
    backgroundColor: '#028af8',    // Background color
    scene: [...],                  // Scene list
    physics: {
        default: "arcade",
        arcade: {
            gravity: {x: 0, y: 600},
            debug: false           // Set true for physics debug
        }
    }
};
```

### 2. Singleton Pattern Implementation

Most managers use singleton pattern for global access:

```typescript
export class ManagerClass {
    private static instance: ManagerClass;
    
    private constructor() {}
    
    public static getInstance(): ManagerClass {
        if (!ManagerClass.instance) {
            ManagerClass.instance = new ManagerClass();
        }
        return ManagerClass.instance;
    }
}
```

## Event System

### EventBus Architecture (events/EventBus.ts)

The EventBus provides type-safe, centralized event communication:

#### Event Types (EventBus.ts:1-51)

```typescript
export enum GameEvent {
    // Scene events
    SCENE_CHANGE = 'scene:change',
    SCENE_START = 'scene:start',
    
    // Player events
    PLAYER_JUMP = 'player:jump',
    PLAYER_DAMAGE = 'player:damage',
    
    // Animation events
    ANIMATION_PLAY = 'animation:play',
    
    // Audio events
    BGM_PLAY = 'bgm:play',
    SOUND_EFFECT_PLAY = 'sound:play',
    
    // Game events
    ITEM_COLLECT = 'item:collect',
    GOAL_REACHED = 'goal:reached'
}
```

#### Event Data Interface (EventBus.ts:53-180)

```typescript
export interface EventData {
    [GameEvent.PLAYER_JUMP]: {
        player: any;
        velocity: number;
    };
    [GameEvent.ITEM_COLLECT]: {
        item: any;
        type: string;
        value?: number;
    };
}
```

#### Usage Example

```typescript
// Emit event
eventBus.emit(GameEvent.PLAYER_JUMP, {
    player: this,
    velocity: -500
});

// Listen to event
eventBus.on(GameEvent.PLAYER_JUMP, (data) => {
    console.log(`Player jumped with velocity: ${data.velocity}`);
});
```

## Scene Management

### Scene Lifecycle

Each scene extends `Phaser.Scene` and follows this lifecycle:

1. **constructor()**: Initialize scene key
2. **init()**: Receive data from previous scene
3. **preload()**: Load assets
4. **create()**: Set up game objects
5. **update()**: Game loop (60fps)

### Boot Scene (scenes/Boot.ts)

```typescript
export class Boot extends Scene {
    preload() {
        // Load minimal assets for preloader
        this.load.image('background', 'assets/bg.png');
    }
    
    create() {
        this.scene.start('Preloader');
    }
}
```

### Preloader Scene (scenes/Preloader.ts)

Handles all asset loading with dynamic tilemap parsing:

```typescript
private loadAllAssets() {
    // Parse tilemap JSON
    let tilemapJsonObj = JSON.parse(tilemapJsonRaw);
    let tilesets = tilemapJsonObj["tilesets"];
    
    tilesets.forEach((tileset: any) => {
        // Check if tileset is atlas
        let isAtlas = tileset.tiles?.[0]?.properties
            ?.find((p: any) => p.name === "atlas")?.value;
        
        if (isAtlas) {
            this.load.atlas(name, imageUri, atlasJsonUri);
            this.load.json(`${name}_animations`, animationConfigUri);
        } else {
            this.load.image(name, imageUri);
        }
    });
}
```

### Game Scene (scenes/Game.ts)

Main gameplay scene with tilemap-driven object creation:

```typescript
export class Game extends Scene {
    private createObjectsFromTilemap() {
        this.map.getObjectLayerNames().forEach((layerName) => {
            let objectLayer = this.map.getObjectLayer(layerName);
            objectLayer?.objects.forEach((obj) => {
                this.createObject(obj);
            });
        });
    }
    
    private createObject(obj: TiledObject) {
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
        }
    }
}
```

## Entity System

### Base Sprite Pattern

All game entities extend `Phaser.Physics.Arcade.Sprite`:

```typescript
export class EntityClass extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Scene, tiledObject: TiledObject) {
        const x = tiledObject.x || 0;
        const y = tiledObject.y || 0;
        const texture = tiledObject.name || 'default';
        
        super(scene, x, y - 32, texture); // Y offset for Tiled
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.extractProperties(tiledObject);
    }
    
    private extractProperties(tiledObject: TiledObject): void {
        // Extract custom properties from tilemap
    }
}
```

### Player Implementation (sprites/Player.ts)

#### Movement System (Player.ts:84-145)

```typescript
update(): void {
    const velocity = this.body?.velocity;
    const onGround = this.body?.blocked.down || false;
    
    // Horizontal movement
    if (this.cursors.left.isDown) {
        this.setVelocityX(-this.moveSpeed);
        this.setFlipX(true);
        this.playAnimation('walk');
    }
    
    // Jump mechanics
    if (justPressedUp && this.jumpCount < this.maxJumps) {
        this.setVelocityY(-this.jumpSpeed);
        this.jumpCount++;
    }
}
```

#### Advanced Movement Features

- **Double Jump** (Player.ts:213-231)
- **Wall Jump** (Player.ts:198-210)
- **Charge Jump** (Player.ts:153-191)

### Enemy System (sprites/Enemy.ts)

#### Dynamic Movement Methods (Enemy.ts:209-241)

```typescript
update(time: number, delta: number): void {
    switch (this.moveMethod) {
        case 'patrol':
            this.updatePatrol();
            break;
        case 'jump':
            this.updateJump(time);
            break;
        case 'follow':
            this.updateFollow();
            break;
    }
}
```

#### Property Extraction System (Enemy.ts:80-110)

```typescript
private extractProperties(enemyObject: TiledObject): void {
    // Get properties from tileset
    const gid = enemyObject.gid;
    const tilemap = this.scene.cache.tilemap.get('tilemap');
    
    // Find tileset containing this GID
    for (const tileset of tilesetData) {
        if (gid >= tileset.firstgid && 
            gid < tileset.firstgid + tileset.tilecount) {
            // Extract tile properties
            const tileProperties = tileset.tiles[tileId].properties;
            for (const prop of tileProperties) {
                this.setProperty(prop.name, prop.value);
            }
        }
    }
}
```

### Collectible System (sprites/Collectible.ts)

#### Collection Mechanics (Collectible.ts:145-194)

```typescript
collect(): void {
    if (this.collected) return;
    this.collected = true;
    
    // Emit collection event
    eventBus.emit(GameEvent.ITEM_COLLECT, {
        item: this,
        type: this.collectibleType,
        value: this.score
    });
    
    // Animation and particles
    this.scene.tweens.add({
        targets: this,
        y: this.y - 50,
        alpha: 0,
        scale: 1.5,
        duration: 500,
        onComplete: () => this.destroy()
    });
}
```

## Manager Systems

### AnimationManager (managers/AnimationManager.ts)

Centralized animation management with atlas support:

#### Animation Creation (AnimationManager.ts:156-227)

```typescript
private createAnimation(atlasKey: string, config: AnimationConfig): void {
    const animKey = `${atlasKey}_${config.key}`;
    
    // Generate frames
    frames = this.scene.anims.generateFrameNames(atlasKey, {
        prefix: config.prefix,
        start: config.start,
        end: config.end,
        zeroPad: config.zeroPad
    });
    
    // Create animation
    this.scene.anims.create({
        key: animKey,
        frames: frames,
        frameRate: config.frameRate || 10,
        repeat: config.repeat || -1
    });
}
```

### BGMPlayer (managers/BGMPlayer.ts)

Background music management with scene tracking:

#### Scene-Based Music (BGMPlayer.ts:199-224)

```typescript
private onSceneChange(sceneName: string): void {
    const sceneConfig = this.bgmConfig.scenes[sceneName];
    
    if (!sceneConfig) {
        this.stopCurrentBGM();
        return;
    }
    
    // Don't restart same BGM
    if (this.currentBGM === sceneConfig.bgm && 
        this.currentBGMSound?.isPlaying) {
        return;
    }
    
    this.stopCurrentBGM();
    this.playBGM(sceneConfig.bgm, sceneConfig.loop, sceneConfig.volume);
}
```

### SoundEffectPlayer (managers/SoundEffectPlayer.ts)

Animation-linked sound effects:

#### Sound Mapping System (SoundEffectPlayer.ts:134-150)

```typescript
private buildAnimationSoundMap(): void {
    for (const [atlasKey, animations] of Object.entries(this.config)) {
        for (const [animationName, sounds] of Object.entries(animations)) {
            const animKey = `${atlasKey}_${animationName}`;
            this.animationToSounds.set(animKey, sounds);
        }
    }
}
```

### CollectedItemsManager (managers/CollectedItemsManager.ts)

Item collection tracking and validation:

```typescript
export class CollectedItemsManager {
    private items: Map<string, CollectedItemData> = new Map();
    private mustCollectItems: Set<string> = new Set();
    
    collectItem(name: string, type: string, score: number): void {
        if (!this.items.has(name)) {
            this.items.set(name, {
                name, type, count: 0, score: 0
            });
        }
        
        const itemData = this.items.get(name)!;
        itemData.count++;
        itemData.score += score;
        this.totalScore += score;
    }
    
    hasCollectedAllRequired(): boolean {
        for (const required of this.mustCollectItems) {
            if (!this.collectedMustHaveItems.has(required)) {
                return false;
            }
        }
        return true;
    }
}
```

## UI System

### HealthUI (ui/HealthUI.ts)

Dynamic health display with animations:

```typescript
export class HealthUI {
    private hearts: Phaser.GameObjects.Graphics[] = [];
    
    updateHealth(health: number): void {
        for (let i = 0; i < this.maxHealth; i++) {
            if (i < health) {
                this.drawHeart(heart, x, y, true);  // Filled
            } else {
                this.drawHeart(heart, x, y, false); // Empty
                if (oldHealth > health && i === health) {
                    this.createHeartBreakEffect(x, y);
                }
            }
        }
    }
}
```

## Asset Pipeline

### Asset Loading Strategy

1. **Boot Scene**: Minimal assets for preloader
2. **Preloader**: All game assets with progress bar
3. **Dynamic Loading**: Parse tilemap for required assets
4. **Atlas Support**: Automatic detection and loading

### Tilemap Asset Discovery (Preloader.ts:65-118)

```typescript
private loadAllAssets() {
    const tilemapJson = JSON.parse(this.cache.text.get('tilemap_json_raw'));
    
    tilemapJson.tilesets.forEach((tileset: any) => {
        // Check for atlas property
        const isAtlas = tileset.tiles?.[0]?.properties
            ?.find((p: any) => p.name === "atlas")?.value;
        
        if (isAtlas) {
            // Load as atlas with animations
            this.load.atlas(tileset.name, tileset.image, jsonPath);
            this.load.json(`${tileset.name}_animations`, animPath);
        } else {
            // Load as single image
            this.load.image(tileset.name, tileset.image);
        }
    });
}
```

## Development Workflow

### Setting Up Development Environment

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Development without logging
npm run dev-nolog
```

### Adding New Features

#### 1. Create New Sprite Type

```typescript
// sprites/NewEntity.ts
export class NewEntity extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Scene, obj: TiledObject) {
        super(scene, obj.x, obj.y, obj.name);
        // Initialize
    }
}
```

#### 2. Register in Game Scene

```typescript
// scenes/Game.ts
private createObject(obj: TiledObject) {
    switch (obj.type) {
        case "new_entity":
            this.createNewEntityFromTilemap(obj);
            break;
    }
}
```

#### 3. Add Event Support

```typescript
// events/EventBus.ts
export enum GameEvent {
    NEW_ENTITY_ACTION = 'new_entity:action'
}

// Emit event
eventBus.emit(GameEvent.NEW_ENTITY_ACTION, { data });
```

### Testing Workflow

1. **Unit Testing**: Test individual components
2. **Integration Testing**: Test scene transitions
3. **Physics Testing**: Enable debug mode
4. **Performance Testing**: Monitor FPS and memory

## Extension Guide

### Adding New Scenes

```typescript
// scenes/NewScene.ts
export class NewScene extends Scene {
    constructor() {
        super('NewScene');
    }
    
    create() {
        // Scene setup
        eventBus.emit(GameEvent.SCENE_START, {
            scene: 'NewScene'
        });
    }
}

// Register in main.ts
const config = {
    scene: [Boot, Preloader, MainMenu, NewScene]
};
```

### Creating Custom Managers

```typescript
export class CustomManager {
    private static instance: CustomManager;
    
    init(scene: Scene): void {
        // Initialize with scene context
    }
    
    // Manager functionality
}
```

### Extending Entity Properties

```typescript
private extractProperties(obj: TiledObject): void {
    if (obj.properties) {
        for (const prop of obj.properties) {
            switch (prop.name) {
                case 'custom_property':
                    this.customValue = prop.value;
                    break;
            }
        }
    }
}
```

## Performance Optimization

### Build Optimization (vite/config.prod.optimized.mjs)

```javascript
{
    build: {
        sourcemap: false,           // Disable for production
        target: 'es2020',          // Modern browsers
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser']  // Separate Phaser chunk
                }
            },
            treeshake: {
                preset: 'smallest'      // Aggressive tree shaking
            }
        },
        terserOptions: {
            compress: {
                drop_console: true,     // Remove console logs
                drop_debugger: true     // Remove debugger
            }
        }
    }
}
```

### Runtime Optimizations

1. **Object Pooling**: Reuse sprites instead of creating new ones
2. **Texture Atlases**: Combine sprites to reduce draw calls
3. **Physics Optimization**: Use static bodies where possible
4. **Event Cleanup**: Remove listeners when not needed

```typescript
// Object pooling example
class BulletPool {
    private pool: Bullet[] = [];
    
    get(): Bullet {
        return this.pool.pop() || new Bullet();
    }
    
    release(bullet: Bullet): void {
        bullet.reset();
        this.pool.push(bullet);
    }
}
```

## Debugging Guide

### EventBus Debugger (utils/EventBusDebugger.ts)

```typescript
export class EventBusDebugger {
    enable(): void {
        eventBus.setDebugMode(true);
        // Logs all events
    }
    
    logEventStats(): void {
        console.log('Total listeners:', eventBus.getListenerCount());
    }
}
```

### Physics Debug Mode

```typescript
// Enable in config
physics: {
    arcade: {
        debug: true  // Shows collision boxes
    }
}
```

### Performance Monitoring

```typescript
// Add to Game scene update
update(time: number, delta: number) {
    // Monitor FPS
    const fps = Math.round(1000 / delta);
    if (fps < 30) {
        console.warn('Low FPS:', fps);
    }
    
    // Monitor object count
    const objectCount = this.children.length;
    if (objectCount > 1000) {
        console.warn('High object count:', objectCount);
    }
}
```

### Console Commands for Debugging

```javascript
// Access game instance
const game = window.game;

// Get current scene
const scene = game.scene.getScenes(true)[0];

// Pause physics
scene.physics.world.pause();

// Enable debug draw
scene.physics.world.drawDebug = true;

// List all animations
scene.anims.anims.entries;

// Trigger events manually
eventBus.emit(GameEvent.PLAYER_JUMP, { player: null, velocity: -500 });
```

## Best Practices

### Code Organization

1. **Single Responsibility**: Each class handles one concern
2. **Event-Driven**: Use EventBus for loose coupling
3. **Type Safety**: Leverage TypeScript for compile-time checks
4. **Configuration-Driven**: Keep logic separate from data

### Memory Management

1. **Destroy unused objects**: Call `destroy()` on sprites
2. **Remove event listeners**: Use `off()` or `removeAllListeners()`
3. **Clear references**: Set to null when done
4. **Texture cleanup**: Unload unused textures

### Error Handling

```typescript
try {
    // Risky operation
    this.loadAsset(key);
} catch (error) {
    console.error(`Failed to load asset ${key}:`, error);
    // Fallback behavior
    this.useDefaultAsset();
}
```

## Common Patterns

### State Machine Pattern

```typescript
enum State {
    IDLE, WALKING, JUMPING, ATTACKING
}

class StateMachine {
    private state: State = State.IDLE;
    
    transition(newState: State): void {
        if (this.canTransition(this.state, newState)) {
            this.exitState(this.state);
            this.state = newState;
            this.enterState(newState);
        }
    }
}
```

### Component Pattern

```typescript
interface Component {
    update(delta: number): void;
}

class Entity {
    private components: Component[] = [];
    
    addComponent(component: Component): void {
        this.components.push(component);
    }
    
    update(delta: number): void {
        this.components.forEach(c => c.update(delta));
    }
}
```

### Factory Pattern

```typescript
class EntityFactory {
    static create(type: string, scene: Scene, data: any): Sprite {
        switch (type) {
            case 'player':
                return new Player(scene, data);
            case 'enemy':
                return new Enemy(scene, data);
            default:
                throw new Error(`Unknown entity type: ${type}`);
        }
    }
}
```

## Troubleshooting

### Common Issues and Solutions

1. **Assets not loading**
   - Check file paths in tilemap
   - Verify assets exist in public folder
   - Check browser console for 404 errors

2. **Animations not playing**
   - Verify animation config JSON
   - Check atlas frame names match
   - Ensure animation is created before playing

3. **Physics not working**
   - Enable debug mode to visualize
   - Check collision layers in tilemap
   - Verify physics bodies are enabled

4. **Memory leaks**
   - Remove event listeners
   - Destroy unused sprites
   - Clear tweens and timers

5. **Build failures**
   - Check TypeScript errors
   - Verify JSON syntax
   - Clear node_modules and reinstall

## Resources

### Phaser Documentation
- [Phaser 3 API](https://photonstorm.github.io/phaser3-docs/)
- [Phaser Examples](https://phaser.io/examples)

### Tools
- [Tiled Map Editor](https://www.mapeditor.org/)
- [TexturePacker](https://www.codeandweb.com/texturepacker)
- [Phaser Editor](https://phasereditor2d.com/)

### Community
- [Phaser Discord](https://discord.gg/phaser)
- [HTML5 Game Devs Forum](https://www.html5gamedevs.com/)

## Contributing

### Code Style

- Use TypeScript strict mode
- Follow existing patterns
- Add JSDoc comments for public APIs
- Write self-documenting code

### Pull Request Process

1. Create feature branch
2. Implement with tests
3. Update documentation
4. Submit PR with description
5. Address review feedback

### Version Control

```bash
# Feature branch
git checkout -b feature/new-feature

# Commit with meaningful message
git commit -m "feat: add new enemy type with patrol behavior"

# Push and create PR
git push origin feature/new-feature
```