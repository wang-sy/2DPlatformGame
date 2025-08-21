# User Configuration Guide

This guide provides comprehensive instructions for configuring the Phaser 3 TypeScript game template to create your own customized game experience. The template uses a data-driven approach where most game elements can be configured through JSON files and Tiled map editor.

## Table of Contents

1. [Project Setup](#project-setup)
2. [Tilemap Configuration](#tilemap-configuration)
3. [Player Configuration](#player-configuration)
4. [Enemy Configuration](#enemy-configuration)
5. [Collectibles Configuration](#collectibles-configuration)
6. [Hazards Configuration](#hazards-configuration)
7. [Audio Configuration](#audio-configuration)
8. [Animation Configuration](#animation-configuration)
9. [Build Configuration](#build-configuration)

## Project Setup

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev         # Run with console logging
npm run dev-nolog   # Run without console logging
```

### Production Build

```bash
npm run build       # Optimized production build
npm run build-nolog # Production build without logging
```

## Tilemap Configuration

The game level is defined using Tiled map editor. The main tilemap file is located at `public/assets/tilemap/scenes/tilemap.json`.

### Tilemap Structure

```json
{
  "height": 19,           // Map height in tiles
  "width": 25,            // Map width in tiles
  "tileheight": 64,      // Individual tile height in pixels
  "tilewidth": 64,       // Individual tile width in pixels
  "layers": [...],        // Array of tile and object layers
  "tilesets": [...]      // Array of tilesets used
}
```

### Layer Configuration

#### Tile Layers
Used for terrain and static elements:

```json
{
  "type": "tilelayer",
  "name": "Level1",
  "data": [...]  // Array of tile IDs
}
```

#### Object Layers
Used for game entities:

```json
{
  "type": "objectgroup",
  "name": "Objects",
  "objects": [...]  // Array of game objects
}
```

### Tileset Properties

Each tileset can have properties that control its behavior:

```json
{
  "name": "tileset_name",
  "image": "path/to/image.png",
  "tiles": [
    {
      "properties": [
        {
          "name": "collides",
          "type": "bool",
          "value": true  // Makes tile solid for collision
        },
        {
          "name": "atlas",
          "type": "bool",
          "value": true  // Indicates this is a texture atlas
        }
      ]
    }
  ]
}
```

## Player Configuration

Players are defined as objects in the tilemap with `type: "player"`.

### Player Object Properties

```json
{
  "gid": 3,                        // Graphics ID from tileset
  "name": "character_purple",      // Texture/atlas name
  "type": "player",                 // Must be "player"
  "x": 64,                         // Starting X position
  "y": 960,                        // Starting Y position
  "width": 64,                     // Player width
  "height": 64,                    // Player height
  "properties": [                  // Optional custom properties
    {
      "name": "custom_property",
      "value": "value"
    }
  ]
}
```

### Player Capabilities (Hardcoded)

- **Movement Speed**: 200 pixels/second
- **Jump Speed**: 500 pixels/second
- **Max Jumps**: 2 (double jump)
- **Wall Jump Speed**: 400 pixels/second
- **Charge Jump Multiplier**: 2x normal jump
- **Health Points**: 3
- **Gravity**: 800 pixels/second²

## Enemy Configuration

Enemies are defined as objects with `type: "enemy"` and support extensive customization through properties.

### Enemy Object Properties

```json
{
  "gid": 8,
  "name": "frog",           // Enemy texture/atlas name
  "type": "enemy",
  "x": 320,
  "y": 640,
  "properties": [...]       // Behavior configuration
}
```

### Enemy Behavior Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `damage` | int | 1 | Damage dealt to player on contact |
| `move_method` | string | "static" | Movement pattern (see below) |
| `move_speed` | int | 100 | Movement speed in pixels/second |
| `jump_power` | int | 400 | Jump strength |
| `patrol_distance` | int | 200 | Distance to patrol in pixels |
| `detection_range` | int | 300 | Range to detect player |
| `jump_interval` | int | 2000 | Time between jumps in milliseconds |
| `death_particle_color` | hex | "#ff0000" | Color of death particles |
| `atlas` | bool | false | Whether this enemy uses texture atlas |

### Movement Methods

- **`static`**: No movement
- **`patrol`**: Walk back and forth on ground
- **`jump`**: Jump in place without moving
- **`move_and_jump`**: Move forward by jumping (frog-like)
- **`patrol_jump`**: Walk and occasionally jump
- **`follow`**: Follow player when in range
- **`follow_jump`**: Follow player and jump when needed

### Example Enemy Configuration

```json
{
  "name": "frog",
  "type": "enemy",
  "properties": [
    {"name": "damage", "value": 2},
    {"name": "move_method", "value": "move_and_jump"},
    {"name": "jump_power", "value": 500},
    {"name": "jump_interval", "value": 1500},
    {"name": "patrol_distance", "value": 300},
    {"name": "death_particle_color", "value": "#00ff00"}
  ]
}
```

## Collectibles Configuration

Collectibles are objects with `type: "collectible"` that can be collected by the player.

### Collectible Object Properties

```json
{
  "gid": 6,
  "name": "coin_gold",      // Collectible texture name
  "type": "collectible",
  "x": 576,
  "y": 640,
  "properties": [...]        // Collectible configuration
}
```

### Collectible Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `score` | int | 0 | Points awarded when collected |
| `must_collect` | bool | false | Required for level completion |
| `type` | string | "misc" | Category for grouping (coin, key, gem, etc.) |
| `rotate` | bool | false | Whether item rotates continuously |
| `particle_color` | hex | "#FFFFFF" | Color of collection particles |

### Example Collectible Configuration

```json
{
  "name": "hud_key_green",
  "type": "collectible",
  "properties": [
    {"name": "score", "value": 100},
    {"name": "must_collect", "value": true},
    {"name": "type", "value": "key"},
    {"name": "rotate", "value": true},
    {"name": "particle_color", "value": "#00FF00"}
  ]
}
```

## Hazards Configuration

Hazards are static objects that damage the player on contact.

### Hazard Object Properties

```json
{
  "gid": 4,
  "name": "spikes",         // Hazard texture name
  "type": "hazard",
  "x": 128,
  "y": 1088,
  "properties": [
    {
      "name": "damage",
      "value": 1            // Damage dealt per contact
    }
  ]
}
```

## Audio Configuration

### Background Music Configuration

Located at `public/assets/audio/bgm-config.json`:

```json
{
  "scenes": {
    "MainMenu": {
      "bgm": "menu_theme",    // BGM key to play
      "loop": true,           // Loop the music
      "volume": 0.7           // Volume (0.0 to 1.0)
    },
    "Game": {
      "bgm": "game_theme",
      "loop": true,
      "volume": 0.5
    },
    "Victory": {
      "bgm": "victory_theme",
      "loop": false,
      "volume": 0.8
    },
    "GameOver": {
      "bgm": "gameover_theme",
      "loop": false,
      "volume": 0.6
    }
  },
  "bgmList": {
    "menu_theme": {
      "url": "/assets/audio/bgm/Baltic Levity.mp3",
      "preload": true        // Preload during game initialization
    },
    "game_theme": {
      "url": "/assets/audio/bgm/Alls Fair In Love.mp3",
      "preload": false       // Load on demand
    }
  }
}
```

### Sound Effects Configuration

Located at `public/assets/audio/sound_effect/config.json`:

```json
{
  "character_purple": {
    "idle": [],              // No sound for idle
    "walk": [
      {
        "key": "purple_walk_1",
        "uri": "assets/audio/sound_effect/sfx_select.mp3"
      }
    ],
    "jump": [
      {
        "key": "purple_jump",
        "uri": "assets/audio/sound_effect/sfx_jump.mp3"
      }
    ],
    "hit": [
      {
        "key": "purple_hurt",
        "uri": "assets/audio/sound_effect/sfx_hurt.mp3"
      }
    ]
  },
  "frog": {
    "jump": [
      {
        "key": "frog_jump_1",
        "uri": "assets/audio/sound_effect/sfx_jump.mp3"
      },
      {
        "key": "frog_jump_2",
        "uri": "assets/audio/sound_effect/sfx_select.mp3"
      }
    ],
    "die": [
      {
        "key": "frog_die",
        "uri": "assets/audio/sound_effect/sfx_disappear.mp3"
      }
    ]
  }
}
```

Each animation can have multiple sound effects, and one will be randomly selected when played.

## Animation Configuration

Animations are configured per atlas/sprite sheet. Located at `public/assets/[sprite_name]/[sprite_name]_animators.json`:

### Animation Configuration Format

```json
{
  "name": "character_purple",
  "type": "character",
  "animations": [
    {
      "name": "idle",
      "filename_prefix": "idle/frame",
      "frame_range": {
        "from": 0,
        "to": 0               // Single frame
      },
      "padding_size": 4       // Zero padding (frame0000)
    },
    {
      "name": "walk",
      "filename_prefix": "walk/frame",
      "frame_range": {
        "from": 0,
        "to": 1               // Frames 0-1
      },
      "padding_size": 4
    },
    {
      "name": "jump",
      "filename_prefix": "jump/frame",
      "frame_range": {
        "from": 0,
        "to": 0
      },
      "padding_size": 4
    }
  ]
}
```

### Animation Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Animation identifier |
| `filename_prefix` | string | Prefix for frame files |
| `frame_range.from` | int | Starting frame number |
| `frame_range.to` | int | Ending frame number |
| `padding_size` | int | Zero padding for frame numbers |

## Build Configuration

### Development Configuration

Located at `vite/config.dev.mjs`:

```javascript
{
  base: './',               // Base path for assets
  server: {
    port: 8080             // Development server port
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser']  // Separate Phaser into its own chunk
        }
      }
    }
  }
}
```

### Production Configuration

Located at `vite/config.prod.optimized.mjs`:

```javascript
{
  base: './',
  logLevel: 'warning',
  optimizeDeps: {
    force: false,           // Don't force rebuild
    include: ['phaser'],    // Pre-bundle Phaser
    exclude: []
  },
  build: {
    sourcemap: false,       // Disable source maps for production
    chunkSizeWarningLimit: 300,
    target: 'es2020',      // Target modern browsers
    minify: 'terser',      // Use Terser for minification
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs
        drop_debugger: true // Remove debugger statements
      }
    }
  }
}
```

## Game Configuration Summary

### Essential Files to Configure

1. **Level Design**: `public/assets/tilemap/scenes/tilemap.json`
2. **Background Music**: `public/assets/audio/bgm-config.json`
3. **Sound Effects**: `public/assets/audio/sound_effect/config.json`
4. **Sprite Animations**: `public/assets/[sprite]/[sprite]_animators.json`
5. **Build Settings**: `vite/config.*.mjs`

### Configuration Workflow

1. **Design your level** in Tiled map editor
2. **Add game objects** with appropriate types and properties
3. **Configure audio** by updating BGM and sound effect JSON files
4. **Set up animations** for each sprite/atlas
5. **Place assets** in the correct directories
6. **Test** using development server
7. **Build** for production when ready

### Asset Directory Structure

```
public/assets/
├── audio/
│   ├── bgm-config.json
│   ├── bgm/
│   │   └── *.mp3
│   └── sound_effect/
│       ├── config.json
│       └── *.mp3
├── tilemap/
│   ├── scenes/
│   │   └── tilemap.json
│   └── tiles/
│       └── *.png
├── player/
│   ├── [name].png
│   ├── [name].json
│   └── [name]_animators.json
├── enemy/
│   ├── [name].png
│   ├── [name].json
│   └── [name]_animators.json
├── collectible/
│   └── *.png
├── hazards/
│   └── *.png
└── goal/
    └── *.png
```

## Tips for Configuration

1. **Test incrementally**: Make small changes and test frequently
2. **Use consistent naming**: Keep asset names consistent across configs
3. **Optimize assets**: Compress images and audio for better performance
4. **Backup configs**: Keep backups of working configurations
5. **Document changes**: Comment custom properties in Tiled
6. **Validate JSON**: Ensure all JSON files are valid before testing