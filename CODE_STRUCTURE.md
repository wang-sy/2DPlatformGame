# 代码结构文档

## ⚠️ 重要提示

**请优先通过修改 `tilemap.json` 来定制游戏，而非修改源代码！**

本游戏框架设计为**数据驱动**，几乎所有游戏内容都可以通过配置文件实现：
- ✅ 关卡设计 → 修改 tilemap.json
- ✅ 添加新素材 → 在 tilemap.json 中注册
- ✅ 调整难度 → 配置 properties
- ❌ 修改核心代码 → 仅在必要时进行

## 📁 源代码结构

```
src/
├── main.ts                 # 应用入口
└── game/
    ├── main.ts            # Phaser游戏配置
    ├── scenes/            # 游戏场景
    │   ├── Boot.ts        # 启动场景
    │   ├── Preloader.ts   # 资源加载场景 ⚡
    │   ├── MainMenu.ts    # 主菜单场景
    │   ├── Game.ts        # 核心游戏场景 ⚡
    │   ├── GameOver.ts    # 游戏结束场景
    │   └── Victory.ts     # 通关场景
    ├── sprites/           # 游戏精灵对象
    │   ├── Player.ts      # 玩家角色 ⚡
    │   ├── StaticHazard.ts # 静态危险物
    │   └── Goal.ts        # 目标点
    └── ui/               # UI组件
        └── HealthUI.ts    # 血量显示
```

⚡ = 核心文件，修改需谨慎

## 🎮 核心系统说明

### 1. 资源自动加载系统 (`Preloader.ts`)

**功能**: 自动解析 tilemap.json 并加载所有资源

```typescript
// 系统会自动识别并加载：
// - 普通图片 → this.load.image()
// - 精灵图集 → this.load.atlas() (需要atlas属性)
```

**扩展建议**：
- ✅ 在 tilemap 中添加新的 tileset
- ❌ 不要硬编码资源路径

### 2. 对象创建系统 (`Game.ts`)

**功能**: 根据 tilemap 中的 type 字段自动创建游戏对象

```typescript
private createObject(obj) {
    switch (obj.type) {
        case "player":    // 创建玩家
        case "hazard":    // 创建危险物
        case "goal":      // 创建目标
    }
}
```

**扩展新对象类型**：
```typescript
// 1. 在 switch 中添加新 case
case "moving_platform":
    this.createMovingPlatformFromTilemap(obj);
    return

// 2. 创建对应的类文件
// sprites/MovingPlatform.ts

// 3. 在 tilemap 中使用
{
    "type": "moving_platform",
    "properties": [...]
}
```

### 3. 碰撞检测系统 (`Game.ts`)

**功能**: 统一管理所有碰撞事件

```typescript
private createOverleapEvents() {
    // 玩家 vs 危险物
    this.physics.add.overlap(player, hazards, callback)
    // 玩家 vs 目标
    this.physics.add.overlap(player, goals, callback)
}
```

**添加新碰撞类型**：
```typescript
// 添加新的碰撞组
if (this.player && this.newGroup) {
    this.physics.add.overlap(
        this.player,
        this.newGroup,
        this.handleNewCollision,
        undefined,
        this
    );
}
```

## 🔧 通用扩展模式

### 添加新的游戏元素

**推荐流程**：

1. **创建精灵类** (`sprites/NewElement.ts`)
```typescript
export class NewElement extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Scene, elementObject: Phaser.Types.Tilemaps.TiledObject) {
        // 从 tilemap 读取配置
        const properties = elementObject.properties as any;
        // 初始化逻辑
    }
}
```

2. **在 Game.ts 中注册**
```typescript
case "new_element":
    this.createNewElementFromTilemap(obj);
    return
```

3. **在 tilemap.json 中使用**
```json
{
    "type": "new_element",
    "name": "element_name",
    "properties": [...]
}
```

### 修改现有行为

**优先级**：
1. 🥇 通过 properties 配置
2. 🥈 扩展类而非修改
3. 🥉 最后才考虑修改核心代码

**示例：调整危险物伤害**
```json
// ✅ 好的做法：在 tilemap 中配置
"properties": [
    {"name": "damage", "value": 2}
]

// ❌ 避免：硬编码在 StaticHazard.ts 中
this.damage = 2; // 不要这样做
```

## 📝 各文件职责

### Scenes（场景）

| 文件 | 职责 | 是否可修改 |
|-----|------|-----------|
| Boot.ts | 加载初始资源 | ⚠️ 谨慎 |
| Preloader.ts | 自动加载 tilemap 资源 | ⚠️ 谨慎 |
| MainMenu.ts | 主菜单界面 | ✅ 可以 |
| Game.ts | 核心游戏逻辑 | ⚠️ 仅扩展 |
| GameOver.ts | 失败界面 | ✅ 可以 |
| Victory.ts | 胜利界面 | ✅ 可以 |

### Sprites（精灵）

| 文件 | 职责 | 是否可修改 |
|-----|------|-----------|
| Player.ts | 玩家控制、动画、技能 | ⚠️ 谨慎 |
| StaticHazard.ts | 静态危险物基类 | 🔄 可扩展 |
| Goal.ts | 通关目标逻辑 | 🔄 可扩展 |

### UI（界面）

| 文件 | 职责 | 是否可修改 |
|-----|------|-----------|
| HealthUI.ts | 血量显示 | ✅ 可以 |

## 🎯 最佳实践

### DO ✅

1. **数据驱动设计**
   - 将配置放在 tilemap.json
   - 使用 properties 传递参数
   - 通过 type 字段区分行为

2. **通用化设计**
   - 创建基类供扩展
   - 使用接口定义规范
   - 保持代码可复用

3. **扩展而非修改**
   ```typescript
   // 好的做法：扩展基类
   class FireHazard extends StaticHazard {
       // 添加火焰特效
   }
   ```

### DON'T ❌

1. **硬编码数值**
   ```typescript
   // 避免
   const damage = 10; // 应从 tilemap 读取
   ```

2. **直接修改核心循环**
   ```typescript
   // 避免修改 Game.update()
   // 使用事件系统代替
   ```

3. **破坏数据流**
   ```typescript
   // 避免
   this.player.health = 999; // 应通过方法调用
   ```

## 🚀 快速开始新功能

### 示例：添加移动平台

1. **创建类文件**
```typescript
// sprites/MovingPlatform.ts
export class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
    private speed: number;
    private distance: number;
    
    constructor(scene, platformObject) {
        super(scene, platformObject.x, platformObject.y, 'platform');
        const props = platformObject.properties;
        this.speed = props?.speed || 100;
        this.distance = props?.distance || 200;
    }
    
    update() {
        // 移动逻辑
    }
}
```

2. **注册到 Game.ts**
```typescript
case "moving_platform":
    const platform = new MovingPlatform(this, obj);
    this.platforms.add(platform);
    return
```

3. **在 tilemap 中使用**
```json
{
    "type": "moving_platform",
    "name": "platform",
    "properties": [
        {"name": "speed", "value": 100},
        {"name": "distance", "value": 200}
    ]
}
```

## 📚 扩展指南

### 添加新场景
1. 创建 `scenes/NewScene.ts`
2. 在 `game/main.ts` 中注册
3. 使用 `this.scene.start('NewScene')` 切换

### 添加新UI元素
1. 创建 `ui/NewUI.ts`
2. 在需要的场景中实例化
3. 使用 `setScrollFactor(0)` 固定位置

### 添加新的物理组
1. 在 Game.ts 中创建组
2. 添加碰撞检测
3. 在 tilemap 中配置对象

## ⚡ 性能建议

1. **使用对象池**：频繁创建/销毁的对象
2. **使用 StaticGroup**：不移动的对象
3. **限制更新频率**：非关键逻辑可降频
4. **优化碰撞检测**：使用空间分区

## 🔍 调试技巧

1. **开启物理调试**
```typescript
// game/main.ts
physics: {
    arcade: {
        debug: true  // 显示碰撞边界
    }
}
```

2. **查看 tilemap 数据**
```typescript
console.log(this.map.layers);
console.log(this.map.objects);
```

3. **监控性能**
```typescript
this.game.config.fps.target = 60;
this.game.config.fps.min = 30;
```

---

## 📌 总结

**核心原则**：
1. 📄 **配置优先** - 能用 tilemap 解决的不改代码
2. 🔄 **扩展优先** - 能扩展的不修改原文件
3. 🎯 **通用优先** - 设计通用方案而非特例

**记住**：这个框架的强大之处在于其**数据驱动**的设计。充分利用 tilemap.json 的配置能力，你可以创建丰富多样的游戏内容，而无需触碰一行代码！

如需深度定制，请遵循上述扩展模式，保持代码的整洁性和可维护性。