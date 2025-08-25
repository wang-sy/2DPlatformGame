# Resource Configuration Guide

## Overview

This guide explains how to add, configure, and manage game assets including sprites, animations, audio, and tilemaps.

## Asset Directory Structure

```
public/assets/
├── player/                 # Player character assets
│   ├── character_purple.png       # Sprite sheet
│   ├── character_purple.json      # Texture atlas
│   └── character_purple_animators.json  # Animation config
├── enemy/                  # Enemy assets
│   ├── frog.png           # Enemy sprite sheet
│   ├── frog.json          # Enemy atlas
│   └── frog_animators.json # Enemy animations
├── collectible/           # Collectible items
│   ├── coin_gold.png      # Coin sprite
│   └── hud_key_green.png  # Key sprite
├── obstacle/              # Obstacles and blocks
│   └── block_empty.png    # Basic block
├── goal/                  # Level objectives
│   └── flag_green_a.png   # Goal flag
├── hazards/               # Environmental hazards
│   └── spikes.png         # Spike hazard
├── tilemap/               # Level maps
│   ├── scenes/
│   │   └── tilemap.json   # Level data
│   └── tiles/             # Tileset images
│       ├── terrain_grass_block_center.png
│       └── terrain_grass_block_top.png
└── audio/                 # Audio files
    ├── bgm/               # Background music
    │   ├── Alls Fair In Love.mp3
    │   ├── Attic Secrets.mp3
    │   └── Baltic Levity.mp3
    ├── bgm-config.json    # BGM configuration
    └── sound_effect/      # Sound effects
        ├── config.json    # SFX configuration
        └── sfx_*.mp3      # Effect files
```

## Sprite Resources

### Adding a New Sprite

1. **Prepare the sprite image**
   - Format: PNG (recommended) or JPG
   - Size: Power of 2 preferred (64x64, 128x128, etc.)
   - Transparency: Use PNG for transparent backgrounds

2. **Create in appropriate directory**
   ```
   public/assets/[type]/sprite_name.png
   ```

3. **Load in Preloader scene**
   ```typescript
   // In Preloader.ts
   this.load.image('sprite_name', 'assets/[type]/sprite_name.png');
   ```

### Creating Texture Atlases

Texture atlases combine multiple frames into a single image for better performance.

#### Atlas JSON Format

```json
{
  "textures": [
    {
      "image": "character_purple.png",
      "format": "RGBA8888",
      "size": { "w": 756, "h": 102 },
      "frames": [
        {
          "filename": "idle/frame0000",
          "frame": { "x": 0, "y": 0, "w": 84, "h": 102 },
          "rotated": false,
          "trimmed": true,
          "spriteSourceSize": { "x": 0, "y": 0, "w": 84, "h": 102 },
          "sourceSize": { "w": 84, "h": 102 }
        }
      ]
    }
  ]
}
```

#### Loading Atlas

```typescript
// In Preloader.ts
this.load.atlas(
    'character_purple',                    // Key
    'assets/player/character_purple.png',  // Image
    'assets/player/character_purple.json'  // Atlas data
);
```

## Animation Configuration

### Animation Definition File

Create an `_animators.json` file for animated sprites:

```json
{
  "name": "character_purple",
  "type": "player",
  "animations": [
    {
      "name": "idle",
      "frames": ["idle/frame0000"],
      "frameRate": 10,
      "repeat": -1
    },
    {
      "name": "walk",
      "frames": ["walk/frame0000", "walk/frame0001"],
      "frameRate": 10,
      "repeat": -1
    },
    {
      "name": "jump",
      "frames": ["jump/frame0000"],
      "frameRate": 10,
      "repeat": 0
    }
  ]
}
```

### Animation Properties

| Property | Type | Description |
|----------|------|-------------|
| name | string | Animation identifier |
| frames | string[] | Frame names from atlas |
| frameRate | number | Frames per second |
| repeat | number | -1 for loop, 0 for once |

### Standard Animation Names

Use these standard names for automatic integration:

- **idle**: Default standing animation
- **walk**: Horizontal movement
- **jump**: Airborne animation
- **duck**: Crouching animation
- **climb**: Wall/ladder climbing
- **hit**: Taking damage
- **die**: Death animation
- **attack**: Combat animation

## Audio Resources

### Background Music Configuration

Edit `public/assets/audio/bgm-config.json`:

```json
{
  "scenes": {
    "MainMenu": {
      "bgm": "menu_theme",
      "loop": true,
      "volume": 0.7
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
    }
  },
  "bgmList": {
    "menu_theme": {
      "url": "/assets/audio/bgm/Baltic Levity.mp3",
      "preload": true
    },
    "game_theme": {
      "url": "/assets/audio/bgm/Alls Fair In Love.mp3",
      "preload": false
    }
  }
}
```

### Sound Effect Configuration

Edit `public/assets/audio/sound_effect/config.json`:

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
    "die": ["sfx_disappear.mp3"]
  },
  "collectible": {
    "coin": ["sfx_coin.mp3"],
    "gem": ["sfx_gem.mp3"],
    "key": ["sfx_select.mp3"]
  }
}
```

### Audio File Requirements

- **Format**: MP3 (best compatibility) or OGG
- **Bitrate**: 128-192 kbps for music, 64-128 kbps for effects
- **Sample Rate**: 44.1 kHz recommended
- **Channels**: Stereo for music, mono for effects

### Adding New Audio

1. **Add file to appropriate directory**
   ```
   public/assets/audio/bgm/new_music.mp3
   public/assets/audio/sound_effect/new_effect.mp3
   ```

2. **Update configuration files**
   - BGM: Add to `bgm-config.json`
   - SFX: Add to `sound_effect/config.json`

3. **Load in Preloader** (if not auto-loaded)
   ```typescript
   this.load.audio('new_music', 'assets/audio/bgm/new_music.mp3');
   ```

## Tilemap Resources

### Tilemap Structure

Tilemaps are created using Tiled editor and exported as JSON.

#### Basic Tilemap Properties

```json
{
  "height": 19,      // Map height in tiles
  "width": 25,       // Map width in tiles
  "tileheight": 64,  // Tile height in pixels
  "tilewidth": 64,   // Tile width in pixels
  "layers": [...],   // Tile and object layers
  "tilesets": [...] // Tileset references
}
```

### Adding Tilesets

1. **Create tileset image**
   - Grid of tiles with consistent size
   - No spacing between tiles
   - Power of 2 dimensions recommended

2. **Import in Tiled**
   - New Tileset → Image source
   - Set tile size
   - Configure collision properties

3. **Export settings**
   - Format: JSON
   - Embed tilesets: No
   - Include: All layers and properties

### Object Layer Configuration

Objects in Tiled become game entities:

```json
{
  "name": "Objects",
  "objects": [
    {
      "name": "character_purple",
      "type": "player",
      "x": 64,
      "y": 960,
      "width": 42,
      "height": 51,
      "properties": [
        {"name": "uuid", "value": "player-001"},
        {"name": "max_health", "value": 3}
      ]
    }
  ]
}
```

### Supported Object Types

| Type | Purpose | Required Properties |
|------|---------|-------------------|
| player | Player spawn | uuid |
| enemy | Enemy entity | uuid, move_method |
| collectible | Item pickup | score, type |
| trigger | Event zone | event_type, target_uuid |
| obstacle | Barrier | destructible, movable |
| hazard | Damage zone | damage |
| goal | Level end | - |

## Asset Loading in Preloader

### Load Order

1. **Essential UI elements**
2. **Player assets**
3. **Tilemap data**
4. **Enemy sprites**
5. **Collectibles**
6. **Audio files**
7. **Background images**

### Preloader Implementation

```typescript
preload() {
    // Create loading bar
    this.createLoadingBar();
    
    // Load sprites
    this.load.image('player', 'assets/player/character.png');
    
    // Load atlases
    this.load.atlas('player', 
        'assets/player/character.png',
        'assets/player/character.json'
    );
    
    // Load tilemap
    this.load.tilemapTiledJSON('tilemap', 
        'assets/tilemap/scenes/tilemap.json'
    );
    
    // Load tileset images
    this.load.image('terrain_grass', 
        'assets/tilemap/tiles/terrain_grass.png'
    );
    
    // Load audio
    this.load.audio('bgm_game', 
        'assets/audio/bgm/game_theme.mp3'
    );
}
```

## Asset Optimization

### Image Optimization

1. **Use appropriate formats**
   - PNG: Sprites with transparency
   - JPG: Backgrounds without transparency
   - WebP: Modern browsers (with fallback)

2. **Optimize file sizes**
   - Use tools like TinyPNG or ImageOptim
   - Remove metadata
   - Reduce color depth if possible

3. **Create sprite sheets**
   - Combine related sprites
   - Use texture atlases
   - Minimize draw calls

### Audio Optimization

1. **Compress appropriately**
   - Music: 128-192 kbps MP3
   - Effects: 64-128 kbps MP3
   - Voice: 96 kbps MP3

2. **Use loops for music**
   - Create seamless loops
   - Reduce file size
   - Save bandwidth

3. **Preload strategically**
   - Essential sounds first
   - Level-specific later
   - Stream large files

## Custom Resource Types

### Adding New Resource Categories

1. **Create directory structure**
   ```
   public/assets/new_category/
   ```

2. **Update Preloader**
   ```typescript
   // Add loading logic
   this.load.image('new_type', 'assets/new_category/file.png');
   ```

3. **Create manager if needed**
   ```typescript
   export class NewResourceManager {
       // Resource management logic
   }
   ```

## Resource Hot-Reloading

During development, assets can be hot-reloaded:

1. **Modify asset file**
2. **Save changes**
3. **Refresh browser** (Vite handles caching)

For production, implement cache-busting:

```typescript
this.load.image('sprite', `assets/sprite.png?v=${VERSION}`);
```

## Troubleshooting

### Common Issues

1. **Asset not loading**
   - Check file path and name
   - Verify file exists
   - Check browser console for 404 errors

2. **Animation not playing**
   - Verify frame names match atlas
   - Check animation key
   - Ensure frames exist

3. **Audio not playing**
   - Check browser autoplay policies
   - Verify file format compatibility
   - Test volume settings

4. **Tilemap rendering issues**
   - Verify tileset images loaded
   - Check layer visibility
   - Confirm tile IDs match

### Debug Tools

1. **Asset verification**
   ```typescript
   // Check if texture exists
   if (this.textures.exists('sprite_key')) {
       console.log('Sprite loaded');
   }
   ```

2. **List loaded assets**
   ```typescript
   // Get all texture keys
   const textures = this.textures.list;
   console.log('Loaded textures:', Object.keys(textures));
   ```

3. **Audio debugging**
   ```typescript
   // Check audio context state
   console.log('Audio state:', this.sound.context.state);
   ```

## Best Practices

1. **Organize by type**: Keep similar assets together
2. **Use consistent naming**: snake_case or camelCase
3. **Document custom properties**: Comment unusual configurations
4. **Version large changes**: Keep backups of working assets
5. **Test on multiple devices**: Ensure compatibility
6. **Monitor performance**: Profile asset loading times
7. **Implement fallbacks**: Provide alternatives for missing assets

## Next Steps

- Review [Tilemap Guide](./tilemap-guide.md) for level creation
- See [Modification Guide](./modification-guide.md) for customization
- Check [Architecture](./architecture.md) for system integration