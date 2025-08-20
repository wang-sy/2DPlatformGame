# 音效系统配置指南

## 概述

本项目的音效系统通过 `SoundEffectPlayer` 单例管理，支持为不同的精灵（Sprite）和动画配置多个音效。音效会在动画播放时自动触发，也可以手动调用播放。

## 系统架构

### 核心组件

1. **SoundEffectPlayer** - 音效播放器单例
   - 管理所有音效的加载和播放
   - 支持随机播放多个音效变体
   - 提供音量控制功能

2. **配置文件** - `public/assets/audio/sound_effect/config.json`
   - JSON 格式配置音效映射
   - 支持多个精灵和动画的音效配置

3. **集成方式**
   - Player 和 Enemy 类中自动集成
   - 在动画播放时自动触发对应音效

## 配置文件结构

### 基本格式

```json
{
  "精灵名称": {
    "动画名称": [
      {
        "key": "音效唯一标识",
        "uri": "音效文件路径"
      }
    ]
  }
}
```

### 字段说明

- **精灵名称**：对应 Tiled 地图编辑器中的对象名称（如 `main_player`、`enemy`）
- **动画名称**：对应动画的名称（如 `idle`、`walk`、`jump` 等）
- **key**：音效的唯一标识符，用于缓存管理
- **uri**：音效文件的相对路径

### 完整示例

```json
{
  "main_player": {
    "idle": [
      {
        "key": "player_idle_select",
        "uri": "assets/audio/sound_effect/sfx_select.mp3"
      }
    ],
    "walk": [
      {
        "key": "player_walk_1",
        "uri": "assets/audio/sound_effect/sfx_bump.mp3"
      },
      {
        "key": "player_walk_2",
        "uri": "assets/audio/sound_effect/sfx_select.mp3"
      }
    ],
    "jump": [
      {
        "key": "player_jump",
        "uri": "assets/audio/sound_effect/sfx_jump.mp3"
      },
      {
        "key": "player_jump_high",
        "uri": "assets/audio/sound_effect/sfx_jump-high.mp3"
      }
    ],
    "hit": [
      {
        "key": "player_hurt",
        "uri": "assets/audio/sound_effect/sfx_hurt.mp3"
      }
    ],
    "die": [
      {
        "key": "player_die",
        "uri": "assets/audio/sound_effect/sfx_disappear.mp3"
      }
    ]
  },
  "enemy": {
    "jump": [],
    "die": [
      {
        "key": "enemy_die",
        "uri": "assets/audio/sound_effect/sfx_disappear.mp3"
      }
    ]
  }
}
```

## 音效播放机制

### 自动播放

在 Player 和 Enemy 类中，音效会在以下情况自动播放：

1. **动画切换时**
   - 当调用 `playAnimation()` 方法切换动画时
   - 系统会检查是否有对应的音效配置
   - 如果有配置，自动播放音效

2. **特定动作时**
   - 跳跃、受击、死亡等特殊动作
   - 可以额外调用音效播放，实现叠加效果

### 音量控制

不同场景下使用不同的音量设置：

| 角色 | 动作 | 音量 | 说明 |
|------|------|------|------|
| Player | 默认动画 | 1.0 | 标准音量 |
| Player | 跳跃 | 0.7 | 稍微降低避免过响 |
| Player | 受击/死亡 | 1.0 | 标准音量，需要明显 |
| Enemy | 默认动画 | 0.4 | 降低音量避免干扰 |
| Enemy | 跳跃 | 0.3 | 更低音量 |
| Enemy | 死亡 | 0.6 | 适中音量 |

### 随机音效

当一个动画配置了多个音效时，系统会随机选择一个播放：

```json
"walk": [
  { "key": "walk_1", "uri": "sfx_walk1.mp3" },
  { "key": "walk_2", "uri": "sfx_walk2.mp3" },
  { "key": "walk_3", "uri": "sfx_walk3.mp3" }
]
```

## 代码集成示例

### Player 类集成

```typescript
export class Player extends Phaser.Physics.Arcade.Sprite {
    private soundEffectPlayer: SoundEffectPlayer;
    
    constructor(scene: Phaser.Scene, tiledObject: Phaser.Types.Tilemaps.TiledObject) {
        // ... 其他初始化代码
        this.soundEffectPlayer = SoundEffectPlayer.getInstance();
    }
    
    private playAnimation(animName: string): void {
        const animKey = this.animationManager.getAnimationKey(this.key, animName);
        if (this.animationManager.hasAnimation(this.key, animName)) {
            if (this.currentAnimation !== animKey) {
                this.play(animKey);
                this.currentAnimation = animKey;
                
                // 自动播放对应音效
                if (this.soundEffectPlayer.hasAnimationSound(this.key, animName)) {
                    this.soundEffectPlayer.playAnimationSound(this.key, animName);
                }
            }
        }
    }
    
    // 特定动作的额外音效
    private handleJump(): void {
        this.playAnimation('jump');
        // 额外播放跳跃音效，自定义音量
        if (this.soundEffectPlayer.hasAnimationSound(this.key, 'jump')) {
            this.soundEffectPlayer.playAnimationSound(this.key, 'jump', 0.7);
        }
    }
}
```

### Enemy 类集成

```typescript
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private soundEffectPlayer: SoundEffectPlayer;
    
    constructor(scene: Scene, enemyObject: Phaser.Types.Tilemaps.TiledObject) {
        // ... 其他初始化代码
        this.soundEffectPlayer = SoundEffectPlayer.getInstance();
    }
    
    private playAnimation(animType: string): void {
        // ... 动画播放逻辑
        
        // 播放音效（Enemy 音量较小）
        if (this.soundEffectPlayer.hasAnimationSound(this.enemyName, fallbackAnim)) {
            this.soundEffectPlayer.playAnimationSound(this.enemyName, fallbackAnim, 0.4);
        }
    }
    
    takeDamage(_damage: number): void {
        // 优先播放死亡音效，如果没有则播放受击音效
        if (this.soundEffectPlayer.hasAnimationSound(this.enemyName, 'die')) {
            this.soundEffectPlayer.playAnimationSound(this.enemyName, 'die', 0.6);
        } else if (this.soundEffectPlayer.hasAnimationSound(this.enemyName, 'hit')) {
            this.soundEffectPlayer.playAnimationSound(this.enemyName, 'hit', 0.6);
        }
        
        // ... 死亡效果处理
    }
}
```

## 添加新音效的步骤

1. **准备音效文件**
   - 将音效文件（mp3/ogg/wav）放入 `public/assets/audio/sound_effect/` 目录
   - 建议使用描述性的文件名，如 `sfx_player_attack.mp3`

2. **更新配置文件**
   - 编辑 `public/assets/audio/sound_effect/config.json`
   - 在对应的精灵和动画下添加音效配置

3. **测试音效**
   - 运行游戏，触发对应的动画
   - 检查控制台日志确认音效加载和播放

## 调试技巧

### 控制台日志

SoundEffectPlayer 会输出详细的调试信息：

```
[SoundEffectPlayer] Loading config from: assets/audio/sound_effect/config.json
[SoundEffectPlayer] Config loaded successfully
[SoundEffectPlayer] Mapped main_player_jump -> 2 sound(s)
[SoundEffectPlayer] Playing sound: player_jump at volume: 0.7
```

### 常见问题

1. **音效不播放**
   - 检查配置文件中的精灵名称是否与代码中的 `this.key` 或 `this.enemyName` 匹配
   - 确认音效文件路径正确
   - 查看控制台是否有错误信息

2. **音效重复播放**
   - 系统已通过检查 `currentAnimation` 避免重复
   - 如果仍有问题，检查是否在多处调用了 `playAnimation`

3. **音量调整**
   - 使用 `setGlobalVolume()` 调整全局音量
   - 在播放时传入音量参数进行个别调整

## 最佳实践

1. **音效文件命名**
   - 使用描述性名称：`sfx_[角色]_[动作].mp3`
   - 例如：`sfx_player_jump.mp3`、`sfx_enemy_die.mp3`

2. **音效变体**
   - 为常见动作（如行走、攻击）配置多个音效变体
   - 避免重复感，提升游戏体验

3. **音量平衡**
   - 玩家音效相对较大（0.7-1.0）
   - 敌人音效相对较小（0.3-0.6）
   - 环境音效更小（0.2-0.4）

4. **性能优化**
   - 音效文件控制在合理大小（建议 < 100KB）
   - 使用压缩格式（mp3/ogg）
   - 避免同时播放过多音效

## 扩展功能

### 支持的高级功能

1. **条件播放**
   ```typescript
   if (this.soundEffectPlayer.hasAnimationSound(atlasKey, animName)) {
       this.soundEffectPlayer.playAnimationSound(atlasKey, animName);
   }
   ```

2. **手动播放特定音效**
   ```typescript
   this.soundEffectPlayer.playSound('specific_sound_key', 0.5);
   ```

3. **停止音效**
   ```typescript
   this.soundEffectPlayer.stopSound('sound_key');
   this.soundEffectPlayer.stopAllSounds();
   ```

4. **音量控制**
   ```typescript
   this.soundEffectPlayer.setVolume('sound_key', 0.8);
   this.soundEffectPlayer.setGlobalVolume(0.5);
   ```

## 总结

音效系统通过配置文件和代码集成，实现了灵活且易于维护的音效管理。开发者只需要：

1. 在配置文件中定义音效映射
2. 在精灵类中初始化 SoundEffectPlayer
3. 在合适的时机调用播放方法

系统会自动处理音效的加载、缓存和播放，支持随机变体和音量控制，大大提升了游戏的听觉体验。