# Code Structure and Design Philosophy

This document outlines the architecture and design principles of the game's codebase.

## Table of Contents
- [Core Design Principles](#core-design-principles)
- [Collectible System Architecture](#collectible-system-architecture)
- [Enemy System Architecture](#enemy-system-architecture)
- [Animation Management System](#animation-management-system)
- [Manager Pattern](#manager-pattern)
- [Scene Management](#scene-management)
- [Configuration-Driven Design](#configuration-driven-design)

## Core Design Principles

### 1. Configuration Over Code
The game prioritizes configuration-based customization over code modifications. Game designers can modify behavior through tilemap properties without touching TypeScript code.

### 2. Separation of Concerns
- **Sprites**: Handle rendering and animations
- **Managers**: Handle game logic and state
- **Scenes**: Orchestrate gameplay and transitions
- **UI Components**: Handle display-only elements

### 3. Type Safety
TypeScript is used throughout to provide compile-time safety and better IDE support.

## Collectible System Architecture

The collectible system demonstrates the configuration-driven approach perfectly.

### Design Goals
1. **Zero-code extensibility**: New collectible types can be added without modifying code
2. **Visual customization**: All effects are configurable through properties
3. **Type categorization**: Automatic grouping for display purposes
4. **Flexible scoring**: Each item can have different point values

### Key Components

#### 1. Collectible Sprite (`src/game/sprites/Collectible.ts`)
```typescript
class Collectible extends Phaser.Physics.Arcade.Sprite {
    private collectibleName: string;     // Texture/sprite name
    private collectibleType: string;     // Category for grouping
    private score: number;               // Points awarded
    private mustCollect: boolean;        // Required for completion
    private shouldRotate: boolean;       // Visual effect flag
    private particleColor: number;       // Particle effect color
}
```

**Design Decisions:**
- Properties are extracted from tilemap data, not hardcoded
- Visual effects (rotation, particles) are configurable, not based on item name
- The sprite is presentation-focused; logic is handled elsewhere

#### 2. CollectedItemsManager (`src/game/managers/CollectedItemsManager.ts`)
```typescript
class CollectedItemsManager {
    private items: Map<string, CollectedItemData>;
    private totalScore: number;
    private mustCollectItems: Set<string>;
    private collectedMustHaveItems: Set<string>;
}
```

**Design Decisions:**
- Centralized state management for all collected items
- Tracks both individual items and aggregated data
- Provides grouped data for the victory screen
- Validates completion requirements

#### 3. Property Extraction Flow
```
Tilemap (JSON) → TiledObject → Collectible.extractProperties() → Game State
```

The system reads properties in this priority:
1. Tileset tile properties (shared defaults)
2. Object instance properties (overrides)

This allows for both shared defaults and per-instance customization.

### Configuration Properties

Properties are read from the tilemap and control behavior:

```typescript
// Gameplay properties
score: number          // Points awarded
must_collect: boolean  // Required for level completion
type: string          // Category for grouping

// Visual properties
rotate: boolean       // Continuous rotation animation
particle_color: string // Hex color for particle effects
```

### Adding New Properties

To add a new configurable property:

1. **Update Collectible class:**
```typescript
private newProperty: type = defaultValue;

// In extractProperties():
else if (prop.name === 'new_property') {
    this.newProperty = prop.value;
}
```

2. **Use the property:**
```typescript
if (this.newProperty) {
    // Apply the effect
}
```

3. **Document in TILEMAP_GUIDE.md**

## Enemy System Architecture

The enemy system provides configurable enemy behaviors through tilemap properties.

### Design Goals
1. **Flexible movement patterns**: Multiple movement behaviors without code changes
2. **Configurable properties**: Speed, damage, detection range all adjustable
3. **Animation support**: Integrated with AnimationManager
4. **Extensible**: Easy to add new movement patterns

### Key Components

#### Enemy Sprite (`src/game/sprites/Enemy.ts`)
```typescript
class Enemy extends Phaser.Physics.Arcade.Sprite {
    private damage: number;          // Damage dealt to player
    private moveMethod: string;      // Movement pattern
    private moveSpeed: number;       // Movement speed
    private jumpPower: number;       // Jump strength
    private patrolDistance: number;  // Patrol range
    private detectionRange: number;  // Player detection range
    private jumpInterval: number;    // Time between jumps
}
```

### Movement Patterns

1. **static**: No movement
2. **patrol**: Move back and forth horizontally
3. **jump**: Jump randomly at intervals
4. **patrol_jump**: Patrol with periodic jumps
5. **follow**: Move towards player when in range
6. **follow_jump**: Follow player and jump when player is above

### Configuration Properties

```typescript
// Movement properties
move_method: string      // Movement pattern
move_speed: number       // Movement speed (default: 100)
jump_power: number       // Jump strength (default: 400)
patrol_distance: number  // Patrol range (default: 200)
detection_range: number  // Player detection (default: 300)
jump_interval: number    // Jump timing (default: 2000ms)

// Combat properties
damage: number          // Damage to player (default: 1)

// Animation properties
atlas: boolean          // Has animation atlas
```

## Animation Management System

The AnimationManager provides centralized animation handling for all game sprites.

### Design Goals
1. **Centralized management**: All animations created in one place
2. **Configuration-based**: Animations defined in JSON files
3. **Atlas support**: Efficient texture atlas animations
4. **Singleton pattern**: Single instance across the game
5. **Legacy format support**: Compatible with existing animation configs

### Key Components

#### AnimationManager (`src/game/managers/AnimationManager.ts`)
```typescript
class AnimationManager {
    private static instance: AnimationManager;
    private atlasAnimations: Map<string, AnimationConfig[]>;
    private createdAnimations: Set<string>;
    
    // Core methods
    init(scene: Phaser.Scene): void
    loadLegacyAnimationConfig(config: LegacyAnimationFormat): void
    createAnimationsForAtlas(atlasKey: string): void
    playAnimation(sprite, atlasKey, animationName): void
}
```

### Animation Configuration Format

#### Legacy Format (JSON files)
```json
{
    "name": "atlas_name",
    "type": "sprite_type",
    "animations": [
        {
            "name": "idle",
            "filename_prefix": "idle/frame",
            "frame_range": { "from": 0, "to": 3 },
            "padding_size": 4
        }
    ]
}
```

#### Standard Format
```typescript
interface AnimationConfig {
    key: string;           // Animation name
    prefix?: string;       // Frame prefix
    start?: number;        // Start frame
    end?: number;          // End frame
    frameRate?: number;    // FPS
    repeat?: number;       // -1 for infinite
    yoyo?: boolean;        // Reverse playback
}
```

### Integration Flow

1. **Preloader Phase**:
   - Load atlas textures and JSON configs
   - Initialize AnimationManager
   - Process all animation configurations
   - Create all animations

2. **Sprite Creation**:
   - Sprites get AnimationManager instance
   - Use `playAnimation()` helper method
   - Animations are referenced by key

3. **Runtime**:
   - Sprites call `playAnimation(animName)`
   - Manager handles animation key resolution
   - Animations play with configured settings

### Usage Example

```typescript
// In sprite class
class Player extends Phaser.Physics.Arcade.Sprite {
    private animationManager: AnimationManager;
    
    constructor(scene, tiledObject) {
        super(scene, x, y, key);
        this.animationManager = AnimationManager.getInstance();
    }
    
    private playAnimation(animName: string): void {
        const animKey = this.animationManager.getAnimationKey(this.key, animName);
        if (this.animationManager.hasAnimation(this.key, animName)) {
            this.play(animKey);
        }
    }
    
    update() {
        if (walking) {
            this.playAnimation('walk');
        }
    }
}
```

## Manager Pattern

The game uses manager classes to centralize state and logic:

### CollectedItemsManager
- **Purpose**: Track all collected items and scores
- **Responsibilities**:
  - Item collection tracking
  - Score calculation
  - Requirement validation
  - Data aggregation for UI

### AnimationManager
- **Purpose**: Centralize animation creation and management
- **Responsibilities**:
  - Load animation configurations
  - Create Phaser animations from configs
  - Track animation-to-atlas mappings
  - Provide helper methods for sprites

### Benefits
1. **Single source of truth**: All collection data in one place
2. **Reusability**: Can be used across different scenes
3. **Testability**: Logic separated from presentation
4. **Persistence ready**: Easy to save/load state

## Scene Management

### Game Scene
The main gameplay scene orchestrates:
- Object creation from tilemap
- Collision detection
- State updates via managers
- UI updates

**Key Design**: The Game scene doesn't determine item types or effects; it reads them from configuration.

### Victory Scene
Displays collected items grouped by type:
- Receives data from CollectedItemsManager
- Groups items by type automatically
- Shows count badges for multiple items
- No hardcoded item types

## Configuration-Driven Design

### Benefits
1. **Designer-friendly**: Non-programmers can add content
2. **Rapid iteration**: No recompilation for content changes
3. **Mod support**: External tilemaps can add new items
4. **Maintainability**: Less code to maintain

### Implementation Strategy

#### 1. Property-Based Behavior
Instead of:
```typescript
if (itemName.includes('coin')) {
    // Rotate the coin
}
```

Use:
```typescript
if (this.shouldRotate) {
    // Apply rotation
}
```

#### 2. Generic Type System
Instead of hardcoded types:
```typescript
if (name.includes('coin')) type = 'coin';
else if (name.includes('key')) type = 'key';
```

Read from configuration:
```typescript
const type = collectible.getType(); // From tilemap property
```

#### 3. Data-Driven Visuals
All visual effects are controlled by data:
- Animation types (rotation, floating, pulsing)
- Particle colors
- Scale and size
- Sound effects (future enhancement)

### Future Enhancements

The configuration system can be extended with:

1. **Animation Properties**:
   - `float_speed`: Control floating animation speed
   - `pulse_intensity`: Control pulsing strength
   - `rotation_speed`: Variable rotation speeds
   - `animation_config`: Custom animation sequences

2. **Sound Properties**:
   - `collect_sound`: Sound effect file name
   - `volume`: Sound volume
   - `ambient_sound`: Background sound for items

3. **Gameplay Properties**:
   - `respawn_time`: For respawning collectibles
   - `expiry_time`: For time-limited items
   - `chain_bonus`: Bonus for collecting in sequence
   - `health_restore`: Health restoration amount

4. **Visual Properties**:
   - `glow_color`: Ambient glow effect
   - `trail_effect`: Motion trail
   - `pickup_animation`: Custom collection animation
   - `shader_effect`: Custom shader effects

5. **Enemy Enhancements**:
   - `attack_pattern`: Complex attack sequences
   - `projectile_type`: Ranged attack support
   - `ai_behavior`: Advanced AI patterns
   - `team_id`: Faction/team support

6. **Animation System**:
   - `blend_trees`: Animation blending
   - `state_machines`: Animation state logic
   - `events`: Animation event triggers
   - `layers`: Multi-layer animations

All these can be added without breaking existing content!

## Best Practices

### 1. Property Naming
- Use snake_case for tilemap properties
- Use camelCase for TypeScript variables
- Be descriptive: `particle_color` not just `color`

### 2. Default Values
Always provide sensible defaults:
```typescript
private particleColor: number = 0xFFFFFF; // White default
```

### 3. Type Safety
Use TypeScript types for property values:
```typescript
interface CollectedItemData {
    name: string;
    type: string;
    count: number;
    score: number;
}
```

### 4. Documentation
- Document all configurable properties
- Provide examples in TILEMAP_GUIDE.md
- Use JSDoc comments in code

### 5. Validation
Validate property values when reading:
```typescript
if (prop.name === 'particle_color') {
    // Ensure it's a valid hex color
    this.particleColor = parseInt(prop.value.replace('#', '0x'));
}
```

## System Architecture Summary

### Current Systems

1. **Collectible System**: Fully configurable items with visual effects
2. **Enemy System**: Multiple movement patterns and behaviors
3. **Animation System**: Centralized animation management
4. **Manager Pattern**: State and logic centralization
5. **Scene Management**: Clean scene transitions and data flow

### Architecture Strengths

1. **Configuration-Driven**: Most game content can be added without code changes
2. **Type-Safe**: TypeScript ensures compile-time safety
3. **Modular**: Clear separation between systems
4. **Extensible**: Easy to add new features
5. **Maintainable**: Consistent patterns throughout

### Key Design Patterns

- **Singleton**: AnimationManager for global access
- **Manager Pattern**: Centralized state management
- **Strategy Pattern**: Enemy movement behaviors
- **Observer Pattern**: Scene communication
- **Factory Pattern**: Sprite creation from tilemap

## Conclusion

The codebase follows a configuration-driven architecture that:
- Minimizes code changes for content additions
- Separates concerns effectively
- Provides clear extension points
- Maintains type safety
- Scales well with content growth

This approach enables rapid content creation while keeping the codebase maintainable and extensible. The combination of TypeScript, Phaser 3, and configuration-driven design creates a robust foundation for game development.