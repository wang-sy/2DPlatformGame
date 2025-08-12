# Code Structure and Design Philosophy

This document outlines the architecture and design principles of the game's codebase.

## Table of Contents
- [Core Design Principles](#core-design-principles)
- [Collectible System Architecture](#collectible-system-architecture)
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

## Manager Pattern

The game uses manager classes to centralize state and logic:

### CollectedItemsManager
- **Purpose**: Track all collected items and scores
- **Responsibilities**:
  - Item collection tracking
  - Score calculation
  - Requirement validation
  - Data aggregation for UI

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

2. **Sound Properties**:
   - `collect_sound`: Sound effect file name
   - `volume`: Sound volume

3. **Gameplay Properties**:
   - `respawn_time`: For respawning collectibles
   - `expiry_time`: For time-limited items
   - `chain_bonus`: Bonus for collecting in sequence

4. **Visual Properties**:
   - `glow_color`: Ambient glow effect
   - `trail_effect`: Motion trail
   - `pickup_animation`: Custom collection animation

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

## Conclusion

The codebase follows a configuration-driven architecture that:
- Minimizes code changes for content additions
- Separates concerns effectively
- Provides clear extension points
- Maintains type safety

This approach enables rapid content creation while keeping the codebase maintainable and extensible.