# Tilemap Creation Guide

## Introduction

This guide covers creating and editing game levels using Tiled map editor. Tiled is a free, open-source tile map editor that exports to JSON format compatible with Phaser.

## Getting Started with Tiled

### Installation

1. Download Tiled from [mapeditor.org](https://www.mapeditor.org/)
2. Install for your operating system
3. Launch Tiled

### Opening the Project Tilemap

1. Open Tiled
2. File → Open → Navigate to `public/assets/tilemap/scenes/tilemap.json`
3. The existing level will load

## Understanding the Tilemap Structure

### Map Properties

| Property | Value | Description |
|----------|-------|-------------|
| Width | 25 tiles | Level width |
| Height | 19 tiles | Level height |
| Tile Width | 64px | Individual tile width |
| Tile Height | 64px | Individual tile height |
| Orientation | Orthogonal | 2D grid layout |

### Layers

The tilemap uses multiple layers:

1. **Tile Layers** - Terrain and platforms
   - Level1: Main terrain layer
   - Background (optional): Decorative tiles

2. **Object Layers** - Game entities
   - Objects: Player, enemies, collectibles, etc.

## Creating Terrain

### Setting Up Tilesets

1. **Import tileset images**
   ```
   Tileset → New Tileset → Browse
   Select: public/assets/tilemap/tiles/[tileset].png
   ```

2. **Configure tile properties**
   - Select tiles
   - Right-click → Tile Properties
   - Add custom properties:
     ```json
     {
       "collides": true,  // For solid tiles
       "type": "platform" // Optional categorization
     }
     ```

### Drawing Tiles

1. **Select tile layer** (e.g., "Level1")
2. **Choose drawing tool**:
   - Stamp Brush (B): Place individual tiles
   - Bucket Fill (F): Fill areas
   - Eraser (E): Remove tiles

3. **Paint tiles** on the grid

### Tile ID Reference

| ID | Tile | Purpose |
|----|------|---------|
| 0 | Empty | No tile (transparent) |
| 1 | Grass bottom | Solid ground |
| 2 | Grass top | Platform surface |

## Adding Game Objects

### Object Types

Objects are placed on the "Objects" layer and define game entities.

### Player Object

```json
{
  "name": "character_purple",
  "type": "player",
  "x": 64,
  "y": 960,
  "width": 42,
  "height": 51,
  "properties": [
    {"name": "uuid", "value": "player-001"},
    {"name": "max_health", "value": 3},
    {"name": "can_jump", "value": true},
    {"name": "can_double_jump", "value": true},
    {"name": "can_wall_jump", "value": true},
    {"name": "can_shoot", "value": true}
  ]
}
```

**How to add:**
1. Select Object Layer
2. Insert → Insert Tile (T)
3. Choose player sprite
4. Click to place
5. Right-click → Object Properties
6. Set type: "player"
7. Add custom properties

### Enemy Objects

```json
{
  "name": "frog",
  "type": "enemy",
  "x": 320,
  "y": 800,
  "properties": [
    {"name": "uuid", "value": "enemy-001"},
    {"name": "damage", "value": 1},
    {"name": "move_method", "value": "patrol"},
    {"name": "move_speed", "value": 100},
    {"name": "patrol_distance", "value": 200},
    {"name": "jump_power", "value": 400}
  ]
}
```

**Movement Methods:**
- `static`: No movement
- `patrol`: Back and forth
- `jump`: Periodic jumping
- `move_and_jump`: Frog-like hopping
- `patrol_jump`: Patrol with jumps
- `follow`: Track player
- `follow_jump`: Follow and jump

### Collectible Objects

```json
{
  "name": "coin_gold",
  "type": "collectible",
  "x": 256,
  "y": 640,
  "properties": [
    {"name": "score", "value": 100},
    {"name": "type", "value": "coin"},
    {"name": "must_collect", "value": false},
    {"name": "rotate", "value": true},
    {"name": "particle_color", "value": "#FFD700"}
  ]
}
```

**Important collectibles:**
- Set `must_collect: true` for required items
- Player cannot reach goal without collecting these

### Trigger Zones

Triggers are invisible zones that activate events.

```json
{
  "type": "trigger",
  "x": 512,
  "y": 600,
  "width": 128,
  "height": 64,
  "properties": [
    {"name": "event_type", "value": "move"},
    {"name": "target_uuid", "value": "platform-001"},
    {"name": "velocity_x", "value": 0},
    {"name": "velocity_y", "value": -200},
    {"name": "duration", "value": 1500},
    {"name": "return_to_origin", "value": true},
    {"name": "repeat", "value": true},
    {"name": "delay", "value": 500}
  ]
}
```

**Event Types:**
1. **move**: Move target object
2. **scale**: Scale target object

**Creating a moving platform:**
1. Place platform obstacle with UUID
2. Create trigger zone
3. Set trigger's `target_uuid` to platform's UUID
4. Configure movement properties

### Obstacles

```json
{
  "name": "block_empty",
  "type": "obstacle",
  "x": 384,
  "y": 512,
  "properties": [
    {"name": "uuid", "value": "box-001"},
    {"name": "destructible", "value": true},
    {"name": "health", "value": 3},
    {"name": "movable", "value": true}
  ]
}
```

**Types:**
- **Static**: Immovable barriers
- **Movable**: Can be pushed by player
- **Destructible**: Can be destroyed by shooting

### Hazards

```json
{
  "name": "spikes",
  "type": "hazard",
  "x": 640,
  "y": 1152,
  "properties": [
    {"name": "damage", "value": 1}
  ]
}
```

### Goal

```json
{
  "name": "flag_green_a",
  "type": "goal",
  "x": 1472,
  "y": 1088
}
```

Place at level end. Player must collect all `must_collect` items first.

## UUID System

### What are UUIDs?

Unique identifiers that allow objects to reference each other.

Format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

### Using UUIDs

1. **Assign UUID to target object**:
   ```json
   {"name": "uuid", "value": "platform-001"}
   ```

2. **Reference in trigger**:
   ```json
   {"name": "target_uuid", "value": "platform-001"}
   ```

### UUID Best Practices

- Use descriptive names: `platform-001`, `enemy-boss-01`
- Keep UUIDs unique per level
- Document complex interactions

## Advanced Techniques

### Creating Moving Platforms

1. **Place platform obstacle**
   ```json
   {
     "type": "obstacle",
     "properties": [
       {"name": "uuid", "value": "moving-platform-01"},
       {"name": "movable", "value": false}
     ]
   }
   ```

2. **Add trigger zone**
   ```json
   {
     "type": "trigger",
     "properties": [
       {"name": "event_type", "value": "move"},
       {"name": "target_uuid", "value": "moving-platform-01"},
       {"name": "velocity_y", "value": -100},
       {"name": "duration", "value": 2000},
       {"name": "return_to_origin", "value": true}
     ]
   }
   ```

### Creating Puzzle Elements

**Door and Key System:**

1. **Place locked door (obstacle)**
   ```json
   {
     "uuid": "door-01",
     "destructible": false
   }
   ```

2. **Place key (collectible)**
   ```json
   {
     "type": "collectible",
     "must_collect": true
   }
   ```

3. **Add trigger near door**
   ```json
   {
     "event_type": "scale",
     "target_uuid": "door-01",
     "scale_x": 0,
     "scale_y": 0
   }
   ```

### Creating Enemy Waves

Use triggers with delays:

```json
{
  "type": "trigger",
  "properties": [
    {"name": "event_type", "value": "move"},
    {"name": "target_uuid", "value": "enemy-hidden-01"},
    {"name": "velocity_x", "value": 200},
    {"name": "delay", "value": 1000}
  ]
}
```

## Collision Configuration

### Setting Collision Properties

1. **In Tiled tileset editor**:
   - Select tiles
   - Add property: `collides: true`

2. **Collision types**:
   - Full collision: Player cannot pass
   - One-way platform: Jump through from below
   - Slope: Angled collision

### Testing Collisions

1. Export tilemap
2. Run game
3. Enable physics debug:
   ```typescript
   physics: {
     arcade: {
       debug: true  // Shows collision boxes
     }
   }
   ```

## Exporting and Testing

### Export Settings

1. **File → Export As**
2. **Format**: JSON
3. **Options**:
   - Embed tilesets: No
   - Compress: No
   - Include: All layers

### File Location

Save to: `public/assets/tilemap/scenes/tilemap.json`

### Testing Workflow

1. Save tilemap in Tiled
2. Refresh browser (Vite auto-reloads)
3. Test gameplay
4. Iterate

## Tips and Best Practices

### Level Design

1. **Start simple**: Basic platforms first
2. **Test frequently**: Export and play often
3. **Guide the player**: Use collectibles to show path
4. **Gradual difficulty**: Introduce mechanics slowly
5. **Multiple paths**: Add secret areas

### Performance

1. **Limit object count**: Combine static tiles
2. **Use object pooling**: For many similar enemies
3. **Optimize triggers**: Don't overlap unnecessarily
4. **Group objects**: Organize by area

### Common Patterns

**Checkpoint System:**
- Place triggers at checkpoints
- Store player position
- Respawn at last checkpoint

**Secret Areas:**
- Hidden collectibles behind false walls
- Bonus rooms with extra score items
- Alternative paths

**Tutorial Elements:**
- Use triggers to display hints
- Place easier enemies early
- Demonstrate mechanics safely

## Troubleshooting

### Object Not Appearing

1. Check object layer is visible
2. Verify object type is set
3. Confirm texture name matches
4. Check console for errors

### Collision Issues

1. Verify `collides` property on tiles
2. Check physics body size
3. Test with debug mode enabled

### Trigger Not Working

1. Verify target UUID exists
2. Check trigger overlaps with player
3. Confirm event_type is valid
4. Test with console logging

## Example Level Structures

### Basic Platformer

```
Start → Platforms → Enemies → Collectibles → Goal
```

### Puzzle Level

```
Start → Locked Door → Find Key → Unlock → Goal
```

### Boss Arena

```
Start → Arena Setup → Boss Trigger → Battle → Victory
```

## Resources

- [Tiled Documentation](https://doc.mapeditor.org/)
- [Phaser Tilemap API](https://photonstorm.github.io/phaser3-docs/Phaser.Tilemaps.html)
- [Example Tilemaps](public/assets/tilemap/scenes/)

## Next Steps

1. Open existing tilemap in Tiled
2. Make small modifications
3. Test changes in game
4. Create your own level
5. Share and get feedback