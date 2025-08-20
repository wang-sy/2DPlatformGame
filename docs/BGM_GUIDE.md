# 背景音乐（BGM）配置指南

## 概述

本项目使用 `BGMPlayer` 单例管理器来处理游戏中的背景音乐。该系统支持：
- 场景自动切换 BGM
- 预加载和延迟加载策略
- 音量控制和淡入淡出
- 循环播放配置
- 场景持续播放（不重复启动）

## 系统架构

### BGMPlayer 单例模式

```typescript
// 获取 BGM 播放器实例
const bgmPlayer = BGMPlayer.getInstance();

// 在游戏启动时初始化（通常在 Boot 或 MainMenu 场景）
bgmPlayer.initialize(game);
```

### 核心功能

1. **自动场景监听** - 监听场景切换自动更换 BGM
2. **配置驱动** - 通过 JSON 配置文件定义场景音乐
3. **智能加载** - 支持预加载和按需加载
4. **状态管理** - 跟踪当前播放状态避免重复

## 配置文件格式

创建 `/assets/audio/bgm-config.json` 文件：

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

### 配置说明

#### scenes 配置
- **场景名称**：必须与 Phaser 场景的 key 完全一致
- **bgm**：引用 bgmList 中定义的音乐键
- **loop**：是否循环播放（默认 true）
- **volume**：音量大小 0.0-1.0（默认 1.0）

#### bgmList 配置
- **音乐键**：BGM 的唯一标识符
- **url**：音乐文件路径（相对于项目根目录）
- **preload**：是否在初始化时预加载（默认 false）

## 集成方式

### 1. 初始化 BGMPlayer

在游戏的入口点或第一个场景中初始化：

```typescript
// 在 main.ts 或 Boot.ts 中
import { BGMPlayer } from './game/managers/BGMPlayer';

const config: Phaser.Types.Core.GameConfig = {
    // ... 其他配置
    scene: [Boot, Preloader, MainMenu, Game, Victory, GameOver],
    callbacks: {
        postBoot: (game) => {
            // 游戏启动后初始化 BGMPlayer
            BGMPlayer.getInstance().initialize(game);
        }
    }
};

const game = new Phaser.Game(config);
```

或者在第一个场景中初始化：

```typescript
// Boot.ts 或 MainMenu.ts
export class Boot extends Scene {
    create() {
        // 初始化 BGMPlayer
        BGMPlayer.getInstance().initialize(this.game);
        
        // 继续其他初始化
        this.scene.start('Preloader');
    }
}
```

### 2. 场景自动切换

BGMPlayer 会自动监听以下场景并切换音乐：
- MainMenu
- Game  
- Victory
- GameOver

系统实现原理：

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

### 3. 手动控制

除了自动切换，也可以手动控制 BGM：

```typescript
const bgmPlayer = BGMPlayer.getInstance();

// 手动切换到指定场景的 BGM
bgmPlayer.changeScene('BossScene');

// 暂停当前 BGM
bgmPlayer.pauseCurrentBGM();

// 恢复播放
bgmPlayer.resumeCurrentBGM();

// 停止所有 BGM
bgmPlayer.stopAll();

// 调整音量（0.0 - 1.0）
bgmPlayer.setVolume(0.3);

// 获取当前播放的 BGM
const currentBGM = bgmPlayer.getCurrentBGM();

// 获取当前场景
const currentScene = bgmPlayer.getCurrentScene();
```

## 高级功能

### 1. 动态 BGM 切换

在游戏过程中根据状态切换 BGM：

```typescript
// Game.ts
export class Game extends Scene {
    private bgmPlayer: BGMPlayer;
    
    create() {
        this.bgmPlayer = BGMPlayer.getInstance();
    }
    
    enterBossArea() {
        // 手动切换到 Boss 战斗音乐
        this.bgmPlayer.changeScene('BossBattle');
    }
    
    exitBossArea() {
        // 切换回普通关卡音乐
        this.bgmPlayer.changeScene('Game');
    }
}
```

### 2. 音量淡入淡出

```typescript
// 创建淡出效果
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

// 创建淡入效果
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

### 3. 条件 BGM 配置

根据游戏进度或玩家状态播放不同 BGM：

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
// 在游戏中切换备选 BGM
class Game extends Scene {
    switchToUnderwaterMusic() {
        // 需要扩展 BGMPlayer 支持此功能
        this.bgmPlayer.playAlternate('underwater');
    }
}
```

## 文件组织结构

```
assets/
└── audio/
    ├── bgm-config.json         # BGM 配置文件
    ├── bgm/                    # 背景音乐文件
    │   ├── menu_theme.mp3
    │   ├── level_music.mp3
    │   ├── boss_battle.mp3
    │   ├── victory.mp3
    │   └── game_over.mp3
    └── sound_effect/           # 音效文件目录
        └── ...
```

## 最佳实践

### 1. 音乐文件优化

- **格式选择**：使用 MP3 或 OGG 格式
- **比特率**：128kbps 通常足够
- **文件大小**：控制在 1-3MB 以内
- **循环点**：确保循环音乐有平滑的循环点

### 2. 预加载策略

```json
{
  "bgmList": {
    "menu_theme": {
      "url": "/assets/audio/bgm/menu_theme.mp3",
      "preload": true  // 常用音乐预加载
    },
    "secret_level": {
      "url": "/assets/audio/bgm/secret.mp3",
      "preload": false // 特殊音乐延迟加载
    }
  }
}
```

### 3. 音量平衡

| 场景类型 | 推荐音量 | 说明 |
|---------|---------|------|
| 主菜单 | 0.6-0.7 | 较高音量吸引注意 |
| 游戏关卡 | 0.4-0.5 | 适中音量不干扰游戏 |
| Boss 战斗 | 0.6-0.7 | 提高紧张感 |
| 胜利 | 0.7-0.8 | 庆祝性质可以响亮 |
| 游戏结束 | 0.4-0.5 | 安静的结束音乐 |

### 4. 场景过渡处理

```typescript
// 平滑的场景过渡
class Game extends Scene {
    victory() {
        // 淡出当前 BGM
        this.cameras.main.fadeOut(500);
        
        this.time.delayedCall(500, () => {
            // BGMPlayer 会自动处理场景切换
            this.scene.start('Victory');
        });
    }
}
```

## 调试功能

### 控制台日志

BGMPlayer 提供详细的调试信息：

```
BGMPlayer: BGM config loaded successfully
BGMPlayer: Preloaded sound "menu_theme"
BGMPlayer: Scene changed to MainMenu
BGMPlayer: Playing BGM: menu_theme
BGMPlayer: Stopped BGM: menu_theme
```

### 调试方法

```typescript
// 在浏览器控制台中调试
const bgm = BGMPlayer.getInstance();

// 查看当前状态
console.log('Current BGM:', bgm.getCurrentBGM());
console.log('Current Scene:', bgm.getCurrentScene());

// 手动控制
bgm.stopAll();
bgm.changeScene('Game');
bgm.setVolume(0.3);
```

## 常见问题

### Q: BGM 没有播放？

检查清单：
1. 配置文件路径是否正确（`/assets/audio/bgm-config.json`）
2. 音乐文件路径是否正确
3. 场景名称是否与配置中一致
4. 浏览器是否需要用户交互才能播放音频
5. 检查控制台是否有错误信息

### Q: 场景切换时音乐重复播放？

系统已经处理了这种情况：
```typescript
// 相同 BGM 不会重复播放
if (this.currentBGM === bgmKey && this.currentBGMSound?.isPlaying) {
    return;
}
```

### Q: 如何处理浏览器自动播放限制？

```typescript
// 在用户第一次交互时启动音频
class MainMenu extends Scene {
    create() {
        // 添加开始按钮
        const startButton = this.add.text(400, 300, 'Start Game');
        
        startButton.setInteractive();
        startButton.on('pointerdown', () => {
            // 用户交互后初始化音频
            BGMPlayer.getInstance().initialize(this.game);
            this.scene.start('Game');
        });
    }
}
```

### Q: 如何支持多种音频格式？

```typescript
// 扩展 BGMPlayer 支持多格式
private async loadSound(key: string, urls: string | string[]): Promise<void> {
    const urlArray = Array.isArray(urls) ? urls : [urls];
    
    // Phaser 会自动选择浏览器支持的格式
    this.activeScene!.load.audio(key, urlArray);
}
```

配置示例：
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

## 性能优化

### 1. 内存管理

```typescript
// 场景销毁时清理
destroy(): void {
    const bgmPlayer = BGMPlayer.getInstance();
    
    // 只停止播放，不销毁实例
    bgmPlayer.stopAll();
    
    // 完全销毁（游戏结束时）
    // bgmPlayer.destroy();
}
```

### 2. 加载优化

- 预加载主要场景的 BGM
- 特殊场景的 BGM 延迟加载
- 使用较小的音频文件
- 考虑使用音频流（Web Audio API）

### 3. 移动设备优化

```typescript
// 检测移动设备并调整音量
if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
    BGMPlayer.getInstance().setVolume(0.3); // 移动设备降低音量
}
```

## 扩展功能示例

### 动态音乐层次

```typescript
// 根据游戏强度调整音乐
class DynamicBGMPlayer extends BGMPlayer {
    private layers: Map<string, Phaser.Sound.BaseSound> = new Map();
    
    addMusicLayer(key: string, url: string) {
        // 加载并同步播放多个音轨
    }
    
    setIntensity(level: number) {
        // 根据强度调整各层音量
        // 0 = 只有基础层，1 = 所有层
    }
}
```

### 音乐节拍同步

```typescript
// 音乐节拍事件系统
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

## 总结

BGMPlayer 系统提供了完整的背景音乐管理方案：

1. **自动化管理** - 场景切换自动处理音乐
2. **配置驱动** - JSON 配置文件集中管理
3. **智能加载** - 预加载和延迟加载策略
4. **灵活控制** - 支持手动控制和自动播放
5. **性能优化** - 避免重复加载和播放

通过正确配置和使用，可以为游戏创建专业的音乐体验。