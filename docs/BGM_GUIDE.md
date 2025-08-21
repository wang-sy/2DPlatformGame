# Background Music (BGM) Configuration Guide

## Overview

This project uses the `BGMPlayer` singleton manager to handle background music in the game. The system supports:
- Automatic BGM switching between scenes
- Preload and lazy load strategies
- Volume control and fade in/out
- Loop configuration
- Scene persistence (prevents duplicate playback)

## System Architecture

### BGMPlayer Singleton Pattern

```typescript
// Get BGM player instance
const bgmPlayer = BGMPlayer.getInstance();

// Initialize on game startup (usually in Boot or MainMenu scene)
bgmPlayer.initialize(game);
```

### Core Features

1. **Automatic Scene Monitoring** - Listens for scene changes to automatically switch BGM
2. **Configuration-Driven** - Define scene music through JSON configuration files
3. **Smart Loading** - Supports preloading and on-demand loading
4. **State Management** - Tracks current playback state to avoid duplicates

## Configuration File Format

Create `/assets/audio/bgm-config.json` file:

```json
{
  "scenes": {
    "MainMenu": {
      "bgm": "menu_theme",
      "loop": true,
      "volume": 0.6
    },
    "Game": {
      "bgm": "level_music",
      "loop": true,
      "volume": 0.5
    },
    "Victory": {
      "bgm": "victory_fanfare",
      "loop": false,
      "volume": 0.7
    },
    "GameOver": {
      "bgm": "game_over",
      "loop": false,
      "volume": 0.5
    }
  },
  "bgmList": {
    "menu_theme": {
      "url": "/assets/audio/bgm/menu_theme.mp3",
      "preload": true
    },
    "level_music": {
      "url": "/assets/audio/bgm/level_music.mp3",
      "preload": true
    },
    "victory_fanfare": {
      "url": "/assets/audio/bgm/victory.mp3",
      "preload": false
    },
    "game_over": {
      "url": "/assets/audio/bgm/game_over.mp3",
      "preload": false
    },
    "boss_battle": {
      "url": "/assets/audio/bgm/boss_battle.mp3",
      "preload": false
    }
  }
}
```

### Configuration Details

#### Scenes Configuration
- **Scene Name**: Must exactly match the Phaser scene key
- **bgm**: References music key defined in bgmList
- **loop**: Whether to loop playback (default: true)
- **volume**: Volume level 0.0-1.0 (default: 1.0)

#### BGMList Configuration
- **Music Key**: Unique identifier for BGM
- **url**: Music file path (relative to project root)
- **preload**: Whether to preload on initialization (default: false)

## Integration Methods

### 1. Initialize BGMPlayer

Initialize at game entry point or first scene:

```typescript
// In main.ts or Boot.ts
import { BGMPlayer } from './game/managers/BGMPlayer';

const config: Phaser.Types.Core.GameConfig = {
    // ... other config
    scene: [Boot, Preloader, MainMenu, Game, Victory, GameOver],
    callbacks: {
        postBoot: (game) => {
            // Initialize BGMPlayer after game boot
            BGMPlayer.getInstance().initialize(game);
        }
    }
};

const game = new Phaser.Game(config);
```

Or initialize in the first scene:

```typescript
// Boot.ts or MainMenu.ts
export class Boot extends Scene {
    create() {
        // Initialize BGMPlayer
        BGMPlayer.getInstance().initialize(this.game);
        
        // Continue with other initialization
        this.scene.start('Preloader');
    }
}
```

### 2. Automatic Scene Switching

BGMPlayer automatically monitors and switches music for these scenes:
- MainMenu
- Game
- Victory
- GameOver

Implementation principle:

```typescript
private checkSceneChange(): void {
    const activeScenes = this.game.scene.getScenes(true);
    const primaryScene = activeScenes.find(scene => 
        ['MainMenu', 'Game', 'Victory', 'GameOver'].includes(scene.scene.key)
    );

    if (primaryScene && primaryScene.scene.key !== this.currentScene) {
        this.currentScene = primaryScene.scene.key;
        this.onSceneChange(this.currentScene);
    }
}
```

### 3. Manual Control

Besides automatic switching, you can manually control BGM:

```typescript
const bgmPlayer = BGMPlayer.getInstance();

// Manually switch to specific scene BGM
bgmPlayer.changeScene('BossScene');

// Pause current BGM
bgmPlayer.pauseCurrentBGM();

// Resume playback
bgmPlayer.resumeCurrentBGM();

// Stop all BGM
bgmPlayer.stopAll();

// Adjust volume (0.0 - 1.0)
bgmPlayer.setVolume(0.3);

// Get currently playing BGM
const currentBGM = bgmPlayer.getCurrentBGM();

// Get current scene
const currentScene = bgmPlayer.getCurrentScene();
```

## Advanced Features

### 1. Dynamic BGM Switching

Switch BGM based on game state during gameplay:

```typescript
// Game.ts
export class Game extends Scene {
    private bgmPlayer: BGMPlayer;
    
    create() {
        this.bgmPlayer = BGMPlayer.getInstance();
    }
    
    enterBossArea() {
        // Manually switch to boss battle music
        this.bgmPlayer.changeScene('BossBattle');
    }
    
    exitBossArea() {
        // Switch back to normal level music
        this.bgmPlayer.changeScene('Game');
    }
}
```

### 2. Volume Fade In/Out

```typescript
// Create fade out effect
fadeOutBGM(duration: number = 1000) {
    const bgmPlayer = BGMPlayer.getInstance();
    
    this.tweens.add({
        targets: { volume: 1.0 },
        volume: 0,
        duration: duration,
        onUpdate: (tween) => {
            const value = tween.getValue();
            bgmPlayer.setVolume(value);
        },
        onComplete: () => {
            bgmPlayer.stopAll();
        }
    });
}

// Create fade in effect
fadeInBGM(sceneName: string, duration: number = 1000) {
    const bgmPlayer = BGMPlayer.getInstance();
    bgmPlayer.setVolume(0);
    bgmPlayer.changeScene(sceneName);
    
    this.tweens.add({
        targets: { volume: 0 },
        volume: 0.5,
        duration: duration,
        onUpdate: (tween) => {
            const value = tween.getValue();
            bgmPlayer.setVolume(value);
        }
    });
}
```

### 3. Conditional BGM Configuration

Play different BGM based on game progress or player state:

```json
{
  "scenes": {
    "Game": {
      "bgm": "level_music",
      "alternates": {
        "underwater": "underwater_theme",
        "boss": "boss_battle",
        "stealth": "stealth_music"
      }
    }
  }
}
```

```typescript
// Switch to alternate BGM in game
class Game extends Scene {
    switchToUnderwaterMusic() {
        // Requires extending BGMPlayer to support this feature
        this.bgmPlayer.playAlternate('underwater');
    }
}
```

## File Organization Structure

```
assets/
└── audio/
    ├── bgm-config.json         # BGM configuration file
    ├── bgm/                    # Background music files
    │   ├── menu_theme.mp3
    │   ├── level_music.mp3
    │   ├── boss_battle.mp3
    │   ├── victory.mp3
    │   └── game_over.mp3
    └── sound_effect/           # Sound effect files directory
        └── ...
```

## Best Practices

### 1. Music File Optimization

- **Format Selection**: Use MP3 or OGG format
- **Bitrate**: 128kbps is usually sufficient
- **File Size**: Keep within 1-3MB
- **Loop Points**: Ensure looping music has smooth loop points

### 2. Preload Strategy

```json
{
  "bgmList": {
    "menu_theme": {
      "url": "/assets/audio/bgm/menu_theme.mp3",
      "preload": true  // Preload frequently used music
    },
    "secret_level": {
      "url": "/assets/audio/bgm/secret.mp3",
      "preload": false // Lazy load special music
    }
  }
}
```

### 3. Volume Balance

| Scene Type | Recommended Volume | Description |
|------------|-------------------|-------------|
| Main Menu | 0.6-0.7 | Higher volume to attract attention |
| Game Level | 0.4-0.5 | Moderate volume to not interfere with gameplay |
| Boss Battle | 0.6-0.7 | Increase tension |
| Victory | 0.7-0.8 | Celebratory music can be louder |
| Game Over | 0.4-0.5 | Quiet ending music |

### 4. Scene Transition Handling

```typescript
// Smooth scene transitions
class Game extends Scene {
    victory() {
        // Fade out current BGM
        this.cameras.main.fadeOut(500);
        
        this.time.delayedCall(500, () => {
            // BGMPlayer will automatically handle scene switching
            this.scene.start('Victory');
        });
    }
}
```

## Debug Features

### Console Logging

BGMPlayer provides detailed debug information:

```
BGMPlayer: BGM config loaded successfully
BGMPlayer: Preloaded sound "menu_theme"
BGMPlayer: Scene changed to MainMenu
BGMPlayer: Playing BGM: menu_theme
BGMPlayer: Stopped BGM: menu_theme
```

### Debug Methods

```typescript
// Debug in browser console
const bgm = BGMPlayer.getInstance();

// Check current state
console.log('Current BGM:', bgm.getCurrentBGM());
console.log('Current Scene:', bgm.getCurrentScene());

// Manual control
bgm.stopAll();
bgm.changeScene('Game');
bgm.setVolume(0.3);
```

## Common Issues

### Q: BGM not playing?

Checklist:
1. Is the configuration file path correct (`/assets/audio/bgm-config.json`)?
2. Are music file paths correct?
3. Does the scene name match the configuration?
4. Does the browser require user interaction to play audio?
5. Check console for error messages

### Q: Music repeats when switching scenes?

The system already handles this:
```typescript
// Same BGM won't play repeatedly
if (this.currentBGM === bgmKey && this.currentBGMSound?.isPlaying) {
    return;
}
```

### Q: How to handle browser autoplay restrictions?

```typescript
// Start audio on first user interaction
class MainMenu extends Scene {
    create() {
        // Add start button
        const startButton = this.add.text(400, 300, 'Start Game');
        
        startButton.setInteractive();
        startButton.on('pointerdown', () => {
            // Initialize audio after user interaction
            BGMPlayer.getInstance().initialize(this.game);
            this.scene.start('Game');
        });
    }
}
```

### Q: How to support multiple audio formats?

```typescript
// Extend BGMPlayer to support multiple formats
private async loadSound(key: string, urls: string | string[]): Promise<void> {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    
    // Phaser will automatically choose browser-supported format
    this.activeScene!.load.audio(key, urlArray);
}
```

Configuration example:
```json
{
  "bgmList": {
    "menu_theme": {
      "url": [
        "/assets/audio/bgm/menu_theme.ogg",
        "/assets/audio/bgm/menu_theme.mp3"
      ]
    }
  }
}
```

## Performance Optimization

### 1. Memory Management

```typescript
// Clean up when scene is destroyed
destroy(): void {
    const bgmPlayer = BGMPlayer.getInstance();
    
    // Only stop playback, don't destroy instance
    bgmPlayer.stopAll();
    
    // Complete destruction (when game ends)
    // bgmPlayer.destroy();
}
```

### 2. Loading Optimization

- Preload main scene BGM
- Lazy load special scene BGM
- Use smaller audio files
- Consider using audio streaming (Web Audio API)

### 3. Mobile Device Optimization

```typescript
// Detect mobile device and adjust volume
if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
    BGMPlayer.getInstance().setVolume(0.3); // Lower volume on mobile
}
```

## Extension Examples

### Dynamic Music Layers

```typescript
// Adjust music based on game intensity
class DynamicBGMPlayer extends BGMPlayer {
    private layers: Map<string, Phaser.Sound.BaseSound> = new Map();
    
    addMusicLayer(key: string, url: string) {
        // Load and sync multiple tracks
    }
    
    setIntensity(level: number) {
        // Adjust layer volumes based on intensity
        // 0 = base layer only, 1 = all layers
    }
}
```

### Music Beat Synchronization

```typescript
// Music beat event system
class BeatSyncBGMPlayer extends BGMPlayer {
    private bpm: number = 120;
    private beatCallbacks: Function[] = [];
    
    onBeat(callback: Function) {
        this.beatCallbacks.push(callback);
    }
    
    private emitBeat() {
        this.beatCallbacks.forEach(cb => cb());
    }
}
```

## Summary

The BGMPlayer system provides a complete background music management solution:

1. **Automated Management** - Automatic music handling on scene transitions
2. **Configuration-Driven** - Centralized management through JSON config
3. **Smart Loading** - Preload and lazy load strategies
4. **Flexible Control** - Supports manual control and auto-play
5. **Performance Optimized** - Avoids duplicate loading and playback

With proper configuration and usage, you can create a professional music experience for your game.