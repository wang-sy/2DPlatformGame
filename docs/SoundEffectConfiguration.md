# 音效配置指南

## 概述

本项目使用 `SoundEffectPlayer` 管理器来处理游戏中的所有音效。该系统支持：
- 基于动画自动播放音效
- 随机音效选择（一个动画可配置多个音效）
- 延迟加载和预加载策略
- 全局音量控制

## 系统架构

### SoundEffectPlayer 单例模式

```typescript
// 获取音效播放器实例
const soundEffectPlayer = SoundEffectPlayer.getInstance();

// 在 Preloader 场景中初始化
soundEffectPlayer.init(scene);
await soundEffectPlayer.loadConfig();
soundEffectPlayer.preloadSounds();
```

### 核心功能

1. **配置加载**：从 JSON 文件读取音效配置
2. **音效预加载**：在游戏开始前加载所有音效资源
3. **动画关联**：将音效与精灵图集的动画关联
4. **随机播放**：从多个音效中随机选择播放

## 配置文件格式

创建 `assets/audio/sound_effect/config.json` 文件：

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

### 配置说明

- **第一层键**：精灵图集名称（如 `player`、`enemy`）- 必须与 Tiled 地图中的对象名称一致
- **第二层键**：动画名称（如 `jump`、`hit`、`walk`）
- **音效数组**：每个动画可配置多个音效
  - `key`：音效的唯一标识符
  - `uri`：音效文件路径

## 在精灵类中使用

### Player.ts 实现示例

```typescript
import { SoundEffectPlayer } from '../managers/SoundEffectPlayer';

export class Player extends Phaser.Physics.Arcade.Sprite {
    private soundEffectPlayer: SoundEffectPlayer;
    private key: string = ''; // 从 Tiled 对象获取的精灵名称
    
    constructor(scene: Phaser.Scene, tiledObject: Phaser.Types.Tilemaps.TiledObject) {
        let key = tiledObject.name; // 使用 Tiled 对象的名称作为键
        super(scene, x, y, key);
        
        this.key = key;
        this.soundEffectPlayer = SoundEffectPlayer.getInstance();
    }
    
    private playAnimation(animName: string): void {
        const animKey = this.animationManager.getAnimationKey(this.key, animName);
        if (this.currentAnimation !== animKey) {
            this.play(animKey);
            this.currentAnimation = animKey;
            
            // 自动播放对应音效
            if (this.soundEffectPlayer.hasAnimationSound(this.key, animName)) {
                this.soundEffectPlayer.playAnimationSound(this.key, animName);
            }
        }
    }
    
    // 跳跃时的特殊音效处理
    update(): void {
        if (justPressedUp && !this.isCharging) {
            // 播放跳跃音效（音量略低）
            if (this.soundEffectPlayer.hasAnimationSound(this.key, 'jump')) {
                this.soundEffectPlayer.playAnimationSound(this.key, 'jump', 0.7);
            }
        }
    }
    
    // 受伤音效
    takeDamage(damage: number): void {
        this.playAnimation('hit');
        // 音效已在 playAnimation 中自动播放
    }
    
    // 死亡音效
    private handleDeath(): void {
        if (this.soundEffectPlayer.hasAnimationSound(this.key, 'die')) {
            this.soundEffectPlayer.playAnimationSound(this.key, 'die');
        }
    }
}
```

### Enemy.ts 实现示例

```typescript
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private soundEffectPlayer: SoundEffectPlayer;
    private enemyName: string;
    
    constructor(scene: Scene, enemyObject: Phaser.Types.Tilemaps.TiledObject) {
        this.enemyName = enemyObject.name || 'enemy';
        this.soundEffectPlayer = SoundEffectPlayer.getInstance();
    }
    
    takeDamage(damage: number): void {
        // 播放死亡音效
        if (this.soundEffectPlayer.hasAnimationSound(this.enemyName, 'die')) {
            this.soundEffectPlayer.playAnimationSound(this.enemyName, 'die', 0.6);
        }
        this.destroy();
    }
}
```

## 音效管理最佳实践

### 1. 文件组织结构

```
assets/
└── audio/
    ├── bgm-config.json         # BGM 配置文件
    └── sound_effect/
        ├── config.json          # 音效配置文件
        ├── player/             # 玩家音效
        │   ├── jump_1.mp3
        │   ├── jump_2.mp3
        │   ├── hit.mp3
        │   └── death.mp3
        ├── enemy/              # 敌人音效
        │   ├── attack.mp3
        │   └── defeat.mp3
        └── items/              # 物品音效
            ├── coin.mp3
            └── powerup.mp3
```

### 2. 命名规范

- 音效键名：`{角色类型}_{动作}_{序号}`
  - 例如：`player_jump_1`、`enemy_attack`
- 文件名：简洁描述性命名
  - 例如：`jump_1.mp3`、`hit.mp3`

### 3. 音量控制策略

| 角色类型 | 动作 | 推荐音量 | 说明 |
|---------|------|---------|------|
| Player | 默认 | 1.0 | 标准音量 |
| Player | 跳跃 | 0.7 | 降低避免过响 |
| Player | 受击/死亡 | 1.0 | 需要明显 |
| Enemy | 默认 | 0.4 | 避免干扰 |
| Enemy | 死亡 | 0.6 | 适中音量 |
| Items | 收集 | 0.8 | 清晰但不刺耳 |

```typescript
// 播放时指定音量（0.0 - 1.0）
soundEffectPlayer.playAnimationSound('player', 'jump', 0.5);

// 全局音量控制
soundEffectPlayer.setGlobalVolume(0.8);

// 单个音效音量调整
soundEffectPlayer.setVolume('player_jump_1', 0.6);
```

### 4. 性能优化建议

1. **预加载策略**
   ```typescript
   // 在 Preloader.ts 中
   async preload() {
       // 初始化并加载配置
       this.soundEffectPlayer.init(this);
       await this.soundEffectPlayer.loadConfig();
       
       // 预加载所有音效
       this.soundEffectPlayer.preloadSounds();
   }
   
   create() {
       // 音效加载完成后初始化
       this.soundEffectPlayer.onSoundsLoaded();
   }
   ```

2. **音效复用**
   - 相似动作可共用音效（如不同敌人的受击音效）
   - 使用音效池避免重复创建

3. **内存管理**
   ```typescript
   // 场景切换时清理音效
   destroy(): void {
       this.soundEffectPlayer.stopAllSounds();
       this.soundEffectPlayer.clear();
   }
   ```

## 调试功能

### 控制台日志输出

SoundEffectPlayer 提供详细的调试信息：

```
[SoundEffectPlayer] Initializing with scene: Preloader
[SoundEffectPlayer] Loading config from: assets/audio/sound_effect/config.json
[SoundEffectPlayer] Config loaded successfully
[SoundEffectPlayer] Atlas keys: ['player', 'enemy']
[SoundEffectPlayer] Mapped player_jump -> 2 sound(s)
[SoundEffectPlayer] Playing sound: player_jump_1 at volume: 0.5
```

### 常用调试方法

```typescript
// 获取已加载的音效列表
const loadedSounds = soundEffectPlayer.getLoadedSounds();
console.log('Loaded sounds:', loadedSounds);

// 获取音效配置
const config = soundEffectPlayer.getSoundConfig();
console.log('Sound config:', config);

// 检查动画是否有关联音效
const hasSound = soundEffectPlayer.hasAnimationSound('player', 'jump');
console.log('Player jump has sound:', hasSound);
```

## 高级功能

### 1. 条件音效播放

```typescript
// 根据游戏状态播放不同音效
if (player.isUnderwater) {
    soundEffectPlayer.playSound('underwater_jump', 0.6);
} else {
    soundEffectPlayer.playAnimationSound('player', 'jump', 0.8);
}
```

### 2. 音效链

```typescript
// 连续播放多个音效
soundEffectPlayer.playSound('powerup_collect', 0.7);
scene.time.delayedCall(200, () => {
    soundEffectPlayer.playSound('powerup_activate', 0.8);
});
```

### 3. 随机音效变体

配置多个音效后系统会自动随机选择：

```json
"walk": [
    { "key": "step_grass_1", "uri": "step_grass_1.mp3" },
    { "key": "step_grass_2", "uri": "step_grass_2.mp3" },
    { "key": "step_grass_3", "uri": "step_grass_3.mp3" }
]
```

## 常见问题解决

### Q: 音效没有播放？

检查清单：
1. 配置文件中的精灵名称是否与 Tiled 对象名称一致
2. 音效文件路径是否正确（相对于项目根目录）
3. 控制台是否有加载错误
4. 浏览器是否静音或需要用户交互才能播放音频

### Q: 音效延迟？

解决方案：
1. 确保在 Preloader 场景预加载
2. 使用较小的音频文件（建议 < 100KB）
3. 使用 MP3 或 OGG 格式
4. 考虑使用音频精灵图（Audio Sprites）

### Q: 音效重复播放？

系统通过检查 `currentAnimation` 避免重复，如果仍有问题：
1. 检查是否在多处调用了 `playAnimation`
2. 确认动画切换逻辑是否正确

### Q: 如何支持多平台？

```javascript
// 在 Preloader 中提供多种格式
this.load.audio('jump', [
    'assets/audio/jump.ogg',
    'assets/audio/jump.mp3'
]);
```

## 集成流程总结

1. **创建配置文件** - 在 `assets/audio/sound_effect/config.json` 定义音效映射
2. **准备音效资源** - 将音效文件放入对应目录
3. **初始化系统** - 在 Preloader 场景初始化 SoundEffectPlayer
4. **精灵集成** - 在精灵类中调用音效播放方法
5. **测试调试** - 使用控制台日志确认音效正常工作

通过这个系统，你可以轻松管理游戏中的所有音效，实现丰富的听觉体验。