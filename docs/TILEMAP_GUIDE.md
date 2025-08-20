# Tilemap 配置指南

## 概述

本项目使用 Phaser 3 的 Tilemap 系统结合 Tiled 地图编辑器来创建游戏关卡。系统支持：
- 自动加载 Tilemap 和相关资源
- 基于对象层创建游戏实体
- 支持图集（Atlas）和普通图块集（Tileset）
- 碰撞检测配置
- 动态对象属性传递

## 系统架构

### 核心流程

```
Tiled 编辑器 → JSON 导出 → Preloader 加载 → Game 场景解析 → 游戏对象创建
```

### 关键组件

1. **Preloader.ts** - 负责加载 Tilemap 和相关资源
2. **Game.ts** - 解析 Tilemap 并创建游戏对象
3. **精灵类** - Player、Enemy、Collectible 等实体类

## Tiled 地图编辑器配置

### 1. 创建地图

1. 新建地图时设置：
   - 地图大小（如 32x20 tiles）
   - 图块大小（如 32x32 像素）
   - 渲染顺序：右下（Right Down）

### 2. 添加图块集（Tileset）

#### 普通图块集
用于静态地形、背景等：
```json
{
  "name": "tileset_name",
  "image": "assets/tilemap/tiles/tileset.png",
  "tilewidth": 32,
  "tileheight": 32
}
```

#### 图集（Atlas）图块集
用于带动画的精灵：
1. 添加图块集时选择图片
2. 在第一个图块的自定义属性中添加：
   - 属性名：`atlas`
   - 类型：`bool`
   - 值：`true`

### 3. 创建图层

#### 图块层（Tile Layers）
用于绘制地形、平台等：
```
- background     # 背景层
- platforms      # 平台层（设置碰撞）
- decorations    # 装饰层
```

碰撞设置：
1. 选择需要碰撞的图块
2. 添加自定义属性：
   - 属性名：`collides`
   - 类型：`bool`
   - 值：`true`

#### 对象层（Object Layers）
用于放置游戏实体：
```
- players        # 玩家起始位置
- enemies        # 敌人
- collectibles   # 可收集物品
- hazards        # 危险物（尖刺等）
- goals          # 目标点
```

### 4. 创建游戏对象

在对象层中创建对象时设置：

#### Player 对象
```
名称: player_sprite_name  // 对应图集名称
类型: player
位置: (x, y)
大小: (width, height)     // 可选，用于缩放
```

#### Enemy 对象
```
名称: enemy_sprite_name
类型: enemy
自定义属性:
  - moveSpeed: 100        // 移动速度
  - moveRange: 200        // 移动范围
  - damage: 1             // 伤害值
  - health: 2             // 生命值
```

#### Collectible 对象
```
名称: item_sprite_name
类型: collectible
自定义属性:
  - score: 100            // 分数
  - type: coin            // 类型
  - mustCollect: true     // 是否必须收集
```

#### Hazard 对象
```
名称: hazard_sprite_name
类型: hazard
自定义属性:
  - damage: 1             // 伤害值
```

#### Goal 对象
```
名称: goal_sprite_name
类型: goal
```

## Preloader 加载机制

### 自动资源加载

Preloader.ts 中的加载流程：

```typescript
async preload() {
    // 1. 加载 Tilemap JSON
    this.load.tilemapTiledJSON('tilemap', 'assets/tilemap/scenes/tilemap.json');
    
    // 2. 加载原始 JSON 文本用于解析
    this.load.text('tilemap_json_raw', 'assets/tilemap/scenes/tilemap.json');
    
    // 3. 监听加载完成，解析并加载资源
    this.load.once('filecomplete-text-tilemap_json_raw', () => {
        this.loadAllAssets();
    });
}

private loadAllAssets() {
    // 解析 Tilemap JSON
    let tilemapJsonObj = JSON.parse(tilemapJsonRaw);
    let tilesets = tilemapJsonObj["tilesets"];
    
    tilesets.forEach((tileset: any) => {
        // 检查是否为图集
        let isAtlas = false;
        let tiles = tileset["tiles"];
        if (tiles && tiles[0]?.properties) {
            properties.forEach((property: any) => {
                if (property.name === "atlas" && property.value === true) {
                    isAtlas = true;
                }
            });
        }
        
        if (isAtlas) {
            // 加载图集和动画配置
            let atlasJsonUri = imageUri.replace(/(\.[^/.]+)$/, '.json');
            this.load.atlas(name, imageUri, atlasJsonUri);
            
            // 加载动画配置
            let animationConfigUri = imageUri.replace(/(\.[^/.]+)$/, '_animators.json');
            this.load.json(`${name}_animations`, animationConfigUri);
        } else {
            // 加载普通图片
            this.load.image(name, imageUri);
        }
    });
}
```

### 动画配置文件

对于图集，需要创建对应的动画配置文件 `{atlas_name}_animators.json`：

```json
{
    "name": "player",
    "type": "sprite",
    "animations": [
        {
            "name": "idle",
            "filename_prefix": "idle_",
            "frame_range": {
                "from": 0,
                "to": 3
            },
            "padding_size": 4
        },
        {
            "name": "walk",
            "filename_prefix": "walk_",
            "frame_range": {
                "from": 0,
                "to": 7
            }
        },
        {
            "name": "jump",
            "filename_prefix": "jump_",
            "frame_range": {
                "from": 0,
                "to": 5
            }
        }
    ]
}
```

## Game 场景对象创建

### 地图加载和图层创建

```typescript
create() {
    // 1. 创建 Tilemap
    this.map = this.make.tilemap({ key: 'tilemap' });
    
    // 2. 添加图块集
    this.tilesets = [];
    this.map.tilesets.forEach((tileset: Phaser.Tilemaps.Tileset) => {
        let addedTileset = this.map.addTilesetImage(tileset.name, tileset.name);
        if (addedTileset) {
            this.tilesets.push(addedTileset);
        }
    });
    
    // 3. 创建图块层
    this.layers = [];
    this.map.getTileLayerNames().forEach((tileLayerName: string) => {
        const layer = this.map.createLayer(tileLayerName, this.tilesets, 0, 0);
        if (layer) {
            this.layers.push(layer);
            // 设置碰撞（基于 collides 属性）
            layer.setCollisionByProperty({ collides: true });
        }
    });
    
    // 4. 创建对象
    this.createObjectsFromTilemap();
}
```

### 对象创建示例

```typescript
private createPlayerFromTilemap(playerObject: Phaser.Types.Tilemaps.TiledObject) {
    // Player 类会使用对象的属性
    this.player = new Player(this, playerObject);
    
    // 设置碰撞
    this.layers.forEach(layer => {
        this.physics.add.collider(this.player, layer);
    });
    
    // 设置相机跟随
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
}

private createEnemyFromTilemap(enemyObject: Phaser.Types.Tilemaps.TiledObject) {
    const enemy = new Enemy(this, enemyObject);
    this.enemies.add(enemy);
    
    // Enemy 类内部会读取自定义属性
    // moveSpeed, moveRange, damage, health 等
}
```

## 精灵类中使用 Tiled 对象

### Player.ts 示例

```typescript
export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: Phaser.Scene, tiledObject: Phaser.Types.Tilemaps.TiledObject) {
        // 从 Tiled 对象获取位置
        let x = tiledObject.x ?? 0;
        let y = tiledObject.y ?? 0;
        
        // 使用对象名称作为纹理键
        let key = tiledObject.name;
        super(scene, x, y, key);
        
        // 获取纹理的原始尺寸
        let texture = scene.textures.get(key);
        let firstFrame = (texture.frames as any)[texture.firstFrame];
        
        // 应用 Tiled 中设置的缩放
        let displayWidth = (tiledObject.width ?? firstFrame.width);
        let displayHeight = (tiledObject.height ?? firstFrame.height);
        
        let xScale = displayWidth / firstFrame.width;
        let yScale = displayHeight / firstFrame.height;
        this.setScale(xScale, yScale);
        
        // 设置物理碰撞体（原始尺寸的70%）
        this.setSize(firstFrame.width * 0.7, firstFrame.height * 0.7);
        this.setOffset(firstFrame.width * 0.1, firstFrame.height * 0.1);
    }
}
```

### Enemy.ts 示例

```typescript
export class Enemy extends Phaser.Physics.Arcade.Sprite {
    private moveSpeed: number;
    private moveRange: number;
    private damage: number;
    
    constructor(scene: Scene, enemyObject: Phaser.Types.Tilemaps.TiledObject) {
        super(scene, enemyObject.x ?? 0, enemyObject.y ?? 0, enemyObject.name);
        
        // 读取自定义属性
        const properties = enemyObject.properties as any;
        if (properties) {
            this.moveSpeed = properties.moveSpeed || 50;
            this.moveRange = properties.moveRange || 100;
            this.damage = properties.damage || 1;
            this.health = properties.health || 1;
        }
        
        // 设置巡逻行为
        this.startX = this.x;
        this.movingRight = true;
    }
    
    update(): void {
        // 使用属性控制行为
        if (this.movingRight) {
            this.setVelocityX(this.moveSpeed);
            if (this.x >= this.startX + this.moveRange) {
                this.movingRight = false;
            }
        } else {
            this.setVelocityX(-this.moveSpeed);
            if (this.x <= this.startX) {
                this.movingRight = true;
            }
        }
    }
}
```

## 文件组织结构

```
assets/
└── tilemap/
    ├── scenes/
    │   └── tilemap.json           # 主地图文件
    ├── tiles/
    │   ├── terrain.png            # 地形图块集
    │   └── decorations.png        # 装饰图块集
    └── sprites/
        ├── player.png              # 玩家图集
        ├── player.json             # 图集定义
        ├── player_animators.json   # 动画配置
        ├── enemy.png
        ├── enemy.json
        └── enemy_animators.json
```

## 最佳实践

### 1. 命名规范

- 图块集：`tileset_terrain`、`tileset_decorations`
- 图集：`player`、`enemy`、`items`
- 对象类型：`player`、`enemy`、`collectible`、`hazard`、`goal`
- 图层：`background`、`platforms`、`foreground`

### 2. 性能优化

1. **图层优化**
   - 静态背景使用单独图层
   - 碰撞图块放在专门的图层
   - 装饰元素使用不带碰撞的图层

2. **图块集优化**
   - 相似的图块放在同一图块集
   - 图块集大小控制在 2048x2048 以内
   - 使用 2 的幂次方尺寸

3. **对象数量控制**
   - 合理控制敌人和收集物数量
   - 使用对象池管理动态对象

### 3. 碰撞配置

```typescript
// 在 Game.ts 中设置碰撞组
private createOverleapEvents() {
    // 玩家 vs 危险物
    this.physics.add.overlap(
        this.player, 
        this.hazards, 
        this.handlePlayerHazardCollision, 
        undefined, 
        this
    );
    
    // 玩家 vs 收集物
    this.physics.add.overlap(
        this.player,
        this.collectibles,
        this.handlePlayerCollectibleCollision,
        undefined,
        this
    );
}
```

## 调试技巧

### 1. 显示碰撞边界

```typescript
// 在 Game.ts 的 create 方法中
this.physics.world.createDebugGraphic();

// 显示图块碰撞
const debugGraphics = this.add.graphics().setAlpha(0.75);
layer.renderDebug(debugGraphics, {
    tileColor: null,
    collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
    faceColor: new Phaser.Display.Color(40, 39, 37, 255)
});
```

### 2. 控制台输出

```typescript
// 输出地图信息
console.log('Map size:', this.map.width, 'x', this.map.height);
console.log('Tile size:', this.map.tileWidth, 'x', this.map.tileHeight);
console.log('Layers:', this.map.layers);
console.log('Objects:', this.map.objects);
```

### 3. 对象属性检查

```typescript
// 在创建对象时输出属性
console.log('Object properties:', tiledObject.properties);
console.log('Object position:', tiledObject.x, tiledObject.y);
console.log('Object size:', tiledObject.width, tiledObject.height);
```

## 常见问题

### Q: 图块/精灵不显示？

1. 检查文件路径是否正确
2. 确认图块集名称与代码中一致
3. 检查是否正确设置了 atlas 属性
4. 查看控制台是否有加载错误

### Q: 碰撞不工作？

1. 确认图块设置了 `collides: true` 属性
2. 检查物理引擎是否启用
3. 确认碰撞体大小设置正确
4. 使用调试显示查看碰撞边界

### Q: 动画不播放？

1. 检查动画配置文件是否存在
2. 确认帧名称与图集中一致
3. 检查 AnimationManager 是否正确初始化
4. 查看控制台的动画创建日志

## 扩展功能

### 1. 动态加载关卡

```typescript
loadLevel(levelName: string) {
    // 清理当前关卡
    this.clearCurrentLevel();
    
    // 加载新关卡
    this.load.tilemapTiledJSON(levelName, `assets/levels/${levelName}.json`);
    this.load.start();
    
    this.load.once('complete', () => {
        this.createLevel(levelName);
    });
}
```

### 2. 自定义对象类型

在 Game.ts 中扩展 `createObject` 方法：

```typescript
private createObject(obj: Phaser.Types.Tilemaps.TiledObject) {
    switch (obj.type) {
        case "moving_platform":
            this.createMovingPlatform(obj);
            break;
        case "checkpoint":
            this.createCheckpoint(obj);
            break;
        // ... 其他自定义类型
    }
}
```

### 3. 层级效果

```typescript
// 创建前景层覆盖玩家
const foregroundLayer = this.map.createLayer('foreground', this.tilesets);
foregroundLayer?.setDepth(1000); // 设置高深度值

// 玩家默认深度为 0
this.player.setDepth(0);
```

## 总结

Tilemap 系统通过 Tiled 编辑器和 Phaser 的集成，提供了强大的关卡设计能力：

1. **可视化编辑** - 使用 Tiled 直观设计关卡
2. **自动加载** - Preloader 自动处理资源加载
3. **灵活配置** - 通过自定义属性控制游戏逻辑
4. **类型安全** - TypeScript 提供类型检查
5. **易于扩展** - 支持添加新的对象类型和行为

通过正确配置和使用，可以快速创建丰富多样的游戏关卡。