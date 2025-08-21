# Sound Effect Configuration Guide

## Overview

This project uses the `SoundEffectPlayer` manager to handle all sound effects in the game. The system supports:
- Automatic sound playback based on animations
- Random sound selection (multiple sounds configurable per animation)
- Lazy loading and preloading strategies
- Global volume control

## System Architecture

### SoundEffectPlayer Singleton Pattern

```typescript
// Get sound effect player instance
const soundEffectPlayer = SoundEffectPlayer.getInstance();

// Initialize in Preloader scene
soundEffectPlayer.init(scene);
await soundEffectPlayer.loadConfig();
soundEffectPlayer.preloadSounds();
```

### Core Features

1. **Configuration Loading**: Read sound effect configuration from JSON file
2. **Sound Preloading**: Load all sound resources before game starts
3. **Animation Association**: Associate sounds with sprite atlas animations
4. **Random Playback**: Randomly select from multiple sounds

## Configuration File Format

Create `assets/audio/sound_effect/config.json` file:

```json
{
  "player": {
    "jump": [
      {
        "key": "player_jump_1",
        "uri": "assets/audio/sound_effect/player/jump_1.mp3"
      },
      {
        "key": "player_jump_2",
        "uri": "assets/audio/sound_effect/player/jump_2.mp3"
      }
    ],
    "hit": [
      {
        "key": "player_hit",
        "uri": "assets/audio/sound_effect/player/hit.mp3"
      }
    ],
    "walk": [
      {
        "key": "player_step_1",
        "uri": "assets/audio/sound_effect/player/step_1.mp3"
      },
      {
        "key": "player_step_2",
        "uri": "assets/audio/sound_effect/player/step_2.mp3"
      }
    ],
    "die": [
      {
        "key": "player_death",
        "uri": "assets/audio/sound_effect/player/death.mp3"
      }
    ]
  },
  "enemy": {
    "attack": [
      {
        "key": "enemy_attack",
        "uri": "assets/audio/sound_effect/enemy/attack.mp3"
      }
    ],
    "die": [
      {
        "key": "enemy_defeat",
        "uri": "assets/audio/sound_effect/enemy/defeat.mp3"
      }
    ]
  },
  "collectible": {
    "collect": [
      {
        "key": "coin_collect",
        "uri": "assets/audio/sound_effect/items/coin.mp3"
      }
    ]
  }
}
```

### Configuration Details

- **First level key**: Sprite atlas name (e.g., `player`, `enemy`) - must match object names in Tiled maps
- **Second level key**: Animation name (e.g., `jump`, `hit`, `walk`)
- **Sound array**: Multiple sounds can be configured per animation
  - `key`: Unique identifier for the sound
  - `uri`: Sound file path

## Usage in Sprite Classes

### Player.ts Implementation Example

```typescript
import { SoundEffectPlayer } from '../managers/SoundEffectPlayer';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private soundEffectPlayer: SoundEffectPlayer;
    private key: string = ''; // Sprite name from Tiled object
    
    constructor(scene: Phaser.Scene, tiledObject: Phaser.Types.Tilemaps.TiledObject) {
        let key = tiledObject.name; // Use Tiled object name as key
        super(scene, x, y, key);
        
        this.key = key;
        this.soundEffectPlayer = SoundEffectPlayer.getInstance();
    }
    
    private playAnimation(animName: string): void {
        const animKey = this.animationManager.getAnimationKey(this.key, animName);
        if (this.currentAnimation !== animKey) {
            this.play(animKey);
            this.currentAnimation = animKey;
            
            // Automatically play corresponding sound
            if (this.soundEffectPlayer.hasAnimationSound(this.key, animName)) {
                this.soundEffectPlayer.playAnimationSound(this.key, animName);
            }
        }
    }
    
    // Special sound handling for jumping
    update(): void {
        if (justPressedUp && !this.isCharging) {
            // Play jump sound (slightly lower volume)
            if (this.soundEffectPlayer.hasAnimationSound(this.key, 'jump')) {
                this.soundEffectPlayer.playAnimationSound(this.key, 'jump', 0.7);
            }
        }
    }
    
    // Damage sound
    takeDamage(damage: number): void {
        this.playAnimation('hit');
        // Sound automatically plays in playAnimation
    }
    
    // Death sound
    private handleDeath(): void {
        if (this.soundEffectPlayer.hasAnimationSound(this.key, 'die')) {
            this.soundEffectPlayer.playAnimationSound(this.key, 'die');
        }
    }
}
```

### Enemy.ts Implementation Example

```typescript
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private soundEffectPlayer: SoundEffectPlayer;
    private enemyName: string;
    
    constructor(scene: Scene, enemyObject: Phaser.Types.Tilemaps.TiledObject) {
        this.enemyName = enemyObject.name || 'enemy';
        this.soundEffectPlayer = SoundEffectPlayer.getInstance();
    }
    
    takeDamage(damage: number): void {
        // Play death sound
        if (this.soundEffectPlayer.hasAnimationSound(this.enemyName, 'die')) {
            this.soundEffectPlayer.playAnimationSound(this.enemyName, 'die', 0.6);
        }
        this.destroy();
    }
}
```

## Sound Management Best Practices

### 1. File Organization Structure

```
assets/
└── audio/
    ├── bgm-config.json         # BGM configuration file
    └── sound_effect/
        ├── config.json          # Sound effect configuration file
        ├── player/             # Player sounds
        │   ├── jump_1.mp3
        │   ├── jump_2.mp3
        │   ├── hit.mp3
        │   └── death.mp3
        ├── enemy/              # Enemy sounds
        │   ├── attack.mp3
        │   └── defeat.mp3
        └── items/              # Item sounds
            ├── coin.mp3
            └── powerup.mp3
```

### 2. Naming Conventions

- Sound key names: `{character_type}_{action}_{number}`
  - Examples: `player_jump_1`, `enemy_attack`
- File names: Concise descriptive naming
  - Examples: `jump_1.mp3`, `hit.mp3`

### 3. Volume Control Strategy

| Character Type | Action | Recommended Volume | Notes |
|----------------|--------|-------------------|-------|
| Player | Default | 1.0 | Standard volume |
| Player | Jump | 0.7 | Reduced to avoid being too loud |
| Player | Hit/Death | 1.0 | Needs to be noticeable |
| Enemy | Default | 0.4 | Avoid interference |
| Enemy | Death | 0.6 | Moderate volume |
| Items | Collect | 0.8 | Clear but not harsh |

```typescript
// Specify volume when playing (0.0 - 1.0)
soundEffectPlayer.playAnimationSound('player', 'jump', 0.5);

// Global volume control
soundEffectPlayer.setGlobalVolume(0.8);

// Individual sound volume adjustment
soundEffectPlayer.setVolume('player_jump_1', 0.6);
```

### 4. Performance Optimization Suggestions

1. **Preloading Strategy**
   ```typescript
   // In Preloader.ts
   async preload() {
       // Initialize and load configuration
       this.soundEffectPlayer.init(this);
       await this.soundEffectPlayer.loadConfig();
       
       // Preload all sounds
       this.soundEffectPlayer.preloadSounds();
   }
   
   create() {
       // Initialize after sounds are loaded
       this.soundEffectPlayer.onSoundsLoaded();
   }
   ```

2. **Sound Reuse**
   - Similar actions can share sounds (e.g., hit sounds for different enemies)
   - Use sound pools to avoid repeated creation

3. **Memory Management**
   ```typescript
   // Clean up sounds on scene transition
   destroy(): void {
       this.soundEffectPlayer.stopAllSounds();
       this.soundEffectPlayer.clear();
   }
   ```

## Debug Features

### Console Log Output

SoundEffectPlayer provides detailed debug information:

```
[SoundEffectPlayer] Initializing with scene: Preloader
[SoundEffectPlayer] Loading config from: assets/audio/sound_effect/config.json
[SoundEffectPlayer] Config loaded successfully
[SoundEffectPlayer] Atlas keys: ['player', 'enemy']
[SoundEffectPlayer] Mapped player_jump -> 2 sound(s)
[SoundEffectPlayer] Playing sound: player_jump_1 at volume: 0.5
```

### Common Debug Methods

```typescript
// Get loaded sounds list
const loadedSounds = soundEffectPlayer.getLoadedSounds();
console.log('Loaded sounds:', loadedSounds);

// Get sound configuration
const config = soundEffectPlayer.getSoundConfig();
console.log('Sound config:', config);

// Check if animation has associated sound
const hasSound = soundEffectPlayer.hasAnimationSound('player', 'jump');
console.log('Player jump has sound:', hasSound);
```

## Advanced Features

### 1. Conditional Sound Playback

```typescript
// Play different sounds based on game state
if (player.isUnderwater) {
    soundEffectPlayer.playSound('underwater_jump', 0.6);
} else {
    soundEffectPlayer.playAnimationSound('player', 'jump', 0.8);
}
```

### 2. Sound Chains

```typescript
// Play multiple sounds consecutively
soundEffectPlayer.playSound('powerup_collect', 0.7);
scene.time.delayedCall(200, () => {
    soundEffectPlayer.playSound('powerup_activate', 0.8);
});
```

### 3. Random Sound Variants

System automatically selects randomly when multiple sounds are configured:

```json
"walk": [
    { "key": "step_grass_1", "uri": "step_grass_1.mp3" },
    { "key": "step_grass_2", "uri": "step_grass_2.mp3" },
    { "key": "step_grass_3", "uri": "step_grass_3.mp3" }
]
```

## Troubleshooting

### Q: Sound not playing?

Checklist:
1. Does sprite name in config match Tiled object name?
2. Are sound file paths correct (relative to project root)?
3. Any loading errors in console?
4. Is browser muted or requires user interaction for audio?

### Q: Sound delay?

Solutions:
1. Ensure preloading in Preloader scene
2. Use smaller audio files (recommended < 100KB)
3. Use MP3 or OGG format
4. Consider using Audio Sprites

### Q: Sound playing repeatedly?

System prevents repetition by checking `currentAnimation`. If still problematic:
1. Check if `playAnimation` is called from multiple places
2. Verify animation switching logic is correct

### Q: How to support multiple platforms?

```javascript
// Provide multiple formats in Preloader
this.load.audio('jump', [
    'assets/audio/jump.ogg',
    'assets/audio/jump.mp3'
]);
```

## Integration Flow Summary

1. **Create Configuration File** - Define sound mappings in `assets/audio/sound_effect/config.json`
2. **Prepare Sound Resources** - Place sound files in corresponding directories
3. **Initialize System** - Initialize SoundEffectPlayer in Preloader scene
4. **Sprite Integration** - Call sound playback methods in sprite classes
5. **Test and Debug** - Use console logs to confirm sounds work properly

Through this system, you can easily manage all sounds in the game and create a rich auditory experience.