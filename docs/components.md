# Component Reference

## Table of Contents

1. [Sprites](#sprites)
2. [Managers](#managers)
3. [Scenes](#scenes)
4. [Events](#events)
5. [UI Components](#ui-components)
6. [Utilities](#utilities)

---

## Sprites

### Player

**Location**: `src/game/sprites/Player.ts`

The main character controlled by the player.

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| moveSpeed | number | 200 | Horizontal movement speed |
| jumpSpeed | number | 500 | Jump velocity |
| health | number | 3 | Current health |
| maxHealth | number | 3 | Maximum health |
| abilities | PlayerAbilities | {...} | Configurable abilities |

#### Configurable Abilities

```typescript
interface PlayerAbilities {
    canJump: boolean;        // Basic jump
    canDoubleJump: boolean;  // Second jump in air
    canWallJump: boolean;    // Jump off walls
    canWallSlide: boolean;   // Slide down walls
    canChargeJump: boolean;  // Hold to charge jump
    canShoot: boolean;       // Shoot projectiles
    canMove: boolean;        // Horizontal movement
}
```

#### Methods

```typescript
// Take damage with invulnerability frames
takeDamage(damage: number): void

// Get current health
getHealth(): number

// Get bullets group for collision
getBullets(): Phaser.Physics.Arcade.Group
```

#### Tilemap Properties

```json
{
  "type": "player",
  "properties": [
    {"name": "uuid", "value": "player-001"},
    {"name": "max_health", "value": 3},
    {"name": "can_jump", "value": true},
    {"name": "can_double_jump", "value": true},
    {"name": "can_wall_jump", "value": true},
    {"name": "can_shoot", "value": true},
    {"name": "move_speed", "value": 200},
    {"name": "jump_speed", "value": 500}
  ]
}
```

---

### Enemy

**Location**: `src/game/sprites/Enemy.ts`

Hostile entities with configurable AI behaviors.

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| damage | number | 1 | Damage dealt to player |
| moveMethod | string | 'static' | AI behavior pattern |
| moveSpeed | number | 100 | Movement speed |
| jumpPower | number | 400 | Jump strength |
| patrolDistance | number | 200 | Patrol range in pixels |
| detectionRange | number | 300 | Player detection radius |
| jumpInterval | number | 2000 | Time between jumps (ms) |
| deathParticleColor | number | 0xff0000 | Death effect color |

#### Movement Methods

| Method | Description |
|--------|-------------|
| static | No movement |
| patrol | Walk back and forth |
| jump | Jump in place |
| move_and_jump | Frog-like hopping |
| patrol_jump | Patrol with periodic jumps |
| follow | Track and follow player |
| follow_jump | Follow with jumping |

#### Methods

```typescript
// Get damage value
getDamage(): number

// Take damage and potentially die
takeDamage(damage: number): void

// Get current movement method
getMoveMethod(): string
```

#### Tilemap Configuration

```json
{
  "type": "enemy",
  "properties": [
    {"name": "uuid", "value": "enemy-001"},
    {"name": "damage", "value": 1},
    {"name": "move_method", "value": "patrol"},
    {"name": "move_speed", "value": 100},
    {"name": "patrol_distance", "value": 200},
    {"name": "death_particle_color", "value": "#ff0000"}
  ]
}
```

---

### Collectible

**Location**: `src/game/sprites/Collectible.ts`

Items that can be collected by the player.

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| score | number | 0 | Points awarded |
| mustCollect | boolean | false | Required for level completion |
| type | string | 'misc' | Item category |
| shouldRotate | boolean | false | Continuous rotation |
| particleColor | number | 0xFFFFFF | Collection effect color |

#### Methods

```typescript
// Collect the item
collect(): void

// Check if already collected
isCollected(): boolean

// Get score value
getScore(): number

// Check if required item
isMustCollect(): boolean

// Get item name
getName(): string

// Get item type/category
getType(): string
```

#### Tilemap Configuration

```json
{
  "type": "collectible",
  "properties": [
    {"name": "score", "value": 100},
    {"name": "must_collect", "value": true},
    {"name": "type", "value": "key"},
    {"name": "rotate", "value": true},
    {"name": "particle_color", "value": "#FFD700"}
  ]
}
```

---

### Trigger

**Location**: `src/game/sprites/Trigger.ts`

Invisible zones that activate events when touched.

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| eventType | string | - | Type of event (move/scale) |
| targetUUID | string | - | UUID of target object |
| velocityX | number | 0 | X velocity for move event |
| velocityY | number | 0 | Y velocity for move event |
| duration | number | 1000 | Event duration (ms) |
| targetScaleX | number | 1 | Target X scale |
| targetScaleY | number | 1 | Target Y scale |
| repeat | boolean | false | Can be triggered multiple times |
| delay | number | 0 | Delay before activation (ms) |
| returnToOrigin | boolean | true | Return to original state |

#### Visual Properties

| Property | Type | Description |
|----------|------|-------------|
| texture | string | Visual representation texture |
| activeTexture | string | Texture when activated |
| inactiveTexture | string | Texture when inactive |
| useSprite | boolean | Use animated sprite |
| visualScale | number | Scale of visual representation |

#### Methods

```typescript
// Activate the trigger
activate(player: Player): void

// Reset trigger state
reset(): void

// Check if triggered
isTriggered(): boolean
```

#### Tilemap Configuration

```json
{
  "type": "trigger",
  "properties": [
    {"name": "event_type", "value": "move"},
    {"name": "target_uuid", "value": "platform-001"},
    {"name": "velocity_y", "value": -500},
    {"name": "duration", "value": 2000},
    {"name": "return_to_origin", "value": true},
    {"name": "repeat", "value": true},
    {"name": "texture", "value": "button"}
  ]
}
```

---

### Obstacle

**Location**: `src/game/sprites/Obstacle.ts`

Physical barriers that can be static, movable, or destructible.

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| isDestructible | boolean | false | Can be destroyed |
| isMovable | boolean | false | Can be pushed |
| health | number | 3 | Hit points (if destructible) |

#### Physics Properties (Movable)

| Property | Value | Description |
|----------|-------|-------------|
| gravity | 800 | Downward acceleration |
| drag | 800 | Horizontal deceleration |
| mass | 3 | Weight for physics |
| maxVelocityX | 200 | Speed limit |

#### Methods

```typescript
// Get obstacle type/texture name
getObstacleType(): string

// Check if destructible
getIsDestructible(): boolean

// Check if movable
getIsMovable(): boolean

// Take damage (if destructible)
takeDamage(damage: number): void
```

#### Tilemap Configuration

```json
{
  "type": "obstacle",
  "properties": [
    {"name": "uuid", "value": "box-001"},
    {"name": "destructible", "value": true},
    {"name": "health", "value": 3},
    {"name": "movable", "value": true}
  ]
}
```

---

### Bullet

**Location**: `src/game/sprites/Bullet.ts`

Projectiles fired by the player.

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| speed | number | 600 | Horizontal velocity |
| lifetime | number | 1000 | Duration before destruction (ms) |
| inheritVelocity | boolean | true | Inherit player velocity |

#### Methods

```typescript
// Called when hitting enemy
hitEnemy(): void

// Check if needs immediate collision
getNeedsImmediateCheck(): boolean

// Set immediate collision check flag
setImmediateCollisionCheck(value: boolean): void
```

---

### Goal

**Location**: `src/game/sprites/Goal.ts`

Level completion objectives.

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| isCollected | boolean | false | Completion state |

#### Methods

```typescript
// Collect the goal
collect(): void

// Check if already collected
isCollected(): boolean
```

---

### StaticHazard

**Location**: `src/game/sprites/StaticHazard.ts`

Environmental dangers that damage the player.

#### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| damage | number | 1 | Damage dealt on contact |

#### Methods

```typescript
// Get damage value
getDamage(): number
```

---

## Managers

### GameObjectManager

**Location**: `src/game/managers/GameObjectManager.ts`

Centralized registry for all game objects using UUIDs.

#### Methods

```typescript
// Get singleton instance
static getInstance(): GameObjectManager

// Register an object
registerObject(uuid: string, object: GameObject, type: string, name?: string): void

// Get object by UUID
getObjectByUUID(uuid: string): RegisteredObject | undefined

// Get all objects of type
getObjectsByType(type: string): RegisteredObject[]

// Remove object
removeObject(uuid: string): void

// Clear all objects
clear(): void
```

---

### AnimationManager

**Location**: `src/game/managers/AnimationManager.ts`

Manages sprite animations and atlas loading.

#### Methods

```typescript
// Get singleton instance
static getInstance(): AnimationManager

// Create animations for atlas
createAnimationsForAtlas(atlasKey: string): void

// Play animation on sprite
playAnimation(sprite: Sprite, atlasKey: string, animationName: string): void

// Check if animation exists
hasAnimation(atlasKey: string, animationName: string): boolean

// Get animation with fallback
getAnimationWithFallback(atlasKey: string, animationName: string): string | null
```

---

### BGMPlayer

**Location**: `src/game/managers/BGMPlayer.ts`

Background music management with scene-based playback.

#### Methods

```typescript
// Get singleton instance
static getInstance(): BGMPlayer

// Initialize with game instance
initialize(game: Phaser.Game): void

// Play BGM for scene
playBGM(sceneKey: string): void

// Stop current BGM
stopBGM(): void

// Set volume (0-1)
setVolume(volume: number): void

// Pause/resume
pause(): void
resume(): void
```

---

### SoundEffectPlayer

**Location**: `src/game/managers/SoundEffectPlayer.ts`

Sound effect playback with animation synchronization.

#### Methods

```typescript
// Get singleton instance
static getInstance(): SoundEffectPlayer

// Play sound effect
playSoundEffect(key: string, volume?: number): void

// Play with fallback chain
playSoundEffectWithFallback(keys: string[], volume?: number): void

// Stop all effects
stopAll(): void
```

---

### CollectedItemsManager

**Location**: `src/game/managers/CollectedItemsManager.ts`

Tracks collected items and score.

#### Methods

```typescript
// Collect an item
collectItem(name: string, type: string, score: number, mustCollect: boolean, properties: any): void

// Check if all required items collected
hasCollectedAllRequired(): boolean

// Get missing required items
getMissingRequiredItems(): string[]

// Get total score
getTotalScore(): number

// Get summary data
getSummaryData(): CollectionSummary

// Reset for new game
reset(): void
```

---

## Scenes

### Boot

**Location**: `src/game/scenes/Boot.ts`

Initial setup and configuration.

#### Responsibilities
- Set game settings
- Initialize systems
- Load essential assets
- Transition to Preloader

---

### Preloader

**Location**: `src/game/scenes/Preloader.ts`

Asset loading with progress display.

#### Assets Loaded
- Sprites and atlases
- Tilemaps
- Audio files
- UI elements

#### Progress Display
- Loading bar
- Percentage text
- Asset counter

---

### MainMenu

**Location**: `src/game/scenes/MainMenu.ts`

Game menu interface.

#### Features
- Title display
- Start button
- BGM playback
- Scene transition

---

### Game

**Location**: `src/game/scenes/Game.ts`

Core gameplay scene.

#### Systems
- Tilemap loading
- Object creation
- Physics setup
- Collision handling
- UI management

#### Update Loop
1. Player input
2. Physics simulation
3. Animation updates
4. Collision detection
5. UI refresh

---

### Victory

**Location**: `src/game/scenes/Victory.ts`

Success screen with statistics.

#### Display
- Victory message
- Score display
- Items collected
- Play again option

---

### GameOver

**Location**: `src/game/scenes/GameOver.ts`

Failure screen with retry option.

#### Features
- Game over message
- Final score
- Retry button
- Main menu option

---

## Events

### EventBus

**Location**: `src/game/events/EventBus.ts`

Global event system for component communication.

#### Event Types

```typescript
enum GameEvent {
    // Player events
    PLAYER_MOVE = 'player-move',
    PLAYER_JUMP = 'player-jump',
    PLAYER_DOUBLE_JUMP = 'player-double-jump',
    PLAYER_WALL_JUMP = 'player-wall-jump',
    PLAYER_CHARGE_JUMP = 'player-charge-jump',
    PLAYER_SHOOT = 'player-shoot',
    PLAYER_DAMAGE = 'player-damage',
    PLAYER_DEATH = 'player-death',
    PLAYER_IDLE = 'player-idle',
    
    // Game state
    GAME_START = 'game-start',
    GAME_OVER = 'game-over',
    GAME_VICTORY = 'game-victory',
    GAME_PAUSE = 'game-pause',
    GAME_RESUME = 'game-resume',
    
    // Scene events
    SCENE_START = 'scene-start',
    SCENE_TRANSITION = 'scene-transition',
    
    // Audio events
    BGM_PLAY = 'bgm-play',
    BGM_STOP = 'bgm-stop',
    SOUND_EFFECT_PLAY = 'sound-effect-play',
    
    // Animation events
    ANIMATION_PLAY = 'animation-play',
    ANIMATION_COMPLETE = 'animation-complete',
    
    // Item events
    ITEM_COLLECT = 'item-collect',
    CHECKPOINT_REACHED = 'checkpoint-reached',
    
    // Object events
    ENEMY_DEFEATED = 'enemy-defeated',
    OBSTACLE_DESTROYED = 'obstacle-destroyed',
    TRIGGER_ACTIVATED = 'trigger-activated'
}
```

#### Usage

```typescript
// Emit event
eventBus.emit(GameEvent.PLAYER_JUMP, { velocity: -500 });

// Listen for event
eventBus.on(GameEvent.PLAYER_JUMP, (data) => {
    console.log('Jump velocity:', data.velocity);
});

// Remove listener
eventBus.off(GameEvent.PLAYER_JUMP, handler);

// One-time listener
eventBus.once(GameEvent.GAME_START, () => {
    console.log('Game started!');
});
```

---

## UI Components

### HealthUI

**Location**: `src/game/ui/HealthUI.ts`

Visual health display using hearts.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| x | number | X position |
| y | number | Y position |
| heartSize | number | Size of heart icons |
| heartSpacing | number | Space between hearts |

#### Methods

```typescript
// Update health display
updateHealth(currentHealth: number): void

// Set max health
setMaxHealth(maxHealth: number): void

// Show/hide
setVisible(visible: boolean): void
```

---

## Utilities

### UUIDGenerator

**Location**: `src/game/utils/UUIDGenerator.ts`

Generates unique identifiers for game objects.

#### Methods

```typescript
// Generate new UUID
static generate(): string

// Validate UUID format
static isValid(uuid: string): boolean
```

#### UUID Format
```
xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
```

---

### EventBusDebugger

**Location**: `src/game/utils/EventBusDebugger.ts`

Development tool for monitoring events.

#### Methods

```typescript
// Enable debugging
enable(): void

// Disable debugging
disable(): void

// Set filter
setFilter(pattern: RegExp): void

// Get event statistics
getStats(): EventStats
```

#### Output Format
```
[EventBus] PLAYER_JUMP {velocity: -500}
[EventBus] SOUND_EFFECT_PLAY {key: "jump"}
```

---

## Best Practices

### Component Creation

1. **Extend Phaser Classes**: Build on existing Phaser functionality
2. **Use TypeScript**: Leverage type safety and IntelliSense
3. **Emit Events**: Communicate through EventBus
4. **Configure via Tilemap**: Make properties data-driven
5. **Pool Objects**: Reuse frequently created objects

### Property Configuration

1. **Validate Input**: Check ranges and types
2. **Provide Defaults**: Ensure components work without configuration
3. **Document Properties**: Clear descriptions in tilemap
4. **Use Meaningful Names**: Self-documenting property names

### Performance Tips

1. **Limit Update Calls**: Check active state first
2. **Cache References**: Store frequently accessed objects
3. **Use Object Pools**: For bullets, particles, effects
4. **Batch Operations**: Group similar operations
5. **Profile Regularly**: Monitor performance metrics

---

## Extension Guide

### Adding New Components

1. Create class file in appropriate directory
2. Extend relevant Phaser class
3. Add tilemap properties interface
4. Implement factory method in Game scene
5. Register with GameObjectManager if needed
6. Document in this file

### Component Template

```typescript
export class NewComponent extends Phaser.Physics.Arcade.Sprite {
    private property: type = defaultValue;
    
    constructor(scene: Scene, tiledObject: Phaser.Types.Tilemaps.TiledObject) {
        // Initialize sprite
        super(scene, x, y, texture);
        
        // Parse properties
        this.parseProperties(tiledObject);
        
        // Setup physics
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Configure
        this.setup();
    }
    
    private parseProperties(tiledObject: Phaser.Types.Tilemaps.TiledObject): void {
        // Extract and validate properties
    }
    
    update(): void {
        // Update logic
    }
}
```