# 代码结构指南

## 项目概述

这是一个基于 Phaser 3 和 TypeScript 的游戏项目，使用 Vite 作为构建工具。项目采用面向对象的设计模式，通过管理器模式、单例模式等设计模式实现了模块化和可维护的代码结构。

## 目录结构

```
template-vite-ts/
├── src/
│   ├── main.ts                    # 应用入口
│   ├── vite-env.d.ts             # Vite 类型定义
│   └── game/
│       ├── main.ts                # 游戏配置和初始化
│       ├── managers/              # 管理器类（单例模式）
│       │   ├── AnimationManager.ts
│       │   ├── BGMPlayer.ts
│       │   ├── CollectedItemsManager.ts
│       │   └── SoundEffectPlayer.ts
│       ├── scenes/                # 游戏场景
│       │   ├── Boot.ts
│       │   ├── Preloader.ts
│       │   ├── MainMenu.ts
│       │   ├── Game.ts
│       │   ├── Victory.ts
│       │   └── GameOver.ts
│       ├── sprites/               # 游戏精灵类
│       │   ├── Player.ts
│       │   ├── Enemy.ts
│       │   ├── Collectible.ts
│       │   ├── StaticHazard.ts
│       │   └── Goal.ts
│       └── ui/                    # UI 组件
│           └── HealthUI.ts
├── public/                        # 静态资源
│   └── assets/
│       ├── tilemap/              # Tiled 地图文件
│       ├── audio/                # 音频资源
│       └── ...                   # 其他资源
├── vite/                         # Vite 配置
│   ├── config.dev.mjs
│   └── config.prod.mjs
└── docs/                         # 文档
    ├── SoundEffectConfiguration.md
    ├── TILEMAP_GUIDE.md
    ├── BGM_GUIDE.md
    └── CODE_STRUCTURE.md
```

## 核心架构

### 1. 游戏初始化流程

```
main.ts → game/main.ts → Boot → Preloader → MainMenu → Game → Victory/GameOver
```

#### src/main.ts
应用的入口点，简单导入游戏主文件：
```typescript
import './game/main';
```

#### src/game/main.ts
游戏配置和 Phaser 实例创建：
```typescript
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [Boot, Preloader, MainMenu, Game, GameOver, Victory]
};

export default new Phaser.Game(config);
```

### 2. 场景系统

#### Boot.ts
- 初始化基础资源
- 加载启动画面资源
- 初始化 BGMPlayer

```typescript
export class Boot extends Scene {
    constructor() {
        super('Boot');
    }

    preload() {
        // 加载启动资源
        this.load.image('background', 'assets/bg.png');
    }

    create() {
        // 初始化 BGMPlayer
        BGMPlayer.getInstance().initialize(this.game);
        // 跳转到预加载场景
        this.scene.start('Preloader');
    }
}
```

#### Preloader.ts
- 自动解析和加载 Tilemap 资源
- 加载图集和动画配置
- 初始化音效系统
- 创建所有动画

关键功能：
1. **自动资源加载**：解析 tilemap.json，自动加载所有引用的资源
2. **图集识别**：通过 `atlas` 属性区分图集和普通图片
3. **动画配置**：自动加载 `_animators.json` 文件

```typescript
private loadAllAssets() {
    let tilemapJsonObj = JSON.parse(tilemapJsonRaw);
    let tilesets = tilemapJsonObj["tilesets"];
    
    tilesets.forEach((tileset: any) => {
        // 检查是否为图集
        if (isAtlas) {
            // 加载图集和动画配置
            this.load.atlas(name, imageUri, atlasJsonUri);
            this.load.json(`${name}_animations`, animationConfigUri);
        } else {
            // 加载普通图片
            this.load.image(name, imageUri);
        }
    });
}
```

#### Game.ts
- 解析 Tilemap 创建游戏世界
- 管理游戏逻辑和碰撞检测
- 处理玩家输入和游戏状态

核心功能：
1. **Tilemap 解析**：创建图层和对象
2. **对象工厂**：根据类型创建不同游戏对象
3. **碰撞管理**：设置物理碰撞和重叠检测
4. **游戏流程**：处理胜利、失败条件

```typescript
private createObject(obj: Phaser.Types.Tilemaps.TiledObject) {
    switch (obj.type) {
        case "player":
            this.createPlayerFromTilemap(obj);
            break;
        case "enemy":
            this.createEnemyFromTilemap(obj);
            break;
        case "collectible":
            this.createCollectibleFromTilemap(obj);
            break;
        // ...
    }
}
```

### 3. 管理器系统（Managers）

#### AnimationManager（动画管理器）
**设计模式**：单例模式
**职责**：集中管理所有精灵动画的创建和播放

核心功能：
- 加载动画配置（支持新旧格式）
- 批量创建动画
- 提供统一的动画播放接口

```typescript
export class AnimationManager {
    private static instance: AnimationManager;
    private atlasAnimations: Map<string, AnimationConfig[]> = new Map();
    
    static getInstance(): AnimationManager {
        if (!AnimationManager.instance) {
            AnimationManager.instance = new AnimationManager();
        }
        return AnimationManager.instance;
    }
    
    // 创建动画
    createAnimationsForAtlas(atlasKey: string): void
    
    // 播放动画
    playAnimation(sprite: Sprite, atlasKey: string, animationName: string): void
}
```

#### BGMPlayer（背景音乐播放器）
**设计模式**：单例模式
**职责**：管理游戏背景音乐的播放

核心功能：
- 自动监听场景切换
- 基于配置文件播放对应音乐
- 预加载和延迟加载策略
- 防止重复播放

```typescript
export class BGMPlayer {
    private static instance: BGMPlayer;
    private bgmConfig: BGMConfig | null = null;
    private currentBGM: string | null = null;
    
    public initialize(game: Phaser.Game): void
    private checkSceneChange(): void
    private onSceneChange(sceneName: string): void
    public setVolume(volume: number): void
}
```

#### SoundEffectPlayer（音效播放器）
**设计模式**：单例模式
**职责**：管理游戏音效的播放

核心功能：
- 动画-音效自动关联
- 随机音效选择
- 音效预加载管理
- 全局音量控制

```typescript
export class SoundEffectPlayer {
    private static instance: SoundEffectPlayer;
    private soundEffectConfig: SoundEffectConfig = {};
    private animationToSounds: Map<string, SoundEffect[]> = new Map();
    
    async loadConfig(configPath: string): Promise<void>
    playAnimationSound(atlasKey: string, animationName: string, volume?: number): void
    setGlobalVolume(volume: number): void
}
```

#### CollectedItemsManager（收集物管理器）
**设计模式**：普通类（每个 Game 场景实例化）
**职责**：跟踪玩家收集的物品

核心功能：
- 记录收集的物品
- 计算总分
- 跟踪必须收集的物品
- 生成统计数据

```typescript
export class CollectedItemsManager {
    private collectedItems: CollectedItem[] = [];
    private mustCollectItems: Set<string> = new Set();
    
    collectItem(name: string, type: string, score: number, mustCollect: boolean): void
    hasCollectedAllRequired(): boolean
    getTotalScore(): number
    getSummaryData(): CollectionSummary
}
```

### 4. 精灵系统（Sprites）

#### Player（玩家类）
**继承**：`Phaser.Physics.Arcade.Sprite`
**特性**：
- 多种移动能力（双跳、墙跳、蓄力跳）
- 动画状态管理
- 生命值系统
- 音效集成

核心机制：
```typescript
export class Player extends Phaser.Physics.Arcade.Sprite {
    // 移动能力
    private jumpCount: number = 0;
    private maxJumps: number = 2;
    private isTouchingWall: boolean = false;
    private isCharging: boolean = false;
    
    // 状态管理
    private health: number = 3;
    private isInvulnerable: boolean = false;
    
    // 动画和音效
    private animationManager: AnimationManager;
    private soundEffectPlayer: SoundEffectPlayer;
    
    update(): void {
        // 处理输入
        // 更新动画
        // 播放音效
    }
}
```

#### Enemy（敌人类）
**继承**：`Phaser.Physics.Arcade.Sprite`
**特性**：
- 巡逻 AI
- 可配置属性（速度、范围、伤害）
- 动画系统
- 被击败机制

```typescript
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private moveSpeed: number;
    private moveRange: number;
    private patrolBehavior: 'horizontal' | 'vertical' | 'static';
    
    constructor(scene: Scene, enemyObject: Phaser.Types.Tilemaps.TiledObject) {
        // 从 Tiled 对象读取属性
        const properties = enemyObject.properties;
        this.moveSpeed = properties.moveSpeed || 50;
        this.moveRange = properties.moveRange || 100;
    }
    
    update(): void {
        // 执行巡逻逻辑
    }
}
```

#### Collectible（收集物类）
**继承**：`Phaser.Physics.Arcade.Sprite`
**特性**：
- 收集效果（缩放、旋转、淡出）
- 分数系统
- 必须收集标记

```typescript
export class Collectible extends Phaser.Physics.Arcade.Sprite {
    private score: number;
    private itemType: string;
    private mustCollect: boolean;
    
    collect(): void {
        // 播放收集动画
        // 标记为已收集
        // 销毁对象
    }
}
```

### 5. UI 系统

#### HealthUI（生命值 UI）
显示玩家生命值的 UI 组件：

```typescript
export class HealthUI extends Phaser.GameObjects.Container {
    private hearts: Phaser.GameObjects.Image[] = [];
    
    updateHealth(currentHealth: number): void {
        // 更新心形图标显示
        // 添加动画效果
    }
}
```

## 设计模式

### 1. 单例模式（Singleton）
用于全局管理器：
- AnimationManager
- BGMPlayer
- SoundEffectPlayer

优点：
- 全局访问点
- 避免重复实例化
- 状态共享

### 2. 工厂模式（Factory）
Game.ts 中的对象创建：

```typescript
private createObject(obj: TiledObject) {
    switch (obj.type) {
        case "player": return new Player(this, obj);
        case "enemy": return new Enemy(this, obj);
        // ...
    }
}
```

### 3. 观察者模式（Observer）
场景事件系统：

```typescript
// BGMPlayer 监听场景变化
this.game.events.on('step', () => {
    this.checkSceneChange();
});
```

### 4. 策略模式（Strategy）
敌人的不同巡逻行为：

```typescript
switch (this.patrolBehavior) {
    case 'horizontal':
        this.horizontalPatrol();
        break;
    case 'vertical':
        this.verticalPatrol();
        break;
}
```

## 数据流

### 1. 配置驱动
所有主要系统都通过 JSON 配置文件驱动：

```
tilemap.json → 地图和对象配置
bgm-config.json → 背景音乐配置
sound_effect/config.json → 音效配置
*_animators.json → 动画配置
```

### 2. 资源加载流程

```
Preloader.preload()
    ↓
解析 tilemap.json
    ↓
识别资源类型（图集/图片）
    ↓
加载对应资源
    ↓
Preloader.create()
    ↓
创建动画
    ↓
初始化音效
```

### 3. 游戏循环

```
Game.update()
    ↓
Player.update() → 处理输入
    ↓
Enemy.update() → AI 逻辑
    ↓
碰撞检测
    ↓
UI 更新
```

## 扩展指南

### 添加新场景

1. 创建场景类：
```typescript
// src/game/scenes/NewScene.ts
export class NewScene extends Scene {
    constructor() {
        super('NewScene');
    }
    
    preload() { }
    create() { }
    update() { }
}
```

2. 注册场景：
```typescript
// src/game/main.ts
scene: [..., NewScene]
```

3. 配置 BGM（可选）：
```json
// bgm-config.json
"scenes": {
    "NewScene": {
        "bgm": "new_scene_music"
    }
}
```

### 添加新精灵类型

1. 创建精灵类：
```typescript
// src/game/sprites/NewSprite.ts
export class NewSprite extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Scene, obj: TiledObject) {
        super(scene, obj.x, obj.y, obj.name);
        // 初始化
    }
}
```

2. 在 Game.ts 中注册：
```typescript
private createObject(obj: TiledObject) {
    switch (obj.type) {
        case "new_sprite":
            return new NewSprite(this, obj);
    }
}
```

### 添加新管理器

1. 创建管理器类：
```typescript
// src/game/managers/NewManager.ts
export class NewManager {
    private static instance: NewManager;
    
    static getInstance(): NewManager {
        if (!NewManager.instance) {
            NewManager.instance = new NewManager();
        }
        return NewManager.instance;
    }
}
```

2. 在需要的地方初始化：
```typescript
// Preloader.ts 或 Boot.ts
NewManager.getInstance().init(this);
```

## 最佳实践

### 1. 类型安全
始终使用 TypeScript 的类型系统：

```typescript
// 好的做法
private health: number = 100;
private moveSpeed: number;

// 避免
private health = 100; // any 类型
```

### 2. 资源管理
- 在 Preloader 中集中加载资源
- 使用配置文件管理资源路径
- 场景切换时清理不需要的资源

### 3. 性能优化
- 使用对象池管理频繁创建/销毁的对象
- 合理设置物理碰撞体大小
- 使用图集减少 Draw Calls

### 4. 代码组织
- 每个类一个文件
- 相关功能放在同一目录
- 使用清晰的命名规范

## 调试技巧

### 1. 物理调试
```typescript
// 在 Game config 中启用
physics: {
    arcade: {
        debug: true
    }
}
```

### 2. 控制台日志
各管理器都有详细的日志输出：
```typescript
console.log('[SoundEffectPlayer]', message);
console.log('BGMPlayer:', message);
```

### 3. 场景调试
```typescript
// 获取当前活动场景
const activeScenes = this.game.scene.getScenes(true);
console.log('Active scenes:', activeScenes);
```

## 常见模式示例

### 延迟执行
```typescript
this.time.delayedCall(1000, () => {
    // 1秒后执行
});
```

### 补间动画
```typescript
this.tweens.add({
    targets: sprite,
    x: 100,
    duration: 1000,
    ease: 'Power2'
});
```

### 事件监听
```typescript
this.input.on('pointerdown', (pointer) => {
    // 处理点击
});
```

## 总结

项目采用了清晰的分层架构：
1. **场景层**：管理游戏流程
2. **管理器层**：提供全局服务
3. **精灵层**：实现游戏实体
4. **UI 层**：处理用户界面

通过配置驱动、单例管理器、工厂模式等设计，实现了高度模块化和可扩展的代码结构。每个组件职责明确，便于维护和扩展。