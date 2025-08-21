# Tilemap Configuration Guide

## Overview

This project uses Phaser 3's Tilemap system combined with the Tiled map editor to create game levels. The system supports:
- Automatic loading of Tilemap and related resources
- Creating game entities based on object layers
- Support for both Atlas and regular Tilesets
- Collision detection configuration
- Dynamic object property passing

## System Architecture

### Core Flow

```
Tiled Editor → JSON Export → Preloader Loading → Game Scene Parsing → Game Object Creation
```

### Key Components

1. **Preloader.ts** - Responsible for loading Tilemap and related resources
2. **Game.ts** - Parses Tilemap and creates game objects
3. **Sprite Classes** - Entity classes like Player, Enemy, Collectible

## Tiled Map Editor Configuration

### 1. Create Map

When creating a new map, set:
- Map size (e.g., 32x20 tiles)
- Tile size (e.g., 32x32 pixels)
- Render order: Right Down

### 2. Add Tilesets

#### Regular Tilesets
For static terrain, backgrounds, etc.:
```json
{
  "name": "tileset_name",
  "image": "assets/tilemap/tiles/tileset.png",
  "tilewidth": 32,
  "tileheight": 32
}
```

#### Atlas Tilesets
For animated sprites:
1. Add tileset by selecting image
2. Add custom property to the first tile:
   - Property name: `atlas`
   - Type: `bool`
   - Value: `true`

### 3. Create Layers

#### Tile Layers
For drawing terrain, platforms, etc.:
```
- background     # Background layer
- platforms      # Platform layer (set collision)
- decorations    # Decoration layer
```

Collision setup:
1. Select tiles that need collision
2. Add custom property:
   - Property name: `collides`
   - Type: `bool`
   - Value: `true`

#### Object Layers
For placing game entities:
```
- players        # Player spawn position
- enemies        # Enemies
- collectibles   # Collectible items
- hazards        # Hazards (spikes, etc.)
- goals          # Goal points
```

### 4. Create Game Objects

When creating objects in object layers:

#### Player Object
```
Name: player_sprite_name  // Corresponds to atlas name
Type: player
Position: (x, y)
Size: (width, height)     // Optional, for scaling
```

#### Enemy Object
```
Name: enemy_sprite_name
Type: enemy
Custom Properties:
  - moveSpeed: 100        // Movement speed
  - moveRange: 200        // Movement range
  - damage: 1             // Damage value
  - health: 2             // Health points
```

#### Collectible Object
```
Name: item_sprite_name
Type: collectible
Custom Properties:
  - score: 100            // Score value
  - type: coin            // Item type
  - mustCollect: true     // Must collect to win
```

#### Hazard Object
```
Name: hazard_sprite_name
Type: hazard
Custom Properties:
  - damage: 1             // Damage value
```

#### Goal Object
```
Name: goal_sprite_name
Type: goal
```

## Preloader Loading Mechanism

### Automatic Resource Loading

Loading flow in Preloader.ts:

```typescript
async preload() {
    // 1. Load Tilemap JSON
    this.load.tilemapTiledJSON('tilemap', 'assets/tilemap/scenes/tilemap.json');
    
    // 2. Load raw JSON text for parsing
    this.load.text('tilemap_json_raw', 'assets/tilemap/scenes/tilemap.json');
    
    // 3. Listen for load completion, parse and load resources
    this.load.once('filecomplete-text-tilemap_json_raw', () => {
        this.loadAllAssets();
    });
}

private loadAllAssets() {
    // Parse Tilemap JSON
    let tilemapJsonObj = JSON.parse(tilemapJsonRaw);
    let tilesets = tilemapJsonObj["tilesets"];
    
    tilesets.forEach((tileset: any) => {
        // Check if it's an atlas
        let isAtlas = false;
        let tiles = tileset["tiles"];
        if (tiles && tiles[0]?.properties) {
            properties.forEach((property: any) => {
                if (property.name === "atlas" && property.value === true) {
                    isAtlas = true;
                }
            });
        }
        
        if (isAtlas) {
            // Load atlas and animation configuration
            let atlasJsonUri = imageUri.replace(/(\.[^/.]+)$/, '.json');
            this.load.atlas(name, imageUri, atlasJsonUri);
            
            // Load animation configuration
            let animationConfigUri = imageUri.replace(/(\.[^/.]+)$/, '_animators.json');
            this.load.json(`${name}_animations`, animationConfigUri);
        } else {
            // Load regular image
            this.load.image(name, imageUri);
        }
    });
}
```

### Animation Configuration Files

For atlases, create corresponding animation configuration files `{atlas_name}_animators.json`:

```json
{
    "name": "player",
    "type": "sprite",
    "animations": [
        {
            "name": "idle",
            "filename_prefix": "idle_",
            "frame_range": {
                "from": 0,
                "to": 3
            },
            "padding_size": 4
        },
        {
            "name": "walk",
            "filename_prefix": "walk_",
            "frame_range": {
                "from": 0,
                "to": 7
            }
        },
        {
            "name": "jump",
            "filename_prefix": "jump_",
            "frame_range": {
                "from": 0,
                "to": 5
            }
        }
    ]
}
```

## Game Scene Object Creation

### Map Loading and Layer Creation

```typescript
create() {
    // 1. Create Tilemap
    this.map = this.make.tilemap({ key: 'tilemap' });
    
    // 2. Add tilesets
    this.tilesets = [];
    this.map.tilesets.forEach((tileset: Phaser.Tilemaps.Tileset) => {
        let addedTileset = this.map.addTilesetImage(tileset.name, tileset.name);
        if (addedTileset) {
            this.tilesets.push(addedTileset);
        }
    });
    
    // 3. Create tile layers
    this.layers = [];
    this.map.getTileLayerNames().forEach((tileLayerName: string) => {
        const layer = this.map.createLayer(tileLayerName, this.tilesets, 0, 0);
        if (layer) {
            this.layers.push(layer);
            // Set collision (based on collides property)
            layer.setCollisionByProperty({ collides: true });
        }
    });
    
    // 4. Create objects
    this.createObjectsFromTilemap();
}
```

### Object Creation Examples

```typescript
private createPlayerFromTilemap(playerObject: Phaser.Types.Tilemaps.TiledObject) {
    // Player class uses object properties
    this.player = new Player(this, playerObject);
    
    // Set up collision
    this.layers.forEach(layer => {
        this.physics.add.collider(this.player, layer);
    });
    
    // Set camera to follow
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
}

private createEnemyFromTilemap(enemyObject: Phaser.Types.Tilemaps.TiledObject) {
    const enemy = new Enemy(this, enemyObject);
    this.enemies.add(enemy);
    
    // Enemy class internally reads custom properties
    // moveSpeed, moveRange, damage, health, etc.
}
```

## Using Tiled Objects in Sprite Classes

### Player.ts Example

```typescript
export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, tiledObject: Phaser.Types.Tilemaps.TiledObject) {
        // Get position from Tiled object
        let x = tiledObject.x ?? 0;
        let y = tiledObject.y ?? 0;
        
        // Use object name as texture key
        let key = tiledObject.name;
        super(scene, x, y, key);
        
        // Get texture's original dimensions
        let texture = scene.textures.get(key);
        let firstFrame = (texture.frames as any)[texture.firstFrame];
        
        // Apply scaling set in Tiled
        let displayWidth = (tiledObject.width ?? firstFrame.width);
        let displayHeight = (tiledObject.height ?? firstFrame.height);
        
        let xScale = displayWidth / firstFrame.width;
        let yScale = displayHeight / firstFrame.height;
        this.setScale(xScale, yScale);
        
        // Set physics collision body (70% of original size)
        this.setSize(firstFrame.width * 0.7, firstFrame.height * 0.7);
        this.setOffset(firstFrame.width * 0.1, firstFrame.height * 0.1);
    }
}
```

### Enemy.ts Example

```typescript
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private moveSpeed: number;
    private moveRange: number;
    private damage: number;
    
    constructor(scene: Scene, enemyObject: Phaser.Types.Tilemaps.TiledObject) {
        super(scene, enemyObject.x ?? 0, enemyObject.y ?? 0, enemyObject.name);
        
        // Read custom properties
        const properties = enemyObject.properties as any;
        if (properties) {
            this.moveSpeed = properties.moveSpeed || 50;
            this.moveRange = properties.moveRange || 100;
            this.damage = properties.damage || 1;
            this.health = properties.health || 1;
        }
        
        // Set patrol behavior
        this.startX = this.x;
        this.movingRight = true;
    }
    
    update(): void {
        // Use properties to control behavior
        if (this.movingRight) {
            this.setVelocityX(this.moveSpeed);
            if (this.x >= this.startX + this.moveRange) {
                this.movingRight = false;
            }
        } else {
            this.setVelocityX(-this.moveSpeed);
            if (this.x <= this.startX) {
                this.movingRight = true;
            }
        }
    }
}
```

## File Organization Structure

```
assets/
└── tilemap/
    ├── scenes/
    │   └── tilemap.json           # Main map file
    ├── tiles/
    │   ├── terrain.png            # Terrain tileset
    │   └── decorations.png        # Decoration tileset
    └── sprites/
        ├── player.png              # Player atlas
        ├── player.json             # Atlas definition
        ├── player_animators.json   # Animation configuration
        ├── enemy.png
        ├── enemy.json
        └── enemy_animators.json
```

## Best Practices

### 1. Naming Conventions

- Tilesets: `tileset_terrain`, `tileset_decorations`
- Atlases: `player`, `enemy`, `items`
- Object types: `player`, `enemy`, `collectible`, `hazard`, `goal`
- Layers: `background`, `platforms`, `foreground`

### 2. Performance Optimization

1. **Layer Optimization**
   - Use separate layers for static backgrounds
   - Put collision tiles in dedicated layers
   - Use non-collision layers for decorations

2. **Tileset Optimization**
   - Group similar tiles in the same tileset
   - Keep tileset size under 2048x2048
   - Use power-of-2 dimensions

3. **Object Count Control**
   - Reasonably limit enemy and collectible counts
   - Use object pools for dynamic objects

### 3. Collision Configuration

```typescript
// Set up collision groups in Game.ts
private createOverlapEvents() {
    // Player vs hazards
    this.physics.add.overlap(
        this.player, 
        this.hazards, 
        this.handlePlayerHazardCollision, 
        undefined, 
        this
    );
    
    // Player vs collectibles
    this.physics.add.overlap(
        this.player,
        this.collectibles,
        this.handlePlayerCollectibleCollision,
        undefined,
        this
    );
}
```

## Debugging Tips

### 1. Display Collision Boundaries

```typescript
// In Game.ts create method
this.physics.world.createDebugGraphic();

// Display tile collisions
const debugGraphics = this.add.graphics().setAlpha(0.75);
layer.renderDebug(debugGraphics, {
    tileColor: null,
    collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
    faceColor: new Phaser.Display.Color(40, 39, 37, 255)
});
```

### 2. Console Output

```typescript
// Output map information
console.log('Map size:', this.map.width, 'x', this.map.height);
console.log('Tile size:', this.map.tileWidth, 'x', this.map.tileHeight);
console.log('Layers:', this.map.layers);
console.log('Objects:', this.map.objects);
```

### 3. Object Property Inspection

```typescript
// Output properties when creating objects
console.log('Object properties:', tiledObject.properties);
console.log('Object position:', tiledObject.x, tiledObject.y);
console.log('Object size:', tiledObject.width, tiledObject.height);
```

## Common Issues

### Q: Tiles/sprites not displaying?

1. Check if file paths are correct
2. Confirm tileset names match in code
3. Check if atlas property is set correctly
4. Look for loading errors in console

### Q: Collision not working?

1. Confirm tiles have `collides: true` property
2. Check if physics engine is enabled
3. Verify collision body sizes are set correctly
4. Use debug display to see collision boundaries

### Q: Animations not playing?

1. Check if animation configuration file exists
2. Confirm frame names match those in atlas
3. Check if AnimationManager is initialized correctly
4. Review animation creation logs in console

## Extended Features

### 1. Dynamic Level Loading

```typescript
loadLevel(levelName: string) {
    // Clear current level
    this.clearCurrentLevel();
    
    // Load new level
    this.load.tilemapTiledJSON(levelName, `assets/levels/${levelName}.json`);
    this.load.start();
    
    this.load.once('complete', () => {
        this.createLevel(levelName);
    });
}
```

### 2. Custom Object Types

Extend the `createObject` method in Game.ts:

```typescript
private createObject(obj: Phaser.Types.Tilemaps.TiledObject) {
    switch (obj.type) {
        case "moving_platform":
            this.createMovingPlatform(obj);
            break;
        case "checkpoint":
            this.createCheckpoint(obj);
            break;
        // ... other custom types
    }
}
```

### 3. Layer Effects

```typescript
// Create foreground layer to cover player
const foregroundLayer = this.map.createLayer('foreground', this.tilesets);
foregroundLayer?.setDepth(1000); // Set high depth value

// Player default depth is 0
this.player.setDepth(0);
```

## Summary

The Tilemap system, through integration of the Tiled editor and Phaser, provides powerful level design capabilities:

1. **Visual Editing** - Design levels intuitively using Tiled
2. **Automatic Loading** - Preloader automatically handles resource loading
3. **Flexible Configuration** - Control game logic through custom properties
4. **Type Safety** - TypeScript provides type checking
5. **Easy Extension** - Support for adding new object types and behaviors

With proper configuration and usage, you can quickly create rich and diverse game levels.