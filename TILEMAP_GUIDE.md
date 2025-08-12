# Tilemap Configuration Guide

This document explains the structure and configuration of tilemap.json in detail.

## 1. Tilesets

### Basic Structure

```json
{
  "firstgid": 1,
  "name": "terrain_grass_block_center",
  "image": "assets/tilemap/tiles/terrain_grass_block_center.png",
  "imagewidth": 64,
  "imageheight": 64,
  "margin": 0,
  "spacing": 0,
  "tilecount": 1,
  "tileheight": 64,
  "tilewidth": 64,
  "tiles": [...]
}
```

### firstgid Assignment Logic

firstgid (first global ID) is the starting ID for each tileset and must increment sequentially:

- 1st tileset: `firstgid: 1`
- 2nd tileset: `firstgid: 2` (if the 1st tileset has only 1 tile)
- 3rd tileset: `firstgid: 3` (if there are 2 tiles total before)
- And so on...

**Formula**: 
```
next firstgid = current firstgid + current tilecount
```

**Example**:
```json
[
  {"firstgid": 1, "tilecount": 1, "name": "grass_center"},    // ID: 1
  {"firstgid": 2, "tilecount": 1, "name": "grass_top"},       // ID: 2
  {"firstgid": 3, "tilecount": 1, "name": "character"},       // ID: 3
  {"firstgid": 4, "tilecount": 1, "name": "spikes"},          // ID: 4
  {"firstgid": 5, "tilecount": 1, "name": "flag"}             // ID: 5
]
```

### Properties Configuration

Different types of assets require different properties:

#### Terrain Tiles
For building collidable ground and platforms:
```json
"tiles": [
  {
    "id": 0,  // Local ID within tileset, always starts from 0
    "properties": [
      {
        "name": "collision",
        "type": "bool",
        "value": true  // Enable collision detection, player cannot pass through
      }
    ]
  }
]
```

#### Sprite Atlas
Resources that need animation support (characters, animated objects, etc.):
```json
"tiles": [
  {
    "id": 0,
    "properties": [
      {
        "name": "atlas",
        "type": "bool",
        "value": true  // Load as atlas, requires corresponding .json file for animation frames
      }
    ]
  }
]
```
**Note**: When atlas is set to true, the system will automatically look for a matching .json file as the atlas configuration. For example, `character_purple.png` will look for `character_purple.json`.

#### Hazards
Objects that cause damage to the player:
```json
"tiles": [
  {
    "id": 0,
    "properties": [
      {
        "name": "damage",
        "type": "int",
        "value": 1  // Damage value, health points deducted on contact
      }
    ]
  }
]
```

#### Decorations
Pure decorative elements, no properties needed:
```json
"tiles": []  // Can be left empty or omitted
```

### Properties Summary

| Property Name | Type | Purpose | Applicable To |
|--------------|------|---------|---------------|
| collision | bool | Whether collidable (true=solid) | Terrain tiles |
| atlas | bool | Whether to load as atlas (true=needs .json config file) | Any resource needing animation |
| damage | int | Damage dealt | Hazards |

## 2. Tile Layer

### Basic Structure

```json
{
  "type": "tilelayer",
  "name": "Level1",
  "width": 25,      // Map width (in tiles)
  "height": 19,     // Map height (in tiles)
  "x": 0,
  "y": 0,
  "visible": true,
  "opacity": 1,
  "data": [...]     // Map data array
}
```

### Field Descriptions

- **type**: Must be "tilelayer"
- **name**: Layer name, customizable
- **width/height**: Define map dimensions (number of tiles)
- **data**: One-dimensional array, length must equal width × height

### Map Definition Method

The data array is arranged from left to right, top to bottom:

```
Position calculation: index = y * width + x

Example (5×3 map):
[
  1,1,1,1,1,  // Row 1 (y=0)
  0,0,0,0,0,  // Row 2 (y=1)  
  2,2,2,2,2   // Row 3 (y=2)
]
```

### ID Correspondence

Numbers in the data array correspond to tileset firstgids:

- `0` = Empty (no tile)
- `1` = Tileset with firstgid=1 (e.g., grass_center)
- `2` = Tileset with firstgid=2 (e.g., grass_top)
- `3` = Tileset with firstgid=3 (e.g., character)
- And so on...

**Complete Example**:
```json
{
  "type": "tilelayer",
  "name": "Ground",
  "width": 10,
  "height": 5,
  "data": [
    0,0,0,0,0,0,0,0,0,0,  // Empty row
    0,0,2,2,2,2,0,0,0,0,  // Grass top (firstgid=2)
    0,0,1,1,1,1,0,0,0,0,  // Grass center (firstgid=1)
    2,2,2,2,2,2,2,2,2,2,  // Full ground top
    1,1,1,1,1,1,1,1,1,1   // Full ground body
  ]
}
```

## 3. Objects Layer

### Basic Structure

```json
{
  "type": "objectgroup",
  "name": "Objects",
  "visible": true,
  "opacity": 1,
  "x": 0,
  "y": 0,
  "objects": [...]  // Objects array
}
```

### Object Structure

Each object contains:
```json
{
  "gid": 3,                    // Corresponds to tileset's firstgid
  "id": 38,                    // Object's unique ID (system-generated)
  "name": "character_purple",  // ⚠️ Must exactly match tileset's name!
  "type": "player",            // Object type (determines game behavior)
  "visible": true,
  "rotation": 0,
  "x": 64,                     // X coordinate (pixels)
  "y": 960,                    // Y coordinate (pixels)
  "width": 64,                 // Width (pixels)
  "height": 64                 // Height (pixels)
}
```

### ⚠️ Important: Name Field Matching Rules

**The object's `name` must exactly match the corresponding tileset's `name`!**

This is because the system uses the name to find and load the correct texture resource.

**Correct Example**:
```json
// tileset definition
{
  "firstgid": 4,
  "name": "spikes",  // tileset name
  "image": "assets/hazards/spikes.png"
}

// object usage
{
  "gid": 4,
  "name": "spikes",  // ✅ Matches tileset's name
  "type": "hazard"
}
```

**Incorrect Examples**:
```json
// tileset definition
{
  "firstgid": 4,
  "name": "spikes",
  "image": "assets/hazards/spikes.png"
}

// object usage
{
  "gid": 4,
  "name": "spike",   // ❌ Wrong! Missing 's'
  "type": "hazard"
}

{
  "gid": 4,
  "name": "Spikes",  // ❌ Wrong! Case mismatch
  "type": "hazard"
}
```

### Supported Object Types

The system determines object behavior based on the type field:

#### 1. player
```json
{
  "type": "player",
  "name": "character_purple",
  "x": 100,
  "y": 500,
  "width": 64,   // Determines character display size
  "height": 64   // Determines character display size
}
```
- Game protagonist, controlled by player
- Only one allowed per level
- Has health, jumping abilities, etc.

#### 2. hazard
```json
{
  "type": "hazard",
  "name": "spikes",
  "x": 200,
  "y": 500,
  "width": 64,   // Determines hazard area size
  "height": 64   // Determines hazard area size
}
```
- Static hazards that cause damage on contact
- Multiple can be placed
- Damage value defined by tileset's properties

#### 3. goal
```json
{
  "type": "goal",
  "name": "flag_green_a",
  "x": 1400,
  "y": 100,
  "width": 64,   // Determines trigger area size
  "height": 64   // Determines trigger area size
}
```
- Level endpoint, triggers victory on contact
- Usually a flag or portal
- Recommended one per level

### Width and Height Effects

Width and height affect multiple aspects of objects:

1. **Visual Display**
   - Determines texture scaling
   - Original 64×64, setting width:128 scales 2x

2. **Collision Detection**
   - Affects initial collision volume size
   - Actual collision volume may be adjusted in code

3. **Interaction Range**
   - For goals, determines victory trigger range
   - For hazards, determines damage range

**Example: Different Size Configurations**
```json
"objects": [
  {
    "type": "hazard",
    "name": "spikes_small",
    "width": 32,   // Small spikes
    "height": 32
  },
  {
    "type": "hazard", 
    "name": "spikes_large",
    "width": 128,  // Large spikes
    "height": 64
  },
  {
    "type": "goal",
    "name": "flag",
    "width": 64,   // Standard size flag
    "height": 96   // Slightly taller, easier to touch
  }
]
```

## Complete Configuration Example

```json
{
  "width": 10,
  "height": 5,
  "tilewidth": 64,
  "tileheight": 64,
  "layers": [
    {
      "type": "tilelayer",
      "name": "Ground",
      "width": 10,
      "height": 5,
      "data": [
        0,0,0,0,0,0,0,0,0,0,
        0,0,0,2,2,2,0,0,0,0,
        0,0,0,1,1,1,0,0,0,0,
        2,2,2,2,2,2,2,2,2,2,
        1,1,1,1,1,1,1,1,1,1
      ]
    },
    {
      "type": "objectgroup",
      "name": "Objects",
      "objects": [
        {
          "gid": 3,
          "type": "player",
          "name": "character_purple",
          "x": 64,
          "y": 256,
          "width": 64,
          "height": 64
        },
        {
          "gid": 4,
          "type": "hazard",
          "name": "spikes",
          "x": 320,
          "y": 256,
          "width": 64,
          "height": 64
        },
        {
          "gid": 5,
          "type": "goal",
          "name": "flag_green_a",
          "x": 576,
          "y": 256,
          "width": 64,
          "height": 64
        }
      ]
    }
  ],
  "tilesets": [
    {
      "firstgid": 1,
      "name": "terrain_grass_block_center",
      "image": "assets/tilemap/tiles/terrain_grass_block_center.png",
      "tilecount": 1,
      "tiles": [
        {
          "id": 0,
          "properties": [
            {"name": "collision", "type": "bool", "value": true}
          ]
        }
      ]
    },
    {
      "firstgid": 2,
      "name": "terrain_grass_block_top",
      "image": "assets/tilemap/tiles/terrain_grass_block_top.png",
      "tilecount": 1,
      "tiles": [
        {
          "id": 0,
          "properties": [
            {"name": "collision", "type": "bool", "value": true}
          ]
        }
      ]
    },
    {
      "firstgid": 3,
      "name": "character_purple",
      "image": "assets/player/character_purple.png",
      "tilecount": 1,
      "tiles": [
        {
          "id": 0,
          "properties": [
            {"name": "atlas", "type": "bool", "value": true}
          ]
        }
      ]
    },
    {
      "firstgid": 4,
      "name": "spikes",
      "image": "assets/hazards/spikes.png",
      "tilecount": 1,
      "tiles": [
        {
          "id": 0,
          "properties": [
            {"name": "damage", "type": "int", "value": 1}
          ]
        }
      ]
    },
    {
      "firstgid": 5,
      "name": "flag_green_a",
      "image": "assets/goal/flag_green_a.png",
      "tilecount": 1
    }
  ]
}
```