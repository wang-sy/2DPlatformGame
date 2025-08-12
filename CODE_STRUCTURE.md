# Code Structure Documentation

## ⚠️ Important Notice

**Please prioritize customizing the game by modifying `tilemap.json` rather than modifying source code!**

This game framework is designed to be **data-driven**, where almost all game content can be implemented through configuration files:
- ✅ Level design → Modify tilemap.json
- ✅ Add new assets → Register in tilemap.json
- ✅ Adjust difficulty → Configure properties
- ❌ Modify core code → Only when necessary

## 📁 Source Code Structure

```
src/
├── main.ts                 # Application entry point
└── game/
    ├── main.ts            # Phaser game configuration
    ├── scenes/            # Game scenes
    │   ├── Boot.ts        # Boot scene
    │   ├── Preloader.ts   # Asset loading scene ⚡
    │   ├── MainMenu.ts    # Main menu scene
    │   ├── Game.ts        # Core game scene ⚡
    │   ├── GameOver.ts    # Game over scene
    │   └── Victory.ts     # Victory scene
    ├── sprites/           # Game sprite objects
    │   ├── Player.ts      # Player character ⚡
    │   ├── StaticHazard.ts # Static hazards
    │   └── Goal.ts        # Goal objectives
    └── ui/               # UI components
        └── HealthUI.ts    # Health display
```

⚡ = Core files, modify with caution

## 🎮 Core System Overview

### 1. Automatic Asset Loading System (`Preloader.ts`)

**Function**: Automatically parses tilemap.json and loads all assets

```typescript
// The system automatically identifies and loads:
// - Regular images → this.load.image()
// - Sprite atlases → this.load.atlas() (requires atlas property)
```

**Extension Recommendations**:
- ✅ Add new tilesets in tilemap
- ❌ Don't hardcode asset paths

### 2. Object Creation System (`Game.ts`)

**Function**: Automatically creates game objects based on the type field in tilemap

```typescript
private createObject(obj) {
    switch (obj.type) {
        case "player":    // Create player
        case "hazard":    // Create hazards
        case "goal":      // Create goals
    }
}
```

**Extending New Object Types**:
```typescript
// 1. Add new case in switch
case "moving_platform":
    this.createMovingPlatformFromTilemap(obj);
    return

// 2. Create corresponding class file
// sprites/MovingPlatform.ts

// 3. Use in tilemap
{
    "type": "moving_platform",
    "properties": [...]
}
```

### 3. Collision Detection System (`Game.ts`)

**Function**: Unified management of all collision events

```typescript
private createOverleapEvents() {
    // Player vs hazards
    this.physics.add.overlap(player, hazards, callback)
    // Player vs goals
    this.physics.add.overlap(player, goals, callback)
}
```

**Adding New Collision Types**:
```typescript
// Add new collision group
if (this.player && this.newGroup) {
    this.physics.add.overlap(
        this.player,
        this.newGroup,
        this.handleNewCollision,
        undefined,
        this
    );
}
```

## 🔧 Common Extension Patterns

### Adding New Game Elements

**Recommended Process**:

1. **Create Sprite Class** (`sprites/NewElement.ts`)
```typescript
export class NewElement extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Scene, elementObject: Phaser.Types.Tilemaps.TiledObject) {
        // Read configuration from tilemap
        const properties = elementObject.properties as any;
        // Initialization logic
    }
}
```

2. **Register in Game.ts**
```typescript
case "new_element":
    this.createNewElementFromTilemap(obj);
    return
```

3. **Use in tilemap.json**
```json
{
    "type": "new_element",
    "name": "element_name",
    "properties": [...]
}
```

### Modifying Existing Behavior

**Priority Order**:
1. 🥇 Configure through properties
2. 🥈 Extend classes rather than modify
3. 🥉 Only modify core code as a last resort

**Example: Adjusting Hazard Damage**
```json
// ✅ Good practice: Configure in tilemap
"properties": [
    {"name": "damage", "value": 2}
]

// ❌ Avoid: Hardcode in StaticHazard.ts
this.damage = 2; // Don't do this
```

## 📝 File Responsibilities

### Scenes

| File | Responsibility | Modifiable |
|-----|------|-----------|
| Boot.ts | Load initial assets | ⚠️ Caution |
| Preloader.ts | Auto-load tilemap assets | ⚠️ Caution |
| MainMenu.ts | Main menu interface | ✅ Yes |
| Game.ts | Core game logic | ⚠️ Extend only |
| GameOver.ts | Game over interface | ✅ Yes |
| Victory.ts | Victory interface | ✅ Yes |

### Sprites

| File | Responsibility | Modifiable |
|-----|------|-----------|
| Player.ts | Player control, animation, skills | ⚠️ Caution |
| StaticHazard.ts | Static hazard base class | 🔄 Extensible |
| Goal.ts | Goal objective logic | 🔄 Extensible |

### UI (Interface)

| File | Responsibility | Modifiable |
|-----|------|-----------|
| HealthUI.ts | Health display | ✅ Yes |

## 🎯 Best Practices

### DO ✅

1. **Data-Driven Design**
   - Place configuration in tilemap.json
   - Use properties to pass parameters
   - Use type field to distinguish behavior

2. **Generic Design**
   - Create base classes for extension
   - Use interfaces to define standards
   - Keep code reusable

3. **Extend Rather Than Modify**
   ```typescript
   // Good practice: Extend base class
   class FireHazard extends StaticHazard {
       // Add fire effects
   }
   ```

### DON'T ❌

1. **Hardcode Values**
   ```typescript
   // Avoid
   const damage = 10; // Should read from tilemap
   ```

2. **Directly Modify Core Loop**
   ```typescript
   // Avoid modifying Game.update()
   // Use event system instead
   ```

3. **Break Data Flow**
   ```typescript
   // Avoid
   this.player.health = 999; // Should use method calls
   ```

## 🚀 Quick Start for New Features

### Example: Adding Moving Platform

1. **Create Class File**
```typescript
// sprites/MovingPlatform.ts
export class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
    private speed: number;
    private distance: number;
    
    constructor(scene, platformObject) {
        super(scene, platformObject.x, platformObject.y, 'platform');
        const props = platformObject.properties;
        this.speed = props?.speed || 100;
        this.distance = props?.distance || 200;
    }
    
    update() {
        // Movement logic
    }
}
```

2. **Register in Game.ts**
```typescript
case "moving_platform":
    const platform = new MovingPlatform(this, obj);
    this.platforms.add(platform);
    return
```

3. **Use in tilemap**
```json
{
    "type": "moving_platform",
    "name": "platform",
    "properties": [
        {"name": "speed", "value": 100},
        {"name": "distance", "value": 200}
    ]
}
```

## 📚 Extension Guide

### Adding New Scenes
1. Create `scenes/NewScene.ts`
2. Register in `game/main.ts`
3. Use `this.scene.start('NewScene')` to switch

### Adding New UI Elements
1. Create `ui/NewUI.ts`
2. Instantiate in required scenes
3. Use `setScrollFactor(0)` to fix position

### Adding New Physics Groups
1. Create group in Game.ts
2. Add collision detection
3. Configure objects in tilemap

## ⚡ Performance Recommendations

1. **Use Object Pools**: For frequently created/destroyed objects
2. **Use StaticGroup**: For non-moving objects
3. **Limit Update Frequency**: Non-critical logic can run at lower frequency
4. **Optimize Collision Detection**: Use spatial partitioning

## 🔍 Debugging Tips

1. **Enable Physics Debug**
```typescript
// game/main.ts
physics: {
    arcade: {
        debug: true  // Show collision boundaries
    }
}
```

2. **View Tilemap Data**
```typescript
console.log(this.map.layers);
console.log(this.map.objects);
```

3. **Monitor Performance**
```typescript
this.game.config.fps.target = 60;
this.game.config.fps.min = 30;
```

---

## 📌 Summary

**Core Principles**:
1. 📄 **Configuration First** - Use tilemap instead of code changes when possible
2. 🔄 **Extension First** - Extend rather than modify original files
3. 🎯 **Generic First** - Design generic solutions rather than special cases

**Remember**: The power of this framework lies in its **data-driven** design. By fully utilizing the configuration capabilities of tilemap.json, you can create rich and diverse game content without touching a single line of code!

For deep customization, please follow the extension patterns above to maintain code cleanliness and maintainability.