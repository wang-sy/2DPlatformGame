# 🎨 User Configuration Guide

Complete guide for game designers, level designers, and artists to customize the game without writing code. All game behavior can be controlled through JSON configuration files and the Tiled map editor.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Level Design with Tiled](#level-design-with-tiled)
3. [Player Configuration](#player-configuration)
4. [Enemy Configuration](#enemy-configuration)
5. [Collectibles Configuration](#collectibles-configuration)
6. [Trigger System](#trigger-system)
7. [Animation Configuration](#animation-configuration)
8. [Audio Configuration](#audio-configuration)
9. [Visual Assets](#visual-assets)
10. [Advanced Techniques](#advanced-techniques)

## 🚀 Quick Start

### Required Tools
- [Tiled Map Editor](https://www.mapeditor.org/) - Free level editor
- Image editor (Photoshop, GIMP, Aseprite)
- Audio editor (Audacity) - optional
- Text editor for JSON files

### File Locations
```
public/
├── assets/
│   ├── tilemap/scenes/     # Level maps
│   ├── player/             # Player sprites
│   ├── enemy/              # Enemy sprites
│   ├── collectible/        # Items
│   ├── hazards/            # Dangers
│   └── audio/              # Sounds & music
```

## 🗺️ Level Design with Tiled

### Opening a Level
1. Install Tiled Map Editor
2. Open `public/assets/tilemap/scenes/tilemap.json`
3. Edit and save changes
4. Refresh browser to see updates

### Layer Structure
- **Level1**: Tile layer for terrain
- **Objects**: Object layer for entities

### Placing Tiles
1. Select tile from tileset panel
2. Use stamp tool to place tiles
3. Hold shift to draw lines
4. Use bucket fill for areas

### Adding Game Objects
1. Switch to Objects layer
2. Use Insert Rectangle tool
3. Set object properties in Properties panel
4. Add required properties based on type

## 👤 Player Configuration

### Basic Properties
```json
{
  "type": "player",
  "name": "character_purple",
  "properties": [
    {
      "name": "uuid",
      "type": "string",
      "value": "player-001"
    },
    {
      "name": "max_health",
      "type": "int",
      "value": 3
    },
    {
      "name": "can_jump",
      "type": "bool",
      "value": true
    },
    {
      "name": "can_double_jump",
      "type": "bool",
      "value": false
    },
    {
      "name": "can_shoot",
      "type": "bool",
      "value": true
    }
  ]
}
```

### Ability Configuration
Control which abilities the player has in each level:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| can_jump | bool | true | Basic jumping ability |
| can_double_jump | bool | true | Mid-air second jump |
| can_wall_jump | bool | true | Jump off walls |
| can_wall_slide | bool | true | Slide slowly down walls |
| can_charge_jump | bool | true | Hold SPACE for super jump |
| can_shoot | bool | true | X key shooting ability |
| can_move | bool | true | Left/right movement |

### Movement Parameters
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| uuid | string | auto | Unique identifier |
| max_health | int | 3 | Maximum life points |
| move_speed | float | 200 | Horizontal movement speed |
| jump_speed | float | 500 | Jump velocity |
| max_jumps | int | 2 | Total jumps allowed (1=no double jump) |

### Level Design Examples

#### Tutorial Level (Limited Abilities)
```json
{
  "type": "player",
  "name": "character_purple",
  "properties": [
    {"name": "can_jump", "value": true},
    {"name": "can_double_jump", "value": false},
    {"name": "can_wall_jump", "value": false},
    {"name": "can_shoot", "value": false},
    {"name": "can_charge_jump", "value": false}
  ]
}
```

#### Platforming Challenge (No Combat)
```json
{
  "type": "player",
  "name": "character_purple",
  "properties": [
    {"name": "can_jump", "value": true},
    {"name": "can_double_jump", "value": true},
    {"name": "can_wall_jump", "value": true},
    {"name": "can_wall_slide", "value": true},
    {"name": "can_shoot", "value": false}
  ]
}
```

#### Combat Arena (Full Abilities)
```json
{
  "type": "player",
  "name": "character_purple",
  "properties": [
    {"name": "can_jump", "value": true},
    {"name": "can_double_jump", "value": true},
    {"name": "can_wall_jump", "value": true},
    {"name": "can_charge_jump", "value": true},
    {"name": "can_shoot", "value": true},
    {"name": "jump_speed", "value": 600},
    {"name": "max_jumps", "value": 3}
  ]
}
```

### Player Sprite Requirements
- Format: PNG with transparency
- Recommended size: 84x102 pixels
- Animation frames in atlas format

## 👾 Enemy Configuration

### Enemy Types & Movement Methods

#### Static Enemy
```json
{
  "type": "enemy",
  "name": "frog",
  "properties": [
    {"name": "uuid", "value": "enemy-001"},
    {"name": "move_method", "value": "static"},
    {"name": "damage", "value": 1}
  ]
}
```

#### Patrolling Enemy
```json
{
  "type": "enemy",
  "name": "frog",
  "properties": [
    {"name": "uuid", "value": "enemy-002"},
    {"name": "move_method", "value": "patrol"},
    {"name": "move_speed", "value": 100},
    {"name": "patrol_distance", "value": 200},
    {"name": "damage", "value": 1}
  ]
}
```

#### Following Enemy
```json
{
  "type": "enemy",
  "name": "frog",
  "properties": [
    {"name": "uuid", "value": "enemy-003"},
    {"name": "move_method", "value": "follow"},
    {"name": "move_speed", "value": 80},
    {"name": "detection_range", "value": 300},
    {"name": "damage", "value": 2}
  ]
}
```

### Movement Methods
| Method | Description | Required Properties |
|--------|-------------|-------------------|
| static | Doesn't move | - |
| patrol | Moves back and forth | patrol_distance |
| jump | Jumps in place | jump_interval |
| move_and_jump | Moves and jumps | patrol_distance, jump_interval |
| patrol_jump | Patrols with jumping | patrol_distance, jump_interval |
| follow | Follows player | detection_range |
| follow_jump | Follows and jumps | detection_range, jump_interval |

### Enemy Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| uuid | string | auto | Unique identifier |
| move_method | string | static | AI behavior type |
| move_speed | float | 50 | Movement speed |
| jump_force | float | 300 | Jump strength |
| patrol_distance | float | 100 | Patrol range |
| detection_range | float | 200 | Player detection distance |
| jump_interval | int | 2000 | Time between jumps (ms) |
| damage | int | 1 | Damage dealt |
| death_particle_color | string | #00ff00 | Death effect color |

## 💎 Collectibles Configuration

### Coin Example
```json
{
  "type": "collectible",
  "name": "coin_gold",
  "properties": [
    {"name": "uuid", "value": "coin-001"},
    {"name": "score", "value": 100},
    {"name": "type", "value": "coin"},
    {"name": "rotate", "value": true},
    {"name": "particle_color", "value": "#FFD700"}
  ]
}
```

### Key Example (Required Item)
```json
{
  "type": "collectible",
  "name": "hud_key_green",
  "properties": [
    {"name": "uuid", "value": "key-001"},
    {"name": "must_collect", "value": true},
    {"name": "type", "value": "key"},
    {"name": "rotate", "value": false},
    {"name": "particle_color", "value": "#00FF00"}
  ]
}
```

### Collectible Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| uuid | string | auto | Unique identifier |
| score | int | 0 | Points awarded |
| type | string | item | Item category |
| must_collect | bool | false | Required for level completion |
| rotate | bool | true | Spinning animation |
| particle_color | string | #FFFFFF | Collection effect color |

## 🎯 Trigger System

### Movement Trigger (Spike Trap)
```json
{
  "type": "trigger",
  "name": "spike_trap",
  "width": 128,
  "height": 64,
  "properties": [
    {"name": "uuid", "value": "trigger-001"},
    {"name": "event_type", "value": "move"},
    {"name": "target_uuid", "value": "spike-001"},
    {"name": "velocity_x", "value": 0},
    {"name": "velocity_y", "value": -1000},
    {"name": "duration", "value": 1500},
    {"name": "delay", "value": 200},
    {"name": "repeat", "value": true},
    {"name": "return_to_origin", "value": false}
  ]
}
```

### Scale Trigger (Growing Enemy)
```json
{
  "type": "trigger",
  "name": "enemy_enlarger",
  "properties": [
    {"name": "uuid", "value": "trigger-002"},
    {"name": "event_type", "value": "scale"},
    {"name": "target_uuid", "value": "enemy-001"},
    {"name": "scale_x", "value": 2.0},
    {"name": "scale_y", "value": 2.0},
    {"name": "duration", "value": 2000},
    {"name": "repeat", "value": false},
    {"name": "return_to_origin", "value": true}
  ]
}
```

### Trigger Properties
| Property | Type | Default | Description |
|----------|------|---------|-------------|
| uuid | string | auto | Unique identifier |
| event_type | string | - | "move" or "scale" |
| target_uuid | string | - | UUID of target object |
| velocity_x | float | 0 | Horizontal speed (pixels/sec) |
| velocity_y | float | 0 | Vertical speed (pixels/sec) |
| scale_x | float | 1 | Horizontal scale multiplier |
| scale_y | float | 1 | Vertical scale multiplier |
| duration | int | 1000 | Effect duration (ms) |
| delay | int | 0 | Activation delay (ms) |
| repeat | bool | false | Can trigger multiple times |
| return_to_origin | bool | true | Return to original state |
| texture_key | string | - | Sprite/image texture for visual trigger |
| active_texture | string | - | Texture when trigger is activated |
| inactive_texture | string | - | Texture when trigger is inactive |
| use_sprite | bool | false | Use animated sprite instead of static image |
| visual_scale | float | 1 | Scale of the visual representation |

### Visual Trigger Example (Switch)
```json
{
  "type": "trigger",
  "name": "switch",
  "width": 64,
  "height": 64,
  "properties": [
    {"name": "uuid", "value": "switch-001"},
    {"name": "event_type", "value": "move"},
    {"name": "target_uuid", "value": "door-001"},
    {"name": "texture_key", "value": "switch_off"},
    {"name": "active_texture", "value": "switch_on"},
    {"name": "inactive_texture", "value": "switch_off"},
    {"name": "use_sprite", "value": false},
    {"name": "visual_scale", "value": 1.0},
    {"name": "velocity_y", "value": -500},
    {"name": "duration", "value": 3000},
    {"name": "repeat", "value": true},
    {"name": "return_to_origin", "value": true}
  ]
}
```

### Trigger Use Cases
1. **Spike Traps**: Spikes that pop up when player approaches
2. **Moving Platforms**: Platforms that move when stepped on
3. **Boss Transformations**: Enemies that grow when player enters arena
4. **Environmental Hazards**: Falling rocks, rising lava
5. **Puzzle Elements**: Doors, switches, mechanisms
6. **Visual Switches**: Interactive buttons that change appearance when pressed
7. **Pressure Plates**: Floor tiles that depress when stepped on
8. **Levers**: Toggle switches with on/off states
9. **Interactive Decorations**: Objects that react to player presence

## 🎬 Animation Configuration

### Animation File Format
Create `[sprite_name].json` next to sprite image:

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
    },
    {
      "key": "jump",
      "frames": [10],
      "frameRate": 1,
      "repeat": 0
    },
    {
      "key": "die",
      "frames": [11, 12, 13],
      "frameRate": 10,
      "repeat": 0
    }
  ]
}
```

### Animation Properties
| Property | Type | Description |
|----------|------|-------------|
| key | string | Animation name |
| frames | array | Frame indices from atlas |
| frameRate | int | Frames per second |
| repeat | int | -1 = loop, 0 = once, n = n times |

### Standard Animation Names
- **idle**: Standing still
- **walk**: Moving horizontally
- **jump**: In the air
- **duck**: Crouching
- **hit**: Taking damage
- **die**: Death sequence
- **charge**: Charging jump

## 🔊 Audio Configuration

### Background Music (`bgm-config.json`)
```json
{
  "MainMenu": "Attic Secrets.mp3",
  "Game": "Baltic Levity.mp3",
  "GameOver": "sad-music.mp3",
  "Victory": "Alls Fair In Love.mp3",
  "volume": 0.5
}
```

### Sound Effects (`config.json`)
```json
{
  "player": {
    "jump": ["sfx_jump.mp3", "sfx_jump-high.mp3"],
    "hit": ["sfx_hurt.mp3"],
    "shoot": ["sfx_throw.mp3"],
    "die": ["sfx_disappear.mp3"]
  },
  "enemy": {
    "hit": ["sfx_bump.mp3"],
    "die": ["sfx_magic.mp3"]
  },
  "collectible": {
    "collect": ["sfx_coin.mp3", "sfx_gem.mp3"]
  }
}
```

### Audio Guidelines
- **Format**: MP3 or OGG
- **BGM**: Loop seamlessly
- **SFX**: Keep under 1 second
- **Multiple sounds**: Random selection
- **Volume**: Test at different levels

## 🎨 Visual Assets

### Sprite Requirements

#### Player Sprites
- **Size**: ~84x102 pixels
- **Format**: PNG with transparency
- **Atlas**: Multiple frames in one image
- **Animations**: idle, walk, jump, hit, die

#### Enemy Sprites
- **Size**: 64x64 pixels recommended
- **Format**: PNG with transparency
- **Atlas**: Animation frames
- **Facing**: Include left/right versions

#### Tiles
- **Size**: 64x64 pixels (standard)
- **Format**: PNG
- **Edges**: Seamless tiling
- **Variants**: Create variety

#### Collectibles
- **Size**: 32x32 or 64x64 pixels
- **Format**: PNG with transparency
- **Effects**: Glow, sparkle optional
- **Colors**: Distinct for each type

### Asset Organization
```
assets/
├── player/
│   ├── character_purple.png
│   └── character_purple.json
├── enemy/
│   ├── frog.png
│   └── frog.json
├── collectible/
│   ├── coin_gold.png
│   └── gem_blue.png
└── tilemap/
    └── tiles/
        ├── grass_top.png
        └── grass_center.png
```

## 🔧 Advanced Techniques

### Creating Chain Reactions with Triggers
1. Create multiple triggers with delays
2. Have triggers target other triggers
3. Use return_to_origin for repeating patterns

### Complex Enemy Patterns
Combine properties for unique behaviors:
```json
{
  "move_method": "patrol_jump",
  "patrol_distance": 300,
  "jump_interval": 1000,
  "move_speed": 150,
  "jump_force": 500
}
```

### Level Progression
1. Use must_collect items as keys
2. Place goal behind obstacles
3. Create multiple paths with different difficulties

### Environmental Storytelling
- Place decorative objects (no collision)
- Use background layers for depth
- Create atmospheric lighting with colored tiles

### Performance Tips
1. **Limit particles**: Use particle_color sparingly
2. **Optimize sprites**: Keep sizes reasonable
3. **Reuse assets**: Use same sprite for multiple enemies
4. **Test frequently**: Check performance on target devices

## 📝 Configuration Checklist

### Before Testing Your Level
- [ ] All objects have UUIDs
- [ ] Player has spawn point
- [ ] Enemies have movement configured
- [ ] Must-collect items placed
- [ ] Goal is accessible
- [ ] Triggers have valid targets
- [ ] Audio files exist
- [ ] Animation JSONs created
- [ ] Tile collisions set

### Common Issues & Solutions

**Problem**: Enemy not moving
- Check move_method property
- Verify patrol_distance is set
- Ensure no collision blocking path

**Problem**: Trigger not working
- Verify target_uuid matches exactly
- Check trigger size and position
- Ensure target object exists

**Problem**: Animation not playing
- Check animation JSON syntax
- Verify frame indices exist
- Ensure animation key matches

**Problem**: Collectible not working
- Add type property
- Set particle_color for feedback
- Check collision bounds

## 🎯 Quick Reference

### Object Types
- `player` - Player character
- `enemy` - Hostile entity
- `collectible` - Pickup item
- `hazard` - Static danger
- `goal` - Level endpoint
- `trigger` - Event zone

### Essential Properties
- `uuid` - Unique identifier (all objects)
- `type` - Object category (Tiled)
- `name` - Sprite/asset name (Tiled)
- `x, y` - Position (Tiled)
- `width, height` - Size (Tiled)

### Color Format
- Hex: `"#FF0000"` (red)
- Hex: `"#00FF00"` (green)
- Hex: `"#0000FF"` (blue)
- Hex: `"#FFD700"` (gold)

---

Happy creating! For technical questions, see the Developer Documentation.